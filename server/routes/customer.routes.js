import express from "express";

import {
    loginCustomer,
    registerCustomer,
    getProfile,
    logoutCustomer,
    changePassword
} from "../controllers/customer.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

customerRoutes.post(
    "/register",
    registerCustomer
);

customerRoutes.post(
    "/login",
    loginCustomer
);

customerRoutes.get(
    "/me",
    authMiddleware,
    getProfile
);

customerRoutes.post(
    "/logout",
    authMiddleware,
    logoutCustomer
);

customerRoutes.patch(
    "/change-password",
    authMiddleware,
    changePassword
);

export default customerRoutes;