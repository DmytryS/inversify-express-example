import { User as IUser } from '../../repository/user/interface';

export default interface IUserService {
    login(email: string, password: string): Promise<object>
    profile(id: string): Promise<object>;
    register(userData: IUser): Promise<object>;
    getUsers(): Promise<Array<object>>;
    deleteById(id: string): Promise<void>;
    updateById(id: string, data: object): Promise<object>;
}
