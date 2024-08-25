import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.route';
import bankRouter from './routes/bank.route';

const app = express();
app.use(cors());
app.use(express.json()); 
app.use('/api/user', userRouter);
app.use('/api/account', bankRouter);

export default app;