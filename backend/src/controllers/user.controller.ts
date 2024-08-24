import { asyncHandler } from '../utils/asyncHandler';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import Bank from "../models/bank.model"
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

const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  currentPassword: z.string().min(5).optional(),
  newPassword: z.string().min(5).optional(),
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
  const bank = await Bank.create({
    userId: user._id,
    balance: (1 + (Math.random()*1000)).toFixed(2)
  });
  await User.findByIdAndUpdate(user._id, { $push: { bankId: bank._id } });

  res.status(201).json(
    ApiResponse.success("User registered Successfully", {
      _id: user._id,
      username: user.username,
      email: user.email,
      bankId: bank._id,
      balance: bank.balance
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
  const bank = await Bank.findById(user.bankId);
  if (!bank) {
    return res.status(400).json(ApiResponse.error("Bank not found"));
  }

  const newToken = await generateToken(user._id);
  res.status(200).json(
    ApiResponse.success("Logged in Successfully", {
      _id: user._id,
      username: user.username,
      email: user.email,
      token: newToken.token,
      bankId: user.bankId,
      balance: bank.balance
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

  const userToDelete = await User.findById(userId).select("-password");
  
  if (!userToDelete) return res.status(404).json(ApiResponse.error("User not found"));
  await Bank.findByIdAndDelete(userToDelete.bankId[0]);
  await User.findByIdAndDelete(userId);
  const deletedTokens = await Token.deleteMany({ user: userId });

  res.status(200).json(ApiResponse.success("User deleted successfully", { userToDelete, deletedTokens }));
});

export const searchUserViaFilter = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json(ApiResponse.error("Log in to search"));
  }

  const { filter } = req.query;
  if (!filter){
    return res.status(400).json(
      ApiResponse.error("use 'filter=all' to get all the users", "Please provide filter query parameter")
    )
  };

  let users: object[];

  if (filter === "all"){
    users = await User.find({}).select("-password").populate('bankId');
    return res.status(200).json(
      ApiResponse.success("ALl Users fetched successfully", users)
    )
  }else{
    users = await User.find({
      $or: [
        { username: { "$regex": filter, "$options": "i" } },
        { email: { "$regex": filter, "$options": "i" } },
      ],
    }).select("-password").populate('bankId');
  };

  if (!users.length) {
    return res.status(404).json(ApiResponse.error("No user found", "No matching users with given query"));
  }

  return res.status(200).json(ApiResponse.success("Users found", users));
});


export const updateUser = asyncHandler(async(req, res) => {
  if (!req.user){
    return res.status(403).json(
      ApiResponse.error("Please login to update")
    )
  };

  const parsedBody = updateUserSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json(ApiResponse.error("Please provide correct schema", parsedBody.error));
  };

  const { username, currentPassword, newPassword, email } = parsedBody.data;
  if (!username && !currentPassword && !newPassword && !email) {
    return res.status(400).json(ApiResponse.error("Please provide at least one field to update"));
  };

  const existingUser = await User.findOne({
    $or: [
      { username },
      { email }
    ]
  });

  if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
    return res.status(400).json(ApiResponse.error("User already exists"));
  };

  const userId = req.user._id;
  if (!userId) return res.status(401).json(ApiResponse.error("Unauthorized"));

  
  if (currentPassword && !newPassword) {
    return res.status(400).json(ApiResponse.error("Please provide new password"));
  };

  if (newPassword && !currentPassword) {
    return res.status(400).json(ApiResponse.error("Please provide current password"));
  };

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  };

  let updates: Partial<{ username: string; password: string; email: string }> = {};
  let hashedPassword: string | undefined;

  if (newPassword && currentPassword) {
    const comparePassword = await bcrypt.compare(currentPassword, user.password); // Corrected to await
    if (!comparePassword) {
      return res.status(400).json(ApiResponse.error("Invalid credentials"));
    };

    hashedPassword = await bcrypt.hash(newPassword, 10);
    updates.password = hashedPassword;
  };

  if (username) {
    updates.username = username;
  };

  if (email) {
    updates.email = email;
  };

  await User.findByIdAndUpdate(userId, updates, { new: true });

  return res.status(200).json(
    ApiResponse.success("User updated successfully", {
      _id: user._id,
      username: updates.username || user.username,
      email: updates.email || user.email,
    })
  );
});
