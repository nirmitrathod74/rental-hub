import React, { useState, useEffect } from 'react';
import { api } from '../api/index.js';
import { Plus, X, Save, Edit, Trash2 } from 'lucide-react';

export const PricelistsView = ({ setActiveTab, onDataChange }) => {
  const [pricelists, setPricelists] = useState([]);
  const [selectedPricelist, setSelectedPricelist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states for rule modal
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  
  const [ruleData, setRuleData] = useState({
    product: '',
    price_type: 'discount',
    discount_percentage: '0.00',
    custom_price: '0.00',
    min_qty: 0,
    start_date: '',
    end_date: '',
    selectable: true
  });

  useEffect(() => {
    fetchPricelists();
    fetchProducts();
  }, []);

  const fetchPricelists = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/pricelists/');
      setPricelists(res.results || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/inventory/products/');
      setProducts(res.results || res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNew = async () => {
    try {
      const res = await api.post('/inventory/pricelists/', {
        name: 'New Price list'
      });
      setPricelists([...pricelists, res]);
      setSelectedPricelist(res);
      if (onDataChange) onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePricelist = async (updates) => {
    if (!selectedPricelist) return;
    try {
      const res = await api.patch(`/inventory/pricelists/${selectedPricelist.id}/`, updates);
      setSelectedPricelist(res);
      setPricelists(pricelists.map(p => p.id === res.id ? res : p));
      if (onDataChange) onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRule = async () => {
    try {
      const payload = { ...ruleData };
      if (!payload.product) payload.product = null;
      if (!payload.start_date) payload.start_date = null;
      if (!payload.end_date) payload.end_date = null;

      const res = await api.post(`/inventory/pricelists/${selectedPricelist.id}/add_item/`, payload);
      
      // Update selected pricelist's items
      const updatedPricelist = {
        ...selectedPricelist,
        items: [...(selectedPricelist.items || []), res]
      };
      setSelectedPricelist(updatedPricelist);
      setPricelists(pricelists.map(p => p.id === updatedPricelist.id ? updatedPricelist : p));
      if (onDataChange) onDataChange();
      
      setRuleModalOpen(false);
      resetRuleData();
    } catch (err) {
      console.error(err);
      alert('Error saving rule');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.delete(`/inventory/pricelist-items/${ruleId}/`);
      const updatedPricelist = {
        ...selectedPricelist,
        items: selectedPricelist.items.filter(i => i.id !== ruleId)
      };
      setSelectedPricelist(updatedPricelist);
      setPricelists(pricelists.map(p => p.id === updatedPricelist.id ? updatedPricelist : p));
      if (onDataChange) onDataChange();
    } catch (err) {
      console.error(err);
    }
  };

  const resetRuleData = () => {
    setRuleData({
      product: '',
      price_type: 'discount',
      discount_percentage: '0.00',
      custom_price: '0.00',
      min_qty: 0,
      start_date: '',
      end_date: '',
      selectable: true
    });
  };

  if (loading) return <div>Loading pricelists...</div>;

  return (
    <div className="fade-in" style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 150px)' }}>
      {/* List Sidebar */}
      <div className="glass-panel" style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--blackish)' }}>Pricelists</h3>
          <button className="btn btn-primary" onClick={handleCreateNew} style={{ padding: '4px 12px', fontSize: '14px' }}>
            New
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pricelists.map(pl => (
            <div 
              key={pl.id}
              onClick={() => setSelectedPricelist(pl)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedPricelist?.id === pl.id ? 'var(--whitish)' : 'transparent',
                border: `1px solid ${selectedPricelist?.id === pl.id ? 'var(--border)' : 'transparent'}`,
                color: 'var(--text-primary)',
                fontWeight: selectedPricelist?.id === pl.id ? '600' : '400'
              }}
            >
              {pl.name}
            </div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      {selectedPricelist && (
        <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button className="btn btn-primary" onClick={() => handleSavePricelist({ name: selectedPricelist.name })}>Save</button>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  const original = pricelists.find(p => p.id === selectedPricelist.id);
                  if (original) setSelectedPricelist({ ...original });
                }}
              >
                Discard
              </button>
            </div>
            
            <input 
              type="text" 
              value={selectedPricelist.name}
              onChange={(e) => setSelectedPricelist({...selectedPricelist, name: e.target.value})}
              style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: 'var(--blackish)', 
                border: 'none', 
                borderBottom: '1px dashed var(--border)', 
                background: 'transparent',
                outline: 'none',
                width: '100%',
                paddingBottom: '8px'
              }}
            />
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ 
              display: 'inline-block', 
              padding: '8px 24px', 
              borderBottom: '2px solid var(--primary)', 
              color: 'var(--primary)',
              fontWeight: '600',
              marginBottom: '24px'
            }}>
              Rule
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Apply On</th>
                  <th style={{ padding: '12px' }}>Min Qty</th>
                  <th style={{ padding: '12px' }}>Validity</th>
                  <th style={{ padding: '12px' }}>Selectable</th>
                  <th style={{ padding: '12px' }}>Unit Price</th>
                  <th style={{ padding: '12px' }}></th>
                </tr>
              </thead>
              <tbody>
                {selectedPricelist.items?.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <td style={{ padding: '12px' }}>{item.product_name || 'All Products'}</td>
                    <td style={{ padding: '12px' }}>{item.min_qty}</td>
                    <td style={{ padding: '12px' }}>
                      {item.start_date || item.end_date ? `${item.start_date ? new Date(item.start_date).toLocaleDateString() : '...'} - ${item.end_date ? new Date(item.end_date).toLocaleDateString() : '...'}` : 'Always'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <input type="checkbox" checked={item.selectable} readOnly />
                    </td>
                    <td style={{ padding: '12px' }}>
                      {item.price_type === 'discount' ? `${item.discount_percentage}% Discount` : `$${item.custom_price}`}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Trash2 size={16} color="var(--danger)" cursor="pointer" onClick={() => handleDeleteRule(item.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div 
              style={{ padding: '16px 12px', color: 'var(--primary)', fontWeight: '500', cursor: 'pointer' }}
              onClick={() => { resetRuleData(); setRuleModalOpen(true); }}
            >
              Add a line
            </div>
          </div>
        </div>
      )}

      {/* Create Rule Modal */}
      {ruleModalOpen && (
        <div className="detail-modal-overlay fade-in" onClick={() => setRuleModalOpen(false)}>
          <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '500px', padding: '32px', position: 'relative', background: 'var(--whitish)' }}>
            <h3 style={{ margin: 0, marginBottom: '24px', color: 'var(--blackish)' }}>Create Pricelist Rules</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '120px', color: 'var(--text-primary)', fontWeight: '500' }}>Products</div>
                <select 
                  className="erp-input" 
                  value={ruleData.product} 
                  onChange={e => setRuleData({...ruleData, product: e.target.value})}
                  style={{ flex: 1 }}
                >
                  <option value="">All Products</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '120px', color: 'var(--text-primary)', fontWeight: '500' }}>Price Type</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input type="radio" checked={ruleData.price_type === 'discount'} onChange={() => setRuleData({...ruleData, price_type: 'discount'})} />
                    Discount
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)' }}>
                    <input type="radio" checked={ruleData.price_type === 'fixed_price'} onChange={() => setRuleData({...ruleData, price_type: 'fixed_price'})} />
                    Fixed Price
                  </label>
                </div>
              </div>

              {ruleData.price_type === 'discount' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '120px', color: 'var(--text-primary)', fontWeight: '500' }}>Discount</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input className="erp-input" type="number" step="0.01" value={ruleData.discount_percentage} onChange={e => setRuleData({...ruleData, discount_percentage: e.target.value})} style={{ width: '80px' }} />
                    <span style={{ color: 'var(--text-muted)' }}>% on sales price</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '120px', color: 'var(--text-primary)', fontWeight: '500' }}>Fixed Price</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>$</span>
                    <input className="erp-input" type="number" step="0.01" value={ruleData.custom_price} onChange={e => setRuleData({...ruleData, custom_price: e.target.value})} style={{ width: '100px' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '120px', color: 'var(--text-primary)', fontWeight: '500' }}>Min Qty</div>
                <input className="erp-input" type="number" value={ruleData.min_qty} onChange={e => setRuleData({...ruleData, min_qty: e.target.value})} style={{ width: '100px' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '120px', color: 'var(--text-primary)', fontWeight: '500' }}>Validity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <input type="date" className="erp-input" value={ruleData.start_date} onChange={e => setRuleData({...ruleData, start_date: e.target.value})} />
                  <span style={{ color: 'var(--text-muted)' }}>to</span>
                  <input type="date" className="erp-input" value={ruleData.end_date} onChange={e => setRuleData({...ruleData, end_date: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '120px', color: 'var(--text-primary)', fontWeight: '500' }}>Selectable</div>
                <input type="checkbox" checked={ruleData.selectable} onChange={e => setRuleData({...ruleData, selectable: e.target.checked})} />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button className="btn btn-secondary" onClick={() => setRuleModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveRule}>Save Rule</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
