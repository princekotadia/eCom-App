import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstn from '../../axiosCalls/axios';
import '../Product/Product.css';
import './Wishlist.css';

const WishlistCard = ({ prod, navigate, onRemove }) => {
  const [removeStatus, setRemoveStatus] = useState('default');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRemove = async () => {
    setRemoveStatus('loading');
    setErrorMessage('');
    try {
      await axiosInstn.post(`/wishlist/${prod.id || prod._id}`);
      setRemoveStatus('success');
      onRemove(prod.id || prod._id);
    } catch (err) {
      setRemoveStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to remove');
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {/* Category badge */}
        <span className="product-category">{prod.category}</span>

        {/* Floating Remove Button (Heart) */}
        <button
          className={`wishlist-icon-btn active ${removeStatus === 'error' ? 'error' : ''}`}
          onClick={handleRemove}
          disabled={removeStatus === 'loading'}
          title="Remove from Wishlist"
        >
          {removeStatus === 'loading' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spinner" style={{ animation: 'spin 1s linear infinite' }}>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
              <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
              <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          )}
        </button>

        <img src={prod.image} alt={prod.name} className="product-image" />
      </div>

      <div className="product-info">
        <h3 className="product-name">{prod.name}</h3>
        <p className="product-price">${prod.price}</p>

        <div className="product-meta-row">
          <p className="product-stock">
            Stock: <span className="meta-value">{prod.stock > 0 ? prod.stock : 0}</span>
          </p>
        </div>

        <div className="product-actions-footer">
          <button
            className="view-details-inline-btn"
            onClick={() => navigate(`/product/${prod.id || prod._id}`)}
          >
            <span>View Details</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>

        {removeStatus === 'error' && (
          <p className="wishlist-error-message">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

const Wishlist = () => {
  const [prods, setProds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      setError(null);
      const resp = await axiosInstn.get('/wishlist');
      setProds(resp.data.products);
    } catch (err) {
      console.log(err);
      setError("Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveItem = (id) => {
    setProds((prevProds) => prevProds.filter((p) => (p.id || p._id) !== id));
  };

  return (
    <div className="wishlist-page-container">
      <h2 className="product-page-title">My Wishlist</h2>

      {loading ? (
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
      ) : error ? (
        <div className="error-state-container">
          <p className="error-message">{error}</p>
          <button className="secondary-action-btn" onClick={fetchWishlist}>
            Try Again
          </button>
        </div>
      ) : prods && prods.length === 0 ? (
        <div className="empty-state-container">
          <p className="empty-state-title">Your wishlist is empty </p>
          <p className="empty-state-subtitle">Start saving products you love.</p>
          <button className="primary-action-btn" onClick={() => navigate('/products')}>
            Browse Products
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {prods && prods.map((prod) => (
            <WishlistCard
              key={prod.id || prod._id}
              prod={prod}
              navigate={navigate}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
