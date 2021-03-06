import ts, { factory } from 'typescript';
import { uniqBy } from 'lodash';
import { isContainerAccess } from '../ts-helpers/container/isContainerAccess';
import { replaceContainerCall } from '../ts-helpers/container/replaceContainerCall';
import { removeQuotesFromString } from '../utils/removeQuotesFromString';
import minimatch from 'minimatch';
import { diConfig } from '../../external/config';
import { registerAndTransformContext } from '../build-context/registerAndTransformContext';

export const transformTest: Record<string, number> = {};

export const getTransformerFactory = (): ts.TransformerFactory<ts.SourceFile> => context => {
    return sourceFile => {
        if (minimatch(sourceFile.fileName, diConfig.diConfigPattern!)) {
            // console.time(`Context transformed: ${sourceFile.fileName}`);
            const transformedContext = registerAndTransformContext(context, sourceFile);
            // transformTest[sourceFile.fileName] = transformTest[sourceFile.fileName] ? transformTest[sourceFile.fileName] + 1 : 1;
            // console.log(transformTest);
            // console.timeEnd(`Context transformed: ${sourceFile.fileName}`);

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
