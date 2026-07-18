import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Trash2, AlertCircle, ShoppingBag, Store, Truck, Calendar } from 'lucide-react';

export const Cart = () => {
  const {
    cart,
    startDate,
    endDate,
    fulfillmentType,
    shippingAddress,
    removeFromCart,
    updateQuantity,
    setDates,
    setFulfillment,
    getTotalRent,
    getTotalDeposit,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const totalRent = getTotalRent();
  const totalDeposit = getTotalDeposit();
  const grandTotal = totalRent + totalDeposit;

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
      <div className="fade-in" style={{ padding: '60px 20px', textAlign: 'center' }}>
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

  return (
    <div className="fade-in" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>Rental Cart</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>Selected Equipments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '20px',
                  borderBottom: idx < cart.length - 1 ? '1px solid hsl(var(--border-glass))' : 'none'
                }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px'
                    }}>
                      ⚙️
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{item.product.name}</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                          <span key={k} style={{
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            color: 'hsl(var(--text-secondary))'
                          }}>
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>${(item.rentPrice * item.quantity).toFixed(2)}</span>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--success))' }}>Deposit: ${(item.depositPrice * item.quantity).toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        className="glass-input"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1, item.selectedVariants)}
                        style={{ width: '60px', padding: '6px', textAlign: 'center' }}
                      />
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedVariants)}
                        className="btn-secondary"
                        style={{ padding: '8px', borderRadius: '6px', color: 'hsl(var(--danger))' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'hsl(var(--primary))' }} /> Rental Schedule
            </h3>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Pick Up Date & Time</label>
                <input
                  type="datetime-local"
                  className="glass-input"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                />
              </div>

              <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Due Return Date & Time</label>
                <input
                  type="datetime-local"
                  className="glass-input"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  required
                />
              </div>
            </div>

            {diffDays <= 0 ? (
              <div style={{
                marginTop: '16px',
                color: 'hsl(var(--danger))',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={16} /> Return date must be after pickup date.
              </div>
            ) : (
              <div style={{
                marginTop: '16px',
                color: 'hsl(var(--success))',
                fontSize: '13px',
                fontWeight: 600
              }}>
                Total Scheduled Duration: {diffDays} {diffDays === 1 ? 'Day' : 'Days'}
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: 700 }}>Fulfillment Option</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setFulfillment('store_pickup', shippingAddress)}
                className={fulfillmentType === 'store_pickup' ? 'btn btn-primary' : 'btn-secondary'}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Store size={16} /> Store Pickup
              </button>
              <button
                type="button"
                onClick={() => setFulfillment('delivery', shippingAddress || (user?.address || ''))}
                className={fulfillmentType === 'delivery' ? 'btn btn-primary' : 'btn-secondary'}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Truck size={16} /> Standard Delivery
              </button>
            </div>

            {fulfillmentType === 'delivery' && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Delivery Location Address</label>
                <textarea
                  className="glass-input"
                  value={shippingAddress}
                  onChange={(e) => setFulfillment('delivery', e.target.value)}
                  placeholder="Enter complete delivery coordinates"
                  rows={3}
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Order Cost Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Base Rental Rates (x{diffDays} days):</span>
              <span style={{ fontWeight: 600 }}>${(totalRent * (diffDays > 0 ? diffDays : 1)).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Refundable Security Deposit:</span>
              <span style={{ fontWeight: 600, color: 'hsl(var(--success))' }}>${totalDeposit.toFixed(2)}</span>
            </div>
            {fulfillmentType === 'delivery' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Delivery Charges:</span>
                <span style={{ fontWeight: 600 }}>$50.00</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 800 }}>Combined Total Due:</span>
            <span style={{ fontSize: '24px', fontWeight: 900, color: 'hsl(var(--primary))' }}>
              ${((totalRent * (diffDays > 0 ? diffDays : 1)) + totalDeposit + (fulfillmentType === 'delivery' ? 50 : 0)).toFixed(2)}
            </span>
          </div>

          <div className="glass-panel" style={{ padding: '16px', backgroundColor: 'rgba(99, 102, 241, 0.05)', fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
            <strong>Note:</strong> The Security Deposit portion is fully refunded upon returning the asset on-time and damage-free.
          </div>

          <button
            onClick={handleCheckoutClick}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
            disabled={diffDays <= 0}
          >
            Checkout & Confirm Quotation
          </button>
        </div>
      </div>
    </div>
  );
};
