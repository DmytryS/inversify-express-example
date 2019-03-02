import * as err from 'restify-errors';
import { ProvideSingleton, inject } from '../../libs/ioc/ioc'
import TYPES from '../../constant/types';
import IActionService from './interface';
import IConfig from '../../libs/config/interface';
import { IUserRepository } from '../../models/user/interface';
import { IActionRepository } from '../../models/action/interface';
import IMailerService from '../../libs/mailer/interface'

@ProvideSingleton(TYPES.ActionService)
export default class ActionService implements IActionService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfig,
        @inject(TYPES.MailerService) private mailerService: IMailerService,
        @inject(TYPES.UserModel) private userRepository: IUserRepository,
        @inject(TYPES.ActionModel) private actionRepository: IActionRepository
    ) {
        this.config = configService.get('AUTH');
    }

    async getById(actionId: string) {
        const action = await this.actionRepository.Action.findById(actionId);

        if (!action) {
            throw new err.NotFoundError(`Action with id of ${actionId}`);
        }

        return action;
    }

    async updateById(actionId: string, data: any) {
        const action = await this.actionRepository.Action.findById(actionId);

        if (!action) {
            throw new err.NotFoundError(`Action with id of ${actionId}`);
        }

        if (action.status !== 'ACTIVE') {
            throw new err.InvalidArgumentError('Action already used');
        }

        const user = await this.userRepository.User.findById(action.userId);

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
