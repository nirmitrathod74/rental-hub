import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/index.js';
import { Loader2 } from 'lucide-react';

export const ScanRedirect = () => {
  const { product_code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const lookupProduct = async () => {
      try {
        const data = await api.get(`/inventory/products/by-code/${product_code}/`);
        if (data && data.id) {
          navigate(`/product/${data.id}`, { replace: true });
        } else {
          setError('Product catalog asset not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to lookup scanned product code.');
      }
    };
    lookupProduct();
  }, [product_code, navigate]);

  if (error) {
    return (
      <div style={{ padding: '80px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="glass-panel" style={{ padding: '40px', color: 'hsl(var(--danger))', maxWidth: '500px', width: '100%', textAlign: 'center', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: 'hsl(var(--text-primary))' }}>Scan Error</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', lineHeight: '1.6' }}>{error}</p>
          <button className="btn btn-primary" style={{ marginTop: '24px', width: '100%' }} onClick={() => navigate('/')}>Back to Catalog</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '40px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'hsl(var(--primary))' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'hsl(var(--text-primary))' }}>Processing QR Scan</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '13px' }}>Looking up reference: <strong style={{ color: 'hsl(var(--primary))' }}>{product_code}</strong></p>
      </div>
    </div>
  );
};

export default ScanRedirect;
