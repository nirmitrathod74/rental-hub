import React from 'react';
import { ShieldCheck, Scale, FileText } from 'lucide-react';

export const Terms = () => {
  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Terms & Conditions</h1>
          <p>Please read these terms carefully before using RentalHub.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <FileText size={24} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Agreement overview</h2>
        </div>

        <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '14px', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>1. Acceptance of Terms</h3>
            <p>
              By accessing and using RentalHub (the "Platform"), you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>2. Vendor Responsibilities</h3>
            <p>
              Vendors are responsible for maintaining accurate listings, ensuring the safety and operational status of all rental equipment, and processing returns and deposits in a timely manner according to our community guidelines.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>3. Renter Responsibilities</h3>
            <p>
              Renters must return equipment in the condition it was received, subject to reasonable wear and tear. Any late returns will incur late fees as specified in the product's rental agreement. Renters are liable for damages beyond normal wear and tear.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>4. Security Deposits & Payments</h3>
            <p>
              Security deposits are held securely and released within 24 hours of a satisfactory equipment return. Rental fees are charged upfront. All transactions are subject to our secure payment processing terms.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>5. Liability & Insurance</h3>
            <p>
              RentalHub acts as a marketplace facilitator. We are not liable for any injuries, damages, or losses incurred during the use of rented equipment. Users are strongly encouraged to maintain appropriate insurance policies.
            </p>
          </section>
        </div>

        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <Scale size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Legal Disclaimer</h4>
            <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', lineHeight: 1.5 }}>
              These terms are subject to change without notice. By continuing to use the platform after modifications, you agree to the updated terms. For specific legal inquiries, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
