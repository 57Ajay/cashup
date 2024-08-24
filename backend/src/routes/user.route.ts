import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", authenticate,  logoutUser);

export default userRouter;