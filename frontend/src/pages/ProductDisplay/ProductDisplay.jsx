import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstn from '../../axiosCalls/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './ProductDisplay.css';

const ProductDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    async function fetchProduct() {
      try {
        const resp = await axiosInstn.get(`/products/${id}`);
        setProduct(resp.data);
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const productId = product?._id || product?.id || id;

  const isInCart = Array.isArray(cartItems) && cartItems.some(item => {
    const pId = typeof item.product === 'object' && item.product !== null ? item.product._id : item.product;
    return pId === productId;
  });

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    setCartFeedback({ type: '', message: '' });
    try {
      await addToCart(productId);
      setCartFeedback({ type: 'success', message: 'Item added to your cart!' });
      setTimeout(() => setCartFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setCartFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add item to cart.'
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="product-display-container">
        <div className="loading-spinner">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-display-container">
        <div className="error-message">{error || 'Product not found'}</div>
        <div className="back-nav">
          <Link to="/products" className="back-link">← Back to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-display-container">
      <div className="back-nav">
        <Link to="/products" className="back-link">← Back to Products</Link>
      </div>
      <div className="product-display-card">
        <div className="product-display-image-section">
          <img src={product.image} alt={product.name} className="product-display-image" />
        </div>
        <div className="product-display-info-section">
          <span className="product-display-category">{product.category}</span>
          <h2 className="product-display-name">{product.name}</h2>
          <p className="product-display-price">${product.price}</p>
          <p className="product-display-stock">
            {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
          </p>
          <p className="product-display-description">{product.description}</p>

          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={isAddingToCart || product.stock <= 0}
          >
            {isAddingToCart ? "Adding..." : isInCart ? "Add Another" : "Add to Cart"}
          </button>

          {cartFeedback.message && (
            <p
              style={{
                marginTop: '12px',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'center',
                color: cartFeedback.type === 'error' ? '#d32f2f' : '#2e7d32'
              }}
            >
              {cartFeedback.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;

