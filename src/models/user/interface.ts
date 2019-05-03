import { ModelType } from 'typegoose';

export default interface IUser {
    id?: string;
    name: string;
    email: string;
    passwordHash?: string;
    role: userRole;
    status: status;
}

export type status = 'ACTIVE' | 'PENDING';
export type userRole = 'USER' | 'ADMIN';

export type IUserModel = ModelType<IUser>;

export interface IUserRepository {
    User: IUserModel;
}
