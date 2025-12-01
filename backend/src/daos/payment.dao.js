import payments from '../models/Payment.js'
import User from '../models/Users.js'

export const getAllPayments= async ()=> {
    try {
        const paymentList=await payments.find();
        return {
            success:true,
            message:"Retrieved payments list",
            payments:paymentList
        }
    } catch (error) {
        console.log("error in payments: ",error);
        return {
            success:false,
            message:"Database error"
        }
    }
}

export const doPayment=async ({userId,payTo,paymentType,price})=>{
    try {
        const newPayment={
            userId:userId,
            paidTo:payTo,
            paymentType:paymentType,
            price:price,
            date:Date.now()
        }
        const payment=await payments.create(newPayment);  
        if(payment){
            return {
                success:true,
                message:"Payment successful",
                payment:payment
            }
        }else{
            return {
                success:false,
                message:"Payment failed"
            }
        }
    } catch (error) {
        console.log("error in payments: ",error);
        return {
            success:false,
            message:"Database error"
        }
    }
}