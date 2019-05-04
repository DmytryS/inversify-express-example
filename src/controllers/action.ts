import { controller, httpGet, httpPost, interfaces } from 'inversify-express-utils';
import { ApiOperationGet, ApiOperationPost, ApiPath } from 'swagger-express-ts';
import TYPES from '../constant/types';
import { inject } from '../libs/ioc/ioc';
import IActionService from '../services/action/interface';
import IValidatorService from '../libs/validator/interface';
import validator from '../libs/validator/validator';

@ApiPath({
    name: 'Action',
    path: '/actions',
    security: { basicAuth: [] }
})
@controller('/actions')
export default class ActionController implements interfaces.Controller {
    public TAG_NAME: string = 'ActionController';

    @inject(TYPES.ActionService) private actionService: IActionService;
    @inject(TYPES.ValidatorService) private validatorService: IValidatorService;

    @ApiOperationGet({
        description: 'Get action object',
        parameters: {
            path: {
                actionId: {
                    description: 'Action id',
                    required: true
                }
            }
        },
        path: '/{actionId}',
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' },
            404: { description: 'Action not exist' }
        },
        summary: 'Get action'
    })
    @httpGet('/:actionId')
    public async getById(req) {
        const { actionId } = this.validatorService.validate(
            validator.rules.object().keys({
                actionId: validator.rules.string().required()
            }),
            req.params
        );

        return this.actionService.getById(actionId);
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
                actionId: {
                    description: 'Action id',
                    required: true
                }
            }
        },
        path: '/{actionId}',
        responses: {
            200: { description: 'Success' },
            400: { description: 'Parameters fail' },
            404: { description: 'Action not exist' }
        },
        summary: 'Perform action'
    })
    @httpPost('/:actionId')
    public async putById(req) {
        const body = this.validatorService.validate(
            validator.rules.object().keys({
                password: validator.rules.string().required()
            }),
            req.body
        );
        const { actionId } = this.validatorService.validate(
            validator.rules.object().keys({
                actionId: validator.rules.string().required()
            }),
            req.params
        );

        return this.actionService.updateById(actionId, body);
    }
}
