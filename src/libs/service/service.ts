/* tslint:enable */
import 'reflect-metadata';
/* tslint:disable */
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as swagger from 'swagger-express-ts';
import { HttpError } from 'restify-errors';
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

    constructor(configuration) {
        loadServices();

        this.config = container.get<IConfigService>(TYPES.ConfigServie);
        if (configuration) {
            this.config.setConfig(configuration);
        }
        this.logger = container.get<ILoggerService>(TYPES.LoggerService).getLogger('Main service');
        this.database = container.get<IDatabaseService>(TYPES.DatabaseService);
        this.app = false;
    }

    /**
     * Returns express server
     * @returns {Server} returns express server
     */
    get server() {
        return this.app;
    }

    public async start() {
        await this.database.connect();

        const server = new InversifyExpressServer(container, null, {
            rootPath: this.config.get('SERVER').baseUrl
        });
        server.setConfig((app) => {
            // app.use(bodyParser.urlencoded({
            //     extended: true
            // }));
            // app.use(bodyParser.json());

            app.use('/api-docs/swagger', express.static('swagger'));
            app.use('/api-docs/swagger/assets', express.static('node_modules/swagger-ui-dist'));
            app.use(bodyParser.json());
            app.use(
                swagger.express({
                    definition: {
                        externalDocs: {
                            url: 'My url'
                        },
                        info: {
                            title: 'My api',
                            version: '1.0'
                        },
                        securityDefinitions: {
                            apiKeyHeader: {
                                type: swagger.SwaggerDefinitionConstant.Security.Type.API_KEY,
                                in: swagger.SwaggerDefinitionConstant.Security.In.HEADER,
                                name: 'Authorization'
                            }
                        },
                        basePath: this.config.get('SERVER').baseUrl
                        // Models can be defined here
                    }
                })
            );
        });

        server.setErrorConfig((app: any) => {
            app.use(
                (err: HttpError, request: express.Request, response: express.Response, next: express.NextFunction) => {
                    this.logger.error(err.stack);

                    const DEFAULT_ERR_MSG = 'An error occured. Please contact system administrator';

                    if (err instanceof HttpError) {
                        response.status(err.statusCode || 500).json({
                            errorMessage: err.message || DEFAULT_ERR_MSG,
                            status: err.statusCode || 500
                        });
                    } else {
                        response.status(500).json({
                            message: DEFAULT_ERR_MSG
                        });
                    }
                }
            );
        });

        const url = process.env.NODE_ENV !== 'production' ? 'http://127.0.0.1' : '*';
        const port = this.config.get('SERVER').port;

        this.app = server.build().listen(port, () => {
            this.logger.info(`Server started on ${url}:${port}`);
            this.logger.info(`Swagger docs started on ${url}:${port}/api-docs/swagger`);
        });

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

    public async clearDb() {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Will not drop collection until in test env');
        }

        await this.database.clear();
    }
}
