import React from 'react';
import { Building2, Users, ShieldCheck, TrendingUp } from 'lucide-react';

export const About = () => {
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>About RentalHub</h1>
          <p>Redefining equipment access for businesses and individuals.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px' }}>Our Mission</h2>
          <p style={{ fontSize: '16px', color: 'hsl(var(--text-secondary))', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
            At RentalHub, we believe that access to high-quality equipment shouldn't be a barrier to getting things done. We've built a unified platform connecting trusted vendors with professionals who need reliable gear—whether it's heavy machinery, specialized electronics, or everyday tools.
          </p>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card" style={{ padding: '24px' }}>
            <div className="kpi-icon"><Building2 size={20} /></div>
            <div>
              <div className="kpi-label">Trusted Vendors</div>
              <div className="kpi-value">500+</div>
            </div>
          </div>
          <div className="kpi-card" style={{ padding: '24px' }}>
            <div className="kpi-icon"><TrendingUp size={20} /></div>
            <div>
              <div className="kpi-label">Successful Rentals</div>
              <div className="kpi-value">10k+</div>
            </div>
          </div>
          <div className="kpi-card" style={{ padding: '24px' }}>
            <div className="kpi-icon"><Users size={20} /></div>
            <div>
              <div className="kpi-label">Active Users</div>
              <div className="kpi-value">25k+</div>
            </div>
          </div>
          <div className="kpi-card" style={{ padding: '24px' }}>
            <div className="kpi-icon"><ShieldCheck size={20} /></div>
            <div>
              <div className="kpi-label">Secure Transactions</div>
              <div className="kpi-value">100%</div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '40px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>Why Choose RentalHub?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>For Renters</h4>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', lineHeight: 1.6 }}>
                Discover transparent pricing, clear availability, and instant booking capabilities. Stop calling around for quotes and start getting the tools you need delivered or ready for pickup instantly.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '8px' }}>For Vendors</h4>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', lineHeight: 1.6 }}>
                List your inventory on a digital storefront optimized for business. Manage your fleet, track rentals, and automate security deposits and late fees effortlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
