import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Trash2, ShoppingBag, Calendar, CreditCard, ChevronRight, Bookmark } from 'lucide-react';
import { getMediaUrl } from '../api/index.js';

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

  const accentColor = '#6B4668';

  if (cart.length === 0) {
    return (
      <div style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ background: '#f8fafc', width: '120px', height: '120px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <ShoppingBag size={48} color="#cbd5e1" />
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>Your Cart is Empty</h2>
        <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '32px' }}>
          Looks like you haven't added any equipment to your cart yet.
        </p>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: accentColor, color: '#fff', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(107, 70, 104, 0.25)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <ShoppingBag size={18} /> Browse Equipment
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

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '32px' }}>
        <span style={{ color: '#0f172a' }}>Add to Cart</span>
        <ChevronRight size={14} />
        <span>Address</span>
        <ChevronRight size={14} />
        <span>Payment</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Items */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', gap: '24px', position: 'relative', transition: 'box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                
                <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.product.image ? (
                    <img src={getMediaUrl(item.product.image)} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={32} color="#cbd5e1" />
                  )}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.product.name}</h4>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      ${item.rentPrice.toFixed(2)} <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ day</span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                    Rental duration: {validDuration ? <strong style={{ color: '#0f172a' }}>{diffDays} Days</strong> : '-'}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button onClick={() => removeFromCart(item.product.id, item.selectedVariants)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                        <Trash2 size={14} /> Remove
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                        <Bookmark size={14} /> Save for Later
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <button style={{ background: '#f8fafc', border: 'none', padding: '6px 12px', cursor: 'pointer', color: '#475569', fontWeight: 600 }} onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1), item.selectedVariants)}>-</button>
                      <span style={{ width: '32px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#0f172a', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', padding: '6px 0' }}>{item.quantity}</span>
                      <button style={{ background: '#f8fafc', border: 'none', padding: '6px 12px', cursor: 'pointer', color: '#475569', fontWeight: 600 }} onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariants)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', background: '#f8fafc', borderRadius: '12px', textDecoration: 'none', color: '#0f172a', fontWeight: 600, border: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = '#f8fafc'}>
            <span>Continue Shopping</span>
            <ChevronRight size={18} style={{ color: '#64748b' }} />
          </Link>
        </div>

        {/* Right Column: Summary Box */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: accentColor }} /> Rental Period
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <label style={{ position: 'absolute', top: '-8px', left: '12px', background: '#fff', padding: '0 4px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Pickup Date</label>
              <input type="datetime-local" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = '#e2e8f0'} required />
            </div>
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <label style={{ position: 'absolute', top: '-8px', left: '12px', background: '#fff', padding: '0 4px', fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Return Date</label>
              <input type="datetime-local" value={endDate} onChange={(e) => handleEndDateChange(e.target.value)} style={inputStyle} onFocus={e => e.target.style.borderColor = accentColor} onBlur={e => e.target.style.borderColor = '#e2e8f0'} required />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 -32px 24px', padding: '24px 32px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569' }}>
              <span>Delivery Charges</span>
              <span>-</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569' }}>
              <span>Security Deposit</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>${totalDeposit.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
              <span>Sub Total</span>
              <span>${finalRent.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', margin: '0 -32px 24px', padding: '20px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>${grandTotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{ width: '100%', padding: '14px', background: '#fff', color: accentColor, border: `1px solid ${accentColor}`, borderRadius: '8px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = accentColor; e.currentTarget.style.color = '#fff';}} onMouseOut={e => {e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = accentColor;}}>
              Apply Coupon Code
            </button>
            <button onClick={handleCheckoutClick} disabled={!validDuration} style={{ width: '100%', padding: '16px', background: validDuration ? accentColor : '#cbd5e1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: validDuration ? 'pointer' : 'not-allowed', boxShadow: validDuration ? '0 4px 12px rgba(107, 70, 104, 0.25)' : 'none', transition: 'transform 0.2s' }} onMouseOver={e => {if(validDuration) e.currentTarget.style.transform = 'translateY(-2px)'}} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              Proceed to Checkout
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px', color: '#64748b', fontSize: '12px', fontWeight: 500 }}>
              <CreditCard size={14} /> Secure Payment Processing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
