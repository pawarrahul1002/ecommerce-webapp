import express from "express";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js"
import { connectDB } from "./utils/features.js";
import { Error } from "mongoose";
import { ErrorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";

const app = express();
app.use(express.json());

// app.use("uploads", express.static("uploads"));
app.use("/uploads", express.static("uploads"));
connectDB();
const port = 3000;
export const myCache = new NodeCache();

// app.get("/", (req, res) => {
//   res.send("This is default get req");
// });

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);

app.use(ErrorMiddleware);

app.listen(port, () => {
  console.log("server is listening on port", port);
});
