import { TryCatch } from "./../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { rm } from "fs";
import mongoose from "mongoose";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo) {
        return next(new ErrorHandler("Please add photo", 400));
    }
    if (!name || !price || !stock || !category) {
        rm(photo.path, () => {
            console.log("file deleted successfully");
        });
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo?.path,
    });
    return res.status(201).json({
        success: true,
        message: "Product created successfully",
    });
});
export const getLatestProduct = TryCatch(async (req, res, next) => {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    return res.status(201).json({
        success: true,
        message: products,
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    const categories = await Product.distinct("category");
    return res.status(201).json({
        success: true,
        message: categories,
    });
});
export const getAllProducts = TryCatch(async (req, res, next) => {
    const products = await Product.find({});
    return res.status(201).json({
        success: true,
        message: products,
    });
});
export const getProductByID = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid Id", 400));
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("product not found", 404));
    }
    return res.status(200).json({
        success: true,
        message: product,
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler("Invalid Id", 400));
    }
    const product = await Product.findById(productId);
    let updated = false;
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    const photo = req.file;
    if (photo) {
        rm(product.photo, () => {
            console.log("old photo deleted", product.photo);
        });
        product.photo = photo.path;
        updated = true;
    }
    const { name, price, stock, category } = req.body;
    if (name) {
        product.name = name;
        updated = true;
    }
    if (price) {
        product.price = price;
        updated = true;
    }
    if (stock) {
        product.stock = stock;
        updated = true;
    }
    if (category) {
        product.category = category;
        updated = true;
    }
    if (updated) {
        await product.save();
    }
    else {
        return res.status(200).json({
            success: true,
            message: "Found no changes in the product",
        });
    }
    return res.status(200).json({
        success: true,
        message: "Product updated successfully",
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const productId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new ErrorHandler("Invalid Id", 400));
    }
    const product = await Product.findById(productId);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    const path = product.photo;
    if (path) {
        rm(path, () => {
            console.log("old photo deleted");
        });
    }
    await product.deleteOne();
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
});
export const getAllProductsWithFilters = TryCatch(async (req, res, next) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;
    const baseQuery = {};
    if (typeof search === "string") {
        baseQuery.name = {
            $regex: search,
            $options: 'i',
        };
    }
    if (typeof price === "string" && !isNaN(Number(price))) {
        const priceValue = Number(price);
        baseQuery.price = { $lte: priceValue };
    }
    if (typeof category === "string") {
        baseQuery.category = category;
    }
    const numberOfProductOnPageAfterfilter = Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip);
    const totalResultAfterFilter = Product.find(baseQuery);
    const [products, filterOnlyProducts] = await Promise.all([
        numberOfProductOnPageAfterfilter,
        totalResultAfterFilter,
    ]);
    const totalPages = Math.ceil(filterOnlyProducts.length / limit);
    return res
        .status(200)
        .json({ success: true, message: { products, totalPages } });
});
