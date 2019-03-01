// import { injectable } from 'inversify';
import IDatabaseService from './interface';
// import { logger, config } from '../../constant/decorators';
import * as mongoose from 'mongoose';
import ILog4js, { ILoggerService } from '../logger/interface';
import IConfigService from '../config/interface'

import { ProvideSingleton, inject } from '../ioc/ioc';
import TYPES from '../../constant/types';

@ProvideSingleton(DatabaseService)
export default class DatabaseService implements IDatabaseService {
    private _config;
    private _logger: ILog4js;
    public db: mongoose.Connection;
    private _mongoose: mongoose.Mongoose;

    constructor(
        @inject(TYPES.LoggerService) loggerService: ILoggerService,
        @inject(TYPES.ConfigServie) config: IConfigService
    ) {
        this._config = config.get('DB');
        this._logger = loggerService.getLogger('Database');
        this._mongoose = mongoose;
    }

    get mongoose() {
        return this._mongoose;
    }

    /**
     * Connects to the database
     * @return {Promise} promise to connect to database
     */
    async connect(){
        this.db = await mongoose.connect(
            this._config.url,
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false
            },
            this.db.bind(this)
        );
      }

    /**
     * Disconnects from database
     * @returns {Promise} promise to diconnect from DB
     */
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    this._logger.error(`An error occured during closing db connection`, err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Clears the database
     * @returns {Promise} promise to clear database
     */
    async clear() {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Will not drop collection until in test env');
        }

        return new Promise((res, rej) => {
            this.db.dropDatabase((err) => {
                this._logger.info('Cleared DB');
                if (err) {
                    this._logger.error(err);
                    rej(err);
                }
                res();
            });
        });
    }

    private _onDbConnected(err) {
        if (err) {
            this._logger.error(err);
        } else {
            this._logger.debug(`Connected to the ${process.env.NODE_ENV} database`);
        }
    }
}
