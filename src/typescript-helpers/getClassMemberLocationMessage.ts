import * as ts from 'typescript';

export function getClassMemberLocationMessage(node: ts.MethodDeclaration | ts.PropertyDeclaration | ts.ConstructorDeclaration): string {
    const path = node.getSourceFile().fileName;
    const methodName = node.name?.getText();
    return `, Method Name = ${methodName}, Path = ${path}`;
}
