import { NodeArray, TypeNode, TypeReferenceNode, } from 'typescript';

export interface ITypeReferenceNode extends TypeReferenceNode {
    typeArguments: NodeArray<TypeNode>;
}

export interface IQualifiedType {
    originalTypeName: string;
    typeId: string;
}
