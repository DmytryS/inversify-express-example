import { prop, Typegoose, ModelType } from 'typegoose';
import IAction from './interface';
import { ProvideSingleton, inject } from '../../libs/ioc/ioc';
import TYPES from '../../constant/types';

@ProvideSingleton(TYPES.ActionRepository)
export class Action extends Typegoose implements ModelType<IAction> {
    @prop()
    userId: string;
    @prop()
    type: string;
    @prop()
    status: string;
}

export type status = 'ACTIVE' | 'USED';
export type type = 'REGISTER' | 'RESET_PASSWORD';
