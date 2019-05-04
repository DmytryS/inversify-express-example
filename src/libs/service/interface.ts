export default interface IService {
    server: any;
    start(): Promise<void>;
    stop(): Promise<void>;
    clearDb(): Promise<void>;
}
