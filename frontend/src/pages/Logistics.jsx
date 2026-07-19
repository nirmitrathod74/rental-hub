import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/index.js';
import { Truck, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, ArrowRightCircle, ArrowLeftCircle } from 'lucide-react';

export const Logistics = () => {
  const { user } = useAuth();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogistics();
  }, []);

  const fetchLogistics = async () => {
    try {
      const data = await api.get('/rentals/orders/schedule_data/');
      setScheduleData(data);
    } catch (err) {
      setError('Failed to load logistics data');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Derive metrics
  const pickupsToday = scheduleData.filter(d => d.status === 'confirmed' && new Date(d.start_date) <= new Date());
  const returnsToday = scheduleData.filter(d => (d.status === 'picked_up' || d.status === 'overdue') && new Date(d.end_date) <= new Date());
  const overdueLogistics = scheduleData.filter(d => d.status === 'overdue');

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
    border: '1px solid #f1f5f9',
    flex: 1,
    minWidth: '250px'
  };

  const accentColor = '#6B4668';

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={28} color={accentColor} /> Logistics Control Tower
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>
            Track pickups, returns, and delivery logs in real-time.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightCircle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Pickups Scheduled</h3>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{pickupsToday.length}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600 }}>Needs action today</div>
        </div>
        
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeftCircle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Returns Expected</h3>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{returnsToday.length}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}>Incoming today</div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: 0 }}>Overdue Recoveries</h3>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>{overdueLogistics.length}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>Action required immediately</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>Upcoming Logistics Schedule</h2>
        
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading logistics timeline...</div>
        ) : error ? (
          <div style={{ padding: '20px', color: '#dc2626', background: '#fef2f2', borderRadius: '8px', textAlign: 'center' }}>{error}</div>
        ) : scheduleData.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#888', background: '#fafafa', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
            <Calendar size={40} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '8px' }}>No logistics data available</h3>
            <p style={{ fontSize: '14px', margin: 0 }}>There are no upcoming pickups or returns scheduled.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer / Order ID</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item</th>
                  <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Check</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((log, idx) => {
                  const isPickup = log.status === 'confirmed';
                  const logDate = isPickup ? log.start_date : log.end_date;
                  
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '16px' }}>
                        {isPickup ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                            <ArrowRightCircle size={14} /> Pickup
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f0fdf4', color: '#22c55e', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                            <ArrowLeftCircle size={14} /> Return
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#1e293b', fontWeight: 600 }}>
                        {new Date(logDate).toLocaleDateString()}
                        {log.status === 'overdue' && <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '12px' }}>(Overdue)</span>}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{log.client_name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Ord: {log.order_public_id.split('-')[0]}</div>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#475569' }}>
                        {log.product_name} <span style={{ fontWeight: 600 }}>&times;{log.quantity}</span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {log.product_availability === 'Available' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '13px', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Available
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
                            <AlertTriangle size={14} /> Unavailable
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
