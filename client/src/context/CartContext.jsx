import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
    getCart,
    addToCart as addToCartApi,
    updateCartQuantity as updateCartQuantityApi,
    removeFromCart as removeFromCartApi
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refreshCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCart();
            setCartItems(response.data?.cart || []);
        } catch (err) {
            if (err.response?.status === 401) {
                // Not logged in; empty cart gracefully without error
                setCartItems([]);
            } else {
                setError(err.response?.data?.message || "Unable to load your cart.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const addToCart = useCallback(async (productId) => {
        const response = await addToCartApi(productId);
        if (response.data?.cart) {
            setCartItems(response.data.cart);
        }
        return response.data;
    }, []);

    const updateQuantity = useCallback(async (productId, quantity) => {
        const response = await updateCartQuantityApi(productId, quantity);
        if (response.data?.cart) {
            setCartItems(response.data.cart);
        }
        return response.data;
    }, []);

    const removeFromCart = useCallback(async (productId) => {
        const response = await removeFromCartApi(productId);
        if (response.data?.cart) {
            setCartItems(response.data.cart);
        }
        return response.data;
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Derived values
    const cartCount = useMemo(() => {
        return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    }, [cartItems]);

    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = Number(item.product?.price) || 0;
            const qty = Number(item.quantity) || 0;
            return total + price * qty;
        }, 0);
    }, [cartItems]);

    const value = useMemo(() => ({
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
    }), [
        cartItems,
        loading,
        error,
        cartCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
    ]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

export default CartContext;
