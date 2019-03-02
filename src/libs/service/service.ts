import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as bodyParser from 'body-parser';
import TYPES from '../../constant/types';
import ILog4js, { ILoggerService } from '../logger/interface';
import IDatabaseService from '../database/interface';
import IConfigService from '../config/interface';
import { container, loadServices } from '../ioc/ioc';
import '../ioc/loader';

export default class Service {
    private _config;
    private _logger: ILog4js;
    private _database: IDatabaseService;
    private _app;

    constructor() {
        loadServices();
        this._config = container.get<IConfigService>(TYPES.ConfigServie);
        this._logger = container.get<ILoggerService>(TYPES.LoggerService).getLogger('Main service');
        this._database = container.get<IDatabaseService>(TYPES.DatabaseService);
        this._app = false;
    }

    async start() {
        await this._database.connect();

        let server = new InversifyExpressServer(container, false, {
            rootPath: this._config.get('SERVER').baseUrl
        });
        server.setConfig((app) => {
            app.use(bodyParser.urlencoded({
                extended: true
            }));
            app.use(bodyParser.json());
        });

        const port = this._config.get('SERVER').port;
        const app = server.build();
        this._app = app.listen(
            port,
            () => this._logger.info(`Server started on *:${port}`)
        );


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
