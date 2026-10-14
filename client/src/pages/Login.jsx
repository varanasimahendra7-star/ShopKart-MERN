import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Email and password are required");
            return;
        }

        try {
            await loginCustomer(formData);

            navigate("/home");

        } catch (error) {
            setError("Invalid Credentials");
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-brand-icon">🛍️</span>
                    <h1 className="auth-brand-title">ShopKart</h1>
                    <h2 className="auth-subtitle">Welcome Back</h2>
                    <p className="auth-description">Enter your credentials to access your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="login-email">Email</label>
                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <input
                            id="login-password"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="alert-badge alert-error">
                            <span>⚠️ {error}</span>
                        </div>
                    )}

                    <button type="submit" className="auth-submit-btn">
                        Login
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <span
                            className="auth-link"
                            onClick={() => navigate("/register")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && navigate("/register")}
                        >
                            Create Account
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;