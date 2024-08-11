import express from "express";
import { newOrder } from "../controller/orderController.js";
const app = express.Router();
app.post("/new", newOrder);
// app.get("/new", (req, res) => {
//   res.send("This is default");
// });
export default app;
