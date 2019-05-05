import { controller, httpGet, httpPost, interfaces, httpPut, httpDelete } from 'inversify-express-utils';
import { ApiOperationGet, ApiOperationPost, ApiPath, ApiOperationPut, ApiOperationDelete } from 'swagger-express-ts';
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
        security: { apiKeyHeader: ['Authorization'] },
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
        security: { apiKeyHeader: ['Authorization'] },
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

    @ApiOperationDelete({
        description: 'Delete news object',
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
            204: { description: 'Success' },
            401: { description: 'Unauthorized' },
            404: { description: 'News not exist' }
        },
        security: { apiKeyHeader: ['Authorization'] },
        summary: 'Delete news by id'
    })
    @httpDelete('/:newsId', TYPES.AuthService)
    public async deleteById(req) {
        const { newsId } = req.params;

        return this.newsService.deleteById(newsId);
    }

    @ApiOperationPost({
        description: 'Update news object',
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
        path: '/{newsId}',
        responses: {
            204: { description: 'Success' },
            401: { description: 'Unauthorized' },
            404: { description: 'News not exist' },
            409: { description: 'Parameters fail' }
        },
        security: { apiKeyHeader: ['Authorization'] },
        summary: 'Update news by id'
    })
    @httpPost('/:newsId', TYPES.AuthService)
    public async updateById(req) {
        const body = this.validatorService.validate(
            validator.rules.object().keys({
                name: validator.rules.string().required(),
                text: validator.rules.string().required()
            }),
            req.body
        );
        const { newsId } = req.params;

        return this.newsService.updateById(newsId, body);
    }

    @ApiOperationGet({
        description: 'Get news list',
        parameters: {
            query: {
                limit: {
                    required: false,
                    type: 'number'
                },
                skip: {
                    required: false,
                    type: 'number'
                }
            }
        },
        path: '/',
        responses: {
            200: { description: 'Success' },
            401: { description: 'Unauthorized' },
            409: { description: 'Parameters fail' }
        },
        security: { apiKeyHeader: ['Authorization'] },
        summary: 'Get paginated list of news'
    })
    @httpGet('/', TYPES.AuthService)
    public async getNews(req) {
        const { skip, limit } = this.validatorService.validate(
            validator.rules.object().keys({
                limit: validator.rules
                    .number()
                    .integer()
                    .min(1),
                skip: validator.rules
                    .number()
                    .integer()
                    .min(0)
            }),
            req.query
        );

        return this.newsService.getNews(skip, limit);
    }
}
