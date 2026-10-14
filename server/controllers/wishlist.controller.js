import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// @desc    Add product to authenticated customer's wishlist
// @route   POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Check if product exists in MongoDB
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Find current customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!customer.wishlist) {
            customer.wishlist = [];
        }

        // 4. Check if product is already in wishlist
        const alreadyInWishlist = customer.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyInWishlist) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist"
            });
        }

        // 5. Add product ObjectId to wishlist
        customer.wishlist.push(product._id);
        await customer.save();

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Get authenticated customer's populated wishlist
// @route   GET /wishlist
export const getWishlist = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name description price category image stock"
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Filter out any null entries if a product was deleted
        const validWishlist = (customer.wishlist || []).filter(Boolean);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist
        });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Remove product from authenticated customer's wishlist
// @route   DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find current customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!customer.wishlist) {
            customer.wishlist = [];
        }

        // 3. Check if product exists in customer's wishlist
        const productIndex = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist"
            });
        }

        // 4. Remove product ObjectId from wishlist
        customer.wishlist.splice(productIndex, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Toggle product in authenticated customer's wishlist
// @route   PATCH /wishlist/:productId/toggle
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Check if product exists in MongoDB
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Find current customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!customer.wishlist) {
            customer.wishlist = [];
        }

        // 4. Check if product is already in wishlist
        const productIndex = customer.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (productIndex === -1) {
            // Product is NOT in wishlist -> Add it
            customer.wishlist.push(product._id);
            await customer.save();

            return res.status(200).json({
                success: true,
                saved: true,
                message: "Product added to wishlist"
            });
        } else {
            // Product IS in wishlist -> Remove it
            customer.wishlist.splice(productIndex, 1);
            await customer.save();

            return res.status(200).json({
                success: true,
                saved: false,
                message: "Product removed from wishlist"
            });
        }
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

