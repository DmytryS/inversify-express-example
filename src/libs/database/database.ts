import * as mongoose from 'mongoose';
import TYPES from '../../constant/types';
import IConfigService from '../config/interface';
import { inject, ProvideSingleton } from '../ioc/ioc';
import ILog4js, { ILoggerService } from '../logger/interface';
import IDatabaseService from './interface';

@ProvideSingleton(TYPES.DatabaseService)
export default class DatabaseService implements IDatabaseService {
    public db: mongoose.Connection;
    private config;
    private logger: ILog4js;

    constructor(
        @inject(TYPES.LoggerService) loggerService: ILoggerService,
        @inject(TYPES.ConfigServie) configService: IConfigService
    ) {
        this.db = false;
        this.config = configService.get('DB');
        this.logger = loggerService.getLogger('Database');
    }

    /**
     * Connects to the database
     * @return {Promise} promise to connect to database
     */
    public async connect() {
        // mongoose.connection.on('connected');

        await mongoose.connect(
            this.config.url,
            {
                useCreateIndex: true,
                useFindAndModify: false,
                useNewUrlParser: true
            },
            this._onDbConnected.bind(this)
        );

        this.db = mongoose.connection;
    }

    /**
     * Disconnects from database
     * @returns {Promise} promise to diconnect from DB
     */
    public close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    this.logger.error('An error occured during closing db connection', err);
                    return reject(err);
                }

                return resolve();
            });
        });
    }

    /**
     * Clears the database
     * @returns {Promise} promise to clear database
     */
    public async clear() {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Will not drop collection until in test env');
        }

        return new Promise((res, rej) => {
            this.db.dropDatabase((err) => {
                this.logger.info('Cleared DB');
                if (err) {
                    this.logger.error(err);
                    rej(err);
                }
                res();
            });
        });
    }

    private _onDbConnected(err) {
        if (err) {
            this.logger.error(err);
        } else {
            this.logger.info(`Connected to the ${process.env.NODE_ENV} database`);
        }
    }
}
