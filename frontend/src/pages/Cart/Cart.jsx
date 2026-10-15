import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, loading, error, fetchCart, removeFromCart, updtQuant } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (prodId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return; // Do not allow quantity below 1
    await updtQuant(prodId, newQuantity); // Passing the exact new quantity to the backend
  };

  const handleRemove = async (prodId) => {
    await removeFromCart(prodId);
  };

  if (loading && cartItems.length === 0) {
    return (
      <div className="cart-page-container">
        <div className="loading-spinner">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
          </svg>
        </div>
      </div>
    );
  }

  // Calculate Subtotal
  const validCartItems = Array.isArray(cartItems) ? cartItems.filter(item => item && item.product != null) : [];
  const totalItems = validCartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const subtotal = validCartItems.reduce((acc, item) => acc + ((item.product.price || 0) * (item.quantity || 0)), 0);

  return (
    <div className="cart-page-container">
      <div className="cart-content-wrapper">

        {/* Left Column: Cart Items */}
        <div className="cart-items-section">
          <h2 className="cart-page-title">My Cart</h2>

          {error && <div className="cart-error-message">{error}</div>}

          {validCartItems.length === 0 ? (
            <div className="empty-cart-message">
              <p>Your cart is empty.</p>
              <button className="continue-shopping-btn" onClick={() => navigate('/products')}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="cart-list">
              {validCartItems.map((item) => (
                <div key={item._id || item.product._id} className="cart-item-card">
                  <div className="cart-item-image-container">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="cart-item-image"
                      onClick={() => navigate(`/product/${item.product._id}`)}
                    />
                  </div>

                  <div className="cart-item-details">
                    <h3
                      className="cart-item-name"
                      onClick={() => navigate(`/product/${item.product._id}`)}
                    >
                      {item.product.name}
                    </h3>
                    <p className="cart-item-price">₹{item.product.price.toLocaleString()}</p>

                    <div className="cart-item-actions-row">
                      <div className="quantity-controls">
                        <button
                          className="quant-btn"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                          disabled={loading || item.quantity <= 1}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span className="quant-value">{item.quantity}</span>
                        <button
                          className="quant-btn"
                          onClick={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                          disabled={loading || item.quantity >= item.product.stock}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>

                      <button
                        className="remove-item-btn"
                        onClick={() => handleRemove(item.product._id)}
                        disabled={loading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        {validCartItems.length > 0 && (
          <div className="order-summary-section">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-row">
              <span className="summary-label">Items</span>
              <span className="summary-value">{totalItems}</span>
            </div>

            <div className="summary-row">
              <span className="summary-label">Subtotal</span>
              <span className="summary-value">₹{subtotal.toLocaleString()}</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-row total-row">
              <span className="summary-label">Total</span>
              <span className="summary-value">₹{subtotal.toLocaleString()}</span>
            </div>

            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

