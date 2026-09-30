import React, { useState } from 'react';
import { Gift, CreditCard, Sparkles, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/AppContext';

export default function GiftCardsPage() {
  const { addItem } = useCart();
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [added, setAdded] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount < 10) return;

    addItem({
      id: `gift-card-${finalAmount}-${Date.now()}`,
      name: `Lumé Digital Gift Card — $${finalAmount}`,
      price: finalAmount,
      images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80'],
      sku: `GC-${finalAmount}`
    }, 1);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="gift-page">
      {/* Hero Header */}
      <div className="gift-hero">
        <div className="gift-hero-tag">The Art of Giving</div>
        <h1 className="gift-hero-title">Lumé Digital Gift Card</h1>
        <p className="gift-hero-subtitle">
          Delivered instantaneously via email with personalized greetings, redeemable on our entire catalog with no expiration dates.
        </p>
      </div>

      <div className="gift-content-layout">
        {/* Left: Interactive Card Preview */}
        <div className="preview-container">
          <div className="aero-gift-card">
            <div className="card-glare" />
            <div className="card-top-row">
              <div className="card-brand-pill">
                <div className="brand-dot" />
                <span>LUMÉ</span>
              </div>
              <Gift size={22} className="card-gift-icon" />
            </div>

            <div className="card-center">
              <div className="card-denomination">${finalAmount || 0}</div>
              <div className="card-type-label">DIGITAL GIFT CERTIFICATE</div>
            </div>

            <div className="card-bottom-row">
              <div>
                <div className="card-sub-label">FOR</div>
                <div className="card-recipient-name">{recipientName || 'Valued Recipient'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="card-sub-label">NO EXPIRATION</div>
                <div className="card-code-preview">•••• •••• •••• 2026</div>
              </div>
            </div>
          </div>

          <div className="card-guarantee-row">
            <div className="guar-item">
              <Sparkles size={16} />
              <span>Instant Digital Delivery</span>
            </div>
            <div className="guar-item">
              <ShieldCheck size={16} />
              <span>Never Expires</span>
            </div>
          </div>
        </div>

        {/* Right: Customization Form */}
        <div className="form-container">
          <form onSubmit={handleAddToCart} className="gift-form">
            <h3 className="form-heading">1. Select Card Value</h3>
            <div className="denominations-row">
              {[25, 50, 100, 250, 500].map(val => (
                <button
                  type="button"
                  key={val}
                  className={`denom-btn ${!customAmount && amount === val ? 'active' : ''}`}
                  onClick={() => {
                    setAmount(val);
                    setCustomAmount('');
                  }}
                >
                  ${val}
                </button>
              ))}
            </div>

            <div className="custom-input-wrap">
              <span className="dollar-prefix">$</span>
              <input 
                type="number"
                min="10"
                max="2000"
                placeholder="Or enter custom amount ($10 – $2,000)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="custom-amount-input"
              />
            </div>

            <h3 className="form-heading" style={{ marginTop: '28px' }}>2. Recipient Details</h3>
            <div className="form-field">
              <label>Recipient's Full Name *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Alex Morgan"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="input-text"
              />
            </div>

            <div className="form-field">
              <label>Recipient's Email Address *</label>
              <input 
                type="email" 
                required
                placeholder="alex@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="input-text"
              />
            </div>

            <div className="form-field">
              <label>Your Name *</label>
              <input 
                type="text" 
                required
                placeholder="Your name or nickname"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="input-text"
              />
            </div>

            <div className="form-field">
              <label>Personal Note (Optional)</label>
              <textarea 
                rows={3}
                placeholder="Add a heartfelt note to be presented with the certificate..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-textarea"
              />
            </div>

            <button 
              type="submit" 
              className={`gift-add-btn ${added ? 'added' : ''}`}
              disabled={finalAmount < 10}
            >
              {added ? (
                <>
                  <Check size={18} />
                  <span>Added Gift Card to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Add Gift Card to Bag — ${finalAmount}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .gift-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          box-sizing: border-box;
        }

        .gift-hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .gift-hero-tag {
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

        .gift-hero-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          margin: 0 0 14px;
        }

        .gift-hero-subtitle {
          font-size: 16px;
          color: var(--c-text-2);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .gift-content-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (min-width: 900px) {
          .gift-content-layout {
            grid-template-columns: 460px 1fr;
          }
        }

        .preview-container {
          position: sticky;
          top: 100px;
        }

        .aero-gift-card {
          position: relative;
          aspect-ratio: 1.6 / 1;
          border-radius: var(--r-xl);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(240, 235, 225, 0.6) 100%);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.8);
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          box-sizing: border-box;
        }

        [data-theme='dark'] .aero-gift-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15);
        }

        .card-glare {
          position: absolute;
          top: 0;
          left: -80%;
          width: 200%;
          height: 100%;
          background: linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.4) 45%, transparent 60%);
          pointer-events: none;
        }

        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          letter-spacing: 0.1em;
          font-size: 14px;
          color: var(--c-text-1);
        }

        .brand-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--c-accent-2);
        }

        .card-gift-icon {
          color: var(--c-accent-2);
        }

        .card-center {
          text-align: center;
        }

        .card-denomination {
          font-size: clamp(38px, 6vw, 54px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 6px;
        }

        .card-type-label {
          font-size: 11px;
          letter-spacing: 0.14em;
          font-weight: 700;
          color: var(--c-text-3);
        }

        .card-bottom-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .card-sub-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--c-text-3);
          margin-bottom: 2px;
        }

        .card-recipient-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--c-text-1);
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-code-preview {
          font-family: monospace;
          font-size: 12px;
          color: var(--c-text-2);
          letter-spacing: 0.05em;
        }

        .card-guarantee-row {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin-top: 20px;
          padding: 14px 20px;
          border-radius: var(--r-lg);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
        }

        .guar-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-2);
        }

        .form-container {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-sm);
          border-radius: var(--r-xl);
          padding: 36px 32px;
        }

        .form-heading {
          font-size: 16px;
          font-weight: 700;
          color: var(--c-text-1);
          margin: 0 0 16px;
        }

        .denominations-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .denom-btn {
          flex: 1;
          min-width: 68px;
          padding: 12px 14px;
          border-radius: var(--r-md);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border);
          color: var(--c-text-1);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition);
        }

        .denom-btn:hover {
          border-color: var(--c-accent-2);
        }

        .denom-btn.active {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border-color: var(--c-accent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .custom-input-wrap {
          position: relative;
        }

        .dollar-prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text-3);
        }

        .custom-amount-input {
          width: 100%;
          padding: 12px 14px 12px 30px;
          border-radius: var(--r-md);
          border: 1px solid var(--c-border);
          background: var(--c-surface);
          color: var(--c-text-1);
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }

        .custom-amount-input:focus {
          border-color: var(--c-accent-2);
          box-shadow: 0 0 0 3px rgba(196, 151, 74, 0.2);
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }

        .form-field label {
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-2);
        }

        .input-text, .input-textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--r-md);
          border: 1px solid var(--c-border);
          background: var(--c-surface);
          color: var(--c-text-1);
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
          font-family: inherit;
        }

        .input-text:focus, .input-textarea:focus {
          border-color: var(--c-accent-2);
          box-shadow: 0 0 0 3px rgba(196, 151, 74, 0.2);
        }

        .gift-add-btn {
          width: 100%;
          height: 50px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 24px;
          transition: all var(--transition);
        }

        .gift-add-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .gift-add-btn.added {
          background: var(--c-success);
        }
      `}</style>
    </div>
  );
}
