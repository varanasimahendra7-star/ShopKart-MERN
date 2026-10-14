import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderById } from "../services/api";

function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await getOrderById(id);
                setOrder(res.data?.order || null);
            } catch (err) {
                console.error("Failed to fetch confirmed order:", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    return (
        <>
            <Navbar />

            <div className="order-success-page-container">
                <div className="order-success-card">
                    <div className="success-icon-badge">✓</div>
                    <h1 className="success-title">Order Placed Successfully!</h1>
                    <p className="success-subtitle">
                        Thank you for your purchase. Your payment has been verified and your order is now confirmed.
                    </p>

                    <div className="order-meta-box">
                        <div className="order-meta-row">
                            <span className="order-meta-label">Order ID:</span>
                            <span className="order-meta-value code-font">{id}</span>
                        </div>

                        {order && (
                            <>
                                <div className="order-meta-row">
                                    <span className="order-meta-label">Total Amount:</span>
                                    <span className="order-meta-value amount-highlight">
                                        ₹{Number(order.totalAmount).toFixed(2)}
                                    </span>
                                </div>

                                <div className="order-meta-row">
                                    <span className="order-meta-label">Payment Status:</span>
                                    <span className="order-status-badge badge-paid">
                                        {order.paymentStatus}
                                    </span>
                                </div>

                                <div className="order-meta-row">
                                    <span className="order-meta-label">Order Status:</span>
                                    <span className="order-status-badge badge-placed">
                                        {order.status}
                                    </span>
                                </div>

                                {order.shippingAddress && (
                                    <div className="order-delivery-preview">
                                        <strong>Deliver to:</strong> {order.shippingAddress.fullName},{" "}
                                        {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                                        {order.shippingAddress.pincode}
                                    </div>
                                )}
                            </>
                        )}

                        {!order && !loading && (
                            <div className="order-meta-row">
                                <span className="order-meta-label">Status:</span>
                                <span className="order-status-badge badge-placed">PLACED</span>
                            </div>
                        )}
                    </div>

                    <div className="success-actions-row">
                        <button
                            type="button"
                            className="view-orders-btn"
                            onClick={() => navigate("/orders")}
                        >
                            View My Orders
                        </button>
                        <Link to="/products" className="continue-shopping-link">
                            Continue Shopping →
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OrderSuccess;
