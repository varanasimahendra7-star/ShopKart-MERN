import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// @desc    Add product to cart or increment quantity
// @route   POST /cart/:productId
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find product
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

        if (!customer.cart) {
            customer.cart = [];
        }

        // 4. Check if product already exists in cart
        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (cartItemIndex === -1) {
            // New item, quantity = 1
            if (1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Product is out of stock"
                });
            }
            customer.cart.push({
                product: product._id,
                quantity: 1
            });
        } else {
            // Existing item, increment quantity
            const newQuantity = customer.cart[cartItemIndex].quantity + 1;
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity would exceed available stock"
                });
            }
            customer.cart[cartItemIndex].quantity = newQuantity;
        }

        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: customer.cart
        });
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Get authenticated customer's cart
// @route   GET /cart
export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        // Filter out any entries where product no longer exists
        const validCart = (customer.cart || []).filter(
            (item) => item.product !== null && typeof item.product !== "undefined"
        );

        return res.status(200).json({
            success: true,
            cart: validCart
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Update cart item quantity
// @route   PATCH /cart/:productId
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // 1. Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Validate quantity
        const parsedQty = Number(quantity);
        if (
            typeof quantity === "undefined" ||
            isNaN(parsedQty) ||
            !Number.isInteger(parsedQty) ||
            parsedQty < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be an integer of at least 1"
            });
        }

        // 3. Find product to check stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (parsedQty > product.stock) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds available stock"
            });
        }

        // 4. Find customer and update item
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart"
            });
        }

        customer.cart[cartItemIndex].quantity = parsedQty;
        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated",
            cart: customer.cart
        });
    } catch (error) {
        console.error("Error updating cart quantity:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// @desc    Remove product from cart
// @route   DELETE /cart/:productId
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // 2. Find customer
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!customer.cart) {
            customer.cart = [];
        }

        const cartItemIndex = customer.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (cartItemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        customer.cart.splice(cartItemIndex, 1);
        await customer.save();

        await customer.populate({
            path: "cart.product",
            select: "name description price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: customer.cart
        });
    } catch (error) {
        console.error("Error removing from cart:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
