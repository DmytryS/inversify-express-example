export default interface UserRepo {
    findById(id): Promise<object>;
    findByAssigneeId(assigneeId: string);
    findAll(): Promise<Array<object>>;
    create(data: object): Promise<object>;
    updateById(id, data: object): Promise<object>;
    deleteById(id): Promise<void>;
}
