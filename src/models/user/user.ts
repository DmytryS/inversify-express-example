import * as bcrypt from 'bcrypt';
import { ApiModel, ApiModelProperty } from 'swagger-express-ts';
import { instanceMethod, InstanceType, ModelType, prop, Typegoose, staticMethod } from 'typegoose';
import TYPES from '../../constant/types';
import IConfigService from '../../libs/config/interface';
import { inject, provide } from '../../libs/ioc/ioc';
import IUser from './interface';

export type userStatus = 'ACTIVE' | 'PENDING' | 'BANNED';
export type userRole = 'USER' | 'ADMIN';

let config;

@ApiModel({
    description: 'User description',
    name: 'User'
})
class User extends Typegoose implements ModelType<IUser> {
    public static config;

    /**
     * Returns paginated users
     * @returns {Promise<Array<User>>} promise which will be resolved when users get
     */
    @staticMethod
    public static async paginate(this: InstanceType<User> & typeof User, skip: number, limit: number, role: string) {
        const filterOptions = {};

        if (role) {
            // tslint:disable-next-line
            filterOptions['role'] = role;
        }

        const users = await this.aggregate([{ $match: filterOptions }, { $skip: skip || 0 }, { $limit: limit || 30 }]);

        return users;
    }

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Name of user',
        example: ['Name Surname'],
        required: true,
        type: 'string'
    })
    public name: string;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Email of user',
        example: ['some@mail.com'],
        required: true,
        type: 'string'
    })
    public email: string;

    @prop()
    public passwordHash: string;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'User role',
        example: ['USER', 'ADMIN'],
        required: true,
        type: 'string'
    })
    public role: userRole;

    @prop({ required: true })
    @ApiModelProperty({
        description: 'Status of user',
        example: ['ACTIVE', 'PENDING', 'BANNED'],
        required: true,
        type: 'string'
    })
    public status: userStatus;

    /**
     * Checks user password
     * @param {String} candidatePassword candidate password
     * @returns {Promise<Boolean>} promise which will be resolved when password compared
     */
    @instanceMethod
    public async isValidPassword(this: InstanceType<User> & typeof User, candidatePassword: string) {
        if (!candidatePassword) {
            return false;
        }
        if (!this.passwordHash) {
            return false;
        }
        return bcrypt.compare(candidatePassword, this.passwordHash);
    }

    /**
     * Sets user password
     * @param {String} password password to set
     * @returns {Promise<>} promise which will be resolved when password set
     */
    @instanceMethod
    public async setPassword(this: InstanceType<User> & typeof User, password: string) {
        this.passwordHash = password ? await bcrypt.hash(password, config.saltRounds) : undefined;

        return this.save();
    }

    /**
     * Sets user status to ACTIVE
     * @returns {Promise<>} promise which will be resolved when password set
     */
    @instanceMethod
    public async activate(this: InstanceType<User> & typeof User) {
        this.status = 'ACTIVE';

        return this.save();
    }
}

@provide(TYPES.UserRepository)
// tslint:disable-next-line
export default class UserRepository {
    public User;
    private config;

    constructor(@inject(TYPES.ConfigServie) configService: IConfigService) {
        this.config = configService.get('AUTH');

        config = this.config;

        this.User = new User().getModelForClass(User);
    }
}
