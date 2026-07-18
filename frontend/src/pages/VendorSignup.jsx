import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail, validatePhone, validateGST, validatePassword, validateRequired } from '../utils/validation.js';

export const VendorSignup = () => {
  const [form, setForm] = useState({ businessName: '', firstName: '', lastName: '', email: '', phone: '', address: '', password: '', confirmPassword: '', gstNumber: '', productCategory: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(''); 
  const [submitting, setSubmitting] = useState(false); 
  const [success, setSuccess] = useState(false);
  const { register } = useAuth(); 
  const navigate = useNavigate(); 
  
  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    if (fieldErrors[event.target.name]) {
      setFieldErrors({ ...fieldErrors, [event.target.name]: '' });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    errors.firstName = validateRequired(form.firstName, 'First Name');
    errors.lastName = validateRequired(form.lastName, 'Last Name');
    errors.businessName = validateRequired(form.businessName, 'Company Name');
    errors.gstNumber = validateGST(form.gstNumber, true);
    errors.productCategory = validateRequired(form.productCategory, 'Product Category');
    errors.email = validateEmail(form.email);
    errors.phone = validatePhone(form.phone, false);
    errors.password = validatePassword(form.password, true);
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    // Remove empty error strings
    Object.keys(errors).forEach(key => !errors[key] && delete errors[key]);
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => { 
    event.preventDefault(); 
    setError(''); 
    if (!validateForm()) return;
    
    setSubmitting(true); 
    const username = form.email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 150); 
    try { 
      await register({ username, first_name: form.firstName, last_name: form.lastName, email: form.email, password: form.password, phone_number: form.phone, address: form.address, business_name: form.businessName, gst_number: form.gstNumber, product_category: form.productCategory, role: 'vendor' }); 
      setSuccess(true); 
    } catch (err) { 
      setError(err.message || 'We could not register this business. Try another email address.'); 
    } finally { 
      setSubmitting(false); 
    } 
  };
  
  if (success) {
    return (
      <div className="auth-page auth-page-vendor fade-in">
        <div className="auth-backdrop auth-backdrop-vendor" />
        <section className="auth-card-wrap">
          <div className="auth-card">
            <div className="auth-card-heading">
              <PackageCheck size={32} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
              <h2>Registration Received</h2>
              <p>Your vendor account is currently pending admin approval. You will receive an email once approved.</p>
            </div>
            <Link to="/login" className="auth-submit" style={{ textDecoration: 'none', textAlign: 'center' }}>Return to Login</Link>
          </div>
        </section>
      </div>
    );
  }

  return <div className="auth-page auth-page-vendor fade-in"><div className="auth-backdrop auth-backdrop-vendor" /><section className="auth-intro"><Link className="auth-brand" to="/"><PackageCheck size={23} strokeWidth={2.5} /> RentalHub</Link><div><p className="auth-eyebrow">PARTNER WITH RENTALHUB</p><h1>Make your<br /><em>inventory work.</em></h1><p className="auth-intro-copy">Bring your equipment online with a storefront built for clear availability and dependable rentals.</p></div><div className="auth-note"><Building2 size={18} /> Built for independent rental businesses.</div></section><section className="auth-card-wrap"><div className="auth-card auth-card-wide"><div className="auth-card-heading"><p className="auth-kicker">VENDOR ACCOUNT</p><h2>Register your business</h2><p>Tell us who you are and where customers can find you.</p></div>{error && <div className="auth-error">{error}</div>}<form onSubmit={handleSubmit} noValidate className="auth-form"><div className="auth-field-row"><div className="auth-field"><label>First Name</label><input name="firstName" value={form.firstName} onChange={update} className={fieldErrors.firstName ? 'input-error' : ''} />{fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}</div><div className="auth-field"><label>Last Name</label><input name="lastName" value={form.lastName} onChange={update} className={fieldErrors.lastName ? 'input-error' : ''} />{fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}</div></div><div className="auth-field-row"><div className="auth-field"><label>Company Name</label><input name="businessName" value={form.businessName} onChange={update} className={fieldErrors.businessName ? 'input-error' : ''} />{fieldErrors.businessName && <span className="field-error">{fieldErrors.businessName}</span>}</div><div className="auth-field"><label>GST no</label><input name="gstNumber" value={form.gstNumber} onChange={update} placeholder="e.g. 22AAAAA0000A1Z5" className={fieldErrors.gstNumber ? 'input-error' : ''} />{fieldErrors.gstNumber && <span className="field-error">{fieldErrors.gstNumber}</span>}</div></div><div className="auth-field-row"><div className="auth-field"><label>Product Category</label><select name="productCategory" value={form.productCategory} onChange={update} className={`glass-input ${fieldErrors.productCategory ? 'input-error' : ''}`} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}><option value="">Select Category</option><option value="heavy_machinery">Heavy Machinery</option><option value="electronics">Electronics</option><option value="vehicles">Vehicles</option><option value="event_gear">Event Gear</option><option value="tools">Tools & Equipment</option></select>{fieldErrors.productCategory && <span className="field-error">{fieldErrors.productCategory}</span>}</div><div className="auth-field"><label>Email ID</label><input type="email" name="email" value={form.email} onChange={update} className={fieldErrors.email ? 'input-error' : ''} />{fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}</div></div><div className="auth-field-row"><div className="auth-field"><label>Phone number</label><input type="tel" name="phone" value={form.phone} onChange={update} className={fieldErrors.phone ? 'input-error' : ''} />{fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}</div><div className="auth-field"><label>Business address</label><input name="address" value={form.address} onChange={update} /></div></div><div className="auth-field-row"><div className="auth-field"><label>Password</label><input type="password" name="password" value={form.password} onChange={update} className={fieldErrors.password ? 'input-error' : ''} />{fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}</div><div className="auth-field"><label>Confirm Password</label><input type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} className={fieldErrors.confirmPassword ? 'input-error' : ''} />{fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}</div></div><button className="auth-submit" disabled={submitting} style={{ marginTop: '10px' }}>{submitting ? 'Registering...' : <>Register <ArrowRight size={17} /></>}</button></form><p className="auth-footer-copy">Already have an account? <Link to="/login">Sign in</Link></p></div></section></div>;
};
