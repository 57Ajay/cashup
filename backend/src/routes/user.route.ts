import { Router } from 'express';
import { registerUser, loginUser, logoutUser, deleteUser, getAllTokens } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", authenticate,  logoutUser);
userRouter.delete("/delete", authenticate, deleteUser);
userRouter.get("/tokens", getAllTokens)

export default userRouter;