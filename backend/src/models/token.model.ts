import mongoose from "mongoose";

export interface IToken extends Document {
    _id: string | object
    token: string;
    user: mongoose.Schema.Types.ObjectId;
    expiresAt: Date;
}


const tokenSchema = new mongoose.Schema<IToken>({
    token: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresAt: {
        type: Date,
        require: true
    }
}, { timestamps: true });

tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;