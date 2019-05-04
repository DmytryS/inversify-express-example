import { NotFoundError } from 'restify-errors';
import TYPES from '../../constant/types';
import { inject, ProvideSingleton } from '../../libs/ioc/ioc';
import { INewsRepository, INewsModel } from '../../models/news/interface';
import INewsService from './interface';
import { dumpNews } from '../../utils/dump';

@ProvideSingleton(TYPES.NewsService)
export default class NewsService implements INewsService {
    @inject(TYPES.NewsRepository) private newsRepository: INewsRepository;

    public async getById(newsId: string) {
        const news = await this.checkIfNewsExists(newsId);

        const newsJSON = news.toJSON();

        delete newsJSON.__v;

        return newsJSON;
    }

    public async updateById(newsId: string, newsObject: object) {
        const news = await this.checkIfNewsExists(newsId);
        return Promise.resolve();
    }
    public async create(newsObject: INewsModel) {
        const news = await this.newsRepository.News(newsObject).save();
        return dumpNews(news);
    }
    public async deleteById(id: string) {
        return Promise.resolve();
    }
    public async getNews(skip: number, limit: number) {
        return [{}];
    }

    private async checkIfNewsExists(newsId: string): Promise<INewsModel> {
        const news = await this.newsRepository.News.findById(newsId);

        if (!news) {
            throw new NotFoundError(`News with id of ${newsId} not found`);
        }

        return news;
    }
}
