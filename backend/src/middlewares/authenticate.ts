import { Request, Response, NextFunction } from 'express';
import Token from '../models/token.model';


interface RequestWithUser extends Request {
    user?: any;
}
const extractToken = (req: Request): string | null => {
    const authHeader = req.headers['authorization'] as string;
    const token = authHeader && authHeader.split(' ')[1];
    return token || null;
};

const verifyToken = async (token: string) => {
    const tokenDoc: any = await Token.findOne({ token }).populate({
        path: 'user',
        select: '-password'
    });
    
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
        throw new Error('Invalid or expired token');
    }
    return tokenDoc.user;
};

const authenticate = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req);
        if (!token) return res.sendStatus(401);

        req.user = await verifyToken(token);
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(403).json({ message: 'Authentication failed' });
    }
};

export { authenticate };
