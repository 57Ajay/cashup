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

export const registerUser = asyncHandler(async (req, res) => {
  const parsedBody = registerUserSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json(ApiResponse.error("Please provide correct Schema", parsedBody.error));
  }

  const { username, password, email } = parsedBody.data;
  const userExists = await User.findOne({ $or: [{ email }, { username }] }); 
  if (userExists) {
    return res.status(400).json(ApiResponse.error("User already exists"));
  }

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
  if (!parsedBody.success) {
    return res.status(400).json(ApiResponse.error("Please provide correct schema", parsedBody.error));
  }

  const { username, password, email } = parsedBody.data;

  if (!username && !email) {
    return res.status(400).json(ApiResponse.error("Please provide username or email"));
  }

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    return res.status(400).json(ApiResponse.error("User does not exist"));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json(ApiResponse.error("Invalid credentials"));
  }

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

  if (!token) return res.status(401).json(ApiResponse.error("Unauthorized"));

  try {
    const tokenDoc = await Token.findOne({ token });
    if (!tokenDoc) return res.status(404).json(ApiResponse.error("Token is invalid or expired"));

    await Token.findByIdAndDelete(tokenDoc._id);
    
    await User.findByIdAndUpdate(req.user._id, { $unset: { tokens: "" } }, { new: true });

    res.status(200).json(ApiResponse.success("User logged out successfully"));
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json(ApiResponse.error("Internal server error"));
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) return res.status(401).json(ApiResponse.error("Unauthorized"));

  const userToDelete = await User.findById(userId).select("-password"); // Check existence first
  if (!userToDelete) return res.status(404).json(ApiResponse.error("User not found"));

  await User.findByIdAndDelete(userId);
  const deletedTokens = await Token.deleteMany({ user: userId });

  res.status(200).json(ApiResponse.success("User deleted successfully", { userToDelete, deletedTokens }));
});

export const searchUserViaFilter = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json(ApiResponse.error("Log in to search"));
  }

  const { filter } = req.query;
  const users = await User.find({
    $or: [
      { username: { "$regex": filter, "$options": "i" } },
      { email: { "$regex": filter, "$options": "i" } },
    ],
  }).select("-password");

  if (!users.length) {
    return res.status(404).json(ApiResponse.error("No user found", "No matching users with given query"));
  }

  return res.status(200).json(ApiResponse.success("Users found", users));
});
