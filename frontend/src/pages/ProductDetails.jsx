import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, getMediaUrl } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { ShieldCheck, Info, CheckCircle2, ChevronLeft, CalendarClock, Heart } from 'lucide-react';

export const ProductDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const pricelistId = searchParams.get('pricelist_id') || '';
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const query = pricelistId ? `?pricelist_id=${pricelistId}` : '';
        const data = await api.get(`/inventory/products/${id}/${query}`);
        setProduct(data);
        
        const defaults = {};
        data.variants.forEach(v => {
          if (!defaults[v.attribute_name]) {
            defaults[v.attribute_name] = v.attribute_value;
          }
        });
        setSelectedVariants(defaults);
      } catch (err) {
        setError(err.message || 'Failed to retrieve product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, pricelistId]);

  const handleVariantChange = (attributeName, value) => {
    setSelectedVariants(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product, quantity, selectedVariants);
    setSuccessMsg('Added to cart successfully!');
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: 'hsl(var(--text-secondary))' }}>Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '20px', color: 'hsl(var(--danger))', maxWidth: '500px', margin: '0 auto' }}>
          {error || 'Product not found.'}
        </div>
      </div>
    );
  }

  const groupedVariants = {};
  product.variants.forEach(v => {
    if (!groupedVariants[v.attribute_name]) {
      groupedVariants[v.attribute_name] = [];
    }
    if (!groupedVariants[v.attribute_name].includes(v.attribute_value)) {
      groupedVariants[v.attribute_name].push(v.attribute_value);
    }
  });

  return (
    <div className="fade-in" style={{ padding: '32px 64px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '8px',
        marginBottom: '24px',
        cursor: 'pointer'
      }}>
        <ChevronLeft size={16} /> Back to Catalog
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '40px'
      }}>
        <div className="glass-panel" style={{
          height: '400px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          {product.image ? (
            <img
              src={getMediaUrl(product.image)}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '120px' }}>⚙️</span>
          )}

          <button 
            onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 10
            }}
          >
            <Heart size={20} color={isInWishlist(product.id) ? 'var(--danger)' : 'var(--text-muted)'} fill={isInWishlist(product.id) ? 'var(--danger)' : 'none'} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <span style={{ color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em' }}>
              PRODUCT DETAIL
            </span>
            <h1 style={{ fontSize: '36px', fontWeight: 800, marginTop: '4px' }}>{product.name}</h1>
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '13px', marginTop: '2px' }}>SKU: {product.sku}</p>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div className="glass-panel" style={{ padding: '16px 24px', flex: 1, minWidth: '150px' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Rental Price</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(var(--text-primary))', marginTop: '4px' }}>
                ${product.calculated_price} <span style={{ fontSize: '14px', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>/day</span>
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '16px 24px', flex: 1, minWidth: '150px' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Security Deposit</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(var(--success))', marginTop: '4px' }}>
                ${parseFloat(product.calculated_deposit).toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Description</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontSize: '14px' }}>
              {product.description || 'No description provided for this catalog asset.'}
            </p>
          </div>

          {Object.keys(groupedVariants).length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Available Specifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(groupedVariants).map(([attr, vals]) => (
                  <div key={attr} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ width: '100px', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>
                      {attr}:
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {vals.map(v => (
                        <button
                          key={v}
                          onClick={() => handleVariantChange(attr, v)}
                          className={selectedVariants[attr] === v ? 'btn btn-primary' : 'btn-secondary'}
                          style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '13px' }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="btn-secondary"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                  disabled={product.available_qty <= 0}
                >-</button>
                <span style={{ fontSize: '16px', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.available_qty, q + 1))}
                  className="btn-secondary"
                  style={{ width: '32px', height: '32px', padding: 0 }}
                  disabled={product.available_qty <= 0 || quantity >= product.available_qty}
                >+</button>
              </div>

              <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
                ({product.available_qty} items available in inventory)
              </span>
            </div>

            {successMsg && (
              <div className="glass-panel" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'hsl(var(--success))',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px'
              }}>
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              disabled={product.available_qty <= 0}
            >
              {!user ? 'Sign in to Add to Cart' : product.available_qty > 0 ? 'Add to Cart / Quotation' : 'Out of Stock'}
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '20px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--primary))', fontWeight: 600, fontSize: '14px' }}>
              <ShieldCheck size={18} /> Financial & Late Penalty Policies
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'hsl(var(--text-secondary))' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Full Deposit Settle:</strong> The deposit is fully refunded within 24 hours of returning the equipment on time in good condition.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <CalendarClock size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Overdue Fee:</strong> Late returns are charged at a rate of <strong>${product.late_fee_rate} per {product.late_fee_type}</strong>, capped at the security deposit amount.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Grace Period:</strong> You have a <strong>{product.grace_period_hours} hour</strong> grace period after the due return date before late fees start accumulating.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
