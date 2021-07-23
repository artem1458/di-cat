type TClassConstructor<T> = new (...args: any[]) => T;
type TBeanScope = 'prototype' | 'singleton';

interface IBeanConfig {
    scope?: TBeanScope;
}

type ConfigurableMethodBean = (beanConfig: IBeanConfig) => PropertyDecorator;
type PropertyBean = <T>(clazz: TClassConstructor<T>, beanConfig?: IBeanConfig) => T;

type TBean = PropertyDecorator & ConfigurableMethodBean & PropertyBean;
export const Bean: TBean = () => {
    throw new Error('Trying to use @Bean without configured di-container, or not in context-class');
};
