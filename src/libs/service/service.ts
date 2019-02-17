import { InversifyRestifyServer } from 'inversify-restify-utils';
import container from '../ioc/inversify.config';
import TYPES from '../../constant/types';
import ILog4js, { ILogger } from '../logger/interface';
import IDatabase from '../database/interface';
import IConfig from '../config/interface';

export default class Service {
    private _config: IConfig;
    private _logger: ILog4js;
    private _database: IDatabase;

    constructor() {
        this._config = container.get<IConfig>(TYPES.Config);
        this._logger = container.get<ILogger>(TYPES.Logger).getLogger('Main service');
        this._database = container.get<IDatabase>(TYPES.Database);
    }

    async start() {
        const cors = corsMiddleware({
            origins: ['*'],
            allowHeaders: ['Authorization']
        });

        const logger: ILogger = container.get<ILogger>(TYPES.Logger);
        const config: IConfig = container.get<IConfig>(TYPES.Config);
        const API_PORT = config.get('API_PORT');
        const server = new InversifyRestifyServer(container, { defaultRoot: '/api' });
        server.setConfig((app) => {
            app.pre(cors.preflight);
            app.use(cors.actual);
            app.use(auth(config.get('JWT_SECRET'), {
                allowedGlobalMethods: ['OPTIONS']
            }));
            app.use(require('morgan')('dev'));
            app.use(bodyParser.json());
        });
        const app = server.build();
        app.listen(API_PORT, () => logger.info(`Server started on *:${API_PORT}`));
    }

    async stop() {

    }
}
