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
  ExternalLink,
  Sparkles
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
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: 270,
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRight: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--r-md)',
                background: 'linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px var(--accent-glow)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--c-text-1)', letterSpacing: '0.04em' }}>
                  LUMÉ
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--accent)',
                    background: 'var(--accent-light)',
                    padding: '1px 6px',
                    borderRadius: 'var(--r-full)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  OPS
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text-3)', fontWeight: 600, letterSpacing: '0.06em' }}>
                AERO ENTERPRISE CONSOLE
              </div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ padding: '16px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--c-text-2)',
                  background: isActive
                    ? 'linear-gradient(135deg, var(--accent) 0%, #1D4ED8 100%)'
                    : 'transparent',
                  border: isActive ? '1px solid rgba(255,255,255,0.25)' : '1px solid transparent',
                  transition: 'all var(--transition)',
                  boxShadow: isActive ? '0 6px 18px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
                }}
                className={!isActive ? 'glass-panel-hover' : ''}
              >
                <Icon size={18} color={isActive ? '#FFFFFF' : 'var(--c-text-2)'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Kafka Saga Telemetry Aero Badge */}
        <div
          style={{
            padding: '14px 16px',
            margin: '12px 14px',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-highlight)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--success)',
                display: 'inline-block',
                boxShadow: '0 0 8px var(--success)',
              }}
            />
            <span>KAFKA SAGA ENGINE</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 4, lineHeight: 1.4 }}>
            Sub-second distributed locks & event stream telemetry active
          </div>
        </div>

        {/* User Card & Sign Out */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--glass-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                border: '1px solid var(--accent)',
                boxShadow: '0 0 10px var(--accent-glow)',
              }}
            >
              {user?.firstName?.[0] || 'L'}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--c-text-3)', fontFamily: 'monospace' }}>
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
              padding: 8,
              borderRadius: 'var(--r-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background var(--transition)',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            height: 64,
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
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
              color: 'var(--c-text-1)',
              cursor: 'pointer',
              padding: 6,
            }}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Fulfillment Hub:
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent)',
                background: 'var(--accent-light)',
                padding: '3px 10px',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border-subtle)',
              }}
            >
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
                padding: '7px 14px',
                borderRadius: 'var(--r-full)',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--glass-highlight)',
                color: 'var(--c-text-2)',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all var(--transition)',
              }}
            >
              <span>Customer Storefront</span>
              <ExternalLink size={12} />
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: '1px solid var(--glass-border)',
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                boxShadow: 'var(--glass-highlight)',
                color: 'var(--c-text-2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition)',
              }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <main
          style={{
            flex: 1,
            padding: '28px',
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 100,
          }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: 290,
              height: '100%',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              borderRight: '1px solid var(--glass-border)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--glass-shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--r-md)',
                    background: 'linear-gradient(135deg, var(--accent) 0%, #06b6d4 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--c-text-1)', letterSpacing: '0.04em' }}>
                  LUMÉ <span style={{ color: 'var(--accent)' }}>OPS</span>
                </span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    color: location.pathname === item.href ? '#fff' : 'var(--c-text-2)',
                    background: location.pathname === item.href ? 'linear-gradient(135deg, var(--accent) 0%, #1D4ED8 100%)' : 'transparent',
                    boxShadow: location.pathname === item.href ? '0 4px 14px var(--accent-glow)' : 'none',
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
