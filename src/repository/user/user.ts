import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import IDatabase from '../../libs/database/interface';
import GenericRepository from '../generic/generic';
import { UserRepository as IUserRepository, User } from './interface';
import TYPES from '../../constant/types';

export interface UserModel extends User, Document { }

@injectable()
export default class UserRepository
    extends GenericRepository<User, UserModel>
    implements IUserRepository {

    public constructor(
        @inject(TYPES.Database) private databse: IDatabase,
    ) {
        super(
            databse,
            'Users',
            {
                name: {
                    type: String,
                    unique: true,
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
