import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../../context/AppContext';

export default function GlassCartDrawer() {
  const { cart, itemCount, subtotal, updateQty, removeItem, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const freeShippingThreshold = 75;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div 
      className="glass-cart-overlay"
      onClick={() => setIsCartOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div 
        className="glass-cart-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          background: 'var(--c-surface-overlay)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderLeft: '1px solid var(--c-border-subtle)',
          boxShadow: 'var(--shadow-lg), -10px 0 35px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--c-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--c-bg-alt)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-accent-2)',
            }}>
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--c-text-1)' }}>
                Your Shopping Bag
              </h2>
              <span style={{ fontSize: 12, color: 'var(--c-text-3)' }}>
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart drawer"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--c-text-2)',
              padding: 8,
              borderRadius: 'var(--r-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--c-bg-alt)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div style={{
          padding: '14px 24px',
          background: 'var(--c-surface-raised)',
          borderBottom: '1px solid var(--c-border-subtle)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
            <span style={{ color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={14} color="var(--c-accent-2)" />
              {remainingForFreeShipping > 0
                ? <>Add <strong style={{ color: 'var(--c-text-1)' }}>${remainingForFreeShipping.toFixed(2)}</strong> for Free Shipping</>
                : <strong style={{ color: 'var(--c-success)' }}>🎉 You unlocked Free Express Shipping!</strong>
              }
            </span>
            <span style={{ fontWeight: 600, color: 'var(--c-accent-2)' }}>
              {Math.round(freeShippingProgress)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 6,
            borderRadius: 'var(--r-full)',
            background: 'var(--c-border)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${freeShippingProgress}%`,
              height: '100%',
              borderRadius: 'var(--r-full)',
              background: remainingForFreeShipping === 0 ? 'var(--c-success)' : 'linear-gradient(90deg, var(--c-accent-2), #D4A855)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Items Scroll Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: 'var(--c-text-3)',
              gap: 16,
              padding: '40px 0',
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--c-bg-alt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--c-text-3)',
              }}>
                <ShoppingBag size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--c-text-1)', marginBottom: 6 }}>
                  Your bag is empty
                </h3>
                <p style={{ fontSize: 13, color: 'var(--c-text-2)', maxWidth: 260, margin: '0 auto' }}>
                  Explore our curated collection and add your favorite pieces.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/products');
                }}
                style={{
                  marginTop: 8,
                  padding: '10px 24px',
                  borderRadius: 'var(--r-full)',
                  background: 'var(--c-accent)',
                  color: 'var(--c-accent-fg)',
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Start Shopping <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.productId}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: 12,
                  borderRadius: 'var(--r-md)',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border-subtle)',
                  boxShadow: 'var(--shadow-xs)',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: 'var(--r-sm)',
                  overflow: 'hidden',
                  background: 'var(--c-bg-alt)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <ShoppingBag size={24} color="var(--c-text-3)" />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--c-text-1)',
                    margin: '0 0 4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {item.name}
                  </h4>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)', marginBottom: 8 }}>
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: 'var(--c-bg-alt)',
                      borderRadius: 'var(--r-full)',
                      padding: '2px 6px',
                      gap: 8,
                    }}>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                          color: 'var(--c-text-2)',
                          display: 'flex',
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: 12, fontWeight: 600, minWidth: 16, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                          color: 'var(--c-text-2)',
                          display: 'flex',
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--c-text-3)',
                        padding: 4,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color var(--transition)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-error)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--c-text-3)')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--c-text-1)',
                  textAlign: 'right',
                  alignSelf: 'flex-start',
                }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            background: 'var(--c-surface-raised)',
            borderTop: '1px solid var(--c-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* Promo Code Input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Promo code (e.g. LUME10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--c-border)',
                  background: 'var(--c-surface)',
                  color: 'var(--c-text-1)',
                  fontSize: 13,
                }}
              />
              <button
                onClick={() => {
                  if (promoCode.trim().toUpperCase() === 'LUME10' || promoCode.trim().toUpperCase() === 'LUME20') {
                    setPromoApplied(true);
                  }
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  color: 'var(--c-text-1)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {promoApplied ? 'Applied ✓' : 'Apply'}
              </button>
            </div>

            {/* Subtotal & Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-text-2)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: 'var(--c-text-1)' }}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-text-2)' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 600, color: remainingForFreeShipping === 0 ? 'var(--c-success)' : 'var(--c-text-1)' }}>
                  {remainingForFreeShipping === 0 ? 'Free' : '$4.99'}
                </span>
              </div>
              {promoApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--c-success)' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600 }}>−10%</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--c-text-1)',
                paddingTop: 8,
                borderTop: '1px solid var(--c-border-subtle)',
              }}>
                <span>Total</span>
                <span>
                  ${(
                    (promoApplied ? subtotal * 0.9 : subtotal) + (remainingForFreeShipping === 0 ? 0 : 4.99)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={handleCheckout}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 'var(--r-full)',
                  background: 'var(--c-accent)',
                  color: 'var(--c-accent-fg)',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'opacity var(--transition)',
                }}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>

              <button
                onClick={handleViewCart}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 'var(--r-full)',
                  background: 'transparent',
                  color: 'var(--c-text-1)',
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid var(--c-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                View Full Bag
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              fontSize: 11,
              color: 'var(--c-text-3)',
              paddingTop: 4,
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={12} color="var(--c-accent-2)" /> SSL Encrypted
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={12} color="var(--c-accent-2)" /> 30-Day Returns
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
