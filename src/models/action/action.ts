import { instanceMethod, InstanceType, ModelType, prop, Typegoose } from 'typegoose';
import TYPES from '../../constant/types';
import { provide } from '../../libs/ioc/ioc';
import IAction from './interface';

export type status = 'ACTIVE' | 'USED';
export type type = 'REGISTER' | 'RESET_PASSWORD';

class Action extends Typegoose implements ModelType<IAction> {
    @prop()
    public userId: string;
    @prop()
    public type: string;
    @prop()
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
