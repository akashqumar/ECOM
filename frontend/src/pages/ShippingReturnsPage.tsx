import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Clock, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ShippingReturnsPage() {
  return (
    <div className="shipping-page">
      {/* Hero Header */}
      <div className="shipping-hero">
        <div className="shipping-hero-tag">Care & Delivery</div>
        <h1 className="shipping-hero-title">Shipping & Returns</h1>
        <p className="shipping-hero-subtitle">
          Effortless delivery worldwide, complimentary shipping over $75, and 30-day hassle-free returns.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="shipping-perks-grid">
        <div className="perk-card">
          <div className="perk-icon-wrap">
            <Truck size={24} />
          </div>
          <h3>Free Standard Shipping</h3>
          <p>Complimentary delivery on all domestic orders exceeding $75. Dispatched within 24 hours.</p>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap">
            <RotateCcw size={24} />
          </div>
          <h3>30-Day Effortless Returns</h3>
          <p>Unworn, tagged items can be returned within 30 days of arrival with pre-paid return labels.</p>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap">
            <Clock size={24} />
          </div>
          <h3>Rapid Refund Turnaround</h3>
          <p>Refunds are initiated immediately upon inspection at our fulfillment facility.</p>
        </div>

        <div className="perk-card">
          <div className="perk-icon-wrap">
            <ShieldCheck size={24} />
          </div>
          <h3>Insured Transit</h3>
          <p>Every shipment is fully insured and tracked from our atelier straight to your doorstep.</p>
        </div>
      </div>

      {/* Shipping Options Table */}
      <div className="shipping-section-card">
        <h2 className="section-title">Shipping Methods & Delivery Times</h2>
        <div className="table-responsive">
          <table className="shipping-table">
            <thead>
              <tr>
                <th>Service Level</th>
                <th>Estimated Transit</th>
                <th>Cost</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Standard Ground</strong></td>
                <td>3–5 Business Days</td>
                <td><span className="price-tag free">FREE over $75</span> <span className="price-sub">($8 under)</span></td>
                <td>Dispatched with USPS / FedEx Ground with signature tracking.</td>
              </tr>
              <tr>
                <td><strong>Expedited Air</strong></td>
                <td>2 Business Days</td>
                <td>$15.00</td>
                <td>Orders placed before 2 PM EST ship same-day via FedEx 2-Day.</td>
              </tr>
              <tr>
                <td><strong>Priority Overnight</strong></td>
                <td>Next Business Day</td>
                <td>$25.00</td>
                <td>Guaranteed morning delivery next business day.</td>
              </tr>
              <tr>
                <td><strong>Global Express</strong></td>
                <td>4–8 Business Days</td>
                <td>Calculated at Checkout</td>
                <td>Available to 65+ countries with prepaid duties and taxes.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4-Step Returns Guide */}
      <div className="shipping-section-card">
        <h2 className="section-title">How to Initiate a Return</h2>
        <p className="section-subtext">Returning an item is seamless and takes less than two minutes online.</p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <h4>Request Return</h4>
            <p>Go to your Orders page, find your order, and tap "Request Return" to generate your label.</p>
          </div>

          <div className="step-card">
            <div className="step-num">02</div>
            <h4>Pack Your Item</h4>
            <p>Place item in original packaging with original tags attached and secure the box.</p>
          </div>

          <div className="step-card">
            <div className="step-num">03</div>
            <h4>Drop Off</h4>
            <p>Affix the pre-paid shipping label and drop it off at any authorized USPS or FedEx drop point.</p>
          </div>

          <div className="step-card">
            <div className="step-num">04</div>
            <h4>Instant Refund</h4>
            <p>Once inspected, your refund is credited directly to your original payment method.</p>
          </div>
        </div>
      </div>

      {/* Questions CTA */}
      <div className="shipping-bottom-cta">
        <div>
          <h3>Have questions about an existing shipment?</h3>
          <p>Our dedicated support team is ready to track or adjust your delivery.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/orders" className="cta-secondary-btn">View My Orders</Link>
          <Link to="/contact" className="cta-primary-btn">Contact Support</Link>
        </div>
      </div>

      <style>{`
        .shipping-page {
          width: 100%;
          max-width: 1080px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          box-sizing: border-box;
        }

        .shipping-hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .shipping-hero-tag {
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

        .shipping-hero-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          margin: 0 0 14px;
        }

        .shipping-hero-subtitle {
          font-size: 16px;
          color: var(--c-text-2);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .shipping-perks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .perk-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          border-radius: var(--r-xl);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .perk-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--r-md);
          background: rgba(196, 151, 74, 0.12);
          color: var(--c-accent-2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .perk-card h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .perk-card p {
          margin: 0;
          font-size: 13px;
          color: var(--c-text-2);
          line-height: 1.6;
        }

        .shipping-section-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-sm);
          border-radius: var(--r-xl);
          padding: 36px 32px;
          margin-bottom: 32px;
        }

        .section-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--c-text-1);
          margin: 0 0 8px;
        }

        .section-subtext {
          font-size: 14px;
          color: var(--c-text-2);
          margin: 0 0 28px;
        }

        .table-responsive {
          overflow-x: auto;
        }

        .shipping-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          text-align: left;
        }

        .shipping-table th {
          padding: 14px 16px;
          background: var(--c-surface-raised);
          color: var(--c-text-1);
          font-weight: 600;
          border-bottom: 1px solid var(--glass-border);
        }

        .shipping-table th:first-child {
          border-top-left-radius: var(--r-md);
        }

        .shipping-table th:last-child {
          border-top-right-radius: var(--r-md);
        }

        .shipping-table td {
          padding: 16px;
          border-bottom: 1px solid var(--c-border-subtle);
          color: var(--c-text-2);
        }

        .price-tag.free {
          font-weight: 700;
          color: var(--c-success);
        }

        .price-sub {
          font-size: 12px;
          color: var(--c-text-3);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .step-card {
          padding: 20px;
          border-radius: var(--r-lg);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border-subtle);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .step-num {
          font-size: 20px;
          font-weight: 800;
          color: var(--c-accent-2);
          opacity: 0.8;
        }

        .step-card h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .step-card p {
          margin: 0;
          font-size: 13px;
          color: var(--c-text-2);
          line-height: 1.5;
        }

        .shipping-bottom-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px;
          border-radius: var(--r-xl);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          gap: 24px;
          flex-wrap: wrap;
        }

        .shipping-bottom-cta h3 {
          margin: 0 0 6px;
          font-size: 18px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .shipping-bottom-cta p {
          margin: 0;
          font-size: 14px;
          color: var(--c-text-2);
        }

        .cta-primary-btn {
          padding: 12px 24px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .cta-secondary-btn {
          padding: 12px 24px;
          border-radius: var(--r-full);
          background: transparent;
          border: 1px solid var(--c-border);
          color: var(--c-text-1);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
