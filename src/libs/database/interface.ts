import mongoose from 'mongoose';

export default interface IDatabase {
    mongoose: mongoose.Mongoose ;
    connect(): Promise<void>;
    close(): Promise<any>;
    clear(): Promise<any>;
}
