export default interface IActionService {
    getById(id: string): Promise<object>;
    updateById(id: string, data: object): Promise<void>;
}
