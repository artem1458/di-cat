import { container } from 'dependency-injection-cat';
import { IBeans } from '../src/config/IBeans';

describe('test', () => {
    it('container', () => {
        console.log(container.initContext<IBeans>({
            name: 'MainContext'
        }));
    });
});
