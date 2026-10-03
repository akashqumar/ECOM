import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  Check, 
  ShoppingBag, 
  ShieldCheck, 
  CreditCard, 
  Copy, 
  Search, 
  ExternalLink,
  ChevronRight,
  Clock,
  Heart,
  Send,
  Zap
} from 'lucide-react';
import { useCart } from '../context/AppContext';
import { giftCardService, GiftCard } from '../services/giftCardService';
import { Link, useNavigate } from 'react-router-dom';

export default function GiftCardsPage() {
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'create' | 'balance' | 'vault' | 'faq'>('create');

  // Card Customization State
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [cardTheme, setCardTheme] = useState<'gold' | 'obsidian' | 'emerald' | 'rose'>('gold');

  // Purchase & Added States
  const [added, setAdded] = useState(false);
  const [instantPurchasedCard, setInstantPurchasedCard] = useState<GiftCard | null>(null);

  // Balance Check State
  const [checkCode, setCheckCode] = useState('');
  const [checkPin, setCheckPin] = useState('');
  const [checkResult, setCheckResult] = useState<GiftCard | null>(null);
  const [checkError, setCheckError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  // Saved / Vault Cards
  const [vaultCards, setVaultCards] = useState<GiftCard[]>(() => giftCardService.getUserCards());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  // Add to Shopping Bag
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount < 10) return;

    addItem({
      id: `gift-card-${finalAmount}-${Date.now()}`,
      name: `Lumé Digital Gift Card — $${finalAmount}`,
      price: finalAmount,
      images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80'],
      sku: `GC-${cardTheme.toUpperCase()}-${finalAmount}`
    }, 1);

    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  // Instant Demo Purchase (mints an active digital card immediately)
  const handleInstantBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (finalAmount < 10) return;

    const newCard = giftCardService.createCard({
      amount: finalAmount,
      recipientName: recipientName || 'Valued Recipient',
      recipientEmail: recipientEmail || 'friend@example.com',
      senderName: senderName || 'A Lumé Admirer',
      message: message || 'Wishing you effortless style and sophistication.',
      cardTheme
    });

    setVaultCards(giftCardService.getUserCards());
    setInstantPurchasedCard(newCard);
  };

  // Check Gift Card Balance
  const handleCheckBalance = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckError('');
    setCheckResult(null);
    setIsChecking(true);

    setTimeout(() => {
      const res = giftCardService.getCardByCode(checkCode, checkPin);
      if (res.card) {
        setCheckResult(res.card);
      } else {
        setCheckError(res.error || 'Card not found');
      }
      setIsChecking(false);
    }, 400);
  };

  // Copy helper
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="gift-page">
      {/* Hero Header */}
      <div className="gift-hero">
        <div className="gift-hero-tag">Official Lumé Feature</div>
        <h1 className="gift-hero-title">Lumé Digital Gift Card</h1>
        <p className="gift-hero-subtitle">
          Give the gift of timeless design and modern fashion. Delivered instantaneously via email with personalized greetings, valid across our entire catalog with no expiration date.
        </p>

        {/* Feature Highlights Row */}
        <div className="gift-highlights">
          <div className="highlight-pill">
            <Zap size={14} className="highlight-icon" />
            <span>Instant Digital Delivery</span>
          </div>
          <div className="highlight-pill">
            <Clock size={14} className="highlight-icon" />
            <span>Never Expires</span>
          </div>
          <div className="highlight-pill">
            <ShieldCheck size={14} className="highlight-icon" />
            <span>256-bit Encrypted Balance</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="gift-tab-bar">
        <button
          className={`gift-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <Gift size={16} />
          <span>Send Digital Card</span>
        </button>
        <button
          className={`gift-tab-btn ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          <Search size={16} />
          <span>Check Balance</span>
        </button>
        <button
          className={`gift-tab-btn ${activeTab === 'vault' ? 'active' : ''}`}
          onClick={() => {
            setVaultCards(giftCardService.getUserCards());
            setActiveTab('vault');
          }}
        >
          <CreditCard size={16} />
          <span>Gift Card Vault ({vaultCards.length})</span>
        </button>
        <button
          className={`gift-tab-btn ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          <Sparkles size={16} />
          <span>How It Works</span>
        </button>
      </div>

      {/* TAB 1: CREATE & CUSTOMIZE */}
      {activeTab === 'create' && (
        <div className="gift-content-layout">
          {/* Left: Interactive Aero Card Preview */}
          <div className="preview-container">
            <div className={`aero-gift-card theme-${cardTheme}`}>
              <div className="card-glare" />
              <div className="card-top-row">
                <div className="card-brand-pill">
                  <div className="brand-dot" />
                  <span>LUMÉ</span>
                </div>
                <div className="card-theme-chip">
                  {cardTheme.toUpperCase()} EDITION
                </div>
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
                  <div className="card-code-preview">LUME •••• •••• 2026</div>
                </div>
              </div>
            </div>

            {/* Theme Picker */}
            <div className="theme-picker-card">
              <span className="theme-label">Card Finish:</span>
              <div className="theme-options">
                {[
                  { id: 'gold', name: 'Signature Gold', bg: 'linear-gradient(135deg, #d4af37, #f3e5ab)' },
                  { id: 'obsidian', name: 'Obsidian Noir', bg: 'linear-gradient(135deg, #1e293b, #0f172a)' },
                  { id: 'emerald', name: 'Emerald Velvet', bg: 'linear-gradient(135deg, #064e3b, #10b981)' },
                  { id: 'rose', name: 'Rose Quartz', bg: 'linear-gradient(135deg, #9f1239, #fb7185)' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    title={t.name}
                    className={`theme-circle-btn ${cardTheme === t.id ? 'active' : ''}`}
                    style={{ background: t.bg }}
                    onClick={() => setCardTheme(t.id as any)}
                  />
                ))}
              </div>
            </div>

            <div className="card-guarantee-row">
              <div className="guar-item">
                <Sparkles size={16} />
                <span>Instant Digital Delivery</span>
              </div>
              <div className="guar-item">
                <ShieldCheck size={16} />
                <span>Redeemable at Checkout</span>
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

              {/* Action Buttons */}
              <div className="form-actions-grid">
                <button 
                  type="submit" 
                  className={`gift-add-btn ${added ? 'added' : ''}`}
                  disabled={finalAmount < 10}
                >
                  {added ? (
                    <>
                      <Check size={18} />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Bag — ${finalAmount}</span>
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={handleInstantBuy}
                  className="gift-instant-btn"
                  disabled={finalAmount < 10}
                  title="Generate and mint an active card code immediately for testing or instant gift"
                >
                  <Zap size={17} />
                  <span>Instant Buy / Mint Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CHECK BALANCE */}
      {activeTab === 'balance' && (
        <div className="balance-tab-layout">
          <div className="balance-checker-card">
            <h2 className="checker-title">Check Gift Card Balance</h2>
            <p className="checker-desc">
              Enter your 16-character Lumé gift certificate code and 4-digit security PIN to verify current balance and validity.
            </p>

            <form onSubmit={handleCheckBalance} className="checker-form">
              <div className="form-field">
                <label>Gift Card Code *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. LUME-2026-GOLD-100"
                  value={checkCode}
                  onChange={(e) => setCheckCode(e.target.value.toUpperCase())}
                  className="input-text monospace-input"
                />
              </div>

              <div className="form-field">
                <label>Security PIN (Optional for Demo Cards)</label>
                <input 
                  type="password" 
                  maxLength={6}
                  placeholder="4-digit PIN (e.g. 2026)"
                  value={checkPin}
                  onChange={(e) => setCheckPin(e.target.value)}
                  className="input-text monospace-input"
                />
              </div>

              {checkError && (
                <div className="checker-error-box">
                  {checkError}
                </div>
              )}

              <button 
                type="submit" 
                className="checker-submit-btn" 
                disabled={isChecking || !checkCode.trim()}
              >
                {isChecking ? 'Checking registry...' : 'Check Balance'}
              </button>
            </form>

            {/* Balance Result Display */}
            {checkResult && (
              <div className="balance-result-box fade-in">
                <div className="result-header">
                  <div className="result-badge">VALID & ACTIVE</div>
                  <div className="result-code">{checkResult.code}</div>
                </div>

                <div className="result-amount-display">
                  <div className="amount-label">AVAILABLE BALANCE</div>
                  <div className="amount-val">${checkResult.currentBalance.toFixed(2)}</div>
                  <div className="initial-val">Initial Value: ${checkResult.initialAmount.toFixed(2)}</div>
                </div>

                <div className="result-details-grid">
                  <div>
                    <span className="det-label">Recipient:</span>
                    <span className="det-value">{checkResult.recipientName}</span>
                  </div>
                  <div>
                    <span className="det-label">Sender:</span>
                    <span className="det-value">{checkResult.senderName}</span>
                  </div>
                  <div>
                    <span className="det-label">Expiration:</span>
                    <span className="det-value">None (Never Expires)</span>
                  </div>
                  <div>
                    <span className="det-label">Status:</span>
                    <span className="det-value status-active">{checkResult.status}</span>
                  </div>
                </div>

                <div className="result-action-row">
                  <button 
                    onClick={() => handleCopy(checkResult.code)}
                    className="result-copy-btn"
                  >
                    {copiedCode === checkResult.code ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedCode === checkResult.code ? 'Copied Code!' : 'Copy Code for Checkout'}</span>
                  </button>

                  <Link to="/checkout" className="result-shop-btn">
                    <span>Use at Checkout</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GIFT CARD VAULT */}
      {activeTab === 'vault' && (
        <div className="vault-tab-layout">
          <div className="vault-header-row">
            <div>
              <h2 className="vault-title">Lumé Digital Gift Card Vault</h2>
              <p className="vault-subtitle">
                Access your active certificates, ready demo cards, and recently generated digital vouchers. Click any code to copy directly to your clipboard for checkout.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('create')} 
              className="vault-create-new-btn"
            >
              <Gift size={16} />
              <span>Issue New Card</span>
            </button>
          </div>

          <div className="vault-cards-grid">
            {vaultCards.map(card => (
              <div key={card.id || card.code} className={`vault-card-tile theme-${card.cardTheme || 'gold'}`}>
                <div className="tile-top">
                  <div className="tile-brand">LUMÉ</div>
                  <div className={`tile-status ${card.currentBalance > 0 ? 'active' : 'depleted'}`}>
                    {card.currentBalance > 0 ? 'ACTIVE' : 'USED'}
                  </div>
                </div>

                <div className="tile-balance-row">
                  <div className="tile-balance">${card.currentBalance.toFixed(2)}</div>
                  <div className="tile-orig">Orig: ${card.initialAmount}</div>
                </div>

                <div className="tile-recipient">
                  <span>To: {card.recipientName}</span>
                </div>

                <div className="tile-code-box">
                  <span className="tile-code">{card.code}</span>
                  <button 
                    onClick={() => handleCopy(card.code)}
                    className="tile-copy-btn"
                    title="Copy code"
                  >
                    {copiedCode === card.code ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="tile-footer-actions">
                  <button 
                    onClick={() => {
                      setCheckCode(card.code);
                      setCheckPin(card.pin);
                      setActiveTab('balance');
                    }}
                    className="tile-inspect-btn"
                  >
                    Inspect Details
                  </button>

                  <Link to="/checkout" className="tile-redeem-btn">
                    Redeem
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HOW IT WORKS / FAQ */}
      {activeTab === 'faq' && (
        <div className="faq-tab-layout">
          <h2 className="faq-main-title">How Lumé Digital Gift Cards Work</h2>
          
          <div className="steps-cards-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3 className="step-title">Choose Design & Value</h3>
              <p className="step-desc">
                Select from our curated denominations ($25 to $500) or enter a custom amount. Personalize the look with our Obsidian, Gold, Emerald, or Rose quartz finishes.
              </p>
            </div>

            <div className="step-card">
              <div className="step-num">02</div>
              <h3 className="step-title">Add Personalized Note</h3>
              <p className="step-desc">
                Craft a personal message and provide the recipient's details. Digital certificates are issued with high-resolution visual previews.
              </p>
            </div>

            <div className="step-card">
              <div className="step-num">03</div>
              <h3 className="step-title">Instant Digital Delivery</h3>
              <p className="step-desc">
                Cards are generated instantaneously with a secure 16-character voucher code and 4-digit security PIN ready for immediate checkout.
              </p>
            </div>

            <div className="step-card">
              <div className="step-num">04</div>
              <h3 className="step-title">No Expiration Date</h3>
              <p className="step-desc">
                Lumé gift certificates never expire and carry zero maintenance fees. Any unused balance remains safely in your registry for future orders.
              </p>
            </div>
          </div>

          <div className="faq-qa-container">
            <h3 className="faq-sub-heading">Frequently Asked Questions</h3>
            <div className="qa-item">
              <div className="qa-q">Can I use multiple gift cards on a single order?</div>
              <div className="qa-a">Yes! You can apply a Lumé gift certificate at checkout and cover any remaining balance with Visa, MasterCard, or Apple Pay.</div>
            </div>
            <div className="qa-item">
              <div className="qa-q">Can I check how much balance remains on my card?</div>
              <div className="qa-a">Yes, simply head over to the "Check Balance" tab above or input your code at checkout to see your live balance instantly.</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Instant Purchase Success */}
      {instantPurchasedCard && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-top">
              <div className="modal-badge">
                <Sparkles size={16} />
                <span>GIFT CARD ISSUED</span>
              </div>
              <button 
                onClick={() => setInstantPurchasedCard(null)} 
                className="modal-close-btn"
              >
                ✕
              </button>
            </div>

            <h3 className="modal-title">Your Digital Gift Certificate is Active!</h3>
            <p className="modal-desc">
              A copy has been recorded in your registry and is ready to redeem immediately at checkout.
            </p>

            <div className={`modal-card-preview theme-${instantPurchasedCard.cardTheme}`}>
              <div className="card-top-row">
                <span style={{ fontWeight: 800, letterSpacing: '0.1em' }}>LUMÉ</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>${instantPurchasedCard.initialAmount}</span>
              </div>
              <div style={{ margin: '18px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                  {instantPurchasedCard.code}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                  PIN: {instantPurchasedCard.pin}
                </div>
              </div>
              <div className="card-bottom-row" style={{ fontSize: 12 }}>
                <span>To: {instantPurchasedCard.recipientName}</span>
                <span>From: {instantPurchasedCard.senderName}</span>
              </div>
            </div>

            <div className="modal-actions-row">
              <button 
                onClick={() => handleCopy(instantPurchasedCard.code)}
                className="modal-copy-btn"
              >
                {copiedCode === instantPurchasedCard.code ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedCode === instantPurchasedCard.code ? 'Copied Code!' : 'Copy Gift Card Code'}</span>
              </button>

              <button 
                onClick={() => {
                  setInstantPurchasedCard(null);
                  navigate('/checkout');
                }}
                className="modal-checkout-btn"
              >
                <span>Go to Checkout</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gift-page {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 32px 24px 96px;
          box-sizing: border-box;
        }

        .gift-hero {
          text-align: center;
          margin-bottom: 40px;
        }

        .gift-hero-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--c-accent-2);
          background: rgba(196, 151, 74, 0.12);
          padding: 6px 16px;
          border-radius: var(--r-full);
          margin-bottom: 16px;
          border: 1px solid rgba(196, 151, 74, 0.25);
        }

        .gift-hero-title {
          font-size: clamp(32px, 5vw, 46px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          margin: 0 0 14px;
        }

        .gift-hero-subtitle {
          font-size: 16px;
          color: var(--c-text-2);
          max-width: 660px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .gift-highlights {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .highlight-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--r-full);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-1);
          box-shadow: var(--shadow-xs);
        }

        .highlight-icon {
          color: var(--c-accent-2);
        }

        /* Tab Bar */
        .gift-tab-bar {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 40px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          padding: 6px;
          border-radius: var(--r-full);
          width: fit-content;
          margin-left: auto;
          margin-right: auto;
          flex-wrap: wrap;
        }

        .gift-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 22px;
          border-radius: var(--r-full);
          border: none;
          background: transparent;
          color: var(--c-text-2);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .gift-tab-btn:hover {
          color: var(--c-text-1);
        }

        .gift-tab-btn.active {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        }

        /* Layout Grid */
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
          top: 96px;
        }

        /* 3D Glass Aero Gift Card */
        .aero-gift-card {
          position: relative;
          aspect-ratio: 1.6 / 1;
          border-radius: var(--r-xl);
          padding: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          box-sizing: border-box;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.6);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .aero-gift-card.theme-gold {
          background: linear-gradient(135deg, rgba(230, 200, 140, 0.9) 0%, rgba(196, 151, 74, 0.8) 100%);
          color: #1A1915;
          border: 1px solid rgba(255, 255, 255, 0.6);
        }

        .aero-gift-card.theme-obsidian {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: #F8FAFC;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .aero-gift-card.theme-emerald {
          background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
          color: #ECFDF5;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .aero-gift-card.theme-rose {
          background: linear-gradient(135deg, #881337 0%, #e11d48 100%);
          color: #FFF1F2;
          border: 1px solid rgba(255, 255, 255, 0.25);
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
          font-weight: 800;
          letter-spacing: 0.12em;
          font-size: 15px;
        }

        .brand-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--c-accent-2);
          box-shadow: 0 0 10px rgba(196, 151, 74, 0.8);
        }

        .card-theme-chip {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          opacity: 0.85;
          border: 1px solid currentColor;
          padding: 3px 8px;
          border-radius: var(--r-full);
        }

        .card-center {
          text-align: center;
        }

        .card-denomination {
          font-size: clamp(38px, 6vw, 56px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 6px;
        }

        .card-type-label {
          font-size: 11px;
          letter-spacing: 0.16em;
          font-weight: 700;
          opacity: 0.8;
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
          opacity: 0.75;
          margin-bottom: 2px;
        }

        .card-recipient-name {
          font-size: 14px;
          font-weight: 600;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-code-preview {
          font-family: monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          opacity: 0.85;
        }

        /* Theme Picker */
        .theme-picker-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-lg);
          padding: 12px 18px;
          margin-top: 16px;
        }

        .theme-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-2);
        }

        .theme-options {
          display: flex;
          gap: 10px;
        }

        .theme-circle-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }

        .theme-circle-btn:hover {
          transform: scale(1.15);
        }

        .theme-circle-btn.active {
          border-color: var(--c-accent);
          transform: scale(1.15);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
        }

        .card-guarantee-row {
          display: flex;
          align-items: center;
          justify-content: space-around;
          margin-top: 16px;
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

        /* Right Form */
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

        .monospace-input {
          font-family: monospace;
          letter-spacing: 0.05em;
          font-size: 15px;
        }

        .form-actions-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 24px;
        }

        @media (min-width: 600px) {
          .form-actions-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .gift-add-btn {
          height: 50px;
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
          transition: all var(--transition);
        }

        .gift-add-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .gift-add-btn.added {
          background: var(--c-success);
        }

        .gift-instant-btn {
          height: 50px;
          border-radius: var(--r-full);
          background: rgba(196, 151, 74, 0.15);
          color: var(--c-accent-2);
          border: 1px solid rgba(196, 151, 74, 0.35);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all var(--transition);
        }

        .gift-instant-btn:hover {
          background: rgba(196, 151, 74, 0.25);
          transform: translateY(-1px);
        }

        /* Balance Tab */
        .balance-tab-layout {
          max-width: 620px;
          margin: 0 auto;
        }

        .balance-checker-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-xl);
          padding: 36px 32px;
          box-shadow: var(--shadow-sm);
        }

        .checker-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--c-text-1);
          margin: 0 0 8px;
        }

        .checker-desc {
          font-size: 14px;
          color: var(--c-text-2);
          margin: 0 0 24px;
          line-height: 1.5;
        }

        .checker-error-box {
          padding: 12px 16px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.3);
          border-radius: var(--r-md);
          color: #DC2626;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .checker-submit-btn {
          width: 100%;
          height: 48px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .checker-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .checker-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .balance-result-box {
          margin-top: 32px;
          padding: 24px;
          border-radius: var(--r-lg);
          background: var(--c-surface);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-xs);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .result-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #10B981;
          background: rgba(16, 185, 129, 0.12);
          padding: 4px 10px;
          border-radius: var(--r-full);
        }

        .result-code {
          font-family: monospace;
          font-weight: 700;
          font-size: 14px;
          color: var(--c-text-2);
        }

        .result-amount-display {
          text-align: center;
          padding: 20px 0;
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 20px;
        }

        .amount-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--c-text-3);
          margin-bottom: 4px;
        }

        .amount-val {
          font-size: 42px;
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
        }

        .initial-val {
          font-size: 13px;
          color: var(--c-text-3);
          margin-top: 4px;
        }

        .result-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          font-size: 13px;
          margin-bottom: 24px;
        }

        .det-label {
          color: var(--c-text-3);
          margin-right: 6px;
        }

        .det-value {
          font-weight: 600;
          color: var(--c-text-1);
        }

        .status-active {
          color: #10B981;
        }

        .result-action-row {
          display: flex;
          gap: 12px;
        }

        .result-copy-btn, .result-shop-btn {
          flex: 1;
          height: 44px;
          border-radius: var(--r-full);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .result-copy-btn {
          background: var(--c-surface-raised);
          border: 1px solid var(--glass-border);
          color: var(--c-text-1);
        }

        .result-shop-btn {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
        }

        /* Vault Tab */
        .vault-tab-layout {
          max-width: 1000px;
          margin: 0 auto;
        }

        .vault-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .vault-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--c-text-1);
          margin: 0 0 6px;
        }

        .vault-subtitle {
          font-size: 14px;
          color: var(--c-text-2);
          max-width: 600px;
          margin: 0;
          line-height: 1.5;
        }

        .vault-create-new-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .vault-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .vault-card-tile {
          border-radius: var(--r-xl);
          padding: 22px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 210px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--glass-border);
          box-sizing: border-box;
        }

        .vault-card-tile.theme-gold {
          background: linear-gradient(135deg, rgba(230, 200, 140, 0.25) 0%, rgba(196, 151, 74, 0.15) 100%);
        }

        .vault-card-tile.theme-obsidian {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.2) 100%);
        }

        .vault-card-tile.theme-emerald {
          background: linear-gradient(135deg, rgba(6, 78, 59, 0.2) 0%, rgba(4, 120, 87, 0.12) 100%);
        }

        .vault-card-tile.theme-rose {
          background: linear-gradient(135deg, rgba(136, 19, 55, 0.2) 0%, rgba(225, 29, 72, 0.12) 100%);
        }

        .tile-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tile-brand {
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.12em;
          color: var(--c-text-1);
        }

        .tile-status {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--r-full);
        }

        .tile-status.active {
          color: #10B981;
          background: rgba(16, 185, 129, 0.15);
        }

        .tile-status.depleted {
          color: var(--c-text-3);
          background: rgba(100, 116, 139, 0.15);
        }

        .tile-balance-row {
          margin: 14px 0 6px;
        }

        .tile-balance {
          font-size: 32px;
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .tile-orig {
          font-size: 12px;
          color: var(--c-text-3);
          margin-top: 4px;
        }

        .tile-recipient {
          font-size: 13px;
          color: var(--c-text-2);
          font-weight: 500;
          margin-bottom: 12px;
        }

        .tile-code-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--c-surface);
          border: 1px solid var(--glass-border);
          padding: 8px 12px;
          border-radius: var(--r-md);
          margin-bottom: 14px;
        }

        .tile-code {
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          color: var(--c-text-1);
          letter-spacing: 0.04em;
        }

        .tile-copy-btn {
          border: none;
          background: transparent;
          color: var(--c-text-2);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .tile-footer-actions {
          display: flex;
          gap: 8px;
        }

        .tile-inspect-btn, .tile-redeem-btn {
          flex: 1;
          height: 34px;
          border-radius: var(--r-full);
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition);
        }

        .tile-inspect-btn {
          background: var(--c-surface-raised);
          border: 1px solid var(--glass-border);
          color: var(--c-text-1);
        }

        .tile-redeem-btn {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
        }

        /* FAQ Tab */
        .faq-tab-layout {
          max-width: 900px;
          margin: 0 auto;
        }

        .faq-main-title {
          font-size: 28px;
          font-weight: 800;
          text-align: center;
          color: var(--c-text-1);
          margin-bottom: 36px;
        }

        .steps-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 48px;
        }

        .step-card {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-lg);
          padding: 24px;
        }

        .step-num {
          font-size: 28px;
          font-weight: 800;
          color: var(--c-accent-2);
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .step-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--c-text-1);
          margin: 0 0 8px;
        }

        .step-desc {
          font-size: 13px;
          color: var(--c-text-2);
          line-height: 1.5;
          margin: 0;
        }

        .faq-qa-container {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-xl);
          padding: 32px;
        }

        .faq-sub-heading {
          font-size: 18px;
          font-weight: 700;
          color: var(--c-text-1);
          margin: 0 0 20px;
        }

        .qa-item {
          padding-bottom: 16px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
        }

        .qa-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .qa-q {
          font-weight: 700;
          font-size: 15px;
          color: var(--c-text-1);
          margin-bottom: 6px;
        }

        .qa-a {
          font-size: 14px;
          color: var(--c-text-2);
          line-height: 1.5;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .modal-card {
          width: 100%;
          max-width: 480px;
          background: var(--c-surface);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-xl);
          padding: 32px;
          box-shadow: var(--shadow-lg);
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .modal-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--c-accent-2);
          background: rgba(196, 151, 74, 0.12);
          padding: 4px 12px;
          border-radius: var(--r-full);
        }

        .modal-close-btn {
          border: none;
          background: transparent;
          font-size: 18px;
          color: var(--c-text-3);
          cursor: pointer;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--c-text-1);
          margin: 0 0 6px;
        }

        .modal-desc {
          font-size: 13px;
          color: var(--c-text-2);
          margin: 0 0 20px;
        }

        .modal-card-preview {
          padding: 20px;
          border-radius: var(--r-lg);
          margin-bottom: 24px;
        }

        .modal-card-preview.theme-gold {
          background: linear-gradient(135deg, #d4af37, #f3e5ab);
          color: #1A1915;
        }

        .modal-card-preview.theme-obsidian {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: #F8FAFC;
        }

        .modal-card-preview.theme-emerald {
          background: linear-gradient(135deg, #064e3b, #10b981);
          color: #ECFDF5;
        }

        .modal-card-preview.theme-rose {
          background: linear-gradient(135deg, #9f1239, #fb7185);
          color: #FFF1F2;
        }

        .modal-actions-row {
          display: flex;
          gap: 12px;
        }

        .modal-copy-btn, .modal-checkout-btn {
          flex: 1;
          height: 46px;
          border-radius: var(--r-full);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .modal-copy-btn {
          background: var(--c-surface-raised);
          border: 1px solid var(--glass-border);
          color: var(--c-text-1);
        }

        .modal-checkout-btn {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
        }
      `}</style>
    </div>
  );
}
