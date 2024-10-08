import {Schema, model, Document, Types } from 'mongoose';

interface IBank extends Document {
  _id: Types.ObjectId;
  balance: number;
  userId: Schema.Types.ObjectId;
};

const bankSchema = new Schema<IBank>({
    balance: {
        required: true,
        type: Number
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps: true});


const Bank = model<IBank>('Bank', bankSchema);

export default Bank;

