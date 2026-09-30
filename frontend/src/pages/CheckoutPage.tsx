import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useCart } from '../context/AppContext';
import { orderApi } from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, itemCount, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState('742 Evergreen Terrace, Springfield, OR 97477');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

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
  const total = subtotal + tax;

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

      setPlacedOrderId(response.data?.id || response.data?.orderNumber || 'ORD-' + Date.now());
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please try again.');
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
      <div style={styles.layout}>
        
        {/* Left Form Panel */}
        <div style={styles.formPanel}>
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

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Payment</h2>
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
              <p style={styles.paymentDisclaimer}>Payment is simulated. No real charges.</p>
            </section>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Right Summary Panel */}
        <div style={styles.summaryPanel}>
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
        }
        @media (max-width: 768px) {
          .checkout-layout {
            flex-direction: column-reverse !important;
          }
          .checkout-form, .checkout-summary {
            width: 100% !important;
            flex: none !important;
          }
          .checkout-summary {
            position: static !important;
            margin-bottom: 32px;
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
