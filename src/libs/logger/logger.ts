// import { injectable } from 'inversify';
import TYPES from '../../constant/types';
import { ProvideSingleton, inject } from '../ioc/ioc';
import * as fs from 'fs';
import * as path from 'path';
import * as log4js from 'log4js';
// import { config } from '../../constant/decorators';
import { ILoggerService } from './interface';
import IConfigService from '../config/interface';

@ProvideSingleton(TYPES.LoggerService)
export default class LoggerService implements ILoggerService {
    private _config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfigService
    ) {
        this._config = configService.get('LOGGER');

        this._setupLogger();
    }

    private _setupLogger() {
        const pathToFile = path.join(__dirname, '../../../', this._config.path);

        if (!fs.existsSync(pathToFile)) {
            fs.mkdirSync(pathToFile);
        }

        const appenders: any = {
            file: {
                type: 'file',
                filename: path.join(pathToFile, this._config.fileName),
                timezoneOffset: 0
            }
        };
        const categories = {
            default: {
                appenders: ['file'],
                level: 'error'
            }
        };

        if (process.env.NODE_ENV !== 'production') {
            appenders.console = { type: 'console' };
            categories.default.appenders.push('console');
            categories.default.level = 'info';
        }

        log4js.configure({ categories, appenders });
    }

    getLogger(serviceName) {
        return log4js.getLogger(serviceName);
    }

}
