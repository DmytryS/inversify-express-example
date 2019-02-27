export default interface IConfig {
    get(k?: string): any
    has(k: string): boolean
}