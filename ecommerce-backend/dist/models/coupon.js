import mongoose from "mongoose";
const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "coupon code is required"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "amount is required"],
    },
}, { timestamps: true });
const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
