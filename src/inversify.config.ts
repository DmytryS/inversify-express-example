// import { Container } from 'inversify';
// import TYPES from './constant/types';
// import IConfig from './libs/config/interface';
// import ILogger from './libs/logger/interface';
// import IAssignmentService from './service/assignment/interface';
// import AssignmentService from './service/assignment/impl';
// import { interfaces, TYPE } from 'inversify-restify-utils';
// import { AssignmentController } from './controller/assignment';

// import IRpcClient from './rpc/client/interface';
// import RpcClient from './rpc/client/impl';
// import UserController from './controller/user';
// import IUserService from './service/user/interface';
// import UserService from './service/user/impl';

// const container = new Container();
// container.bind<NconfModule>(TYPES.NconfModule).toConstantValue(nconf);
// container.bind<IConfig>(TYPES.Config).to(NconfImpl).inSingletonScope();
// container.bind<ILogger>(TYPES.Logger).to(ConsoleLogger);
// container.bind<RpcModule>(TYPES.RpcModule).toConstantValue(rpcModule);
// container.bind<IRpcClient>(TYPES.RpcClient).to(RpcClient).inSingletonScope();
// container.bind<interfaces.Controller>(TYPE.Controller).to(UserController).whenTargetNamed('UserController');
// container.bind<IUserService>(TYPES.UserService).to(UserService);
// container.bind<interfaces.Controller>(TYPE.Controller).to(AssignmentController).whenTargetNamed('AssignmentController');
// container.bind<IAssignmentService>(TYPES.AssignmentService).to(AssignmentService);

// export default container;
