import { ApiModel, ApiModelProperty } from 'swagger-express-ts';
import { instanceMethod, InstanceType, ModelType, prop, Typegoose } from 'typegoose';
import TYPES from '../../constant/types';
import { provide } from '../../libs/ioc/ioc';
import IAction from './interface';

export type status = 'ACTIVE' | 'USED';
export type type = 'REGISTER' | 'RESET_PASSWORD';

@ApiModel({
    description: 'Action description',
    name: 'Action'
})
class Action extends Typegoose implements ModelType<IAction> {
    @prop({ required: true })
    @ApiModelProperty({
        description: 'Id of user',
        example: ['5c766d614e86ea27c61cf82a'],
        required: true
    })
    public userId: string;
    @prop({ required: true })
    @ApiModelProperty({
        description: 'Action type',
        example: ['REGISTER', 'RESET_PASSWORD'],
        required: true
    })
    public type: string;
    @prop({ required: true })
    @ApiModelProperty({
        description: 'Action status',
        example: ['ACTIVE', 'USED'],
        required: true
    })
    public status: string;

    /**
     * Sets action status to 'USER'
     * @returns {Promise<IAction>} promise which will be resolved when action updated
     */
    @instanceMethod
    public async setUsed(this: InstanceType<Action> & typeof Action) {
        this.status = 'USED';
        return this.save();
    }
}

@provide(TYPES.ActionModel)
// tslint:disable-next-line
export default class ActionRepository {
    public Action;

    constructor() {
        this.Action = new Action().getModelForClass(Action);
    }
}
