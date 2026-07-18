import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Trash2, ShoppingBag, Calendar, CreditCard, CheckCircle } from 'lucide-react';
import { getMediaUrl } from '../api';

export const Cart = () => {
  const {
    cart,
    startDate,
    endDate,
    removeFromCart,
    updateQuantity,
    setDates,
    getTotalRent,
    getTotalDeposit,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const totalRent = getTotalRent();
  const totalDeposit = getTotalDeposit();

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  const handleStartDateChange = (e) => {
    setDates(e, endDate);
  };

  const handleEndDateChange = (e) => {
    setDates(startDate, e);
  };

  if (cart.length === 0) {
    return (
      <div className="fade-in checkout-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '64px' }}>🛒</div>
        <h2 style={{ fontSize: '28px', marginTop: '16px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '8px', marginBottom: '24px' }}>
          Explore our machinery catalog to reserve assets.
        </p>
        <Link to="/" className="btn btn-primary">
          <ShoppingBag size={18} /> Browse Products
        </Link>
      </div>
    );
  }

  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffMs = endD.getTime() - startD.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const validDuration = diffDays > 0;

  const finalRent = totalRent * (validDuration ? diffDays : 1);
  const grandTotal = finalRent + totalDeposit;

  return (
    <div className="fade-in checkout-container">
      <div className="checkout-breadcrumb">
        Add to Cart &gt; <span className="active">Address &gt; Payment</span>
      </div>

      <div className="checkout-grid">
        {/* Left Column: Items */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
            {cart.map((item, idx) => (
              <div key={idx} className="checkout-item-row">
                {item.product.image ? (
                  <img src={getMediaUrl(item.product.image)} alt={item.product.name} className="checkout-item-img" />
                ) : (
                  <div className="checkout-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>⚙️</div>
                )}
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{item.product.name}</h4>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
                    Rs {item.rentPrice.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '6px' }}>
                    Date and time for which the product is rented: {validDuration ? `${diffDays} Days` : '-'}
                  </div>
                  
                  <div className="cart-actions">
                    <button onClick={() => removeFromCart(item.product.id, item.selectedVariants)} className="cart-action-btn">
                      Remove
                    </button>
                    <span style={{ color: 'var(--border)' }}>|</span>
                    <button className="cart-action-btn">
                      Save for Later
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    className="btn-outline" 
                    style={{ padding: '4px 10px' }}
                    onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.selectedVariants)}
                  >-</button>
                  <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button 
                    className="btn-outline" 
                    style={{ padding: '4px 10px' }}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariants)}
                  >+</button>
                </div>
              </div>
            ))}
          </div>

          <Link to="/" className="btn btn-outline" style={{ width: '100%', padding: '16px', fontSize: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Continue Shopping</span>
            <span>&gt;</span>
          </Link>
        </div>

        {/* Right Column: Summary Box */}
        <div className="checkout-summary-box">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} /> Rental Period
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <input
              type="datetime-local"
              className="glass-input"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
            />
            <input
              type="datetime-local"
              className="glass-input"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              required
            />
          </div>

          <div style={{ borderTop: '1px solid hsl(var(--border-glass))', margin: '0 -24px 20px', padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Delivery Charges</span>
              <span>-</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Security Deposit</span>
              <span>Rs {totalDeposit.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-muted)' }}>Sub Total</span>
              <span>Rs {finalRent.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid hsl(var(--border-glass))', margin: '0 -24px 24px', padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
            <span>Total</span>
            <span>Rs {grandTotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn" style={{ 
              backgroundColor: '#174026', 
              color: 'white', 
              width: '100%', 
              padding: '12px',
              border: '2px solid #28a745'
            }}>
              Apply Coupon
            </button>
            <button className="btn btn-outline" style={{ width: '100%', padding: '12px' }}>
              Pay with Saved Card
            </button>
            <button 
              onClick={handleCheckoutClick}
              disabled={!validDuration}
              className="btn btn-outline" 
              style={{ width: '100%', padding: '12px' }}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
