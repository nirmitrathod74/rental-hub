import React from 'react';
import { X, CheckSquare } from 'lucide-react';

export const InvoiceModal = ({ order, onClose }) => {
  if (!order) return null;

  // Derive state based on order.status
  // For the Invoice mock: we'll say if order is returned/settled, it's Posted. Else Draft.
  const isPosted = ['returned', 'settled'].includes(order.status);
  const isDraft = !isPosted;

  return (
    <div className="detail-modal-overlay" onClick={onClose}>
      <div className="detail-modal-content fade-in" onClick={e => e.stopPropagation()}>
        
        <div className="detail-modal-header">
          <div className="detail-modal-title">
            <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase' }}>New</span>
            Draft Invoice <CheckSquare size={20} color="var(--success)" /> <X size={20} color="var(--danger)" />
          </div>
          
          <div className="detail-status-pills">
            <div className={`detail-status-pill ${isDraft ? 'active' : ''}`}>Draft</div>
            <div className={`detail-status-pill ${isPosted ? 'active' : ''}`}>Posted</div>
          </div>
        </div>

        <div className="detail-action-bar">
          {isDraft ? (
            <>
              <button className="btn btn-primary">Confirm</button>
              <button className="btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary">Send</button>
              <button className="btn-secondary">Print</button>
              <button className="btn-secondary">Pay</button>
            </>
          )}
        </div>

        <div className="detail-form-section">
          <div className="detail-form-col">
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--blackish)', marginBottom: '16px' }}>
              INV/2026/000{order.id}
            </div>
            <div className="detail-form-row">
              <div className="detail-form-label">Customer</div>
              <div className="detail-form-value">{order.client_details?.username || '-'}</div>
            </div>
            <div className="detail-form-row">
              <div className="detail-form-label">Invoice Address</div>
              <div className="detail-form-value">{order.client_details?.address || 'Same as customer'}</div>
            </div>
            <div className="detail-form-row">
              <div className="detail-form-label">Delivery Address</div>
              <div className="detail-form-value">{order.client_details?.address || 'Same as customer'}</div>
            </div>
          </div>

          <div className="detail-form-col">
            <div className="detail-form-row">
              <div className="detail-form-label">Invoice date</div>
              <div className="detail-form-value">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-tabs">
          <div className="detail-tab active">Invoice Lines</div>
        </div>

        <div className="detail-table-container">
          <table className="detail-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Taxes</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length > 0 ? order.items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{item.product_details?.name || 'Item'}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>[Start Date → End Date]</div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>Units</td>
                  <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                  <td>10 %</td>
                  <td>${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td><strong>Computers</strong> <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>[Start Date → End Date]</div></td>
                  <td>20</td>
                  <td>Units</td>
                  <td>$ 20,000</td>
                  <td>10 %</td>
                  <td>$ 4,00,000</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="detail-links">
            <div className="detail-link">Add a Product</div>
            <div className="detail-link">Add a note</div>
          </div>

          <div className="detail-summary">
            <table className="detail-summary-table">
              <tbody>
                <tr>
                  <td>Untaxed Amount:</td>
                  <td>${parseFloat(order.total_rent_amount || 400000).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Taxes:</td>
                  <td>${(parseFloat(order.total_rent_amount || 400000) * 0.1).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Total:</td>
                  <td>${(parseFloat(order.total_rent_amount || 400000) * 1.1).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
