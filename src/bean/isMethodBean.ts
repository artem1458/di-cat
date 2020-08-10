import * as ts from 'typescript'
import { getNodeSourceDescriptorFromImports } from '../node-source-descriptor';

export function isMethodBean(node: ts.Node): node is ts.MethodDeclaration {
    return ts.isMethodDeclaration(node);
    // return ts.isMethodDeclaration(node) &&  !!node.decorators?.some(isBeanDecorator);
}

export function isBeanDecorator(decoratorNode: ts.Decorator): boolean {
    let nameToFind: string | undefined = undefined;
    ts.forEachChild(decoratorNode, node => {
        if (nameToFind === undefined && ts.isIdentifier(node)) {
            nameToFind = node.escapedText.toString();
        }
    });

    if (nameToFind === undefined) {
        return false;
    }

    const sourceDescriptor = getNodeSourceDescriptorFromImports(decoratorNode.getSourceFile(), nameToFind);

    if (sourceDescriptor === undefined) {
        return false;
    }

    return sourceDescriptor.name === 'Bean' && sourceDescriptor.path === 'ts-pring';
}
