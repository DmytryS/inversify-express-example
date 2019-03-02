import {
    controller, httpDelete, httpGet, httpPost, httpPut, interfaces
} from 'inversify-express-utils';

import TYPES from '../constant/types'
import { inject } from '../libs/ioc/ioc';
import IActionService from '../services/action/interface';

@controller('/actions')
export default class ActionController implements interfaces.Controller {
    public TAG_NAME: string = 'ActionController';

    @inject(TYPES.ActionService) private actionService: IActionService

    @httpGet('/:id')
    private async getById(req) {
        const { id } = req.params;
        return this.actionService.getById(id);
    }

    @httpPut('/:id')
    private async putById(req) {
        const { body, params: { id: actionId } } = req;

        return this.actionService.updateById(actionId, body);
    }
}
