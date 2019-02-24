import * as jwt from 'jsonwebtoken';
import { injectable } from 'inversify';
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

    async getById(id: string) {
        return this.actionRepository.findById(id);
    }

    async updateById(id: string, data: object) {
        // TODO
        return this.userRepository.updateById(id, data);
    }
}
