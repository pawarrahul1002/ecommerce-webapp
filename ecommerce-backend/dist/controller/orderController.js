import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/ErrorHandler.js";
// shipingInfo: shippingInfo;
// userId: mongoose.Types.ObjectId;
// subTotal: Number;
// tax: Number;
// shippingcharges: Number;
// discount: Number;
// total: Number;
// status: String;
// orderItem: OrderItem[];
export const newOrder = TryCatch(async (req, res, next) => {
    const { shipingInfo, orderItems, userId, subTotal, tax, shippingcharges, discount, total, } = req.body;
    if (!shipingInfo ||
        !orderItems ||
        !userId ||
        !subTotal ||
        !tax ||
        !shippingcharges ||
        !discount ||
        !total) {
        next(new ErrorHandler("Please add all fields", 400));
    }
    await Order.create({
        shipingInfo,
        orderItems,
        userId,
        subTotal,
        tax,
        shippingcharges,
        discount,
        total,
    });
    await reduceStock(orderItems);
    await invalidateCache({ product: true, order: true, admin: true });
});
