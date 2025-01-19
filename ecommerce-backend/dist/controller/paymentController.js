import { TryCatch } from "../middlewares/error.js";
import Coupon from "../models/coupon.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
export const newCoupon = TryCatch(async (req, res, next) => {
    const { couponCode, amount } = req.body;
    if (!couponCode || !amount) {
        return next(new ErrorHandler("Please enter both coupon code and amount", 400));
    }
    const amountAsNumber = Number(amount); // Convert to number
    if (isNaN(amountAsNumber)) {
        return next(new ErrorHandler("Amount must be a number", 400));
    }
    await Coupon.create({ code: couponCode, amount: amountAsNumber });
    return res.status(201).json({
        success: true,
        message: `Coupon ${couponCode} created successfully`,
    });
});
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { couponCode } = req.query;
    if (!couponCode) {
        return next(new ErrorHandler("Please enter couponCode ", 400));
    }
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) {
        return next(new ErrorHandler("Invalid coupon code", 400));
    }
    return res.status(200).json({
        success: true,
        discount: coupon.amount,
    });
});
export const allCoupon = TryCatch(async (req, res, next) => {
    const coupons = await Coupon.find();
    return res.status(200).json({
        success: true,
        coupons: coupons.length > 0 ? coupons : "No coupons found",
    });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    console.log(id);
    const coupon = await Coupon.findById(id);
    if (!coupon) {
        return next(new ErrorHandler("No coupons found", 400));
    }
    await coupon.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Coupon deleted successfully",
    });
});
export const createPaymentIntent = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    const user = await User.findById(id).select('name');
    if (!user) {
        next(new ErrorHandler('please login', 401));
    }
});
