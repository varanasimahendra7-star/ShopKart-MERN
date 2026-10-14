import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.fullName ||
            !formData.email ||
            !formData.password ||
            !formData.phone
        ) {
            setError("All fields are required");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password should be at least 6 characters");
            return;
        }

        try {
            await registerCustomer(formData);

            setSuccess("Registration successful");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-brand-icon">🛍️</span>
                    <h1 className="auth-brand-title">ShopKart</h1>
                    <h2 className="auth-subtitle">Create Account</h2>
                    <p className="auth-description">Join ShopKart to start shopping today</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="reg-name">Full Name</label>
                        <input
                            id="reg-name"
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-email">Email</label>
                        <input
                            id="reg-email"
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password">Password</label>
                        <input
                            id="reg-password"
                            type="password"
                            name="password"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-phone">Phone Number</label>
                        <input
                            id="reg-phone"
                            type="text"
                            name="phone"
                            placeholder="10-digit mobile number"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="alert-badge alert-error">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert-badge alert-success">
                            <span>✓ {success}</span>
                        </div>
                    )}

                    <button type="submit" className="auth-submit-btn">
                        Create Account
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <span
                            className="auth-link"
                            onClick={() => navigate("/login")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/login")}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;