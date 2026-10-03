import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileTabBar from './components/layout/MobileTabBar';
import ScrollToTop from './components/common/ScrollToTop';
import GlassCartDrawer from './components/cart/GlassCartDrawer';

// Lazy loading pages
const HomePage = React.lazy(() => import('./pages/HomePage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const CartPage = React.lazy(() => import('./pages/CartPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const FAQPage = React.lazy(() => import('./pages/FAQPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const ShippingReturnsPage = React.lazy(() => import('./pages/ShippingReturnsPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const SizeGuidePage = React.lazy(() => import('./pages/SizeGuidePage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const GiftCardsPage = React.lazy(() => import('./pages/GiftCardsPage').catch(() => ({ default: () => <div>Page Not Found</div> })));
const LegalPage = React.lazy(() => import('./pages/LegalPage').catch(() => ({ default: () => <div>Page Not Found</div> })));

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <div style={{
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: '2px solid var(--c-border)',
      borderTopColor: 'var(--c-accent-2)',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

function App() {
  return (
    <>
      <div className="aero-background" aria-hidden="true">
        <div className="aero-orb orb-1" />
        <div className="aero-orb orb-2" />
        <div className="aero-orb orb-3" />
        <div className="aero-orb orb-4" />
      </div>
      <ScrollToTop />
      <Header />
      <GlassCartDrawer />
      <main style={{ 
        paddingTop: 'var(--header-height, 64px)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'stretch',
        flex: '1 0 auto'
      }} className="app-main-layout">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage mode="all" />} />
            <Route path="/new-arrivals" element={<ProductsPage mode="new" />} />
            <Route path="/sale" element={<ProductsPage mode="sale" />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/gift-cards" element={<GiftCardsPage />} />
            <Route path="/privacy" element={<LegalPage type="privacy" />} />
            <Route path="/privacy-policy" element={<LegalPage type="privacy" />} />
            <Route path="/terms" element={<LegalPage type="terms" />} />
            <Route path="/terms-of-service" element={<LegalPage type="terms" />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MobileTabBar />
      
      <style>{`
        .app-main-layout {
          overflow-x: clip;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .app-main-layout {
            padding-top: 56px !important;
            padding-bottom: calc(76px + env(safe-area-inset-bottom)) !important;
          }
        }
      `}</style>
    </>
  );
}

export default App;
