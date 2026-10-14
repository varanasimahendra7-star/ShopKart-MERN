import Customer from "../models/customer.model.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days, matches JWT expiry
};

export const registerCustomer = async (req, res) => {
    try {
        const {
            fullName,
            email,
            password,
            phone
        } = req.body;

        if (
            !fullName ||
            !email ||
            !password ||
            !phone
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password should be at least 6 characters"
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(
            password,
            salt
        );

        let newCustomer;

        try {
            newCustomer = await Customer.create({
                fullName,
                email,
                password: hashedPassword,
                phone
            });
        } catch (createError) {
            if (createError.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Customer already exists"
                });
            }
            throw createError;
        }

        const customerData = newCustomer.toObject();

        delete customerData.password;

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: customerData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server crashed"
        });
    }
};

export const loginCustomer = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const customer = await Customer.findOne({
            email
        });

        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatched = await bcrypt.compare(
            password,
            customer.password
        );

        if (!passwordMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(customer._id);

        res.cookie(
            "token",
            token,
            cookieOptions
        );

        res.status(200).json({
            success: true,
            message: "Login successful"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server crashed"
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const customerData = req.user.toObject();

        delete customerData.password;

        res.status(200).json(customerData);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server crashed"
        });
    }
};

export const logoutCustomer = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: cookieOptions.httpOnly,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite
        });

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server crashed"
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password should be at least 6 characters"
            });
        }

        const customer = await Customer.findById(req.user._id);

        const passwordMatched = await bcrypt.compare(
            oldPassword,
            customer.password
        );

        if (!passwordMatched) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        const salt = await bcrypt.genSalt(10);
        customer.password = await bcrypt.hash(newPassword, salt);

        await customer.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server crashed"
        });
    }
};