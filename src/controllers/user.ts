import {
  controller,
  httpDelete,
  httpGet,
  httpPost,
  httpPut
} from 'inversify-express-utils';
import * as errs from 'restify-errors';
import {
  ApiOperationGet,
  ApiOperationPost,
  ApiOperationPut,
  ApiPath,
  SwaggerDefinitionConstant
} from 'swagger-express-ts';
import TYPES from '../constant/types';
import IAuthService from '../libs/auth/interface';
import { inject } from '../libs/ioc/ioc';
import IUserService from '../services/user/interface';

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

  @ApiOperationPost({
    description: 'User login',
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
    responses: {
      200: { description: 'Success' },
      400: { description: 'Parameters fail' }
    },
    summary: 'Post new version'
  })
  @httpPost('/login')
  private async login(req, res, next) {
    try {
      return await this.authService.authenticateCredentials(req, res);
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
  private async register(req, res, next) {
    const { email, name, type } = req.body;

    return this.userService.register({
      email,
      name,
      type
    });
  }

  @ApiOperationGet({
    description: 'Get user prrofile object',
    responses: {
      200: {
        description: 'Success',
        model: 'User',
        type: SwaggerDefinitionConstant.Response.Type.ARRAY
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
