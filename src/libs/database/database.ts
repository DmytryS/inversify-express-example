import { injectable } from 'inversify';
import IDatabase from './interface';
import { logger, config } from '../../constant/decorators';
import mongoose from 'mongoose';
import ILog4js, { ILogger } from '../logger/interface';
import IConfig from '../config/interface'

@injectable()
export default class Database implements IDatabase {
    private _config;
    private _logger: ILog4js;
    private _dbConnection;
    private _mongoose: mongoose.Mongoose;

    constructor(
        @logger loggerService: ILogger,
        @config config: IConfig
    ) {
        this._config = config.get('DB');
        this._logger = loggerService.getLogger('Database');
        this._dbConnection = false;
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
        this._dbConnection = await mongoose.connect(
            this._config.url,
            {
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false
            },
            this._onDbConnected.bind(this)
        );
      }

    /**
     * Disconnects from database
     * @returns {Promise} promise to diconnect from DB
     */
    close() {
        return new Promise((resolve, reject) => {
            this._dbConnection.close((err) => {
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
            this._dbConnection.dropDatabase((err) => {
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
