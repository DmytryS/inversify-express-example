import * as jwt from 'jsonwebtoken';
import { injectable } from 'inversify';
import { config, userRepository, actionRepository, mailSender } from '../../constant/decorators';
import { IUser } from '../../repository/user/interface';
import IUserService from './interface';
import IConfig from '../../libs/config/interface';
import { IUserRepository } from '../../repository/user/interface';
import { IActionRepository } from '../../repository/action/interface';
import IMailSender from '../../libs/mailer/interface'

@injectable()
export default class UserService implements IUserService {
    private config;

    constructor(
        @config private configService: IConfig,
        @mailSender private mailSender: IMailSender,
        @userRepository private userRepository: IUserRepository,
        @actionRepository private actionRepository: IActionRepository
    ) {
        this.config = configService.get('AUTH');
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
                this.config.secret,
                {
                    expiresIn: this.config.expiresIn
                }
            )
        }
    }

    async register(data: IUser) {
        const newUser = await this.userRepository.create(data);
        const action = await this.actionRepository.create({
            userId: newUser.id,
            type: 'REGISTER',
            status: 'ACTIVE'
        });

        await this.mailSender.send(
            newUser.email,
            'REGISTER',
            action
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
