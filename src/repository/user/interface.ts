import Repository from "../generic/interface";

export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash?: string;
    status: string;
}

export type IUserRepository = Repository<User>;
