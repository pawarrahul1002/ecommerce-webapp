import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export interface INewUserRequestBody {
  _id: string;
  name: string;
  email: string;
  photo: string;
  gender: string;
  dob: Date;
}

export interface INewProductRequestBody {
  name: string;
  price: number;
  stock: number;
  category: string;
}

export type controllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type SearchRequestQuery = {
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;
};

export interface IBaseQuery {
  name?: {
    $regex: string;
    $options: string;
  };
  price?: { $lte: number };
  category?: string;
}

export type InvalidateCacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
};

/**
 * shipping info-   address, city, state, contry, pincode
 * userId -ref
 * subtotal
 * tax
 * shipping charges
 * discount
 * total
 * status - processing, shipped, delivered
 * orderItem - [name,photo,price,quantity,productId-ref]
 *
 * timpestamps
 */

export type shippingInfo = {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
};

export interface INewOrderRequestbody {
  shipingInfo: shippingInfo;
  userId: mongoose.Types.ObjectId;
  subTotal: number;
  tax: number;
  shippingcharges: number;
  discount: number;
  total: number;
  status: string;
  orderItems: OrderItem[];
}

export type OrderItem = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: mongoose.Types.ObjectId;
};
// {
//   name: string,
//   photo: string,
//   price: number,
//   quantity: number,
//   productId: {
//     type: mongoose.Types.ObjectId,
//     ref: "Product",
//   },
// },
