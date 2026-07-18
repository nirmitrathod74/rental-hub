import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, PackageCheck, ShieldCheck } from 'lucide-react';
import { validatePassword, validateRequired } from '../utils/validation.js';
import { api } from '../api/index.js';

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Extract URL search parameters (queries) e.g., ?uid=...&token=...
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const uid = searchParams.get('uid') || '';
  const token = searchParams.get('token') || '';

  const validateForm = () => {
    const errors = {};
    // Ensure password matches complexity rules (minimum length, etc.)
    errors.newPassword = validateRequired(newPassword, 'New Password') || validatePassword(newPassword);
    errors.confirmPassword = validateRequired(confirmPassword, 'Confirm Password');
    
    // Check if confirm password matches the new password
    if (!errors.confirmPassword && newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Remove empty error values from field validation dictionary
    Object.keys(errors).forEach(key => !errors[key] && delete errors[key]);
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return; // Stop if validation checks fail
    setError('');
    setSubmitting(true); // Toggle button disabled/loading state
    
    try {
      // POST the uid, token, and new password to the confirmation endpoint
      await api.post('/accounts/password-reset-confirm/', {
        uid,
        token,
        new_password: newPassword,
      });
      // Show local success message
      setSuccess(true);
      // Wait 2 seconds, then redirect to login page with reset=true query flag
      setTimeout(() => {
        navigate('/login?reset=true');
      }, 2000);
    } catch (err) {
      // Capture signature expiration or invalid token errors
      setError(err.message || 'The reset link is invalid or has expired. Please try requesting a new one.');
    } finally {
      setSubmitting(false); // Stop loading indicator
    }
  };

  return (
    <div className="auth-page auth-page-reset fade-in">
      <div className="auth-backdrop auth-backdrop-login" />
      
      <section className="auth-intro">
        <Link className="auth-brand" to="/">
          <PackageCheck size={23} strokeWidth={2.5} /> RentalHub
        </Link>
        <div>
          <p className="auth-eyebrow">CHOOSE NEW PASSWORD</p>
          <h1>Secure your<br /><em>account.</em></h1>
          <p className="auth-intro-copy">
            Create a strong, new password that you don't use on other websites to keep your rental account protected.
          </p>
        </div>
        <div className="auth-note">
          <ShieldCheck size={18} /> Credentials are encrypted and stored safely.
        </div>
      </section>
      
      <section className="auth-card-wrap">
        <div className="auth-card">
          {success ? (
            <div className="reset-success">
              <div className="reset-success-icon">
                <Lock size={26} />
              </div>
              <p className="auth-kicker">SUCCESS</p>
              <h2>Password Updated</h2>
              <p>Your password has been successfully reset. Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <Link className="auth-back-link" to="/login">
                <ArrowLeft size={15} /> Cancel and sign in
              </Link>
              
              <div className="auth-card-heading">
                <p className="auth-kicker">PASSWORD RECOVERY</p>
                <h2>Reset your password</h2>
                <p>Please enter your new password below.</p>
              </div>
              
              {error && <div className="auth-error">{error}</div>}
              
              <form onSubmit={handleSubmit} noValidate className="auth-form">
                <div className="auth-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setFieldErrors({ ...fieldErrors, newPassword: '' });
                    }}
                    placeholder="Enter new password"
                    autoFocus
                    className={fieldErrors.newPassword ? 'input-error' : ''}
                  />
                  {fieldErrors.newPassword && (
                    <span className="field-error">{fieldErrors.newPassword}</span>
                  )}
                </div>
                
                <div className="auth-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    placeholder="Confirm new password"
                    className={fieldErrors.confirmPassword ? 'input-error' : ''}
                  />
                  {fieldErrors.confirmPassword && (
                    <span className="field-error">{fieldErrors.confirmPassword}</span>
                  )}
                </div>
                
                <button type="submit" disabled={submitting} className="auth-submit">
                  {submitting ? 'Resetting password...' : (
                    <>
                      Update password <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
