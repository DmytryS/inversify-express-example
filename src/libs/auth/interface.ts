export default interface IAuthService {
    getUserByJWT(token: string): Promise<object>;
    getUserByCredentials(email: string, password: string): Promise<object>;
}
