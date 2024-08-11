import { TryCatch } from "./../middlewares/error.js";
import { Product } from "../models/product.js";
import { NextFunction, Request, Response } from "express";
import {
  IBaseQuery,
  INewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { rm } from "fs";
import mongoose from "mongoose";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

export const newProduct = TryCatch(
  async (req: Request<{}, {}, INewProductRequestBody>, res, next) => {
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

    await invalidateCache({product:true});
    
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  }
);

//revalidate caching on request - new, update,delete, and on new order
export const getLatestProduct = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    message: products,
  });
});

//revalidate caching on request - new, update,delete, and on new order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    message: categories,
  });
});

//revalidate caching on request - new, update,delete, and on new order
export const getAllProducts = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(201).json({
    success: true,
    message: products,
  });
});

//revalidate caching on request - new, update,delete, and on new order
export const getProductByID = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ErrorHandler("Invalid Id", 400));
  }
  let product;

  if (myCache.has(`$product-${id}`)) {
    console.log("faster");
    product = JSON.parse(myCache.get(`$product-${id}`) as string);
  } else {
    product = await Product.findById(req.params.id);

    if (!product) {
      
      return next(new ErrorHandler("product not found", 404));
    }
    console.log("slower");

    myCache.set(`$product-${id}`, JSON.stringify(product));
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


  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  let updated = false;

  const photo = req.file;

  if (photo) {
    rm(product.photo!, () => {
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
  } else {
    return res.status(200).json({
      success: true,
      message: "Found no changes in the product",
    });
  }
  
  await invalidateCache({product:true});

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

  
  await invalidateCache({product:true});

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

export const getAllProductsWithFilters = TryCatch(
  async (
    req: Request<{}, {}, SearchRequestQuery>,
    res: Response,
    next: NextFunction
  ) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: IBaseQuery = {};
    if (typeof search === "string") {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (typeof price === "string" && !isNaN(Number(price))) {
      const priceValue = Number(price);
      baseQuery.price = { $lte: priceValue };
    }

    if (typeof category === "string") {
      baseQuery.category = category;
    }

    const totalResultAfterFilter = Product.find(baseQuery);
    
    const numberOfProductOnPageAfterfilter = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);


    const [productsOnOnePage, totalFilteredResult] = await Promise.all([
      numberOfProductOnPageAfterfilter,
      totalResultAfterFilter,
    ]);

    const totalPages = Math.ceil(totalFilteredResult.length / limit);

    return res
      .status(200)
      .json({ success: true, message: { productsOnOnePage, totalPages } });
  }
);
