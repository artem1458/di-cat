import { NoContextByKey } from '../exceptions/runtime/NoContextByKey';
import { IFullBeanConfig, TInternalCatContext } from './IInternalCatContext';

interface IContextProps {
    key: any;
    config: any;
}

type TBeanName = string;

export class ContextPool {
    private DEFAULT_CONTEXT_KEY = {};
    private pool = new Map();

    constructor(
        private contextName: string,
        private beanConfigurationRecord: Record<TBeanName, IFullBeanConfig>,
        private context: TInternalCatContext,
    ) {}

    initContext({
        key = this.DEFAULT_CONTEXT_KEY,
        config,
    }: IContextProps): any {
        const newContext = new this.context(this.contextName, this.beanConfigurationRecord);
        newContext.config = config;

        this.pool.set(key, newContext);

        return newContext;
    }

    getContext({ key = this.DEFAULT_CONTEXT_KEY }: IContextProps): any {
        const context = this.pool.get(key);

        if (context === undefined) {
            throw new NoContextByKey(this.contextName, key);
        }

        return context;
    }

    getOrInitContext({
        key = this.DEFAULT_CONTEXT_KEY,
        config,
    }: IContextProps): any {
        const oldContext = this.pool.get(key);

        if (oldContext) {
            return oldContext;
        }

        const newContext = new this.context(this.contextName, this.beanConfigurationRecord);
        newContext.config = config;

        this.pool.set(key, newContext);

        return newContext;
    }

    clearContext({ key = this.DEFAULT_CONTEXT_KEY }: IContextProps): void {
        if (!this.pool.has(key)) {
            if (this.isDefaultKey(key)) {
                console.warn(`Trying to clear not initialized context, contextName: ${this.contextName}`);
            } else {
                console.warn(`Trying to clear not initialized context, contextName: ${this.contextName}, key: ${key}`);
            }
        }

        this.pool.delete(key);
    }

    private isDefaultKey(key: any): boolean {
        return key === this.DEFAULT_CONTEXT_KEY;
    }
}
