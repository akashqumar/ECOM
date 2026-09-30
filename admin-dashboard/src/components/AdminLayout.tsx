import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Package,
  Settings,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Activity,
  Layers,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, theme, toggleTheme, customization } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Orders & Fulfillment', href: '/orders', icon: ClipboardList },
    { label: 'Inventory Control', href: '/inventory', icon: Boxes },
    { label: 'Product Catalog', href: '/products', icon: Package },
    { label: 'System & Customization', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: 260,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          flexShrink: 0,
          zIndex: 40,
        }}
        className="admin-desktop-sidebar"
      >
        {/* Brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px var(--accent-glow)',
              }}
            >
              <ShieldCheck size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Aura<span style={{ color: 'var(--accent)' }}>Ops</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                ENTERPRISE CONSOLE
              </div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent)' : 'transparent',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 12px var(--accent-glow)' : 'none',
                }}
              >
                <Icon size={17} color={isActive ? '#fff' : 'var(--text-secondary)'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Kafka Saga Telemetry Badge */}
        <div style={{ padding: '16px', margin: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            <span>KAFKA SAGA ENGINE ACTIVE</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Sub-second distributed lock & outbox telemetry
          </div>
        </div>

        {/* User Card & Sign Out */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                border: '1px solid var(--accent)',
              }}
            >
              {user?.firstName?.[0] || 'A'}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--danger)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <header
          style={{
            height: 60,
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="admin-mobile-menu-btn"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <Menu size={22} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Console Location:
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 6 }}>
              {customization.defaultWarehouse}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Link to storefront */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span>Customer Storefront</span>
              <ExternalLink size={12} />
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <main style={{ flex: 1, padding: '28px', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            zIndex: 100,
          }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: 280,
              height: '100%',
              background: 'var(--bg-secondary)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                Aura<span style={{ color: 'var(--accent)' }}>Ops</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    color: location.pathname === item.href ? '#fff' : 'var(--text-secondary)',
                    background: location.pathname === item.href ? 'var(--accent)' : 'transparent',
                  }}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .admin-desktop-sidebar { display: none !important; }
          .admin-mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  );
}
