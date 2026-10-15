import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstn from '../../axiosCalls/axios';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // If order was passed via router navigation state, initialize with it
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    // If not passed in location state, or to ensure fresh data, fetch order details
    if (id) {
      axiosInstn
        .get(`/orders/${id}`)
        .then((res) => {
          setOrder(res.data.order);
        })
        .catch((err) => {
          if (!order) {
            setError(err.response?.data?.message || 'Unable to retrieve order details.');
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="order-success-page-container">
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

  const orderId = order?._id || id;
  const totalAmount = order?.totalAmount ?? location.state?.totalAmount ?? 0;
  const status = order?.status || 'PLACED';

  return (
    <div className="order-success-page-container">
      <div className="order-success-card">
        {/* Success Icon */}
        <div className="success-badge-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <h1 className="order-success-title">Order Placed Successfully</h1>

        {error && <p className="order-fetch-warning">{error}</p>}

        <div className="order-details-box">
          <div className="order-detail-row">
            <span className="order-detail-label">Order ID:</span>
            <span className="order-detail-value order-id-code">{orderId}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Total:</span>
            <span className="order-detail-value total-val">₹{totalAmount.toLocaleString()}</span>
          </div>

          <div className="order-detail-row">
            <span className="order-detail-label">Status:</span>
            <span className={`status-pill status-${status.toLowerCase()}`}>
              {status}
            </span>
          </div>
        </div>

        <p className="order-confirmation-text">
          Your order has been saved successfully.
        </p>

        {/* Action Buttons */}
        <div className="order-actions-row">
          <button
            className="secondary-order-btn"
            onClick={() => navigate('/home')}
            onClick={() => navigate('/orders')}
          >
            View My Orders
          </button>

          <button
            className="primary-order-btn"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

