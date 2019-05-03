export default interface IUserService {
    login(email: string, password: string, userType: string): Promise<object>;
    getProfile(id: string): Promise<object>;
    register(userData: object): Promise<any>;
    getUsers(): Promise<object[]>;
    deleteById(id: string): Promise<void>;
    updateById(id: string, data: object): Promise<object>;
}
