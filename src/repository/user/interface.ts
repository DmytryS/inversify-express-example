import { ApiModel, ApiModelProperty } from 'swagger-express-ts';
import Repository from "../generic/interface";

export interface IUser {

    id?: string;
    name: string;
    email: string;
    passwordHash?: string;
    type: type;
    status: status;
}

export type status = 'ACTIVE' | 'PENDING';
export type type = 'DRIVER' | 'RIDER' | 'ADMIN';

export type IUserRepository = Repository<IUser>;
