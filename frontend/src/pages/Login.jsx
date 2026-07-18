import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowRight, KeyRound, LockKeyhole, PackageCheck } from 'lucide-react';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { const user = await login(username, password); navigate(user.role === 'admin' ? '/admin' : '/'); }
    catch (err) { setError(err.message || 'Invalid username or password'); }
    finally { setSubmitting(false); }
  };

  return <div className="auth-page fade-in"><div className="auth-backdrop auth-backdrop-login" />
    <section className="auth-intro"><Link className="auth-brand" to="/"><PackageCheck size={23} strokeWidth={2.5} /> RentalHub</Link><div><p className="auth-eyebrow">YOUR RENTAL, ON YOUR TERMS</p><h1>Every rental<br /><em>within reach.</em></h1><p className="auth-intro-copy">A simpler way to find the gear you need, keep track of bookings, and get back to what matters.</p></div><div className="auth-note"><KeyRound size={18} /> Secure access for renters and rental partners.</div></section>
    <section className="auth-card-wrap"><div className="auth-card"><div className="auth-card-heading"><p className="auth-kicker">WELCOME BACK</p><h2>Sign in to RentalHub</h2><p>Use your account details to continue.</p></div>{error && <div className="auth-error">{error}</div>}<form onSubmit={handleSubmit} className="auth-form"><div className="auth-field"><label>Username or Email</label><input type="text" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter your username or email" required /></div><div className="auth-field"><label>Password</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required /></div><div className="auth-form-tools"><span>Keep your details private.</span><Link to="/forgot-password">Forgot password?</Link></div><button type="submit" disabled={submitting} className="auth-submit">{submitting ? 'Signing in...' : <>Sign in <ArrowRight size={17} /></>}</button></form><p className="auth-footer-copy">New to RentalHub? <Link to="/signup">Create a renter account</Link></p><p className="auth-secondary-link"><LockKeyhole size={14} /> Are you a vendor? <Link to="/vendor-signup">Register your business</Link></p></div></section>
  </div>;
};
