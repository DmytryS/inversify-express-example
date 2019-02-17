import "reflect-metadata";
import { Container } from "inversify";
import { interfaces, TYPE } from 'inversify-restify-utils';
import TYPES from "../../constant/types";

import IDatabase from '../database/interface';
import DatabaseService from '../database/database';
import { ILogger } from '../logger/interface';
import LoggerService from '../logger/logger';
import IConfig from '../config/interface';
import ConfigService from '../config/configuration';
import UserController from "../../controller/user"
import { IUserRepository } from '../../repository/user/interface';
import UserRepository from "../../repository/user/user";
import IUserService from '../../service/user/interface';
import UserService from "../../service/user/user";

const container = new Container();
container.bind<IConfig>(TYPES.Config).to(ConfigService).inSingletonScope();
container.bind<ILogger>(TYPES.Logger).to(LoggerService).inSingletonScope();
container.bind<IDatabase>(TYPES.Database).to(DatabaseService).inSingletonScope();
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed('UserController');

export default container;
