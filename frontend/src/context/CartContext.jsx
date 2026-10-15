import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axiosInstn from "../axiosCalls/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext()

export function CartProvider({ children }) {
    const { user } = useAuth()
    const [cartItems, setCartItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchCart = useCallback(async () => {
        if (!user) {
            setCartItems([])
            setError('')
            setLoading(false)
            return
        }

        setLoading(true)
        setError('')
        try {
            const crtItms = await axiosInstn.get('/cart')
            setCartItems(Array.isArray(crtItms.data?.cart) ? crtItms.data.cart : [])
            setError('')
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch cart')
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchCart()
        } else {
            setCartItems([])
            setError('')
            setLoading(false)
        }
    }, [user, fetchCart])

    async function addToCart(prodId) {
        setLoading(true)
        setError('')
        try {
            await axiosInstn.post(`/cart/${prodId}`)
            await fetchCart()
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to add item to cart')
        }
        finally {
            setLoading(false)
        }
    }

    async function removeFromCart(prodId) {
        setLoading(true)
        setError('')
        try {
            await axiosInstn.delete(`/cart/${prodId}`)
            await fetchCart()
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to remove item from cart')
        } finally {
            setLoading(false)
        }
    }

    async function updtQuant(prodId, quantity) {
        setLoading(true)
        setError('')
        try {
            await axiosInstn.patch(`/cart/${prodId}`, { 'quantity': quantity })
            await fetchCart()
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to update quantity')
        } finally {
            setLoading(false)
        }
    }

    return (
        <CartContext.Provider value={{ cartItems, setCartItems, loading, error, fetchCart, addToCart, removeFromCart, updtQuant }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)

