import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import UserRepo from './interface';
import TYPES from '../../constant/types';
import { NotFound } from '../../errors';
import { PRIORITIES } from '../../schemas/assignment-schema';

@injectable()
export default class User implements UserRepo {
    private _User;
    private mongoose;
    constructor(
        @inject(TYPES.Mongoose) mongoose
    ) {
        const assignmentSchema = {
            title: {
                type: String,
                required: true
            },
            description: String,
            author_id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            assignee_id: mongoose.Schema.Types.ObjectId,
            status: String,
            priority: {
                type: String,
                enum: Object.values(PRIORITIES)
            }
        };

        const schema = new mongoose.Schema(assignmentSchema);
        this._Assignment = mongoose.model('Assignment', schema);

        this.mongoose = mongoose;
    }

    get Assignment() {
        return this._Assignment;
    }

    private toObjectId(value) {
        return new this.mongoose.Types.ObjectId(value);
    }

    async findById(id: string) {
        const [assignment] = await this.Assignment.aggregate([
            {
                $match: { _id: this.toObjectId(id) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author_id',
                    foreignField: '_id',
                    as: 'authors'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignee_id',
                    foreignField: '_id',
                    as: 'assignees'
                }
            }
        ]);
        [assignment.author] = assignment.authors;
        [assignment.assignee] = assignment.assignees;
        if (!assignment) {
            throw new NotFound('No such assignment');
        }
        return assignment;
    }
    async findAll() {
        const assignments = await this.Assignment.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'author_id',
                    foreignField: '_id',
                    as: 'authors'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignee_id',
                    foreignField: '_id',
                    as: 'assignees'
                }
            }
        ]);
        return assignments.map(a => {
            [a.author] = a.authors;
            [a.assignee] = a.assignees;
            return a;
        })
    }
    async findByAssigneeId(assigneeId: string) {
        const assignments = await this.Assignment.aggregate([
            {
                $match: {
                    assignee_id: this.toObjectId(assigneeId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author_id',
                    foreignField: '_id',
                    as: 'authors'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'assignee_id',
                    foreignField: '_id',
                    as: 'assignees'
                }
            }
        ]);
        return assignments.map(a => {
            [a.author] = a.authors;
            [a.assignee] = a.assignees;
            return a;
        });
    }
    async create(data: object) {
        const assignment = await this.Assignment.create(data);
        return assignment;
    }
    async updateById(id: string, data: object) {
        return this.Assignment.findOneAndUpdate({
            _id: this.toObjectId(id)
        },
            {
                $set: data
            },
            {
                returnNewDocument: true
            });
    }
    async deleteById(id: string) {
        return this.Assignment.findOneAndDelete({
            _id: this.toObjectId(id)
        });
    }
}
