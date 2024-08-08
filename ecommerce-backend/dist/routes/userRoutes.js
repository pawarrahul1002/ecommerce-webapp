import express from "express";
import { getAllUsers, newUser, getUser, deleteUser, bulkUserEntry, } from "../controller/userController.js";
import { adminOnly } from "../middlewares/auth.js";
const app = express.Router();
//api/v1/user/new
app.post("/new", newUser);
//api/v1/user/bulkusers
app.post("/bulkusers", adminOnly, bulkUserEntry);
//api/v1/user/all
app.get("/all", adminOnly, getAllUsers);
// //api/v1/user/dynamicId
// app.get("/:id", getUser);
// //api/v1/user/dynamicId
// app.delete("/:id", deleteUser);
//route chaining
app.route("/:id").get(getUser).delete(adminOnly, deleteUser);
export default app;
