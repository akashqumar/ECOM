import React, { useState } from 'react';
import {
  Palette,
  Warehouse,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export default function AdminSettingsPage() {
  const { customization, updateCustomization, theme, toggleTheme } = useAdmin();
  const [savedToast, setSavedToast] = useState(false);

  const ACCENT_COLORS = [
    { label: 'Aero Blue', hex: '#2563eb' },
    { label: 'Cyan Sky', hex: '#0284c7' },
    { label: 'Royal Violet', hex: '#8b5cf6' },
    { label: 'Emerald Mint', hex: '#059669' },
    { label: 'Warm Amber', hex: '#d97706' },
    { label: 'Electric Rose', hex: '#db2777' },
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
            padding: '14px 22px',
            borderRadius: 'var(--r-md)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className="glass-pill" style={{ color: 'var(--accent)' }}>
            CUSTOMIZATION & TOPOLOGY
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', letterSpacing: '-0.5px' }}>
          Operations & Console Customization
        </h1>
        <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>
          Personalize console styling, set multi-warehouse routing defaults, adjust stock threshold rules, and inspect microservice telemetry.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Accent Color & Theme Customization */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Palette size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)' }}>
              Console Visual Identity & Color Theme
            </h3>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${isSelected ? c.hex : 'var(--glass-border)'}`,
                      background: 'var(--glass-bg)',
                      backdropFilter: 'var(--glass-blur)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all var(--transition)',
                      boxShadow: isSelected ? `0 0 16px ${c.hex}50` : 'var(--glass-highlight)',
                    }}
                  >
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: c.hex, display: 'inline-block', boxShadow: `0 0 6px ${c.hex}` }} />
                    <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: 'var(--c-text-1)' }}>
                      {c.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 18 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)' }}>Global Theme Mode</div>
              <div style={{ fontSize: 12, color: 'var(--c-text-3)' }}>Current: {theme.toUpperCase()}</div>
            </div>
            <button
              onClick={toggleTheme}
              className="glass-btn"
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>

        {/* Warehouse & Inventory Thresholds */}
        <div className="glass-panel" style={{ padding: '26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Warehouse size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)' }}>
              Fulfillment & Warehouse Configuration
            </h3>
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Default Dispatch Warehouse:
            </label>
            <select
              value={customization.defaultWarehouse}
              onChange={(e) => {
                updateCustomization({ defaultWarehouse: e.target.value });
                showSaveToast();
              }}
              className="glass-input"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
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
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Low Stock Alert Threshold:
              </label>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
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
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--c-text-3)', marginTop: 6 }}>
              <span>5 units (Strict)</span>
              <span>50 units</span>
              <span>100 units (High buffer)</span>
            </div>
          </div>
        </div>

        {/* Telemetry & Outbox Architecture Monitoring */}
        <div className="glass-panel" style={{ padding: '26px', gridColumn: '1/-1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Radio size={20} color="var(--accent)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)' }}>
              Distributed Kafka Topics & Event Stream Topology
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { topic: 'order.events', producer: 'order-service', consumer: 'inventory, payment, notification', events: 'ORDER_CREATED, ORDER_SHIPPED, ORDER_DELIVERED' },
              { topic: 'inventory.events', producer: 'inventory-service', consumer: 'order-service (Saga)', events: 'INVENTORY_RESERVED, INVENTORY_RELEASED, INVENTORY_DEDUCTED' },
              { topic: 'payment.events', producer: 'payment-service', consumer: 'order-service (Saga)', events: 'PAYMENT_COMPLETED, PAYMENT_FAILED' },
              { topic: 'notification.events', producer: 'order, inventory', consumer: 'notification-service', events: 'EMAIL_DISPATCH, AUDIT_LOG' },
            ].map((t) => (
              <div
                key={t.topic}
                className="glass-panel-hover"
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--glass-highlight)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <code style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{t.topic}</code>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--success)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
                    ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--c-text-2)' }}>
                  <strong>Producer:</strong> {t.producer}
                </div>
                <div style={{ fontSize: 12, color: 'var(--c-text-2)', marginTop: 3 }}>
                  <strong>Consumers:</strong> {t.consumer}
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 10, fontFamily: 'monospace' }}>
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
