// import "reflect-metadata";
// import { Container } from "inversify";
// import { interfaces, TYPE } from 'inversify-express-utils';
// import TYPES from "../../constant/types";

// import IDatabase from '../database/interface';
// import DatabaseService from '../database/database';
// import { ILogger } from '../logger/interface';
// import LoggerService from '../logger/logger';
// import IConfig from '../config/interface';
// import ConfigService from '../config/configuration';
// import IMailSender from '../mailer/interface';
// import MailSenderService from '../mailer/mailer';
// import { IUserRepository } from '../../repository/user/interface';
// import UserRepository from "../../repository/user/user";
// import { IActionRepository } from '../../repository/action/interface';
// import ActionRepository from "../../repository/action/action";
// import IUserService from '../../services/user/interface';
// import UserService from '../../services/user/user';
// import UserController from '../../controller/user'
// import IActionService from '../../services/action/interface';
// import ActionService from '../../services/action/action';
// import ActionController from '../../controller/action';
// import IAuthService from '../auth/interface';
// import AuthService from '../auth/auth';

// const container = new Container();
// container.bind<IConfig>(TYPES.Config).to(ConfigService).inSingletonScope();
// container.bind<ILogger>(TYPES.Logger).to(LoggerService).inSingletonScope();
// container.bind<IDatabase>(TYPES.Database).to(DatabaseService).inSingletonScope();
// container.bind<IMailSender>(TYPES.MailSender).to(MailSenderService).inSingletonScope();
// container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
// container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
// container.bind<IActionRepository>(TYPES.ActionRepository).to(ActionRepository).inSingletonScope();
// container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed('UserController');
// container.bind<IUserService>(TYPES.UserService).to(UserService);
// container.bind<interfaces.Controller>(TYPE.Controller).to(ActionController).whenTargetNamed('ActionController');
// container.bind<IActionService>(TYPES.ActionService).to(ActionService);

// export default container;
