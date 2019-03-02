import {
    controller, httpGet, httpPost, interfaces
} from 'inversify-express-utils';
import {
    ApiPath,
    ApiOperationGet,
    ApiOperationPost,
    SwaggerDefinitionConstant
} from 'swagger-express-ts';
import TYPES from '../constant/types'
import { inject } from '../libs/ioc/ioc';
import IActionService from '../services/action/interface';

@ApiPath({
    path: "/actions",
    name: "Action",
    security: { basicAuth: [] }
})
@controller('/actions')
export default class ActionController implements interfaces.Controller {
    public TAG_NAME: string = 'ActionController';

    @inject(TYPES.ActionService) private actionService: IActionService

    @ApiOperationPost({
        description: 'Get action object',
        summary: 'Get action',
        parameters: {
            body: {
                description: 'Register user',
                required: true,
                model: 'Action'
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        }
    })
    @httpGet('/:id')
    private async getById(req) {
        const { id } = req.params;
        return this.actionService.getById(id);
    }

    @ApiOperationPost({
        description: 'Perform action',
        summary: 'Perform action',
        parameters: {
            body: {
                description: 'Action',
                required: true,
                model: 'Action'
            }
        },
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' }
        }
    })
    @httpPost('/:id')
    private async putById(req) {
        const { body, params: { id: actionId } } = req;

        return this.actionService.updateById(actionId, body);
    }
}
