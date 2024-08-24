import { Router } from "express";
import { transferBalance } from "../controllers/bank.controller"
import { authenticate } from '../middlewares/authenticate';

const bankRouter = Router();

bankRouter.post("/sendMoney", authenticate, transferBalance);

export default bankRouter;