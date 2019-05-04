import { ModelType } from 'typegoose';

export default interface INews {
    id?: string;
    createdBy: string;
}

export type INewsModel = ModelType<INews>;

export interface INewsRepository {
    News: INewsModel;
}
