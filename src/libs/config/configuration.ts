import { ProvideSingleton } from '../ioc/ioc';
import * as nconf from 'nconf';
import IConfigService from './interface';
import TYPES from '../../constant/types';

@ProvideSingleton(TYPES.ConfigServie)
export default class ConfigService implements IConfigService {
    private _nconf;

    constructor() {
        nconf.file(require.resolve(`../../../config/${process.env.NODE_ENV}.json`));
        nconf.env();
        nconf.defaults({
            API_PORT: 8080
        });
        this._nconf = nconf;
    }

    get(key?: string): any {
        return this._nconf.get(key);
    }

    has(key: string): boolean {
        return !!this._nconf.get(key);
    }
}
