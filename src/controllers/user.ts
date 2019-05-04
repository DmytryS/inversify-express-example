import 'reflect-metadata';
import { controller, httpDelete, httpGet, httpPost, httpPut } from 'inversify-express-utils';
import { MethodNotAllowedError, UnauthorizedError } from 'restify-errors';
import * as jwt from 'jsonwebtoken';
import {
    ApiOperationGet,
    ApiOperationPost,
    ApiOperationPut,
    ApiPath,
    SwaggerDefinitionConstant
} from 'swagger-express-ts';
import TYPES from '../constant/types';
import IAuthService from '../libs/auth/interface';
import IValidatorService from '../libs/validator/interface';
import { inject } from '../libs/ioc/ioc';
import IUserService from '../services/user/interface';
import IConfigService from '../libs/config/interface';
import { IUserRepository } from '../models/user/interface';
import validator from '../libs/validator/validator';
import { container } from '../libs/ioc/ioc';

@ApiPath({
    name: 'User',
    path: '/users'
    // security: { basicAuth: [] }
})
@controller('/users')
export default class UserController {
    public TAG_NAME: string = 'UserController';

    @inject(TYPES.UserService) private userService: IUserService;
    @inject(TYPES.AuthService) private authService: IAuthService;
    @inject(TYPES.ValidatorService) private validatorService: IValidatorService;
    @inject(TYPES.ConfigServie) private configService: IConfigService;
    @inject(TYPES.UserRepository) private userRepository: IUserRepository;

    @ApiOperationPost({
        description: 'User login with credentials',
        parameters: {
            body: {
                properties: {
                    email: {
                        required: true,
                        type: 'string'
                    },
                    password: {
                        required: true,
                        type: 'string'
                    },
                    type: {
                        required: true,
                        type: 'string'
                    }
                }
            }
        },
        path: '/login',
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        summary: 'User login'
    })
    @httpPost('/login')
    public async login(req) {
        return this.authService.authenticateCredentials(req);
    }

    @ApiOperationGet({
        description: 'Get user profile',
        parameters: {},
        path: '/profile',
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        security: {
            apiKeyHeader: ['Authorization']
        },
        summary: 'Get user profile object'
    })
    @httpGet('/profile', TYPES.AuthService)
    public async getProfile(req) {
        return this.userService.getById(req.user._id);
    }

    @ApiOperationPut({
        description: 'Register new user',
        parameters: {
            body: {
                properties: {
                    email: {
                        required: true,
                        type: 'string'
                    },
                    name: {
                        required: true,
                        type: 'string'
                    },
                    role: {
                        required: true,
                        type: 'string'
                    }
                }
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        summary: 'Register new user'
    })
    @httpPut('/')
    public async register(req) {
        const { email, name, role } = this.validatorService.validate(
            validator.rules.object().keys({
                email: validator.rules
                    .string()
                    .email()
                    .required(),
                name: validator.rules.string().required(),
                role: validator.rules
                    .string()
                    .valid('USER', 'ADMIN')
                    .default('USER')
            }),
            req.body
        );

        if (role === 'ADMIN') {
            let isAdmin = false;
            const token = req.header('Authorization');
            if (token) {
                try {
                    const decodedToken = jwt.verify(token, this.configService.get('AUTH').secret);
                    const admin = await this.userRepository.User.findById(decodedToken._id);
                    isAdmin = admin.role === 'ADMIN';
                } catch (err) {
                    throw new UnauthorizedError(err.message);
                }
            }

            if (!isAdmin) {
                throw new MethodNotAllowedError('Only ADMIN allowed to do that');
            }
        }

        const newUser = await this.userService.register({
            email,
            name,
            role
        });

        return {
            _id: newUser._id.toString()
        };
    }

    @httpGet('/')
    private async getUsers() {
        return this.userService.getUsers();
    }

    @httpGet('/:userId')
    private async getById(req) {
        const { userId } = this.validatorService.validate(
            validator.rules.object().keys({
                userId: validator.rules.string().required()
            }),
            req.body
        );

        return this.userService.getById(userId);
    }

    @httpDelete('/:userId')
    private async deleteById(req) {
        const { userId } = this.validatorService.validate(
            validator.rules.object().keys({
                userId: validator.rules.string().required()
            }),
            req.body
        );

        return await this.userService.deleteById(userId);
    }
}
