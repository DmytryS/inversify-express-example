import {
    controller, httpDelete, httpGet, httpPost, httpPut
} from 'inversify-express-utils';
import * as errs from 'restify-errors';
import { ApiOperationGet, ApiOperationPost, ApiPath, SwaggerDefinitionConstant } from 'swagger-express-ts';
import TYPES from '../constant/types';
import { inject } from '../libs/ioc/ioc';
import IUserService from '../services/user/interface';

@ApiPath({
    name: "User",
    path: "/users",
    security: { basicAuth: [] }
})
@controller('/users')
export default class UserController {
    public TAG_NAME: string = 'UserController';

    @inject(TYPES.UserService) private userService: IUserService

    @ApiOperationPost({
        description: 'Post version object login',
        parameters: {
            body: {
                description: 'Register user',
                model: 'User',
                required: true
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        summary: 'Post new version'
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
        parameters: {
            body: {
                description: 'User',
                model: 'User',
                required: true
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        summary: 'Register new user',
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
        responses: {
            200: {
                description: 'Success',
                model: 'User',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,

            }
        },
        security: {
            apiKeyHeader: []
        },
        summary: 'Get user prrofile'
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
