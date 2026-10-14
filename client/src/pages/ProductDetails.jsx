import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, getWishlist, toggleWishlist } from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext.jsx";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cartMessage, setCartMessage] = useState("");
    const [addingCart, setAddingCart] = useState(false);
    const [wishlistState, setWishlistState] = useState("default");
    const [wishlistError, setWishlistError] = useState("");

    const fetchProduct = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getProductById(id);
            setProduct(response.data.product);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load product details."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id, fetchProduct]);

    useEffect(() => {
        const checkWishlist = async () => {
            try {
                const res = await getWishlist();
                if (res.data?.wishlist?.some((item) => item._id === id)) {
                    setWishlistState("saved");
                } else {
                    setWishlistState("default");
                }
            } catch {
                // Ignore if not authenticated
            }
        };

        if (id) {
            checkWishlist();
        }
    }, [id]);

    const handleAddToCart = async () => {
        if (!product || product.stock <= 0 || addingCart) return;
        setAddingCart(true);
        setCartMessage("");

        try {
            await addToCart(product._id);
            setCartMessage("Added to Cart!");
            setTimeout(() => {
                setCartMessage("");
            }, 2500);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setCartMessage(err.response?.data?.message || "Failed to add to cart");
        } finally {
            setAddingCart(false);
        }
    };

    const handleToggleWishlist = async () => {
        if (wishlistState === "saving") return;

        const previousState = wishlistState;
        setWishlistState("saving");
        setWishlistError("");

        try {
            const res = await toggleWishlist(id);
            setWishlistState(res.data?.saved ? "saved" : "default");
            window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        } catch (err) {
            console.error("Failed to toggle wishlist in details:", err);
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setWishlistState(previousState);
            setWishlistError("Unable to update wishlist. Please try again.");
        }
    };

    const isOutOfStock = product?.stock <= 0;
    const isLowStock = product?.stock > 0 && product?.stock <= 5;

    return (
        <>
            <Navbar />

            <div className="product-details-container">
                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate("/products")}
                >
                    &larr; Back to Products
                </button>

                {loading && (
                    <div className="product-details-card skeleton-details-card">
                        <div className="skeleton-image-section skeleton-box" />
                        <div className="product-details-info-section">
                            <div className="skeleton-box skeleton-tag" />
                            <div className="skeleton-box skeleton-title" style={{ height: "36px" }} />
                            <div className="skeleton-box skeleton-price" style={{ height: "32px", width: "120px" }} />
                            <div className="skeleton-box skeleton-desc" style={{ height: "80px" }} />
                            <div className="skeleton-box skeleton-stock" />
                            <div className="skeleton-box skeleton-btn" style={{ height: "46px" }} />
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-container error">
                        <div className="state-icon">⚠️</div>
                        <h3>Oops!</h3>
                        <p>{error}</p>
                        <button className="retry-btn" onClick={fetchProduct}>
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && product && (
                    <div className="product-details-card">
                        <div className="product-details-image-section">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="product-details-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/600x450?text=No+Image";
                                }}
                            />
                        </div>

                        <div className="product-details-info-section">
                            <span className="product-details-category">
                                {product.category}
                            </span>

                            <h1 className="product-details-title">{product.name}</h1>

                            <div className="product-details-price">
                                ₹{Number(product.price).toFixed(2)}
                            </div>

                            <div className="product-details-stock-info">
                                <strong>Availability: </strong>
                                {isOutOfStock ? (
                                    <span className="stock-status out-of-stock">
                                        <span className="stock-dot" /> Out of Stock
                                    </span>
                                ) : isLowStock ? (
                                    <span className="stock-status low-stock">
                                        <span className="stock-dot" /> Low Stock ({product.stock} units remaining)
                                    </span>
                                ) : (
                                    <span className="stock-status in-stock">
                                        <span className="stock-dot" /> In Stock ({product.stock} units available)
                                    </span>
                                )}
                            </div>

                            <div className="product-details-description">
                                <h3>About this item</h3>
                                <p>{product.description}</p>
                            </div>

                            <div className="product-details-actions">
                                <button
                                    type="button"
                                    className="add-to-cart-btn"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock || addingCart}
                                >
                                    {addingCart ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                </button>

                                <button
                                    type="button"
                                    className={`details-wishlist-btn ${wishlistState === "saved" ? "saved" : wishlistState === "saving" ? "saving" : ""}`}
                                    onClick={handleToggleWishlist}
                                    disabled={wishlistState === "saving"}
                                >
                                    {wishlistState === "saving"
                                        ? "⏳ Saving..."
                                        : wishlistState === "saved"
                                        ? "♥ Remove from Wishlist"
                                        : "♡ Add to Wishlist"}
                                </button>
                            </div>

                            {cartMessage && (
                                <div className="cart-feedback-badge">
                                    ✓ {cartMessage}
                                </div>
                            )}

                            {wishlistError && (
                                <p className="wishlist-error-text">
                                    {wishlistError}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ProductDetails;
