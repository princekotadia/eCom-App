import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstn from '../../axiosCalls/axios';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstn.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="orders-page-container">
      <div className="orders-content-wrapper">
        <h1 className="orders-page-title">My Orders</h1>

        {/* Loading State */}
        {loading && (
          <div className="orders-loading-state">
            <div className="loading-spinner">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
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
            <p className="loading-text">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="orders-error-card">
            <div className="error-icon">!</div>
            <h3>Unable to load your orders</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty-card">
            <div className="empty-package-icon">📦</div>
            <h2>You have not placed any orders yet.</h2>
            <p>Looks like you haven't bought anything from our store yet.</p>
            <button
              className="start-shopping-btn"
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const orderId = order._id;
              const formattedDate = formatDate(order.createdAt);
              const items = order.items || [];
              const totalAmount = order.totalAmount ?? 0;
              const status = order.status || 'PLACED';

              return (
                <div key={orderId} className="order-card">
                  {/* Order Header */}
                  <div className="order-card-header">
                    <div>
                      <h2 className="order-id-title">Order #{orderId}</h2>
                      <span className="order-date">{formattedDate}</span>
                    </div>
                    <span className={`status-pill status-${status.toLowerCase()}`}>
                      {status}
                    </span>
                  </div>

                  <hr className="order-card-divider" />

                  {/* Order Items */}
                  <div className="order-card-items">
                    {items.map((item, idx) => (
                      <div key={item._id || idx} className="order-card-item-row">
                        <span className="item-name-qty">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="item-price">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <hr className="order-card-divider" />

                  {/* Order Footer */}
                  <div className="order-card-footer">
                    <div className="order-total-block">
                      <span className="total-label">Total:</span>
                      <span className="total-value">₹{totalAmount.toLocaleString()}</span>
                    </div>

                    <button
                      className="view-details-btn"
                      onClick={() => navigate(`/orders/${orderId}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

