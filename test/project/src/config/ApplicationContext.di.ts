import { CatContext, Bean } from 'dependency-injection-cat';
import { IBeans } from '../IBeans';
import { IUseCase } from '../lib/use-case/IUseCase';
import { UseCase } from '../lib/use-case/UseCase';
import { ILogger } from '../lib/logger/ILogger';

class ApplicationContext extends CatContext<IBeans> {

    @Bean
    useCase(
        logger: ILogger
    ): IUseCase {
        console.log('getting useCase');
        return new UseCase(logger);
    }
    useCase3: IUseCase = Bean(UseCase);
}
