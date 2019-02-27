import 'reflect-metadata';
import { injectable } from 'inversify';
import IDatabase from '../../libs/database/interface';
import GenericRepository from '../generic/generic';
import { IActionRepository, IAction } from './interface';
import { database } from '../../constant/decorators';

export interface ActionModel extends IAction, Document { }

@injectable()
export default class ActionRepository
    extends GenericRepository<IAction, ActionModel>
    implements IActionRepository {

    public constructor(
        @database private databse: IDatabase,
    ) {
        super(
            databse,
            'Actions',
            {
                userId: {
                    type: String,
                    ref: 'Users',
                    required: true
                },
                type: {
                    type: String,
                    enum: {
                        values: ['REGISTER', 'RESET_PASSWORD'],
                        message: 'Action type must be either of \'REGISTER\', \'RESET_PASSWORD\''
                    },
                    required: true
                },
                status: {
                    type: String,
                    enum: {
                        values: ['ACTIVE', 'USED'],
                        message: 'Status must be either of \'ACTIVE\', \'PENDING\''
                    },
                    required: true,
                    default: 'ACTIVE'
                }
            }
        );
    }

    /**
     * Sets action status to 'USER'
     * @returns {Promise<IAction>} promise which will be resolved when action updated
     */
    async setUsed() {
        this.status = 'USED';
        return this.save();
    }
}
