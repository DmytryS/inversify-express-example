interface IUserService {
    login(email: string, password: string): Promise<object>
    profile(id: string): Promise<object>;
    register(userData): Promise<object>;
    getUsers(): Promise<Array<object>>;
    create(data: object): Promise<object>;
    deleteById(id: string): Promise<void>;
    updateById(id: string, data: object): Promise<object>;
}

export default IUserService;
