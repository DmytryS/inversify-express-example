import * as err from 'restify-errors';
import TYPES from '../../constant/types';
import IConfig from '../../libs/config/interface';
import { inject, ProvideSingleton } from '../../libs/ioc/ioc';
import { INewsRepository } from '../../models/news/interface';
import INewsService from './interface';

@ProvideSingleton(TYPES.NewsService)
export default class NewsService implements INewsService {
    private config;

    constructor(
        @inject(TYPES.ConfigServie) configService: IConfig,
        @inject(TYPES.NewsRepository) private newsRepository: INewsRepository
    ) {
        this.config = configService.get('AUTH');
    }

    public async getById(actionId: string) {
        const action = await this.newsRepository.News.findById(actionId);

        if (!action) {
            throw new err.NotFoundError(`Action with id of ${actionId}`);
        }

        return action;
    }

    public async updateById(id: string, data: object) {
        return Promise.resolve();
    }
    public async create() {
        return {};
    }
    public async deleteById(id: string) {
        return Promise.resolve();
    }
    public async getNews(skip: number, limit: number) {
        return [{}];
    }
}
