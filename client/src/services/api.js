import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8085/customers",
    withCredentials: true
});

export const registerCustomer = (data) => {
    return api.post("/register", data);
};

export const loginCustomer = (data) => {
    return api.post("/login", data);
};

export const getProfile = () => {
    return api.get("/me");
};

export const logoutCustomer = () => {
    return api.post("/logout");
};

const productApi = axios.create({
    baseURL: "http://localhost:8085/products",
    withCredentials: true
});

export const getProducts = (params = {}) => {
    return productApi.get("/", { params });
};

export const getProductById = (id) => {
    return productApi.get(`/${id}`);
};

const wishlistApi = axios.create({
    baseURL: "http://localhost:8085/wishlist",
    withCredentials: true
});

export const addToWishlist = (productId) => {
    return wishlistApi.post(`/${productId}`);
};

export const getWishlist = () => {
    return wishlistApi.get("/");
};

export const removeFromWishlist = (productId) => {
    return wishlistApi.delete(`/${productId}`);
};

export const toggleWishlist = (productId) => {
    return wishlistApi.patch(`/${productId}/toggle`);
};

const cartApi = axios.create({
    baseURL: "http://localhost:8085/cart",
    withCredentials: true
});

export const addToCart = (productId) => {
    return cartApi.post(`/${productId}`);
};

export const getCart = () => {
    return cartApi.get("/");
};

export const updateCartQuantity = (productId, quantity) => {
    return cartApi.patch(`/${productId}`, { quantity });
};

export const removeFromCart = (productId) => {
    return cartApi.delete(`/${productId}`);
};

const orderApi = axios.create({
    baseURL: "http://localhost:8085/orders",
    withCredentials: true
});

export const createPaymentOrder = (shippingAddress) => {
    return orderApi.post("/create-payment-order", { shippingAddress });
};

export const verifyPayment = (data) => {
    return orderApi.post("/verify-payment", data);
};

export const getOrders = () => {
    return orderApi.get("/");
};

export const getOrderById = (id) => {
    return orderApi.get(`/${id}`);
};

export default api;