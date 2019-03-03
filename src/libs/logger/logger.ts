import * as fs from 'fs';
import * as log4js from 'log4js';
import * as path from 'path';
import TYPES from '../../constant/types';
import IConfigService from '../config/interface';
import { inject, ProvideSingleton } from '../ioc/ioc';
import { ILoggerService } from './interface';

@ProvideSingleton(TYPES.LoggerService)
export default class LoggerService implements ILoggerService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfigService
    ) {
        this.config = configService.get('LOGGER');

        this._setupLogger();
    }

    public getLogger(serviceName) {
        return log4js.getLogger(serviceName);
    }

    private _setupLogger() {
        const pathToFile = path.join(__dirname, '../../../', this.config.path);

        if (!fs.existsSync(pathToFile)) {
            fs.mkdirSync(pathToFile);
        }

        const appenders: any = {
            file: {
                filename: path.join(pathToFile, this.config.fileName),
                timezoneOffset: 0,
                type: 'file',
            },
        };
        const categories = {
            default: {
                appenders: ['file'],
                level: 'error',
            },
        };

        if (process.env.NODE_ENV !== 'production') {
            appenders.console = { type: 'console' };
            categories.default.appenders.push('console');
            categories.default.level = 'info';
        }

        log4js.configure({ categories, appenders });
    }

}
