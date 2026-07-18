import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, PackageCheck, ShieldCheck } from 'lucide-react';
import { validateEmail } from '../utils/validation.js';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const error = validateEmail(email);
    if (error) {
      setFieldErrors({ email: error });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmitted(true);
  };

  return <div className="auth-page auth-page-reset fade-in"><div className="auth-backdrop auth-backdrop-login" />
    <section className="auth-intro"><Link className="auth-brand" to="/"><PackageCheck size={23} strokeWidth={2.5} /> RentalHub</Link><div><p className="auth-eyebrow">ACCOUNT RECOVERY</p><h1>Get back to<br /><em>your bookings.</em></h1><p className="auth-intro-copy">It happens. Confirm your email address and we’ll help you get back into your account.</p></div><div className="auth-note"><ShieldCheck size={18} /> Your account details stay protected.</div></section>
    <section className="auth-card-wrap"><div className="auth-card">{submitted ? <div className="reset-success"><div className="reset-success-icon"><Mail size={26} /></div><p className="auth-kicker">CHECK YOUR INBOX</p><h2>Reset link requested</h2><p>If an account matches <strong>{email}</strong>, you’ll receive instructions to reset your password.</p><Link to="/login" className="auth-submit">Return to sign in <ArrowRight size={17} /></Link></div> : <><Link className="auth-back-link" to="/login"><ArrowLeft size={15} /> Back to sign in</Link><div className="auth-card-heading"><p className="auth-kicker">PASSWORD RESET</p><h2>Forgot your password?</h2><p>Enter the email address associated with your RentalHub account.</p></div><form onSubmit={handleSubmit} noValidate className="auth-form"><div className="auth-field"><label>Email address</label><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setFieldErrors({}); }} autoComplete="email" placeholder="you@example.com" autoFocus className={fieldErrors.email ? 'input-error' : ''} />{fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}</div><button type="submit" className="auth-submit">Send reset link <ArrowRight size={17} /></button></form><p className="auth-footer-copy">Remembered it? <Link to="/login">Sign in instead</Link></p></>}</div></section>
  </div>;
};
