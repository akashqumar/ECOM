import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useCart, useToast } from '../context/AppContext';
import { orderApi } from '../services/api';
import { Order } from '../types';
import { ShoppingBag, ChevronDown, ChevronUp, Package, Truck, CheckCircle2, Check, Clock, XCircle, FileText, RotateCcw, MessageSquare } from 'lucide-react';

type Tab = 'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export default function OrdersPage() {
  const { user } = useAuth();
  const { addItem, setIsCartOpen } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('ALL');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await orderApi.getOrders();
        const orderList = res.data?.content ?? [];
        // Sort newest first
        setOrders([...orderList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedOrders);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedOrders(newSet);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      await orderApi.cancelOrder(orderId, 'User requested cancellation');
      const res = await orderApi.getOrders();
      const orderList = res.data?.content ?? [];
      setOrders([...orderList].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      showToast('Your order has been cancelled and refund initiated.', 'info', 'Order Cancelled');
    } catch (err) {
      console.error('Failed to cancel order', err);
      showToast('Could not cancel this order. It may have already been dispatched.', 'error', 'Action Failed');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'INVENTORY_RESERVED':
      case 'PAYMENT_PENDING':
      case 'PAID':
      case 'CONFIRMED':
        return { label: 'Processing', color: 'var(--c-warning)', bg: 'rgba(255, 159, 10, 0.1)' };
      case 'PROCESSING':
        return { label: 'Preparing', color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.1)' };
      case 'SHIPPED':
        return { label: 'Shipped', color: '#0A84FF', bg: 'rgba(10, 132, 255, 0.1)' };
      case 'DELIVERED':
        return { label: 'Delivered', color: 'var(--c-success)', bg: 'rgba(48, 209, 88, 0.1)' };
      case 'CANCELLED':
      case 'FAILED':
        return { label: 'Cancelled', color: 'var(--c-error)', bg: 'rgba(255, 69, 58, 0.1)' };
      case 'REFUND_PENDING':
      case 'REFUNDED':
        return { label: 'Refunded', color: '#BF5AF2', bg: 'rgba(191, 90, 242, 0.1)' };
      default:
        return { label: status, color: 'var(--c-text-2)', bg: 'var(--c-surface-raised)' };
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'ALL') return true;
    const { label } = getStatusDisplay(order.status);
    if (activeTab === 'PROCESSING' && (label === 'Processing' || label === 'Preparing')) return true;
    if (activeTab === 'SHIPPED' && label === 'Shipped') return true;
    if (activeTab === 'DELIVERED' && label === 'Delivered') return true;
    if (activeTab === 'CANCELLED' && label === 'Cancelled') return true;
    return false;
  });

  const getProgressStep = (status: string) => {
    const { label } = getStatusDisplay(status);
    if (label === 'Cancelled' || label === 'Refunded') return 0;
    if (label === 'Processing' || label === 'Preparing') return 2;
    if (label === 'Shipped') return 3;
    if (label === 'Delivered') return 4;
    return 1;
  };

  if (loading) {
    return <div style={styles.container}><div style={styles.loading}>Loading orders...</div></div>;
  }

  return (
    <div className="orders-page" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Orders <span style={styles.count}>({orders.length})</span></h1>
      </div>

      <div style={styles.tabsWrapper}>
        <div style={styles.tabsList} className="hide-scroll">
          {(['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as Tab[]).map(tab => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {})
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={styles.emptyState}>
          <ShoppingBag size={48} style={styles.emptyIcon} />
          <h3 style={styles.emptyTitle}>No orders found</h3>
          <p style={styles.emptyDesc}>
            {activeTab === 'ALL' ? "You haven't placed any orders yet." : `No orders matching '${activeTab.toLowerCase()}'.`}
          </p>
          <Link to="/products" style={styles.shopBtn}>Start Shopping</Link>
        </div>
      ) : (
        <div style={styles.orderList}>
          {filteredOrders.map(order => {
            const { label, color, bg } = getStatusDisplay(order.status);
            const isExpanded = expandedOrders.has(order.id);
            const totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const step = getProgressStep(order.status);
            const isCancelled = label === 'Cancelled' || label === 'Refunded';

            return (
              <div key={order.id} style={styles.orderCard}>
                <div className="order-card-header" style={styles.cardHeader} onClick={() => toggleExpand(order.id)}>
                  <div style={styles.headerInfo}>
                    <div style={styles.orderIdRow}>
                      <span style={styles.orderId}>#{order.id.split('-')[0].toUpperCase()}</span>
                      <span style={{
                        ...styles.statusBadge,
                        color,
                        backgroundColor: bg
                      }}>
                        {label}
                      </span>
                    </div>
                    <span style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  
                  <div style={styles.headerRight}>
                    <div style={styles.summary}>
                      <span style={styles.total}>${totalAmount.toFixed(2)}</span>
                      <span style={styles.itemCount}>{itemCount} items</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="var(--c-text-2)" /> : <ChevronDown size={20} color="var(--c-text-2)" />}
                  </div>
                </div>

                {/* Preview row shown when collapsed */}
                {!isExpanded && (
                  <div style={styles.previewRow}>
                    <div style={styles.previewImages}>
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} style={styles.previewImageMock} />
                      ))}
                      {order.items.length > 2 && (
                        <div style={styles.moreItems}>+{order.items.length - 2}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={styles.expandedContent}>
                    {!isCancelled && (
                      <div style={styles.trackingSection}>
                        <div style={styles.progressTrack}>
                          <div style={{...styles.progressFill, width: `${((step - 1) / 3) * 100}%`}} />
                        </div>
                        <div style={styles.progressSteps}>
                          <div style={styles.step}>
                            <div style={{
                              ...styles.stepDot, 
                              ...(step >= 1 ? styles.stepDotActive : {}),
                              ...(step === 1 ? styles.stepDotCurrent : {})
                            }}>
                              {step > 1 ? (
                                <Check size={13} strokeWidth={2.5} color="#fff" />
                              ) : (
                                <Package size={13} strokeWidth={2.2} color="#fff" />
                              )}
                            </div>
                            <span style={{...styles.stepLabel, ...(step >= 1 ? styles.stepLabelActive : {})}}>Placed</span>
                          </div>

                          <div style={styles.step}>
                            <div style={{
                              ...styles.stepDot, 
                              ...(step >= 2 ? styles.stepDotActive : {}),
                              ...(step === 2 ? styles.stepDotCurrent : {})
                            }}>
                              {step > 2 ? (
                                <Check size={13} strokeWidth={2.5} color="#fff" />
                              ) : step === 2 ? (
                                <Clock size={13} strokeWidth={2.2} color="#fff" />
                              ) : null}
                            </div>
                            <span style={{...styles.stepLabel, ...(step >= 2 ? styles.stepLabelActive : {})}}>Processing</span>
                          </div>

                          <div style={styles.step}>
                            <div style={{
                              ...styles.stepDot, 
                              ...(step >= 3 ? styles.stepDotActive : {}),
                              ...(step === 3 ? styles.stepDotCurrent : {})
                            }}>
                              {step > 3 ? (
                                <Check size={13} strokeWidth={2.5} color="#fff" />
                              ) : step === 3 ? (
                                <Truck size={13} strokeWidth={2.2} color="#fff" />
                              ) : null}
                            </div>
                            <span style={{...styles.stepLabel, ...(step >= 3 ? styles.stepLabelActive : {})}}>Shipped</span>
                          </div>

                          <div style={styles.step}>
                            <div style={{
                              ...styles.stepDot, 
                              ...(step >= 4 ? styles.stepDotActive : {}),
                              ...(step === 4 ? styles.stepDotCurrent : {})
                            }}>
                              {step >= 4 ? (
                                <CheckCircle2 size={14} strokeWidth={2.5} color="#fff" />
                              ) : null}
                            </div>
                            <span style={{...styles.stepLabel, ...(step >= 4 ? styles.stepLabelActive : {})}}>Delivered</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="orders-details-grid" style={styles.detailsGrid}>
                      <div style={styles.itemsList}>
                        <h4 style={styles.detailsTitle}>Items</h4>
                        {order.items.map(item => (
                          <div key={item.productId} style={styles.detailItem}>
                            <div style={styles.detailItemMock} />
                            <div style={styles.detailItemInfo}>
                              <p style={styles.detailItemName}>{item.productName}</p>
                              <p style={styles.detailItemMeta}>Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                            </div>
                            <div style={styles.detailItemTotal}>
                              ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div style={styles.shippingInfo}>
                        <h4 style={styles.detailsTitle}>Shipping Details</h4>
                        <p style={styles.addressText}>{order.shippingAddress || 'Address not provided'}</p>
                        
                        {/* Order Management Actions Strip */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                          {/* Download Invoice Button */}
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`Invoice downloaded for #${order.id.slice(0, 8).toUpperCase()}`, 'info', 'Invoice PDF');
                              const invoiceWindow = window.open('', '_blank');
                              if (invoiceWindow) {
                                invoiceWindow.document.write(`
                                  <html>
                                    <head><title>Invoice #${order.id.slice(0, 8).toUpperCase()}</title></head>
                                    <body style="font-family: sans-serif; padding: 40px; color: #1a1915;">
                                      <h1>LUMÉ LUXURY GOODS</h1>
                                      <p>Tax Invoice: #${order.id.slice(0, 8).toUpperCase()}</p>
                                      <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                                      <p>Customer: ${user?.firstName} ${user?.lastName} (${user?.email})</p>
                                      <p>Shipping Address: ${order.shippingAddress}</p>
                                      <hr />
                                      <h3>Items</h3>
                                      <ul>
                                        ${order.items.map(it => `<li>${it.productName} × ${it.quantity} - $${(it.price * it.quantity).toFixed(2)}</li>`).join('')}
                                      </ul>
                                      <hr />
                                      <h3>Total Paid: $${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</h3>
                                      <script>window.print();</script>
                                    </body>
                                  </html>
                                `);
                              }
                            }}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 'var(--r-md)',
                              background: 'var(--c-bg-alt)',
                              border: '1px solid var(--c-border)',
                              color: 'var(--c-text-1)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <FileText size={14} color="var(--c-accent-2)" />
                            <span>Download Tax Invoice</span>
                          </button>

                          {/* Reorder Button */}
                          <button
                            type="button"
                            onClick={async () => {
                              for (const item of order.items) {
                                await addItem({
                                  id: item.productId,
                                  name: item.productName,
                                  price: item.price,
                                  sku: item.sku,
                                }, item.quantity);
                              }
                              showToast(`Added ${order.items.length} items to bag from this order.`, 'success', 'Reorder Placed');
                              setIsCartOpen(true);
                            }}
                            style={{
                              padding: '8px 14px',
                              borderRadius: 'var(--r-md)',
                              background: 'var(--c-bg-alt)',
                              border: '1px solid var(--c-border)',
                              color: 'var(--c-text-1)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <RotateCcw size={14} color="var(--c-accent-2)" />
                            <span>Reorder All Items</span>
                          </button>

                          {/* Return Request Button (if delivered) */}
                          {label === 'Delivered' && (
                            <Link
                              to="/shipping-returns"
                              style={{
                                padding: '8px 14px',
                                borderRadius: 'var(--r-md)',
                                background: 'var(--c-bg-alt)',
                                border: '1px solid var(--c-border)',
                                color: 'var(--c-text-1)',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <RotateCcw size={14} color="var(--c-accent-2)" />
                              <span>Request Return / Refund</span>
                            </Link>
                          )}

                          {/* Contact Support */}
                          <Link
                            to="/contact"
                            style={{
                              padding: '8px 14px',
                              borderRadius: 'var(--r-md)',
                              background: 'var(--c-bg-alt)',
                              border: '1px solid var(--c-border)',
                              color: 'var(--c-text-1)',
                              fontSize: 12,
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <MessageSquare size={14} color="var(--c-accent-2)" />
                            <span>Contact Concierge Support</span>
                          </Link>

                          {(label === 'Processing' || label === 'Preparing') && (
                            <button 
                              style={{
                                ...styles.cancelBtn,
                                opacity: cancellingId === order.id ? 0.6 : 1,
                                cursor: cancellingId === order.id ? 'not-allowed' : 'pointer',
                              }}
                              disabled={cancellingId === order.id}
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <XCircle size={15} />
                              <span>{cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .orders-page {
          animation: fadeUp var(--transition);
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media (max-width: 768px) {
          .orders-details-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 24px !important;
          }
          .order-card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
        }
      `}} />
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px',
    minHeight: '80vh',
    boxSizing: 'border-box' as const,
  },
  loading: {
    textAlign: 'center' as const,
    color: 'var(--c-text-2)',
    padding: '48px',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: 'clamp(24px, 4vw, 32px)',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: 0,
  },
  count: {
    color: 'var(--c-text-3)',
    fontWeight: 400,
  },
  tabsWrapper: {
    borderBottom: '1px solid var(--c-border-subtle)',
    marginBottom: '32px',
    overflowX: 'auto' as const,
  },
  tabsList: {
    display: 'flex',
    gap: '32px',
    width: 'max-content',
  },
  tab: {
    background: 'none',
    border: 'none',
    padding: '0 0 16px 0',
    fontSize: '15px',
    color: 'var(--c-text-2)',
    cursor: 'pointer',
    position: 'relative' as const,
    fontWeight: 500,
    transition: 'color var(--transition)',
  },
  tabActive: {
    color: 'var(--c-text-1)',
    borderBottom: '2px solid var(--c-accent)',
  },
  emptyState: {
    width: '100%',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    padding: '64px 24px',
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderRadius: 'var(--r-xl)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
    boxSizing: 'border-box' as const,
  },
  emptyIcon: {
    color: 'var(--c-text-3)',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--c-text-1)',
    margin: '0 0 8px 0',
  },
  emptyDesc: {
    color: 'var(--c-text-2)',
    marginBottom: '24px',
  },
  shopBtn: {
    display: 'inline-block',
    padding: '12px 28px',
    background: 'var(--c-accent)',
    color: 'var(--c-accent-fg)',
    textDecoration: 'none',
    borderRadius: 'var(--r-full)',
    fontWeight: 600,
  },
  orderList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    boxSizing: 'border-box' as const,
  },
  orderCard: {
    width: '100%',
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    borderRadius: 'var(--r-xl)',
    border: '1px solid var(--glass-border)',
    boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
    transition: 'transform var(--transition), box-shadow var(--transition)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    cursor: 'pointer',
    background: 'transparent',
    transition: 'background var(--transition)',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  orderIdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  orderId: {
    fontFamily: 'monospace',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--c-text-1)',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: 'var(--r-full)',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  orderDate: {
    fontSize: '14px',
    color: 'var(--c-text-3)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  summary: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
  },
  total: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--c-text-1)',
  },
  itemCount: {
    fontSize: '13px',
    color: 'var(--c-text-2)',
  },
  previewRow: {
    padding: '0 24px 20px',
  },
  previewImages: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  previewImageMock: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--r-sm)',
    background: 'var(--c-surface-raised)',
    border: '1px solid var(--c-border-subtle)',
  },
  moreItems: {
    fontSize: '13px',
    color: 'var(--c-text-2)',
    fontWeight: 500,
  },
  expandedContent: {
    padding: '24px',
    borderTop: '1px solid var(--c-border-subtle)',
    background: 'var(--c-surface-raised)',
  },
  trackingSection: {
    position: 'relative' as const,
    marginBottom: '36px',
    padding: '0 20px',
  },
  progressTrack: {
    position: 'absolute' as const,
    top: '12px',
    left: '52px',
    right: '52px',
    height: '3px',
    transform: 'translateY(-50%)',
    background: 'var(--c-border-subtle)',
    borderRadius: '2px',
    zIndex: 0,
  },
  progressFill: {
    height: '100%',
    background: 'var(--c-accent-2)',
    borderRadius: '2px',
    transition: 'width 0.4s ease',
  },
  progressSteps: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative' as const,
    zIndex: 1,
  },
  step: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    width: '64px',
  },
  stepDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--c-surface)',
    border: '2px solid var(--c-border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
  },
  stepDotActive: {
    background: 'var(--c-accent-2)',
    borderColor: 'var(--c-accent-2)',
  },
  stepDotCurrent: {
    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.22)',
  },
  stepLabel: {
    fontSize: '12px',
    color: 'var(--c-text-3)',
    fontWeight: 500,
  },
  stepLabelActive: {
    color: 'var(--c-text-1)',
    fontWeight: 600,
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '40px',
    className: 'orders-details-grid',
  },
  detailsTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--c-text-1)',
    margin: '0 0 16px 0',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--c-border-subtle)',
  },
  detailItemMock: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--r-sm)',
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border-subtle)',
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
    margin: '0 0 4px 0',
  },
  detailItemMeta: {
    fontSize: '13px',
    color: 'var(--c-text-2)',
    margin: 0,
  },
  detailItemTotal: {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--c-text-1)',
  },
  shippingInfo: {
    background: 'var(--c-surface)',
    padding: '20px',
    borderRadius: 'var(--r-md)',
    border: '1px solid var(--c-border-subtle)',
    height: 'fit-content',
  },
  addressText: {
    fontSize: '14px',
    color: 'var(--c-text-2)',
    lineHeight: 1.5,
    margin: '0 0 24px 0',
    whiteSpace: 'pre-wrap' as const,
  },
  cancelBtn: {
    width: '100%',
    padding: '10px 16px',
    background: 'rgba(255, 69, 58, 0.08)',
    border: '1px solid var(--c-error)',
    color: 'var(--c-error)',
    borderRadius: 'var(--r-md)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  }
};
