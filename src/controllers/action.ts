import { controller, httpGet, httpPost, interfaces } from 'inversify-express-utils';
import { ApiOperationGet, ApiOperationPost, ApiPath } from 'swagger-express-ts';
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

    @ApiOperationGet({
        description: 'Get action object',
        parameters: {
            path: {
                actioniId: {
                    description: 'Action id',
                    required: true
                }
            }
        },
        path: '/{actioniId}',
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        summary: 'Get action'
    })
    @httpGet('/:actioniId')
    public async getById(req) {
        const { actioniId } = req.params;
        return this.actionService.getById(actioniId);
    }

    @ApiOperationPost({
        description: 'Perform action',
        parameters: {
            body: {
                properties: {
                    password: {
                        required: true,
                        type: 'string'
                    }
                }
            },
            path: {
                actioniId: {
                    description: 'Action id',
                    required: true
                }
            }
        },
        path: '/{actioniId}',
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        },
        summary: 'Perform action'
    })
    @httpPost('/:id')
    public async putById(req) {
        const {
            body,
            params: { id: actionId }
        } = req;

        return this.actionService.updateById(actionId, body);
    }
}
