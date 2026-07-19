import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getMediaUrl, API_ROOT } from '../api/index.js';
import {
  BarChart, Activity, AlertOctagon, Wallet, CircleDollarSign, CheckSquare,
  Wrench, FilePlus2, Package2, ShieldAlert, Sparkles, User, Calendar, X,
  LayoutDashboard, Tags, Clock, Users, ShoppingBag, FileText, Receipt,
  CreditCard, ShieldCheck, Truck, CornerDownLeft, Settings, UserCircle, Plus, Edit,
  Boxes, ChevronDown, LogOut, UserRound, Heart, ShoppingCart, Bell, QrCode, Download,
  Search, AlignJustify, LayoutGrid, CircleUserRound
} from 'lucide-react';


import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { validateRequired } from '../utils/validation.js';
import RentalScheduler from '../components/RentalScheduler.jsx';
import { OrderModal } from '../components/OrderModal.jsx';
import { InvoiceModal } from '../components/InvoiceModal.jsx';
import { QuotationTemplateView } from '../components/QuotationTemplateView.jsx';
import { GlobalSettingsView } from '../components/GlobalSettingsView.jsx';
import { UserProfileView } from '../components/UserProfileView.jsx';
import { PricelistsView } from '../components/PricelistsView.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import logo from '../assets/final_logo.png';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [ordersViewMode, setOrdersViewMode] = useState('list');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pricelists, setPricelists] = useState([]);
  const [rentalPeriods, setRentalPeriods] = useState([]);
  const [quotationTemplates, setQuotationTemplates] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [securityDeposits, setSecurityDeposits] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [pickupDateFilter, setPickupDateFilter] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQrProduct, setSelectedQrProduct] = useState(null);

  const handleDownloadQr = (product) => {
    if (!product) return;
    const url = `${API_ROOT}/api/inventory/products/${product.id}/qr/download/`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.product_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [inspectionRating, setInspectionRating] = useState('good');
  const [damageNotes, setDamageNotes] = useState('');
  const [missingAccs, setMissingAccs] = useState('');
  
  const [showPricelistModal, setShowPricelistModal] = useState(false);
  const [editingPricelist, setEditingPricelist] = useState(null);
  const [pricelistName, setPricelistName] = useState('');
  const [pricelistDefault, setPricelistDefault] = useState(false);
  const [pricelistStart, setPricelistStart] = useState('');
  const [pricelistEnd, setPricelistEnd] = useState('');

  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [periodName, setPeriodName] = useState('');
  const [periodDuration, setPeriodDuration] = useState(1);
  const [periodUnit, setPeriodUnit] = useState('Days');
  
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
  const [newProdImage, setNewProdImage] = useState(null);
  const [newProdImagePreview, setNewProdImagePreview] = useState(null);
  const [newProdSuccess, setNewProdSuccess] = useState('');
  const [prodFieldErrors, setProdFieldErrors] = useState({});

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
      
      const depositRes = await api.get('/security-deposits/');
      setSecurityDeposits(depositRes.data || depositRes);

      const pickupRes = await api.get('/pickups/');
      setPickups(pickupRes.data || pickupRes);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProdImage(file);
      setNewProdImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setNewProdSuccess('');
    
    const errors = {};
    errors.name = validateRequired(newProdName, 'Asset Name');
    errors.sku = validateRequired(newProdSku, 'SKU');
    errors.category = validateRequired(newProdCat, 'Category');
    errors.description = validateRequired(newProdDesc, 'Description');
    errors.price = validateRequired(newProdPrice, 'Base Rate');
    errors.stock = validateRequired(newProdStock, 'Stock Quantity');
    errors.depVal = validateRequired(newProdDepVal, 'Deposit Value');
    errors.lateRate = validateRequired(newProdLateRate, 'Penalty Rate');
    errors.grace = validateRequired(newProdGrace, 'Grace Hours');

    Object.keys(errors).forEach(key => !errors[key] && delete errors[key]);
    setProdFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const payload = new FormData();
      payload.append('name', newProdName);
      payload.append('sku', newProdSku);
      if (newProdCat) payload.append('category', newProdCat);
      payload.append('description', newProdDesc);
      payload.append('base_price', newProdPrice);
      payload.append('security_deposit_type', newProdDepType);
      payload.append('security_deposit_value', newProdDepVal);
      payload.append('stock_qty', parseInt(newProdStock) || 0);
      payload.append('available_qty', parseInt(newProdStock) || 0);
      payload.append('late_fee_type', newProdLateType);
      payload.append('late_fee_rate', newProdLateRate);
      payload.append('grace_period_hours', parseInt(newProdGrace) || 0);
      
      if (newProdImage) {
        payload.append('image', newProdImage);
      }

      const freshProd = await api.post('/inventory/products/', payload);
      setProducts(prev => [...prev, freshProd]);
      setNewProdSuccess('Product registered successfully!');
      setNewProdName(''); setNewProdSku(''); setNewProdCat(''); setNewProdDesc('');
      setNewProdPrice(''); setNewProdDepVal(''); setNewProdLateRate('');
      setNewProdImage(null); setNewProdImagePreview(null);
    } catch (err) {
      alert(err.message || 'Failed to register product.');
    }
  };

  const [editingCategory, setEditingCategory] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [editingProduct, setEditingProduct] = useState(null);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory/categories/', { name: newCatName, description: newCatDesc });
      setCategories([...categories, res]);
      setNewCatName(''); setNewCatDesc('');
    } catch (err) { alert(err.message); }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/inventory/categories/${editingCategory.id}/`, { name: editingCategory.name, description: editingCategory.description });
      setCategories(categories.map(c => c.id === editingCategory.id ? res : c));
      setEditingCategory(null);
    } catch (err) { alert(err.message); }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/inventory/categories/${id}/`);
      setCategories(categories.filter(c => c.id !== id));
      // Optionally re-fetch products to reflect null categories
      const productRes = await api.get('/inventory/products/');
      setProducts(productRes.data || productRes);
    } catch (err) { alert(err.message); }
  };

  const openCreatePricelistModal = () => {
    setEditingPricelist(null);
    setPricelistName('');
    setPricelistDefault(false);
    setPricelistStart('');
    setPricelistEnd('');
    setShowPricelistModal(true);
  };

  const openEditPricelistModal = (pl) => {
    setEditingPricelist(pl);
    setPricelistName(pl.name || '');
    setPricelistDefault(pl.is_default || false);
    setPricelistStart(pl.start_date ? pl.start_date.split('T')[0] : '');
    setPricelistEnd(pl.end_date ? pl.end_date.split('T')[0] : '');
    setShowPricelistModal(true);
  };

  const handleSavePricelist = async (e) => {
    e.preventDefault();
    const payload = {
      name: pricelistName,
      is_default: pricelistDefault,
      start_date: pricelistStart || null,
      end_date: pricelistEnd || null
    };
    try {
      if (editingPricelist) {
        const res = await api.put(`/inventory/pricelists/${editingPricelist.id}/`, payload);
        setPricelists(pricelists.map(p => p.id === editingPricelist.id ? res : p));
      } else {
        const res = await api.post('/inventory/pricelists/', payload);
        setPricelists([...pricelists, res]);
      }
      setShowPricelistModal(false);
    } catch (err) { alert(err.message); }
  };

  const handleDeletePricelist = async (id) => {
    if (!window.confirm("Are you sure you want to delete this pricelist?")) return;
    try {
      await api.delete(`/inventory/pricelists/${id}/`);
      setPricelists(pricelists.filter(p => p.id !== id));
    } catch (err) { alert(err.message); }
  };

  const openCreatePeriodModal = () => {
    setEditingPeriod(null);
    setPeriodName('');
    setPeriodDuration(1);
    setPeriodUnit('Days');
    setShowPeriodModal(true);
  };

  const openEditPeriodModal = (rp) => {
    setEditingPeriod(rp);
    setPeriodName(rp.name || '');
    setPeriodDuration(rp.duration || 1);
    setPeriodUnit(rp.unit || 'Days');
    setShowPeriodModal(true);
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    const payload = {
      name: periodName,
      duration: parseInt(periodDuration, 10),
      unit: periodUnit
    };
    try {
      if (editingPeriod) {
        const res = await api.put(`/inventory/periods/${editingPeriod.id}/`, payload);
        setRentalPeriods(rentalPeriods.map(rp => rp.id === editingPeriod.id ? res : rp));
      } else {
        const res = await api.post('/inventory/periods/', payload);
        setRentalPeriods([...rentalPeriods, res]);
      }
      setShowPeriodModal(false);
    } catch (err) { alert(err.message); }
  };

  const handleDeletePeriod = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rental period?")) return;
    try {
      await api.delete(`/inventory/periods/${id}/`);
      setRentalPeriods(rentalPeriods.filter(rp => rp.id !== id));
    } catch (err) { alert(err.message); }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = new FormData();
      payload.append('name', editingProduct.name);
      payload.append('sku', editingProduct.sku);
      if (editingProduct.category) payload.append('category', editingProduct.category);
      payload.append('description', editingProduct.description || '');
      payload.append('base_price', editingProduct.base_price);
      payload.append('security_deposit_type', editingProduct.security_deposit_type || 'fixed');
      payload.append('security_deposit_value', editingProduct.security_deposit_value || 0);
      payload.append('stock_qty', editingProduct.stock_qty || 0);
      payload.append('available_qty', editingProduct.available_qty || 0);
      payload.append('late_fee_type', editingProduct.late_fee_type || 'daily');
      payload.append('late_fee_rate', editingProduct.late_fee_rate || 0);
      payload.append('grace_period_hours', editingProduct.grace_period_hours || 0);
      
      if (newProdImage) {
        payload.append('image', newProdImage);
      }

      const res = await api.put(`/inventory/products/${editingProduct.id}/`, payload);
      setProducts(products.map(p => p.id === editingProduct.id ? res : p));
      setEditingProduct(null);
      setNewProdImage(null);
      setNewProdImagePreview(null);
    } catch (err) { alert(err.message); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/inventory/products/${id}/`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) { alert(err.message); }
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
    { id: 'customers', icon: Users, label: 'Clients' },
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
    <div className="admin-dashboard-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
      <header className="erp-navbar">
        <div className="erp-navbar-left">
          <Link className="erp-brand" to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={logo} alt="RentalHub Logo" style={{ height: '32px', width: '32px', objectFit: 'contain', display: 'block' }} />
            RentalHub ERP
          </Link>
          <nav className="erp-nav-links">
            <div className="erp-nav-item">
              Sales
              <div className="erp-dropdown-menu">
                <button className="erp-dropdown-item" onClick={() => setActiveTab('orders')}>All Orders</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('invoices')}>Invoices</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('customers')}>Clients</button>
              </div>
            </div>

            <div className="erp-nav-item">
              Operations
              <div className="erp-dropdown-menu">
                <button className="erp-dropdown-item" onClick={() => setActiveTab('schedule')}>Schedule</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('pickup')}>Pickups</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('return')}>Returns</button>
              </div>
            </div>

            <div className="erp-nav-item">
              Catalog
              <div className="erp-dropdown-menu">
                <button className="erp-dropdown-item" onClick={() => setActiveTab('products')}>Products</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('categories')}>Product Attributes</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('pricelists')}>Pricelists</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('rental_periods')}>Rental Periods</button>
              </div>
            </div>

            <div className="erp-nav-item">
              Reports
            </div>

            <div className="erp-nav-item">
              Settings
              <div className="erp-dropdown-menu">
                <button className="erp-dropdown-item" onClick={() => setActiveTab('configuration')}>General Settings</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('user_profile')}>Users & Roles</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('quotations')}>Quotation Templates</button>
                <button className="erp-dropdown-item" onClick={() => setActiveTab('vendors')}>
                  Vendor Approvals {vendors.length > 0 && <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '10px', padding: '2px 6px', fontSize: '10px', marginLeft: '6px' }}>{vendors.length}</span>}
                </button>
              </div>
            </div>
          </nav>
        </div>

        <div className="erp-search-container">
          <input type="text" placeholder="Search..." className="erp-search-input" />
        </div>

        <div className="erp-actions">
          <Heart size={20} className="erp-action-icon" />
          <ShoppingCart size={20} className="erp-action-icon" />
          <Bell size={20} className="erp-action-icon" />
          
          <div className="erp-divider"></div>

          {user && (
            <div style={{ position: 'relative' }}>
              <div className="erp-profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="erp-profile-avatar">
                  {user.avatar ? (
                    <img src={getMediaUrl(user.avatar)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <span>{user.username ? user.username.charAt(0).toUpperCase() : 'A'}</span>
                  )}
                </div>
                <div className="erp-profile-text">
                  <span className="erp-profile-name">{user.username || 'Admin'}</span>
                  <span className="erp-profile-role">Admin</span>
                </div>
                <ChevronDown size={14} color="white" />
              </div>
              
              {dropdownOpen && (
                <div className="erp-dropdown-menu" style={{ display: 'flex', top: '100%', right: 0, left: 'auto', transform: 'none', marginTop: '12px' }}>
                  <button className="erp-dropdown-item text-danger" onClick={() => { logout(); navigate('/login'); }} style={{ color: 'var(--danger)' }}>
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="page fade-in admin-erp-layout" style={{ display: 'block', padding: '24px', flex: 1, maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="fade-in" style={{ height: 'calc(100vh - 120px)' }}>
            <RentalScheduler setActiveTab={setActiveTab} />
          </div>
        )}

        {/* PRICELISTS TAB */}
        {activeTab === 'pricelists' && (
          <PricelistsView setActiveTab={setActiveTab} onDataChange={fetchAdminData} />
        )}

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
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{metrics?.pending_quotations} <small style={{fontSize: '12px', color: 'hsl(var(--text-secondary))'}}>{metrics?.total_customers} Total Clients</small></div></div>
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
                  <button className="btn btn-secondary" onClick={() => setActiveTab('customers')}><Plus size={16}/> Create Client</button>
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
                  <input type="text" className={`glass-input ${prodFieldErrors?.name ? 'input-error' : ''}`} value={newProdName} onChange={e => { setNewProdName(e.target.value); setProdFieldErrors({...prodFieldErrors, name: ''}); }} />
                  {prodFieldErrors?.name && <span className="field-error">{prodFieldErrors.name}</span>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>SKU (Unique)</label>
                  <input type="text" className={`glass-input ${prodFieldErrors?.sku ? 'input-error' : ''}`} value={newProdSku} onChange={e => { setNewProdSku(e.target.value); setProdFieldErrors({...prodFieldErrors, sku: ''}); }} />
                  {prodFieldErrors?.sku && <span className="field-error">{prodFieldErrors.sku}</span>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Category</label>
                  <select className={`glass-input ${prodFieldErrors?.category ? 'input-error' : ''}`} value={newProdCat} onChange={e => { setNewProdCat(e.target.value); setProdFieldErrors({...prodFieldErrors, category: ''}); }}>
                    <option value="">Select Category</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                  </select>
                  {prodFieldErrors?.category && <span className="field-error">{prodFieldErrors.category}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Description</label>
                <textarea className={`glass-input ${prodFieldErrors?.description ? 'input-error' : ''}`} value={newProdDesc} onChange={e => { setNewProdDesc(e.target.value); setProdFieldErrors({...prodFieldErrors, description: ''}); }} rows={2} />
                {prodFieldErrors?.description && <span className="field-error">{prodFieldErrors.description}</span>}
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Base Rate ($/day)</label>
                  <input type="number" className={`glass-input ${prodFieldErrors?.price ? 'input-error' : ''}`} value={newProdPrice} onChange={e => { setNewProdPrice(e.target.value); setProdFieldErrors({...prodFieldErrors, price: ''}); }} />
                  {prodFieldErrors?.price && <span className="field-error">{prodFieldErrors.price}</span>}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Initial Stock Qty</label>
                  <input type="number" className={`glass-input ${prodFieldErrors?.stock ? 'input-error' : ''}`} value={newProdStock} onChange={e => { setNewProdStock(e.target.value); setProdFieldErrors({...prodFieldErrors, stock: ''}); }} />
                  {prodFieldErrors?.stock && <span className="field-error">{prodFieldErrors.stock}</span>}
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
                  <input type="number" className={`glass-input ${prodFieldErrors?.depVal ? 'input-error' : ''}`} value={newProdDepVal} onChange={e => { setNewProdDepVal(e.target.value); setProdFieldErrors({...prodFieldErrors, depVal: ''}); }} />
                  {prodFieldErrors?.depVal && <span className="field-error">{prodFieldErrors.depVal}</span>}
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
                    <input type="number" className={`glass-input ${prodFieldErrors?.lateRate ? 'input-error' : ''}`} value={newProdLateRate} onChange={e => { setNewProdLateRate(e.target.value); setProdFieldErrors({...prodFieldErrors, lateRate: ''}); }} />
                    {prodFieldErrors?.lateRate && <span className="field-error">{prodFieldErrors.lateRate}</span>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Grace Hours</label>
                    <input type="number" className={`glass-input ${prodFieldErrors?.grace ? 'input-error' : ''}`} value={newProdGrace} onChange={e => { setNewProdGrace(e.target.value); setProdFieldErrors({...prodFieldErrors, grace: ''}); }} />
                    {prodFieldErrors?.grace && <span className="field-error">{prodFieldErrors.grace}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Product Image</label>
                {newProdImagePreview && (
                  <div style={{ marginBottom: '8px' }}>
                    <img src={newProdImagePreview} alt="Preview" style={{ maxHeight: '120px', borderRadius: '6px', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ position: 'relative', width: '100%' }}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                  <div style={{ padding: '12px', border: '2px dashed hsl(var(--border-glass))', borderRadius: '6px', backgroundColor: 'var(--extra-light)', color: 'hsl(var(--text-muted))', fontSize: '12px', textAlign: 'center', pointerEvents: 'none' }}>
                    {newProdImage ? newProdImage.name : 'Click or drag to upload image'}
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
                      <span style={{ fontSize: '11px', color: 'hsl(var(--text-muted))' }}>
                        Code: <strong style={{ color: 'hsl(var(--primary))' }}>{p.product_code}</strong> | SKU: {p.sku} | Strategy: {p.late_fee_type} | Penalty: ${p.late_fee_rate}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{p.available_qty}/{p.stock_qty} available</div>
                        <span className="badge badge-picked_up" style={{ fontSize: '9px' }}>Active</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <button onClick={() => setSelectedQrProduct(p)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', color: 'hsl(var(--primary))' }} title="Generate QR"><QrCode size={14} /></button>
                        <button onClick={() => setEditingProduct(p)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}><Edit size={14} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--danger)', color: 'var(--danger)' }}><X size={14} /></button>
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
          <div className="fade-in glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <form onSubmit={handleCreateCategory} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--primary))' }}>Create Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Name</label>
                <input type="text" className="glass-input" value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Description</label>
                <input type="text" className="glass-input" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Add Category</button>
            </form>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tags size={18} /> Categories ({categories.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {categories.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--extra-light)', borderRadius: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.description || 'No description'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setEditingCategory(c)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}><Edit size={14} /></button>
                      <button onClick={() => handleDeleteCategory(c.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--danger)', color: 'var(--danger)' }}><X size={14} /></button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No categories configured.</span>}
              </div>
            </div>
          </div>
        )}



        {/* RENTAL PERIODS TAB */}
        {activeTab === 'rental_periods' && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} /> Rental Periods ({rentalPeriods.length})
              </h3>
              <button onClick={openCreatePeriodModal} style={{ backgroundColor: '#6B4668', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                <Plus size={16} /> Create Rental Period
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {rentalPeriods.map(rp => (
                <div key={rp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'var(--extra-light)', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 'bold' }}>{rp.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{rp.duration} {rp.unit}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditPeriodModal(rp)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', color: '#6B4668' }}><Edit size={14} /></button>
                      <button onClick={() => handleDeletePeriod(rp.id)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--danger)', color: 'var(--danger)' }}><X size={14} /></button>
                    </div>
                  </div>
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
                <Users size={20} style={{ color: 'hsl(var(--primary))' }} /> Client Management
              </h3>
              <button className="btn btn-primary" onClick={() => alert('Client creation modal to be implemented')}><Plus size={16}/> Create Client</button>
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
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No clients found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="fade-in glass-panel" style={{ padding: '32px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                Rental Orders <Settings size={18} color="hsl(var(--text-secondary))" />
              </h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="erp-search-container" style={{ margin: 0, width: '200px' }}>
                   <input type="text" placeholder="Search orders..." className="erp-search-input" style={{ background: 'var(--extra-light)', color: 'var(--text-primary)' }} />
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plus size={16}/> New</button>
                <div className="admin-view-switcher">
                  <div className="admin-view-switcher-buttons">
                    <button className={ordersViewMode === 'list' ? 'active' : ''} onClick={() => setOrdersViewMode('list')}><AlignJustify size={16} /></button>
                    <button className={ordersViewMode === 'kanban' ? 'active' : ''} onClick={() => setOrdersViewMode('kanban')}><LayoutGrid size={16} /></button>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-filters-row">
              <div className="admin-filter-chip">
                <span>{metrics?.rentals_due_today || 0}</span>
                <span>Today</span>
              </div>
              <div className="admin-filter-chip">
                <span>{metrics?.upcoming_pickups || 0}</span>
                <span>Pickup</span>
              </div>
              <div className="admin-filter-chip">
                <span>0</span>
                <span>Return</span>
              </div>
              <div className="admin-filter-chip">
                <span>{metrics?.overdue_rentals || 0}</span>
                <span>Late</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--whitish)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, color: 'var(--blackish)' }}>
                <Calendar size={14} color="hsl(var(--primary))" /> Last 7 Days <ChevronDown size={14} />
              </div>

              <div className="admin-stats">
                <div className="admin-stat-item">
                  <span className="admin-stat-label">Sales</span>
                  <span className="admin-stat-value">${parseFloat(metrics?.revenue_this_month || '0').toFixed(2)}</span>
                </div>
                <div className="admin-stat-item">
                  <span className="admin-stat-label">Late Fees</span>
                  <span className="admin-stat-value">${parseFloat(metrics?.late_fee_collection || '0').toFixed(2)}</span>
                </div>
                <div className="admin-stat-item">
                  <span className="admin-stat-label">Deposit</span>
                  <span className="admin-stat-value">${parseFloat(metrics?.security_deposits_held || '0').toFixed(2)}</span>
                </div>
              </div>
            </div>

            {ordersViewMode === 'list' ? (
              <table className="list-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', paddingLeft: '20px' }}><input type="checkbox" /></th>
                    <th>Order Reference</th>
                    <th>Client</th>
                    <th>Status</th>
                    <th>Pickup Date</th>
                    <th>Return Date</th>
                    <th>Total</th>
                    <th>Invoice Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.status !== 'draft').map(order => {
                    let invoiceBadge = 'badge-draft';
                    let invoiceText = 'Nothing to Invoice';
                    if (order.status === 'confirmed') { invoiceBadge = 'badge-confirmed'; invoiceText = 'Confirmed'; }
                    else if (['picked_up', 'returned', 'settled'].includes(order.status)) { invoiceBadge = 'badge-picked_up'; invoiceText = 'Invoiced'; }

                    return (
                      <tr key={order.id} onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                        <td style={{ paddingLeft: '20px' }}><input type="checkbox" onClick={(e) => e.stopPropagation()} /></td>
                        <td><strong>S000{order.id}</strong></td>
                        <td>{order.client_details?.username}</td>
                        <td><span className={`badge badge-${order.status}`}>{order.status}</span></td>
                        <td>{new Date(order.start_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                        <td>{new Date(order.end_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                        <td>${parseFloat(order.amount_paid || order.total_rent_amount || 0).toFixed(0)}</td>
                        <td><span className={`badge ${invoiceBadge}`}>{invoiceText}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="kanban-board">
                {['draft', 'confirmed', 'picked_up', 'returned', 'cancelled'].map(statusKey => {
                   const statusOrders = orders.filter(o => o.status === statusKey);
                   let title = '';
                   if (statusKey === 'draft') title = 'Quotations';
                   else if (statusKey === 'confirmed') title = 'Reserved';
                   else if (statusKey === 'picked_up') title = 'Active / Picked Up';
                   else if (statusKey === 'returned') title = 'Completed';
                   else if (statusKey === 'cancelled') title = 'Cancelled';
                   
                   return (
                     <div key={statusKey} className="kanban-column">
                       <div className="kanban-column-header">
                         {title}
                         <span className="kanban-column-count">{statusOrders.length}</span>
                       </div>
                       <div className="kanban-column-content">
                         {statusOrders.map(order => {
                           let invoiceBadge = 'badge-draft';
                           let invoiceText = 'Nothing to Invoice';
                           if (order.status === 'confirmed') { invoiceBadge = 'badge-confirmed'; invoiceText = 'Confirmed'; }
                           else if (['picked_up', 'returned', 'settled'].includes(order.status)) { invoiceBadge = 'badge-picked_up'; invoiceText = 'Invoiced'; }
                           
                           return (
                             <div key={order.id} className="kanban-card" onClick={() => setSelectedOrder(order)}>
                               <div className="kanban-card-header">
                                 <span className="kanban-card-id">S000{order.id}</span>
                                 <span className={`badge badge-${order.status}`}>{order.status}</span>
                               </div>
                               <div className="kanban-card-customer">{order.client_details?.username}</div>
                               <div className="kanban-card-dates">
                                 <Calendar size={12} />
                                 {new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}
                               </div>
                               <div className="kanban-card-footer">
                                 <span className={`badge ${invoiceBadge}`}>{invoiceText}</span>
                                 <span className="kanban-card-amount">${parseFloat(order.amount_paid || order.total_rent_amount || 0).toFixed(0)}</span>
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        )}

        {/* QUOTATIONS TAB */}
        {activeTab === 'quotations' && (
          <QuotationTemplateView />
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
                  <th>Client</th>
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

        {/* SECURITY DEPOSITS TAB */}
        {activeTab === 'deposits' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div className="glass-panel" style={{ flex: '1 1 250px', padding: '24px', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', fontWeight: 600, textTransform: 'uppercase' }}>Total Deposits Held</span>
                <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                  ${securityDeposits.filter(d => d.status === 'Held').reduce((acc, d) => acc + parseFloat(d.amount), 0).toFixed(2)}
                </div>
              </div>
              <div className="glass-panel" style={{ flex: '1 1 250px', padding: '24px', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', fontWeight: 600, textTransform: 'uppercase' }}>Total Penalties Deducted</span>
                <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#f43f5e' }}>
                  ${securityDeposits.reduce((acc, d) => acc + parseFloat(d.penalty_deducted), 0).toFixed(2)}
                </div>
              </div>
              <div className="glass-panel" style={{ flex: '1 1 250px', padding: '24px', backgroundColor: '#ffffff' }}>
                <span style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', fontWeight: 600, textTransform: 'uppercase' }}>Total Refunded</span>
                <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#3b82f6' }}>
                  ${securityDeposits.filter(d => ['Refunded', 'Partial Deduction'].includes(d.status)).reduce((acc, d) => acc + (parseFloat(d.amount) - parseFloat(d.penalty_deducted)), 0).toFixed(2)}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '32px', overflowX: 'auto', backgroundColor: '#ffffff' }}>
              <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <ShieldCheck size={20} style={{ color: '#6B4668' }} /> Deposit History
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#6B4668', fontSize: '13px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Client Name</th>
                    <th style={{ padding: '12px' }}>Order ID</th>
                    <th style={{ padding: '12px' }}>Deposit Amount</th>
                    <th style={{ padding: '12px' }}>Penalty Amount</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {securityDeposits.map(deposit => (
                    <tr key={deposit.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 600, fontSize: '14px' }}>{deposit.customer_name}</td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: 'gray' }}>#{deposit.order_number}</td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', fontWeight: 600 }}>${parseFloat(deposit.amount).toFixed(2)}</td>
                      <td style={{ padding: '16px 12px', fontSize: '14px', color: deposit.penalty_deducted > 0 ? '#f43f5e' : 'gray' }}>
                        ${parseFloat(deposit.penalty_deducted).toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                          backgroundColor: deposit.status === 'Refunded' ? '#d1fae5' : (deposit.status === 'Held' ? '#fef3c7' : '#ffedd5'),
                          color: deposit.status === 'Refunded' ? '#065f46' : (deposit.status === 'Held' ? '#92400e' : '#9a3412')
                        }}>
                          {deposit.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        {deposit.status === 'Held' && (
                          <button 
                            onClick={() => alert(`Initiate refund process for Order #${deposit.order_number}`)}
                            style={{ backgroundColor: '#6B4668', color: '#ffffff', padding: '6px 12px', borderRadius: '4px', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Process Refund / Settle
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {securityDeposits.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'gray', fontSize: '14px' }}>
                        No security deposits found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PICKUPS TAB */}
        {activeTab === 'pickup' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '20px', color: '#6B4668', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Truck size={24} /> Pickup Operations
                </h3>
                <input 
                  type="date" 
                  value={pickupDateFilter}
                  onChange={(e) => setPickupDateFilter(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <button style={{ backgroundColor: '#6B4668', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                + Scan Barcode
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pickups.filter(p => p.start_date && p.start_date.startsWith(pickupDateFilter)).length === 0 ? (
                <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', backgroundColor: '#ffffff', color: 'gray' }}>
                  No pending pickups scheduled for {pickupDateFilter}.
                </div>
              ) : (
                pickups.filter(p => p.start_date && p.start_date.startsWith(pickupDateFilter)).map(order => (
                  <div key={order.id} className="glass-panel" style={{ padding: '20px', backgroundColor: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderLeft: '4px solid #6B4668' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '16px', color: '#1e293b' }}>Order #{order.id}</span>
                        <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>•</span>
                        <span style={{ fontSize: '14px', color: '#475569', fontWeight: 600 }}>{order.client_details?.username}</span>
                        <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#fef08a', color: '#854d0e', borderRadius: '999px', fontWeight: 600 }}>{order.status}</span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#475569' }}>
                        <strong>Items:</strong> {order.items?.map(i => `${i.product_details?.name} (x${i.quantity})`).join(', ')}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> Scheduled: {new Date(order.start_date).toLocaleString()}
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          await api.post(`/rentals/orders/${order.id}/pickup/`);
                          alert(`Pickup confirmed for Order #${order.id}`);
                          setPickups(prev => prev.filter(p => p.id !== order.id));
                        } catch(e) {
                          alert('Error confirming pickup: ' + (e.response?.data?.error || e.message));
                        }
                      }}
                      style={{ backgroundColor: '#6B4668', color: '#ffffff', padding: '10px 16px', borderRadius: '6px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.2s', alignSelf: 'flex-start' }}
                    >
                      Confirm Pickup
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CONFIGURATION TAB */}
        {activeTab === 'configuration' && (
          <GlobalSettingsView setActiveTab={setActiveTab} />
        )}

        {/* USER PROFILE TAB */}
        {activeTab === 'user_profile' && (
          <UserProfileView />
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

      {/* ORDER AND INVOICE MODALS */}
      {selectedOrder && !invoiceModalOpen && (
        <OrderModal 
          order={selectedOrder}
          onClose={() => { setSelectedOrder(null); fetchAdminData(); }}
          onCreateInvoice={() => setInvoiceModalOpen(true)}
        />
      )}
      
      {selectedOrder && invoiceModalOpen && (
        <InvoiceModal 
          order={selectedOrder}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
      
      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(33,37,43,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px'
        }}>
          <form onSubmit={handleUpdateCategory} className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button type="button" onClick={() => setEditingCategory(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Edit Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Name</label>
              <input type="text" className="glass-input" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Description</label>
              <input type="text" className="glass-input" value={editingCategory.description || ''} onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '8px' }}>Save Changes</button>
          </form>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(33,37,43,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px'
        }}>
          <form onSubmit={handleUpdateProduct} className="glass-panel" style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button type="button" onClick={() => { setEditingProduct(null); setNewProdImagePreview(null); setNewProdImage(null); }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Edit Product: {editingProduct.name}</h3>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Asset Name</label>
                <input type="text" className="glass-input" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>SKU (Unique)</label>
                <input type="text" className="glass-input" value={editingProduct.sku} onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Category</label>
                <select className="glass-input" value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                  <option value="">Select Category</option>
                  {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Description</label>
              <textarea className="glass-input" value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} rows={2} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Base Rate ($/day)</label>
                <input type="number" className="glass-input" value={editingProduct.base_price} onChange={e => setEditingProduct({...editingProduct, base_price: e.target.value})} required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Initial Stock Qty</label>
                <input type="number" className="glass-input" value={editingProduct.stock_qty} onChange={e => setEditingProduct({...editingProduct, stock_qty: e.target.value})} required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Available Qty</label>
                <input type="number" className="glass-input" value={editingProduct.available_qty} onChange={e => setEditingProduct({...editingProduct, available_qty: e.target.value})} required />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Deposit Policy</label>
                <select className="glass-input" value={editingProduct.security_deposit_type} onChange={e => setEditingProduct({...editingProduct, security_deposit_type: e.target.value})}>
                  <option value="fixed">Fixed Cash</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Deposit Value</label>
                <input type="number" className="glass-input" value={editingProduct.security_deposit_value} onChange={e => setEditingProduct({...editingProduct, security_deposit_value: e.target.value})} required />
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} /> Late Fee Calculations Rules
              </span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Billing Strategy</label>
                  <select className="glass-input" value={editingProduct.late_fee_type} onChange={e => setEditingProduct({...editingProduct, late_fee_type: e.target.value})}>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Penalty Rate ($)</label>
                  <input type="number" className="glass-input" value={editingProduct.late_fee_rate} onChange={e => setEditingProduct({...editingProduct, late_fee_rate: e.target.value})} required />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Grace Hours</label>
                  <input type="number" className="glass-input" value={editingProduct.grace_period_hours} onChange={e => setEditingProduct({...editingProduct, grace_period_hours: e.target.value})} required />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Product Image</label>
              {(newProdImagePreview || editingProduct.image) && (
                <div style={{ marginBottom: '8px' }}>
                  <img src={newProdImagePreview || editingProduct.image} alt="Preview" style={{ maxHeight: '120px', borderRadius: '6px', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ position: 'relative', width: '100%' }}>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                <div style={{ padding: '12px', border: '2px dashed hsl(var(--border-glass))', borderRadius: '6px', backgroundColor: 'var(--extra-light)', color: 'hsl(var(--text-muted))', fontSize: '12px', textAlign: 'center', pointerEvents: 'none' }}>
                  {newProdImage ? newProdImage.name : 'Click or drag to change image'}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Save Product Changes</button>
          </form>
        </div>
      )}

      {/* PRICELIST MODAL */}
      {showPricelistModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(33,37,43,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px'
        }}>
          <form onSubmit={handleSavePricelist} className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button type="button" onClick={() => setShowPricelistModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{editingPricelist ? 'Edit Pricelist' : 'Create Pricelist'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Name</label>
              <input type="text" className="glass-input" value={pricelistName} onChange={e => setPricelistName(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="pl-default" checked={pricelistDefault} onChange={e => setPricelistDefault(e.target.checked)} />
              <label htmlFor="pl-default" style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Is Default (Always active fallback)</label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Start Date</label>
                <input type="date" className="glass-input" value={pricelistStart} onChange={e => setPricelistStart(e.target.value)} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>End Date</label>
                <input type="date" className="glass-input" value={pricelistEnd} onChange={e => setPricelistEnd(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '8px', backgroundColor: '#6B4668', color: '#fff', border: 'none' }}>
              {editingPricelist ? 'Save Changes' : 'Create Pricelist'}
            </button>
          </form>
        </div>
      )}

      {/* RENTAL PERIOD MODAL */}
      {showPeriodModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(33,37,43,0.5)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px'
        }}>
          <form onSubmit={handleSavePeriod} className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '32px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button type="button" onClick={() => setShowPeriodModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{editingPeriod ? 'Edit Rental Period' : 'Create Rental Period'}</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Name (e.g. Daily Rental)</label>
              <input type="text" className="glass-input" value={periodName} onChange={e => setPeriodName(e.target.value)} required />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Duration</label>
                <input type="number" className="glass-input" value={periodDuration} onChange={e => setPeriodDuration(e.target.value)} required min="1" />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Unit</label>
                <select className="glass-input" value={periodUnit} onChange={e => setPeriodUnit(e.target.value)}>
                  <option value="Hours">Hours</option>
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '8px', backgroundColor: '#6B4668', color: '#fff', border: 'none' }}>
              {editingPeriod ? 'Save Changes' : 'Create Rental Period'}
            </button>
          </form>
        </div>
      )}

      {selectedQrProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="glass-panel" style={{
            padding: '32px',
            maxWidth: '360px',
            width: '100%',
            textAlign: 'center',
            borderRadius: '16px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <button onClick={() => setSelectedQrProduct(null)} style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'hsl(var(--text-secondary))'
            }}><X size={20} /></button>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Product QR Code</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13px' }}>
              Product: <strong>{selectedQrProduct.name}</strong><br />
              Reference Code: <strong style={{ color: 'hsl(var(--primary))' }}>{selectedQrProduct.product_code}</strong>
            </p>
            <div style={{
              border: '1px solid hsl(var(--border-glass))',
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <img
                src={`${API_ROOT}/api/inventory/products/${selectedQrProduct.id}/qr/`}
                alt="QR Code"
                style={{ width: '180px', height: '180px', display: 'block' }}
              />
            </div>
            <button onClick={() => handleDownloadQr(selectedQrProduct)} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
              <Download size={16} /> Download PNG
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

