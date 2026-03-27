
import mongoose from "mongoose";
import dotenv from 'dotenv';


dotenv.config({ path: './.env' }); 

const database = async () => {
    try {
       
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is missing in .env file");
        }

        
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("✅ MongoDB connected successfully");
        
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        console.log('MongoDB URL:', process.env.MONGODB_URL);
        process.exit(1);
    }
};

export default database;
