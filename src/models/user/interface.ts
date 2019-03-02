import { prop, Typegoose, ModelType } from 'typegoose';

export default interface IUser {
    id?: string;
    name: string;
    email: string;
    passwordHash?: string;
    type: type;
    status: status;
}

export type status = 'ACTIVE' | 'PENDING';
export type type = 'DRIVER' | 'RIDER' | 'ADMIN';

export type IUserModel = ModelType<IUser>;
