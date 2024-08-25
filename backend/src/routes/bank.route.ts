import { Router } from "express";
import { transferBalance, getBalance } from "../controllers/bank.controller"
import { authenticate } from '../middlewares/authenticate';

const bankRouter = Router();

bankRouter.post("/sendMoney", authenticate, transferBalance);
bankRouter.get("/getBalance", authenticate, getBalance);

export default bankRouter;