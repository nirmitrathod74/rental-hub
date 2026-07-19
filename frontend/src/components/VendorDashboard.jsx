import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { PlusCircle, Upload, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

export const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    base_price: '',
    condition: 'Good',
    pickup_address: '',
    stock_qty: 1
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, payoutsRes, categoriesRes] = await Promise.all([
        api.get('/inventory/vendor/stats/'),
        api.get('/inventory/vendor-products/'),
        api.get('/security-deposits/vendor-payouts/'),
        api.get('/inventory/categories/')
      ]);
      setStats(statsRes);
      setProducts(productsRes);
      setPayouts(payoutsRes);
      setCategories(categoriesRes);
      setError(null);
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      if (file) {
        data.append('image', file);
      }

      await api.post('/inventory/vendor-products/', data);
      setIsModalVisible(false);
      setFormData({
        name: '', category: '', description: '', base_price: '',
        condition: 'Good', pickup_address: '', stock_qty: 1
      });
      setFile(null);
      fetchData();
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/inventory/vendor-products/${id}/`);
        fetchData();
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '18px', color: '#6B4668', fontWeight: 'bold' }}>Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ background: '#fee', color: '#c00', padding: '16px', borderRadius: '8px', border: '1px solid #fcc' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#333' }}>
      <h2 style={{ marginBottom: '32px', fontSize: '28px', color: '#111', fontWeight: '700' }}>Vendor Dashboard</h2>
      
      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px', background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', borderTop: '6px solid #6B4668', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Earnings</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#6B4668', marginTop: '12px' }}>${stats?.total_earnings?.toFixed(2) || '0.00'}</div>
        </div>
        <div style={{ flex: '1 1 250px', background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', borderTop: '6px solid #1890ff', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Rentals</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#111', marginTop: '12px' }}>{stats?.active_rentals || 0}</div>
        </div>
        <div style={{ flex: '1 1 250px', background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', borderTop: '6px solid #faad14', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Approvals</div>
          <div style={{ fontSize: '36px', fontWeight: 800, color: '#111', marginTop: '12px' }}>{stats?.pending_approvals || 0}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', borderBottom: '2px solid #eaeaea', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('inventory')}
          style={{ 
            background: activeTab === 'inventory' ? '#6B4668' : 'transparent',
            border: 'none', 
            fontSize: '15px', 
            fontWeight: 600, 
            cursor: 'pointer',
            padding: '10px 24px', 
            borderRadius: '24px',
            color: activeTab === 'inventory' ? '#fff' : '#666',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'inventory' ? '0 4px 12px rgba(107, 70, 104, 0.3)' : 'none'
          }}
        >
          My Inventory
        </button>
        <button 
          onClick={() => setActiveTab('payouts')}
          style={{ 
            background: activeTab === 'payouts' ? '#6B4668' : 'transparent',
            border: 'none', 
            fontSize: '15px', 
            fontWeight: 600, 
            cursor: 'pointer',
            padding: '10px 24px', 
            borderRadius: '24px',
            color: activeTab === 'payouts' ? '#fff' : '#666',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'payouts' ? '0 4px 12px rgba(107, 70, 104, 0.3)' : 'none'
          }}
        >
          Payouts & Earnings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Inventory Management</h3>
            <button 
              onClick={() => setIsModalVisible(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#6B4668', color: '#fff', border: 'none',
                padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5a3a57'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6B4668'}
            >
              <PlusCircle size={18} /> Add Product
            </button>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', color: '#888', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px 8px' }}>Image</th>
                  <th style={{ padding: '16px 8px' }}>Product Details</th>
                  <th style={{ padding: '16px 8px' }}>Price</th>
                  <th style={{ padding: '16px 8px' }}>Status</th>
                  <th style={{ padding: '16px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No products found. Start by adding one!</td></tr>
                ) : products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px 8px' }}>
                      {product.image ? 
                        <img src={product.image} alt="product" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}/> 
                        : <div style={{ width: '60px', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px' }}>No Img</div>
                      }
                    </td>
                    <td style={{ padding: '16px 8px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>{product.name}</div>
                      <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Condition: {product.condition}</div>
                    </td>
                    <td style={{ padding: '16px 8px', fontWeight: '600', color: '#6B4668' }}>${product.base_price}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: product.approval_status === 'Approved' ? '#e6f4ea' : (product.approval_status === 'Rejected' ? '#fce8e6' : '#fef7e0'),
                        color: product.approval_status === 'Approved' ? '#137333' : (product.approval_status === 'Rejected' ? '#c5221f' : '#b06000')
                      }}>
                        {product.approval_status === 'Approved' && <CheckCircle size={14} />}
                        {product.approval_status === 'Rejected' && <XCircle size={14} />}
                        {product.approval_status === 'Pending' && <Clock size={14} />}
                        {product.approval_status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fee'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payouts' && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 32px 0', fontSize: '20px', fontWeight: '700' }}>Revenue & Payout History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', color: '#888', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px 8px' }}>Date</th>
                  <th style={{ padding: '16px 8px' }}>Order ID</th>
                  <th style={{ padding: '16px 8px' }}>Rental Fee</th>
                  <th style={{ padding: '16px 8px' }}>Platform Fee</th>
                  <th style={{ padding: '16px 8px' }}>Your Payout</th>
                  <th style={{ padding: '16px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No payouts yet.</td></tr>
                ) : payouts.map(payout => (
                  <tr key={payout.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '16px 8px', color: '#666' }}>{new Date(payout.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 8px', fontFamily: 'monospace', color: '#333' }}>{payout.order_public_id.split('-')[0]}...</td>
                    <td style={{ padding: '16px 8px', color: '#333', fontWeight: '500' }}>${payout.rental_fee}</td>
                    <td style={{ padding: '16px 8px', color: '#dc3545', fontWeight: '500' }}>-${payout.platform_commission}</td>
                    <td style={{ padding: '16px 8px', color: '#28a745', fontWeight: '700', fontSize: '16px' }}>+${payout.vendor_payout}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: payout.is_paid_out ? '#e6f4ea' : '#fef7e0',
                        color: payout.is_paid_out ? '#137333' : '#b06000'
                      }}>
                        {payout.is_paid_out ? 'Settled' : 'Pending Transfer'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Modal overlay */}
      {isModalVisible && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '24px' }}>Add New Product</h3>
              <button onClick={() => setIsModalVisible(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Product Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Category</label>
                  <select required name="category" value={formData.category} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', backgroundColor: '#fff' }}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Condition</label>
                  <select name="condition" value={formData.condition} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', backgroundColor: '#fff' }}>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', fontFamily: 'inherit' }} />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Rental Price (per period)</label>
                  <input required type="number" min="0" step="0.01" name="base_price" value={formData.base_price} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Quantity</label>
                  <input required type="number" min="1" name="stock_qty" value={formData.stock_qty} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Pickup Address</label>
                <textarea name="pickup_address" value={formData.pickup_address} onChange={handleInputChange} rows={2} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '15px', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Product Image</label>
                <div style={{ border: '2px dashed #ddd', padding: '24px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#fafafa' }}>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} id="file-upload" />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#666' }}>
                    <Upload size={24} style={{ marginBottom: '8px', color: '#6B4668' }} />
                    {file ? <span style={{ color: '#28a745', fontWeight: '600' }}>{file.name} Selected</span> : <span>Click to browse for an image</span>}
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalVisible(false)} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#666' }}>Cancel</button>
                <button type="submit" style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#6B4668', color: '#fff', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 12px rgba(107, 70, 104, 0.3)' }}>Submit for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
