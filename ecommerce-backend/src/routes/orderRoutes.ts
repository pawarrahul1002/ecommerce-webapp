import express from "express";
import { newOrder,myOrder,allOrder,getOrderById,processOrder,deleteOrder } from "../controller/orderController.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", newOrder);
app.get("/my", myOrder);
app.get("/all-orders",adminOnly, allOrder);
app.get("/get-order",getOrderById);
app.put("/process-order",processOrder);
app.delete("/delete-order",deleteOrder);
// app.get("/new", (req, res) => {
//   res.send("This is default");
// });

export default app;
