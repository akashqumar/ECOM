import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Layers,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Server
} from 'lucide-react';
import { orderApi, inventoryApi } from '../services/api';
import type { Order, InventoryItem } from '../types';

export default function AdminOverviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [ordersRes, invRes] = await Promise.all([
        orderApi.getAllOrders({ size: 10 }),
        inventoryApi.getAll(),
      ]);

      if (ordersRes.success && ordersRes.data?.content) {
        setOrders(ordersRes.data.content);
      }
      if (invRes.success) {
        setInventory(invRes.data);
      }
    } catch (err) {
      console.error('Failed to load overview data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalAvailableStock = inventory.reduce((sum, i) => sum + (i.availableQuantity || 0), 0);
  const totalReservedStock = inventory.reduce((sum, i) => sum + (i.reservedQuantity || 0), 0);
  const lowStockItems = inventory.filter((i) => i.availableQuantity > 0 && i.availableQuantity < 25);
  const outOfStockItems = inventory.filter((i) => i.availableQuantity === 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      {/* Page Title & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="glass-pill" style={{ color: 'var(--accent)' }}>
              LIVE TELEMETRY
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', letterSpacing: '-0.5px' }}>
            System Operations Overview
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>
            Real-time telemetry across 8 microservices, PostgreSQL databases, and Kafka saga event streams.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={refreshing}
          className="glass-btn"
          style={{ cursor: refreshing ? 'not-allowed' : 'pointer' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
        </button>
      </div>

      {/* KPI Glass Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
        {/* Gross Revenue */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-2)' }}>Gross Revenue</span>
            <div style={{ padding: 8, borderRadius: 'var(--r-sm)', background: 'var(--success-light)', color: 'var(--success)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
            <TrendingUp size={13} />
            <span>Captured via Lumé Payment Gateway</span>
          </div>
        </div>

        {/* Total Platform Orders */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-2)' }}>Orders Handled</span>
            <div style={{ padding: 8, borderRadius: 'var(--r-sm)', background: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : orders.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-text-3)', marginTop: 8 }}>
            Across all customer accounts
          </div>
        </div>

        {/* Saga Lock Units */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-2)' }}>In-Flight Saga Locks</span>
            <div style={{ padding: 8, borderRadius: 'var(--r-sm)', background: 'var(--info-light)', color: 'var(--info)' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--info)', fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : totalReservedStock} units
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-text-3)', marginTop: 8 }}>
            Reserved by concurrent checkouts
          </div>
        </div>

        {/* Available Stock Units */}
        <div className="glass-panel glass-panel-hover" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-2)' }}>Total Stock Available</span>
            <div style={{ padding: 8, borderRadius: 'var(--r-sm)', background: 'var(--success-light)', color: 'var(--success)' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : totalAvailableStock.toLocaleString()} units
          </div>
          <div style={{ fontSize: 12, color: 'var(--c-text-3)', marginTop: 8 }}>
            Across {inventory.length} catalog SKUs
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Recent Orders Glass Panel */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)' }}>Recent Platform Orders</div>
              <div style={{ fontSize: 12, color: 'var(--c-text-3)', marginTop: 2 }}>Latest consumer transactions</div>
            </div>
            <Link
              to="/orders"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 'var(--r-full)',
                background: 'var(--accent-light)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.length === 0 && !loading && (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: 'var(--c-text-3)', fontSize: 13 }}>
                No recent orders recorded
              </div>
            )}
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="glass-panel-hover"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  boxShadow: 'var(--glass-highlight)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace', color: 'var(--c-text-1)' }}>
                    #{order.orderNumber}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 2 }}>
                    {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--c-text-1)', fontVariantNumeric: 'tabular-nums' }}>
                    ${order.totalAmount.toFixed(2)}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--r-full)',
                      background:
                        order.status === 'SHIPPED'
                          ? 'var(--info-light)'
                          : order.status === 'CONFIRMED' || order.status === 'DELIVERED'
                          ? 'var(--success-light)'
                          : 'var(--warning-light)',
                      color:
                        order.status === 'SHIPPED'
                          ? 'var(--info)'
                          : order.status === 'CONFIRMED' || order.status === 'DELIVERED'
                          ? 'var(--success)'
                          : 'var(--warning)',
                      border: '1px solid var(--border-subtle)',
                      display: 'inline-block',
                      marginTop: 3,
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Alerts & Microservice Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Stock Alerts Glass Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={18} color="var(--warning)" />
                <span>Warehouse Stock Alerts</span>
              </div>
              <Link
                to="/inventory"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: 'var(--r-full)',
                  background: 'var(--accent-light)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                Manage Stock
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--warning-light)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  boxShadow: 'var(--glass-highlight)',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--warning)' }}>{lowStockItems.length}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text-2)', marginTop: 2, fontWeight: 500 }}>Low Stock (&lt;25 units)</div>
              </div>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--danger-light)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  boxShadow: 'var(--glass-highlight)',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)' }}>{outOfStockItems.length}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text-2)', marginTop: 2, fontWeight: 500 }}>Out of Stock (0 units)</div>
              </div>
            </div>
          </div>

          {/* Microservices Health Status Glass Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Server size={18} color="var(--info)" />
              <span>Distributed Architecture Grid</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {[
                { name: 'API Gateway', port: 8080 },
                { name: 'User Service', port: 8081 },
                { name: 'Catalog Service', port: 8082 },
                { name: 'Cart Service', port: 8083 },
                { name: 'Order & Saga', port: 8084 },
                { name: 'Inventory Lock', port: 8085 },
                { name: 'Payment Gateway', port: 8086 },
                { name: 'Notification Service', port: 8087 },
              ].map((svc) => (
                <div
                  key={svc.port}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: 'var(--glass-highlight)',
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--c-text-1)' }}>{svc.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, background: 'var(--success-light)', padding: '2px 6px', borderRadius: 6 }}>
                    UP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
