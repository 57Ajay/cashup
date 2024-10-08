import { Router } from 'express';
import { registerUser, loginUser, logoutUser, deleteUser, searchUserViaFilter, updateUser } from '../controllers/user.controller';
import { authenticate } from '../middlewares/authenticate';

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", authenticate,  logoutUser);
userRouter.delete("/delete", authenticate, deleteUser);
userRouter.get("/search", authenticate, searchUserViaFilter);
userRouter.put("/update", authenticate, updateUser);

export default userRouter;