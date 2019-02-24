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
    private _config;
    private _mailSender: IMailSender;
    private _userRepository: IUserRepository;
    private _actionRepository: IActionRepository;

    constructor(
        @config config: IConfig,
        @mailSender mailSender: IMailSender,
        @userRepository userRepository: IUserRepository,
        @actionRepository actionRepository: IActionRepository
    ) {
        this._config = config.get('AUTH');
        this._mailSender = mailSender;
        this._userRepository = userRepository;
        this._actionRepository = actionRepository;
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
        const newUser = await this._userRepository.create(data);
        const action = await this._actionRepository.create({
            userId: newUser.id,
            type: 'REGISTER'
        });

        await this._mailSender.send(
            newUser.email,
            'REGISTER',
            action
        );
        return newUser;
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
