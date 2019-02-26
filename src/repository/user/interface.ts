import Repository from "../generic/interface";

export interface IUser {
    id?: string;
    name: string;
    email: string;
    passwordHash?: string;
    type: string;
    status: string;
    isValidPassword(candidatePassword: string): Promise<Boolean>;
    setPassword(password: string): Promise<void>;
}

export type IUserRepository = Repository<IUser>;
