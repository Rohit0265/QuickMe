import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        const uri = process.env.MONGODB_URL as string;
        await mongoose.connect( uri );
        console.log("DB CONNECTED");
    } catch (error) {
        console.log(error);
    }
}

export default connectDB;