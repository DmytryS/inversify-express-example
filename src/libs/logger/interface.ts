import { Logger as ILogger }from 'log4js';
export interface ILoggerService {
    getLogger(serviceName: string): ILogger;
}

export default ILogger;
