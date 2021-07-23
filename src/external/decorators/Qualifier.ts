export const Qualifier = <T extends string>(beanName: T extends '' ? never : T): ParameterDecorator => () => {};
