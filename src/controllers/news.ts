import { controller, httpGet, httpPost, interfaces, httpPut } from 'inversify-express-utils';
import { ApiOperationGet, ApiOperationPost, ApiPath, ApiOperationPut } from 'swagger-express-ts';
import TYPES from '../constant/types';
import { inject } from '../libs/ioc/ioc';
import INewsService from '../services/news/interface';
import IValidatorService from '../libs/validator/interface';
import validator from '../libs/validator/validator';

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

    @ApiOperationPut({
        description: 'Create news',
        parameters: {
            body: {
                properties: {
                    name: {
                        required: true,
                        type: 'string'
                    },
                    text: {
                        required: true,
                        type: 'string'
                    }
                }
            },
            path: {
                newsId: {
                    description: 'News id',
                    required: true
                }
            }
        },
        path: '/',
        responses: {
            200: { description: 'Success' },
            409: { description: 'Parameters fail' }
        },
        summary: 'Create news'
    })
    @httpPut('/', TYPES.AuthService)
    public async putById(req) {
        const body = this.validatorService.validate(
            validator.rules.object().keys({
                name: validator.rules.string().required(),
                text: validator.rules.string().required()
            }),
            req.body
        );

        return this.newsService.create(body);
    }
}
