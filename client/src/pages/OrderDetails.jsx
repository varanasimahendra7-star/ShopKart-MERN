import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getOrderById(id);
                setOrder(res.data?.order || null);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate("/login");
                    return;
                }
                setError(
                    err.response?.data?.message ||
                        "Unable to load order details. Please verify the order ID or permissions."
                );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id, navigate]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "PLACED":
            case "CONFIRMED":
                return "badge-placed";
            case "SHIPPED":
                return "badge-shipped";
            case "DELIVERED":
                return "badge-delivered";
            case "PENDING_PAYMENT":
                return "badge-pending";
            default:
                return "badge-default";
        }
    };

    return (
        <>
            <Navbar />

            <div className="order-details-page-container">
                <div className="order-details-top-nav">
                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => navigate("/orders")}
                    >
                        ← Back to My Orders
                    </button>
                </div>

                {loading ? (
                    <div className="state-container">
                        <div className="cart-spinner" />
                        <p>Loading order details...</p>
                    </div>
                ) : error ? (
                    <div className="state-container">
                        <div className="state-icon">⚠️</div>
                        <h3>Order Not Available</h3>
                        <p>{error}</p>
                        <button
                            type="button"
                            className="retry-btn"
                            onClick={() => navigate("/orders")}
                        >
                            Return to Orders
                        </button>
                    </div>
                ) : !order ? (
                    <div className="state-container">
                        <div className="state-icon">🔍</div>
                        <h3>Order Not Found</h3>
                        <p>The requested order does not exist or has been removed.</p>
                        <button
                            type="button"
                            className="retry-btn"
                            onClick={() => navigate("/orders")}
                        >
                            Go to Orders
                        </button>
                    </div>
                ) : (
                    <div className="order-details-content">
                        {/* Header Box */}
                        <div className="order-details-header-card">
                            <div className="order-details-header-row">
                                <div>
                                    <h1>Order Details</h1>
                                    <span className="order-id-subtitle">
                                        Order #<span className="code-font">{order._id}</span>
                                    </span>
                                </div>
                                <div className="order-badges-group">
                                    <span
                                        className={`order-status-badge ${getStatusBadgeClass(
                                            order.status
                                        )}`}
                                    >
                                        Order: {order.status}
                                    </span>
                                    <span
                                        className={`order-status-badge ${
                                            order.paymentStatus === "PAID"
                                                ? "badge-paid"
                                                : "badge-pending"
                                        }`}
                                    >
                                        Payment: {order.paymentStatus}
                                    </span>
                                </div>
                            </div>
                            <div className="order-date-text">
                                Placed on {formatDate(order.createdAt)}
                            </div>
                        </div>

                        <div className="order-details-grid">
                            {/* Left: Items list */}
                            <div className="order-items-column">
                                <div className="order-details-card">
                                    <h2>Purchased Items ({(order.items || []).length})</h2>

                                    <div className="order-detail-items-list">
                                        {(order.items || []).map((item, idx) => (
                                            <div key={idx} className="order-detail-item-row">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="order-detail-item-thumb"
                                                    />
                                                )}
                                                <div className="order-detail-item-meta">
                                                    <span className="order-detail-item-name">
                                                        {item.name}
                                                    </span>
                                                    <span className="order-detail-item-price-info">
                                                        Price: ₹{Number(item.price).toFixed(2)} × {item.quantity}
                                                    </span>
                                                    {item.product && (
                                                        <Link
                                                            to={`/products/${item.product}`}
                                                            className="order-detail-product-link"
                                                        >
                                                            Buy Again / View Product
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="order-detail-item-total">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Shipping & Payment Summary */}
                            <div className="order-sidebar-column">
                                <div className="order-details-card">
                                    <h2>Shipping Address</h2>
                                    <div className="address-display-box">
                                        <p className="address-name">
                                            {order.shippingAddress?.fullName}
                                        </p>
                                        <p className="address-line">
                                            {order.shippingAddress?.addressLine1}
                                        </p>
                                        <p className="address-line">
                                            {order.shippingAddress?.city},{" "}
                                            {order.shippingAddress?.state} -{" "}
                                            {order.shippingAddress?.pincode}
                                        </p>
                                        <p className="address-phone">
                                            <strong>Phone:</strong> {order.shippingAddress?.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="order-details-card">
                                    <h2>Payment & Invoice</h2>
                                    <div className="payment-summary-box">
                                        <div className="payment-summary-row">
                                            <span>Subtotal</span>
                                            <span>₹{Number(order.totalAmount).toFixed(2)}</span>
                                        </div>
                                        <div className="payment-summary-row">
                                            <span>Shipping</span>
                                            <span className="free-shipping-tag">FREE</span>
                                        </div>
                                        <div className="summary-divider" />
                                        <div className="payment-summary-row total-highlight">
                                            <span>Grand Total</span>
                                            <span>₹{Number(order.totalAmount).toFixed(2)}</span>
                                        </div>

                                        <div className="payment-gateway-meta">
                                            <div className="meta-info-item">
                                                <span>Payment Method:</span>
                                                <strong>Razorpay Test Gateway</strong>
                                            </div>
                                            {order.razorpayOrderId && (
                                                <div className="meta-info-item">
                                                    <span>Razorpay Order ID:</span>
                                                    <code className="code-font">{order.razorpayOrderId}</code>
                                                </div>
                                            )}
                                            {order.razorpayPaymentId && (
                                                <div className="meta-info-item">
                                                    <span>Payment ID:</span>
                                                    <code className="code-font">{order.razorpayPaymentId}</code>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default OrderDetails;
