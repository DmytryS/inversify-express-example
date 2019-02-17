import IUserService from './interface';
import { injectable } from 'inversify';
import { config, userRepository} from '../../constant/decorators';
import IConfig from '../../libs/config/interface';
import { User as IUser} from '../../repository/user/interface';
import * as jwt from 'jsonwebtoken';
import {  IUserRepository } from '../../repository/user/interface';

@injectable()
export default class UserService implements IUserService {
    private _config;
    private _userRepository: IUserRepository;

    constructor(
        @config config: IConfig,
        @userRepository userRepository: IUserRepository
    ) {
        this._config = config.get('AUTH');
        this._userRepository = userRepository;
    }

    async profile(id: string) {
        return this._userRepository.findById(id);
    }

    async login(email: string, password: string) {
        const user = await this._userRepository.findOne({
            email
        });
        return {
            success: true,
            token: jwt.sign(
                user,
                this._config.secret,
                {
                    expiresIn: this._config.expiresIn
                }
            )
        }
    }

    async register(data: IUser) {
        return this._userRepository.create(data);
    }

    async getUsers() {
        return this._userRepository.findAll();
    }

    async deleteById(id: string) {
        return this._userRepository.deleteById(id);
    }

    async updateById(id: string, data: object) {
        return this._userRepository.updateById(id, data);
    }
}
