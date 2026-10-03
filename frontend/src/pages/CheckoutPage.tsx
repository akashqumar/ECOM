import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useCart, useToast } from '../context/AppContext';
import { orderApi } from '../services/api';
import { giftCardService, GiftCard } from '../services/giftCardService';
import { CheckCircle2, AlertCircle, Gift, Sparkles, Check, X } from 'lucide-react';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, itemCount, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState('742 Evergreen Terrace, Springfield, OR 97477');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Lumé Digital Gift Card state
  const [giftCardInput, setGiftCardInput] = useState('');
  const [giftCardPin, setGiftCardPin] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<GiftCard | null>(null);
  const [giftCardError, setGiftCardError] = useState('');
  const [applyingGiftCard, setApplyingGiftCard] = useState(false);

  if (!user) {
    return (
      <div style={styles.messageContainer}>
        <h2 style={styles.messageTitle}>Please sign in to checkout</h2>
        <Link to="/login" style={styles.primaryBtn}>Sign In</Link>
      </div>
    );
  }

  if (itemCount === 0 && !success) {
    return (
      <div style={styles.messageContainer}>
        <h2 style={styles.messageTitle}>Your bag is empty</h2>
        <Link to="/cart" style={styles.primaryBtn}>Return to Bag</Link>
      </div>
    );
  }

  const tax = subtotal * 0.08;
  const grossTotal = subtotal + tax;
  const giftCardDiscount = appliedGiftCard 
    ? Math.min(appliedGiftCard.currentBalance, grossTotal)
    : 0;
  const total = Math.max(0, grossTotal - giftCardDiscount);

  const handleApplyGiftCard = (codeOverride?: string) => {
    const code = (codeOverride || giftCardInput).trim();
    if (!code) return;
    setGiftCardError('');
    setApplyingGiftCard(true);

    setTimeout(() => {
      const res = giftCardService.getCardByCode(code, giftCardPin);
      if (res.card) {
        if (res.card.currentBalance <= 0) {
          setGiftCardError('This gift card has a $0.00 balance.');
        } else {
          setAppliedGiftCard(res.card);
          setGiftCardInput('');
          setGiftCardPin('');
        }
      } else {
        setGiftCardError(res.error || 'Gift card not found.');
      }
      setApplyingGiftCard(false);
    }, 250);
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const idempotencyKey = crypto.randomUUID();
      const items = (cart?.items ?? []).map(item => ({
        productId: item.productId,
        productName: item.name,
        sku: item.sku,
        unitPrice: item.price,
        quantity: item.quantity
      }));

      const response = await orderApi.checkout({
        idempotencyKey,
        shippingAddress: address,
        items
      });

      // If a gift card was applied, deduct the amount from its balance
      if (appliedGiftCard && giftCardDiscount > 0) {
        giftCardService.redeemCard(appliedGiftCard.code, giftCardDiscount);
      }

      const finalId = response.data?.id || response.data?.orderNumber || 'ORD-' + Date.now();
      setPlacedOrderId(finalId);
      setSuccess(true);
      clearCart();
      showToast('Your order has been confirmed and submitted to dispatch.', 'success', 'Order Confirmed');
    } catch (err: any) {
      const errMsg = err.message || 'Checkout failed. Please try again.';
      setError(errMsg);
      showToast(errMsg, 'error', 'Checkout Error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successContent}>
          <CheckCircle2 size={72} color="var(--c-success)" style={styles.successIcon} />
          <h1 style={styles.successTitle}>Order Placed!</h1>
          <p style={styles.orderNumber}>Order #{placedOrderId.slice(0, 8).toUpperCase()}</p>
          <p style={styles.successDesc}>Your order is confirmed and will ship soon. We've sent a confirmation email to {email}.</p>
          <div style={styles.successActions}>
            <Link to="/orders" style={styles.primaryBtn}>Track My Order</Link>
            <Link to="/products" style={styles.secondaryBtn}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={styles.container}>
      <div className="checkout-layout" style={styles.layout}>
        
        {/* Left Form Panel */}
        <div className="checkout-form" style={styles.formPanel}>
          <h1 style={styles.pageTitle}>Checkout</h1>
          
          {error && (
            <div style={styles.errorBanner}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Contact</h2>
              <div style={styles.inputGroup}>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  style={styles.input}
                />
              </div>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Shipping Address</h2>
              <div style={styles.inputGroup}>
                <textarea 
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Full address"
                  required
                  rows={3}
                  style={styles.textarea}
                />
              </div>
            </section>

            {/* Lumé Digital Gift Card Section */}
            <section style={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={styles.sectionTitle}>Lumé Digital Gift Card</h2>
                <Link to="/gift-cards" style={{ fontSize: '13px', color: 'var(--c-accent-2)', textDecoration: 'none', fontWeight: 600 }}>
                  Buy Gift Card &rarr;
                </Link>
              </div>

              {appliedGiftCard ? (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#10B981',
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--c-text-1)', fontFamily: 'monospace' }}>
                        {appliedGiftCard.code}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--c-text-2)', marginTop: '2px' }}>
                        Card Balance: ${appliedGiftCard.currentBalance.toFixed(2)} &bull; Applied: -${giftCardDiscount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveGiftCard}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--c-text-3)',
                      cursor: 'pointer',
                      padding: '6px',
                      borderRadius: '4px'
                    }}
                    title="Remove Gift Card"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '20px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--c-surface-raised)',
                  border: '1px solid var(--c-border)'
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Enter Gift Card Code (e.g. LUME-2026-GOLD-100)"
                      value={giftCardInput}
                      onChange={e => setGiftCardInput(e.target.value.toUpperCase())}
                      style={{ ...styles.input, flex: 1, fontFamily: 'monospace', textTransform: 'uppercase' }}
                    />
                    <button
                      type="button"
                      disabled={applyingGiftCard || !giftCardInput.trim()}
                      onClick={() => handleApplyGiftCard()}
                      style={{
                        padding: '0 20px',
                        background: 'var(--c-accent)',
                        color: 'var(--c-accent-fg)',
                        border: 'none',
                        borderRadius: 'var(--r-md)',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        opacity: !giftCardInput.trim() ? 0.6 : 1
                      }}
                    >
                      {applyingGiftCard ? 'Verifying...' : 'Apply'}
                    </button>
                  </div>

                  {giftCardError && (
                    <div style={{ fontSize: '12px', color: '#DC2626', marginBottom: '10px' }}>
                      {giftCardError}
                    </div>
                  )}

                  {/* Quick Test Demo Codes */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--c-text-3)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Quick Test Demo Codes:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {[
                        { code: 'LUME-2026-GOLD-100', val: '$100' },
                        { code: 'LUME-FASHION-50', val: '$50' },
                        { code: 'LUME-VIP-250', val: '$250' }
                      ].map(dc => (
                        <button
                          key={dc.code}
                          type="button"
                          onClick={() => handleApplyGiftCard(dc.code)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--r-full)',
                            background: 'var(--c-surface)',
                            border: '1px solid var(--c-border)',
                            color: 'var(--c-text-2)',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            cursor: 'pointer'
                          }}
                        >
                          {dc.code} ({dc.val})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Payment</h2>
              {total === 0 ? (
                <div style={{
                  padding: '20px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--c-text-1)'
                }}>
                  <CheckCircle2 size={24} color="#10B981" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>Order Fully Covered by Gift Card</div>
                    <div style={{ fontSize: '13px', color: 'var(--c-text-2)', marginTop: '2px' }}>
                      No credit card charge is required for this transaction.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.mockCard}>
                    <div style={styles.mockCardTop}>
                      <span style={styles.mockCardType}>Visa</span>
                      <span style={styles.mockCardDots}>•••• 4242</span>
                    </div>
                    <div style={styles.mockCardBottom}>
                      <span>Lumé Customer</span>
                      <span>12/26</span>
                    </div>
                  </div>
                  <p style={styles.paymentDisclaimer}>
                    {giftCardDiscount > 0 ? `Remaining $${total.toFixed(2)} will be charged to simulated card.` : 'Payment is simulated. No real charges.'}
                  </p>
                </>
              )}
            </section>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Processing...' : total === 0 ? 'Place Order (Covered by Gift Card)' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Right Summary Panel */}
        <div className="checkout-summary" style={styles.summaryPanel}>
          <div style={styles.summaryCard}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            
            <div style={styles.summaryItems}>
              {(cart?.items ?? []).map(item => (
                <div key={item.productId} style={styles.summaryItem}>
                  <div style={styles.summaryItemImageContainer}>
                     {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} style={styles.summaryItemImage} />
                      ) : (
                        <div style={styles.summaryItemImagePlaceholder} />
                      )}
                    <span style={styles.summaryItemQty}>{item.quantity}</span>
                  </div>
                  <div style={styles.summaryItemDetails}>
                    <p style={styles.summaryItemName}>{item.name}</p>
                    <p style={styles.summaryItemPrice}>${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.separator} />

            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Subtotal</span>
              <span style={styles.summaryValue}>${subtotal.toFixed(2)}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Shipping</span>
              <span style={styles.summaryValue}>Free</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Tax</span>
              <span style={styles.summaryValue}>${tax.toFixed(2)}</span>
            </div>

            {giftCardDiscount > 0 && (
              <div style={styles.summaryRow}>
                <span style={{ ...styles.summaryLabel, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Gift size={14} />
                  Lumé Gift Card
                </span>
                <span style={{ ...styles.summaryValue, color: '#10B981', fontWeight: 700 }}>
                  -${giftCardDiscount.toFixed(2)}
                </span>
              </div>
            )}

            <div style={styles.separator} />

            <div style={styles.totalRow}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .checkout-page {
          animation: fadeUp var(--transition);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 900px) {
          .checkout-layout {
            display: flex !important;
            flex-direction: column-reverse !important;
            gap: 32px !important;
          }
          .checkout-form, .checkout-summary {
            width: 100% !important;
            max-width: 100% !important;
            flex: none !important;
          }
          .checkout-summary {
            position: static !important;
            margin-bottom: 0 !important;
          }
        }
      `}} />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
    minHeight: '80vh',
  },
  layout: {
    display: 'flex',
    gap: '64px',
    alignItems: 'flex-start',
    className: 'checkout-layout',
  },
  formPanel: {
    flex: '1 1 55%',
    className: 'checkout-form',
  },
  summaryPanel: {
    flex: '1 1 45%',
    position: 'sticky' as const,
    top: '24px',
    className: 'checkout-summary',
  },
  pageTitle: {
    fontSize: 'clamp(28px, 4vw, 36px)',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 32px 0',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--c-border-subtle)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  inputGroup: {
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--c-bg)',
    border: '1px solid var(--c-border)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--c-text-1)',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color var(--transition)',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    background: 'var(--c-bg)',
    border: '1px solid var(--c-border)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--c-text-1)',
    fontSize: '15px',
    outline: 'none',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  mockCard: {
    background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
    borderRadius: '12px',
    padding: '24px',
    color: '#fff',
    boxShadow: 'var(--shadow-md)',
    marginBottom: '12px',
  },
  mockCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    fontSize: '18px',
    fontWeight: 600,
    letterSpacing: '2px',
  },
  mockCardType: {
    fontStyle: 'italic',
  },
  mockCardDots: {
    fontFamily: 'monospace',
  },
  mockCardBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    opacity: 0.8,
  },
  paymentDisclaimer: {
    fontSize: '13px',
    color: 'var(--c-text-3)',
    textAlign: 'center' as const,
    margin: 0,
  },
  submitBtn: {
    width: '100%',
    padding: '18px',
    background: 'var(--c-accent)',
    color: 'var(--c-accent-fg)',
    border: 'none',
    borderRadius: 'var(--r-sm)',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity var(--transition)',
    marginTop: '24px',
  },
  summaryCard: {
    background: 'var(--c-surface-raised)',
    borderRadius: 'var(--r-lg)',
    padding: '32px',
    border: '1px solid var(--c-border-subtle)',
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 24px 0',
  },
  summaryItems: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
    paddingRight: '8px',
  },
  summaryItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  summaryItemImageContainer: {
    position: 'relative' as const,
    width: '64px',
    height: '64px',
    flexShrink: 0,
  },
  summaryItemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--c-border-subtle)',
  },
  summaryItemImagePlaceholder: {
    width: '100%',
    height: '100%',
    background: 'var(--c-surface)',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--c-border-subtle)',
  },
  summaryItemQty: {
    position: 'absolute' as const,
    top: '-8px',
    right: '-8px',
    background: 'var(--c-accent-2)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  summaryItemDetails: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 4px 0',
  },
  summaryItemPrice: {
    fontSize: '14px',
    color: 'var(--c-text-2)',
    margin: 0,
  },
  separator: {
    height: '1px',
    background: 'var(--c-border-subtle)',
    margin: '24px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
  },
  summaryLabel: {
    color: 'var(--c-text-2)',
  },
  summaryValue: {
    color: 'var(--c-text-1)',
    fontWeight: 500,
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--c-text-1)',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255, 59, 48, 0.1)',
    color: 'var(--c-error)',
    padding: '16px',
    borderRadius: 'var(--r-sm)',
    marginBottom: '24px',
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center' as const,
    padding: '24px',
  },
  messageTitle: {
    fontSize: '24px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    marginBottom: '24px',
  },
  primaryBtn: {
    display: 'inline-block',
    padding: '16px 32px',
    background: 'var(--c-accent)',
    color: 'var(--c-accent-fg)',
    textDecoration: 'none',
    borderRadius: 'var(--r-sm)',
    fontWeight: 500,
    transition: 'transform var(--transition)',
  },
  secondaryBtn: {
    display: 'inline-block',
    padding: '16px 32px',
    background: 'transparent',
    color: 'var(--c-text-1)',
    border: '1px solid var(--c-border)',
    textDecoration: 'none',
    borderRadius: 'var(--r-sm)',
    fontWeight: 500,
    transition: 'background var(--transition)',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '24px',
  },
  successContent: {
    textAlign: 'center' as const,
    maxWidth: '500px',
    animation: 'scaleIn var(--transition)',
  },
  successIcon: {
    marginBottom: '24px',
  },
  successTitle: {
    fontSize: '32px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 8px 0',
  },
  orderNumber: {
    fontSize: '18px',
    fontFamily: 'monospace',
    color: 'var(--c-text-2)',
    margin: '0 0 16px 0',
  },
  successDesc: {
    fontSize: '16px',
    color: 'var(--c-text-2)',
    lineHeight: 1.5,
    margin: '0 0 32px 0',
  },
  successActions: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
};
