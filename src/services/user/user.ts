import * as jwt from 'jsonwebtoken';
import TYPES from '../../constant/types';
import IConfig from '../../libs/config/interface';
import { inject, ProvideSingleton } from '../../libs/ioc/ioc';
import IMailerService from '../../libs/mailer/interface';
import { IActionRepository } from '../../models/action/interface';
import { IUserModel, IUserRepository } from '../../models/user/interface';
import IUserService from './interface';

@ProvideSingleton(TYPES.UserService)
export default class UserService implements IUserService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfig,
        @inject(TYPES.MailerService) private mailerService: IMailerService,
        @inject(TYPES.UserModel) private userRepository: IUserRepository,
        @inject(TYPES.ActionModel) private actionRepository: IActionRepository
    ) {
        this.config = configService.get();
    }

    public async profile(id: string) {
        return this.userRepository.User.findById(id);
    }

    public async login(email: string, password: string) {
        const user = await this.userRepository.User.findOne({
            email
        });
        return {
            success: true,
            token: jwt.sign(user, this.config.AUTH.secret, {
                expiresIn: this.config.AUTH.expiresIn
            })
        };
    }

    public async register(data: IUserModel) {
        const newUser = await new this.userRepository.User({
            ...data,
            type: 'DRIVER'
        });
        const action = await new this.actionRepository.Action({
            status: 'ACTIVE',
            type: 'REGISTER',
            userId: newUser.id
        });

        await this.mailerService.send(newUser.email, 'REGISTER', {
            actionId: action.id,
            uiUrl: this.config.SERVER.uiUrl
        });
        return newUser;
    }

    public async getUsers() {
        return this.userRepository.User.findAll();
    }

    public async deleteById(id: string) {
        return this.userRepository.User.deleteById(id);
    }

    public async updateById(id: string, data: object) {
        return this.userRepository.User.updateById(id, data);
    }
}
