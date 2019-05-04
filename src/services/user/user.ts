import { ConflictError, NotFoundError, MethodNotAllowedError } from 'restify-errors';
import TYPES from '../../constant/types';
import IConfigService from '../../libs/config/interface';
import { inject, ProvideSingleton } from '../../libs/ioc/ioc';
import IMailerServiceService from '../../libs/mailer/interface';
import { IActionRepository } from '../../models/action/interface';
import { IUserModel, IUserRepository } from '../../models/user/interface';
import IUserService from './interface';
import { dumpUser } from '../../utils/dump';

@ProvideSingleton(TYPES.UserService)
export default class UserService implements IUserService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfigService,
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

    public async resetPassword(email: string) {
        const user = await this.userRepository.User.findOne({ email });

        if (!user) {
            throw new NotFoundError(`User with email of ${email} not found`);
        }

        if (!user.passwordHash) {
            throw new MethodNotAllowedError('User password not set');
        }

        const action = await new this.actionRepository.Action({
            status: 'ACTIVE',
            type: 'RESET_PASSWORD',
            userId: user._id
        }).save();

        await this.mailerService.send(user.email, 'RESET_PASSWORD', {
            actionId: action._id.toString(),
            uiUrl: this.config.SERVER.uiUrl
        });

        return;
    }

    public async getUsers(skip: number, limit: number, role: string) {
        const users = await this.userRepository.User.paginate(skip, limit, role);

        return users.map(dumpUser);
    }

    public async getById(id: string) {
        const user = await this.checkIfUserExists(id);

        return dumpUser(user);
    }

    public async deleteById(id: string) {
        const user = await this.checkIfUserExists(id);

        await user.remove();

        return;
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
