import { NextFunction, Request, Response } from "express";

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
  product?:boolean;
  order?:boolean;
  admin?:boolean;

}