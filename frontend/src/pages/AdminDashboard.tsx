import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { DashboardMetrics, RentalOrder, Product, PriceList } from '../types';
import {
  BarChart, Activity, AlertOctagon, Wallet, CircleDollarSign, CheckSquare,
  Wrench, FilePlus2, Package2, ShieldAlert, Sparkles, User, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rentals' | 'inventory' | 'pricelists'>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pricelists, setPricelists] = useState<PriceList[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Order for state modification dialog
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);
  const [inspectionRating, setInspectionRating] = useState<'good' | 'damaged' | 'needs_repair'>('good');
  const [damageNotes, setDamageNotes] = useState('');
  const [missingAccs, setMissingAccs] = useState('');
  
  // New Product form fields
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdDepVal, setNewProdDepVal] = useState('');
  const [newProdDepType, setNewProdDepType] = useState<'fixed' | 'percentage'>('fixed');
  const [newProdStock, setNewProdStock] = useState('5');
  const [newProdLateType, setNewProdLateType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('daily');
  const [newProdLateRate, setNewProdLateRate] = useState('');
  const [newProdGrace, setNewProdGrace] = useState('2');
  const [newProdSuccess, setNewProdSuccess] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const metricRes = await api.get<DashboardMetrics>('/rentals/dashboard/metrics/');
      setMetrics(metricRes);

      const orderRes = await api.get<RentalOrder[]>('/rentals/orders/');
      setOrders(orderRes);

      const productRes = await api.get<Product[]>('/inventory/products/');
      setProducts(productRes);

      const priceRes = await api.get<PriceList[]>('/inventory/pricelists/');
      setPricelists(priceRes);
    } catch (err: any) {
      setError(err.message || 'Error occurred fetching ERP dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStateChange = async (orderId: number, actionName: 'confirm' | 'pickup' | 'settle') => {
    try {
      let endpoint = `/rentals/orders/${orderId}/${actionName}/`;
      const updated = await api.post<RentalOrder>(endpoint, {});
      
      // Update local state list
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      
      // Refresh analytics metrics
      const metricRes = await api.get<DashboardMetrics>('/rentals/dashboard/metrics/');
      setMetrics(metricRes);
    } catch (err: any) {
      alert(err.message || 'Failed state transition action.');
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent, orderId: number) => {
    e.preventDefault();
    try {
      const payload = {
        condition_rating: inspectionRating,
        damage_notes: damageNotes,
        missing_accessories: missingAccs
      };

      const res = await api.post<{ order: RentalOrder }>(`/rentals/orders/${orderId}/return_inspection/`, payload);
      setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      setSelectedOrder(res.order);
      
      // Refresh analytics metrics
      const metricRes = await api.get<DashboardMetrics>('/rentals/dashboard/metrics/');
      setMetrics(metricRes);

      setDamageNotes('');
      setMissingAccs('');
      setInspectionRating('good');
      alert('Return inspection logged and stock restored successfully.');
    } catch (err: any) {
      alert(err.message || 'Inspection failed');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewProdSuccess('');
    try {
      const payload = {
        name: newProdName,
        sku: newProdSku,
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

      const freshProd = await api.post<Product>('/inventory/products/', payload);
      setProducts(prev => [...prev, freshProd]);
      setNewProdSuccess('Product registered successfully!');
      
      // Clear forms
      setNewProdName('');
      setNewProdSku('');
      setNewProdDesc('');
      setNewProdPrice('');
      setNewProdDepVal('');
      setNewProdLateRate('');
    } catch (err: any) {
      alert(err.message || 'Failed to register product.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', color: 'hsl(var(--text-secondary))' }}>Loading administrative terminal...</div>;
  }

  // Chart configuration
  const chartData = {
    labels: ['Active Rentals', 'Overdue Rentals', 'Due Today', 'Upcoming Pickups'],
    datasets: [
      {
        label: 'Order Volume count',
        data: [
          metrics?.active_rentals || 0,
          metrics?.overdue_rentals || 0,
          metrics?.rentals_due_today || 0,
          metrics?.upcoming_pickups || 0
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.65)',
          'rgba(244, 63, 94, 0.65)',
          'rgba(251, 191, 36, 0.65)',
          'rgba(99, 102, 241, 0.65)'
        ],
        borderColor: [
          '#10b981',
          '#f43f5e',
          '#f59e0b',
          '#6366f1'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Top Header Navigation tabs */}
      <div className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderRadius: '16px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Admin ERP Control Center</h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={activeTab === 'overview' ? 'btn btn-primary' : 'btn-secondary btn'}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            className={activeTab === 'rentals' ? 'btn btn-primary' : 'btn-secondary btn'}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Manage Bookings ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={activeTab === 'inventory' ? 'btn btn-primary' : 'btn-secondary btn'}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('pricelists')}
            className={activeTab === 'pricelists' ? 'btn btn-primary' : 'btn-secondary btn'}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            PriceLists
          </button>
        </div>
      </div>

      {/* Tab Contents: Overview */}
      {activeTab === 'overview' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Dashboard Metrics grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Activity size={36} style={{ color: '#10b981' }} />
              <div>
                <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Active Rentals</span>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{metrics?.active_rentals}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <AlertOctagon size={36} style={{ color: '#f43f5e' }} />
              <div>
                <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Overdue Returns</span>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f43f5e' }}>{metrics?.overdue_rentals}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Wallet size={36} style={{ color: '#10b981' }} />
              <div>
                <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Security Deposits Held</span>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>${parseFloat(metrics?.security_deposits_held || '0').toFixed(2)}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <CircleDollarSign size={36} style={{ color: '#6366f1' }} />
              <div>
                <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Rent Revenue</span>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>${parseFloat(metrics?.revenue || '0').toFixed(2)}</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <CircleDollarSign size={36} style={{ color: '#f59e0b' }} />
              <div>
                <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Late Penalty Revenue</span>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>${parseFloat(metrics?.late_fee_collection || '0').toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '32px'
          }}>
            {/* Visualizer Chart */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Order Volume Visualizer</h3>
              <div style={{ height: '300px' }}>
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                      },
                      x: {
                        ticks: { color: '#94a3b8' },
                        grid: { display: false }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Pickups / Returns schedule lists */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'hsl(var(--primary))' }} /> Operations Schedule Today
              </h3>
              
              <div>
                <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', fontWeight: 700, textTransform: 'uppercase' }}>
                  Upcoming pickups ({metrics?.upcoming_pickups})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {orders.filter(o => o.status === 'confirmed').slice(0, 3).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <span>Order <strong>#{o.id}</strong> - {o.client_details?.username}</span>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{new Date(o.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'confirmed').length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No pickups scheduled.</span>}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', fontWeight: 700, textTransform: 'uppercase' }}>
                  Returns due today ({metrics?.rentals_due_today})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {orders.filter(o => o.status === 'picked_up').slice(0, 3).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <span>Order <strong>#{o.id}</strong> - {o.client_details?.username}</span>
                      <span style={{ color: 'hsl(var(--text-secondary))' }}>{new Date(o.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'picked_up').length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No returns scheduled.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Contents: rentals list */}
      {activeTab === 'rentals' && (
        <div className="fade-in glass-panel" style={{ padding: '32px', overflowX: 'auto' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>Active System Bookings</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border-glass))', color: 'hsl(var(--text-muted))' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Client User</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Dates</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Paid Rent</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Held Deposit</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>#{order.id}</td>
                  <td style={{ padding: '12px' }}>{order.client_details?.username}</td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    {new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>${parseFloat(order.amount_paid).toFixed(2)}</td>
                  <td style={{ padding: '12px', color: 'hsl(var(--success))' }}>${parseFloat(order.deposit_paid).toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <button onClick={() => setSelectedOrder(order)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px' }}>
                      Audit Transition
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Contents: Inventory management */}
      {activeTab === 'inventory' && (
        <div className="fade-in" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '32px'
        }}>
          {/* Register new product form */}
          <form onSubmit={handleCreateProduct} className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilePlus2 size={20} style={{ color: 'hsl(var(--primary))' }} /> Register Rental Asset
            </h3>

            {newProdSuccess && (
              <div style={{ color: 'hsl(var(--success))', fontSize: '13px', fontWeight: 600 }}>
                {newProdSuccess}
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Asset Name</label>
                <input type="text" className="glass-input" value={newProdName} onChange={e => setNewProdName(e.target.value)} placeholder="e.g. Concrete Mixer" required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>SKU (Unique)</label>
                <input type="text" className="glass-input" value={newProdSku} onChange={e => setNewProdSku(e.target.value)} placeholder="e.g. CON-MIX" required />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Description</label>
              <textarea className="glass-input" value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} placeholder="Asset specifications" rows={2} required />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Base Rate ($/day)</label>
                <input type="number" className="glass-input" value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} placeholder="e.g. 50.00" required />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Initial Stock Qty</label>
                <input type="number" className="glass-input" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} required />
              </div>
            </div>

            {/* Deposit configurations */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Deposit Policy</label>
                <select className="glass-input" value={newProdDepType} onChange={e => setNewProdDepType(e.target.value as any)}>
                  <option value="fixed">Fixed Cash</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Deposit Value</label>
                <input type="number" className="glass-input" value={newProdDepVal} onChange={e => setNewProdDepVal(e.target.value)} placeholder="e.g. 200 or 15%" required />
              </div>
            </div>

            {/* Late Return Rules Strategy configuration */}
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} /> Late Fee Calculations Rules
              </span>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Billing Strategy</label>
                  <select className="glass-input" value={newProdLateType} onChange={e => setNewProdLateType(e.target.value as any)}>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Penalty Rate ($)</label>
                  <input type="number" className="glass-input" value={newProdLateRate} onChange={e => setNewProdLateRate(e.target.value)} placeholder="e.g. 10.00" required />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Grace Hours</label>
                  <input type="number" className="glass-input" value={newProdGrace} onChange={e => setNewProdGrace(e.target.value)} required />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Register Asset
            </button>
          </form>

          {/* Product stock listing */}
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

      {/* Tab Contents: Pricelists management */}
      {activeTab === 'pricelists' && (
        <div className="fade-in glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'hsl(var(--warning))' }} /> Organization Pricelists (Discounts modifiers)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pricelists.map(pl => (
              <div key={pl.id} className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'hsl(var(--primary))' }}>{pl.name}</h4>
                <p style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>
                  Modifiers Active dates: {pl.start_date ? new Date(pl.start_date).toLocaleDateString() : 'Continuous'} - {pl.end_date ? new Date(pl.end_date).toLocaleDateString() : 'Continuous'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  {pl.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                      <span>{item.product_name} ({item.product_sku})</span>
                      <span style={{ fontWeight: 'bold', color: 'hsl(var(--success))' }}>Promo rate: ${item.custom_price}/day</span>
                    </div>
                  ))}
                  {pl.items.length === 0 && <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>No promo override rules mapped.</span>}
                </div>
              </div>
            ))}
            {pricelists.length === 0 && <div style={{ color: 'hsl(var(--text-muted))' }}>No promotional pricelists configured in backend.</div>}
          </div>
        </div>
      )}

      {/* Selected Order Transition & Return Inspection modal overlay */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <button
              onClick={() => { setSelectedOrder(null); fetchAdminData(); }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

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

            {/* State actions based on state */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid hsl(var(--border-glass))', borderRadius: '12px', padding: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))' }}>State transition controller</span>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {selectedOrder.status === 'draft' && (
                  <button onClick={() => handleStateChange(selectedOrder.id, 'confirm')} className="btn btn-primary">
                    Confirm Booking Quotation
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button onClick={() => handleStateChange(selectedOrder.id, 'pickup')} className="btn btn-success btn">
                    Verify & Confirm Pickup
                  </button>
                )}
                {selectedOrder.status === 'returned' && (
                  <button onClick={() => handleStateChange(selectedOrder.id, 'settle')} className="btn btn-primary">
                    Settle Security Deposit
                  </button>
                )}
                {selectedOrder.status === 'settled' && (
                  <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Order is settled and closed. Ledger is locked.</span>
                )}
                {selectedOrder.status === 'cancelled' && (
                  <span style={{ fontSize: '13px', color: 'hsl(var(--text-muted))' }}>Order is cancelled.</span>
                )}
              </div>
            </div>

            {/* Return Inspection form - visible only when picked_up or overdue */}
            {(selectedOrder.status === 'picked_up' || selectedOrder.status === 'overdue') && (
              <form onSubmit={(e) => handleInspectionSubmit(e, selectedOrder.id)} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckSquare size={14} /> Log Return quality inspection
                </span>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Condition Rating</label>
                    <select className="glass-input" value={inspectionRating} onChange={e => setInspectionRating(e.target.value as any)}>
                      <option value="good">Good (No deduction)</option>
                      <option value="needs_repair">Needs Repair (Notify service dept)</option>
                      <option value="damaged">Severely Damaged</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Damage Notes (if any)</label>
                  <input type="text" className="glass-input" value={damageNotes} onChange={e => setDamageNotes(e.target.value)} placeholder="Specify physical damages" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))' }}>Missing Accessories Checklist</label>
                  <input type="text" className="glass-input" value={missingAccs} onChange={e => setMissingAccs(e.target.value)} placeholder="Specify missing accessories or charger cords" />
                </div>

                <button type="submit" className="btn btn-success" style={{ width: '100%', padding: '10px' }}>
                  Submit return inspection checklist & Settle late penalties
                </button>
              </form>
            )}

            {/* Display logged inspections list */}
            {selectedOrder.inspections.length > 0 && (
              <div style={{ borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Log Inspections Logged</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedOrder.inspections.map((ins, idx) => (
                    <div key={idx} style={{ padding: '10px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Inspector: <strong>{ins.inspector_details?.username}</strong></span>
                        <span className={`badge badge-${ins.condition_rating === 'good' ? 'picked_up' : 'overdue'}`}>{ins.condition_rating}</span>
                      </div>
                      {ins.damage_notes && <p style={{ marginTop: '4px' }}><strong>Damage details:</strong> {ins.damage_notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settle info block */}
            {selectedOrder.status === 'returned' && (
              <div className="glass-panel" style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.05)', fontSize: '12px', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wrench size={16} style={{ color: '#10b981' }} />
                <span>
                  The inspection has been submitted. Click "Settle Security Deposit" above to release the remaining deposit (${parseFloat(selectedOrder.deposit_paid) - parseFloat(selectedOrder.late_fee_charged)}) to the customer and lock the transaction ledger.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
