import 'reflect-metadata';
import { interfaces, controller, httpDelete, httpGet, httpPost, httpPut, TYPE } from 'inversify-express-utils';
import { MethodNotAllowedError, UnauthorizedError } from 'restify-errors';
import * as jwt from 'jsonwebtoken';
import { ApiOperationGet, ApiOperationPost, ApiOperationPut, ApiPath, ApiOperationDelete } from 'swagger-express-ts';
import TYPES from '../constant/types';
import IAuthService from '../libs/auth/interface';
import IValidatorService from '../libs/validator/interface';
import { inject } from '../libs/ioc/ioc';
import IUserService from '../services/user/interface';
import IConfigService from '../libs/config/interface';
import { IUserRepository } from '../models/user/interface';
import validator from '../libs/validator/validator';

@ApiPath({
    name: 'User',
    path: '/users'
})
@controller('/users')
export default class UserController implements interfaces.Controller {
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
            409: { description: 'Parameters fail' }
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
            401: { description: 'Unauthorized' },
            409: { description: 'Parameters fail' }
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
        path: '/',
        responses: {
            200: { description: 'Success' },
            409: { description: 'Parameters fail' }
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

    @ApiOperationPost({
        description: 'Reset user password',
        parameters: {
            body: {
                properties: {
                    email: {
                        required: true,
                        type: 'string'
                    }
                }
            }
        },
        path: '/reset-password',
        responses: {
            204: { description: 'Success' },
            409: { description: 'Parameters fail' },
            404: { description: 'User not exist' }
        },
        summary: 'Reset user password'
    })
    @httpPost('/reset-password')
    public async resetPassword(req) {
        const { email } = this.validatorService.validate(
            validator.rules.object().keys({
                email: validator.rules
                    .string()
                    .email()
                    .required()
            }),
            req.body
        );
        return this.userService.resetPassword(email);
    }

    @ApiOperationGet({
        description: 'Get users',
        parameters: {
            query: {
                limit: {
                    required: false,
                    type: 'number'
                },
                role: {
                    required: false,
                    type: 'string'
                },
                skip: {
                    required: false,
                    type: 'number'
                }
            }
        },
        path: '/',
        responses: {
            200: { description: 'Success' },
            401: { description: 'Unauthorized' },
            405: { description: 'Not allowed' },
            409: { description: 'Parameters fail' }
        },
        security: { apiKeyHeader: ['Authorization'] },
        summary: 'Get list of users'
    })
    @httpGet('/', TYPES.AuthService)
    public async getUsers(req) {
        const { skip, limit, role } = this.validatorService.validate(
            validator.rules.object().keys({
                limit: validator.rules
                    .number()
                    .integer()
                    .min(1),
                role: validator.rules.string().valid('USER', 'ADMIN'),
                skip: validator.rules
                    .number()
                    .integer()
                    .min(0)
            }),
            req.query
        );

        if (req.user.role !== 'ADMIN') {
            throw new MethodNotAllowedError('Only admin allowed to that');
        }

        return this.userService.getUsers(skip, limit, role);
    }

    @ApiOperationGet({
        description: 'Get users',
        parameters: {
            query: {
                limit: {
                    required: false,
                    type: 'number'
                },
                role: {
                    required: false,
                    type: 'string'
                },
                skip: {
                    required: false,
                    type: 'number'
                }
            }
        },
        path: '/{userId}',
        responses: {
            200: { description: 'Success' },
            401: { description: 'Unauthorized' },
            404: { description: 'User not found' },
            405: { description: 'Not allowed' }
        },
        security: { apiKeyHeader: ['Authorization'] },
        summary: 'Get list of users'
    })
    @httpGet('/:userId', TYPES.AuthService)
    public async getById(req) {
        const { userId } = this.validatorService.validate(
            validator.rules.object().keys({
                userId: validator.rules.string().required()
            }),
            req.params
        );

        if (req.user.role !== 'ADMIN') {
            throw new MethodNotAllowedError('Only admin allowed to that');
        }

        return this.userService.getById(userId);
    }

    @ApiOperationDelete({
        description: 'Delete user',
        parameters: {
            path: {
                userId: {
                    required: true,
                    type: 'string'
                }
            }
        },
        path: '/{userId}',
        responses: {
            204: { description: 'Success' },
            401: { description: 'Unauthorized' },
            404: { description: 'User not found' },
            405: { description: 'Not allowed' }
        },
        security: { apiKeyHeader: ['Authorization'] },
        summary: 'Delete user by id'
    })
    @httpDelete('/:userId', TYPES.AuthService)
    public async deleteById(req) {
        const { userId } = this.validatorService.validate(
            validator.rules.object().keys({
                userId: validator.rules.string().required()
            }),
            req.params
        );

        if (req.user.role !== 'ADMIN') {
            throw new MethodNotAllowedError('Only admin allowed to that');
        }

        return this.userService.deleteById(userId);
    }

    @ApiOperationPost({
        description: 'Update user',
        parameters: {
            body: {
                properties: {
                    name: {
                        required: true,
                        type: 'string'
                    }
                }
            },
            path: {
                userId: {
                    required: true,
                    type: 'string'
                }
            }
        },
        path: '/{userId}',
        responses: {
            200: { description: 'Success' },
            401: { description: 'Unauthorized' },
            404: { description: 'User not found' },
            405: { description: 'Not allowed' }
        },
        security: { apiKeyHeader: ['Authorization'] },
        summary: 'Update user by id'
    })
    @httpPost('/:userId', TYPES.AuthService)
    public async updateById(req) {
        const body = this.validatorService.validate(
            validator.rules.object().keys({
                name: validator.rules.string().required(),
                status: validator.rules.string().valid('BLOCKED')
            }),
            req.body
        );
        const { userId } = this.validatorService.validate(
            validator.rules.object().keys({
                userId: validator.rules.string().required()
            }),
            req.params
        );

        if (req.user.role !== 'ADMIN') {
            throw new MethodNotAllowedError('Only admin allowed to that');
        }

        return this.userService.updateById(userId, body);
    }
}
