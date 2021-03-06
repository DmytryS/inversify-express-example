export default interface IUserService {
    resetPassword(email: string): Promise<void>;
    register(userData: object): Promise<any>;
    getUsers(skip: number, limit: number, role: string): Promise<object[]>;
    getById(id: string): Promise<object>;
    deleteById(id: string): Promise<void>;
    updateById(id: string, data: object): Promise<object>;
}
