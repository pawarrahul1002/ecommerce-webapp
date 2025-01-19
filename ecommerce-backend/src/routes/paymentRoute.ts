import express from 'express';
import { newCoupon,applyDiscount,allCoupon, deleteCoupon,createPaymentIntent } from '../controller/paymentController.js';

const router = express.Router();

router.post('/coupon',newCoupon);
router.get('/get-discount',applyDiscount);
router.get('/all-coupon',allCoupon);
router.delete('/delete-coupon/:id',deleteCoupon);
router.post("/create", createPaymentIntent);

export default router;