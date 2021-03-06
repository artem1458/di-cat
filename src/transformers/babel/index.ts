import ts from 'typescript';
import { IDiConfig, initDiConfig } from '../../external/config';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import { libraryName } from '../../constants/libraryName';
import { ProgramRepository } from '../../core/program/ProgramRepository';
import { initContexts } from '../../core/initContexts';
import { uniqId } from '../../core/utils/uniqId';

const IGNORE_TRANSFORM_PROPERTY_KEY = uniqId();

export default function(api: any, options?: IDiConfig) {
    initDiConfig(options);
    initContexts();
    const transformerFactory = getTransformerFactory();
    const printer = ts.createPrinter();

    return {
        visitor: {
            Program(path: any, meta: any) {
                if (path.node[IGNORE_TRANSFORM_PROPERTY_KEY]) {
                    return;
                }

                const imports: any[] = path.node.body.filter((it: any) => it.type === 'ImportDeclaration');
                const hasLibraryImport = imports.some(it => {
                    const moduleSpecifier = it?.source?.value;
                    if (!moduleSpecifier) {
                        return false;
                    }
                    return moduleSpecifier === libraryName;
                });

                if (!hasLibraryImport) {
                    return;
                }

                const fileText = meta.file.code;
                const filePath = meta.filename;
                const tsSourceFile = ts.createSourceFile(
                    filePath,
                    fileText,
                    ProgramRepository.program.getCompilerOptions().target ?? ts.ScriptTarget.ESNext,
                    true,
                );
                const result = ts.transform<ts.SourceFile>(
                    tsSourceFile,
                    [transformerFactory],
                );
                const resultText = printer.printFile(result.transformed[0]);
                const parsed = api.parse(resultText, meta.file.opts).program;
                parsed[IGNORE_TRANSFORM_PROPERTY_KEY] = true;

                path.replaceWith(parsed);
            }
        }
    };
}
