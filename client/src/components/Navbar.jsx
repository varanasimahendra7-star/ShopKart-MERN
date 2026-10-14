import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logoutCustomer, getWishlist } from "../services/api";
import { useCart } from "../context/CartContext.jsx";

function Navbar({ wishlistCount: propWishlistCount }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartCount, loading: cartLoading } = useCart();

    const [count, setCount] = useState(
        typeof propWishlistCount === "number" ? propWishlistCount : null
    );
    const [loading, setLoading] = useState(true);

    const fetchWishlistCount = useCallback(async () => {
        try {
            const response = await getWishlist();
            if (typeof response.data?.count === "number") {
                setCount(response.data.count);
            }
        } catch {
            setCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlistCount();
    }, [fetchWishlistCount]);

    useEffect(() => {
        if (typeof propWishlistCount === "number") {
            setCount(propWishlistCount);
            setLoading(false);
        }
    }, [propWishlistCount]);

    useEffect(() => {
        const handleWishlistUpdated = () => {
            fetchWishlistCount();
        };

        window.addEventListener("wishlistUpdated", handleWishlistUpdated);
        return () => {
            window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
        };
    }, [fetchWishlistCount]);

    const handleLogout = async () => {
        try {
            await logoutCustomer();
        } finally {
            navigate("/login");
        }
    };

    const isActive = (path) => {
        if (path === "/products") {
            return location.pathname === "/products" || location.pathname.startsWith("/products/");
        }
        return location.pathname === path;
    };

    return (
        <header className="navbar-wrapper">
            <nav className="navbar">
                <div
                    className="navbar-brand"
                    onClick={() => navigate("/products")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && navigate("/products")}
                >
                    <span className="brand-icon">🛍️</span>
                    <span className="brand-name">ShopKart</span>
                </div>

                <div className="navbar-links">
                    <Link
                        to="/home"
                        className={`nav-link ${isActive("/home") ? "active" : ""}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/products"
                        className={`nav-link ${isActive("/products") ? "active" : ""}`}
                    >
                        Products
                    </Link>
                    <Link
                        to="/wishlist"
                        className={`nav-link nav-wishlist-link ${isActive("/wishlist") ? "active" : ""}`}
                    >
                        <span>Wishlist</span>
                        <span className="nav-badge">
                            {loading && count === null ? "..." : (count ?? 0)}
                        </span>
                    </Link>
                    <Link
                        to="/cart"
                        className={`nav-link nav-cart-link ${isActive("/cart") ? "active" : ""}`}
                    >
                        <span>Cart</span>
                        <span className="nav-badge nav-badge-cart">
                            {cartLoading ? "..." : cartCount}
                        </span>
                    </Link>
                    <Link
                        to="/orders"
                        className={`nav-link ${isActive("/orders") ? "active" : ""}`}
                    >
                        Orders
                    </Link>
                    <button
                        type="button"
                        className="nav-logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </nav>
        </header>
    );
}

export default Navbar;