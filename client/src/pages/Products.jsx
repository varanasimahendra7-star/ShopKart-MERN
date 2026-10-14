import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, toggleWishlist, getWishlist } from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext.jsx";

const CATEGORIES = [
    "All Categories",
    "Electronics",
    "Fashion",
    "Books",
    "Home"
];

function Products() {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [wishlistStatus, setWishlistStatus] = useState({});
    const [cartFeedback, setCartFeedback] = useState({});

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All Categories");

    useEffect(() => {
        const checkExistingWishlist = async () => {
            try {
                const res = await getWishlist();
                if (res.data?.wishlist) {
                    const initialStatus = {};
                    res.data.wishlist.forEach((item) => {
                        initialStatus[item._id] = { state: "saved" };
                    });
                    setWishlistStatus((prev) => ({ ...prev, ...initialStatus }));
                }
            } catch {
                // Ignore if not logged in
            }
        };

        checkExistingWishlist();
    }, []);

    const fetchProducts = async (searchTerm, categoryTerm) => {
        setLoading(true);
        setError("");

        try {
            const params = {};
            if (searchTerm && searchTerm.trim() !== "") {
                params.search = searchTerm.trim();
            }
            if (
                categoryTerm &&
                categoryTerm.trim() !== "" &&
                categoryTerm !== "All Categories"
            ) {
                params.category = categoryTerm.trim();
            }

            const response = await getProducts(params);
            setProducts(response.data.products || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load products. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // Debounce search input and trigger fetch on search/category change
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchProducts(search, category);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [search, category]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
    };

    const handleToggleWishlist = async (productId) => {
        const current = wishlistStatus[productId];
        if (current?.state === "saving") {
            return;
        }

        const previousState = current?.state || "unsaved";

        setWishlistStatus((prev) => ({
            ...prev,
            [productId]: { state: "saving" }
        }));

        try {
            const response = await toggleWishlist(productId);
            const isSaved = response.data?.saved;

            setWishlistStatus((prev) => ({
                ...prev,
                [productId]: {
                    state: isSaved ? "saved" : "unsaved"
                }
            }));

            // Notify Navbar to update count without page refresh
            window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        } catch (err) {
            console.error("Failed to toggle wishlist:", err);
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }

            setWishlistStatus((prev) => ({
                ...prev,
                [productId]: {
                    state: previousState,
                    error: "Unable to save product. Please try again."
                }
            }));
        }
    };

    const handleAddToCart = async (productId, stock) => {
        if (stock <= 0) return;
        if (cartFeedback[productId]?.loading) return;

        setCartFeedback((prev) => ({
            ...prev,
            [productId]: { loading: true, error: "" }
        }));

        try {
            await addToCart(productId);
            setCartFeedback((prev) => ({
                ...prev,
                [productId]: { loading: false, success: true }
            }));
            setTimeout(() => {
                setCartFeedback((prev) => ({
                    ...prev,
                    [productId]: { ...prev[productId], success: false }
                }));
            }, 2000);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/login");
                return;
            }
            setCartFeedback((prev) => ({
                ...prev,
                [productId]: {
                    loading: false,
                    error: err.response?.data?.message || "Failed to add to cart"
                }
            }));
        }
    };

    return (
        <>
            <Navbar />

            <div className="products-container">
                <header className="page-header">
                    <h1 className="page-title">Products</h1>
                    <p className="page-subtitle">Discover products you'll love</p>
                </header>

                <div className="filters-container">
                    <div className="search-bar-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search products by name..."
                            value={search}
                            onChange={handleSearchChange}
                        />
                        {search && (
                            <button
                                type="button"
                                className="clear-btn"
                                onClick={() => setSearch("")}
                                title="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="category-select-wrapper">
                        <select
                            className="category-select"
                            value={category}
                            onChange={handleCategoryChange}
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === "All Categories" ? "Category ▼" : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="products-grid">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
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

                {!loading && error && (
                    <div className="state-container error">
                        <div className="state-icon">⚠️</div>
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                        <button
                            className="retry-btn"
                            onClick={() => fetchProducts(search, category)}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="state-container empty-state">
                        <div className="state-icon">🔍</div>
                        <h3>No products found</h3>
                        <p>Try adjusting your search query or selecting a different category.</p>
                        {(search || category !== "All Categories") && (
                            <button
                                className="reset-filter-btn"
                                onClick={() => {
                                    setSearch("");
                                    setCategory("All Categories");
                                }}
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="products-grid">
                        {products.map((product) => {
                            const isOutOfStock = product.stock <= 0;
                            const isLowStock = product.stock > 0 && product.stock <= 5;
                            const status = wishlistStatus[product._id];
                            return (
                                <div key={product._id} className="product-card">
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

                                        <div className="product-card-actions">
                                            <button
                                                type="button"
                                                className="card-add-cart-btn"
                                                onClick={() => handleAddToCart(product._id, product.stock)}
                                                disabled={isOutOfStock || cartFeedback[product._id]?.loading}
                                            >
                                                {cartFeedback[product._id]?.loading
                                                    ? "Adding..."
                                                    : isOutOfStock
                                                    ? "Out of Stock"
                                                    : cartFeedback[product._id]?.success
                                                    ? "✓ Added to Cart!"
                                                    : "Add to Cart"}
                                            </button>

                                            <button
                                                type="button"
                                                className="view-details-btn"
                                                onClick={() => navigate(`/products/${product._id}`)}
                                            >
                                                View Details
                                            </button>

                                            <button
                                                type="button"
                                                className={`wishlist-action-btn ${status?.state === "saved" ? "saved" : status?.state === "saving" ? "saving" : ""}`}
                                                onClick={() => handleToggleWishlist(product._id)}
                                                disabled={status?.state === "saving"}
                                            >
                                                {status?.state === "saving"
                                                    ? "⏳ Saving..."
                                                    : status?.state === "saved"
                                                    ? "♥ Remove from Wishlist"
                                                    : "♡ Add to Wishlist"}
                                            </button>
                                        </div>

                                        {cartFeedback[product._id]?.error && (
                                            <p className="cart-card-error-text">
                                                {cartFeedback[product._id].error}
                                            </p>
                                        )}

                                        {status?.error && (
                                            <p className="wishlist-error-text">
                                                {status.error}
                                            </p>
                                        )}
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

export default Products;
