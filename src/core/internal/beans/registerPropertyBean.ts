import * as ts from 'typescript';
import { isEqual } from 'lodash';
import { IContextDescriptor } from '../context/ContextRepository';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { getPropertyBeanInfo } from '../ts-helpers/bean-info/getPropertyBeanInfo';
import { BeansRepository } from './BeansRepository';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { END_PATH_TOKEN, START_PATH_TOKEN } from '../ts-helpers/type-qualifier/parseTokens';

export function registerPropertyBean(contextDescriptor: IContextDescriptor, classElement: ClassPropertyDeclarationWithInitializer): void {
    const typeInfo = getBeanTypeInfoFromClassProperty(classElement);
    const beanInfo = getPropertyBeanInfo(classElement);

    if (typeInfo === null) {
        return;
    }

    BeansRepository.registerMethodBean({
        classMemberName: classElement.name.getText(),
        qualifierName: beanInfo.qualifier,
        contextName: contextDescriptor.name,
        typeId: typeInfo.typeId,
        originalTypeName: typeInfo.originalTypeName,
        scope: beanInfo.scope,
        node: classElement,
    });
}

function getBeanTypeInfoFromClassProperty(classElement: ClassPropertyDeclarationWithInitializer): IQualifiedType | null {
    const propertyType = classElement.type ?? null;
    const beanGenericType = (classElement.initializer.typeArguments ?? [])[0] ?? null;

    if (propertyType !== null && beanGenericType !== null) {
        //TODO add caching of type nodes in typeQualifier
        const resolvedPropertyType = typeQualifier(propertyType);
        const resolvedBeanGenericType = typeQualifier(beanGenericType);

        if (isEqual(resolvedPropertyType, resolvedBeanGenericType)) {
            return resolvedBeanGenericType;
        }
    }

    if (propertyType === null && beanGenericType !== null) {
        return typeQualifier(beanGenericType);
    }

    if (beanGenericType === null && propertyType !== null) {
        return typeQualifier(propertyType);
    }

    const firstArgument = classElement.initializer.arguments[0];

    if (!ts.isIdentifier(firstArgument)) {
        CompilationContext.reportError({
            node: firstArgument,
            message: 'First argument in Property-Bean should be a reference',
        });

        return null;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(
        firstArgument.getSourceFile(),
        firstArgument.getText()
    );

    if (nodeSourceDescriptor === null) {
        CompilationContext.reportError({
            node: firstArgument,
            message: 'Can\'t qualify type of Bean, please specify type explicitly'
        });

        return null;
    }

    return {
        originalTypeName: nodeSourceDescriptor.name,
        typeId: `${START_PATH_TOKEN}${nodeSourceDescriptor.path}${END_PATH_TOKEN}${nodeSourceDescriptor.name}`
    };
}