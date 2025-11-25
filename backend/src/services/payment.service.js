import {
    getAllPayments,
    doPayment,
} from '../daos/payment.dao.js';
import User from '../models/User.js'

export const paymentRetrievalService = async () => {
    return await getAllPayments();
}

export const paymentProcessingService = async ({userId, payTo, paymentType, price}) => {
    try {
        const user=await User.findById(userId);
        if(!user){
            return {
                success:false,  
                message:"User not found"
            }
        }
        if(price <= 0){
            return {
                success:false,          
                message:"Invalid price"
            }
        }
        if(paymentType !=='subscription' && paymentType !=='purchase') {
            return {
                success:false,          
                message:"Invalid payment type"
            }
        }   
        if(payTo.trim().lowerCase()!=='admin') {
            const receiver=await User.findOne({userId:payTo});
            if(!receiver){
                return {        
                    success:false,          
                    message:"Payee not found"
                }
            } 
        }
        return await doPayment({userId, payTo, paymentType, price});
    } catch (error) {
        console.log(error);
        return {
            success:false,
            message:"Service error"
        }
    }
}