import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/index.js';
import { Package, Activity, Calendar, FileText, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Rentals = () => {
  const { user } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const data = await api.get('/rentals/orders/schedule_data/');
      setRentals(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.order_public_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rental.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rental.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: { bg: '#e0e7ff', color: '#4338ca' },
      picked_up: { bg: '#d1fae5', color: '#059669' },
      overdue: { bg: '#fee2e2', color: '#dc2626' },
    };
    const style = styles[status] || { bg: '#f1f5f9', color: '#475569' };
    
    return (
      <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, backgroundColor: style.bg, color: style.color, textTransform: 'capitalize' }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>Active Rentals</h1>
          <p style={{ color: '#666', marginTop: '8px', fontSize: '15px' }}>
            Monitor and manage ongoing rentals, checkouts, and returns.
          </p>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search rentals by ID, product, or customer..." 
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
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up (Active)</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>Loading rentals...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2', borderRadius: '8px', textAlign: 'center' }}>{error}</div>
          ) : filteredRentals.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#888', background: '#fafafa', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <Package size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '8px' }}>No active rentals found</h3>
              <p style={{ fontSize: '14px', margin: 0 }}>There are no items currently rented out that match your search.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rental ID</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Equipment & Customer</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rental Period</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRentals.map((rental, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '20px 16px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{rental.order_public_id.split('-')[0]}</td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{rental.product_name} &times; {rental.quantity}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ display: 'inline-block', width: '20px', height: '20px', background: '#e2e8f0', borderRadius: '50%', textAlign: 'center', lineHeight: '20px', color: '#475569', fontWeight: 700, fontSize: '11px' }}>{rental.client_name[0].toUpperCase()}</span>
                        {rental.client_name}
                      </div>
                    </td>
                    <td style={{ padding: '20px 16px', fontSize: '14px', color: '#475569' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} style={{ color: '#94a3b8' }}/> {new Date(rental.start_date).toLocaleDateString()}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', marginLeft: '20px' }}>to {new Date(rental.end_date).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      {getStatusBadge(rental.status)}
                    </td>
                    <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                      {rental.status === 'confirmed' && (
                        <button style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', color: '#0f172a', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='#f8fafc'}>
                          Mark Picked Up
                        </button>
                      )}
                      {(rental.status === 'picked_up' || rental.status === 'overdue') && (
                        <button style={{ background: '#6B4668', border: 'none', padding: '8px 12px', borderRadius: '6px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }} onMouseOver={e=>e.currentTarget.style.opacity=0.9} onMouseOut={e=>e.currentTarget.style.opacity=1}>
                          Process Return
                        </button>
                      )}
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
