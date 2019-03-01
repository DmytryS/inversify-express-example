// import { injectable } from 'inversify';
import * as err from 'restify-errors';
import { ProvideSingleton, inject } from '../../libs/ioc/ioc'
import TYPES from '../../constant/types';
// import { config, userRepository, actionRepository, mailSender } from '../../constant/decorators';
// import { IUser } from '../../repository/user/interface';
import IActionService from './interface';
import IConfig from '../../libs/config/interface';
import { IUserRepository } from '../../repository/user/interface';
import { IActionRepository } from '../../repository/action/interface';
import IMailerService from '../../libs/mailer/interface'

@ProvideSingleton(TYPES.ActionService)
export default class ActionService implements IActionService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) private configService: IConfig,
        @inject(TYPES.MailerService) private mailerService: IMailerService,
        @inject(TYPES.UserRepository) private userRepository: IUserRepository,
        @inject(TYPES.ActionRepository) private actionRepository: IActionRepository
    ) {
        this.config = configService.get('AUTH');
    }

    async getById(actionId: string) {
        const action = await this.actionRepository.findById(actionId);

        if (!action) {
            throw new err.NotFoundError(`Action with id of ${actionId}`);
        }

        return action;
    }

    async updateById(actionId: string, data: any) {
        const action = await this.actionRepository.findById(actionId);

        if (!action) {
            throw new err.NotFoundError(`Action with id of ${actionId}`);
        }

        if (action.status !== 'ACTIVE') {
            throw new err.InvalidArgumentError('Action already used');
        }

        const user = await this.userRepository.findById(action.userId);

        if (!user) {
            throw new err.NotFoundError(`User with id of ${action.userId}`);
        }



        switch (action.type) {
            case 'REGISTER':
            case 'RESET_PASSWORD':
                // await user.setPassword(data.password);

                await action.setUsed();
                break;
            default:
                throw new err.InvalidArgumentError(`Unknown action type ${action.type}`);
        }

        return;
    }
}
