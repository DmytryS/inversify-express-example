import { prop, Typegoose, ModelType } from 'typegoose';

export default interface IAction  {
    id?: string;
    userId: string;
    type: string;
    status: string;
    setUsed?(): Promise<IAction>;
}

export type IActionModel = ModelType<IAction>;
