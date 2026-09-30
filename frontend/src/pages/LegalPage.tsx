import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, FileText, Lock, Eye, RefreshCw } from 'lucide-react';

interface LegalPageProps {
  type?: 'privacy' | 'terms';
}

export default function LegalPage({ type: propType }: LegalPageProps) {
  const location = useLocation();
  const currentType = propType || (location.pathname.includes('terms') ? 'terms' : 'privacy');
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(currentType);

  return (
    <div className="legal-page">
      {/* Hero Header */}
      <div className="legal-hero">
        <div className="legal-hero-tag">Compliance & Trust</div>
        <h1 className="legal-hero-title">
          {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        </h1>
        <p className="legal-hero-subtitle">
          Last updated: September 2026. We hold transparency, digital privacy, and ethical data governance to the highest standard.
        </p>

        {/* Tab Switcher */}
        <div className="legal-tabs">
          <button 
            className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <Lock size={15} />
            <span>Privacy Policy</span>
          </button>
          <button 
            className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            <FileText size={15} />
            <span>Terms of Service</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="legal-card">
        {activeTab === 'privacy' ? (
          <div className="legal-content">
            <section className="legal-section">
              <h2>1. Introduction & Scope</h2>
              <p>
                At Lumé, we consider customer trust paramount. This Privacy Policy delineates how we collect, safeguard, and ethically utilize your personal information when you access our platforms, browse our digital catalog, or purchase from our boutiques.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Information We Collect</h2>
              <p>We only collect information strictly required to deliver and fulfill your shopping experience:</p>
              <ul>
                <li><strong>Identity Information:</strong> Name, billing address, shipping address, and phone number for delivery fulfillment.</li>
                <li><strong>Contact Credentials:</strong> Email address for order status notifications, receipts, and optional concierge bulletins.</li>
                <li><strong>Payment Information:</strong> Transactions are tokenized through compliant PCI-DSS Level 1 payment processors. We never store raw credit card numbers or security CVVs.</li>
                <li><strong>Technical Telemetry:</strong> Device category, browser type, and anonymous session telemetry to optimize performance and prevent fraudulent activity.</li>
              </ul>
            </section>

            <section className="legal-section">
              <h2>3. How We Use Your Data</h2>
              <p>
                Your data is utilized exclusively for order fulfillment, customer support communications, fraud prevention, and platform refinement. <strong>We do not sell, rent, or trade your personal data to third-party data brokers under any circumstances.</strong>
              </p>
            </section>

            <section className="legal-section">
              <h2>4. Cookie Policy & Preferences</h2>
              <p>
                We employ necessary session cookies for shopping bag persistence, security authentication, and theme preferences. Analytics cookies are anonymized and can be opted out of at any time via your browser settings.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Your Rights (GDPR & CCPA Compliant)</h2>
              <p>
                You retain complete autonomy over your digital profile. At any time, you may request an export of all personal data held by Lumé or request permanent profile deletion by reaching out to our privacy officer at <strong>privacy@lume-commerce.com</strong>.
              </p>
            </section>
          </div>
        ) : (
          <div className="legal-content">
            <section className="legal-section">
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing or placing an order through Lumé, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
              </p>
            </section>

            <section className="legal-section">
              <h2>2. Product Representation & Pricing</h2>
              <p>
                We make every effort to display garment colors, textures, and silhouettes as accurately as possible. Prices are quoted in USD ($) and are subject to change without notice prior to checkout confirmation.
              </p>
            </section>

            <section className="legal-section">
              <h2>3. Order Acceptance & Fulfillment</h2>
              <p>
                Receipt of an electronic order confirmation does not signify our final acceptance of your order. Lumé reserves the right at any time after receipt of your order to accept or decline your order for reasonable grounds (e.g., unauthorized transactions, stock discrepancies).
              </p>
            </section>

            <section className="legal-section">
              <h2>4. Intellectual Property</h2>
              <p>
                All editorial imagery, brand insignia, typography, graphics, and interface styling are the exclusive intellectual property of Lumé and may not be reproduced without prior express written consent.
              </p>
            </section>

            <section className="legal-section">
              <h2>5. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, Lumé shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our digital catalog or delivered merchandise.
              </p>
            </section>
          </div>
        )}
      </div>

      <style>{`
        .legal-page {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          box-sizing: border-box;
        }

        .legal-hero {
          text-align: center;
          margin-bottom: 40px;
        }

        .legal-hero-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--c-accent-2);
          background: rgba(196, 151, 74, 0.12);
          padding: 6px 14px;
          border-radius: var(--r-full);
          margin-bottom: 16px;
        }

        .legal-hero-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          margin: 0 0 14px;
        }

        .legal-hero-subtitle {
          font-size: 15px;
          color: var(--c-text-2);
          max-width: 580px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .legal-tabs {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--c-surface-raised);
          padding: 4px;
          border-radius: var(--r-full);
          border: 1px solid var(--glass-border);
        }

        .legal-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 20px;
          border-radius: var(--r-full);
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-2);
          cursor: pointer;
          transition: all var(--transition);
        }

        .legal-tab-btn.active {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .legal-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-sm);
          border-radius: var(--r-xl);
          padding: 40px;
        }

        .legal-content {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .legal-section h2 {
          font-size: 18px;
          font-weight: 700;
          color: var(--c-text-1);
          margin: 0 0 12px;
        }

        .legal-section p {
          font-size: 15px;
          color: var(--c-text-2);
          line-height: 1.7;
          margin: 0 0 12px;
        }

        .legal-section ul {
          margin: 0 0 12px 20px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legal-section li {
          font-size: 14px;
          color: var(--c-text-2);
          line-height: 1.6;
        }

        .legal-section li strong {
          color: var(--c-text-1);
        }
      `}</style>
    </div>
  );
}
