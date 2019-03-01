import * as jwt from 'jsonwebtoken';
// import { injectable } from 'inversify';
import { ProvideSingleton, inject } from '../../libs/ioc/ioc'
import TYPES from '../../constant/types';
// import { config, userRepository, actionRepository, mailSender } from '../../constant/decorators';
import { IUser } from '../../repository/user/interface';
import IUserService from './interface';
import IConfig from '../../libs/config/interface';
import { IUserRepository } from '../../repository/user/interface';
import { IActionRepository } from '../../repository/action/interface';
import IMailerService from '../../libs/mailer/interface'

@ProvideSingleton(TYPES.UserService)
export default class UserService implements IUserService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfig,
        @inject(TYPES.MailerService) private mailerService: IMailerService,
        @inject(TYPES.UserRepository) private userRepository: IUserRepository,
        @inject(TYPES.ActionRepository) private actionRepository: IActionRepository
    ) {
        this.config = configService.get();
    }

    async profile(id: string) {
        return this.userRepository.findById(id);
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findOne({
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

    async register(data: IUser) {
        const newUser = await this.userRepository.create({
            ...data,
            type: 'DRIVER'
        });
        const action = await this.actionRepository.create({
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
        return this.userRepository.findAll();
    }

    async deleteById(id: string) {
        return this.userRepository.deleteById(id);
    }

    async updateById(id: string, data: object) {
        return this.userRepository.updateById(id, data);
    }
}
