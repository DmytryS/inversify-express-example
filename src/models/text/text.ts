import { ApiModel, ApiModelProperty } from 'swagger-express-ts';
import { ModelType, prop, Typegoose, instanceMethod } from 'typegoose';
import TYPES from '../../constant/types';
import { provide } from '../../libs/ioc/ioc';
import IText from './interface';

@ApiModel({
    description: 'Text description',
    name: 'Text'
})
class Text extends Typegoose implements ModelType<IText> {
    @prop({ required: true })
    @ApiModelProperty({
        description: 'News id',
        example: ['5c766d614e86ea27c61cf82a'],
        required: true,
        type: 'string'
    })
    public newsId: string;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Text',
        example: ['Some text'],
        required: true,
        type: 'string'
    })
    public text: string;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Language',
        example: ['uk', 'en'],
        required: true,
        type: 'string'
    })
    public language: string;

    /**
     * Returns text of news
     * @param {String} newsId - id of news
     * @returns {Promise<IText>} promise which will be resolved when text returned
     */
    @instanceMethod
    public async getTextByNewsId(this: InstanceType<Text> & typeof Text, newsId: string) {
        return this.find({ newsId });
    }
}

@provide(TYPES.TextModel)
// tslint:disable-next-line
export default class TextRepository {
    public Text;

    constructor() {
        this.Text = new Text().getModelForClass(Text);
    }
}
