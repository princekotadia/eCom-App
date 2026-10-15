import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './NavBar.css'
import axiosInstn from '../axiosCalls/axios'

function NavBar() {
    const { user, logout } = useAuth()
    const { cartItems } = useCart()
    const location = useLocation()

    // Hide navbar on login and signup pages
    const hiddenRoutes = ['/', '/login', '/register']
    if (hiddenRoutes.includes(location.pathname)) {
        return null
    }

    const cartCount = Array.isArray(cartItems) ? cartItems.reduce((acc, item) => acc + (item?.quantity || 0), 0) : 0;

    return (
        <div className="navbar-wrapper">
            <div className="navbar">
                <h1>Ecom App</h1>
                <div className="nav-links">
                    {user ? (
                        <>
                            <Link to="/home" className="nav-link">Home</Link>
                            <Link to="/products" className="nav-link">Products</Link>
                            <Link to="/wishlist" className="nav-link">Wishlist</Link>
                            <Link to="/cart" className="nav-link">Cart({cartCount})</Link>
                            <Link to="/orders" className="nav-link">Orders</Link>
                            <button className="logout-btn" onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/products" className="nav-link">Products</Link>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/register" className="nav-link">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NavBar