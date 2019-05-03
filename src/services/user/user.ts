import { ConflictError } from 'restify-errors';
import TYPES from '../../constant/types';
import IAuthService from '../../libs/auth/interface';
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
        @inject(TYPES.UserRepository) private userRepository: IUserRepository,
        @inject(TYPES.ActionRepository) private actionRepository: IActionRepository,
        @inject(TYPES.AuthService) private authService: IAuthService
    ) {
        this.config = configService.get();
    }

    public async getProfile(id: string) {
        return this.userRepository.User.findById(id);
    }

    public async login(email: string, password: string, userType: string) {
        // const user = await this.userRepository.User.findOne({
        //   email,
        //   userType
        // });
        // this.authService.authenticateCredentials();
        // return {
        //   success: true,
        //   token: jwt.sign(user, this.config.AUTH.secret, {
        //     expiresIn: this.config.AUTH.expiresIn
        //   })
        // };

        return {};
    }

    public async register(userObject: IUserModel) {
        let user = await this.userRepository.User.findOne({
            email: userObject.email,
            type: userObject.type
        });
        let action;

        if (user) {
            if (user.status === 'ACTIVE') {
                throw new ConflictError(`${user.type} with email ${user.email} already exists`);
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
                status: 'PENDING',
                type: 'DRIVER'
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

    public async deleteById(id: string) {
        return this.userRepository.User.deleteById(id);
    }

    public async updateById(id: string, data: object) {
        return this.userRepository.User.updateById(id, data);
    }
}
