import {
    controller, httpGet, httpPost, httpPut, httpDelete
} from 'inversify-express-utils';
import { inject } from '../libs/ioc/ioc';
import * as errs from 'restify-errors';
import IUserService from '../services/user/interface';
import TYPES from '../constant/types';

@controller('/users')
export default class UserController {
    public TAG_NAME: string = 'UserController';

    @inject(TYPES.UserService) private userService: IUserService

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

    @httpPost('/register')
    private async register(req, res, next) {
        const { body } = req;

        return await this.userService.register({
            name: body.name,
            email: body.email
        });
    }

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
        console.log('Data is', body);
        return this.userService.updateById(id, body);
    }
}
