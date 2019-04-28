export default interface IConfigService {
    get(k?: string): any;
    has(k: string): boolean;
    setConfig(configuration: any): void;
}
