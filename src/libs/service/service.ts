import * as bodyParser from 'body-parser';
import { InversifyExpressServer } from 'inversify-express-utils';
import 'reflect-metadata';
import TYPES from '../../constant/types';
import IConfigService from '../config/interface';
import IDatabaseService from '../database/interface';
import { container, loadServices } from '../ioc/ioc';
import '../ioc/loader';
import ILog4js, { ILoggerService } from '../logger/interface';

export default class Service {
    private config;
    private logger: ILog4js;
    private database: IDatabaseService;
    private app;

    constructor() {
        loadServices();
        this.config = container.get<IConfigService>(TYPES.ConfigServie);
        this.logger = container.get<ILoggerService>(TYPES.LoggerService).getLogger('Main service');
        this.database = container.get<IDatabaseService>(TYPES.DatabaseService);
        this.app = false;
    }

    public async start() {
        await this.database.connect();

        const server = new InversifyExpressServer(container, false, {
            rootPath: this.config.get('SERVER').baseUrl
        });
        server.setConfig((expressApp) => {
            expressApp.use(bodyParser.urlencoded({
                extended: true
            }));
            expressApp.use(bodyParser.json());
        });

        const port = this.config.get('SERVER').port;
        const app = server.build();
        this.app = app.listen(
            port,
            () => this.logger.info(`Server started on *:${port}`)
        );


        process.on('uncaughtException', (err) => {
            this.logger.error('Unhandled exception', err);
        });
        process.on('unhandledRejection', (err) => {
            this.logger.error('Unhandled rejection', err);
        });
        process.on('SIGTERM', async () => {
            this.logger.info('Received SIGTERM, going to shutdown server.');
            await this.stop();
        });
    }

    public async stop() {
        await this.app.close();
        await this.database.close();
        this.logger.info('Server stopped');
    }
}
