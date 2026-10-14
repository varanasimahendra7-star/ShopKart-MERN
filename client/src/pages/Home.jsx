import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/api";
import Navbar from "../components/Navbar";

function Home() {
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();

                setCustomer(response.data);

            } catch (error) {
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="home-container">
                    <div className="home-hero skeleton-hero">
                        <div className="skeleton-box" style={{ height: "40px", width: "300px", marginBottom: "16px" }} />
                        <div className="skeleton-box" style={{ height: "20px", width: "240px", marginBottom: "24px" }} />
                        <div className="skeleton-box" style={{ height: "48px", width: "160px" }} />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <div className="home-container">
                {/* Hero Section */}
                <section className="home-hero">
                    <div className="hero-content">
                        <span className="hero-badge">Welcome back</span>
                        <h1 className="hero-title">
                            Welcome back, {customer?.fullName}! 👋
                        </h1>
                        <p className="hero-subtitle">
                            Continue exploring products you'll love with great prices and fast delivery.
                        </p>
                        <div className="hero-actions">
                            <button
                                type="button"
                                className="hero-primary-btn"
                                onClick={() => navigate("/products")}
                            >
                                Browse Products
                            </button>
                            <button
                                type="button"
                                className="hero-secondary-btn"
                                onClick={() => navigate("/wishlist")}
                            >
                                View Wishlist
                            </button>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="home-features">
                    <div className="feature-card" onClick={() => navigate("/products")} role="button" tabIndex={0}>
                        <div className="feature-icon">🛍️</div>
                        <h3 className="feature-title">Explore Products</h3>
                        <p className="feature-description">
                            Browse high quality electronics, fashion, books, and home items.
                        </p>
                    </div>

                    <div className="feature-card" onClick={() => navigate("/wishlist")} role="button" tabIndex={0}>
                        <div className="feature-icon">❤️</div>
                        <h3 className="feature-title">Save Favorites</h3>
                        <p className="feature-description">
                            Keep track of products you love in your personalized wishlist.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🚚</div>
                        <h3 className="feature-title">Easy Shopping</h3>
                        <p className="feature-description">
                            Seamless browsing, transparent stock information, and fast fulfillment.
                        </p>
                    </div>
                </section>

                {/* Account Details Card */}
                <section className="home-account-section">
                    <div className="profile-card">
                        <div className="profile-card-header">
                            <div className="profile-avatar">
                                {customer?.fullName ? customer.fullName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                                <h2 className="profile-card-title">Customer Profile</h2>
                                <p className="profile-card-subtitle">Your personal account details</p>
                            </div>
                        </div>

                        <div className="profile-info-grid">
                            <div className="profile-info-item">
                                <span className="profile-info-label">Full Name</span>
                                <span className="profile-info-value">{customer?.fullName}</span>
                            </div>

                            <div className="profile-info-item">
                                <span className="profile-info-label">Email Address</span>
                                <span className="profile-info-value">{customer?.email}</span>
                            </div>

                            <div className="profile-info-item">
                                <span className="profile-info-label">Phone Number</span>
                                <span className="profile-info-value">{customer?.phone}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

export default Home;