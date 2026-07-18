import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { RentalOrder } from '../types';
import { User, FileText, Info, X, Clock, HelpCircle, MapPin, Phone, Mail } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RentalOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile edit states
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [address, setAddress] = useState(user?.address || '');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchClientData = async () => {
    try {
      const data = await api.get<RentalOrder[]>('/rentals/orders/');
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rental orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccess('');
    try {
      await updateProfile({
        phone_number: phone,
        address: address,
      });
      setEditSuccess('Profile details updated!');
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleOrderClick = async (orderId: number) => {
    try {
      const data = await api.get<RentalOrder>(`/rentals/orders/${orderId}/`);
      setSelectedOrder(data);
    } catch {
      // Ignore
    }
  };

  const downloadInvoice = async (orderId: number) => {
    try {
      const res = await api.get<{ invoice_url: string }>(`/rentals/orders/${orderId}/invoice/`);
      window.open(res.invoice_url, '_blank');
    } catch (err: any) {
      alert(err.message || 'Failed to fetch invoice path');
    }
  };

  return (
    <div className="fade-in" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Upper Grid: Profile Editor & Fast metrics summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px'
      }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} style={{ color: 'hsl(var(--primary))' }} /> Profile Information
          </h2>

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'hsl(var(--primary))',
                fontSize: '24px',
                border: '1px solid hsl(var(--border-glass))'
              }}>
                👤
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{user?.username}</h4>
                <span className="badge badge-draft" style={{ fontSize: '10px' }}>{user?.role}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))', fontWeight: 600 }}>Email Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--text-muted))', fontSize: '14px' }}>
                <Mail size={14} /> {user?.email}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="glass-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--text-secondary))' }}>Default Shipping Address</label>
              <div style={{ position: 'relative' }}>
                <textarea
                  className="glass-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ paddingLeft: '38px', resize: 'vertical' }}
                  rows={2}
                />
                <MapPin size={14} style={{ position: 'absolute', left: '12px', top: '16px', color: 'hsl(var(--text-muted))' }} />
              </div>
            </div>

            {editSuccess && (
              <div style={{ color: 'hsl(var(--success))', fontSize: '13px', fontWeight: 600 }}>
                {editSuccess}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              Update Profile Details
            </button>
          </form>
        </div>

        {/* Quick Summary Dashboard */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Account Operations</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Total Bookings</span>
              <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px' }}>{orders.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Active Rentals</span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'hsl(var(--success))', marginTop: '4px' }}>
                {orders.filter(o => o.status === 'picked_up').length}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Pending Return</span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'hsl(var(--warning))', marginTop: '4px' }}>
                {orders.filter(o => o.status === 'confirmed').length}
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-secondary))' }}>Overdue Penalty</span>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'hsl(var(--danger))', marginTop: '4px' }}>
                {orders.filter(o => o.status === 'overdue').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Row: Rental Orders List */}
      <div className="glass-panel" style={{ padding: '32px', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Rental Order History</h2>

        {loading ? (
          <div style={{ color: 'hsl(var(--text-secondary))' }}>Retrieving your order log...</div>
        ) : orders.length === 0 ? (
          <div style={{ color: 'hsl(var(--text-muted))', fontSize: '14px' }}>No bookings found in your account history.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border-glass))', color: 'hsl(var(--text-muted))' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Order ID</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Scheduled Date Range</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Rent Fee</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Security Deposit</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Late Fees</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 'bold' }}>#{order.id}</td>
                  <td style={{ padding: '14px 12px', fontSize: '13px' }}>
                    {new Date(order.start_date).toLocaleDateString()} - {new Date(order.end_date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 12px' }}>${parseFloat(order.total_rent_amount).toFixed(2)}</td>
                  <td style={{ padding: '14px 12px', color: 'hsl(var(--success))' }}>${parseFloat(order.total_deposit_amount).toFixed(2)}</td>
                  <td style={{ padding: '14px 12px', color: parseFloat(order.late_fee_charged) > 0 ? 'hsl(var(--danger))' : 'inherit' }}>
                    ${parseFloat(order.late_fee_charged).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className={`badge badge-${order.status}`}>{order.status}</span>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => handleOrderClick(order.id)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px' }}>
                        Details
                      </button>
                      <button onClick={() => downloadInvoice(order.id)} className="btn-secondary" style={{ padding: '6px', borderRadius: '4px' }} title="Invoice">
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal Dialog */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
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
              onClick={() => setSelectedOrder(null)}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Order Detail # {selectedOrder.id}</h3>
                <span className={`badge badge-${selectedOrder.status}`}>{selectedOrder.status}</span>
              </div>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '13px', marginTop: '4px' }}>
                Created: {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>

            {/* Line Items */}
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Rented Equipments</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="glass-panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.product_details?.name}</span>
                      <div style={{ fontSize: '11px', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>
                        Qty: {item.quantity} | Rate: ${item.unit_price}/day
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold' }}>
                      ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deposit history ledgers */}
            {selectedOrder.deposit_history.length > 0 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> Deposit Ledger Logs
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedOrder.deposit_history.map((tx, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      padding: '8px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: '4px',
                      borderLeft: tx.transaction_type === 'collect' ? '3px solid hsl(var(--success))' : tx.transaction_type === 'refund' ? '3px solid hsl(var(--info))' : '3px solid hsl(var(--danger))'
                    }}>
                      <div>
                        <strong>{tx.transaction_type.toUpperCase()}</strong>: {tx.notes || 'No description'}
                        <span style={{ color: 'hsl(var(--text-muted))', display: 'block', fontSize: '10px' }}>
                          {new Date(tx.created_at).toLocaleString()}
                        </span>
                      </div>
                      <span style={{ fontWeight: 'bold' }}>${parseFloat(tx.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inspection logs */}
            {selectedOrder.inspections.length > 0 && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Quality Inspections Checklist</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedOrder.inspections.map((ins, index) => (
                    <div key={index} className="glass-panel" style={{ padding: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Inspector: <strong>{ins.inspector_details?.username}</strong></span>
                        <span className={`badge badge-${ins.condition_rating === 'good' ? 'picked_up' : 'overdue'}`}>
                          {ins.condition_rating}
                        </span>
                      </div>
                      {ins.damage_notes && <p style={{ marginTop: '6px', fontSize: '12px' }}><strong>Damage:</strong> {ins.damage_notes}</p>}
                      {ins.missing_accessories && <p style={{ marginTop: '2px', fontSize: '12px' }}><strong>Missing:</strong> {ins.missing_accessories}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '20px' }}>
              <button onClick={() => downloadInvoice(selectedOrder.id)} className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                View Full Invoice
              </button>
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary" style={{ flex: 1, padding: '10px' }}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
