
import {
    paymentRetrievalService,
    paymentProcessingService
} from '../services/payment.service.js';

export const paymentRetrievalController = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const serviceCall = await paymentRetrievalService();

        if (serviceCall.success) {
            return res.status(200).json({
                success: true,
                message: serviceCall.message,
                payments: serviceCall.payments
            });
        } else {
            return res.status(500).json({
                success: false,
                message: serviceCall.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const paymentProcessingController = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'user') {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { payTo, paymentType, price } = req.body;
        console.log("req.body: ",req.body);
        const processingServiceCall = await paymentProcessingService({
            userId: req.user._id,
            payTo,
            paymentType,
            price
        });

        if (processingServiceCall.success) {
            return res.status(200).json({
                success: true,
                message: processingServiceCall.message,
                paymentId: processingServiceCall.paymentId
            });
        } else {
            return res.status(400).json({
                success: false,
                message: processingServiceCall.message
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}