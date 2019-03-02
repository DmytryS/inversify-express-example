import * as jwt from 'jsonwebtoken';
import { ProvideSingleton, inject } from '../../libs/ioc/ioc'
import TYPES from '../../constant/types';
import IUserService from './interface';
import IConfig from '../../libs/config/interface';
import { IUserRepository, IUserModel } from '../../models/user/interface';
import { IActionRepository } from '../../models/action/interface';
import IMailerService from '../../libs/mailer/interface'

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

    async profile(id: string) {
        return this.userRepository.User.findById(id);
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.User.findOne({
            email
        });
        return {
            success: true,
            token: jwt.sign(
                user,
                this.config.AUTH.secret,
                {
                    expiresIn: this.config.AUTH.expiresIn
                }
            )
        }
    }

    async register(data: IUserModel) {
        const newUser = await new this.userRepository.User({
            ...data,
            type: 'DRIVER'
        });
        const action = await new this.actionRepository.Action({
            userId: newUser.id,
            type: 'REGISTER',
            status: 'ACTIVE'
        });

        await this.mailerService.send(
            newUser.email,
            'REGISTER',
            {
                actionId: action.id,
                uiUrl: this.config.SERVER.uiUrl
            }
        );
        return newUser;
    }

    async getUsers() {
        return this.userRepository.User.findAll();
    }

    async deleteById(id: string) {
        return this.userRepository.User.deleteById(id);
    }

    async updateById(id: string, data: object) {
        return this.userRepository.User.updateById(id, data);
    }
}
