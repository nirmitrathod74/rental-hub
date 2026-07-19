import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Upload, ArrowLeft } from 'lucide-react';

export const AddVendorProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    base_price: '',
    stock_qty: 1,
    security_deposit_type: 'fixed',
    security_deposit_value: '',
    late_fee_type: 'daily',
    late_fee_rate: '',
    grace_period_hours: '2'
  });
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFocused, setIsFocused] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/inventory/categories/');
      setCategories(res);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      if (file) {
        data.append('image', file);
      }

      await api.post('/inventory/vendor-products/', data);
      navigate('/vendor/dashboard');
    } catch (err) {
      console.error('Error adding product:', err);
      setError('Failed to add product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const accentColor = '#6B4668';

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: `1px solid ${isFocused === fieldName ? accentColor : '#e2e8f0'}`,
    outline: 'none',
    boxSizing: 'border-box',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: isFocused === fieldName ? `0 0 0 2px ${accentColor}33` : 'none',
    backgroundColor: '#fff'
  });

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif', color: '#333' }}>
      <button 
        onClick={() => navigate('/vendor/dashboard')}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'none', border: 'none', color: '#666', 
          cursor: 'pointer', marginBottom: '24px', fontSize: '14px',
          padding: '8px 0', fontWeight: '500'
        }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: '#111' }}>
          Create Product
        </h2>
        
        {error && (
          <div style={{ marginBottom: '24px', padding: '16px', background: '#fee', color: '#c00', borderRadius: '8px', border: '1px solid #fcc' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Asset Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleInputChange} 
                onFocus={() => setIsFocused('name')} onBlur={() => setIsFocused('')} style={inputStyle('name')} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>SKU (Unique)</label>
              <input required type="text" name="sku" value={formData.sku} onChange={handleInputChange} 
                onFocus={() => setIsFocused('sku')} onBlur={() => setIsFocused('')} style={inputStyle('sku')} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Category</label>
              <select required name="category" value={formData.category} onChange={handleInputChange}
                onFocus={() => setIsFocused('category')} onBlur={() => setIsFocused('')} style={{...inputStyle('category'), cursor: 'pointer'}}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#666' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2}
              onFocus={() => setIsFocused('description')} onBlur={() => setIsFocused('')} style={{...inputStyle('description'), resize: 'vertical'}} />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Base Rate ($/day)</label>
              <input required type="number" min="0" step="0.01" name="base_price" value={formData.base_price} onChange={handleInputChange}
                onFocus={() => setIsFocused('base_price')} onBlur={() => setIsFocused('')} style={inputStyle('base_price')} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Initial Stock Qty</label>
              <input required type="number" min="1" name="stock_qty" value={formData.stock_qty} onChange={handleInputChange}
                onFocus={() => setIsFocused('stock_qty')} onBlur={() => setIsFocused('')} style={inputStyle('stock_qty')} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Deposit Policy</label>
              <select required name="security_deposit_type" value={formData.security_deposit_type} onChange={handleInputChange}
                onFocus={() => setIsFocused('security_deposit_type')} onBlur={() => setIsFocused('')} style={{...inputStyle('security_deposit_type'), cursor: 'pointer'}}>
                <option value="fixed">Fixed Cash</option>
                <option value="percentage">Percentage (%)</option>
              </select>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Deposit Value</label>
              <input required type="number" min="0" step="0.01" name="security_deposit_value" value={formData.security_deposit_value} onChange={handleInputChange}
                onFocus={() => setIsFocused('security_deposit_value')} onBlur={() => setIsFocused('')} style={inputStyle('security_deposit_value')} />
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Late Fee Calculations Rules
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#666' }}>Billing Strategy</label>
                <select required name="late_fee_type" value={formData.late_fee_type} onChange={handleInputChange}
                  onFocus={() => setIsFocused('late_fee_type')} onBlur={() => setIsFocused('')} style={{...inputStyle('late_fee_type'), cursor: 'pointer'}}>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#666' }}>Penalty Rate ($)</label>
                <input required type="number" min="0" step="0.01" name="late_fee_rate" value={formData.late_fee_rate} onChange={handleInputChange}
                  onFocus={() => setIsFocused('late_fee_rate')} onBlur={() => setIsFocused('')} style={inputStyle('late_fee_rate')} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#666' }}>Grace Hours</label>
                <input required type="number" min="0" name="grace_period_hours" value={formData.grace_period_hours} onChange={handleInputChange}
                  onFocus={() => setIsFocused('grace_period_hours')} onBlur={() => setIsFocused('')} style={inputStyle('grace_period_hours')} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', color: '#666' }}>Product Image</label>
            
            {imagePreview && (
              <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }} 
                />
              </div>
            )}

            <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
              <input type="file" accept="image/*" onChange={handleFileChange} id="file-upload" 
                style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', border: '2px dashed #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px', pointerEvents: 'none' }}>
                <Upload size={24} style={{ marginBottom: '8px', color: '#6B4668' }} />
                {file ? <span style={{ color: '#166534', fontWeight: '600' }}>{file.name}</span> : <span>Click or drag to upload image</span>}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                width: '100%',
                padding: '14px 24px', borderRadius: '6px', border: 'none', backgroundColor: accentColor, color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                fontWeight: '600', boxShadow: '0 4px 12px rgba(107, 70, 104, 0.3)', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
              {isSubmitting ? (
                <>
                  <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  Submitting...
                </>
              ) : (
                'Register Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
