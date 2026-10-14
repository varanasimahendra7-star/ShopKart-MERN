import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const customer = await Customer.findById(
            decoded.customerId
        );

        if (!customer) {
            return res.status(401).json({
                message: "Customer not found"
            });
        }

        req.user = customer;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};

export default authMiddleware;