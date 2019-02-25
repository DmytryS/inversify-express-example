export default interface AuthService {
    getUserPreferences(): Promise<void>;
    close(): Promise<any>;
    clear(): Promise<any>;
}
