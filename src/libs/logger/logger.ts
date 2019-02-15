import { injectable, inject } from 'inversify';
import TYPES from '../../constant/types';
import { ILoggerService } from './interface';
import IConfig from '../config/interface';
import * as fs from 'fs';
import * as path from 'path';
import * as log4js from 'log4js';

@injectable()
export default class Logger implements ILoggerService {
    private _config;

    constructor(
        @inject(TYPES.Config) config: IConfig
    ) {
        this._config = config.get('LOGGER');

        this._setupLogger();
    }

    private _setupLogger() {
        const pathToFile = path.join(__dirname, '../../', this._config.logger.path);

        if (!fs.existsSync(pathToFile)) {
            fs.mkdirSync(pathToFile);
        }
        const appenders = {
            file: {
                type: 'file',
                filename: path.join(pathToFile, this._config.logger.filename),
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
