import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstn from '../../axiosCalls/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Product.css';

const ProductCard = ({ prod, navigate, initialWishlisted }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted || false);
  const [wishlistStatus, setWishlistStatus] = useState('default'); // 'default', 'loading', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useAuth();
  const { cartItems, addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Check if this specific product is already in the cart
  const isInCart = cartItems?.some(item => {
    // Handle both populated and unpopulated cart product references safely
    const pId = typeof item.product === 'object' && item.product !== null ? item.product._id : item.product;
    return pId === (prod._id || prod.id);
  });

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setWishlistStatus('loading');
    setErrorMessage('');
    try {
      await axiosInstn.post(`/wishlist/${prod.id || prod._id}`);
      setIsWishlisted(!isWishlisted);
      setWishlistStatus('default');
    } catch (err) {
      setWishlistStatus('error');
      setErrorMessage(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAddingToCart(true);
    setErrorMessage('');
    try {
      await addToCart(prod._id || prod.id);
    } catch (err) {
      setErrorMessage('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {/* Category badge */}
        <span className="product-category">{prod.category}</span>

        {/* Floating Wishlist Button */}
        <button
          className={`wishlist-icon-btn ${isWishlisted ? 'active' : ''} ${wishlistStatus === 'error' ? 'error' : ''}`}
          onClick={handleToggleWishlist}
          disabled={wishlistStatus === 'loading'}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {wishlistStatus === 'loading' ? (
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
          ) : isWishlisted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          <button
            className="add-to-cart-inline-btn"
            onClick={handleAddToCart}
            disabled={isAddingToCart || prod.stock <= 0}
          >
            {isAddingToCart ? "Adding..." : isInCart ? "Add Another" : "Add to Cart"}
          </button>
        </div>

        {wishlistStatus === 'error' && (
          <p className="wishlist-error-message">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

const Product = () => {
  const [prods, setProds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("")
  const [allCates, setAllCates] = useState(null)
  const [category, setCategory] = useState("")
  const [error, setError] = useState(null)
  const [wishlistSet, setWishlistSet] = useState(new Set())

  const navigate = useNavigate();

  useEffect(() => {
    async function getData() {
      try {
        setError(null);
        const resp = await axiosInstn.get('/products', {
          params: {
            search: search,
            category: category
          }
        });
        setProds(resp.data.products);

        const alcat = await axiosInstn.get('/allcates')
        setAllCates(alcat.data)

        const wishResp = await axiosInstn.get('/wishlist');
        const wSet = new Set(wishResp.data.products.map(p => p._id || p.id));
        setWishlistSet(wSet);
      } catch (error) {
        console.log(error);
        setError("Something went wrong while loading products.");
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [search, category]);

  return (
    <div className="product-page-container">
      <h2 className="product-page-title">Explore Collection</h2>

      <div className="product-filters">
        <div className="product-search-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type='text'
            className="product-search"
            placeholder='Search products...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="product-category-filter"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value={""}>All Categories</option>
          {allCates && allCates.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

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
        <div className="error-message">{error}</div>
      ) : prods && prods.length === 0 ? (
        <div className="empty-message">No products found.</div>
      ) : (
        <div className="product-grid">
          {prods && prods.map((prod) => (
            <ProductCard
              key={prod.id || prod._id}
              prod={prod}
              navigate={navigate}
              initialWishlisted={wishlistSet.has(prod.id || prod._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Product;