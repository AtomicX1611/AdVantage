
import mongoose from "mongoose";

export const connectDB=async ()=>{
   console.log("this is mongo uri : "+process.env.MONGO_URI)
    await mongoose.connect(process.env.MONGO_URI);
}