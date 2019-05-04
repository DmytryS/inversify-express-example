import { ConflictError, NotFoundError } from 'restify-errors';
import TYPES from '../../constant/types';
import IConfig from '../../libs/config/interface';
import { inject, ProvideSingleton } from '../../libs/ioc/ioc';
import IMailerServiceService from '../../libs/mailer/interface';
import { IActionRepository } from '../../models/action/interface';
import { IUserModel, IUserRepository } from '../../models/user/interface';
import IUserService from './interface';

@ProvideSingleton(TYPES.UserService)
export default class UserService implements IUserService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfig,
        @inject(TYPES.MailerService) private mailerService: IMailerServiceService,
        @inject(TYPES.UserRepository) private userRepository: IUserRepository,
        @inject(TYPES.ActionRepository) private actionRepository: IActionRepository
    ) {
        this.config = configService.get();
    }

    public async register(userObject: IUserModel) {
        let user = await this.userRepository.User.findOne({
            email: userObject.email
        });
        let action;

        if (user) {
            if (user.status === 'ACTIVE') {
                throw new ConflictError(`${user.role} with email ${user.email} already exists`);
            } else {
                if (user.status === 'PENDING') {
                    action = await this.actionRepository.Action.findOne({
                        userId: user._id
                    });

                    if (!action) {
                        action = await new this.actionRepository.Action({
                            status: 'ACTIVE',
                            type: 'REGISTER',
                            userId: user._id
                        }).save();
                    }
                }
            }
        } else {
            user = await new this.userRepository.User({
                ...userObject,
                status: 'PENDING'
            }).save();

            action = await new this.actionRepository.Action({
                status: 'ACTIVE',
                type: 'REGISTER',
                userId: user._id
            }).save();
        }

        await this.mailerService.send(user.email, 'REGISTER', {
            actionId: action._id.toString(),
            uiUrl: this.config.SERVER.uiUrl
        });

        return user;
    }

    public async getUsers() {
        return this.userRepository.User.findA({});
    }

    public async getById(id: string) {
        const user = await this.checkIfUserExists(id);

        const userJSON = user.toJSON();
        userJSON._id = userJSON._id.toString();
        delete userJSON.__v;
        delete userJSON.passwordHash;

        return userJSON;
    }

    public async deleteById(id: string) {
        const user = await this.checkIfUserExists(id);

        return user.remove();
    }

    public async updateById(id: string, data: object) {
        return this.userRepository.User.updateById(id, data);
    }

    private async checkIfUserExists(userId) {
        const user = await this.userRepository.User.findById(userId);

        if (!user) {
            throw new NotFoundError(`User with id of ${userId} not found`);
        }

        return user;
    }
}
