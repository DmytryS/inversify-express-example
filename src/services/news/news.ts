import * as err from 'restify-errors';
import TYPES from '../../constant/types';
import IConfig from '../../libs/config/interface';
import { inject, ProvideSingleton } from '../../libs/ioc/ioc';
import { IUserRepository } from '../../models/user/interface';
import INewsService from './interface';

@ProvideSingleton(TYPES.N)
export default class NewsService implements INewsService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfig,
        @inject(TYPES.UserModel) private userRepository: IUserRepository
    ) {
        this.config = configService.get('AUTH');
    }

    public async getById(actionId: string) {
        const action = await this.actionRepository.Action.findById(actionId);

        if (!action) {
            throw new err.NotFoundError(`Action with id of ${actionId}`);
        }

        return action;
    }
}
