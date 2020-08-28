import { Bean, Singleton, Qualifier } from 'ts-pring';
import { IRequester } from '../IRequester';
import { Requester } from '../Requester';
import { ILogger } from '../ILogger';

export class AnotherConfigDiconfig {
    @Bean
    @Singleton
    requester(
        @Qualifier('1234') logger: ILogger,
    ): IRequester {
        return new Requester(logger);
    }
}
