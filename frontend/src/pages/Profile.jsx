import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/index.js';
import { User, FileText, X, Clock, MapPin, Phone, Mail, ChevronRight, Activity, Calendar, Package } from 'lucide-react';
import { validatePhone } from '../utils/validation.js';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [address, setAddress] = useState(user?.address || '');
  
  const [editSuccess, setEditSuccess] = useState('');
  const [isFocused, setIsFocused] = useState('');

  const fetchClientData = async () => {
    try {
      const data = await api.get('/rentals/orders/');
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch rental orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhone(user.phone_number || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setEditSuccess('');
    setError('');
    const phoneError = validatePhone(phone, false);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    try {
      await updateProfile({
        username,
        email,
        phone_number: phone,
        address: address,
      });
      setEditSuccess('Profile details updated successfully!');
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (err) {
      // Handle Django REST framework error objects
      if (typeof err === 'object' && err !== null && !err.message) {
        const errorMessages = Object.entries(err).map(([field, msgs]) => `${field}: ${msgs[0]}`).join(', ');
        setError(errorMessages);
      } else {
        setError(err.message || 'Failed to update profile');
      }
    }
  };

  const handleOrderClick = async (orderId) => {
    try {
      const data = await api.get(`/rentals/orders/${orderId}/`);
      setSelectedOrder(data);
    } catch {
      // Ignore
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/rentals/orders/${orderId}/invoice/`);
      window.open(res.invoice_url, '_blank');
    } catch (err) {
      alert(err.message || 'Failed to fetch invoice path');
    }
  };

  const accentColor = '#6B4668';

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 12px 12px 38px',
    borderRadius: '6px',
    border: `1px solid ${isFocused === fieldName ? accentColor : '#e2e8f0'}`,
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: isFocused === fieldName ? `0 0 0 2px ${accentColor}33` : 'none',
    backgroundColor: '#fff',
    color: '#111'
  });

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
  };

  const kpiCardStyle = {
    flex: '1 1 200px',
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#333' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>My Account</h1>
        <p style={{ color: '#666', marginTop: '8px', fontSize: '15px' }}>Manage your profile information and view your rental history.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '32px', alignItems: 'start' }}>
        
        {/* Profile Information Panel */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px', color: '#111' }}>
            <User size={20} style={{ color: accentColor }} /> Profile Information
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: `${accentColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, fontSize: '24px', fontWeight: 700 }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#111', margin: '0 0 4px 0' }}>{user?.username}</h4>
              <span style={{ background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} onFocus={() => setIsFocused('username')} onBlur={() => setIsFocused('')} style={inputStyle('username')} />
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setIsFocused('email')} onBlur={() => setIsFocused('')} style={inputStyle('email')} />
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onFocus={() => setIsFocused('phone')} onBlur={() => setIsFocused('')} style={inputStyle('phone')} placeholder="+1 (555) 000-0000" />
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>Default Shipping Address</label>
              <div style={{ position: 'relative' }}>
                <textarea value={address} onChange={(e) => setAddress(e.target.value)} onFocus={() => setIsFocused('address')} onBlur={() => setIsFocused('')} style={{ ...inputStyle('address'), resize: 'vertical', minHeight: '80px' }} />
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#94a3b8' }} />
              </div>
            </div>

            {error && (
              <div style={{ color: '#c00', fontSize: '13px', fontWeight: 600, background: '#fee', padding: '12px', borderRadius: '8px', border: '1px solid #fcc' }}>
                {error}
              </div>
            )}
            {editSuccess && (
              <div style={{ color: '#137333', fontSize: '13px', fontWeight: 600, background: '#e6f4ea', padding: '12px', borderRadius: '8px', border: '1px solid #ceead6' }}>
                {editSuccess}
              </div>
            )}

            <button type="submit" style={{ width: '100%', padding: '12px', background: accentColor, color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(107, 70, 104, 0.3)', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Account Operations Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} style={{ color: '#3b82f6' }} /> Account Operations
          </h2>
          
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            
            <div style={{ ...kpiCardStyle, borderTop: '4px solid #64748b' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bookings</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#111', marginTop: '12px' }}>{orders.length}</div>
            </div>

            <div style={{ ...kpiCardStyle, borderTop: '4px solid #10b981' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Rentals</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#111', marginTop: '12px' }}>{orders.filter(o => o.status === 'picked_up').length}</div>
            </div>

            <div style={{ ...kpiCardStyle, borderTop: '4px solid #f59e0b' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Return</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#111', marginTop: '12px' }}>{orders.filter(o => o.status === 'confirmed').length}</div>
            </div>

            <div style={{ ...kpiCardStyle, borderTop: '4px solid #ef4444' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overdue Penalty</div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#111', marginTop: '12px' }}>{orders.filter(o => o.status === 'overdue').length}</div>
            </div>

          </div>
        </div>
      </div>
      )}

      {/* Order History Table */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#111' }}>
          <Calendar size={20} style={{ color: '#6366f1' }} /> Rental Order History
        </h2>

        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Retrieving your order log...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888', background: '#fafafa', borderRadius: '12px' }}>
              <Package size={32} style={{ color: '#ccc', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '15px', color: '#444', marginBottom: '6px' }}>No bookings found</h3>
              <p style={{ fontSize: '13px', margin: 0 }}>You haven't made any rental orders yet.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', color: '#888', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px' }}>Order ID</th>
                  <th style={{ padding: '16px' }}>Scheduled Date Range</th>
                  <th style={{ padding: '16px' }}>Rent Fee</th>
                  <th style={{ padding: '16px' }}>Deposit</th>
                  <th style={{ padding: '16px' }}>Status</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const isLate = parseFloat(order.late_fee_charged) > 0;
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '20px 16px', fontWeight: 700, color: '#111' }}>#{order.id}</td>
                      <td style={{ padding: '20px 16px', fontSize: '14px', color: '#555' }}>
                        {new Date(order.start_date).toLocaleDateString()} &mdash; {new Date(order.end_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '20px 16px', fontWeight: 600, color: '#111' }}>${parseFloat(order.total_rent_amount).toFixed(2)}</td>
                      <td style={{ padding: '20px 16px', color: '#10b981', fontWeight: 600 }}>${parseFloat(order.total_deposit_amount).toFixed(2)}</td>
                      <td style={{ padding: '20px 16px' }}>
                        <span style={{
                          padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize',
                          backgroundColor: order.status === 'picked_up' ? '#e6f4ea' : order.status === 'returned' ? '#e8f0fe' : order.status === 'overdue' ? '#fce8e6' : '#f8f9fa',
                          color: order.status === 'picked_up' ? '#137333' : order.status === 'returned' ? '#1967d2' : order.status === 'overdue' ? '#c5221f' : '#5f6368'
                        }}>
                          {order.status.replace('_', ' ')}
                        </span>
                        {isLate && (
                          <div style={{ fontSize: '11px', color: '#c5221f', marginTop: '6px', fontWeight: 600 }}>
                            +${parseFloat(order.late_fee_charged).toFixed(2)} Late
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                          <button onClick={() => downloadInvoice(order.id)} style={{ background: '#f8f9fa', border: 'none', padding: '8px', borderRadius: '6px', color: '#5f6368', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e8eaed'} onMouseOut={e => e.currentTarget.style.background = '#f8f9fa'} title="Download Invoice">
                            <FileText size={18} />
                          </button>
                          <button onClick={() => handleOrderClick(order.id)} style={{ background: '#fff', border: '1px solid #dadce0', padding: '8px 16px', borderRadius: '6px', color: '#111', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }} onMouseOver={e => {e.currentTarget.style.borderColor = '#bdc1c6'; e.currentTarget.style.background = '#f8f9fa';}} onMouseOut={e => {e.currentTarget.style.borderColor = '#dadce0'; e.currentTarget.style.background = '#fff';}}>
                            Details <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}

      {/* Modal for Order Details */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '24px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '40px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f8f9fa', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5f6368', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#e8eaed'} onMouseOut={e => e.currentTarget.style.background = '#f8f9fa'}>
              <X size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#111' }}>Order #{selectedOrder.id}</h3>
                <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, backgroundColor: '#f8f9fa', color: '#555', textTransform: 'capitalize' }}>
                  {selectedOrder.status.replace('_', ' ')}
                </span>
              </div>
              <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                Created on {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#111' }}>Rented Equipment</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#111', fontSize: '15px' }}>{item.product_details?.name}</span>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        Qty: {item.quantity} &times; ${item.unit_price}/day
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#111', fontSize: '16px' }}>
                      ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.deposit_history.length > 0 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111' }}>
                  <Clock size={16} style={{ color: '#666' }} /> Deposit Ledger Logs
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedOrder.deposit_history.map((tx, idx) => (
                    <div key={idx} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px', backgroundColor: '#fafafa', borderRadius: '12px', border: '1px solid #eee',
                      borderLeft: tx.transaction_type === 'collect' ? '4px solid #10b981' : tx.transaction_type === 'refund' ? '4px solid #3b82f6' : '4px solid #ef4444'
                    }}>
                      <div>
                        <strong style={{ color: '#111', fontSize: '14px' }}>{tx.transaction_type.toUpperCase()}</strong>
                        <span style={{ color: '#555', fontSize: '14px', marginLeft: '8px' }}>&mdash; {tx.notes || 'No description'}</span>
                        <span style={{ color: '#888', display: 'block', fontSize: '12px', marginTop: '4px' }}>
                          {new Date(tx.created_at).toLocaleString()}
                        </span>
                      </div>
                      <span style={{ fontWeight: 800, color: '#111' }}>${parseFloat(tx.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedOrder.inspections.length > 0 && (
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#111' }}>Quality Inspections Checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.inspections.map((ins, index) => (
                    <div key={index} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '12px', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#555' }}>Inspector: <strong style={{ color: '#111' }}>{ins.inspector_details?.username}</strong></span>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize',
                          backgroundColor: ins.condition_rating === 'good' ? '#e6f4ea' : '#fce8e6',
                          color: ins.condition_rating === 'good' ? '#137333' : '#c5221f'
                        }}>
                          {ins.condition_rating}
                        </span>
                      </div>
                      {ins.damage_notes && <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#555' }}><strong style={{ color: '#111' }}>Damage:</strong> {ins.damage_notes}</p>}
                      {ins.missing_accessories && <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}><strong style={{ color: '#111' }}>Missing:</strong> {ins.missing_accessories}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid #eee', paddingTop: '24px', marginTop: '8px' }}>
              <button onClick={() => downloadInvoice(selectedOrder.id)} style={{ flex: 1, padding: '14px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#333'} onMouseOut={e => e.currentTarget.style.background = '#111'}>
                View Full Invoice
              </button>
              <button onClick={() => setSelectedOrder(null)} style={{ flex: 1, padding: '14px', background: '#fff', color: '#111', border: '1px solid #ccc', borderRadius: '8px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fafafa'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
