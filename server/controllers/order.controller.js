import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

// Helper: validate shipping address fields
const validateShippingAddress = (address) => {
    if (!address || typeof address !== "object") {
        return "Shipping address is required";
    }

    const { fullName, phone, addressLine1, city, state, pincode } = address;

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        return "Full name is required";
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
        return "Phone number is required";
    }

    const cleanedPhone = phone.trim().replace(/^(\+91|91|0)/, "").replace(/[\s-]/g, "");
    if (!/^\d{10}$/.test(cleanedPhone)) {
        return "Phone number must be a valid 10-digit number";
    }

    if (!addressLine1 || typeof addressLine1 !== "string" || !addressLine1.trim()) {
        return "Address line 1 is required";
    }

    if (!city || typeof city !== "string" || !city.trim()) {
        return "City is required";
    }

    if (!state || typeof state !== "string" || !state.trim()) {
        return "State is required";
    }

    if (!pincode || typeof pincode !== "string" || !pincode.trim()) {
        return "Pincode is required";
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
        return "Pincode must be exactly 6 digits";
    }

    return null;
};

// @desc    Create a pending ShopKart order and Razorpay test order
// @route   POST /orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        // 1. Validate shipping address
        const addressError = validateShippingAddress(shippingAddress);
        if (addressError) {
            return res.status(400).json({
                success: false,
                message: addressError
            });
        }

        // 2. Fetch authenticated customer and their cart
        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Please add items to cart before checkout."
            });
        }

        // 3. Load latest product documents, validate existence and stock, and compute server-side total
        let totalAmount = 0;
        const snapshotItems = [];

        for (const cartItem of customer.cart) {
            if (!cartItem.product) continue;

            const product = await Product.findById(cartItem.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "One or more products in your cart are no longer available"
                });
            }

            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, in cart: ${cartItem.quantity}`
                });
            }

            const itemPrice = Number(product.price);
            totalAmount += itemPrice * cartItem.quantity;

            snapshotItems.push({
                product: product._id,
                name: product.name,
                price: itemPrice,
                quantity: cartItem.quantity,
                image: product.image
            });
        }

        if (snapshotItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart contains no valid items."
            });
        }

        // 4. Create initial ShopKart order in MongoDB
        const cleanAddress = {
            fullName: shippingAddress.fullName.trim(),
            phone: shippingAddress.phone.trim(),
            addressLine1: shippingAddress.addressLine1.trim(),
            city: shippingAddress.city.trim(),
            state: shippingAddress.state.trim(),
            pincode: shippingAddress.pincode.trim()
        };

        const newOrder = new Order({
            user: customer._id,
            items: snapshotItems,
            shippingAddress: cleanAddress,
            totalAmount: Math.round(totalAmount * 100) / 100,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        await newOrder.save();

        // 5. Create Razorpay Test Order
        const amountInPaise = Math.round(newOrder.totalAmount * 100);
        let razorpayOrderId;

        try {
            const receiptId = `rcpt_${newOrder._id.toString().slice(-10)}`;
            const rzpOrder = await razorpay.orders.create({
                amount: amountInPaise,
                currency: "INR",
                receipt: receiptId
            });
            razorpayOrderId = rzpOrder.id;
        } catch (rzpErr) {
            console.error(
                "Razorpay order creation error:",
                rzpErr?.error?.description || rzpErr?.message || rzpErr
            );
            if (process.env.NODE_ENV === "test") {
                razorpayOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            } else {
                await Order.findByIdAndDelete(newOrder._id);
                const rzpMsg =
                    rzpErr?.error?.description ||
                    rzpErr?.message ||
                    "Authentication failed";
                return res.status(502).json({
                    success: false,
                    message: `Razorpay payment gateway error: ${rzpMsg}. Please check that RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env are valid Razorpay Test Mode credentials.`
                });
            }
        }

        newOrder.razorpayOrderId = razorpayOrderId;
        await newOrder.save();

        return res.status(200).json({
            success: true,
            shopKartOrderId: newOrder._id,
            razorpayOrderId: newOrder.razorpayOrderId,
            amount: amountInPaise,
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkartKey"
        });
    } catch (error) {
        console.error("Error creating payment order:", error);
        return res.status(500).json({
            success: false,
            message: "Server error creating payment order"
        });
    }
};

// @desc    Verify Razorpay payment signature, mark order PAID/PLACED, and clear cart
// @route   POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ShopKart order ID"
            });
        }

        // 1. Find the ShopKart order
        const order = await Order.findById(shopKartOrderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // 2. Verify order belongs to authenticated user
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this order"
            });
        }

        // 3. Trusted Razorpay order ID from database
        const trustedRazorpayOrderId = order.razorpayOrderId;
        if (!trustedRazorpayOrderId) {
            return res.status(400).json({
                success: false,
                message: "Order does not have an associated Razorpay order ID"
            });
        }

        // 4. Verify HMAC SHA256 signature
        const secret = process.env.RAZORPAY_KEY_SECRET || "shopkartSecretKey123456";
        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${trustedRazorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature. Payment verification failed."
            });
        }

        // 5. Signature valid -> Update order status
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // 6. Deduct product stock for purchased items
        for (const item of order.items) {
            if (item.product) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        // 7. Clear user's cart in database
        const customer = await Customer.findById(req.user._id);
        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully and order placed",
            order
        });
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({
            success: false,
            message: "Server error verifying payment"
        });
    }
};

// @desc    Get all orders for authenticated customer (newest first)
// @route   GET /orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching orders"
        });
    }
};

// @desc    Get single order details by ID (authenticated owner only)
// @route   GET /orders/:id
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Ensure user can only access their own order
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access to this order"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching order details"
        });
    }
};
