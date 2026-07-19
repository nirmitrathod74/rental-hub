import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getMediaUrl } from '../api/index.js';
import { CheckCircle2, ShieldCheck, Lock, CreditCard, Edit2, ChevronRight, Package } from 'lucide-react';
import { validateRequired, validateCardNumber, validateExpiry, validateCvv } from '../utils/validation.js';

export const Checkout = () => {
  const {
    cart,
    startDate,
    endDate,
    fulfillmentType,
    shippingAddress,
    setFulfillment,
    clearCart,
    getTotalRent,
    getTotalDeposit
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState('address');
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [savePaymentDetails, setSavePaymentDetails] = useState(false);
  
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
  const validDuration = diffDays > 0;
  
  const finalRent = totalRent * (validDuration ? diffDays : 1);
  const finalDelivery = fulfillmentType === 'delivery' ? 50.00 : 0.00;
  const totalDue = finalRent + totalDeposit + finalDelivery;

  const accentColor = '#6B4668';

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

  const handlePaySubmit = async () => {
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
      setCurrentStep('success');
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

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9'
  };

  const renderSummarySidebar = (isAddressStep) => (
    <div style={cardStyle}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Order Summary</h3>
      {cart.slice(0,2).map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          {item.product.image ? (
            <img src={getMediaUrl(item.product.image)} alt={item.product.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} color="#cbd5e1" />
            </div>
          )}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{item.product.name}</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>${item.rentPrice.toFixed(2)} / day &times; {item.quantity}</div>
          </div>
        </div>
      ))}
      
      <div style={{ borderTop: '1px solid #f1f5f9', margin: '24px -32px', padding: '24px 32px 0' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>Rental Period</div>
        <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>{diffDays} Days ({new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()})</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '12px' }}>
          <span>Delivery Charges</span>
          <span>{fulfillmentType === 'delivery' ? `$${finalDelivery.toFixed(2)}` : '-'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '12px' }}>
          <span>Sub Total</span>
          <span>${finalRent.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
          <span>Security Deposit</span>
          <span style={{ color: '#059669', fontWeight: 600 }}>${totalDeposit.toFixed(2)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '24px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Total Amount</span>
          <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>${totalDue.toFixed(2)}</span>
        </div>

        {isAddressStep ? (
          <>
            <button onClick={() => setCurrentStep('payment')} style={{ width: '100%', padding: '16px', background: accentColor, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(107, 70, 104, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              Continue to Payment <ChevronRight size={18} />
            </button>
            <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>OR</div>
            <Link to="/cart" style={{ display: 'block', textAlign: 'center', fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
              &lt; Back to Cart
            </Link>
          </>
        ) : (
          <>
            <button onClick={handlePaySubmit} disabled={submitting} style={{ width: '100%', padding: '16px', background: accentColor, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(107, 70, 104, 0.25)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              {submitting ? 'Processing...' : 'Pay Now'}
            </button>
            <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>OR</div>
            <button onClick={() => setCurrentStep('address')} style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'center', fontSize: '14px', color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
              &lt; Back to Address
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      {currentStep !== 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '32px' }}>
          <Link to="/cart" style={{ color: '#94a3b8', textDecoration: 'none' }}>Cart</Link>
          <ChevronRight size={14} />
          <span style={{ color: currentStep === 'address' ? '#0f172a' : '#94a3b8' }}>Address</span>
          <ChevronRight size={14} />
          <span style={{ color: currentStep === 'payment' ? '#0f172a' : '#94a3b8' }}>Payment</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', marginBottom: '24px', borderRadius: '8px', border: '1px solid #fecaca', fontWeight: 500 }}>
          {error}
        </div>
      )}

      {currentStep === 'address' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Delivery Method</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: `2px solid ${fulfillmentType === 'delivery' ? accentColor : '#e2e8f0'}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: fulfillmentType === 'delivery' ? '#fcfafc' : '#fff', transition: 'all 0.2s' }} onClick={() => setFulfillment('delivery', shippingAddress || user?.address || '')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="radio" checked={fulfillmentType === 'delivery'} readOnly style={{ width: '20px', height: '20px', accentColor: accentColor }} />
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Standard Delivery</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Free</span>
              </div>
              
              <div style={{ border: `2px solid ${fulfillmentType === 'store_pickup' ? accentColor : '#e2e8f0'}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: fulfillmentType === 'store_pickup' ? '#fcfafc' : '#fff', transition: 'all 0.2s' }} onClick={() => setFulfillment('store_pickup', '')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="radio" checked={fulfillmentType === 'store_pickup'} readOnly style={{ width: '20px', height: '20px', accentColor: accentColor }} />
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Pick up from Store</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Free</span>
              </div>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '40px', marginBottom: '24px' }}>Delivery Address</h2>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{user?.first_name} {user?.last_name || 'Client Name'}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: accentColor, color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px' }}>Main Address</span>
                </div>
              </div>
              
              {fulfillmentType === 'delivery' ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setFulfillment('delivery', e.target.value)}
                    placeholder="Enter complete delivery address"
                    rows={2}
                    style={{ background: 'transparent', border: 'none', padding: 0, resize: 'none', width: '80%', outline: 'none', fontSize: '14px', color: '#475569', fontFamily: 'inherit' }}
                  />
                  <div style={{ background: '#f1f5f9', color: '#475569', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#e2e8f0'} onMouseOut={e=>e.currentTarget.style.background='#f1f5f9'}><Edit2 size={16} /></div>
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '14px' }}>Store Pickup selected. No delivery address required.</div>
              )}
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '32px', marginBottom: '20px' }}>Billing Address</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={billingSameAsDelivery} onChange={(e) => setBillingSameAsDelivery(e.target.checked)} style={{ width: '40px', height: '22px', appearance: 'none', background: billingSameAsDelivery ? accentColor : '#cbd5e1', borderRadius: '20px', position: 'relative', outline: 'none', transition: 'background 0.3s', margin: 0 }} className="custom-toggle" />
                <style>{`
                  .custom-toggle::after {
                    content: ''; position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: transform 0.3s;
                  }
                  .custom-toggle:checked::after {
                    transform: translateX(18px);
                  }
                `}</style>
                <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>Make Billing and Delivery address the same</span>
              </label>
            </div>
          </div>
          
          {renderSummarySidebar(true)}
        </div>
      )}

      {currentStep === 'payment' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>Payment Method</h2>
            
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', marginBottom: '32px', background: '#fff' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Credit Card</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Enter your payment details securely.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim());
                      setFieldErrors({ ...fieldErrors, cardNumber: '' });
                    }}
                    placeholder="Card Number (xxxx xxxx xxxx xxxx)"
                    maxLength={19}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: `1px solid ${fieldErrors.cardNumber ? '#dc2626' : '#e2e8f0'}`, outline: 'none', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = accentColor}
                    onBlur={e => e.target.style.borderColor = fieldErrors.cardNumber ? '#dc2626' : '#e2e8f0'}
                  />
                  {fieldErrors.cardNumber && <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px', display: 'block' }}>{fieldErrors.cardNumber}</span>}
                </div>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => {
                        setCardExpiry(e.target.value);
                        setFieldErrors({ ...fieldErrors, cardExpiry: '' });
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: `1px solid ${fieldErrors.cardExpiry ? '#dc2626' : '#e2e8f0'}`, outline: 'none', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = accentColor}
                      onBlur={e => e.target.style.borderColor = fieldErrors.cardExpiry ? '#dc2626' : '#e2e8f0'}
                    />
                    {fieldErrors.cardExpiry && <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px', display: 'block' }}>{fieldErrors.cardExpiry}</span>}
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => {
                        setCardCvv(e.target.value);
                        setFieldErrors({ ...fieldErrors, cardCvv: '' });
                      }}
                      placeholder="CVV"
                      maxLength={4}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: `1px solid ${fieldErrors.cardCvv ? '#dc2626' : '#e2e8f0'}`, outline: 'none', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = accentColor}
                      onBlur={e => e.target.style.borderColor = fieldErrors.cardCvv ? '#dc2626' : '#e2e8f0'}
                    />
                    {fieldErrors.cardCvv && <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px', display: 'block' }}>{fieldErrors.cardCvv}</span>}
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => { setCardName(e.target.value); setFieldErrors({ ...fieldErrors, cardName: '' }); }}
                    placeholder="Cardholder Name"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '8px', border: `1px solid ${fieldErrors.cardName ? '#dc2626' : '#e2e8f0'}`, outline: 'none', fontSize: '14px', background: '#f8fafc', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = accentColor}
                    onBlur={e => e.target.style.borderColor = fieldErrors.cardName ? '#dc2626' : '#e2e8f0'}
                  />
                  {fieldErrors.cardName && <span style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px', display: 'block' }}>{fieldErrors.cardName}</span>}
                </div>
              </div>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '24px', fontSize: '13px', cursor: 'pointer', color: '#475569', fontWeight: 500 }}>
                <input type="checkbox" checked={savePaymentDetails} onChange={(e) => setSavePaymentDetails(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: accentColor }} />
                <span>Save my payment details for next time</span>
              </label>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', border: '1px solid #e2e8f0', borderRadius: '20px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery &amp; Billing</span>
                <div style={{ background: '#f1f5f9', color: '#475569', padding: '8px', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setCurrentStep('address')}><Edit2 size={16} /></div>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', margin: 0 }}>{user?.first_name} {user?.last_name || 'Client Name'}</h3>
              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                {fulfillmentType === 'delivery' ? shippingAddress || 'No address provided' : 'Store Pickup'}
              </div>
            </div>
          </div>
          
          {renderSummarySidebar(false)}
        </div>
      )}

      {currentStep === 'success' && successOrder && (
        <div style={{ maxWidth: '800px', margin: '60px auto 0', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle2 size={40} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Payment Successful!</h1>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px' }}>Your order <strong style={{ color: '#0f172a' }}>#{successOrder.id.toString().padStart(6, '0')}</strong> has been placed and is being processed.</p>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', textAlign: 'left', marginBottom: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>Order Details</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Date</span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{new Date().toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Rental Period</span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{new Date(successOrder.start_date).toLocaleDateString()} - {new Date(successOrder.end_date).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>Fulfillment</span>
              <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{successOrder.fulfillment_type === 'delivery' ? 'Standard Delivery' : 'Store Pickup'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #e2e8f0' }}>
              <span style={{ color: '#0f172a', fontSize: '16px', fontWeight: 700 }}>Total Paid</span>
              <span style={{ color: accentColor, fontSize: '20px', fontWeight: 800 }}>${(parseFloat(successOrder.amount_paid) + parseFloat(successOrder.deposit_paid)).toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/profile" style={{ padding: '14px 28px', background: '#f8fafc', color: '#0f172a', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', border: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>
              View My Orders
            </Link>
            {invoiceUrl && (
              <a href={invoiceUrl} target="_blank" rel="noreferrer" style={{ padding: '14px 28px', background: accentColor, color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', transition: 'opacity 0.2s' }} onMouseOver={e=>e.currentTarget.style.opacity=0.9} onMouseOut={e=>e.currentTarget.style.opacity=1}>
                Download Invoice
              </a>
            )}
          </div>

          <div style={{ background: '#174026', color: 'white', padding: '16px 24px', borderRadius: '8px', fontSize: '18px', marginBottom: '32px', border: '1px solid #28a745' }}>
            Your Payment has been processed.
          </div>

          <div className="checkout-grid">
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', alignSelf: 'start' }}>
              <div style={{ display: 'inline-block', fontSize: '12px', padding: '4px 12px', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '16px' }}>Delivery &amp; Billing</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{user?.first_name} {user?.last_name || 'Client Name'}</h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {successOrder.fulfillment_type === 'delivery' ? successOrder.shipping_address : 'Store Pickup'}
              </div>
            </div>
            
            <div className="checkout-summary-box">
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--extra-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>Order Items</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confirmed</div>
                </div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 16px 0' }} />
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>Rental Period</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>{new Date(successOrder.start_date).toLocaleDateString()} to {new Date(successOrder.end_date).toLocaleDateString()}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                <span>Delivery Charges</span>
                <span>{successOrder.fulfillment_type === 'delivery' ? `$50.00` : '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '24px' }}>
                <span>Security Deposit</span>
                <span>Rs {parseFloat(successOrder.deposit_paid).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <span>Total</span>
                <span>Rs {(parseFloat(successOrder.amount_paid) + parseFloat(successOrder.deposit_paid)).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
