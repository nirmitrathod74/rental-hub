import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, PackageCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const VendorSignup = () => {
  const [form, setForm] = useState({ businessName: '', firstName: '', lastName: '', email: '', phone: '', address: '', password: '', confirmPassword: '', gstNumber: '', productCategory: '' });
  const [error, setError] = useState(''); const [submitting, setSubmitting] = useState(false); const [success, setSuccess] = useState(false);
  const { register } = useAuth(); const navigate = useNavigate(); const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => { event.preventDefault(); setError(''); if (form.password !== form.confirmPassword) return setError('Your passwords do not match.'); setSubmitting(true); const username = form.email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 150); try { await register({ username, first_name: form.firstName, last_name: form.lastName, email: form.email, password: form.password, phone_number: form.phone, address: form.address, business_name: form.businessName, gst_number: form.gstNumber, product_category: form.productCategory, role: 'vendor' }); setSuccess(true); } catch (err) { setError(err.message || 'We could not register this business. Try another email address.'); } finally { setSubmitting(false); } };
  
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

  return <div className="auth-page auth-page-vendor fade-in"><div className="auth-backdrop auth-backdrop-vendor" /><section className="auth-intro"><Link className="auth-brand" to="/"><PackageCheck size={23} strokeWidth={2.5} /> RentalHub</Link><div><p className="auth-eyebrow">PARTNER WITH RENTALHUB</p><h1>Make your<br /><em>inventory work.</em></h1><p className="auth-intro-copy">Bring your equipment online with a storefront built for clear availability and dependable rentals.</p></div><div className="auth-note"><Building2 size={18} /> Built for independent rental businesses.</div></section><section className="auth-card-wrap"><div className="auth-card auth-card-wide"><div className="auth-card-heading"><p className="auth-kicker">VENDOR ACCOUNT</p><h2>Register your business</h2><p>Tell us who you are and where customers can find you.</p></div>{error && <div className="auth-error">{error}</div>}<form onSubmit={handleSubmit} className="auth-form"><div className="auth-field-row"><div className="auth-field"><label>First Name</label><input name="firstName" value={form.firstName} onChange={update} required /></div><div className="auth-field"><label>Last Name</label><input name="lastName" value={form.lastName} onChange={update} required /></div></div><div className="auth-field-row"><div className="auth-field"><label>Company Name</label><input name="businessName" value={form.businessName} onChange={update} required /></div><div className="auth-field"><label>GST no</label><input name="gstNumber" value={form.gstNumber} onChange={update} required /></div></div><div className="auth-field-row"><div className="auth-field"><label>Product Category</label><select name="productCategory" value={form.productCategory} onChange={update} required className="glass-input" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}><option value="">Select Category</option><option value="heavy_machinery">Heavy Machinery</option><option value="electronics">Electronics</option><option value="vehicles">Vehicles</option><option value="event_gear">Event Gear</option><option value="tools">Tools & Equipment</option></select></div><div className="auth-field"><label>Email ID</label><input type="email" name="email" value={form.email} onChange={update} required /></div></div><div className="auth-field-row"><div className="auth-field"><label>Phone number</label><input type="tel" name="phone" value={form.phone} onChange={update} /></div><div className="auth-field"><label>Business address</label><input name="address" value={form.address} onChange={update} /></div></div><div className="auth-field-row"><div className="auth-field"><label>Password</label><input type="password" name="password" value={form.password} onChange={update} minLength="8" required /></div><div className="auth-field"><label>Confirm Password</label><input type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} minLength="8" required /></div></div><button className="auth-submit" disabled={submitting} style={{ marginTop: '10px' }}>{submitting ? 'Registering...' : <>Register <ArrowRight size={17} /></>}</button></form><p className="auth-footer-copy">Already have an account? <Link to="/login">Sign in</Link></p></div></section></div>;
};
