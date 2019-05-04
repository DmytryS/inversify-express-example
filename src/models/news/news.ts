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
        description: 'Id of user',
        example: ['5c766d614e86ea27c61cf82a'],
        required: true,
        type: 'string'
    })
    public createdBy: string;
}

@provide(TYPES.NewsRepository)
// tslint:disable-next-line
export default class NewsRepository {
    public News;

    constructor() {
        this.News = new News().getModelForClass(News);
    }
}
