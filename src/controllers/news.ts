import { controller, httpGet, httpPost, interfaces } from 'inversify-express-utils';
import { ApiOperationGet, ApiOperationPost, ApiPath } from 'swagger-express-ts';
import TYPES from '../constant/types';
import { inject } from '../libs/ioc/ioc';
import INewsService from '../services/news/interface';

@ApiPath({
    name: 'News',
    path: '/news',
    security: { basicAuth: [] }
})
@controller('/news')
export default class NewsController implements interfaces.Controller {
    public TAG_NAME: string = 'NewsController';

    @inject(TYPES.NewsService) private newsService: INewsService;

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

        return this.newsService.updateById(actionId, body);
    }
}