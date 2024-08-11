import mongoose from "mongoose";
import { InvalidateCacheProps } from "../types/types.js";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
import { OrderItem } from "../types/types.js";
import ErrorHandler from "./ErrorHandler.js";

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI!, { dbName: "ecommerce_v1" })
    .then((c) => console.log(`db connected to ${c.connection.host}`))
    .catch((e) => {
      console.log(e);
    });
};

export const invalidateCache = async ({
  product,
  order,
  admin,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "all-products",
      "categories",
    ];

    const products = await Product.find({}).select("_id");

    products.forEach((i) => {
      productKeys.push(`product-${i._id}`);
    });

    myCache.del(productKeys);
  }
};

export const reduceStock = async (orders: OrderItem[]) => {
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];

    let product = await Product.findById(order.productId);
    if (!product) {
      throw new ErrorHandler("Product not found", 404);
    }

    product.stock -= order.quantity;
    product.save();
    
  }
};
