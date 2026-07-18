import React, { useState } from 'react';

export const AddProductForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    base_price: '',
    status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState('');

  const accentColor = '#6B4668';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('sku', formData.sku);
      data.append('base_price', formData.base_price);
      data.append('status', formData.status);
      if (imageFile) {
        data.append('image', imageFile);
      }

      // We do not set Content-Type header. Browser handles multipart/form-data with boundaries automatically.
      const response = await fetch('http://localhost:8000/api/inventory/products/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: data
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create product');
      }

      setMessage('Product created successfully!');
      
      // Clear form
      setFormData({ name: '', sku: '', base_price: '', status: 'active' });
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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
    marginBottom: '16px'
  });

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 20px',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: '24px',
          color: '#0f172a',
          fontSize: '24px',
          fontWeight: '700',
          textAlign: 'center'
        }}>Register New Product</h2>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7',
            color: message.includes('Error') ? '#991b1b' : '#166534',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div>
            <label style={labelStyle} htmlFor="name">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={() => setIsFocused('name')}
              onBlur={() => setIsFocused('')}
              style={inputStyle('name')}
              required
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="sku">SKU</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              onFocus={() => setIsFocused('sku')}
              onBlur={() => setIsFocused('')}
              style={inputStyle('sku')}
              required
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="base_price">Base Price ($)</label>
            <input
              type="number"
              id="base_price"
              name="base_price"
              step="0.01"
              value={formData.base_price}
              onChange={handleInputChange}
              onFocus={() => setIsFocused('base_price')}
              onBlur={() => setIsFocused('')}
              style={inputStyle('base_price')}
              required
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              onFocus={() => setIsFocused('status')}
              onBlur={() => setIsFocused('')}
              style={{...inputStyle('status'), cursor: 'pointer', backgroundColor: '#fff'}}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Product Image</label>
            
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

            <div style={{
              position: 'relative',
              display: 'inline-block',
              width: '100%'
            }}>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                border: '2px dashed #cbd5e1',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                fontSize: '14px',
                pointerEvents: 'none'
              }}>
                {imageFile ? imageFile.name : 'Click or drag to upload image'}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: accentColor,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background-color 0.2s ease, transform 0.1s ease',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#5a3b57'; }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.backgroundColor = accentColor; }}
            onMouseDown={(e) => { if(!loading) e.currentTarget.style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { if(!loading) e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Registering...
              </>
            ) : (
              'Add Product'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
