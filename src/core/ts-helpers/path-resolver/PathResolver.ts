import upath from 'upath';
import { createMatchPath, loadConfig, MatchPath } from 'tsconfig-paths';
import { isPathRelative } from '../../utils/isPathRelative';
import { extensionsToResolve } from './constants';

export class PathResolver {
    private static resolver: MatchPath;

    static init(): void {
        const config = loadConfig();

        if (config.resultType === 'failed') {
            throw new Error('Can not load tsconfig file');
        }

        PathResolver.resolver = createMatchPath(config.absoluteBaseUrl, config.paths);
    }

    static resolve(sourceFilePath: string, targetPath: string): string {
        const normalizedSourceFilePath = upath.toUnix(sourceFilePath);
        const normalizedTargetPath = upath.toUnix(targetPath);

        if (isPathRelative(normalizedTargetPath)) {
            const newSourceFilePath = upath.dirname(normalizedSourceFilePath);
            const resolved = upath.resolve(newSourceFilePath, normalizedTargetPath);

            return upath.normalize(resolved);
        }

        const resolved = PathResolver.resolver(
            normalizedTargetPath,
            undefined,
            undefined,
            extensionsToResolve,
        ) ?? normalizedTargetPath;

        return upath.normalize(resolved);
    }
}
