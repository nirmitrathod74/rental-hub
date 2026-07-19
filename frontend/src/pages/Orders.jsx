import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/index.js';
import { Package, Search, Filter, ChevronRight, FileText, Calendar, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.get('/rentals/orders/');
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) || 
                          (order.client_details?.username || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#d97706' },
      confirmed: { bg: '#e0e7ff', color: '#4338ca' },
      picked_up: { bg: '#d1fae5', color: '#059669' },
      returned: { bg: '#f1f5f9', color: '#475569' },
      overdue: { bg: '#fee2e2', color: '#dc2626' },
    };
    const style = styles[status] || { bg: '#f1f5f9', color: '#475569' };
    
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 700,
        backgroundColor: style.bg,
        color: style.color,
        textTransform: 'capitalize'
      }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>Order Management</h1>
          <p style={{ color: '#666', marginTop: '8px', fontSize: '15px' }}>
            {user?.role === 'admin' ? 'Manage all platform orders and rentals.' : 'Manage orders for your listed products.'}
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        
        {/* Filters and Search */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '12px 16px 12px 44px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px', appearance: 'none', background: '#fff', minWidth: '180px', cursor: 'pointer' }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up (Active)</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading orders...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2', borderRadius: '8px', textAlign: 'center' }}>{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888', background: '#fafafa', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <Package size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '8px' }}>No orders found</h3>
              <p style={{ fontSize: '14px', margin: 0 }}>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rental Period</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '20px 16px', fontWeight: 700, color: '#0f172a' }}>#{order.id}</td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '14px', fontWeight: 700 }}>
                          {(order.client_details?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{order.client_details?.username || 'Unknown'}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{order.client_details?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 16px', fontSize: '14px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} style={{ color: '#94a3b8' }}/> {new Date(order.start_date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginLeft: '20px' }}>to {new Date(order.end_date).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>${parseFloat(order.total_rent_amount).toFixed(2)}</div>
                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>+${parseFloat(order.total_deposit_amount).toFixed(2)} deposit</div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      {getStatusBadge(order.status)}
                    </td>
                    <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                      <button 
                        onClick={() => {
                          // Note: A detailed view can be added later or route to a specific order details page.
                          // For now we'll route to a view or show an alert since it wasn't requested.
                          alert(`Details for Order #${order.id} clicked!`);
                        }}
                        style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px' }} 
                        onMouseOver={e => {e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc';}} 
                        onMouseOut={e => {e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff';}}
                      >
                        View <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
