import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { myCache } from "../app.js";
export const connectDB = () => {
    mongoose
        .connect("mongodb://127.0.0.1:27017", { dbName: "ecommerce_v1" })
        .then((c) => console.log(`db connected to ${c.connection.host}`))
        .catch((e) => {
        console.log(e);
    });
};
export const invalidateCache = async ({ product, order, admin, }) => {
    if (product) {
        const productKeys = [
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
