export interface IFullBeanConfig {
    scope?: 'prototype' | 'singleton';
    isPublic?: boolean;
}

export interface IInternalCatContext {
    config: any;
    getBean<T>(beanName: string): T;
    getBeans(): Record<string, any>;
}

export type TInternalCatContext = {
    new(
        contextName: string,
        beanConfigurationRecord: Record<string, IFullBeanConfig>,
    ): IInternalCatContext
};
