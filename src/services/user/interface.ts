export default interface IUserService {
    register(userData: object): Promise<any>;
    getUsers(): Promise<object[]>;
    getById(id: string): Promise<object>;
    deleteById(id: string): Promise<void>;
    updateById(id: string, data: object): Promise<object>;
}
