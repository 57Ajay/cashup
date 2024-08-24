import crypto from 'crypto';
import Token from '../models/token.model';
import User from '../models/user.model';

const generateToken = async (userId: string | Object) => {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); 

    try {
        const newToken = await Token.create({
            token,
            user: userId,
            expiresAt,
        });
        await User.findByIdAndUpdate(userId, { $push: { tokens: newToken._id } });
        return newToken;
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Error generating token');
    }
};

export default generateToken;
