// import {
//     getAllPayments,
//     doPayment,
// } from '../daos/payment.dao.js';

// import User from '../models/Users.js'

// export const paymentRetrievalService = async () => {
//     return await getAllPayments();
// }

// export const paymentProcessingService = async ({userId, payTo, paymentType, price}) => {
//     try {
//         const user=await User.findById(userId);
//         if(!user){
//             return {
//                 success:false,  
//                 message:"User not found"
//             }
//         }
//         if(price <= 0 || (price!=='100' && price!=='1299')){
//             return {
//                 success:false,          
//                 message:"Invalid price"
//             }
//         }
//         if(paymentType !=='subscription' && paymentType !=='purchase') {
//             return {
//                 success:false,          
//                 message:"Invalid payment type"
//             }
//         }   
//         if(payTo.trim().toLowerCase()!=='admin') {
//             const receiver=await User.findOne({userId:payTo});
//             if(!receiver){
//                 return {        
//                     success:false,          
//                     message:"Payee not found"
//                 }
//             } 
//         }
//         const res= await doPayment({userId, payTo, paymentType, price});
//         if (res.success) {
//             if (price === '100') {
//                 user.subscription = 1;
//             }
//             if (price === '1299') {
//                 user.subscription = 2;
//             }
//             await user.save(); 


//         }
//         return res;
//     } catch (error) {
//         console.log(error);
//         return {
//             success:false,
//             message:"Service error"
//         }
//     }
// }