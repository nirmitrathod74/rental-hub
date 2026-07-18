import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { api } from '../api/index.js';
import { CheckCircle2, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import { validateRequired, validateCardNumber, validateExpiry, validateCvv } from '../utils/validation.js';

export const Checkout = () => {
  const {
    cart,
    startDate,
    endDate,
    fulfillmentType,
    shippingAddress,
    clearCart,
    getTotalRent,
    getTotalDeposit
  } = useCart();

  const navigate = useNavigate();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [error, setError] = useState('');

  const totalRent = getTotalRent();
  const totalDeposit = getTotalDeposit();
  
  const startD = new Date(startDate);
  const endD = new Date(endDate);
  const diffMs = endD.getTime() - startD.getTime();
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  
  const finalRent = totalRent * diffDays;
  const finalDelivery = fulfillmentType === 'delivery' ? 50.00 : 0.00;
  const totalDue = finalRent + totalDeposit + finalDelivery;

  const validateForm = () => {
    const errors = {};
    errors.cardName = validateRequired(cardName, 'Cardholder Name');
    errors.cardNumber = validateCardNumber(cardNumber);
    errors.cardExpiry = validateExpiry(cardExpiry);
    errors.cardCvv = validateCvv(cardCvv);

    Object.keys(errors).forEach(key => !errors[key] && delete errors[key]);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    
    setSubmitting(true);

    try {
      const orderPayload = {
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        fulfillment_type: fulfillmentType,
        shipping_address: shippingAddress,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          variants: item.selectedVariants
        }))
      };

      const order = await api.post('/rentals/orders/', orderPayload);

      const confirmPayload = {
        amount_paid: finalRent + finalDelivery,
        deposit_paid: totalDeposit
      };

      const confirmedOrder = await api.post(`/rentals/orders/${order.id}/confirm/`, confirmPayload);
      setSuccessOrder(confirmedOrder);
      clearCart();

      try {
        const invRes = await api.get(`/rentals/orders/${order.id}/invoice/`);
        setInvoiceUrl(invRes.invoice_url);
      } catch {
        // Fallback or ignore
      }

    } catch (err) {
      setError(err.message || 'Checkout transaction failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="fade-in" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '20px'
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '550px',
          padding: '40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CheckCircle2 size={80} style={{ color: 'hsl(var(--success))' }} />
          </div>
          
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: 800 }}>Booking Confirmed!</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '8px', fontSize: '14px' }}>
              Your payment has been processed and security deposit held successfully.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Order ID:</span>
              <span style={{ fontWeight: 'bold' }}>#{successOrder.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Paid Base Rent:</span>
              <span style={{ fontWeight: 'bold' }}>${parseFloat(successOrder.amount_paid).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Held Security Deposit:</span>
              <span style={{ fontWeight: 'bold', color: 'hsl(var(--success))' }}>${parseFloat(successOrder.deposit_paid).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Order Status:</span>
              <span className="badge badge-confirmed" style={{ alignSelf: 'center' }}>Confirmed</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            {invoiceUrl && (
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px' }}
              >
                Download Invoice
              </a>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="btn-secondary"
              style={{ flex: 1, padding: '12px' }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>Secure Checkout</h1>

      {error && (
        <div className="glass-panel" style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'hsl(var(--danger))',
          marginBottom: '24px',
          borderRadius: '8px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        alignItems: 'start'
      }}>
        <form onSubmit={handlePaySubmit} noValidate className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} style={{ color: 'hsl(var(--primary))' }} /> Payment Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Cardholder Name</label>
            <input
              type="text"
              className={`glass-input ${fieldErrors.cardName ? 'input-error' : ''}`}
              value={cardName}
              onChange={(e) => { setCardName(e.target.value); setFieldErrors({ ...fieldErrors, cardName: '' }); }}
              placeholder="e.g. John Doe"
            />
            {fieldErrors.cardName && <span className="field-error">{fieldErrors.cardName}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Card Number</label>
            <input
              type="text"
              className={`glass-input ${fieldErrors.cardNumber ? 'input-error' : ''}`}
              value={cardNumber}
              onChange={(e) => {
                setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim());
                setFieldErrors({ ...fieldErrors, cardNumber: '' });
              }}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
            />
            {fieldErrors.cardNumber && <span className="field-error">{fieldErrors.cardNumber}</span>}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Expiry Date</label>
              <input
                type="text"
                className={`glass-input ${fieldErrors.cardExpiry ? 'input-error' : ''}`}
                value={cardExpiry}
                onChange={(e) => {
                  setCardExpiry(e.target.value);
                  setFieldErrors({ ...fieldErrors, cardExpiry: '' });
                }}
                placeholder="MM/YY"
                maxLength={5}
              />
              {fieldErrors.cardExpiry && <span className="field-error">{fieldErrors.cardExpiry}</span>}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>CVV</label>
              <input
                type="password"
                className={`glass-input ${fieldErrors.cardCvv ? 'input-error' : ''}`}
                value={cardCvv}
                onChange={(e) => {
                  setCardCvv(e.target.value);
                  setFieldErrors({ ...fieldErrors, cardCvv: '' });
                }}
                placeholder="•••"
                maxLength={4}
              />
              {fieldErrors.cardCvv && <span className="field-error">{fieldErrors.cardCvv}</span>}
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'hsl(var(--text-secondary))',
            marginTop: '8px'
          }}>
            <Lock size={14} style={{ color: 'hsl(var(--success))' }} /> Encrypted TLS secure transaction
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '12px' }}>
            {submitting ? 'Processing Transaction...' : `Confirm & Pay $${totalDue.toFixed(2)}`}
          </button>
        </form>

        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Booking Review</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '20px' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>
                  {item.product.name} (x{item.quantity})
                </span>
                <span style={{ fontWeight: 600 }}>
                  ${(item.rentPrice * item.quantity * diffDays).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Rental Duration:</span>
              <span style={{ fontWeight: 600 }}>{diffDays} {diffDays === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Fulfillment:</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{fulfillmentType.replace('_', ' ')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Total Base Rent:</span>
              <span style={{ fontWeight: 600 }}>${finalRent.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'hsl(var(--text-secondary))' }}>Refundable Deposit:</span>
              <span style={{ fontWeight: 600, color: 'hsl(var(--success))' }}>${totalDeposit.toFixed(2)}</span>
            </div>
            {finalDelivery > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-secondary))' }}>Delivery Fee:</span>
                <span style={{ fontWeight: 600 }}>$50.00</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 800 }}>Amount Chargeable:</span>
            <span style={{ fontSize: '22px', fontWeight: 900, color: 'hsl(var(--primary))' }}>
              ${totalDue.toFixed(2)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>
            <ShieldCheck size={16} style={{ color: 'hsl(var(--success))', flexShrink: 0 }} />
            <span>
              We reserve security deposit holdings inside the RentalHub vault. You are protected by our rental terms.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
