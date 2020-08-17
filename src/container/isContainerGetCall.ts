import * as ts from 'typescript';
import { getNodeSourceDescriptorFromImports, ImportType } from '../typescript-helpers/node-source-descriptor';
import { isCallExpressionFromFile } from '../typescript-helpers/isCallExpressionFromFile';
import { libraryName } from '../constants/libraryName';

export function isContainerGetCall(typeChecker: ts.TypeChecker, node: ts.CallExpression): boolean {
    if (isCallExpressionFromFile(typeChecker, node, node.getSourceFile().fileName)) {
        return false;
    }

    const fullExpression = node.expression.getText().split('.');
    const fromImports = getNodeSourceDescriptorFromImports(node.getSourceFile(), fullExpression[0]);

    if (fromImports === undefined || libraryName !== fromImports.path) {
        return false;
    }

    switch (fromImports.importType) {
        case ImportType.Named:
            fullExpression[0] = fromImports.name;
            break;

        case ImportType.Namespace:
            fullExpression.splice(0, 1);
            break;
        case ImportType.Default:
        default:
            return false;

    }

    return fullExpression.join('.') === 'container.get';
}