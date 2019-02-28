import { injectable } from 'inversify';
import * as err from 'restify-errors';
import { config, userRepository, actionRepository, mailSender } from '../../constant/decorators';
import { IUser } from '../../repository/user/interface';
import IActionService from './interface';
import IConfig from '../../libs/config/interface';
import { IUserRepository } from '../../repository/user/interface';
import { IActionRepository } from '../../repository/action/interface';
import IMailSender from '../../libs/mailer/interface'

@injectable()
export default class ActionService implements IActionService {
    private config;

    constructor(
        @config private configService: IConfig,
        @mailSender private mailSender: IMailSender,
        @userRepository private userRepository: IUserRepository,
        @actionRepository private actionRepository: IActionRepository
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
