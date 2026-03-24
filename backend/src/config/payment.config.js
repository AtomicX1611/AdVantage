import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAYKEYID,
  key_secret: process.env.RAZORPAYKEYSECRET,
});