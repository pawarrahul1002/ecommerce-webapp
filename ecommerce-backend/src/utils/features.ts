import mongoose from "mongoose";

export const connectDB = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017", { dbName: "ecommerce_v1" })
    .then((c) => console.log(`db connected to ${c.connection.host}`))
    .catch((e) => {
      console.log(e);
    });
};
