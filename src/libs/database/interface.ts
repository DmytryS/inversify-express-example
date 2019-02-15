export interface IDatabase {
    connect(): Promise<void>;
    close(): Promise<any>;
    clear(): Promise<void>;
}