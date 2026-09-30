import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3x3, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/AppContext';

export default function MobileTabBar() {
  const location = useLocation();
  const { itemCount } = useCart();
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  return (
    <>
      <div className="mobile-tab-bar show-on-mobile" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(64px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--c-surface-overlay)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--c-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 200
      }}>
        <TabItem to="/" icon={<Home size={22} />} label="Home" active={isActive('/')} />
        <TabItem to="/products" icon={<Grid3x3 size={22} />} label="Shop" active={isActive('/products')} />
        <TabItem 
          to="/cart" 
          icon={
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={22} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-8px',
                  background: 'var(--c-accent-2)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  height: '16px',
                  minWidth: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  border: '1px solid var(--c-surface)'
                }}>
                  {itemCount}
                </span>
              )}
            </div>
          } 
          label="Cart" 
          active={isActive('/cart')} 
        />
        <TabItem to="/profile" icon={<User size={22} />} label="Account" active={isActive('/profile') || isActive('/login') || isActive('/orders')} />
      </div>
    </>
  );
}

function TabItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      color: active ? 'var(--c-accent)' : 'var(--c-text-3)',
      flex: 1,
      height: '100%',
      position: 'relative'
    }}>
      {active && (
        <div style={{
          position: 'absolute',
          top: '8px',
          width: '32px',
          height: '32px',
          background: 'var(--c-surface-raised)',
          borderRadius: '16px',
          zIndex: -1
        }} />
      )}
      <div style={{ transition: 'transform 0.2s ease', transform: active ? 'translateY(-2px)' : 'none' }}>
        {icon}
      </div>
      <span style={{ 
        fontSize: '10px', 
        fontWeight: active ? 600 : 500,
        transition: 'color 0.2s ease'
      }}>
        {label}
      </span>
    </Link>
  );
}
