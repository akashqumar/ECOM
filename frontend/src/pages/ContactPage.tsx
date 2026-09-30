import React, { useState } from 'react';
import { Mail, Phone, Clock, MapPin, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AppContext';

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user ? user.email : '',
    topic: 'order_status',
    orderNumber: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 900);
  };

  return (
    <div className="contact-page">
      {/* Hero Header */}
      <div className="contact-hero">
        <div className="contact-hero-tag">Concierge & Client Care</div>
        <h1 className="contact-hero-title">Contact Us</h1>
        <p className="contact-hero-subtitle">
          Have a question about an order, styling recommendation, or bespoke request? Our atelier is here to help.
        </p>
      </div>

      <div className="contact-layout-grid">
        {/* Left Side: Contact Information Cards */}
        <div className="contact-info-col">
          <div className="info-card">
            <div className="info-icon-wrap">
              <Mail size={22} />
            </div>
            <div>
              <h4>Email Support</h4>
              <p>concierge@lume-commerce.com</p>
              <span className="info-sub">Average response time: &lt; 2 hours</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-wrap">
              <Phone size={22} />
            </div>
            <div>
              <h4>Direct Telephone</h4>
              <p>+1 (800) 555-0199</p>
              <span className="info-sub">Toll-free across North America</span>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-wrap">
              <Clock size={22} />
            </div>
            <div>
              <h4>Hours of Operation</h4>
              <p>Monday – Friday: 9am – 8pm EST</p>
              <p>Saturday – Sunday: 10am – 6pm EST</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon-wrap">
              <MapPin size={22} />
            </div>
            <div>
              <h4>Flagship Showroom</h4>
              <p>742 Evergreen Terrace</p>
              <p>Springfield, OR 97477</p>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="contact-form-card">
          {isSubmitted ? (
            <div className="contact-success-state">
              <div className="success-icon-wrap">
                <CheckCircle2 size={48} />
              </div>
              <h3>Message Sent Successfully</h3>
              <p>
                Thank you for reaching out, <strong>{formData.name}</strong>. A client specialist has received your inquiry and will respond to <strong>{formData.email}</strong> shortly.
              </p>
              <button 
                className="new-message-btn"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: user ? `${user.firstName} ${user.lastName}` : '',
                    email: user ? user.email : '',
                    topic: 'order_status',
                    orderNumber: '',
                    message: ''
                  });
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <h3 className="form-title">Send a Message</h3>
              <p className="form-subtitle">Fill out the form below and we'll reply directly to your email.</p>

              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email" 
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Inquiry Topic</label>
                  <select 
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="form-select"
                  >
                    <option value="order_status">Order Status & Tracking</option>
                    <option value="returns">Returns & Exchanges</option>
                    <option value="product_inquiry">Product Details & Sizing</option>
                    <option value="billing">Billing & Payment</option>
                    <option value="other">General Feedback</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Order Number (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ORD-9824"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Your Message *</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="How can our concierge assist you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <button 
                type="submit" 
                className="form-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .contact-page {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          box-sizing: border-box;
        }

        .contact-hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .contact-hero-tag {
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

        .contact-hero-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          margin: 0 0 14px;
        }

        .contact-hero-subtitle {
          font-size: 16px;
          color: var(--c-text-2);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .contact-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (min-width: 860px) {
          .contact-layout-grid {
            grid-template-columns: 360px 1fr;
            gap: 40px;
          }
        }

        .contact-info-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          border-radius: var(--r-xl);
          padding: 22px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .info-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--r-md);
          background: rgba(196, 151, 74, 0.12);
          color: var(--c-accent-2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .info-card h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .info-card p {
          margin: 0;
          font-size: 13px;
          color: var(--c-text-2);
          line-height: 1.5;
        }

        .info-sub {
          display: inline-block;
          margin-top: 4px;
          font-size: 11px;
          color: var(--c-text-3);
        }

        .contact-form-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-sm);
          border-radius: var(--r-xl);
          padding: 36px 32px;
        }

        .form-title {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .form-subtitle {
          margin: 0 0 28px;
          font-size: 14px;
          color: var(--c-text-2);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        @media (min-width: 600px) {
          .form-row {
            grid-template-columns: 1fr 1fr;
          }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 18px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-2);
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          border-radius: var(--r-md);
          border: 1px solid var(--c-border);
          background: var(--c-surface);
          color: var(--c-text-1);
          font-family: inherit;
          font-size: 14px;
          padding: 12px 14px;
          box-sizing: border-box;
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: var(--c-accent-2);
          box-shadow: 0 0 0 3px rgba(196, 151, 74, 0.2);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-submit-btn {
          width: 100%;
          height: 48px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity var(--transition), transform var(--transition);
        }

        .form-submit-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .contact-success-state {
          text-align: center;
          padding: 40px 20px;
        }

        .success-icon-wrap {
          color: var(--c-success);
          margin-bottom: 20px;
          display: inline-flex;
        }

        .contact-success-state h3 {
          margin: 0 0 10px;
          font-size: 22px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .contact-success-state p {
          margin: 0 0 28px;
          font-size: 14px;
          color: var(--c-text-2);
          line-height: 1.6;
          max-width: 440px;
          margin-left: auto;
          margin-right: auto;
        }

        .new-message-btn {
          padding: 12px 28px;
          border-radius: var(--r-full);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border);
          color: var(--c-text-1);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition);
        }

        .new-message-btn:hover {
          background: var(--c-surface);
        }
      `}</style>
    </div>
  );
}
