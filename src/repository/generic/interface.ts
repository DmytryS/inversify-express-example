export type Query<T> = {
    [P in keyof T]?: T[P] | { $regex: RegExp };
};

export default interface Repository<T> {
    findById(id: string): Promise<T>;
    findOne(query?: Query<T>): Promise<T>;
    findAll(query?: Query<T>): Promise<Array<T>>;
    create(data: T): Promise<T>;
    updateById(id: string, data: object): Promise<T>;
    deleteById(id: string): Promise<void>;
}
