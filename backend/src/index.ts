import app from "./app";
import dbConnect from "./db/dbConnect";
import { config } from 'dotenv';
config();


const port = 3000;

dbConnect().then(()=>{
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });  
}).catch((err)=>{
  console.log(err);
});

