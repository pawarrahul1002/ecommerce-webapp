import { orderStatus } from "./../types/types.js";
import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import { INewOrderRequestbody } from "../types/types.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { myCache } from "../app.js";
// shipingInfo: shippingInfo;
// userId: mongoose.Types.ObjectId;
// subTotal: Number;
// tax: Number;
// shippingcharges: Number;
// discount: Number;
// total: Number;
// status: String;
// orderItem: OrderItem[];

export const newOrder = TryCatch(
  async (
    req: Request<{}, {}, INewOrderRequestbody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      shippingInfo,
      orderItems,
      userId,
      subTotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (
      !shippingInfo ||
      !orderItems ||
      !userId ||
      !subTotal ||
      !tax ||
      !total
    ) {
      next(new ErrorHandler("Please add all fields", 400));
    }

    await Order.create({
      shippingInfo: shippingInfo,
      orderItems: orderItems,
      userId: userId,
      subTotal: subTotal,
      tax: tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceStock(orderItems);
    const prodIds = orderItems.map(i=>String(i.productId));
    console.log('all prods : ',prodIds)
    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: userId,
      productId : prodIds
    });

    res.status(201).json({ success: true, message: "new orders placed" });
  }
);

export const myOrder = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  const key = `my-orders-${id}`;
  let orders;
  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await Order.find({ userId: id });
    if (!orders) {
      return next(new ErrorHandler("orders not found", 404));
    }
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const allOrder = TryCatch(async (req, res, next) => {
  const key = `all-orders`;
  let orders;
  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await Order.find().populate("userId", "name");
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderById = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  const key = `order-${id}`;
  let orders;
  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await Order.findById(id).populate("userId", "name");
    if (!orders) {
      return next(new ErrorHandler("orders not found", 404));
    }
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const processOrder = TryCatch(async (req, res, next) => {
  const { id, orderStatus } = req.query;

  let order = await Order.findById(id);
  if (!order) {
    return next(new ErrorHandler("orders not found", 404));
  }

  order.status = orderStatus as orderStatus;
  await order.save();
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.userId,
    orderId: order._id.toString(),
  });
  return res.status(200).json({
    success: true,
    message: `order status set to ${orderStatus}`,
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.query;
  // console.log(req.query);

  let order = await Order.findById(id);
  if (!order) {
    return next(new ErrorHandler("orders not found", 404));
  }

  await order.deleteOne();
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.userId,
    orderId: String(order._id),
  });
  return res.status(200).json({
    success: true,
    message: "order deleted successfully",
  });
});
