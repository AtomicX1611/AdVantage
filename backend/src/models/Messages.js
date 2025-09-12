import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    chatId: {
        type:String,
        required:true
    },
    sender: {
        type:String,
        required:true
    },
    message: {
        type:String,
        required:true
    }
});

export const Messages=new mongoose.model("Messages",messageSchema);