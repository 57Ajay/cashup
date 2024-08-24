import mongoose from 'mongoose';

const dbConnect = async()=>{
    if (!process.env.MONGODB_URL || !process.env.DB_NAME){
        throw new Error('MONGODB_URL and DB_NAME is required');
    };

    const dbInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${process.env.DB_NAME}`);
    console.log('Connected to MongoDB', dbInstance.connection.host);
}

export default dbConnect;
