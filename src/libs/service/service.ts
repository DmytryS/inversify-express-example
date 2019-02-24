import { InversifyRestifyServer } from 'inversify-restify-utils';
import * as corsMiddleware from 'restify-cors-middleware';
import * as bodyParser from 'body-parser';
import container from '../ioc/inversify.config';
import TYPES from '../../constant/types';
import ILog4js, { ILogger } from '../logger/interface';
import IDatabase from '../database/interface';
import IConfig from '../config/interface';
import auth from '../auth/auth';

export default class Service {
    private _config;
    private _logger: ILog4js;
    private _database: IDatabase;
    private _app;

    constructor() {
        this._config = container.get<IConfig>(TYPES.Config);
        this._logger = container.get<ILogger>(TYPES.Logger).getLogger('Main service');
        this._database = container.get<IDatabase>(TYPES.Database);
        this._app = false;
    }

    async start() {
        const cors = corsMiddleware({
            origins: ['*'],
            allowHeaders: ['Authorization']
        });

        await this._database.connect();
        console.log('default root', this._config.get('SERVER').baseUrl);

        const server = new InversifyRestifyServer(
            container,
            {
                defaultRoot: this._config.get('SERVER').baseUrl
            }
        );
        server.setConfig((app) => {
            app.pre(cors.preflight);
            app.use(cors.actual);
            app.use(
                auth(
                    this._config.get('AUTH'),
                    {
                        allowedGlobalMethods: ['OPTIONS']
                    }
                )
            );
            app.use(bodyParser.json());
        });
        const app = server.build();
        this._app = app.listen(this._config.get('SERVER').port, () => this._logger.info(`Server started on *:${this._config.get('SERVER').port}`));


        process.on('uncaughtException', (err) => {
            this._logger.error('Unhandled exception', err);
        });
        process.on('unhandledRejection', (err) => {
            this._logger.error('Unhandled rejection', err);
        });
        process.on('SIGTERM', async () => {
            this._logger.info('Received SIGTERM, going to shutdown server.');
            await this.stop();
        });
    }

    async stop() {
        await this._app.close();
        await this._database.close();
        this._logger.info('Server stopped');
    }
}
