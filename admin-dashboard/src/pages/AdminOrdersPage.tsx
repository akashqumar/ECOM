import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  Search,
  RefreshCw,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Layers,
  Send
} from 'lucide-react';
import { orderApi } from '../services/api';
import type { Order, OrderTimeline } from '../types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [timelines, setTimelines] = useState<Record<string, OrderTimeline>>({});
  const [loadingTimelines, setLoadingTimelines] = useState<Record<string, boolean>>({});

  // Shipping Modal State
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState('FedEx Priority');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingNotes, setShippingNotes] = useState('Dispatched from WH-MAIN-01 fulfillment hub');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const res = await orderApi.getAllOrders({ size: 50 });
      if (res.success && res.data?.content) {
        setOrders(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
      showToast('Failed to load platform orders', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const toggleTimeline = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!timelines[orderId]) {
      setLoadingTimelines((prev) => ({ ...prev, [orderId]: true }));
      try {
        const res = await orderApi.getOrderTimeline(orderId);
        if (res.success) {
          setTimelines((prev) => ({ ...prev, [orderId]: res.data }));
        }
      } catch (err) {
        console.error('Failed to load timeline', err);
      } finally {
        setLoadingTimelines((prev) => ({ ...prev, [orderId]: false }));
      }
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, tracking?: string, carr?: string, notes?: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await orderApi.updateOrderStatus(orderId, {
        status: newStatus,
        trackingNumber: tracking,
        carrier: carr,
        notes,
      });

      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        if (timelines[orderId]) {
          const tRes = await orderApi.getOrderTimeline(orderId);
          if (tRes.success) {
            setTimelines((prev) => ({ ...prev, [orderId]: tRes.data }));
          }
        }
        showToast(`Order updated to ${newStatus}`, 'success');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update order status';
      showToast(msg, 'error');
    } finally {
      setIsUpdatingStatus(false);
      setShippingModalOrder(null);
    }
  };

  const generateTrackingNumber = () => {
    const prefix = carrier.startsWith('DHL') ? 'DHL' : carrier.startsWith('UPS') ? '1Z' : 'FDX';
    const rand = Math.floor(100000000 + Math.random() * 900000000);
    setTrackingNumber(`${prefix}-${rand}`);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const oNum = order.orderNumber?.toLowerCase() || '';
        const oId = order.id.toLowerCase();
        const uId = order.userId.toLowerCase();
        const addr = order.shippingAddress?.toLowerCase() || '';
        const hasItemMatch = order.items?.some(
          (i) => i.productName?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q)
        );
        if (!oNum.includes(q) && !oId.includes(q) && !uId.includes(q) && !addr.includes(q) && !hasItemMatch) {
          return false;
        }
      }

      if (statusFilter === 'READY') {
        return order.status === 'CONFIRMED' || order.status === 'PAID';
      } else if (statusFilter === 'PROCESSING') {
        return order.status === 'PROCESSING';
      } else if (statusFilter === 'SHIPPED') {
        return order.status === 'SHIPPED';
      } else if (statusFilter === 'DELIVERED') {
        return order.status === 'DELIVERED';
      } else if (statusFilter === 'CANCELLED') {
        return order.status === 'CANCELLED' || order.status === 'FAILED';
      }
      return true;
    });
  }, [orders, searchTerm, statusFilter]);

  const readyCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PAID').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING').length;
  const shippedCount = orders.filter((o) => o.status === 'SHIPPED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 12,
            background: toastMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Orders & Fulfillment Console
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Manage order lifecycle, trigger Kafka fulfillment events, and track multi-stage Saga timelines.
          </p>
        </div>
        <button
          onClick={() => loadOrders(false)}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync Orders'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search by Order #, Customer ID, SKU, product, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 12 }}>
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'READY', label: 'Ready to Ship', count: readyCount },
            { id: 'PROCESSING', label: 'In Processing', count: processingCount },
            { id: 'SHIPPED', label: 'Shipped (In Transit)', count: shippedCount },
            { id: 'DELIVERED', label: 'Delivered', count: deliveredCount },
            { id: 'CANCELLED', label: 'Cancelled / Failed', count: orders.filter((o) => o.status === 'CANCELLED' || o.status === 'FAILED').length },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 99,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 99,
                    background: active ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: active ? '#fff' : 'var(--text-tertiary)',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
              <div className="skeleton" style={{ height: 20, width: '40%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 16, width: '50%' }} />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>No orders match this filter</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing your search query or switching to another status tab.</div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const timelineData = timelines[order.id];
            const isLoadingTimeline = loadingTimelines[order.id];

            return (
              <div
                key={order.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 14,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      #{order.orderNumber}
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        background: order.status === 'SHIPPED' ? 'var(--info-light)' : order.status === 'CONFIRMED' || order.status === 'DELIVERED' ? 'var(--success-light)' : 'var(--warning-light)',
                        color: order.status === 'SHIPPED' ? 'var(--info)' : order.status === 'CONFIRMED' || order.status === 'DELIVERED' ? 'var(--success)' : 'var(--warning)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {order.status}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} />
                      {new Date(order.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Total Amount
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'PROCESSING')}
                          disabled={isUpdatingStatus}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            border: '1px solid var(--border)',
                            background: 'var(--bg)',
                            color: 'var(--text-primary)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Mark Processing
                        </button>
                      )}

                      {(order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                        <button
                          onClick={() => {
                            setShippingModalOrder(order);
                            generateTrackingNumber();
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'var(--info)',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Truck size={13} />
                          <span>Dispatch / Ship</span>
                        </button>
                      )}

                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          disabled={isUpdatingStatus}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'var(--success)',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <CheckCircle2 size={13} />
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleTimeline(order.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--bg)',
                          color: 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>Saga Timeline</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Order Details Body */}
                <div style={{ padding: '16px 20px', background: 'var(--bg)', fontSize: 13 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {/* Items */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                        Items ({order.items?.length || 0})
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              borderRadius: 8,
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.productName}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                                SKU: {item.sku} • Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              ${item.subtotal.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer & Address */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 8 }}>
                        Fulfillment & Customer Details
                      </div>
                      <div
                        style={{
                          padding: '12px 14px',
                          borderRadius: 10,
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                          <MapPin size={14} color="var(--accent)" />
                          <span>{order.shippingAddress || 'Standard Shipping Address'}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                          Customer ID: <code style={{ color: 'var(--text-primary)' }}>{order.userId}</code>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                          Order ID: <code style={{ color: 'var(--text-primary)' }}>{order.id}</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Saga Stepper */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 18,
                        borderTop: '1px solid var(--border-subtle)',
                        animation: 'fadeIn 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Layers size={15} color="var(--accent)" />
                          <span>Distributed Kafka Saga Lifecycle Stepper</span>
                        </div>
                        {timelineData && (
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                            Saga Status: <strong style={{ color: 'var(--accent)' }}>{timelineData.sagaStatus}</strong>
                          </span>
                        )}
                      </div>

                      {isLoadingTimeline ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                          Loading live event chain from Kafka & Outbox...
                        </div>
                      ) : !timelineData?.timeline?.length ? (
                        <div style={{ padding: 16, color: 'var(--text-tertiary)' }}>No timeline events recorded yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {timelineData.timeline.map((step, sIdx) => {
                            const isDone = step.status === 'COMPLETED';
                            const isFail = step.status === 'FAILED';

                            return (
                              <div
                                key={sIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 12,
                                  padding: '10px 14px',
                                  borderRadius: 10,
                                  background: isFail
                                    ? 'var(--danger-light)'
                                    : isDone
                                    ? 'var(--success-light)'
                                    : 'var(--bg-secondary)',
                                  border: `1px solid ${isFail ? 'rgba(239, 68, 68, 0.2)' : isDone ? 'rgba(16, 185, 129, 0.15)' : 'var(--border-subtle)'}`,
                                }}
                              >
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    background: isFail ? 'var(--danger)' : isDone ? 'var(--success)' : 'var(--border)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    marginTop: 2,
                                  }}
                                >
                                  {isDone ? '✓' : isFail ? '✕' : sIdx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                                      {step.title}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                                      {new Date(step.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                    {step.description}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dispatch & Shipping Modal */}
      {shippingModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 1000,
          }}
          onClick={() => setShippingModalOrder(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 500,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 28,
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'var(--info-light)',
                    color: 'var(--info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Dispatch & Ship Order
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                    #{shippingModalOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShippingModalOrder(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStatusUpdate(shippingModalOrder.id, 'SHIPPED', trackingNumber, carrier, shippingNotes);
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Logistics Carrier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  <option value="FedEx Priority">FedEx Priority</option>
                  <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                  <option value="UPS Express Saver">UPS Express Saver</option>
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                  <option value="BlueDart Logistics">BlueDart Logistics</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Carrier Tracking Number
                  </label>
                  <button
                    type="button"
                    onClick={generateTrackingNumber}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--accent)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. FDX-98124912"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1.5px solid var(--accent)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Dispatch Notes
                </label>
                <input
                  type="text"
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus || !trackingNumber.trim()}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--info)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isUpdatingStatus ? 'Transmitting Kafka Event...' : 'Confirm Shipment & Notify Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
