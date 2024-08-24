import express from 'express';

import userRouter from './routes/user.route';
import bankRouter from './routes/bank.route';

const app = express();
app.use(express.json()); 
app.use('/api/user', userRouter);
app.use('/api/account', bankRouter);

export default app;