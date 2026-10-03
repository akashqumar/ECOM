import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useCart, useToast } from '../context/AppContext';
import { orderApi, catalogApi } from '../services/api';
import { giftCardService, GiftCard } from '../services/giftCardService';
import { Product } from '../types';
import { 
  CheckCircle2, 
  AlertCircle, 
  Gift, 
  Sparkles, 
  Check, 
  X, 
  CreditCard, 
  Smartphone, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Truck, 
  Package, 
  Clock, 
  Copy, 
  Plus, 
  Star,
  ShoppingBag
} from 'lucide-react';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, itemCount, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState('742 Evergreen Terrace, Springfield, OR 97477');
  const [savedAddressSelected, setSavedAddressSelected] = useState('home');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
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

  // Recommendations and order snapshot for post-purchase upsell
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [orderItemsSnapshot, setOrderItemsSnapshot] = useState<Array<{ name: string; quantity: number; price: number; imageUrl?: string }>>([]);
  const [orderAmountSnapshot, setOrderAmountSnapshot] = useState(0);
  const [orderTrackingCopied, setOrderTrackingCopied] = useState(false);
  const { addItem, setIsCartOpen } = useCart();

  useEffect(() => {
    catalogApi.getProducts({ size: 4, sort: 'createdAt,desc' })
      .then(res => setRecommendations(res.data?.content || []))
      .catch(() => {});
  }, []);

  // When order is placed successfully, reset window scroll to top of page
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [success]);

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

      // Save order snapshot for success presentation
      setOrderItemsSnapshot(
        (cart?.items ?? []).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          imageUrl: item.imageUrl
        }))
      );
      setOrderAmountSnapshot(total);

      const finalId = response.data?.id || response.data?.orderNumber || 'ORD-' + Date.now();
      setPlacedOrderId(finalId);
      window.scrollTo(0, 0);
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
    const formattedOrderId = placedOrderId.slice(0, 8).toUpperCase();
    const deliveryMin = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const deliveryMax = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <div className="order-confirmation-page" style={{
        maxWidth: '1040px',
        margin: '0 auto',
        padding: '36px 20px 80px',
        animation: 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Top Hero Glass Banner */}
        <div style={{
          textAlign: 'center',
          padding: '40px 24px 32px',
          background: 'var(--c-surface)',
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--c-border-subtle)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 32,
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.05)',
          }}>
            <CheckCircle2 size={40} color="var(--c-success)" strokeWidth={2.5} />
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 800,
            color: 'var(--c-text-1)',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}>
            Order Confirmed!
          </h1>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--c-bg-alt)',
            padding: '6px 16px',
            borderRadius: 'var(--r-full)',
            margin: '6px 0 16px',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--c-text-1)',
            fontFamily: 'monospace',
          }}>
            <span>Order #{formattedOrderId}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(formattedOrderId);
                setOrderTrackingCopied(true);
                setTimeout(() => setOrderTrackingCopied(false), 2000);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--c-text-2)',
                display: 'flex',
                alignItems: 'center',
                padding: 2,
              }}
              title="Copy Order ID"
            >
              {orderTrackingCopied ? <Check size={14} color="var(--c-success)" /> : <Copy size={14} />}
            </button>
          </div>

          <p style={{
            fontSize: 15,
            color: 'var(--c-text-2)',
            maxWidth: 580,
            margin: '0 auto 24px',
            lineHeight: 1.6,
          }}>
            Thank you for shopping with Lumé. We’ve sent your full receipt and real-time courier tracking details to <strong style={{ color: 'var(--c-text-1)' }}>{email}</strong>.
          </p>

          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link 
              to="/orders" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 28px',
                borderRadius: 'var(--r-full)',
                background: 'var(--c-accent)',
                color: 'var(--c-accent-fg)',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <Package size={16} /> Track Order in Real-Time
            </Link>

            <Link 
              to="/products" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 26px',
                borderRadius: 'var(--r-full)',
                background: 'var(--c-surface)',
                color: 'var(--c-text-1)',
                border: '1px solid var(--c-border)',
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 2-Column Info Grid: Delivery Status & Order Snapshot */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 24,
          marginBottom: 40,
        }}>
          {/* Delivery & Timeline Card */}
          <div style={{
            padding: 28,
            background: 'var(--c-surface)',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--c-border-subtle)',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--c-accent-2)',
                }}>
                  Delivery Information
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--c-success)',
                  background: 'rgba(16, 185, 129, 0.12)',
                  padding: '4px 10px',
                  borderRadius: 'var(--r-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <Truck size={13} /> Priority Express
                </span>
              </div>

              {/* Estimated Window */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: 'var(--c-text-3)', marginBottom: 4 }}>
                  Estimated Arrival Window
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--c-text-1)' }}>
                  {deliveryMin} – {deliveryMax}
                </div>
              </div>

              {/* Stepper Preview */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                marginBottom: 28,
              }}>
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '12%',
                  right: '12%',
                  height: 2,
                  background: 'var(--c-border)',
                  zIndex: 1,
                }}>
                  <div style={{ width: '33%', height: '100%', background: 'var(--c-success)' }} />
                </div>

                {[
                  { label: 'Placed', icon: <Check size={12} strokeWidth={3} />, done: true },
                  { label: 'Preparing', icon: <Clock size={12} />, done: false, active: true },
                  { label: 'Shipped', icon: <Truck size={12} />, done: false },
                  { label: 'Delivered', icon: <Package size={12} />, done: false },
                ].map((s, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 2 }}>
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: s.done ? 'var(--c-success)' : s.active ? 'var(--c-accent)' : 'var(--c-surface-raised)',
                      color: s.done || s.active ? '#FFF' : 'var(--c-text-3)',
                      border: s.active ? '2px solid var(--c-accent)' : '1px solid var(--c-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {s.icon}
                    </div>
                    <span style={{
                      fontSize: 11,
                      fontWeight: s.done || s.active ? 700 : 500,
                      color: s.done || s.active ? 'var(--c-text-1)' : 'var(--c-text-3)',
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address Summary */}
            <div style={{
              paddingTop: 16,
              borderTop: '1px solid var(--c-border-subtle)',
              fontSize: 13,
              color: 'var(--c-text-2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-text-1)', fontWeight: 600, marginBottom: 4 }}>
                <MapPin size={14} color="var(--c-accent-2)" /> Ship to:
              </div>
              <div>{address}</div>
            </div>
          </div>

          {/* Ordered Items Preview Card */}
          <div style={{
            padding: 28,
            background: 'var(--c-surface)',
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--c-border-subtle)',
            boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--c-accent-2)',
              }}>
                Purchased Items ({orderItemsSnapshot.length || 1})
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--c-text-1)' }}>
                ${orderAmountSnapshot > 0 ? orderAmountSnapshot.toFixed(2) : total.toFixed(2)}
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              maxHeight: 240,
              overflowY: 'auto',
              paddingRight: 6,
            }}>
              {orderItemsSnapshot.length > 0 ? (
                orderItemsSnapshot.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 8,
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--c-bg-alt)',
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--c-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ShoppingBag size={18} color="var(--c-text-3)" />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--c-text-3)' }}>
                        Qty: {item.quantity} &bull; ${(item.price).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: 13, color: 'var(--c-text-2)', padding: '12px 0' }}>
                  All items packaged for express delivery.
                </div>
              )}
            </div>

            {/* Perks Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid var(--c-border-subtle)',
              fontSize: 11,
              color: 'var(--c-text-2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color="var(--c-accent-2)" /> 1-Year Warranty Included
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} color="var(--c-accent-2)" /> 30-Day Hassle-Free Returns
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 UPSELL & FREQUENTLY BOUGHT TOGETHER SECTION 🌟 */}
        {recommendations.length > 0 && (
          <div style={{
            marginTop: 48,
            paddingTop: 40,
            borderTop: '1px solid var(--c-border-subtle)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 24,
            }}>
              <div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--c-accent-2)',
                  marginBottom: 4,
                }}>
                  Exclusive Post-Purchase Perks
                </div>
                <h2 style={{
                  fontSize: 'clamp(20px, 3vw, 26px)',
                  fontWeight: 800,
                  color: 'var(--c-text-1)',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}>
                  Complete Your Look &bull; Recommended For You
                </h2>
              </div>
              <Link 
                to="/products"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--c-accent-2)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                Browse All <ArrowRight size={14} />
              </Link>
            </div>

            {/* Upsell Product Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 20,
            }}>
              {recommendations.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--c-surface)',
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--c-border-subtle)',
                    padding: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'transform var(--transition), box-shadow var(--transition)',
                  }}
                >
                  <div>
                    <div style={{
                      aspectRatio: '1/1',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--c-bg-alt)',
                      overflow: 'hidden',
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <img 
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'} 
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--c-accent-2)',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 4,
                    }}>
                      {item.brand || 'LUMÉ EXCLUSIVE'}
                    </div>

                    <h4 style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--c-text-1)',
                      margin: '0 0 6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.name}
                    </h4>

                    <div style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: 'var(--c-text-1)',
                      marginBottom: 12,
                    }}>
                      ${(item.discountPrice ?? item.price).toFixed(2)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.discountPrice ?? item.price,
                        images: item.images,
                        sku: item.sku,
                      }, 1);
                      showToast(`Added "${item.name}" to your bag.`, 'success', 'Bag Updated');
                      setIsCartOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--r-full)',
                      background: 'var(--c-bg-alt)',
                      color: 'var(--c-text-1)',
                      border: '1px solid var(--c-border)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'background var(--transition)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-accent)', e.currentTarget.style.color = 'var(--c-accent-fg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--c-bg-alt)', e.currentTarget.style.color = 'var(--c-text-1)')}
                  >
                    <Plus size={14} /> Add to Next Order
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h2 style={styles.sectionTitle}>Shipping Address</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[
                    { id: 'home', label: 'Primary Residence', val: '742 Evergreen Terrace, Springfield, OR 97477' },
                    { id: 'office', label: 'Executive Suite', val: '500 Madison Ave, Fl 18, New York, NY 10022' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSavedAddressSelected(preset.id);
                        setAddress(preset.val);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--r-full)',
                        fontSize: 11,
                        fontWeight: 600,
                        background: savedAddressSelected === preset.id ? 'var(--c-accent)' : 'var(--c-bg-alt)',
                        color: savedAddressSelected === preset.id ? 'var(--c-accent-fg)' : 'var(--c-text-2)',
                        border: '1px solid var(--c-border)',
                        cursor: 'pointer',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.inputGroup}>
                <textarea 
                  value={address}
                  onChange={e => {
                    setAddress(e.target.value);
                    setSavedAddressSelected('custom');
                  }}
                  placeholder="Full street address, apartment, suite, unit"
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
              <h2 style={styles.sectionTitle}>Payment Method</h2>
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
                      No secondary credit card charge is required for this transaction.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Payment Method Tabs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                      { id: 'card' as const, label: 'Credit Card', icon: <CreditCard size={16} /> },
                      { id: 'apple_pay' as const, label: 'Apple Pay', icon: <Smartphone size={16} /> },
                      { id: 'google_pay' as const, label: 'Google Pay', icon: <ShieldCheck size={16} /> },
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--r-md)',
                          background: paymentMethod === pm.id ? 'var(--c-accent)' : 'var(--c-surface-raised)',
                          color: paymentMethod === pm.id ? 'var(--c-accent-fg)' : 'var(--c-text-1)',
                          border: paymentMethod === pm.id ? '1px solid var(--c-accent)' : '1px solid var(--c-border)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          transition: 'all var(--transition)',
                        }}
                      >
                        {pm.icon}
                        <span>{pm.label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'card' ? (
                    <div style={styles.mockCard}>
                      <div style={styles.mockCardTop}>
                        <span style={styles.mockCardType}>Visa</span>
                        <span style={styles.mockCardDots}>•••• 4242</span>
                      </div>
                      <div style={styles.mockCardBottom}>
                        <span>Lumé Preferred Client</span>
                        <span>12/28</span>
                      </div>
                    </div>
                  ) : paymentMethod === 'apple_pay' ? (
                    <div style={{
                      padding: '24px',
                      borderRadius: 'var(--r-lg)',
                      background: '#000',
                      color: '#FFF',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'center',
                    }}>
                      <Smartphone size={28} />
                      <div style={{ fontWeight: 700, fontSize: 15 }}>Apple Pay Ready</div>
                      <div style={{ fontSize: 12, opacity: 0.75 }}>Double-click side button or confirm with Touch ID</div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '24px',
                      borderRadius: 'var(--r-lg)',
                      background: 'var(--c-surface-raised)',
                      border: '1px solid var(--c-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      textAlign: 'center',
                    }}>
                      <ShieldCheck size={28} color="var(--c-accent-2)" />
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-text-1)' }}>Google Pay Ready</div>
                      <div style={{ fontSize: 12, color: 'var(--c-text-2)' }}>1-Tap biometrics with Google Account</div>
                    </div>
                  )}

                  <p style={styles.paymentDisclaimer}>
                    {giftCardDiscount > 0 ? `Remaining $${total.toFixed(2)} will be processed securely.` : 'Payment is simulated with 100% security.'}
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
