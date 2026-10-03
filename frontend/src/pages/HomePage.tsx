import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useWishlist } from '../context/AppContext';
import { catalogApi } from '../services/api';
import { Product, Category } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  Heart, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Compass, 
  Layers, 
  Sliders, 
  Star,
  Check,
  Zap,
  Gift
} from 'lucide-react';

const AeroProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const isSaved = isWishlisted(product.id);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPct = hasDiscount 
    ? Math.round(((product.price - (product.discountPrice ?? 0)) / product.price) * 100) 
    : 0;

  return (
    <Link 
      to={`/products/${product.id}`}
      className="aero-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-glass-specular" />
      <div className="card-media">
        <img 
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'} 
          alt={product.name} 
          className="card-img" 
          loading="lazy" 
        />
        {hasDiscount && (
          <div className="card-discount-pill">
            −{discountPct}%
          </div>
        )}
        <button 
          className={`card-wishlist ${isHovered || isSaved ? 'visible' : ''} ${isSaved ? 'active' : ''}`}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            toggleWishlist(product);
          }}
        >
          <Heart size={16} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : 'currentColor'} />
        </button>
      </div>

      <div className="card-details">
        <div className="card-meta">
          <span className="card-brand">{product.brand || 'LUMÉ'}</span>
          <span className="card-rating">
            <Star size={12} fill="currentColor" color="var(--c-gold)" />
            {product.rating ? product.rating.toFixed(1) : '4.9'}
          </span>
        </div>
        <h3 className="card-title">{product.name}</h3>
        <div className="card-pricing">
          <span className="price-current">
            ${(product.discountPrice ?? product.price).toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="price-original">${product.price.toFixed(2)}</span>
          )}
        </div>

        <button 
          className={`card-btn-add ${added ? 'added' : ''}`}
          onClick={handleAddToCart}
          disabled={added}
        >
          {added ? (
            <>
              <Check size={14} />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>Quick Add</span>
            </>
          )}
        </button>
      </div>
    </Link>
  );
};

