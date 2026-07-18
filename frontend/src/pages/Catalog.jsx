import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, getMediaUrl } from '../api';
import { Tag, Sparkles, CheckCircle, AlertTriangle, Search, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';

export const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [pricelists, setPricelists] = useState([]);
  const [selectedPricelist, setSelectedPricelist] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const location = useLocation();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) {
      setSearchTerm(q);
    }
  }, [location.search]);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter states
  const [selectedDuration, setSelectedDuration] = useState('All Duration');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]); // Or categories
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const price = parseFloat(p.calculated_price) || parseFloat(p.base_price) || 0;
    const matchesPrice = price >= minPrice && price <= maxPrice;
    
    return matchesSearch && matchesPrice;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
            onChange={(e) => { setSelectedPricelist(e.target.value); setCurrentPage(1); }}
            style={{ width: '220px', padding: '8px 12px' }}
          >
            <option value="">Default Retail Rates</option>
            {pricelists.map(pl => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="catalog-layout">
        {/* Advanced Filter Sidebar */}
        <div className="filter-sidebar">
          <div className="filter-block">
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                style={{ paddingLeft: '36px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
            </div>
            
            <div className="filter-block-title">Categories</div>
            {['Heavy Machinery', 'Electronics', 'Vehicles', 'Event Gear', 'Tools & Equipment'].map((cat, idx) => (
              <label key={idx} className="filter-checkbox">
                <input type="checkbox" />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <div className="filter-block">
            <div className="filter-block-title">Colors</div>
            <div className="color-grid">
              {['#0b4e54', '#8c7df7', '#6c431b', '#f3752e'].map((color, i) => (
                <div 
                  key={i} 
                  className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color === selectedColor ? '' : color)}
                />
              ))}
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={'e'+i} className="color-swatch-empty" />
              ))}
            </div>
          </div>

          <div className="filter-block">
            <div className="filter-block-title">Duration</div>
            <select 
              className="glass-input" 
              style={{ marginBottom: '12px' }}
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
            >
              <option value="All Duration">All Duration</option>
              <option value="Hourly">Hourly</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div className="filter-block">
            <div className="filter-block-title">Price Range</div>

            <div className="price-slider-wrap dual-range" style={{ position: 'relative' }}>
              <div className="price-slider-labels">
                <span>${minPrice}</span>
                <span>${maxPrice}</span>
              </div>
              <div className="price-slider-track">
                <div className="price-slider-fill" style={{ left: `${(minPrice / 10000) * 100}%`, right: `${100 - (maxPrice / 10000) * 100}%` }} />
                <div className="price-slider-thumb left" style={{ left: `${(minPrice / 10000) * 100}%` }} />
                <div className="price-slider-thumb right" style={{ right: `${100 - (maxPrice / 10000) * 100}%` }} />
              </div>
              <input 
                type="range" 
                min={0} 
                max={10000} 
                step={10}
                value={minPrice} 
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPrice - 10);
                  setMinPrice(val);
                  setCurrentPage(1);
                }}
              />
              <input 
                type="range" 
                min={0} 
                max={10000} 
                step={10}
                value={maxPrice} 
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPrice + 10);
                  setMaxPrice(val);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px', color: 'hsl(var(--text-secondary))' }}>
                Loading catalog items...
              </div>
            ) : error ? (
              <div className="glass-panel" style={{ padding: '20px', color: 'hsl(var(--danger))', textAlign: 'center' }}>
                {error}
              </div>
            ) : currentProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-secondary))' }}>
                No products matched your search.
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '24px'
                }}>
                  {currentProducts.map(product => {
                    const isPromoActive = parseFloat(product.calculated_price) < parseFloat(product.base_price);
                    const inStock = product.available_qty > 0;
                    
                    return (
                      <div key={product.id} className="glass-panel glass-panel-hover" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflow: 'hidden',
                        opacity: inStock ? 1 : 0.8
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
                              src={getMediaUrl(product.image)}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: inStock ? 'none' : 'grayscale(100%)' }}
                            />
                          ) : (
                            <span style={{ fontSize: '64px', filter: inStock ? 'none' : 'grayscale(100%)' }}>⚙️</span>
                          )}

                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                            style={{
                              position: 'absolute',
                              top: '12px',
                              left: '12px',
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                              zIndex: 10
                            }}
                          >
                            <Heart size={16} color={isInWishlist(product.id) ? 'var(--danger)' : 'var(--text-muted)'} fill={isInWishlist(product.id) ? 'var(--danger)' : 'none'} />
                          </button>

                          {isPromoActive && inStock && (
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

                          {!inStock && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{
                                padding: '8px 20px',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '20px',
                                color: '#fff',
                                fontSize: '14px',
                                fontWeight: 600,
                                background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)'
                              }}>
                                Out of stock
                              </div>
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

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
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
                              {inStock ? (
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

                          {inStock ? (
                            <Link to={`/product/${product.id}${selectedPricelist ? `?pricelist_id=${selectedPricelist}` : ''}`} className="btn btn-primary" style={{
                              width: '100%',
                              textDecoration: 'none',
                              marginTop: '12px'
                            }}>
                              View Details & Book
                            </Link>
                          ) : (
                            <button className="btn" disabled style={{
                              width: '100%',
                              marginTop: '12px',
                              backgroundColor: '#e9ecef',
                              color: '#6c757d',
                              border: 'none',
                              cursor: 'not-allowed'
                            }}>
                              Currently Unavailable
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination Controls */}
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button 
                    className="pagination-btn" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
