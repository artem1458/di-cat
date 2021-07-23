import { ContextRepository, IContextDescriptor } from '../context/ContextRepository';
import ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import { BeanRepository } from './BeanRepository';

//Only for non-global contexts
export const checkIsAllBeansRegisteredInContextAndFillBeanRequierness = (contextDescriptor: IContextDescriptor) => {
    const extendsHeritageClause = contextDescriptor.node.heritageClauses
        ?.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);

    if (!extendsHeritageClause) {
        return;
    }

    const typeArgs = extendsHeritageClause.types[0].typeArguments ?? null;

    if (typeArgs === null) {
        CompilationContext.reportError({
            node: extendsHeritageClause,
            message: 'You should pass TBeans interface reference to the context inheritance',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }
    const type = typeArgs[0];

    if (!type || !ts.isTypeReferenceNode(type)) {
        CompilationContext.reportError({
            node: extendsHeritageClause,
            message: 'TBeans should be a plain interface reference',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const nodeDescriptor = getNodeSourceDescriptorDeep(
        contextDescriptor.node.getSourceFile(),
        type.typeName.getText(),
    );

    if (nodeDescriptor === null || nodeDescriptor.node === null) {
        CompilationContext.reportError({
            node: type.typeName,
            message: 'Can\'t qualify TBeans declaration',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    if (!ts.isInterfaceDeclaration(nodeDescriptor.node)) {
        CompilationContext.reportError({
            node: type.typeName,
            message: 'TBeans should be a plain interface declaration (without extends keyword)',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    if (nodeDescriptor.node.heritageClauses !== undefined) {
        CompilationContext.reportError({
            node: type.typeName,
            message: 'TBeans should be a plain interface declaration (without extends keyword)',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    if (nodeDescriptor.node.members.some(it => !ts.isPropertySignature(it))) {
        CompilationContext.reportError({
            node: type.typeName,
            message: 'TBeans should be a plain interface declaration without indexed signatures',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    ContextRepository.registerTBeanType(contextDescriptor, nodeDescriptor);

    const requiredBeanProperties: ts.PropertySignature[] = nodeDescriptor.node.members.map((it) => it as ts.PropertySignature);

    const contextBeans = BeanRepository
        .contextIdToBeanDescriptorsMap.get(contextDescriptor.id) ?? [];

    const missingBeans: ts.PropertySignature[] = [];

    requiredBeanProperties.forEach(requiredBeanProperty => {
        const requiredBeanName = removeQuotesFromString(requiredBeanProperty.name.getText());

        const requiredBeanDescriptor = contextBeans.find(it => it.classMemberName === requiredBeanName);

        if (requiredBeanDescriptor) {
            requiredBeanDescriptor.isPublic = true;
        } else {
            missingBeans.push(requiredBeanProperty);
        }
    });

    if (missingBeans.length > 0) {
        const missingBeansText = missingBeans.map(it => removeQuotesFromString(it.name.getText())).join(', ');
        CompilationContext.reportErrorWithMultipleNodes({
            nodes: [type, ...missingBeans],
            message: `Some beans are not registered in Context "${contextDescriptor.name}": [ ${missingBeansText} ]`,
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }
};
