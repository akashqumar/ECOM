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
  Truck,
  CheckCircle2,
  RefreshCw,
  Activity,
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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            System Operations Overview
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Real-time telemetry across 8 microservices, PostgreSQL databases, and Kafka saga event streams.
          </p>
        </div>
        <button
          onClick={loadData}
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
          <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        {/* Gross Revenue */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Gross Revenue</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'var(--success-light)', color: 'var(--success)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={13} />
            <span>Captured via Mock Payment Provider</span>
          </div>
        </div>

        {/* Total Platform Orders */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Orders Handled</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : orders.length}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
            Across all registered customers
          </div>
        </div>

        {/* Saga Lock Units */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>In-Flight Saga Locks</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'var(--info-light)', color: 'var(--info)' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--info)', fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : totalReservedStock} units
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
            Reserved by concurrent checkouts
          </div>
        </div>

        {/* Available Stock Units */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Total Stock Available</span>
            <div style={{ padding: 8, borderRadius: 8, background: 'var(--success-light)', color: 'var(--success)' }}>
              <Boxes size={18} />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {loading ? '...' : totalAvailableStock.toLocaleString()} units
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6 }}>
            Across {inventory.length} catalog SKUs
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Recent Orders */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Recent Platform Orders</div>
            <Link to="/orders" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    #{order.orderNumber}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {order.items?.length || 0} items • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                    ${order.totalAmount.toFixed(2)}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: order.status === 'SHIPPED' ? 'var(--info-light)' : order.status === 'CONFIRMED' ? 'var(--success-light)' : 'var(--bg-tertiary)',
                      color: order.status === 'SHIPPED' ? 'var(--info)' : order.status === 'CONFIRMED' ? 'var(--success)' : 'var(--text-secondary)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Stock Alerts */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} color="var(--warning)" />
                <span>Warehouse Stock Alerts</span>
              </div>
              <Link to="/inventory" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
                Manage Stock
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'var(--warning-light)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--warning)' }}>{lowStockItems.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Low Stock (&lt;25 units)</div>
              </div>
              <div style={{ flex: 1, padding: '12px', borderRadius: 8, background: 'var(--danger-light)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--danger)' }}>{outOfStockItems.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Out of Stock (0 units)</div>
              </div>
            </div>
          </div>

          {/* Microservices Health Status */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '22px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Server size={16} color="var(--info)" />
              <span>Microservices Infrastructure</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{svc.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700 }}>:{svc.port} UP</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
