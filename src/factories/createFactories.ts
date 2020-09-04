import fs from 'fs';
import * as ts from 'typescript';
import { DiConfigRepository } from '../di-config-repository';
import { ProgramRepository } from '../program/ProgramRepository';
import { ConfigIdRepository } from './ConfigIdRepository';
import { getFactoryPath } from './utils/getFactoryPath';
import { absolutizeImports } from '../internal-transformers/absolutizeImports';
import { makeFactorySingleton } from '../internal-transformers/makeFactorySingleton';
import { getImportsForFactory } from './utils/getImportsForFactory';
import { addImportsInFactory } from '../internal-transformers/addImportsInFactory';
import { replaceParametersWithConstants } from '../internal-transformers/replaceParametersWithConstants';
import { setMethodBeanScopesAndRemoveBeanDecorators } from '../internal-transformers/setMethodBeanScopesAndRemoveBeanDecorators';
import { ICreateFactoriesContext } from './ICreateFactoriesContext';
import { replaceClassPropertyBean } from '../internal-transformers/replaceClassPropertyBean';

export function createFactories(): void {
    const program = ProgramRepository.program;
    const printer = ts.createPrinter();

    DiConfigRepository.data.forEach(filePath => {
        const context: ICreateFactoriesContext = {
            hasSingleton: false,
        };

        const path = filePath as ts.Path;
        const sourceFile = program.getSourceFileByPath(path);

        if (sourceFile === undefined) {
            throw new Error(`SourceFile not found, path ${path}`);
        }

        const factoryId = ConfigIdRepository.getFactoryId(filePath);
        const imports = getImportsForFactory(factoryId);

        const newSourceFile = ts.transform(sourceFile, [
            absolutizeImports(filePath),
            makeFactorySingleton,
            replaceParametersWithConstants(factoryId),
            setMethodBeanScopesAndRemoveBeanDecorators(context),
            addImportsInFactory(imports, context),
            replaceClassPropertyBean(factoryId),
        ]);

        fs.writeFile(getFactoryPath(factoryId), printer.printFile(newSourceFile.transformed[0]), (err) => {
            if (err !== null) {
                throw err;
            }
        });
    });
}
