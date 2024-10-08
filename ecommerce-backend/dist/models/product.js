import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"],
    },
    photo: {
        type: String,
        required: [true, "Please add photo"],
    },
    price: {
        type: Number,
        required: [true, "Please add price"],
    },
    stock: {
        type: Number,
        required: [true, "Please add stock"],
    },
    category: {
        type: String,
        required: [true, "Please add category"],
        trim: true
    },
}, {
    timestamps: true,
});
export const Product = mongoose.model("Product", productSchema);
