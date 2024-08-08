import { User } from "../models/user.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { TryCatch } from "./error.js";

export const adminOnly = TryCatch(async (req, res, next) => {
  const { adminId } = req.query;
  if (!adminId) {
    return next(new ErrorHandler("Please login", 401));
  }

  const user = await User.findById({ _id: adminId });
  if (!user) {
    return next(new ErrorHandler("Invalid ID entered", 401));
  }

  if (user.role !== "admin") {
    return next(new ErrorHandler("You don't have permission !!", 401));
  }

  next();
});
