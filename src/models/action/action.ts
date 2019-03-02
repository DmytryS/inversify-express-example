import { prop, Typegoose, ModelType, InstanceType, instanceMethod } from 'typegoose';
import IAction from './interface';
import { ProvideSingleton, inject } from '../../libs/ioc/ioc';
import TYPES from '../../constant/types';
import IConfigService from '../../libs/config/interface';

@ProvideSingleton(TYPES.ActionModel)
export class Action extends Typegoose implements ModelType<IAction> {
    private _config;

    constructor(
        @inject(TYPES.ConfigServie) config: IConfigService
    ) {
        super();
        this._config = config.get('AUTH');
    }

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

export type status = 'ACTIVE' | 'USED';
export type type = 'REGISTER' | 'RESET_PASSWORD';
