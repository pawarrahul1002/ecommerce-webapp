import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { deleteProduct, getAllCategories, getAllProducts, getAllProductsWithFilters, getLatestProduct, getProductByID, newProduct, updateProduct } from "../controller/productController.js";
import { singleUpload } from "../middlewares/multer.js";

const app = express.Router();

app.post("/new",adminOnly, singleUpload, newProduct);
app.get("/latest", getLatestProduct);
app.get("/categories", getAllCategories);
app.get("/admin-products",adminOnly, getAllProducts);
app.get("/serach-products",adminOnly, getAllProductsWithFilters);
app.get("/getProduct/:id", getProductByID);
app.put("/updateProduct/:id",adminOnly, singleUpload, updateProduct);
app.delete("/deleteProduct/:id",adminOnly, deleteProduct);

export default app;