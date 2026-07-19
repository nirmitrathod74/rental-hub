import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getMediaUrl } from '../api/index.js';
import { CheckCircle2, ShieldCheck, Lock, CreditCard, Edit2 } from 'lucide-react';
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

  const renderSummarySidebar = (isAddressStep) => (
    <div className="checkout-summary-box">
      {cart.slice(0,1).map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {item.product.image ? (
            <img src={getMediaUrl(item.product.image)} alt={item.product.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--extra-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙️</div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.product.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rs {item.rentPrice.toFixed(2)}/ day</div>
          </div>
        </div>
      ))}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 16px 0' }} />
      <div style={{ fontSize: '12px', marginBottom: '8px' }}>Rental Period</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>{diffDays} Days ({new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()})</div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
        <span>Delivery Charges</span>
        <span>{fulfillmentType === 'delivery' ? `Rs ${finalDelivery.toFixed(2)}` : '-'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '16px' }}>
        <span>Sub Total</span>
        <span>Rs {finalRent.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, borderTop: '1px dashed var(--border)', paddingTop: '16px', marginBottom: '24px' }}>
        <span>Security Deposit</span>
        <span>Rs {totalDeposit.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '24px' }}>
        <span>Total</span>
        <span>Rs {totalDue.toFixed(2)}</span>
      </div>

      {isAddressStep ? (
        <>
          <button onClick={() => setCurrentStep('payment')} className="btn btn-outline" style={{ width: '100%', padding: '12px', color: 'white', backgroundColor: '#18181b', borderColor: '#18181b' }}>
            Confirmed &gt;
          </button>
          <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '12px', color: 'var(--text-muted)' }}>OR</div>
          <Link to="/cart" style={{ display: 'block', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            &lt; Back to Cart
          </Link>
        </>
      ) : (
        <>
          <button onClick={handlePaySubmit} disabled={submitting} className="btn btn-outline" style={{ width: '100%', padding: '12px', color: 'white', backgroundColor: '#18181b', borderColor: '#18181b' }}>
            {submitting ? 'Processing...' : 'Pay Now'}
          </button>
          <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '12px', color: 'var(--text-muted)' }}>OR</div>
          <button onClick={() => setCurrentStep('address')} style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            &lt; Back to Address
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="fade-in checkout-container">
      {currentStep !== 'success' && (
        <div className="checkout-breadcrumb">
          Breadcrumb &gt; Order &gt; <span className={currentStep === 'address' ? 'active' : ''}>Address</span> &gt; <span className={currentStep === 'payment' ? 'active' : ''}>Payment</span>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'hsl(var(--danger))', marginBottom: '24px', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {currentStep === 'address' && (
        <div className="checkout-grid">
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Delivery Method</h2>
            <div className={`checkout-radio-card ${fulfillmentType === 'delivery' ? 'active' : ''}`} onClick={() => setFulfillment('delivery', shippingAddress || user?.address || '')}>
              <div className="checkout-radio-left">
                <input type="radio" checked={fulfillmentType === 'delivery'} readOnly />
                <span>Standard Delivery</span>
              </div>
              <span style={{ fontWeight: 600 }}>Free</span>
            </div>
            <div className={`checkout-radio-card ${fulfillmentType === 'store_pickup' ? 'active' : ''}`} onClick={() => setFulfillment('store_pickup', '')}>
              <div className="checkout-radio-left">
                <input type="radio" checked={fulfillmentType === 'store_pickup'} readOnly />
                <span>Pick up from Store</span>
              </div>
              <span style={{ fontWeight: 600 }}>Free</span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '20px' }}>Delivery Address</h2>
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{user?.first_name} {user?.last_name || 'Customer Name'}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ background: '#3b82f6', color: 'white', fontSize: '11px', padding: '4px 10px', borderRadius: '4px' }}>Main Address</span>
                </div>
              </div>
              
              {fulfillmentType === 'delivery' ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <textarea
                    className="glass-input"
                    value={shippingAddress}
                    onChange={(e) => setFulfillment('delivery', e.target.value)}
                    placeholder="Enter complete delivery address"
                    rows={2}
                    style={{ background: 'transparent', border: 'none', padding: 0, resize: 'none', width: '80%' }}
                  />
                  <div style={{ background: 'var(--extra-light)', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}><Edit2 size={14} /></div>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Store Pickup selected. No delivery address required.</div>
              )}
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '32px', marginBottom: '20px' }}>Billing Address</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={billingSameAsDelivery} onChange={(e) => setBillingSameAsDelivery(e.target.checked)} style={{ width: '40px', height: '20px', appearance: 'none', background: billingSameAsDelivery ? 'var(--primary)' : 'var(--border)', borderRadius: '20px', position: 'relative', outline: 'none', transition: 'background 0.3s' }} className="toggle-switch" />
                <style>{`
                  .toggle-switch::after {
                    content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: transform 0.3s;
                  }
                  .toggle-switch:checked::after {
                    transform: translateX(20px);
                  }
                `}</style>
              </label>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>If enabled, it will make Billing and Delivery address the same</span>
            </div>
          </div>
          {renderSummarySidebar(true)}
        </div>
      )}

      {currentStep === 'payment' && (
        <div className="checkout-grid">
          <div className="fade-in">
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={24} style={{ color: 'hsl(var(--primary))' }} /> Payment Details
            </h2>
            
            <div className="glass-panel" style={{ borderRadius: '16px', padding: '32px', marginBottom: '24px', border: '1px solid hsl(var(--border-glass))', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Credit Card</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Safe money transfer using your bank account. We support Mastercard, Visa, Discover and Stripe.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ width: '40px', height: '24px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1e293b' }}>VISA</div>
                  <div style={{ width: '40px', height: '24px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#1e293b' }}>MC</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Card Number</label>
                  <div style={{ position: 'relative' }}>
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
                      style={{ paddingLeft: '40px', fontSize: '15px', letterSpacing: '1px' }}
                    />
                    <CreditCard size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                  {fieldErrors.cardNumber && <span className="field-error" style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{fieldErrors.cardNumber}</span>}
                </div>
                
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Expiry Date</label>
                    <input
                      type="text"
                      className={`glass-input ${fieldErrors.cardExpiry ? 'input-error' : ''}`}
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        setCardExpiry(val);
                        setFieldErrors({ ...fieldErrors, cardExpiry: '' });
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      style={{ fontSize: '15px', textAlign: 'center', letterSpacing: '1px' }}
                    />
                    {fieldErrors.cardExpiry && <span className="field-error" style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{fieldErrors.cardExpiry}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>CVV</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        className={`glass-input ${fieldErrors.cardCvv ? 'input-error' : ''}`}
                        value={cardCvv}
                        onChange={(e) => {
                          setCardCvv(e.target.value.replace(/\D/g, ''));
                          setFieldErrors({ ...fieldErrors, cardCvv: '' });
                        }}
                        placeholder="•••"
                        maxLength={4}
                        style={{ fontSize: '15px', textAlign: 'center', letterSpacing: '2px', paddingRight: '40px' }}
                      />
                      <Lock size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                    {fieldErrors.cardCvv && <span className="field-error" style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{fieldErrors.cardCvv}</span>}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Cardholder Name</label>
                  <input
                    type="text"
                    className={`glass-input ${fieldErrors.cardName ? 'input-error' : ''}`}
                    value={cardName}
                    onChange={(e) => { setCardName(e.target.value); setFieldErrors({ ...fieldErrors, cardName: '' }); }}
                    placeholder="Enter name exactly as on card"
                    style={{ fontSize: '15px' }}
                  />
                  {fieldErrors.cardName && <span className="field-error" style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{fieldErrors.cardName}</span>}
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={savePaymentDetails} onChange={(e) => setSavePaymentDetails(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'hsl(var(--primary))', borderRadius: '4px' }} />
                <span>Save this card for future transactions</span>
              </label>
            </div>

            <div className="glass-panel" style={{ borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px', background: 'var(--extra-light)', color: 'var(--text-secondary)', borderRadius: '4px' }}>Delivery Address</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{user?.first_name} {user?.last_name || 'Client Name'}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {fulfillmentType === 'delivery' ? shippingAddress || 'No address provided' : 'Store Pickup'}
                </div>
              </div>
              <button onClick={() => setCurrentStep('address')} className="btn btn-secondary" style={{ padding: '8px', borderRadius: '8px' }}>
                <Edit2 size={16} />
              </button>
            </div>
          </div>
          {renderSummarySidebar(false)}
        </div>
      )}

      {currentStep === 'success' && successOrder && (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', marginBottom: '24px' }}>
              <CheckCircle2 size={40} />
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Payment Successful!</h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>Thank you for your order. We've sent a confirmation email with your invoice.</p>
          </div>

          <div className="glass-panel" style={{ borderRadius: '24px', padding: '40px', border: '1px solid hsl(var(--border-glass))', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border)', paddingBottom: '24px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Order Reference</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>S{successOrder.id.toString().padStart(6, '0')}</div>
              </div>
              {invoiceUrl && (
                <a href={invoiceUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px' }}>
                  Print Invoice
                </a>
              )}
            </div>

            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delivery Details</h4>
                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{user?.first_name} {user?.last_name || 'Client Name'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                  {successOrder.fulfillment_type === 'delivery' ? successOrder.shipping_address : 'Store Pickup'}
                </div>
              </div>

              <div style={{ flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: '40px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rental Total</span>
                  <span style={{ fontWeight: 600 }}>Rs {parseFloat(successOrder.amount_paid).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Security Deposit</span>
                  <span style={{ fontWeight: 600 }}>Rs {parseFloat(successOrder.deposit_paid).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#10b981', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <span>Total Paid</span>
                  <span>Rs {(parseFloat(successOrder.amount_paid) + parseFloat(successOrder.deposit_paid)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/" className="btn btn-primary" style={{ padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 600 }}>
              Continue Browsing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
