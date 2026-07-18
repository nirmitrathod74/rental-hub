import React, { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import {
  BarChart, Activity, AlertOctagon, Wallet, CircleDollarSign, CheckSquare,
  Wrench, FilePlus2, Package2, ShieldAlert, Sparkles, User, Calendar, X,
  LayoutDashboard, Tags, Clock, Users, ShoppingBag, FileText, Receipt,
  CreditCard, ShieldCheck, Truck, CornerDownLeft, Settings, UserCircle, Plus, Edit
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pricelists, setPricelists] = useState([]);
  const [rentalPeriods, setRentalPeriods] = useState([]);
  const [quotationTemplates, setQuotationTemplates] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [inspectionRating, setInspectionRating] = useState('good');
  const [damageNotes, setDamageNotes] = useState('');
  const [missingAccs, setMissingAccs] = useState('');
  
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDepVal, setNewProdDepVal] = useState('');
  const [newProdDepType, setNewProdDepType] = useState('fixed');
  const [newProdStock, setNewProdStock] = useState('5');
  const [newProdLateType, setNewProdLateType] = useState('daily');
  const [newProdLateRate, setNewProdLateRate] = useState('');
  const [newProdGrace, setNewProdGrace] = useState('2');
  const [newProdSuccess, setNewProdSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const metricRes = await api.get('/rentals/dashboard/metrics/');
      setMetrics(metricRes);

      const orderRes = await api.get('/rentals/orders/');
      setOrders(orderRes);

      const productRes = await api.get('/inventory/products/');
      setProducts(productRes.data || productRes);

      const categoryRes = await api.get('/inventory/categories/');
      setCategories(categoryRes.data || categoryRes);

      const priceRes = await api.get('/inventory/pricelists/');
      setPricelists(priceRes.data || priceRes);

      const periodRes = await api.get('/inventory/periods/');
      setRentalPeriods(periodRes.data || periodRes);

      const templateRes = await api.get('/rentals/templates/');
      setQuotationTemplates(templateRes.data || templateRes);

      const vendorRes = await api.get('/accounts/vendors/pending/');
      setVendors(vendorRes.data || vendorRes);

      const customerRes = await api.get('/accounts/customers/');
      setCustomers(customerRes.data || customerRes);
    } catch (err) {
      setError(err.message || 'Error occurred fetching ERP dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveVendor = async (id) => {
    try {
      await api.post(`/accounts/vendors/${id}/approve/`, {});
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to approve vendor');
    }
  };

  const handleRejectVendor = async (id) => {
    try {
      await api.post(`/accounts/vendors/${id}/reject/`, {});
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to reject vendor');
    }
  };

  const handleStateChange = async (orderId, actionName) => {
    try {
      let endpoint = `/rentals/orders/${orderId}/${actionName}/`;
      const updated = await api.post(endpoint, {});
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      const metricRes = await api.get('/rentals/dashboard/metrics/');
      setMetrics(metricRes);
    } catch (err) {
      alert(err.message || 'Failed state transition action.');
    }
  };

  const handleInspectionSubmit = async (e, orderId) => {
    e.preventDefault();
    try {
      const payload = {
        condition_rating: inspectionRating,
        damage_notes: damageNotes,
        missing_accessories: missingAccs
      };
      const res = await api.post(`/rentals/orders/${orderId}/return_inspection/`, payload);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      setSelectedOrder(res.order);
      const metricRes = await api.get('/rentals/dashboard/metrics/');
      setMetrics(metricRes);
      setDamageNotes('');
      setMissingAccs('');
      setInspectionRating('good');
      alert('Return inspection logged and stock restored successfully.');
    } catch (err) {
      alert(err.message || 'Inspection failed');
    }
  };

  const handleGenerateInvoice = async (orderId) => {
    try {
      const res = await api.get(`/rentals/orders/${orderId}/invoice/`);
      window.open(res.invoice_url, '_blank');
    } catch (err) {
      alert(err.message || 'Failed to generate invoice');
    }
  };

  const handleGenerateQuotation = async (orderId) => {
    try {
      const res = await api.get(`/rentals/orders/${orderId}/quotation/`);
      window.open(res.quotation_url, '_blank');
    } catch (err) {
      alert(err.message || 'Failed to generate quotation');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setNewProdSuccess('');
    try {
      const payload = {
        name: newProdName,
        sku: newProdSku,
        category: newProdCat || null,
        description: newProdDesc,
        base_price: newProdPrice,
        security_deposit_type: newProdDepType,
        security_deposit_value: newProdDepVal,
        stock_qty: parseInt(newProdStock) || 0,
        available_qty: parseInt(newProdStock) || 0,
        late_fee_type: newProdLateType,
        late_fee_rate: newProdLateRate,
        grace_period_hours: parseInt(newProdGrace) || 0
      };
      const freshProd = await api.post('/inventory/products/', payload);
      setProducts(prev => [...prev, freshProd]);
      setNewProdSuccess('Product registered successfully!');
      setNewProdName(''); setNewProdSku(''); setNewProdCat(''); setNewProdDesc('');
      setNewProdPrice(''); setNewProdDepVal(''); setNewProdLateRate('');
    } catch (err) {
      alert(err.message || 'Failed to register product.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: 'hsl(var(--text-secondary))' }}>Loading administrative terminal...</div>;
  }

  const chartData = {
    labels: ['Active Rentals', 'Overdue Rentals', 'Due Today', 'Upcoming Pickups'],
    datasets: [{
      label: 'Order Volume count',
      data: [metrics?.active_rentals || 0, metrics?.overdue_rentals || 0, metrics?.rentals_due_today || 0, metrics?.upcoming_pickups || 0],
      backgroundColor: ['rgba(16, 185, 129, 0.65)', 'rgba(244, 63, 94, 0.65)', 'rgba(251, 191, 36, 0.65)', 'rgba(99, 102, 241, 0.65)'],
      borderColor: ['#10b981', '#f43f5e', '#f59e0b', '#6366f1'],
      borderWidth: 1,
    }],
  };

  const sidebarMenu = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'products', icon: Package2, label: 'Products' },
    { id: 'categories', icon: Tags, label: 'Categories' },
    { id: 'pricelists', icon: CircleDollarSign, label: 'Pricelists' },
    { id: 'rental_periods', icon: Clock, label: 'Rental Periods' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'orders', icon: ShoppingBag, label: 'Rental Orders' },
    { id: 'quotations', icon: FileText, label: 'Quotations' },
    { id: 'invoices', icon: Receipt, label: 'Invoices' },
    { id: 'deposits', icon: ShieldCheck, label: 'Security Deposits' },
    { id: 'pickup', icon: Truck, label: 'Pickups' },
    { id: 'return', icon: CornerDownLeft, label: 'Returns' },
    { id: 'configuration', icon: Settings, label: 'Configuration' },
    { id: 'vendors', icon: UserCircle, label: `Vendors (${vendors.length})` },
  ];

  return (
    <div className="page fade-in admin-erp-layout">
      
      {/* Sidebar Navigation */}
      <nav className="admin-erp-sidebar">
        <span className="admin-erp-nav-label">Main</span>
        {sidebarMenu.slice(0, 1).map(item => (
          <button key={item.id} className={`admin-erp-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <item.icon size={16} /> {item.label}
          </button>
        ))}
        
        <span className="admin-erp-nav-label">Inventory</span>
        {sidebarMenu.slice(1, 5).map(item => (
          <button key={item.id} className={`admin-erp-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <item.icon size={16} /> {item.label}
          </button>
        ))}

        <span className="admin-erp-nav-label">Sales & Operations</span>
        {sidebarMenu.slice(5, 12).map(item => (
          <button key={item.id} className={`admin-erp-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <item.icon size={16} /> {item.label}
          </button>
        ))}

        <span className="admin-erp-nav-label">Settings</span>
        {sidebarMenu.slice(12, 14).map(item => (
          <button key={item.id} className={`admin-erp-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <item.icon size={16} /> {item.label}
          </button>
        ))}
      </nav>

      <div className="admin-erp-content">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Package2 size={32} style={{ color: '#6366f1' }} />
                <div><span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Total Products</span>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{metrics?.total_products} <small style={{fontSize: '12px', color: 'hsl(var(--success))'}}>{metrics?.products_available} Available</small></div></div>
              </div>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Activity size={32} style={{ color: '#10b981' }} />
                <div><span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Active Rentals</span>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{metrics?.active_rentals} <small style={{fontSize: '12px', color: 'hsl(var(--success))'}}>{metrics?.total_products - metrics?.products_available} Out for Rent</small></div></div>
              </div>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Truck size={32} style={{ color: '#f59e0b' }} />
                <div><span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Today's Pickups / Returns</span>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{metrics?.rentals_due_today} <small style={{fontSize: '12px', color: 'hsl(var(--danger))'}}>{metrics?.upcoming_pickups} returns</small></div></div>
              </div>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <FileText size={32} style={{ color: '#8b5cf6' }} />
                <div><span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Pending Quotations</span>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{metrics?.pending_quotations} <small style={{fontSize: '12px', color: 'hsl(var(--text-secondary))'}}>{metrics?.total_customers} Total Customers</small></div></div>
              </div>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <CircleDollarSign size={32} style={{ color: '#10b981' }} />
                <div><span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Revenue (This Month)</span>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>${parseFloat(metrics?.revenue_this_month || '0').toFixed(2)} <small style={{fontSize: '12px', color: 'hsl(var(--success))'}}>${parseFloat(metrics?.revenue_today || '0').toFixed(2)} Today</small></div></div>
              </div>
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ShieldCheck size={32} style={{ color: '#3b82f6' }} />
                <div><span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Security Deposits Held</span>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>${parseFloat(metrics?.security_deposits_held || '0').toFixed(2)} <small style={{fontSize: '12px', color: 'hsl(var(--warning))'}}>${parseFloat(metrics?.late_fee_collection || '0').toFixed(2)} Late Fees</small></div></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div className="glass-panel" style={{ flex: 2, minWidth: '400px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Revenue Overview</h3>
                <div style={{ height: '280px' }}>
                  <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="glass-panel" style={{ flex: 1, minWidth: '300px', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button className="btn btn-primary" onClick={() => setActiveTab('products')}><Plus size={16}/> Create Product</button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('pricelists')}><Plus size={16}/> Create Pricelist</button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('rental_periods')}><Plus size={16}/> Create Rental Period</button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('quotations')}><Plus size={16}/> Create Quotation</button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('customers')}><Plus size={16}/> Create Customer</button>
                  <button className="btn btn-outline" onClick={() => setActiveTab('invoices')}><Receipt size={16}/> Generate Invoice</button>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} style={{ color: 'hsl(var(--primary))' }} /> Today's Pickup Schedule
                </h3>
                {orders.filter(o => o.status === 'confirmed').slice(0, 5).map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px', backgroundColor: 'var(--extra-light)', borderRadius: '6px' }}>
                    <span>Order <strong>#{o.id}</strong> - {o.client_details?.username}</span>
                    <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setSelectedOrder(o)}>Confirm</button>
                  </div>
                ))}
                {orders.filter(o => o.status === 'confirmed').length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No pickups scheduled today.</span>}
              </div>

              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CornerDownLeft size={18} style={{ color: 'hsl(var(--primary))' }} /> Today's Return Schedule
                </h3>
                {orders.filter(o => o.status === 'picked_up').slice(0, 5).map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px', backgroundColor: 'var(--extra-light)', borderRadius: '6px' }}>
                    <span>Order <strong>#{o.id}</strong> - {o.client_details?.username}</span>
                    <button className="btn btn-success" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setSelectedOrder(o)}>Inspect</button>
                  </div>
                ))}
                {orders.filter(o => o.status === 'picked_up').length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No returns scheduled today.</span>}
              </div>
            </div>

          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px' }}>
            <form onSubmit={handleCreateProduct} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FilePlus2 size={20} style={{ color: 'hsl(var(--primary))' }} /> Create Product
              </h3>
              {newProdSuccess && <div style={{ color: 'hsl(var(--success))', fontSize: '13px', fontWeight: 600 }}>{newProdSuccess}</div>}
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Asset Name</label>
                  <input type="text" className="glass-input" value={newProdName} onChange={e => setNewProdName(e.target.value)} required />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>SKU (Unique)</label>
                  <input type="text" className="glass-input" value={newProdSku} onChange={e => setNewProdSku(e.target.value)} required />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Category</label>
                  <select className="glass-input" value={newProdCat} onChange={e => setNewProdCat(e.target.value)} required>
                    <option value="">Select Category</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Description</label>
                <textarea className="glass-input" value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} rows={2} required />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Base Rate ($/day)</label>
                  <input type="number" className="glass-input" value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} required />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Initial Stock Qty</label>
                  <input type="number" className="glass-input" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Deposit Policy</label>
                  <select className="glass-input" value={newProdDepType} onChange={e => setNewProdDepType(e.target.value)}>
                    <option value="fixed">Fixed Cash</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Deposit Value</label>
                  <input type="number" className="glass-input" value={newProdDepVal} onChange={e => setNewProdDepVal(e.target.value)} required />
                </div>
              </div>
              <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldAlert size={14} /> Late Fee Calculations Rules
                </span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Billing Strategy</label>
                    <select className="glass-input" value={newProdLateType} onChange={e => setNewProdLateType(e.target.value)}>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Penalty Rate ($)</label>
                    <input type="number" className="glass-input" value={newProdLateRate} onChange={e => setNewProdLateRate(e.target.value)} required />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Grace Hours</label>
                    <input type="number" className="glass-input" value={newProdGrace} onChange={e => setNewProdGrace(e.target.value)} required />
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Register Product</button>
            </form>
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package2 size={20} style={{ color: 'hsl(var(--primary))' }} /> Rented Inventory Stocks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '550px', overflowY: 'auto' }}>
                {products.map(p => (
                  <div key={p.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{p.name}</h4>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>SKU: {p.sku} | Strategy: {p.late_fee_type} | Penalty: ${p.late_fee_rate}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{p.available_qty}/{p.stock_qty} available</div>
                        <span className="badge badge-picked_up" style={{ fontSize: '9px' }}>Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="fade-in glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tags size={18} /> Categories ({categories.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--extra-light)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 'bold' }}>{c.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.description || 'No description'}</span>
                </div>
              ))}
              {categories.length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No categories configured.</span>}
            </div>
          </div>
        )}

        {/* PRICELISTS TAB */}
        {activeTab === 'pricelists' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--warning))', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CircleDollarSign size={18} /> PriceLists ({pricelists.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {pricelists.map(pl => (
                <div key={pl.id} style={{ display: 'flex', flexDirection: 'column', padding: '12px', backgroundColor: 'var(--extra-light)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>{pl.name} {pl.is_default && <span className="badge badge-picked_up" style={{ fontSize: '10px' }}>Default</span>}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{pl.items.length} modifiers</span>
                </div>
              ))}
              {pricelists.length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No pricelists configured.</span>}
            </div>
          </div>
        )}

        {/* RENTAL PERIODS TAB */}
        {activeTab === 'rental_periods' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} /> Rental Periods ({rentalPeriods.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {rentalPeriods.map(rp => (
                <div key={rp.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--extra-light)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 'bold' }}>{rp.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{rp.duration_days} Days</span>
                </div>
              ))}
              {rentalPeriods.length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No rental periods configured.</span>}
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="fade-in glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} style={{ color: 'hsl(var(--primary))' }} /> Customer Management
              </h3>
              <button className="btn btn-primary" onClick={() => alert('Customer creation modal to be implemented')}><Plus size={16}/> Create Customer</button>
            </div>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.username}</strong></td>
                    <td>{c.first_name} {c.last_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone_number || '-'}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.address || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}><Edit size={14}/></button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="fade-in glass-panel" style={{ padding: '32px', overflowX: 'auto' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Rental Orders</h3>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Dates</th>
                  <th>Paid Rent</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => o.status !== 'draft').map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.client_details?.username}</td>
                    <td>{new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}</td>
                    <td>${parseFloat(order.amount_paid).toFixed(2)}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => setSelectedOrder(order)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>Audit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* QUOTATIONS TAB */}
        {activeTab === 'quotations' && (
          <div className="fade-in glass-panel" style={{ padding: '32px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'hsl(var(--primary))' }} /> Pending Quotations
              </h3>
              <button className="btn btn-primary" onClick={() => alert('Quotation creation flow via Cart')}><Plus size={16}/> Create Quotation</button>
            </div>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Quotation No.</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => o.status === 'draft').map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.client_details?.username}</td>
                    <td>${parseFloat(order.total_rent_amount).toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td><span className="badge badge-draft">Draft</span></td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleGenerateQuotation(order.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}>View PDF</button>
                      <button onClick={() => handleStateChange(order.id, 'confirm')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '12px' }}>Confirm</button>
                    </td>
                  </tr>
                ))}
                {orders.filter(o => o.status === 'draft').length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No pending quotations.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="fade-in glass-panel" style={{ padding: '32px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} style={{ color: 'hsl(var(--primary))' }} /> Invoice Management
              </h3>
            </div>
            <table className="list-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => ['confirmed', 'picked_up', 'returned', 'settled'].includes(o.status)).map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{order.client_details?.username}</td>
                    <td>${parseFloat(order.amount_paid).toFixed(2)}</td>
                    <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button onClick={() => handleGenerateInvoice(order.id)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px' }}><Receipt size={14}/> PDF Invoice</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div className="fade-in glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCircle size={20} style={{ color: 'hsl(var(--primary))' }} /> Pending Vendor Approvals
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {vendors.length === 0 ? (
                <p style={{ color: 'hsl(var(--text-muted))' }}>No pending vendors to approve.</p>
              ) : (
                vendors.map(vendor => (
                  <div key={vendor.id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold' }}>{vendor.business_name || vendor.username}</h4>
                      <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', margin: '4px 0' }}>
                        {vendor.first_name} {vendor.last_name} | {vendor.email} | {vendor.phone_number}
                      </p>
                      <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>{vendor.address}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={() => handleApproveVendor(vendor.id)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>Approve</button>
                      <button onClick={() => handleRejectVendor(vendor.id)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', border: '1px solid var(--danger)', color: 'var(--danger)' }}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* AUDIT MODAL */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(33,37,43,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <button onClick={() => { setSelectedOrder(null); fetchAdminData(); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Audit Order #{selectedOrder.id}</h3>
                <span className={`badge badge-${selectedOrder.status}`}>{selectedOrder.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'hsl(var(--text-secondary))', marginTop: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={13} /> {selectedOrder.client_details?.username}</span>
                <span>Fulfillment: <strong>{selectedOrder.fulfillment_type}</strong></span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid hsl(var(--border-glass))', borderRadius: '12px', padding: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))' }}>State transition controller</span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedOrder.status === 'draft' && <button onClick={() => handleStateChange(selectedOrder.id, 'confirm')} className="btn btn-primary">Confirm Booking Quotation</button>}
                {selectedOrder.status === 'confirmed' && <button onClick={() => handleStateChange(selectedOrder.id, 'pickup')} className="btn btn-success btn">Verify & Confirm Pickup</button>}
                {selectedOrder.status === 'returned' && <button onClick={() => handleStateChange(selectedOrder.id, 'settle')} className="btn btn-primary">Settle Security Deposit</button>}
                {selectedOrder.status === 'settled' && <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Order is settled and closed. Ledger is locked.</span>}
                {selectedOrder.status === 'cancelled' && <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Order is cancelled.</span>}
              </div>
            </div>

            {(selectedOrder.status === 'picked_up' || selectedOrder.status === 'overdue') && (
              <form onSubmit={(e) => handleInspectionSubmit(e, selectedOrder.id)} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckSquare size={14} /> Log Return quality inspection
                </span>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Condition Rating</label>
                    <select className="glass-input" value={inspectionRating} onChange={e => setInspectionRating(e.target.value)}>
                      <option value="good">Good (No deduction)</option>
                      <option value="needs_repair">Needs Repair (Notify service dept)</option>
                      <option value="damaged">Severely Damaged</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Damage Notes (if any)</label>
                  <input type="text" className="glass-input" value={damageNotes} onChange={e => setDamageNotes(e.target.value)} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Missing Accessories Checklist</label>
                  <input type="text" className="glass-input" value={missingAccs} onChange={e => setMissingAccs(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '10px' }}>
                  Submit return inspection checklist & Settle late penalties
                </button>
              </form>
            )}

            {selectedOrder.status === 'returned' && (
              <div className="glass-panel" style={{ padding: '16px', backgroundColor: '#dff3e4', fontSize: '12px', color: 'var(--blackish)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={16} style={{ color: '#10b981' }} />
                <span>The inspection has been submitted. Click "Settle Security Deposit" above to release the remaining deposit.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
