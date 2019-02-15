export default interface ILogger {
    error(msg: any): void;
    info(msg: any): void;
    debug(msg: any): void;
}