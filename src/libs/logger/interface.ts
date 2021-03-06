import { Logger as ILog4js } from 'log4js';

export interface ILoggerService {
    getLogger(serviceName: string): ILog4js;
}

export default ILog4js;
