import "reflect-metadata";
import * as express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
// import * as corsMiddleware from 'restify-cors-middleware';
import * as bodyParser from 'body-parser';
import container from '../ioc/inversify.config';
import TYPES from '../../constant/types';
import ILog4js, { ILoggerService } from '../logger/interface';
import IDatabaseService from '../database/interface';
import IConfigService from '../config/interface';
import { iocContainer } from '../ioc/ioc';
// import auth from '../auth/auth';

// import * as swagger from "swagger-express-ts";
// import { SwaggerDefinitionConstant } from "swagger-express-ts";

export default class Service {
    private _config;
    private _logger: ILog4js;
    private _database: IDatabaseService;
    private _app;

    constructor() {
        this._config = iocContainer.get<IConfigService>(TYPES.ConfigServie);
        this._logger = iocContainer.get<ILoggerService>(TYPES.LoggerService).getLogger('Main service');
        this._database = iocContainer.get<IDatabaseService>(TYPES.DatabaseService);
        this._app = false;
    }

    async start() {
        // const cors = corsMiddleware({
        //     origins: ['*'],
        //     allowHeaders: ['Authorization']
        // });

        await this._database.connect();

        const server = new InversifyExpressServer(
            container,
            {
                defaultRoot: this._config.get('SERVER').baseUrl
            }
        );
        server.setConfig((app) => {
            // app.use('/api-docs/swagger', express.static('swagger'));
            // app.use(
            //     '/api-docs/swagger/assets',
            //     express.static('node_modules/swagger-ui-dist')
            // );
            app.use(bodyParser.json());
            // app.use(
            //     swagger.express({
            //         definition: {
            //             externalDocs: {
            //                 url: 'My url',
            //             },
            //             info: {
            //                 title: 'My api',
            //                 version: '1.0',
            //             },
            //             responses: {
            //                 500: {},
            //             },
            //         },
            //     })
            // );

        });

        server.setErrorConfig((app: any) => {
            app.use(
                (
                    err: Error,
                    request: express.Request,
                    response: express.Response,
                    next: express.NextFunction
                ) => {
                    console.error(err.stack);
                    response.status(500).send('Something broke!');
                }
            );
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
