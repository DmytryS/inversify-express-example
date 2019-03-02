import {
    controller, httpDelete, httpGet, httpPost, httpPut
} from 'inversify-express-utils';
import * as errs from 'restify-errors';
import TYPES from '../constant/types';
import { inject } from '../libs/ioc/ioc';
import IUserService from '../services/user/interface';
import { ApiPath, ApiOperationGet, ApiOperationPost, SwaggerDefinitionConstant } from 'swagger-express-ts';

@ApiPath({
    path: "/users",
    name: "User",
    security: { basicAuth: [] }
})
@controller('/users')
export default class UserController {
    public TAG_NAME: string = 'UserController';

    @inject(TYPES.UserService) private userService: IUserService

    @ApiOperationPost({
        description: 'Post version object login',
        summary: 'Post new version',
        parameters: {
            body: {
                description: 'Register user',
                required: true,
                model: 'User'
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        }
    })
    @httpPost('/login')
    private async login(req, res, next) {
        const { body } = req;
        try {
            return await this.userService.login(body.email, body.password);
        } catch (e) {
            if (e.login_fail) {
                return next(new errs.UnauthorizedError(e.message));
            }
            throw e;
        }
    }

    @ApiOperationPost({
        description: 'Register new user',
        summary: 'Register new user',
        parameters: {
            body: {
                description: 'User',
                required: true,
                model: 'User'
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        }
    })
    @httpPost('/register')
    private async register(req, res, next) {
        const { body } = req;

        return this.userService.register({
            email: body.email,
            name: body.name
        });
    }

    @ApiOperationGet({
        description: 'Get user prrofile object',
        summary: 'Get user prrofile',
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'User'
            }
        },
        security: {
            apiKeyHeader: []
        }
    })
    @httpGet('/profile')
    private async profile(req) {
        return this.userService.profile(req.decoded._id);
    }

    @httpGet('/')
    private async getUsers() {
        return this.userService.getUsers();
    }

    @httpGet('/:id')
    private async getById(req) {
        const { id } = req.params;
        return this.userService.profile(id);
    }

    @httpDelete('/:id')
    private async deleteById(req, res) {
        const { id } = req.params;
        await this.userService.deleteById(id);
        res.status(204);
        res.send();
    }

    @httpPut('/:id')
    private async putById(req) {
        const { id } = req.params;
        const { body } = req;

        return this.userService.updateById(id, body);
    }
}
