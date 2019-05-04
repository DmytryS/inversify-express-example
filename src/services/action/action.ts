import { NotFoundError, InvalidArgumentError } from 'restify-errors';
import TYPES from '../../constant/types';
import IConfigService from '../../libs/config/interface';
import { inject, ProvideSingleton } from '../../libs/ioc/ioc';
import { IActionRepository } from '../../models/action/interface';
import { IUserRepository } from '../../models/user/interface';
import IActionService from './interface';
import { dumpAction } from '../../utils/dump';

@ProvideSingleton(TYPES.ActionService)
export default class ActionService implements IActionService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfigService,
        @inject(TYPES.UserRepository) private userRepository: IUserRepository,
        @inject(TYPES.ActionRepository) private actionRepository: IActionRepository
    ) {
        this.config = configService.get('AUTH');
    }

    public async getById(actionId: string) {
        const action = await this.checkIfActionExists(actionId);

        return dumpAction(action);
    }

    public async updateById(actionId: string, data: any) {
        const action = await this.checkIfActionExists(actionId);

        if (action.status !== 'ACTIVE') {
            throw new InvalidArgumentError('Token already used');
        }

        const user = await this.checkIfUserExists(action.userId);

        switch (action.type) {
            case 'REGISTER':
            case 'RESET_PASSWORD':
                await user.setPassword(data.password);
                await user.activate();

                await action.setUsed();
                break;
            default:
                throw new InvalidArgumentError(`Unknown action type ${action.type}`);
        }

        return;
    }

    private async checkIfActionExists(actionId) {
        const action = await this.actionRepository.Action.findById(actionId);

        if (!action) {
            throw new NotFoundError(`Action with id of ${actionId} not found`);
        }

        return action;
    }

    private async checkIfUserExists(userId) {
        const user = await this.userRepository.User.findById(userId);

        if (!user) {
            throw new NotFoundError(`User with id of ${userId} not found`);
        }

        return user;
    }
}
