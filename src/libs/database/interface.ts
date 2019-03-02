import mongoose from 'mongoose';

export default interface IDatabaseService {
    db: mongoose.Connection;
    connect(): Promise<void>;
    close(): Promise<any>;
    clear(): Promise<any>;
}
