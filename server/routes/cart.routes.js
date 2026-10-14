import express from "express";
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart
} from "../controllers/cart.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const cartRoutes = express.Router();

cartRoutes.post("/:productId", authMiddleware, addToCart);
cartRoutes.get("/", authMiddleware, getCart);
cartRoutes.patch("/:productId", authMiddleware, updateCartQuantity);
cartRoutes.delete("/:productId", authMiddleware, removeFromCart);

export default cartRoutes;
