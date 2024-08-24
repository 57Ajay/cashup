import { asyncHandler } from '../utils/asyncHandler';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import generateToken from '../utils/generateToken';
import Token from '../models/token.model';
import { z } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

const registerUserSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(5),
    email: z.string().email(),
});

const loginUserSchema = z.object({
    username: z.string().min(3).optional(),
    password: z.string().min(5),
    email: z.string().email().optional(),
});


export const registerUser = asyncHandler(async(req, res)=>{
    const parsedBody = registerUserSchema.safeParse(req.body);
    if (!parsedBody.success){
        return res.status(404).json(
            ApiResponse.error("Please provide correct Schema", parsedBody.error)
        )
    };
    
    const { username, password, email } = req.body;
    if (!username || !password || !email) return res.status(400).json({
        message: 'All fields are required'
    });
    const userExists = await User.findOne({ email, username });
    if (userExists) return res.status(400).json(
        ApiResponse.error("User already exists", null)
    );
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        username,
        password: hashedPassword,
        email,
    });

    res.status(201).json(
        ApiResponse.success("User registered Successfully", {
            _id: user._id,
            username: user.username,
            email: user.email,
        })
    );
});


export const loginUser = asyncHandler(async (req, res) => {
    const parsedBody = loginUserSchema.safeParse(req.body);
    if (!parsedBody.success){
        return res.status(404).json(
            ApiResponse.error("Please provide correct schema", parsedBody.error)
        )
    };
    const { username, password, email } = req.body;

    if (!username && !email) {
        return res.status(400).json(
            ApiResponse.error("Please provide username or email", null)
        );
    }
    if (!password) {
        return res.status(400).json(
            ApiResponse.error("Please provide password", null)
        );
    };

    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user) {
        return res.status(400).json(
            ApiResponse.error("User does not exists", null)
        );
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json(
            ApiResponse.error("Invalid credintils", null)
        );
    };

    const newToken = await generateToken(user._id);
    res.status(200).json(
        ApiResponse.success("Logged in Successfully", {
            _id: user._id,
            username: user.username,
            email: user.email,
            token: newToken.token,
        })
    );
});


declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const logoutUser = asyncHandler(async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) return res.status(401).json(
        ApiResponse.error("Unauthorized", null)
    );

    try {
        const tokenDoc = await Token.findOne({ token });
        if (!tokenDoc) return res.status(404).json(
            ApiResponse.error("Token is invalid or expired", null)
        ); 

        await Token.findByIdAndDelete(tokenDoc._id);
        await User.findByIdAndUpdate(req.user._id, {
             $unset: {
            tokens: 1
            } 
        },
        {
            new: true,
        });

        res.status(200).json(
            ApiResponse.success("User logged in successfully", null)
        );
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json(
            ApiResponse.error("Internal server error", null)
        );
    }
});

export const deleteUser = asyncHandler(async(req, res)=>{
    const userId = req.user._id;
    if (!userId) return res.status(401).json(
        ApiResponse.error("Unauthorized", null)
    );
    const userToDelete = await User.findByIdAndDelete(userId).select("-password");
    
    if (!userToDelete) return res.status(404).json(
        ApiResponse.error("User not found", null)
    );

    const deletedTokens = await Token.deleteMany({ user: userId });

    res.status(200).json(
        ApiResponse.success("User deleted successfully", {userToDelete, deletedTokens})
    );
});

