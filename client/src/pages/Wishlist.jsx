import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, removeFromWishlist } from "../services/api";
import Navbar from "../components/Navbar";

function Wishlist() {
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [removingId, setRemovingId] = useState(null);

    const fetchWishlist = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getWishlist();
            setWishlist(response.data.wishlist || []);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setError("Something went wrong. We couldn't load your wishlist.");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const handleRemove = async (productId) => {
        if (removingId) return; // Prevent double clicks
        setRemovingId(productId);

        try {
            await removeFromWishlist(productId);
            // Immediately update UI without reloading the page
            setWishlist((prev) => prev.filter((item) => item._id !== productId));
            // Notify Navbar to update count without page refresh
            window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        } catch (err) {
            alert(
                err.response?.data?.message || "Failed to remove product from wishlist."
            );
        } finally {
            setRemovingId(null);
        }
    };

    return (
        <>
            <Navbar />

            <div className="wishlist-container">
                <header className="page-header">
                    <h1 className="page-title">My Wishlist</h1>
                    <p className="page-subtitle">Your saved products, all in one place.</p>
                    {!loading && !error && (
                        <div className="wishlist-counter-pill">
                            {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
                        </div>
                    )}
                </header>

                {/* Loading Skeleton */}
                {loading && (
                    <div className="products-grid">
                        {[1, 2, 3].map((idx) => (
                            <div key={idx} className="product-card skeleton-card">
                                <div className="skeleton-image-wrapper">
                                    <div className="skeleton-box skeleton-image" />
                                </div>
                                <div className="product-card-body">
                                    <div className="skeleton-box skeleton-tag" />
                                    <div className="skeleton-box skeleton-title" />
                                    <div className="skeleton-box skeleton-price" />
                                    <div className="skeleton-box skeleton-stock" />
                                    <div className="skeleton-box skeleton-btn" />
                                    <div className="skeleton-box skeleton-btn" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {!loading && error && (
                    <div className="state-container error">
                        <div className="state-icon">⚠️</div>
                        <h3>Something went wrong</h3>
                        <p>We couldn't load your wishlist.</p>
                        <button className="retry-btn" onClick={fetchWishlist}>
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && wishlist.length === 0 && (
                    <div className="state-container empty-wishlist-state">
                        <div className="empty-wishlist-icon">♡</div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save products you love and come back to them anytime.</p>
                        <button
                            type="button"
                            className="browse-products-btn"
                            onClick={() => navigate("/products")}
                        >
                            Browse Products
                        </button>
                    </div>
                )}

                {/* Wishlist Grid */}
                {!loading && !error && wishlist.length > 0 && (
                    <div className="products-grid">
                        {wishlist.map((product) => {
                            const isOutOfStock = product.stock <= 0;
                            const isLowStock = product.stock > 0 && product.stock <= 5;
                            const isBeingRemoved = removingId === product._id;

                            return (
                                <div key={product._id} className="product-card wishlist-card">
                                    <div className="product-card-image-wrapper">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="product-card-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/400x300?text=No+Image";
                                            }}
                                        />
                                        <span className="product-category-tag">
                                            {product.category}
                                        </span>
                                    </div>

                                    <div className="product-card-body">
                                        <h3 className="product-card-title">{product.name}</h3>

                                        <p className="product-card-price">
                                            ₹{Number(product.price).toFixed(2)}
                                        </p>

                                        <div className="stock-status-wrapper">
                                            {isOutOfStock ? (
                                                <span className="stock-status out-of-stock">
                                                    <span className="stock-dot" /> Out of Stock
                                                </span>
                                            ) : isLowStock ? (
                                                <span className="stock-status low-stock">
                                                    <span className="stock-dot" /> Low Stock ({product.stock} left)
                                                </span>
                                            ) : (
                                                <span className="stock-status in-stock">
                                                    <span className="stock-dot" /> {product.stock} units available
                                                </span>
                                            )}
                                        </div>

                                        <div className="wishlist-card-actions">
                                            <button
                                                type="button"
                                                className="view-details-btn"
                                                onClick={() => navigate(`/products/${product._id}`)}
                                            >
                                                View Details
                                            </button>

                                            <button
                                                type="button"
                                                className="remove-wishlist-btn"
                                                onClick={() => handleRemove(product._id)}
                                                disabled={isBeingRemoved}
                                            >
                                                {isBeingRemoved
                                                    ? "Removing..."
                                                    : "Remove from Wishlist"}
                                            </button>
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

export default Wishlist;
