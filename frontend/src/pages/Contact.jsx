import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquareText } from 'lucide-react';
import { validateEmail, validateRequired } from '../utils/validation.js';
import { api } from '../api/index.js';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    errors.name = validateRequired(form.name, 'Name');
    errors.email = validateEmail(form.email);
    errors.subject = validateRequired(form.subject, 'Subject');
    errors.message = validateRequired(form.message, 'Message');

    Object.keys(errors).forEach(key => !errors[key] && delete errors[key]);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError('');
    setSubmitting(true);
    try {
      await api.post('/accounts/contact/', form);
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message || 'Failed to send your message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Contact Us</h1>
          <p>We're here to help with any questions or support you need.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        
        {/* Contact Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Get in Touch</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3e9f0', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Email Support</h4>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>Our team responds within 24 hours.</p>
                  <a href="mailto:support@rentalhub.com" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>support@rentalhub.com</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3e9f0', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Phone Support</h4>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', marginBottom: '4px' }}>Mon-Fri from 9am to 6pm.</p>
                  <a href="tel:+18001234567" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>+1 (800) 123-4567</a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f3e9f0', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Headquarters</h4>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                    123 Innovation Drive<br />
                    Tech District, San Francisco<br />
                    CA 94105, United States
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareText size={20} style={{ color: 'var(--primary)' }} /> Send a Message
          </h2>
          <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '24px' }}>Fill out the form below and we'll get back to you shortly.</p>

          {submitted ? (
            <div style={{ backgroundColor: '#f8f9fa', padding: '40px 24px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dff3e4', color: '#176c30', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Send size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Message Sent!</h3>
              <p style={{ fontSize: '14px', color: 'hsl(var(--text-secondary))', marginBottom: '24px' }}>Thank you for reaching out. We will get back to you as soon as possible.</p>
              <button onClick={() => setSubmitted(false)} className="btn btn-secondary">Send another message</button>
            </div>
          ) : (
            <>
              {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Your Name</label>
                    <input name="name" value={form.name} onChange={update} className={`glass-input ${fieldErrors.name ? 'input-error' : ''}`} />
                    {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>Email Address</label>
                    <input type="email" name="email" value={form.email} onChange={update} className={`glass-input ${fieldErrors.email ? 'input-error' : ''}`} />
                    {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Subject</label>
                  <input name="subject" value={form.subject} onChange={update} className={`glass-input ${fieldErrors.subject ? 'input-error' : ''}`} />
                  {fieldErrors.subject && <span className="field-error">{fieldErrors.subject}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>Message</label>
                  <textarea 
                    name="message" 
                    value={form.message} 
                    onChange={update} 
                    className={`glass-input ${fieldErrors.message ? 'input-error' : ''}`} 
                    rows={5} 
                    style={{ resize: 'vertical' }}
                  />
                  {fieldErrors.message && <span className="field-error">{fieldErrors.message}</span>}
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '8px', padding: '12px' }}>
                  {submitting ? 'Sending Message...' : <>Submit Message <Send size={16} /></>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
