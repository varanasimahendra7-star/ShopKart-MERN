import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { createPaymentOrder, verifyPayment } from "../services/api";

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof window !== "undefined" && window.Razorpay) {
            return resolve(true);
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

function Checkout() {
    const navigate = useNavigate();
    const { cartItems, cartCount, subtotal, loading: cartLoading, clearCart } = useCart();

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [pageError, setPageError] = useState("");
    const [paymentError, setPaymentError] = useState("");

    // Preload Razorpay checkout script
    useEffect(() => {
        loadRazorpayScript();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!form.fullName.trim()) {
            errors.fullName = "Full name is required";
        }

        const cleanedPhone = form.phone.trim().replace(/^(\+91|91|0)/, "").replace(/[\s-]/g, "");
        if (!cleanedPhone) {
            errors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(cleanedPhone)) {
            errors.phone = "Enter a valid 10-digit phone number";
        }

        if (!form.addressLine1.trim()) {
            errors.addressLine1 = "Address is required";
        }

        if (!form.city.trim()) {
            errors.city = "City is required";
        }

        if (!form.state.trim()) {
            errors.state = "State is required";
        }

        if (!form.pincode.trim()) {
            errors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(form.pincode.trim())) {
            errors.pincode = "Pincode must be exactly 6 digits";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setPageError("");
        setPaymentError("");

        if (cartItems.length === 0) {
            setPageError("Your cart is empty. Please add items before checking out.");
            return;
        }

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            // 1. Create order on backend
            const orderRes = await createPaymentOrder(form);
            const {
                shopKartOrderId,
                razorpayOrderId,
                amount,
                currency,
                key
            } = orderRes.data;

            // 2. Ensure Razorpay script is loaded
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded || !window.Razorpay) {
                setPageError(
                    "Unable to load Razorpay payment gateway. Please check your internet connection."
                );
                setSubmitting(false);
                return;
            }

            // 3. Configure Razorpay options
            const options = {
                key,
                amount,
                currency: currency || "INR",
                name: "ShopKart",
                description: "ShopKart Order Payment",
                order_id: razorpayOrderId,
                prefill: {
                    name: form.fullName.trim(),
                    contact: form.phone.trim()
                },
                theme: {
                    color: "#2563eb"
                },
                handler: async function (response) {
                    try {
                        setSubmitting(true);
                        // Send payment details to backend for signature verification
                        const verifyRes = await verifyPayment({
                            shopKartOrderId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        if (verifyRes.data?.success) {
                            // Clear cart in frontend CartContext immediately
                            clearCart();
                            navigate(`/order-success/${shopKartOrderId}`);
                        } else {
                            setPaymentError(
                                verifyRes.data?.message ||
                                    "Payment verification failed. Your cart has NOT been cleared."
                            );
                        }
                    } catch (err) {
                        setPaymentError(
                            err.response?.data?.message ||
                                "Payment verification failed. Your cart has NOT been cleared. Please contact support."
                        );
                    } finally {
                        setSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false);
                        setPaymentError("Payment was cancelled. Your cart has not been cleared.");
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on("payment.failed", function (response) {
                setSubmitting(false);
                setPaymentError(
                    `Payment failed: ${response.error?.description || "Transaction declined"}. Your cart has not been cleared. Please try again.`
                );
            });

            rzp.open();
        } catch (err) {
            setSubmitting(false);
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setPageError(
                err.response?.data?.message || "Failed to initialize order checkout. Please try again."
            );
        }
    };

    if (cartLoading) {
        return (
            <>
                <Navbar />
                <div className="state-container">
                    <div className="cart-spinner" />
                    <p>Loading checkout...</p>
                </div>
            </>
        );
    }

    if (cartItems.length === 0) {
        return (
            <>
                <Navbar />
                <div className="checkout-empty-container">
                    <div className="checkout-empty-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>You cannot proceed to checkout without any products in your cart.</p>
                    <button
                        type="button"
                        className="cart-browse-btn"
                        onClick={() => navigate("/products")}
                    >
                        Browse Products
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="checkout-page-container">
                <div className="checkout-header">
                    <h1>Checkout</h1>
                    <p className="checkout-subheading">
                        Complete your shipping details and proceed to secure payment
                    </p>
                </div>

                {pageError && (
                    <div className="cart-action-error-banner">
                        <span>⚠️ {pageError}</span>
                        <button
                            type="button"
                            onClick={() => setPageError("")}
                            className="cart-close-alert"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {paymentError && (
                    <div className="cart-action-error-banner">
                        <span>⚠️ {paymentError}</span>
                        <button
                            type="button"
                            onClick={() => setPaymentError("")}
                            className="cart-close-alert"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="checkout-layout">
                    {/* Left Column: Shipping Form */}
                    <div className="checkout-form-section">
                        <div className="checkout-card">
                            <h2>1. Shipping Address</h2>

                            <form onSubmit={handlePlaceOrder} noValidate>
                                <div className="checkout-form-grid">
                                    <div className="checkout-form-group full-width">
                                        <label htmlFor="fullName">Full Name *</label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            placeholder="e.g. John Doe"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            className={fieldErrors.fullName ? "input-error" : ""}
                                            disabled={submitting}
                                        />
                                        {fieldErrors.fullName && (
                                            <span className="field-error-text">
                                                {fieldErrors.fullName}
                                            </span>
                                        )}
                                    </div>

                                    <div className="checkout-form-group full-width">
                                        <label htmlFor="phone">Phone Number (10 digits) *</label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="e.g. 9876543210"
                                            value={form.phone}
                                            onChange={handleChange}
                                            className={fieldErrors.phone ? "input-error" : ""}
                                            disabled={submitting}
                                        />
                                        {fieldErrors.phone && (
                                            <span className="field-error-text">
                                                {fieldErrors.phone}
                                            </span>
                                        )}
                                    </div>

                                    <div className="checkout-form-group full-width">
                                        <label htmlFor="addressLine1">Address (House, Street, Area) *</label>
                                        <input
                                            id="addressLine1"
                                            name="addressLine1"
                                            type="text"
                                            placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
                                            value={form.addressLine1}
                                            onChange={handleChange}
                                            className={fieldErrors.addressLine1 ? "input-error" : ""}
                                            disabled={submitting}
                                        />
                                        {fieldErrors.addressLine1 && (
                                            <span className="field-error-text">
                                                {fieldErrors.addressLine1}
                                            </span>
                                        )}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="city">City *</label>
                                        <input
                                            id="city"
                                            name="city"
                                            type="text"
                                            placeholder="e.g. Bengaluru"
                                            value={form.city}
                                            onChange={handleChange}
                                            className={fieldErrors.city ? "input-error" : ""}
                                            disabled={submitting}
                                        />
                                        {fieldErrors.city && (
                                            <span className="field-error-text">
                                                {fieldErrors.city}
                                            </span>
                                        )}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="state">State *</label>
                                        <input
                                            id="state"
                                            name="state"
                                            type="text"
                                            placeholder="e.g. Karnataka"
                                            value={form.state}
                                            onChange={handleChange}
                                            className={fieldErrors.state ? "input-error" : ""}
                                            disabled={submitting}
                                        />
                                        {fieldErrors.state && (
                                            <span className="field-error-text">
                                                {fieldErrors.state}
                                            </span>
                                        )}
                                    </div>

                                    <div className="checkout-form-group">
                                        <label htmlFor="pincode">Pincode (6 digits) *</label>
                                        <input
                                            id="pincode"
                                            name="pincode"
                                            type="text"
                                            maxLength="6"
                                            placeholder="e.g. 560001"
                                            value={form.pincode}
                                            onChange={handleChange}
                                            className={fieldErrors.pincode ? "input-error" : ""}
                                            disabled={submitting}
                                        />
                                        {fieldErrors.pincode && (
                                            <span className="field-error-text">
                                                {fieldErrors.pincode}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="checkout-payment-info-box">
                                    <div className="payment-gateway-badge">
                                        <span>🔒 Razorpay Test Mode Checkout</span>
                                    </div>
                                    <p>
                                        Clicking &quot;Pay with Razorpay&quot; will open the secure Razorpay payment modal where you can complete payment using Test Cards, UPI, or Netbanking.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    className="checkout-place-order-btn"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Processing Order..."
                                        : `Pay ₹${subtotal.toFixed(2)} with Razorpay`}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="checkout-summary-section">
                        <div className="checkout-summary-card">
                            <h2>Order Summary ({cartCount} {cartCount === 1 ? "item" : "items"})</h2>

                            <div className="checkout-items-list">
                                {cartItems.map((item) => {
                                    const product = item.product;
                                    if (!product) return null;
                                    const lineTotal = (product.price * item.quantity).toFixed(2);

                                    return (
                                        <div key={product._id} className="checkout-item-row">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="checkout-item-thumb"
                                            />
                                            <div className="checkout-item-details">
                                                <span className="checkout-item-name">
                                                    {product.name}
                                                </span>
                                                <span className="checkout-item-meta">
                                                    Qty: {item.quantity} × ₹{Number(product.price).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="checkout-item-price">
                                                ₹{lineTotal}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="free-shipping-tag">FREE</span>
                            </div>

                            <div className="summary-divider" />

                            <div className="summary-row total-row">
                                <span>Total to Pay</span>
                                <span className="total-amount">
                                    ₹{subtotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="summary-trust-badges">
                                <span>🔒 256-bit Encrypted SSL Payment</span>
                                <span>🛡️ 100% Purchase Protection</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Checkout;
