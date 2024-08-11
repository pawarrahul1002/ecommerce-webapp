import express, { NextFunction, Request, Response } from "express";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import ordersRoutes from "./routes/orderRoutes.js";

import { connectDB } from "./utils/features.js";
import { ErrorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import dotenv from "dotenv";
import morgan from "morgan";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
dotenv.config();

app.use("/uploads", express.static("uploads"));

connectDB();

const port = process.env.PORT;
export const myCache = new NodeCache();

//test
// console.log("listening on port :: ",process.env.PORT); // to check if env is working
// app.get("/", (req, res) => {
//   res.send("This is default get req");
// });

// complete test

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/orders", ordersRoutes);

app.use("/", (req, res) => {
  console.log("This is default req");
});

app.use(ErrorMiddleware);

// app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
//   console.error(error.stack); // Log the error for debugging purposes
//   console.log("\n\n\n but server is running please fix error");
//   res.status(500).json({
//     message: "Something went wrong",
//     error: error.message, // Provide the error message (optional)
//   });
// });


app.listen(port, () => {
  console.log("server is listening on port", port);
});
 