export default interface IUserService {
    login(email: string, password: string): Promise<object>
    profile(id: string): Promise<object>;
    register(userData: object): Promise<object>;
    getUsers(): Promise<Array<object>>;
    deleteById(id: string): Promise<void>;
    updateById(id: string, data: object): Promise<object>;
}
