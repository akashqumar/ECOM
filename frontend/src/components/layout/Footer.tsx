import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, MessageCircle, Rss } from 'lucide-react';
import { useAuth } from '../../context/AppContext';

export default function Footer() {
  const { user, logout } = useAuth();

  return (
    <footer style={{
      background: 'var(--c-bg-alt)',
      borderTop: '1px solid var(--c-border)',
      paddingTop: '64px',
      paddingBottom: '32px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <div className="footer-grid">
          {/* Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--c-accent-2)' }} />
              <span style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--c-text-1)' }}>LUMÉ</span>
            </Link>
            <p style={{ fontSize: '14px', color: 'var(--c-text-2)', lineHeight: 1.6, maxWidth: '240px' }}>
              Curated fashion & lifestyle for the modern individual.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <a href="#" aria-label="Social" style={{ color: 'var(--c-text-2)' }} className="social-link"><Globe size={20} /></a>
              <a href="#" aria-label="Video" style={{ color: 'var(--c-text-2)' }} className="social-link"><Rss size={20} /></a>
              <a href="#" aria-label="Messages" style={{ color: 'var(--c-text-2)' }} className="social-link"><MessageCircle size={20} /></a>
            </div>
          </div>

          {/* Shop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop</h4>
            <Link to="/products" className="footer-link">All Products</Link>
            <Link to="/new-arrivals" className="footer-link">New Arrivals</Link>
            <Link to="/sale" className="footer-link">Sale</Link>
            <Link to="/gift-cards" className="footer-link">Gift Cards</Link>
          </div>

          {/* Help */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Help</h4>
            <Link to="/faq" className="footer-link">FAQ</Link>
            <Link to="/shipping-returns" className="footer-link">Shipping & Returns</Link>
            <Link to="/size-guide" className="footer-link">Size Guide</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
          </div>

          {/* Account */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text-1)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</h4>
            {!user ? (
              <Link to="/login" className="footer-link">Sign In</Link>
            ) : (
              <button 
                onClick={logout} 
                className="footer-link" 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  textAlign: 'left', 
                  cursor: 'pointer',
                  color: 'var(--c-text-2)'
                }}
              >
                Sign Out ({user.firstName})
              </button>
            )}
            <Link to="/orders" className="footer-link">My Orders</Link>
            <Link to="/profile" className="footer-link">Profile</Link>
            <Link to="/wishlist" className="footer-link">Wishlist</Link>
          </div>
        </div>

        <div style={{
          marginTop: '64px',
          paddingTop: '24px',
          borderTop: '1px solid var(--c-border-subtle)',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ fontSize: '13px', color: 'var(--c-text-3)' }}>
            © 2026 Lumé. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link to="/privacy" className="footer-link" style={{ fontSize: '13px' }}>Privacy Policy</Link>
            <Link to="/terms" className="footer-link" style={{ fontSize: '13px' }}>Terms of Service</Link>
            <Link to="/faq" className="footer-link" style={{ fontSize: '13px' }}>Cookie Preferences</Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .footer-link {
          font-size: 14px;
          color: var(--c-text-2);
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: var(--c-text-1);
        }
        .social-link {
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .social-link:hover {
          color: var(--c-text-1);
          transform: translateY(-2px);
        }
        
        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            row-gap: 48px;
          }
        }
        @media (max-width: 576px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
}
