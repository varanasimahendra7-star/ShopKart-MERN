import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getOrders,
    getOrderById
} from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const orderRoutes = express.Router();

orderRoutes.post("/create-payment-order", authMiddleware, createPaymentOrder);
orderRoutes.post("/verify-payment", authMiddleware, verifyPayment);
orderRoutes.get("/", authMiddleware, getOrders);
orderRoutes.get("/:id", authMiddleware, getOrderById);

export default orderRoutes;
