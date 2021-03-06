import ts, { factory } from 'typescript';
import upath from 'upath';
import { IContainerAccessNode } from './isContainerAccess';
import { CompilationContext } from '../../../compilation-context/CompilationContext';
import { getContextNameFromContainerCall } from './getContextNameFromContainerCall';
import { CONTEXT_POOL_POSTFIX } from '../../build-context/transformers/addContextPool';
import { validContainerKeys } from './validContainerKeys';
import { GLOBAL_CONTEXT_NAME } from '../../context/constants';
import { ContextNamesRepository } from '../../context/ContextNamesRepository';
import { registerAllContextNames } from '../../context/registerContextNames';
import { removeExtensionFromPath } from '../../utils/removeExtensionFromPath';

export const replaceContainerCall = (node: IContainerAccessNode, factoryImportsToAdd: ts.ImportDeclaration[]): ts.Node => {
    CompilationContext.clearErrorsByFilePath(node.getSourceFile().fileName);

    if (!validContainerKeys.includes(node.expression.name.getText())) {
        CompilationContext.reportError({
            node: node,
            message: `Container has only following methods: ${validContainerKeys.join(', ')}`,
            filePath: node.getSourceFile().fileName,
        });
        return node;
    }

    const contextName = getContextNameFromContainerCall(node);

    if (contextName === null) {
        return node;
    }

    if (contextName === GLOBAL_CONTEXT_NAME) {
        CompilationContext.reportError({
            message: 'You can\'t access Global Context',
            node: node,
            filePath: node.getSourceFile().fileName,
        });
        return node;
    }

    let contextPath: string | null = ContextNamesRepository.nameToPath.get(contextName) ?? null;

    if (contextPath === null) {
        registerAllContextNames();

        contextPath = ContextNamesRepository.nameToPath.get(contextName) ?? null;

        if (contextPath === null) {
            CompilationContext.reportError({
                node,
                message: `Context with name "${contextName}" not found`,
                filePath: node.getSourceFile().fileName,
            });
            return node;
        }
    }

    // TODO check interfaces
    // checkBeansInterface(node, contextDescriptor);

    const contextPathWithoutExt = removeExtensionFromPath(upath.normalize(contextPath));

    const importPath = `./${upath.relative(
        upath.dirname(node.getSourceFile().fileName),
        contextPathWithoutExt,
    )}`;
    const importNamespaceName = `${contextName}${CONTEXT_POOL_POSTFIX}`;
    const importDeclaration = factory.createImportDeclaration(
        undefined,
        undefined,
        factory.createImportClause(
            false,
            undefined,
            factory.createNamespaceImport(
                factory.createIdentifier(importNamespaceName),
            )
        ),
        factory.createStringLiteral(importPath)
    );
    factoryImportsToAdd.push(importDeclaration);

    return factory.updateCallExpression(
        node,
        factory.createPropertyAccessExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier(importNamespaceName),
                factory.createIdentifier(importNamespaceName)
            ),
            node.expression.name,
        ),
        node.typeArguments,
        node.arguments
    );
};
