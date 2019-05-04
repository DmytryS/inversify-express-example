import { NotFoundError } from 'restify-errors';
import TYPES from '../../constant/types';
import { inject, ProvideSingleton } from '../../libs/ioc/ioc';
import INews, { INewsRepository, INewsModel } from '../../models/news/interface';
import INewsService from './interface';
import { dumpNews } from '../../utils/dump';

@ProvideSingleton(TYPES.NewsService)
export default class NewsService implements INewsService {
    @inject(TYPES.NewsRepository) private newsRepository: INewsRepository;

    public async getById(newsId: string) {
        const news = await this.checkIfNewsExists(newsId);

        return dumpNews(news);
    }

    public async create(newsObject: INewsModel) {
        const news = await this.newsRepository.News(newsObject).save();
        return dumpNews(news);
    }

    public async deleteById(newsId: string) {
        const news = await this.checkIfNewsExists(newsId);

        await news.remove();

        return;
    }

    public async updateById(newsId: string, newsObject: INews) {
        const news = await this.checkIfNewsExists(newsId);

        news.name = newsObject.name;
        news.text = newsObject.text;

        const updatedNews = await news.save();
        return dumpNews(updatedNews);
    }

    public async getNews(skip: number, limit: number) {
        const news = this.newsRepository.News.paginate(skip, limit);

        return news.map(dumpNews);
    }

    private async checkIfNewsExists(newsId: string): Promise<INewsModel> {
        const news = await this.newsRepository.News.findById(newsId);

        if (!news) {
            throw new NotFoundError(`News with id of ${newsId} not found`);
        }

        return news;
    }
}
