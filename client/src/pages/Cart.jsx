import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
    const navigate = useNavigate();
    const {
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        updateQuantity,
        removeFromCart,
        refreshCart
    } = useCart();

    const [busyProductId, setBusyProductId] = useState(null);
    const [actionError, setActionError] = useState("");

    const handleQuantityChange = async (productId, nextQuantity) => {
        if (busyProductId) return;
        setBusyProductId(productId);
        setActionError("");

        try {
            await updateQuantity(productId, nextQuantity);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to update quantity.");
        } finally {
            setBusyProductId(null);
        }
    };

    const handleRemove = async (productId) => {
        if (busyProductId) return;
        setBusyProductId(productId);
        setActionError("");

        try {
            await removeFromCart(productId);
        } catch (err) {
            setActionError(err.response?.data?.message || "Failed to remove item.");
        } finally {
            setBusyProductId(null);
        }
    };

    const handleCheckout = () => {
        navigate("/checkout");
    };

    return (
        <>
            <Navbar />

            <div className="cart-page-container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <p className="cart-subheading">
                        {cartCount > 0
                            ? `You have ${cartCount} ${cartCount === 1 ? "item" : "items"} in your cart`
                            : "Your cart is currently empty"}
                    </p>
                </div>

                {loading ? (
                    <div className="cart-loading-container">
                        <div className="cart-spinner" />
                        <p>Loading your cart...</p>
                    </div>
                ) : error ? (
                    <div className="cart-error-container">
                        <div className="cart-error-icon">⚠️</div>
                        <p className="cart-error-message">{error}</p>
                        <button
                            type="button"
                            className="cart-retry-btn"
                            onClick={refreshCart}
                        >
                            Try Again
                        </button>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="cart-empty-container">
                        <div className="cart-empty-icon">🛒</div>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <button
                            type="button"
                            className="cart-browse-btn"
                            onClick={() => navigate("/products")}
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <>
                        {actionError && (
                            <div className="cart-action-error-banner">
                                <span>⚠️ {actionError}</span>
                                <button
                                    type="button"
                                    onClick={() => setActionError("")}
                                    className="cart-close-alert"
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="cart-layout">
                            {/* Left Column: Cart Items List */}
                            <div className="cart-items-section">
                                <div className="cart-items-header-bar">
                                    <span>Item</span>
                                    <span>Price</span>
                                    <span>Quantity</span>
                                    <span>Total</span>
                                </div>

                                <div className="cart-items-list">
                                    {cartItems.map((item) => {
                                        const product = item.product;
                                        if (!product) return null;

                                        const isBusy = busyProductId === product._id;
                                        const isMin = item.quantity <= 1;
                                        const isMax = item.quantity >= product.stock;
                                        const itemTotal = (
                                            product.price * item.quantity
                                        ).toFixed(2);

                                        return (
                                            <div
                                                key={product._id}
                                                className="cart-item-row"
                                            >
                                                <div className="cart-item-info">
                                                    <Link
                                                        to={`/products/${product._id}`}
                                                        className="cart-item-image-link"
                                                    >
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="cart-item-image"
                                                        />
                                                    </Link>
                                                    <div className="cart-item-details">
                                                        <Link
                                                            to={`/products/${product._id}`}
                                                            className="cart-item-title"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <span className="cart-item-category">
                                                            {product.category}
                                                        </span>
                                                        <span className="cart-item-stock-status">
                                                            {product.stock <= 5
                                                                ? `Only ${product.stock} left in stock`
                                                                : `In Stock (${product.stock})`}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="cart-remove-link"
                                                            onClick={() =>
                                                                handleRemove(product._id)
                                                            }
                                                            disabled={isBusy}
                                                        >
                                                            {isBusy ? "Removing..." : "Remove"}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="cart-item-unit-price">
                                                    ₹{Number(product.price).toFixed(2)}
                                                </div>

                                                <div className="cart-item-quantity-cell">
                                                    <div className="cart-qty-control">
                                                        <button
                                                            type="button"
                                                            className="qty-btn"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    product._id,
                                                                    item.quantity - 1
                                                                )
                                                            }
                                                            disabled={isMin || isBusy}
                                                            aria-label="Decrease quantity"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="qty-display">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="qty-btn"
                                                            onClick={() =>
                                                                handleQuantityChange(
                                                                    product._id,
                                                                    item.quantity + 1
                                                                )
                                                            }
                                                            disabled={isMax || isBusy}
                                                            aria-label="Increase quantity"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    {isMax && (
                                                        <span className="max-qty-notice">
                                                            Max stock reached
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="cart-item-total-price">
                                                    ₹{itemTotal}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="cart-bottom-actions">
                                    <button
                                        type="button"
                                        className="cart-continue-shopping-btn"
                                        onClick={() => navigate("/products")}
                                    >
                                        ← Continue Shopping
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Order Summary */}
                            <div className="cart-summary-section">
                                <div className="order-summary-card">
                                    <h2>Order Summary</h2>

                                    <div className="summary-row">
                                        <span>Total Items</span>
                                        <span>{cartCount}</span>
                                    </div>

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
                                        <span>Estimated Total</span>
                                        <span className="total-amount">
                                            ₹{subtotal.toFixed(2)}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="checkout-btn"
                                        onClick={handleCheckout}
                                    >
                                        Proceed to Checkout
                                    </button>

                                    <div className="summary-trust-badges">
                                        <span>🔒 Secure Checkout</span>
                                        <span>🚚 Free Standard Delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

export default Cart;
