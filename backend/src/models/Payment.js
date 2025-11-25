import mongoose from "mongoose";

const paymentSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    paidTo: {
        type:String,
        required:true
    },
    paymnetType: {
        type:String,
        required:true,
        enum:[
            "purchase",
            "subscription"
        ]
    },
    price:{
        type:Number,
        required:true,
    },
    date:{
        default:Date.now
    }
});

export default mongoose.model("Payment",paymentSchema);