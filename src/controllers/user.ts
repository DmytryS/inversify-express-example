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

@ApiPath({
    name: 'User',
    path: '/users',
    security: { basicAuth: [] }
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
    public async login(req, res, next) {
        try {
            const data = await this.authService.authenticateCredentials(req);

            res.json(data);
        } catch (err) {
            return next(err);
        }
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
            apiKeyHeader: ['Authorize']
        },
        summary: 'Get user prrofile object'
    })
    // @httpGet('/profile', TYPES.ActionService)
    public async getProfile(req, res, next) {
        try {
            const data = await this.userService.getProfile(req.user._id);

            res.json(data);
        } catch (err) {
            return next(err);
        }
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
    public async register(req, res, next) {
        try {
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
                req.body,
                next
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

            res.json({
                _id: newUser._id.toString()
            });
        } catch (err) {
            return next(err);
        }
    }

    // @httpGet('/')
    // private async getUsers() {
    //     return this.userService.getUsers();
    // }

    // @httpGet('/:id')
    // private async getById(req) {
    //     const { id } = req.params;
    //     return this.userService.profile(id);
    // }

    // @httpDelete('/:id')
    // private async deleteById(req, res) {
    //     const { id } = req.params;
    //     await this.userService.deleteById(id);
    //     res.status(204);
    //     res.send();
    // }
}
