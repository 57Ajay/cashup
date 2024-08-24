import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
    _id: string | object
    username: string;
    email: string;
    password: string;
    tokens: Schema.Types.ObjectId[];
    bankId: Schema.Types.ObjectId;
}
const userSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    tokens: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Token'
    }],
    bankId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank'
    }]

}, { timestamps: true });

const User = mongoose.model<IUser>('User', userSchema);

export default User;