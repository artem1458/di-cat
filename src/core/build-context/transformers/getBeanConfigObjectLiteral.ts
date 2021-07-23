import ts, { factory } from 'typescript';
import { IContextDescriptor } from '../../context/ContextRepository';
import { BeanRepository } from '../../bean/BeanRepository';

export function getBeanConfigObjectLiteral(contextDescriptor: IContextDescriptor): ts.ObjectLiteralExpression {
    const contextBeans = BeanRepository.contextIdToBeanDescriptorsMap.get(contextDescriptor.id) ?? [];
    const objectLiteralMembers: ts.PropertyAssignment[] = contextBeans.map(bean => (
        factory.createPropertyAssignment(
            factory.createComputedPropertyName(factory.createStringLiteral(bean.classMemberName)),
            factory.createObjectLiteralExpression(
                [
                    factory.createPropertyAssignment(
                        factory.createIdentifier('scope'),
                        factory.createStringLiteral(bean.scope)
                    ),
                    bean.isPublic && factory.createPropertyAssignment(
                        factory.createIdentifier('isPublic'),
                        factory.createTrue(),
                    ),
                ].filter((it): it is ts.PropertyAssignment => Boolean(it)),
                false
            )
        )
    ));

    return factory.createObjectLiteralExpression(
        objectLiteralMembers,
        true
    );
}
