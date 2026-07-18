import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, PackageCheck, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '../utils/validation.js';

export const Signup = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', couponCode: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(''); 
  const [submitting, setSubmitting] = useState(false);
  const { register, login } = useAuth(); 
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
    if (!validateForm()) return; // Stop if local checks fail
    
    setSubmitting(true); 
    // Derrive a unique username from email
    const username = form.email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 150); 
    try { 
      // Call register auth context trigger
      await register({ username, first_name: form.firstName, last_name: form.lastName, email: form.email, password: form.password, phone_number: form.phone, role: 'client' }); 
      // Redirect directly to login with ?registered=true query flag to show check-email reminder
      navigate('/login?registered=true'); 
    } catch (err) { 
      setError(err.message || 'We could not create that account. Try another email address.'); 
    } finally { 
      setSubmitting(false); 
    } 
  };
  
  return <div className="auth-page auth-page-register fade-in"><div className="auth-backdrop auth-backdrop-register" /><section className="auth-intro"><Link className="auth-brand" to="/"><PackageCheck size={23} strokeWidth={2.5} /> RentalHub</Link><div><p className="auth-eyebrow">FOR EVERYDAY PROJECTS</p><h1>Rent less.<br /><em>Do more.</em></h1><p className="auth-intro-copy">Create a renter account to discover equipment, manage reservations, and keep every booking in one place.</p></div><Link className="auth-switch-card" to="/vendor-signup"><span>Do you rent equipment out?</span><strong>Register as a vendor <ArrowRight size={16} /></strong></Link></section><section className="auth-card-wrap"><div className="auth-card auth-card-wide"><div className="auth-card-heading"><p className="auth-kicker">RENTER ACCOUNT</p><h2>Create your account</h2><p>Set up your details once, then rent whenever you need.</p></div>{error && <div className="auth-error">{error}</div>}<form onSubmit={handleSubmit} noValidate className="auth-form"><div className="auth-field-row"><div className="auth-field"><label>First name</label><input name="firstName" value={form.firstName} onChange={update} autoComplete="given-name" className={fieldErrors.firstName ? 'input-error' : ''} />{fieldErrors.firstName && <span className="field-error">{fieldErrors.firstName}</span>}</div><div className="auth-field"><label>Last name</label><input name="lastName" value={form.lastName} onChange={update} autoComplete="family-name" className={fieldErrors.lastName ? 'input-error' : ''} />{fieldErrors.lastName && <span className="field-error">{fieldErrors.lastName}</span>}</div></div><div className="auth-field"><label>Email address</label><input type="email" name="email" value={form.email} onChange={update} autoComplete="email" placeholder="you@example.com" className={fieldErrors.email ? 'input-error' : ''} />{fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}</div><div className="auth-field"><label>Phone number <span>Optional</span></label><input type="tel" name="phone" value={form.phone} onChange={update} autoComplete="tel" placeholder="+91 00000 00000" className={fieldErrors.phone ? 'input-error' : ''} />{fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}</div><div className="auth-field-row"><div className="auth-field"><label>Password</label><input type="password" name="password" value={form.password} onChange={update} autoComplete="new-password" className={fieldErrors.password ? 'input-error' : ''} />{fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}</div><div className="auth-field"><label>Confirm password</label><input type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} autoComplete="new-password" className={fieldErrors.confirmPassword ? 'input-error' : ''} />{fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}</div></div><div className="auth-coupon"><Ticket size={17} /><input name="couponCode" value={form.couponCode} onChange={update} placeholder="Have a coupon code?" /><span>Optional</span></div><button className="auth-submit" disabled={submitting}>{submitting ? 'Creating account...' : <>Create renter account <ArrowRight size={17} /></>}</button></form><p className="auth-footer-copy">Already have an account? <Link to="/login">Sign in</Link></p></div></section></div>;
};
