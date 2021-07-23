import { ConfigLoaderSuccessResult } from 'tsconfig-paths/lib/config-loader';
import { loadConfig } from 'tsconfig-paths';

export class TsConfigProvider {
    private static config: ConfigLoaderSuccessResult | null = null;

    static get tsConfig(): ConfigLoaderSuccessResult {
        if (this.config === null) {
            throw new Error('Can not load tsconfig file');
        }

        return this.config;
    }

    static init() {
        const configLoaderResult = loadConfig();

        if (configLoaderResult.resultType === 'failed') {
            throw new Error('Can not load tsconfig file');
        }

        this.config = configLoaderResult;
    }
}
