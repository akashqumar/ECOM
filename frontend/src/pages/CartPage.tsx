import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/AppContext';
import { Trash2, Lock, RotateCcw, Truck, ShoppingBag, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, itemCount, subtotal, updateQty, removeItem } = useCart();

  if (itemCount === 0) {
    return (
      <div className="cart-empty" style={styles.emptyContainer}>
        <div style={styles.emptyContent}>
          <ShoppingBag size={64} style={styles.emptyIcon} strokeWidth={1} />
          <h2 style={styles.emptyTitle}>Your bag is empty</h2>
          <p style={styles.emptyDesc}>Looks like you haven't added anything to your bag yet.</p>
          <Link to="/products" style={styles.emptyButton}>
            Discover our latest collection
          </Link>
        </div>
      </div>
    );
  }

  const tax = subtotal * 0.08; // Simulated 8% tax for UI purposes
  const total = subtotal + tax;

  return (
    <div className="cart-page" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Your Bag ({itemCount} {itemCount === 1 ? 'item' : 'items'})</h1>
        <Link to="/products" style={styles.continueLink}>Continue Shopping</Link>
      </div>

      <div style={styles.layout}>
        <div style={styles.itemsPanel}>
          <div style={styles.itemsList}>
            {(cart?.items ?? []).map((item) => (
              <div key={item.productId} style={styles.itemRow}>
                <div style={styles.itemImageContainer}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={styles.itemImage} />
                  ) : (
                    <div style={styles.itemImagePlaceholder} />
                  )}
                </div>
                
                <div style={styles.itemDetails}>
                  <div style={styles.itemHeader}>
                    <div>
                      <h3 style={styles.itemName}>{item.name}</h3>
                      <p style={styles.itemBrand}>Lumé Collection</p>
                    </div>
                    <span style={styles.itemPrice}>${item.price.toFixed(2)}</span>
                  </div>

                  <div style={styles.itemActions}>
                    <div style={styles.stepper}>
                      <button 
                        style={styles.stepperBtn} 
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={styles.stepperValue}>{item.quantity}</span>
                      <button 
                        style={styles.stepperBtn} 
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button 
                      style={styles.removeBtn} 
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                      <span style={{ marginLeft: 4 }}>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.summaryPanel}>
          <div style={styles.summaryCard}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Subtotal</span>
              <span style={styles.summaryValue}>${subtotal.toFixed(2)}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Shipping</span>
              <span style={styles.summaryValue}>Calculated at checkout</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Tax</span>
              <span style={styles.summaryValueMuted}>Calculated at checkout</span>
            </div>

            <div style={styles.separator} />

            <div style={styles.totalRow}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div style={styles.promoContainer}>
              <input 
                type="text" 
                placeholder="Promo code" 
                style={styles.promoInput}
              />
              <button style={styles.promoBtn}>Apply</button>
            </div>

            <Link to="/checkout" style={styles.checkoutBtn}>
              Proceed to Checkout
              <ArrowRight size={18} style={{ marginLeft: 8 }} />
            </Link>

            <div style={styles.trustBadges}>
              <div style={styles.badge}>
                <Lock size={16} style={styles.badgeIcon} />
                <span>Secure Payment</span>
              </div>
              <div style={styles.badge}>
                <RotateCcw size={16} style={styles.badgeIcon} />
                <span>Free Returns</span>
              </div>
              <div style={styles.badge}>
                <Truck size={16} style={styles.badgeIcon} />
                <span>Fast Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .cart-page {
          animation: fadeUp var(--transition);
        }
        @media (max-width: 768px) {
          .cart-layout {
            flex-direction: column !important;
          }
          .cart-summary {
            width: 100% !important;
            position: static !important;
            margin-top: 32px;
          }
          .cart-items {
            width: 100% !important;
          }
        }
      `}} />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '40px 24px',
    minHeight: '80vh',
    boxSizing: 'border-box' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '32px',
    borderBottom: '1px solid var(--c-border-subtle)',
    paddingBottom: '16px',
    width: '100%',
  },
  title: {
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: 700,
    color: 'var(--c-text-1)',
    margin: 0,
  },
  continueLink: {
    color: 'var(--c-text-2)',
    textDecoration: 'underline',
    fontSize: '14px',
    transition: 'color var(--transition)',
  },
  layout: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.6fr)',
    gap: '36px',
    alignItems: 'start',
    boxSizing: 'border-box' as const,
    className: 'cart-layout',
  },
  itemsPanel: {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box' as const,
    className: 'cart-items',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },
  itemRow: {
    display: 'flex',
    gap: '20px',
    padding: '20px',
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderRadius: 'var(--r-lg)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-highlight), var(--shadow-xs)',
    transition: 'all var(--transition)',
  },
  itemImageContainer: {
    flexShrink: 0,
  },
  itemImage: {
    width: '100px',
    height: '120px',
    objectFit: 'cover' as const,
    borderRadius: 'var(--r-md)',
  },
  itemImagePlaceholder: {
    width: '100px',
    height: '120px',
    background: 'linear-gradient(135deg, var(--c-surface-raised) 0%, var(--c-surface) 100%)',
    borderRadius: 'var(--r-md)',
  },
  itemDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 4px 0',
  },
  itemBrand: {
    fontSize: '14px',
    color: 'var(--c-text-3)',
    margin: 0,
  },
  itemPrice: {
    fontSize: '16px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
  },
  itemActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
  },
  stepper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--c-border)',
    borderRadius: 'var(--r-sm)',
    padding: '4px',
  },
  stepperBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--c-text-2)',
    cursor: 'pointer',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color var(--transition)',
  },
  stepperValue: {
    fontSize: '14px',
    fontWeight: 500,
    minWidth: '24px',
    textAlign: 'center' as const,
    color: 'var(--c-text-1)',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--c-text-3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    transition: 'color var(--transition)',
    padding: '8px 0',
  },
  summaryPanel: {
    flex: '1 1 40%',
    position: 'sticky' as const,
    top: '24px',
    className: 'cart-summary',
  },
  summaryCard: {
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderRadius: 'var(--r-xl)',
    padding: '32px',
    boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
    border: '1px solid var(--glass-border)',
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 24px 0',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
    fontSize: '15px',
  },
  summaryLabel: {
    color: 'var(--c-text-2)',
  },
  summaryValue: {
    color: 'var(--c-text-1)',
  },
  summaryValueMuted: {
    color: 'var(--c-text-3)',
  },
  separator: {
    height: '1px',
    background: 'var(--c-border-subtle)',
    margin: '20px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 600,
    color: 'var(--c-text-1)',
    marginBottom: '24px',
  },
  promoContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  promoInput: {
    flex: 1,
    padding: '12px 16px',
    background: 'var(--c-bg)',
    border: '1px solid var(--c-border)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--c-text-1)',
    fontSize: '14px',
    outline: 'none',
  },
  promoBtn: {
    padding: '0 20px',
    background: 'transparent',
    border: '1px solid var(--c-border)',
    borderRadius: 'var(--r-sm)',
    color: 'var(--c-text-1)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  checkoutBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: '16px',
    background: 'var(--c-accent)',
    color: 'var(--c-accent-fg)',
    border: 'none',
    borderRadius: 'var(--r-sm)',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'transform var(--transition), opacity var(--transition)',
    marginBottom: '24px',
  },
  trustBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    borderTop: '1px solid var(--c-border-subtle)',
    paddingTop: '24px',
  },
  badge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    color: 'var(--c-text-3)',
    fontSize: '11px',
    textAlign: 'center' as const,
  },
  badgeIcon: {
    color: 'var(--c-text-2)',
  },
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
    padding: '24px',
  },
  emptyContent: {
    textAlign: 'center' as const,
    maxWidth: '400px',
    animation: 'fadeUp var(--transition)',
  },
  emptyIcon: {
    color: 'var(--c-text-3)',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 12px 0',
  },
  emptyDesc: {
    fontSize: '15px',
    color: 'var(--c-text-2)',
    margin: '0 0 32px 0',
    lineHeight: 1.5,
  },
  emptyButton: {
    display: 'inline-block',
    padding: '16px 32px',
    background: 'var(--c-accent)',
    color: 'var(--c-accent-fg)',
    textDecoration: 'none',
    borderRadius: 'var(--r-sm)',
    fontWeight: 500,
    transition: 'transform var(--transition)',
  },
};
