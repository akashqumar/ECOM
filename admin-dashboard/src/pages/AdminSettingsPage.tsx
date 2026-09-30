import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Warehouse,
  Bell,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Database,
  Radio,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AdminSettingsPage() {
  const { customization, updateCustomization, theme, toggleTheme } = useAdmin();
  const [savedToast, setSavedToast] = useState(false);

  const ACCENT_COLORS = [
    { label: 'Cyber Indigo', hex: '#6366f1' },
    { label: 'Neon Cyan', hex: '#06b6d4' },
    { label: 'Electric Pink', hex: '#ec4899' },
    { label: 'Emerald Tech', hex: '#10b981' },
    { label: 'Amber Alert', hex: '#f59e0b' },
    { label: 'Royal Violet', hex: '#8b5cf6' },
  ];

  const WAREHOUSES = [
    { id: 'WH-MAIN-01', name: 'Primary Fulfillment Hub (WH-MAIN-01)', region: 'US-East' },
    { id: 'WH-WEST-02', name: 'West Coast Micro-Hub (WH-WEST-02)', region: 'US-West' },
    { id: 'WH-EU-01', name: 'European Logistics Centre (WH-EU-01)', region: 'EU-Central' },
    { id: 'WH-APAC-01', name: 'Asia-Pacific Automated Facility (WH-APAC-01)', region: 'APAC' },
  ];

  const handleColorChange = (hex: string) => {
    updateCustomization({ accentColor: hex });
    showSaveToast();
  };

  const showSaveToast = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      {/* Toast */}
      {savedToast && (
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
            background: 'var(--success)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <CheckCircle2 size={18} />
          <span>Operations settings persisted successfully</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Operations & Console Customization
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
          Personalize console styling, set multi-warehouse routing defaults, adjust stock threshold rules, and inspect microservice telemetry.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Accent Color & Theme Customization */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Palette size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Console Visual Identity & Color Theme
            </h3>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Primary Accent Color:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {ACCENT_COLORS.map((c) => {
                const isSelected = customization.accentColor === c.hex;
                return (
                  <button
                    key={c.hex}
                    onClick={() => handleColorChange(c.hex)}
                    style={{
                      padding: '12px',
                      borderRadius: 10,
                      border: `2px solid ${isSelected ? c.hex : 'var(--border)'}`,
                      background: 'var(--bg)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 12px ${c.hex}40` : 'none',
                    }}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: c.hex, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: 'var(--text-primary)' }}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Global Theme Mode</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Current: {theme.toUpperCase()}</div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        {/* Warehouse & Inventory Thresholds */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Warehouse size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Fulfillment & Warehouse Configuration
            </h3>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Default Dispatch Warehouse:
            </label>
            <select
              value={customization.defaultWarehouse}
              onChange={(e) => {
                updateCustomization({ defaultWarehouse: e.target.value });
                showSaveToast();
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: 13,
                outline: 'none',
              }}
            >
              {WAREHOUSES.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.region})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                Low Stock Alert Threshold:
              </label>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                {customization.lowStockThreshold} units
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={customization.lowStockThreshold}
              onChange={(e) => {
                updateCustomization({ lowStockThreshold: parseInt(e.target.value) });
                showSaveToast();
              }}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              <span>5 units (Strict)</span>
              <span>50 units</span>
              <span>100 units (High buffer)</span>
            </div>
          </div>
        </div>

        {/* Telemetry & Outbox Architecture Monitoring */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px', gridColumn: '1/-1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Radio size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Distributed Kafka Topics & Event Stream Topology
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { topic: 'order.events', producer: 'order-service', consumer: 'inventory, payment, notification', events: 'ORDER_CREATED, ORDER_SHIPPED, ORDER_DELIVERED' },
              { topic: 'inventory.events', producer: 'inventory-service', consumer: 'order-service (Saga)', events: 'INVENTORY_RESERVED, INVENTORY_RELEASED, INVENTORY_DEDUCTED' },
              { topic: 'payment.events', producer: 'payment-service', consumer: 'order-service (Saga)', events: 'PAYMENT_COMPLETED, PAYMENT_FAILED' },
              { topic: 'notification.events', producer: 'order, inventory', consumer: 'notification-service', events: 'EMAIL_DISPATCH, AUDIT_LOG' },
            ].map((t) => (
              <div
                key={t.topic}
                style={{
                  padding: '16px',
                  borderRadius: 10,
                  background: 'var(--bg)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <code style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{t.topic}</code>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', background: 'var(--success-light)', padding: '2px 6px', borderRadius: 4 }}>
                    ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  <strong>Producer:</strong> {t.producer}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  <strong>Consumers:</strong> {t.consumer}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8, fontFamily: 'monospace' }}>
                  {t.events}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
