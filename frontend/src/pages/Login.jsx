import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowRight, KeyRound, LockKeyhole, PackageCheck } from 'lucide-react';
import { validateRequired } from '../utils/validation.js';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReset = searchParams.get('reset') === 'true';
  
  const validateForm = () => {
    const errors = {};
    errors.username = validateRequired(username, 'Username or Email');
    errors.password = validateRequired(password, 'Password');
    
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
    try { 
      const user = await login(username, password); 
      navigate(user.role === 'admin' ? '/admin' : '/'); 
    } catch (err) { 
      setError(err.message || 'Invalid username or password'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  return <div className="auth-page fade-in"><div className="auth-backdrop auth-backdrop-login" />
    <section className="auth-intro"><Link className="auth-brand" to="/"><PackageCheck size={23} strokeWidth={2.5} /> RentalHub</Link><div><p className="auth-eyebrow">YOUR RENTAL, ON YOUR TERMS</p><h1>Every rental<br /><em>within reach.</em></h1><p className="auth-intro-copy">A simpler way to find the gear you need, keep track of bookings, and get back to what matters.</p></div><div className="auth-note"><KeyRound size={18} /> Secure access for renters and rental partners.</div></section>
    <section className="auth-card-wrap"><div className="auth-card"><div className="auth-card-heading"><p className="auth-kicker">WELCOME BACK</p><h2>Sign in to RentalHub</h2><p>Use your account details to continue.</p></div>{isReset && <div className="auth-success" style={{ padding: '12px 16px', backgroundColor: 'rgba(40, 167, 69, 0.1)', borderColor: 'rgba(40, 167, 69, 0.2)', color: '#28a745', fontSize: '13px', borderRadius: '4px', marginBottom: '16px', fontWeight: 500 }}>Password reset successfully! You can now sign in.</div>}{error && <div className="auth-error">{error}</div>}<form onSubmit={handleSubmit} noValidate className="auth-form"><div className="auth-field"><label>Username or Email</label><input type="text" value={username} onChange={(event) => { setUsername(event.target.value); setFieldErrors({...fieldErrors, username: ''}); }} placeholder="Enter your username or email" className={fieldErrors.username ? 'input-error' : ''} />{fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}</div><div className="auth-field"><label>Password</label><input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setFieldErrors({...fieldErrors, password: ''}); }} placeholder="Enter your password" className={fieldErrors.password ? 'input-error' : ''} />{fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}</div><div className="auth-form-tools"><span>Keep your details private.</span><Link to="/forgot-password">Forgot password?</Link></div><button type="submit" disabled={submitting} className="auth-submit">{submitting ? 'Signing in...' : <>Sign in <ArrowRight size={17} /></>}</button></form><p className="auth-footer-copy">New to RentalHub? <Link to="/signup">Create a renter account</Link></p><p className="auth-secondary-link"><LockKeyhole size={14} /> Are you a vendor? <Link to="/vendor-signup">Register your business</Link></p></div></section>
  </div>;
};
