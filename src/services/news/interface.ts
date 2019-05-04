export default interface INewsService {
    getById(id: string): Promise<object>;
    updateById(id: string, data: object): Promise<void>;
    create(newsData: object): Promise<object>;
    deleteById(id: string): Promise<void>;
    getNews(skip: number, limit: number): Promise<object[]>;
}