export default function HomePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [catRes, prodRes] = await Promise.all([
          catalogApi.getCategories(),
          catalogApi.getProducts({ size: 8 })
        ]);
        
        const catList = catRes.data || [];
        const prodList = prodRes.data?.content || [];
        
        setCategories(catList);
        setFeaturedProducts(prodList);
        if (prodList.length > 0) {
          setHeroProduct(prodList[0]);
        }
      } catch (err) {
        console.error('Failed to load home page catalog', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="home-container">
      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 64px;
          padding-bottom: 80px;
          position: relative;
        }

        /* 3D Glass Hero Section */
        .hero-wrap {
          max-width: 1360px;
          margin: 0 auto;
          width: 100%;
          padding: 24px 24px 0;
        }

        .hero-glass-canvas {
          position: relative;
          border-radius: var(--r-xl);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          padding: 64px 48px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 48px;
          align-items: center;
          min-height: 560px;
        }

        .hero-glass-canvas::before {
          content: '';
          position: absolute;
          top: -200px;
          right: -100px;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        .hero-glass-canvas::after {
          content: '';
          position: absolute;
          bottom: -150px;
          left: 10%;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
          z-index: 2;
        }

        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 14px rgba(0, 0, 0, 0.05);
          padding: 6px 16px;
          border-radius: var(--r-full);
          font-size: 13px;
          font-weight: 700;
          color: var(--c-accent-2);
          width: fit-content;
          letter-spacing: 0.02em;
        }

        [data-theme='dark'] .hero-badge-pill {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .hero-headline {
          font-size: clamp(38px, 4.5vw, 64px);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.08;
          color: var(--c-text-1);
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, #0F172A 30%, #2563EB 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        [data-theme='dark'] .hero-gradient-text {
          background: linear-gradient(135deg, #FFFFFF 30%, #38BDF8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subhead {
          font-size: 17px;
          color: var(--c-text-2);
          line-height: 1.6;
          max-width: 520px;
        }

        .hero-action-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .hero-primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border-radius: var(--r-full);
          background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 10px 25px -4px rgba(15, 23, 42, 0.35);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition);
        }

        [data-theme='dark'] .hero-primary-btn {
          background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
          color: #0F172A;
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 10px 30px -4px rgba(56, 189, 248, 0.45);
        }

        .hero-primary-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 16px 36px -6px rgba(37, 99, 235, 0.45);
        }

        .hero-secondary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 26px;
          border-radius: var(--r-full);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          color: var(--c-text-1);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .hero-secondary-btn:hover {
          transform: translateY(-2px);
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-hover);
          box-shadow: var(--glass-highlight), var(--shadow-md);
        }

        /* Hero Artwork & 3D Glass Showcase */
        .hero-right-art {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .hero-stage-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          border-radius: var(--r-xl);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.45) 100%);
          backdrop-filter: blur(28px) saturate(200%);
          -webkit-backdrop-filter: blur(28px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 
            inset 0 2px 1px 0 rgba(255, 255, 255, 1),
            0 24px 60px -10px rgba(15, 23, 42, 0.20),
            0 0 35px rgba(56, 189, 248, 0.20);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          animation: floatHeroCard 6s ease-in-out infinite alternate;
        }

        [data-theme='dark'] .hero-stage-card {
          background: linear-gradient(135deg, rgba(26, 36, 62, 0.82) 0%, rgba(14, 20, 36, 0.65) 100%);
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 
            inset 0 1.5px 0 0 rgba(255, 255, 255, 0.35),
            0 30px 70px -12px rgba(0, 0, 0, 0.8),
            0 0 40px rgba(56, 189, 248, 0.25);
        }

        .hero-stage-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 
            inset 0 2px 1px 0 rgba(255, 255, 255, 1),
            0 32px 70px -10px rgba(15, 23, 42, 0.3),
            0 0 45px rgba(56, 189, 248, 0.35);
        }

        @keyframes floatHeroCard {
          0% { transform: translateY(0); }
          100% { transform: translateY(-12px); }
        }

        .hero-product-img-wrap {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: var(--r-lg);
          overflow: hidden;
          background: rgba(255, 255, 255, 0.5);
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .hero-product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-stage-card:hover .hero-product-img {
          transform: scale(1.08);
        }

        /* Floating Aero Satellite Badges */
        .satellite-badge {
          position: absolute;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-full);
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--c-text-1);
          z-index: 10;
          pointer-events: none;
        }

        .satellite-1 {
          top: -16px;
          right: -20px;
          animation: floatOrb2 7s ease-in-out infinite alternate;
        }

        .satellite-2 {
          bottom: 20px;
          left: -32px;
          animation: floatOrb1 8s ease-in-out infinite alternate;
        }

        /* Marquee Ticker with Aero Glass Capsules */
        .marquee-section {
          overflow: hidden;
          padding: 12px 0;
          position: relative;
        }

        .marquee-track {
          display: flex;
          gap: 20px;
          width: max-content;
          animation: scrollMarquee 32s linear infinite;
        }

        .marquee-track:hover {
          animation-play-state: paused;
        }

        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), 0 2px 8px rgba(0, 0, 0, 0.04);
          padding: 10px 22px;
          border-radius: var(--r-full);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--c-text-1);
          white-space: nowrap;
        }

        /* Category Chips Bar */
        .category-row {
          max-width: 1360px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px;
        }

        .category-scroll-container {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 8px 4px 16px;
          scrollbar-width: none;
        }

        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .cat-bubble {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--r-full);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          color: var(--c-text-1);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition);
        }

        .cat-bubble:hover {
          transform: translateY(-2px);
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-hover);
          box-shadow: var(--glass-highlight), var(--glass-hover-shadow);
          color: var(--c-accent-2);
        }

        /* Section Layouts */
        .section-wrap {
          max-width: 1360px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .section-tagline {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--c-accent-2);
          margin-bottom: 4px;
        }

        .section-heading {
          font-size: clamp(24px, 3vw, 34px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--c-text-1);
        }

        .section-link-more {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: var(--c-accent-2);
          transition: transform var(--transition);
        }

        .section-link-more:hover {
          transform: translateX(4px);
        }

        .products-showcase-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        @media (max-width: 1100px) {
          .products-showcase-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hero-glass-canvas {
            grid-template-columns: 1fr;
            padding: 40px 24px;
          }
          .hero-right-art {
            margin-top: 16px;
          }
        }

        @media (max-width: 640px) {
          .products-showcase-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Aero Glass Product Card */
        .aero-card {
          position: relative;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          padding: 16px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          overflow: hidden;
          transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
        }

        .card-glass-specular {
          position: absolute;
          top: 0;
          left: -120%;
          width: 200%;
          height: 100%;
          background: linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.4) 45%, transparent 60%);
          pointer-events: none;
          transition: transform 0.8s ease;
          transform: translateX(-100%);
        }

        .aero-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--glass-hover-shadow), var(--glass-highlight);
          border-color: var(--glass-border-hover);
        }

        .aero-card:hover .card-glass-specular {
          transform: translateX(100%);
        }

        .card-media {
          position: relative;
          aspect-ratio: 1/1;
          border-radius: var(--r-lg);
          overflow: hidden;
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.5);
          margin-bottom: 16px;
        }

        [data-theme='dark'] .card-media {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .aero-card:hover .card-img {
          transform: scale(1.08);
        }

        .card-discount-pill {
          position: absolute;
          top: 10px;
          left: 10px;
          background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
          color: #FFFFFF;
          padding: 4px 10px;
          border-radius: var(--r-full);
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(220, 38, 38, 0.35);
        }

        .card-wishlist {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), 0 4px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--c-text-2);
          opacity: 0;
          transform: scale(0.85);
          transition: all var(--transition);
          cursor: pointer;
        }

        .card-wishlist.visible {
          opacity: 1;
          transform: scale(1);
        }

        .card-wishlist:hover {
          color: #EF4444;
          transform: scale(1.1);
        }

        .card-wishlist.active {
          opacity: 1;
          color: #EF4444;
          background: rgba(255, 255, 255, 0.95);
        }

        [data-theme='dark'] .card-wishlist.active {
          background: rgba(30, 41, 59, 0.95);
        }

        .card-details {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 6px;
        }

        .card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-brand {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--c-accent-2);
        }

        .card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--c-text-1);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 42px;
        }

        .card-pricing {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 4px;
          margin-bottom: 12px;
        }

        .price-current {
          font-size: 18px;
          font-weight: 800;
          color: var(--c-text-1);
        }

        .price-original {
          font-size: 13px;
          color: var(--c-text-3);
          text-decoration: line-through;
        }

        .card-btn-add {
          width: 100%;
          padding: 10px 16px;
          border-radius: var(--r-full);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 4px 12px rgba(15, 23, 42, 0.15);
          cursor: pointer;
          transition: all var(--transition);
        }

        [data-theme='dark'] .card-btn-add {
          background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
          color: #0F172A;
          font-weight: 700;
        }

        .card-btn-add:hover {
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 20px rgba(37, 99, 235, 0.35);
        }

        .card-btn-add.added {
          background: #10B981 !important;
          color: #FFFFFF !important;
        }

        /* Bento Artwork Grid */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }

        .bento-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          padding: 36px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          overflow: hidden;
          transition: all var(--transition);
        }

        .bento-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--glass-hover-shadow), var(--glass-highlight);
        }

        .bento-icon-box {
          width: 52px;
          height: 52px;
          border-radius: var(--r-md);
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 4px 14px rgba(37, 99, 235, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--c-accent-2);
        }

        .bento-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .bento-desc {
          font-size: 14px;
          color: var(--c-text-2);
          line-height: 1.6;
        }
      `}</style>

      {/* 3D Aero Glass Hero */}
      <section className="hero-wrap">
        <div className="hero-glass-canvas">
          <div className="hero-left">
            <div className="hero-badge-pill">
              <Sparkles size={14} />
              <span>THE NEW LUXURY STANDARD</span>
            </div>
            
            <h1 className="hero-headline">
              Refined by Art. <br />
              <span className="hero-gradient-text">Crafted in Glass.</span>
            </h1>

            <p className="hero-subhead">
              Step into an elevated shopping universe. Discover museum-grade hardware, timeless wearable tech, and curated lifestyle essentials designed for visionaries.
            </p>

            <div className="hero-action-row">
              <button 
                className="hero-primary-btn"
                onClick={() => navigate('/products')}
              >
                <span>Explore Catalog</span>
                <ArrowRight size={16} />
              </button>

              <button 
                className="hero-secondary-btn"
                onClick={() => navigate('/products?sort=createdAt,desc')}
              >
                <Zap size={16} color="var(--c-accent-2)" />
                <span>New Drops</span>
              </button>
            </div>
          </div>

          <div className="hero-right-art">
            <div className="hero-stage-card">
              <div className="satellite-badge satellite-1">
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <span>Top Rated Flagship</span>
              </div>

              <div className="satellite-badge satellite-2">
                <ShieldCheck size={14} color="#10B981" />
                <span>Verified Authentic</span>
              </div>

              <div className="hero-product-img-wrap">
                <img 
                  src={heroProduct?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'} 
                  alt={heroProduct?.name || 'Curated Signature'} 
                  className="hero-product-img"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--c-accent-2)' }}>
                    {heroProduct?.brand || 'SIGNATURE EDITION'}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text-1)', marginTop: 2 }}>
                    {heroProduct?.name || 'Titan Watch Ultra Titanium'}
                  </div>
                </div>

                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-1)' }}>
                  ${(heroProduct?.discountPrice ?? heroProduct?.price ?? 749).toFixed(2)}
                </div>
              </div>

              <button 
                className="hero-primary-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
                onClick={() => heroProduct ? navigate(`/products/${heroProduct.id}`) : navigate('/products')}
              >
                <ShoppingBag size={16} />
                <span>Inspect Piece</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <section className="marquee-section">
        <div className="marquee-track">
          {[
            '✨ WINDOWS AERO FROSTED PANELS',
            '💎 CURATED FLAGSHIP RELEASES',
            '🚀 COMPLIMENTARY EXPEDITED SHIPPING OVER $75',
            '🛡️ 100% AUTHENTICITY ASSURANCE',
            '⚡ ZERO-DELAY WORLDWIDE COURIER',
            '✨ WINDOWS AERO FROSTED PANELS',
            '💎 CURATED FLAGSHIP RELEASES',
            '🚀 COMPLIMENTARY EXPEDITED SHIPPING OVER $75',
            '🛡️ 100% AUTHENTICITY ASSURANCE',
            '⚡ ZERO-DELAY WORLDWIDE COURIER'
          ].map((text, i) => (
            <div key={i} className="marquee-pill">
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* Category Scroll Row */}
      <section className="category-row">
        <div className="category-scroll-container">
          <button className="cat-bubble" onClick={() => navigate('/products')}>
            <Compass size={16} color="var(--c-accent-2)" />
            <span>All Collections</span>
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              className="cat-bubble"
              onClick={() => navigate(`/products?categoryId=${cat.id}`)}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="section-wrap">
        <div className="section-header-row">
          <div>
            <div className="section-tagline">CURATED HIGHLIGHTS</div>
            <h2 className="section-heading">Featured Collection</h2>
          </div>
          <Link to="/products" className="section-link-more">
            <span>View All Pieces</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="products-showcase-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aero-card" style={{ height: 360 }}>
                <div className="skeleton" style={{ width: '100%', height: 200, marginBottom: 16 }} />
                <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '80%', height: 16, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: '30%', height: 18 }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="products-showcase-grid">
            {featuredProducts.map(p => (
              <AeroProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Bento Showcase Art Section */}
      <section className="section-wrap">
        <div className="section-header-row">
          <div>
            <div className="section-tagline">THE LUMÉ PROMISE</div>
            <h2 className="section-heading">Precision in Every Layer</h2>
          </div>
        </div>

        <div className="bento-grid">
          <div className="bento-card">
            <div className="bento-icon-box">
              <Truck size={24} />
            </div>
            <h3 className="bento-title">Priority Air Delivery</h3>
            <p className="bento-desc">
              Global express fulfillment backed by insured door-to-door tracking. Every parcel arrives in tamper-evident sealed luxury packaging.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-box">
              <RotateCcw size={24} />
            </div>
            <h3 className="bento-title">30-Day Effortless Returns</h3>
            <p className="bento-desc">
              Experience any item in the comfort of your home. If it doesn't surpass your expectations, return it with our prepaid return courier.
            </p>
          </div>

          <div className="bento-card">
            <div className="bento-icon-box">
              <ShieldCheck size={24} />
            </div>
            <h3 className="bento-title">Certified Hardware Authenticity</h3>
            <p className="bento-desc">
              Direct-from-manufacturer sourcing guarantees valid international serials, zero grey-market units, and full manufacturer warranty coverage.
            </p>
          </div>
        </div>
      </section>

      {/* Lumé Digital Gift Card Banner Section */}
      <section className="section-wrap" style={{ marginTop: '24px' }}>
        <div style={{
          position: 'relative',
          borderRadius: 'var(--r-xl)',
          background: 'linear-gradient(135deg, rgba(230, 200, 140, 0.22) 0%, rgba(196, 151, 74, 0.08) 100%)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid rgba(196, 151, 74, 0.3)',
          boxShadow: 'var(--glass-highlight), var(--shadow-sm)',
          padding: '48px 36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--c-accent-2)',
              background: 'rgba(196, 151, 74, 0.15)',
              padding: '6px 14px',
              borderRadius: 'var(--r-full)',
              marginBottom: '16px'
            }}>
              <Gift size={14} />
              <span>THE ART OF GIVING</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 38px)',
              fontWeight: 800,
              color: 'var(--c-text-1)',
              letterSpacing: '-0.02em',
              margin: '0 0 14px'
            }}>
              Lumé Digital Gift Card
            </h2>

            <p style={{
              fontSize: '15px',
              color: 'var(--c-text-2)',
              lineHeight: 1.6,
              margin: '0 0 24px',
              maxWidth: '480px'
            }}>
              The quintessential gesture of refined style. Sent straight to their inbox with customized greetings, redeemable immediately across all collections with zero expiration.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/gift-cards" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: 'var(--r-full)',
                background: 'var(--c-accent)',
                color: 'var(--c-accent-fg)',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
              }}>
                <span>Send a Digital Gift</span>
                <ArrowRight size={16} />
              </Link>

              <Link to="/gift-cards" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 24px',
                borderRadius: 'var(--r-full)',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--c-text-1)',
                fontWeight: 600,
                fontSize: '14px',
                textDecoration: 'none'
              }}>
                <span>Check Balance</span>
              </Link>
            </div>
          </div>

          {/* Interactive Aero Gift Card Visual Preview */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '380px',
              aspectRatio: '1.6 / 1',
              borderRadius: 'var(--r-xl)',
              background: 'linear-gradient(135deg, rgba(230, 200, 140, 0.9) 0%, rgba(196, 151, 74, 0.8) 100%)',
              color: '#1A1915',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-80%',
                width: '200%',
                height: '100%',
                background: 'linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.45) 45%, transparent 60%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, letterSpacing: '0.12em', fontSize: '14px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1A1915' }} />
                  <span>LUMÉ</span>
                </div>
                <Gift size={20} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '38px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  $100
                </div>
                <div style={{ fontSize: '10px', letterSpacing: '0.14em', fontWeight: 700, opacity: 0.8, marginTop: '4px' }}>
                  DIGITAL GIFT CERTIFICATE
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px', fontWeight: 600 }}>
                <div>
                  <div style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '0.08em' }}>FOR</div>
                  <span>Someone Special</span>
                </div>
                <div>
                  <div style={{ fontSize: '9px', opacity: 0.7, letterSpacing: '0.08em' }}>CODE</div>
                  <span style={{ fontFamily: 'monospace' }}>LUME-2026-GOLD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
