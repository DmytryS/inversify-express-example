import 'reflect-metadata';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Container } from 'inversify';
import * as bodyParser from 'body-parser';
import TYPES from './constant/types';
import './controller/home';
import './controller/user';

// load everything needed to the Container
let container = new Container();
container.bind<UserService>(TYPES.UserService).to(UserService);

// start the server
let server = new InversifyExpressServer(container);

server.setConfig((app) => {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
});

let serverInstance = server.build();
serverInstance.listen(3000);

console.log('Server started on port 3000 :)');





import * as Hapi from "hapi";
import Routes from "./routes";
import kernel from "./libs/ioc";
import * as path from "path";
import * as fs from "fs";
import { IPlugin } from "./libs/plugins/interfaces";
import { IServerConfig } from "./configs/interface";

const serverConfigs = kernel.get<IServerConfig>("IServerConfig");
const port = process.env.port || serverConfigs.port;
const server = new Hapi.Server();

server.connection({
    port: port,
    routes: {
        cors: true
    }
});

//  Setup Hapi Plugins
const pluginsPath = __dirname + '/libs/plugins/';
const plugins = fs.readdirSync(pluginsPath).filter(file => fs.statSync(path.join(pluginsPath, file)).isDirectory());

plugins.forEach((pluginName: string) => {
    var plugin: IPlugin = (require("./libs/plugins/" + pluginName)).default();
    console.log(`Register Plugin ${plugin.info().name} v${plugin.info().version}`);
    plugin.register(server);
});

//Register Routes
Routes(server);

export default server;
