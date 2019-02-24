import 'reflect-metadata';
import { injectable } from 'inversify';
import IDatabase from '../../libs/database/interface';
import GenericRepository from '../generic/generic';
import { IActionRepository, IAction } from './interface';
import { database } from '../../constant/decorators';

export interface ActionModel extends IAction, Document { }

@injectable()
export default class UserRepository
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
                    required: true
                },
                type: {
                    type: String,
                    enum: {
                        values: ['REGISTER', 'RESET_PASSWORD', 'NOTIFICATION'],
                        message: 'Action type must be either of \'REGISTER\', \'RESET_PASSWORD\', \'NOTIFICATION\''
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
}
