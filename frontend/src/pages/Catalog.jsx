import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/index.js';
import { Tag, Sparkles, CheckCircle, AlertTriangle, Search } from 'lucide-react';

export const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [pricelists, setPricelists] = useState([]);
  const [selectedPricelist, setSelectedPricelist] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      const plData = await api.get('/inventory/pricelists/');
      setPricelists(plData);
      
      const query = selectedPricelist ? `?pricelist_id=${selectedPricelist}` : '';
      const prodData = await api.get(`/inventory/products/${query}`);
      setProducts(prodData);
    } catch (err) {
      setError(err.message || 'Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, [selectedPricelist]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page fade-in">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Explore Rental Equipment</h1>
          <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
            Book heavy machineries and accessories instantly
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Tag size={18} style={{ color: 'hsl(var(--primary))' }} />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Active Price List:</span>
          <select
            className="glass-input"
            value={selectedPricelist}
            onChange={(e) => setSelectedPricelist(e.target.value)}
            style={{ width: '220px', padding: '8px 12px' }}
          >
            <option value="">Default Retail Rates</option>
            {pricelists.map(pl => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <input
          type="text"
          className="glass-input"
          placeholder="Search by product name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingLeft: '44px' }}
        />
        <Search size={18} style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'hsl(var(--text-muted))'
        }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontSize: '18px', color: 'hsl(var(--text-secondary))' }}>
          Retrieving catalog assets...
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '20px', color: 'hsl(var(--danger))', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-secondary))' }}>
          No products matched your search.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {filteredProducts.map(product => {
            const isPromoActive = parseFloat(product.calculated_price) < parseFloat(product.base_price);
            
            return (
              <div key={product.id} className="glass-panel glass-panel-hover" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '180px',
                  backgroundColor: '#f8f9fa',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderBottom: '1px solid hsl(var(--border-glass))'
                }}>
                  {product.image ? (
                    <img
                      src={`http://localhost:8000${product.image}`}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '64px' }}>⚙️</span>
                  )}

                  {isPromoActive && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'hsl(var(--warning))',
                      color: 'black',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Sparkles size={12} /> PROMO RATE
                    </div>
                  )}
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))', fontWeight: 600, letterSpacing: '0.05em' }}>
                      SKU: {product.sku}
                    </span>
                    <h3 style={{ fontSize: '18px', marginTop: '2px', fontWeight: 700 }}>{product.name}</h3>
                  </div>

                  <p style={{
                    color: 'hsl(var(--text-secondary))',
                    fontSize: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                  }}>
                    {product.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', justifycontent: 'space-between', alignitems: 'center', marginTop: '8px' }}>
                    <div>
                      {isPromoActive ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ textDecoration: 'line-through', color: 'hsl(var(--text-muted))', fontSize: '12px' }}>
                            ${product.base_price}/day
                          </span>
                          <span style={{ fontSize: '20px', fontWeight: 800, color: 'hsl(var(--success))' }}>
                            ${product.calculated_price}<span style={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>/day</span>
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '20px', fontWeight: 800, color: 'hsl(var(--text-primary))' }}>
                          ${product.base_price}<span style={{ fontSize: '13px', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>/day</span>
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {product.available_qty > 0 ? (
                        <>
                          <CheckCircle size={14} style={{ color: 'hsl(var(--success))' }} />
                          <span style={{ fontSize: '13px', color: 'hsl(var(--success))', fontWeight: 600 }}>
                            {product.available_qty} In Store
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={14} style={{ color: 'hsl(var(--danger))' }} />
                          <span style={{ fontSize: '13px', color: 'hsl(var(--danger))', fontWeight: 600 }}>
                            Out of stock
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link to={`/product/${product.id}${selectedPricelist ? `?pricelist_id=${selectedPricelist}` : ''}`} className="btn btn-primary" style={{
                    width: '100%',
                    textDecoration: 'none',
                    marginTop: '12px'
                  }}>
                    View Details & Book
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
