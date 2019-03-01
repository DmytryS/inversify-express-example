import mongoose from 'mongoose';

export default interface IDatabaseService {
    mongoose: mongoose.Mongoose ;
    db: mongoose.Connection;
    connect(): Promise<void>;
    close(): Promise<any>;
    clear(): Promise<any>;
}
