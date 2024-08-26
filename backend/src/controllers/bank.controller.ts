import { asyncHandler } from '../utils/asyncHandler';
import Bank from '../models/bank.model';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse';

export const transferBalance = asyncHandler(async(req, res)=>{
    if (!req.user){
        return res.status(403).json(
            ApiResponse.error("Login for transaction")
        )
    };

    const session = await mongoose.startSession();
    session.startTransaction();
    const { amount, to } = req.body;

    const bankAccount = await Bank.findOne({ userId: req.user._id }).session(session);
    if (!bankAccount){
        await session.abortTransaction();
        return res.status(404).json(
            ApiResponse.error("Bank account not found")
        )
    };

    if (bankAccount.balance < amount){
        return res.status(404).json(
            ApiResponse.error("Insufficient Balence")
        )
    };

    const toAccount = await Bank.findOne({userId: to}).session(session);

    if (!toAccount){
        await session.abortTransaction();
        return res.status(404).json(
            ApiResponse.error("Please provide valid account details")
        )
    };

    await Bank.updateOne({userId: req.user._id}, { $inc: { balance: -amount } }).session(session);
    await Bank.updateOne({userId: to}, { $inc: { balance: +amount } }).session(session);

    await session.commitTransaction();
    return res.status(200).json(
        ApiResponse.success("Transaction successfull", {
            fromUser: req.user.id,
            toUser: to,
            amount: amount ,
            remainingBalance: bankAccount.balance - amount
        })
    );
});


export const getBalance = asyncHandler(async(req, res)=>{
    if (!req.user){
        return res.status(404).json(
            ApiResponse.error("Login to check balance")
        )
    };

    const bank = await Bank.findOne({ userId: req.user._id});
    if (!bank){
        return res.status(404).json(
            ApiResponse.error("Bank account not found")
        )
    };

    if (bank._id.toString() != req.user.bankId[0].toString()){
        return res.status(404).json(
            ApiResponse.error("You can only check your account balance")
        )
    };

    return res.status(200).json(
        ApiResponse.success("Balance fetched successfully", {
            balance: bank.balance
        })
    );
});
