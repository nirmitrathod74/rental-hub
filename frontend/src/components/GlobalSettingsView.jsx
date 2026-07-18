import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export const GlobalSettingsView = ({ setActiveTab }) => {
  const [lateFeeEnabled, setLateFeeEnabled] = useState(false);
  const [lateFeeAmount, setLateFeeAmount] = useState('');
  
  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [priceListEnabled, setPriceListEnabled] = useState(false);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--blackish)', margin: 0, marginBottom: '16px' }}>General Settings</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" style={{ padding: '8px 24px', fontWeight: 600 }}>Save</button>
            <button className="btn btn-secondary" style={{ padding: '8px 24px', fontWeight: 600 }}>Discard</button>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '16px 24px', borderBottom: '1px solid var(--border)', fontSize: '18px', fontWeight: 700, color: 'var(--blackish)' }}>
          Pickup & Return
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={lateFeeEnabled} 
              onChange={e => setLateFeeEnabled(e.target.checked)} 
              style={{ marginTop: '4px', cursor: 'pointer' }}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Late Fee/Overdue Penalty</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Manage your late fee or overdue charges</div>
            </div>
          </label>

          {lateFeeEnabled && (
            <div className="fade-in" style={{ marginLeft: '28px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: 'var(--danger)' }}>
              Late Fees $ 
              <input 
                type="number" 
                value={lateFeeAmount} 
                onChange={e => setLateFeeAmount(e.target.value)}
                style={{ width: '80px', border: 'none', borderBottom: '1px solid var(--danger)', background: 'transparent', outline: 'none', color: 'var(--danger)', fontSize: '14px', textAlign: 'center' }}
              /> 
              per hour late
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(0,0,0,0.03)', padding: '16px 24px', borderBottom: '1px solid var(--border)', fontSize: '18px', fontWeight: 700, color: 'var(--blackish)' }}>
          Product
        </div>
        <div style={{ padding: '24px', display: 'flex', gap: '48px' }}>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={variantsEnabled} 
                onChange={e => setVariantsEnabled(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Variants</span>
            </label>
            
            {variantsEnabled && (
              <div className="fade-in" style={{ marginLeft: '28px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowRight size={16} color="var(--success)" />
                <span onClick={() => setActiveTab('categories')} style={{ color: 'var(--success)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Attributes
                </span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={priceListEnabled} 
                onChange={e => setPriceListEnabled(e.target.checked)} 
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>Price List</span>
            </label>
            
            {priceListEnabled && (
              <div className="fade-in" style={{ marginLeft: '28px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowRight size={16} color="var(--success)" />
                <span onClick={() => setActiveTab('pricelists')} style={{ color: 'var(--success)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Pricelists
                </span>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
