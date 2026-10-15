import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstn from '../../axiosCalls/axios';
import './ProductDisplay.css';

const ProductDisplay = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <button className="add-to-cart-btn" disabled={product.stock <= 0}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;

