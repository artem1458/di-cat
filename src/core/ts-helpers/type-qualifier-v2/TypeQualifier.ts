import ts from 'typescript';

interface IQualifiedType {
    types: Set<string>;
}

export function TypeQualifier(node: ts.Node, deepness = 0): IQualifiedType | null {
    return null;
}
