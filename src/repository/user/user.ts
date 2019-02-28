import 'reflect-metadata';
import { injectable } from 'inversify';
import bcrypt from 'bcrypt';
import * as m from "mongoose";
import IDatabase from '../../libs/database/interface';
import GenericRepository from '../generic/generic';
import { IUserRepository as IUserRepository, IUser } from './interface';
import IConfig from '../../libs/config/interface';
import { database, config } from '../../constant/decorators';

export interface IUserModel extends IUser, Document { }

class UserModel {
    private _userModel: IUserModel;

    /**
     * Checks user password
     * @param {String} candidatePassword candidate password
     * @returns {Promise<Boolean>} promise which will be resolved when password compared
     */
    async isValidPassword(candidatePassword) {
        if (!candidatePassword) {
            return false;
        }
        if (!this._userModel.passwordHash) {
            return false;
        }
        return await bcrypt.compare(candidatePassword, this._userModel.passwordHash);
    }

    /**
     * Sets user password
     * @param {String} password password to set
     * @returns {Promise<>} promise which will be resolved when password set
     */
    async setPassword(password) {
        if (password) {
            this._userModel.passwordHash = await bcrypt.hash(password, this._config.saltRounds);
        } else {
            this._userModel.passwordHash = undefined;
        }
        return this._userModel.save();
    }
}

@injectable()
export default class UserRepository
    extends GenericRepository<IUser, IUserModel>
    implements IUserRepository {
        private _config;

    public constructor(
        @database private databse: IDatabase,
        @config config: IConfig
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
            },
            UserModel
        );
        this._config = config.get('AUTH');
    }

    // /**
    //  * Checks user password
    //  * @param {String} candidatePassword candidate password
    //  * @returns {Promise<Boolean>} promise which will be resolved when password compared
    //  */
    // async isValidPassword(candidatePassword) {
    //     if (!candidatePassword) {
    //         return false;
    //     }
    //     if (!this.passwordHash) {
    //         return false;
    //     }
    //     return await bcrypt.compare(candidatePassword, this.passwordHash);
    // }

    // /**
    //  * Sets user password
    //  * @param {String} password password to set
    //  * @returns {Promise<>} promise which will be resolved when password set
    //  */
    // async setPassword(password) {
    //     if (password) {
    //         this.passwordHash = await bcrypt.hash(password, this._config.saltRounds);
    //     } else {
    //         this.passwordHash = undefined;
    //     }
    //     return this.save();
    // }
}
