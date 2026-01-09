import mongoose from "mongoose";

const contactSchema=mongoose.Schema({
    user:{
        type:String,
        unique:true,
        required:true
    },
    contacts: {
        type:[],
        required:true
    },
    chatId: {
        type:String,
        required:true
    },
})

// contactSchema.index({user:1});
export const Contacts=new mongoose.model("Contacts",contactSchema);