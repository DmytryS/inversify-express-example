import { controller, httpGet, httpPost, interfaces } from 'inversify-express-utils';
import { ApiOperationGet, ApiOperationPost, ApiPath } from 'swagger-express-ts';
import TYPES from '../constant/types';
import { inject } from '../libs/ioc/ioc';
import INewsService from '../services/news/interface';
import IValidatorService from '../libs/validator/interface';

@ApiPath({
    name: 'News',
    path: '/news'
})
@controller('/news')
export default class NewsController implements interfaces.Controller {
    public TAG_NAME: string = 'NewsController';

    @inject(TYPES.NewsService) private newsService: INewsService;
    @inject(TYPES.ValidatorService) private validatorService: IValidatorService;

    @ApiOperationGet({
        description: 'Get news object',
        parameters: {
            path: {
                newsId: {
                    description: 'News id',
                    required: true
                }
            }
        },
        path: '/{newsId}',
        responses: {
            200: { description: 'Success' },
            401: { description: 'Unauthorized' },
            404: { description: 'News not exist' }
        },
        summary: 'Get action'
    })
    @httpGet('/:newsId', TYPES.AuthService)
    public async getById(req) {
        const { newsId } = req.params;

        return this.newsService.getById(newsId);
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
