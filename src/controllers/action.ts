import { controller, httpGet, httpPost, interfaces } from 'inversify-express-utils';
import { ApiOperationPost, ApiPath } from 'swagger-express-ts';
import TYPES from '../constant/types';
import { inject } from '../libs/ioc/ioc';
import IActionService from '../services/action/interface';

@ApiPath({
    name: 'Action',
    path: '/actions',
    security: { basicAuth: [] }
})
@controller('/actions')
export default class ActionController implements interfaces.Controller {
    public TAG_NAME: string = 'ActionController';

    @inject(TYPES.ActionService) private actionService: IActionService;

    @ApiOperationPost({
        description: 'Get action object',
        parameters: {
            body: {
                description: 'Register user',
                model: 'Action',
                required: true
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        summary: 'Get action'
    })
    @httpGet('/:id')
    private async getById(req) {
        const { id } = req.params;
        return this.actionService.getById(id);
    }

    @ApiOperationPost({
        description: 'Perform action',
        parameters: {
            body: {
                description: 'Action',
                model: 'Action',
                required: true
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        summary: 'Perform action'
    })
    @httpPost('/:id')
    private async putById(req) {
        const {
            body,
            params: { id: actionId }
        } = req;

        return this.actionService.updateById(actionId, body);
    }
}
