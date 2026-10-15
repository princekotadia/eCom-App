import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axiosInstn from '../../axiosCalls/axios';
import './Checkout.css';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, loading: cartLoading, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error on user input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const validate = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    // Phone validation
    const trimmedPhone = formData.phone.trim();
    if (!trimmedPhone) {
      newErrors.phone = 'Phone Number is required.';
    } else {
      const cleanPhone = trimmedPhone.replace(/[\s-]/g, '');
      if (!/^\d{10}$/.test(cleanPhone)) {
        newErrors.phone = 'Phone Number must contain a valid 10-digit number.';
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address Line is required.';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    // Pincode validation
    const trimmedPincode = formData.pincode.trim();
    if (!trimmedPincode) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(trimmedPincode)) {
      newErrors.pincode = 'Pincode must contain 6 digits.';
    }

    return newErrors;
  };

  const validCartItems = Array.isArray(cartItems)
    ? cartItems.filter((item) => item && item.product != null)
    : [];
  const total = validCartItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation check
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setError('Please resolve the errors below before proceeding.');
      return;
    }

    if (validCartItems.length === 0) {
      setError('Your cart is empty. Add items before placing an order.');
      return;
    }

    setPlacingOrder(true);
    try {
      // 1. Load Razorpay script dynamically & verify existence
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setError('Failed to load Razorpay payment gateway. Please check your network connection.');
        setPlacingOrder(false);
        return;
      }

      // 2. Create Payment Order on the backend
      const res = await axiosInstn.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim()
        }
      });

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = res.data;

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key: key,
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            setPlacingOrder(true);
            const verifyRes = await axiosInstn.post('/orders/verify-payment', {
              shopKartOrderId: shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // Update frontend cart state: Backend cleared cart -> Navbar becomes Cart (0)
            await fetchCart();

            // Navigate to Order Success Screen
            navigate(`/order-success/${shopKartOrderId}`, {
              state: { order: verifyRes.data.order, totalAmount: total }
            });
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.');
          } finally {
            setPlacingOrder(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone
        },
        theme: {
          color: '#1a1a2e'
        },
        modal: {
          ondismiss: function () {
            setPlacingOrder(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error("Payment failed", response.error);
        setError("Payment failed. Your cart has not been cleared. Please try again.");
        setPlacingOrder(false);
      });
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (cartLoading && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="checkout-page-container">
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

  if (orderSuccess) {
    return (
      <div className="checkout-page-container">
        <div className="checkout-success-card">
          <div className="success-icon">✓</div>
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for shopping with us. Your order has been placed.</p>
          <button className="continue-btn" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-card">
        <h1 className="checkout-title">Checkout</h1>

        {error && <div className="checkout-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="checkout-form" noValidate>
          {/* Shipping Details Section */}
          <section className="checkout-section">
            <h2 className="section-title">Shipping Details</h2>

            {/* Full Name */}
            <div className="form-group-row">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? 'input-error' : ''}
                />
                {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group-row">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'input-error' : ''}
                />
                {errors.phone && <span className="field-error-text">{errors.phone}</span>}
              </div>
            </div>

            {/* Address Line */}
            <div className="form-group-row">
              <label htmlFor="address">Address Line</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="House no, street, landmark"
                  value={formData.address}
                  onChange={handleChange}
                  className={errors.address ? 'input-error' : ''}
                />
                {errors.address && <span className="field-error-text">{errors.address}</span>}
              </div>
            </div>

            {/* City */}
            <div className="form-group-row">
              <label htmlFor="city">City</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? 'input-error' : ''}
                />
                {errors.city && <span className="field-error-text">{errors.city}</span>}
              </div>
            </div>

            {/* State */}
            <div className="form-group-row">
              <label htmlFor="state">State</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className={errors.state ? 'input-error' : ''}
                />
                {errors.state && <span className="field-error-text">{errors.state}</span>}
              </div>
            </div>

            {/* Pincode */}
            <div className="form-group-row">
              <label htmlFor="pincode">Pincode</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className={errors.pincode ? 'input-error' : ''}
                />
                {errors.pincode && <span className="field-error-text">{errors.pincode}</span>}
              </div>
            </div>
          </section>

          <hr className="checkout-divider" />

          {/* Order Summary Section */}
          <section className="checkout-section">
            <h2 className="section-title">Order Summary</h2>

            {validCartItems.length === 0 ? (
              <p className="empty-cart-note">Your cart is empty.</p>
            ) : (
              <div className="order-items-list">
                {validCartItems.map((item) => (
                  <div key={item._id || item.product._id} className="order-item-row">
                    <span className="order-item-desc">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="order-item-price">
                      ₹{((item.product?.price || 0) * (item.quantity || 0)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <hr className="summary-sub-divider" />

            <div className="order-total-row">
              <span className="total-label">Total</span>
              <span className="total-amount">₹{total.toLocaleString()}</span>
            </div>

            <div className="place-order-wrapper">
              <button
                type="submit"
                className="place-order-btn"
                disabled={placingOrder || validCartItems.length === 0}
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
