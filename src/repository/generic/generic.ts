import { injectable, unmanaged } from "inversify";
import { Schema, Document, Model, SchemaDefinition } from "mongoose";
import IDatabase from "../../libs/database/interface";
import Repository, { Query } from "./interface";
import { database } from '../../constant/decorators';

@injectable()
export default class GenericRepository<TEntity, TModel extends Document>
    implements Repository<TEntity> {

    private _name: string;
    private _dbTypes;
    protected Model: Model<TModel>;

    public constructor(
        @database private database: IDatabase,
        @unmanaged() name: string,
        @unmanaged() schemaDefinition: SchemaDefinition
    ) {
        this._name = name;
        this._dbTypes = database.mongoose.types;
        const schema = new Schema(schemaDefinition, { collection: this._name });
        this.Model = database.mongoose.model<TModel>(this._name, schema);
    }

    private toObjectId(value) {
        return new this._dbTypes.ObjectId(value);
    }

    public async findById(id: string) {
        return this.Model.findById(id);
    }

    public async findOne(query: Query<TEntity>) {
        return this.Model.findOne(query);
    }

    public async findAll(query: Query<TEntity>) {
        return this.Model.findAll(query);
    }

    public async create(data: TEntity) {
        const instance = await this.Model.create(data);
        return instance;
    }

    public async updateById(id: string, data: object) {
        return this.Model.findOneAndUpdate(
            {
                _id: this.toObjectId(id)
            },
            {
                $set: data
            },
            {
                returnNewDocument: true
            }
        );
    }

    public async deleteById(id: string) {
        return this.Model.findOneAndDelete({
            _id: this.toObjectId(id)
        });
    }

    // private _readMapper(model: TModel) {
    //     const obj: any = model.toJSON();
    //     Object.defineProperty(obj, "id", Object.getOwnPropertyDescriptor(obj, "_id"));
    //     delete obj["_id"];
    //     return obj as TEntity;
    // }

}
