import Repository from "../generic/interface";

export interface IAction {
    id?: string;
    userId: string;
    type: string;
    status: string;
    setUsed(): Promise<IAction>;
}

export type IActionRepository = Repository<IAction>;
