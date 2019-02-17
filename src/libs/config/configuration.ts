import 'reflect-metadata';
import { injectable } from 'inversify';
import * as nconf from 'nconf';
import IConfig from './interface';

@injectable()
export default class Nconf implements IConfig {
    private _nconf;

    constructor() {
        nconf.file(require.resolve(`../../../config/${process.env.NODE_ENV}.json`));
        nconf.env();
        nconf.defaults({
            API_PORT: 8080
        });
        this._nconf = nconf;
    }

    get(key: string): string {
        return this._nconf.get(key);
    }

    has(key: string): boolean {
        return !!this._nconf.get(key);
    }
}
