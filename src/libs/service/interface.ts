export default interface IService {
    start(): Promise<void>;
    stop(): Promise<void>;
    clearDb(): Promise<void>;
}
