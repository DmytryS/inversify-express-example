import { prop, Typegoose, ModelType } from 'typegoose';
import IUser from './interface';
import { ProvideSingleton, inject } from '../../libs/ioc/ioc';
import TYPES from '../../constant/types';

@ProvideSingleton(TYPES.UserRepository)
export class User extends Typegoose implements ModelType<IUser> {
    @prop()
    name: string;
    @prop()
    email: string;
    @prop()
    passwordHash: string;
    @prop()
    type: type;
    @prop()
    status: status;
}

export type status = 'ACTIVE' | 'PENDING';
export type type = 'DRIVER' | 'RIDER' | 'ADMIN';
