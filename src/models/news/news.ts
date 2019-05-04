import { ApiModel, ApiModelProperty } from 'swagger-express-ts';
import { instanceMethod, InstanceType, ModelType, prop, Typegoose } from 'typegoose';
import TYPES from '../../constant/types';
import { provide } from '../../libs/ioc/ioc';
import INews from './interface';

@ApiModel({
    description: 'News description',
    name: 'News'
})
class News extends Typegoose implements ModelType<INews> {
    @prop({ required: true })
    @ApiModelProperty({
        description: 'News header',
        example: ['The NEWS'],
        required: true,
        type: 'string'
    })
    public name: string;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'News text',
        example: ['Some text'],
        required: true,
        type: 'string'
    })
    public text: string;
}

@provide(TYPES.NewsRepository)
// tslint:disable-next-line
export default class NewsRepository {
    public News;

    constructor() {
        this.News = new News().getModelForClass(News);
    }
}
