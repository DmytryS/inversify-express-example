import 'reflect-metadata';
import { injectable } from 'inversify';
import IDatabase from '../../libs/database/interface';
import GenericRepository from '../generic/generic';
import { IUserRepository as IUserRepository, IUser } from './interface';
import { database } from '../../constant/decorators';

export interface UserModel extends IUser, Document { }

@injectable()
export default class UserRepository
    extends GenericRepository<IUser, UserModel>
    implements IUserRepository {

    public constructor(
        @database private databse: IDatabase,
    ) {
        super(
            databse,
            'Users',
            {
                name: {
                    type: String,
                    required: true
                },
                email: {
                    type: String,
                    lowercase: true,
                    unique: true,
                    required: true
                },
                passwordHash: {
                    type: String
                },
                type: {
                    type: String,
                    enum: {
                        values: ['DRIVER', 'RIDER', 'ADMIN'],
                        message: 'Status must be either of \'DRIVER\', \'RIDER\', \'ADMIN\''
                    },
                    required: true,
                },
                status: {
                    type: String,
                    enum: {
                        values: ['ACTIVE', 'PENDING'],
                        message: 'Status must be either of \'ACTIVE\', \'PENDING\''
                    },
                    required: true,
                    default: 'PENDING'
                }
            }
        );
    }
}
