import express from 'express';
import {
    paymentRetrievalController,
    paymentProcessingController
} from '../controllers/payment.controller.js';

import {
    checkToken,
    authorize,
    serializeUser
} from '../middlewares/protect.js'

const router = express.Router();

router.get('/getAllPayments',checkToken, serializeUser, authorize('admin'), paymentRetrievalController);

router.post('/processPayment',checkToken, serializeUser, authorize('user'), paymentProcessingController);