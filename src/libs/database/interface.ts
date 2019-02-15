export default interface IDatabase {
    connect(): Promise<void>;
    close(): Promise<any>;
    clear(): Promise<any>;
}
