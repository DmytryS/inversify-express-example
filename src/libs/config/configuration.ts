import * as nconf from 'nconf';
import TYPES from '../../constant/types';
import { ProvideSingleton } from '../ioc/ioc';
import IConfigService from './interface';

@ProvideSingleton(TYPES.ConfigServie)
export default class ConfigService implements IConfigService {
    private config;

    constructor() {
        nconf.file(require.resolve(`../../../config/${process.env.NODE_ENV}.json`));
        nconf.env();
        nconf.defaults({
            API_PORT: 8080
        });
        this.config = nconf;
    }

    public setConfig(configuration) {
        nconf.overrides(configuration);
    }

    public get(key?: string): any {
        return this.config.get(key);
    }

    public has(key: string): boolean {
        return !!this.config.get(key);
    }
}
