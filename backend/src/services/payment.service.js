import {
    getAllPayments,
    doPayment,
} from '../daos/payment.dao.js';

import User from '../models/Users.js'
import { createNotification, notificationTemplates } from "../utils/notificationHelper.js";

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
        if(price <= 0 || (price!=='100' && price!=='1299')){
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
        if(payTo.trim().toLowerCase()!=='admin') {
            const receiver=await User.findOne({userId:payTo});
            if(!receiver){
                return {        
                    success:false,          
                    message:"Payee not found"
                }
            } 
        }
        const res= await doPayment({userId, payTo, paymentType, price});
        if (res.success) {
            let subscriptionLevel = 0;
            let planName = '';
            
            if (price === '100') {
                user.subscription = 1;
                subscriptionLevel = 1;
                planName = 'Basic';
            }
            if (price === '1299') {
                user.subscription = 2;
                subscriptionLevel = 2;
                planName = 'Premium';
            }
            await user.save(); 

            // Send notification for subscription activation
            if (paymentType === 'subscription' && planName) {
                const notifData = notificationTemplates.SUBSCRIPTION_ACTIVATED(planName);
                await createNotification({
                    fromId: userId,
                    fromModel: 'Users',
                    toId: userId,
                    toModel: 'Users',
                    type: notifData.type,
                    title: notifData.title,
                    description: notifData.description,
                    relatedEntityId: res.paymentId,
                    relatedEntityType: 'Payment',
                    priority: notifData.priority
                });
            }

        }
        return res;
    } catch (error) {
        console.log(error);
        return {
            success:false,
            message:"Service error"
        }
    }
}