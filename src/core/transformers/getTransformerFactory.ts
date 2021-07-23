import ts, { factory } from 'typescript';
import { uniqBy } from 'lodash';
import { isContainerAccess } from '../ts-helpers/container/isContainerAccess';
import { replaceContainerCall } from '../ts-helpers/container/replaceContainerCall';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import minimatch from 'minimatch';
import { diConfig } from '../../external/config';
import { registerAndTransformContext } from '../build-context/registerAndTransformContext';

interface SourceFile extends ts.SourceFile {
    bindDiagnostics: ts.Diagnostic[];
}

export const getTransformerFactory = (): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        if (minimatch(sourceFile.fileName, diConfig.diConfigPattern!)) {
            const transformedContext = registerAndTransformContext(context, sourceFile);

            return transformedContext;
        }

        const factoryImportsToAdd: ts.ImportDeclaration[] = [];

        const visitor: ts.Visitor = (node => {
            if (isContainerAccess(node)) {
                return replaceContainerCall(node, factoryImportsToAdd);
            }

            return ts.visitEachChild(node, visitor, context);
        });

        const newSourceFile = ts.visitNode(sourceFile, visitor);

        const uniqFactoryImportsToAdd = uniqBy(factoryImportsToAdd, it => {
            if (ts.isStringLiteral(it.moduleSpecifier)) {
                return removeQuotesFromString(it.moduleSpecifier.text);
            }
        });

        return factory.updateSourceFile(
            sourceFile,
            [
                ...uniqFactoryImportsToAdd,
                ...newSourceFile.statements,
            ],
            sourceFile.isDeclarationFile,
            sourceFile.referencedFiles,
            undefined,
            sourceFile.hasNoDefaultLib,
            undefined,
        );
    };
};
