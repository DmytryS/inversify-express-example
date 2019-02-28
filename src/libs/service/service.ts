import "reflect-metadata";
import * as express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import * as corsMiddleware from 'restify-cors-middleware';
import * as bodyParser from 'body-parser';
import container from '../ioc/inversify.config';
import TYPES from '../../constant/types';
import ILog4js, { ILogger } from '../logger/interface';
import IDatabase from '../database/interface';
import IConfig from '../config/interface';
import * as path from 'path';
// import auth from '../auth/auth';

import * as swagger from "swagger-express-ts";
import { SwaggerDefinitionConstant } from "swagger-express-ts";

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
            app.use('/api-docs/swagger', express.static('swagger'));
            app.use(
                '/api-docs/swagger/assets',
                express.static('node_modules/swagger-ui-dist')
            );
            app.use(bodyParser.json());
            app.use(
                swagger.express({
                    definition: {
                        externalDocs: {
                            url: 'My url',
                        },
                        info: {
                            title: 'My api',
                            version: '1.0',
                        },
                        responses: {
                            500: {},
                        },
                    },
                })
            );

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
