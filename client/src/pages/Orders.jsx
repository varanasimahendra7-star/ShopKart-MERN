import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrders } from "../services/api";

function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getOrders();
            setOrders(res.data?.orders || []);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setError(err.response?.data?.message || "Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
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

            <div className="orders-page-container">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <p className="orders-subheading">
                        Track, review, and manage your recent ShopKart purchases
                    </p>
                </div>

                {loading ? (
                    <div className="orders-state-container">
                        <div className="cart-spinner" />
                        <p>Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="orders-state-container">
                        <div className="state-icon">⚠️</div>
                        <h3>Unable to load orders</h3>
                        <p>{error}</p>
                        <button type="button" className="retry-btn" onClick={fetchOrders}>
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="orders-state-container empty-orders">
                        <div className="orders-empty-icon">📦</div>
                        <h2>You have not placed any orders yet</h2>
                        <p>When you complete a purchase, your orders will appear here.</p>
                        <button
                            type="button"
                            className="cart-browse-btn"
                            onClick={() => navigate("/products")}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => {
                            const totalItemsCount = (order.items || []).reduce(
                                (acc, item) => acc + (item.quantity || 0),
                                0
                            );

                            return (
                                <div key={order._id} className="order-card">
                                    <div className="order-card-header">
                                        <div className="order-header-info">
                                            <div className="order-meta-group">
                                                <span className="order-meta-title">Order Placed</span>
                                                <span className="order-meta-content">
                                                    {formatDate(order.createdAt)}
                                                </span>
                                            </div>
                                            <div className="order-meta-group">
                                                <span className="order-meta-title">Total</span>
                                                <span className="order-meta-content">
                                                    ₹{Number(order.totalAmount).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="order-meta-group">
                                                <span className="order-meta-title">Ship To</span>
                                                <span className="order-meta-content">
                                                    {order.shippingAddress?.fullName || "Customer"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="order-header-actions">
                                            <span className="order-id-label">
                                                Order #<span className="code-font">{order._id}</span>
                                            </span>
                                            <span
                                                className={`order-status-badge ${getStatusBadgeClass(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-card-body">
                                        <div className="order-items-preview">
                                            {(order.items || []).map((item, idx) => (
                                                <div key={idx} className="order-item-row">
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="order-item-image"
                                                        />
                                                    )}
                                                    <div className="order-item-info">
                                                        <span className="order-item-name">
                                                            {item.name}
                                                        </span>
                                                        <span className="order-item-qty">
                                                            Qty: {item.quantity} × ₹
                                                            {Number(item.price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-card-footer">
                                            <span className="order-items-summary-text">
                                                {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"}
                                            </span>
                                            <Link
                                                to={`/orders/${order._id}`}
                                                className="order-view-details-btn"
                                            >
                                                View Order Details →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

export default Orders;
