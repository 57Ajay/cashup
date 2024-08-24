import { Request, Response, NextFunction } from 'express';
import Token from '../models/token.model';


interface RequestWithUser extends Request {
    user?: any;
}

const authenticate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'] as string;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.sendStatus(401);

        const tokenDoc: any = await Token.findOne({ token }).populate({
            path: 'user',
            select: '-password'
        });
        
        if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
            return res.status(403).json({
                message: 'Authentication failed',
                resason: 'either token is expired or does not exist, consider logging in again',
            });
        }
        // console.log("tokenDoc\n", tokenDoc)
        req.user = tokenDoc.user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(403).json({ message: 'Authentication failed' });
    }
};

export { authenticate };
