import { prop, Typegoose, ModelType, InstanceType, instanceMethod } from 'typegoose';
import IAction from './interface';
import { provide } from '../../libs/ioc/ioc';
import TYPES from '../../constant/types';

export type status = 'ACTIVE' | 'USED';
export type type = 'REGISTER' | 'RESET_PASSWORD';

class Action extends Typegoose implements ModelType<IAction> {
    @prop()
    userId: string;
    @prop()
    type: string;
    @prop()
    status: string;

    /**
     * Sets action status to 'USER'
     * @returns {Promise<IAction>} promise which will be resolved when action updated
     */
    @instanceMethod
    async setUsed(this: InstanceType<Action> & typeof Action) {
        this.status = 'USED';
        return this.save();
    }
}

@provide(TYPES.ActionModel)
export default class ActionRepository {
    public Action;

    constructor() {
        this.Action = new Action().getModelForClass(Action);
    }
}
