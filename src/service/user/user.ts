import IUserService from './interface';
import { injectable, inject } from 'inversify';
import TYPES from '../../constant/types';
import IConfig from '../../libs/config/interface';
import * as jwt from 'jsonwebtoken';

@injectable()
export default class UserService implements IUserService {
    private _config;
    constructor(
        @inject(TYPES.Config) config: IConfig
    ) {
        this._config = config.get('AUTH');
    }

    get USER_QUEUES() {
        return this._USER_QUEUES;
    }

    async profile(id: string) {
        return this.rpcClient.call(this.USER_QUEUES['get-by-id'], id);
    }

    async login(email: string, password: string) {
        const user = await this.rpcClient.call(this.USER_QUEUES['login'], email, password);
        return {
            success: true,
            token: jwt.sign(user, this.JWT_SECRET, {
                expiresIn: '2 days'
            })
        }
    }

    async register(data: object) {
        return this.rpcClient.call(this.USER_QUEUES['create'], data);
    }

    async getUsers() {
        return this.rpcClient.call(this.USER_QUEUES['get-all']);
    }

    async create(data: object) {
        return this.rpcClient.call(this.USER_QUEUES['create'], data);
    }

    async deleteById(id: string) {
        return this.rpcClient.call(this.USER_QUEUES['delete-by-id'], id);
    }

    async updateById(id: string, data: object) {
        return this.rpcClient.call(this.USER_QUEUES['update-by-id'], id, data);
    }
}
