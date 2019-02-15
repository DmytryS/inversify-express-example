import { injectable, inject } from 'inversify';
import { IDatabase } from './interface';
import TYPES from '../../../types';
import mongoose from 'mongoose';
import ILogger from '../logger/interface';
import IConfig from '../config/interface'

@injectable();
export default class Database implements IDatabase {
    constructor(
        @inject(TYPES.Logger) private logger: ILogger,
        @inject(TYPES.Config) config: IConfig
    ) {
        this._config = config.get('DB');
        this._logger = logger;
    }

    /**
     * Connects to the database
     * @return {Promise} promise to connect to database
     */
    async connect(){
        const connection = await mongoose.connect(
            this._config.url,
            {
                useNewUrlParser: true
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
            mongoose.connection.close((err) => {
                if (err) {
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

    }

    _onDbConnected(err) {
        if (err) {
            this._logger.error(err);
        } else {
            this._logger.debug(`Connected to the ${process.env.NODE_ENV} database`);
        }
    }
}