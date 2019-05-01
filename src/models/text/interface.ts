import { ModelType } from 'typegoose';

export default interface IText {
    id?: string;
    newsId: string;
    text: string;
    language: string;
    getTextByNewsId?(): Promise<IText>;
}

export type ITextModel = ModelType<IText>;

export interface ITextRepository {
    Text: ITextModel;
}
