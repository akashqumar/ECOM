import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { catalogApi } from '../services/api';
import { useCart, useWishlist, useToast } from '../context/AppContext';
import { Product } from '../types';
import { 
  Heart, 
  Minus, 
  Plus, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronDown,
  ChevronUp,
  Check,
  ChevronRight,
  Maximize2,
  Minimize2,
  Star,
  Zap,
  Flame,
  Sparkles,
  Shield,
  ZoomIn,
  X,
  ShoppingBag
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams<{ productId?: string; id?: string }>();
  const id = params.productId || params.id;
  const navigate = useNavigate();
  const { cart, addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState(0);
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>('cover');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('Obsidian');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [addedQuantity, setAddedQuantity] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('details');
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await catalogApi.getProductById(id);
        const data = res.data;
        setProduct(data);

        if (data?.categoryId) {
          const relatedRes = await catalogApi.getProducts({ categoryId: data.categoryId, size: 5 });
          setRelatedProducts((relatedRes.data?.content || []).filter((p: Product) => p.id !== id).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    if (!product || isAdding) return;
    
    setIsAdding(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        images: images,
        sku: product.sku || `SKU-${product.id.slice(0, 8)}`
      }, quantity);
      
      setAddSuccess(true);
      showToast(`Added ${quantity} × "${product.name}" to your shopping bag.`, 'success', 'Bag Updated');
      setTimeout(() => {
        setAddSuccess(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to add to cart', err);
      showToast(`Could not add "${product.name}" to bag.`, 'error', 'Error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || isBuyingNow) return;
    setIsBuyingNow(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        images: images,
        sku: product.sku || `SKU-${product.id.slice(0, 8)}`
      }, quantity);
      navigate('/checkout');
    } catch (err) {
      console.error('Failed to buy now', err);
      showToast('Could not initiate checkout.', 'error');
    } finally {
      setIsBuyingNow(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="pdp-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto', width: 32, height: 32, border: '3px solid var(--c-border)', borderTopColor: 'var(--c-text-1)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <Link to="/products" style={{ color: 'var(--c-text-2)', marginTop: '16px', display: 'inline-block' }}>Back to Products</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['https://via.placeholder.com/800x800?text=Lumé'];
  const discountPercent = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="pdp-container">
      <style>{`
        .pdp-container {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
          box-sizing: border-box;
        }

        .pdp-layout {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 40px;
          align-items: start;
          box-sizing: border-box;
        }
        @media (min-width: 900px) {
          .pdp-layout {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
            gap: 48px;
            align-items: start;
          }
        }

        .image-col {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-self: start;
          height: fit-content;
          box-sizing: border-box;
        }
        @media (min-width: 900px) {
          .image-col {
            position: sticky;
            top: 96px;
            align-self: start;
            height: fit-content;
          }
        }

        .main-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          height: auto;
          max-height: 560px;
          flex-shrink: 0;
          background: var(--c-surface);
          border-radius: var(--r-xl);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          padding: 24px;
          box-sizing: border-box;
          transition: all var(--transition);
        }
        .main-image-wrap.mode-cover {
          padding: 0;
        }

        /* Ambient frosted matching background to seamlessly cover whole panel */
        .ambient-backdrop-img {
          position: absolute;
          inset: -32px;
          width: calc(100% + 64px);
          height: calc(100% + 64px);
          object-fit: cover;
          filter: blur(36px) saturate(190%) brightness(0.7);
          opacity: 0.85;
          transform: scale(1.15);
          pointer-events: none;
          z-index: 1;
          transition: opacity 0.4s ease, filter 0.4s ease;
        }
        [data-theme='dark'] .ambient-backdrop-img {
          filter: blur(40px) saturate(200%) brightness(0.4);
          opacity: 0.9;
        }
        .ambient-backdrop-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.08) 0%, rgba(0, 0, 0, 0.35) 100%);
          pointer-events: none;
          z-index: 2;
        }
        [data-theme='dark'] .ambient-backdrop-overlay {
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.55) 100%);
        }

        .main-image {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.35));
        }
        .main-image-wrap.mode-cover .main-image {
          object-fit: cover;
          filter: none;
          transform: scale(1.02);
        }
        .main-image-wrap.mode-cover:hover .main-image {
          transform: scale(1.08);
        }
        .main-image-wrap.mode-contain:hover .main-image {
          transform: scale(1.04);
        }

        .image-fit-toggle {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 4;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          width: 34px;
          height: 34px;
          border-radius: var(--r-full);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        .image-fit-toggle:hover {
          background: rgba(15, 23, 42, 0.85);
          transform: scale(1.08);
          border-color: rgba(255, 255, 255, 0.45);
        }

        .thumbnail-strip {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none;
        }
        .thumbnail-strip::-webkit-scrollbar {
          display: none;
        }
        .thumbnail-btn {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          border-radius: var(--r-md);
          border: 2px solid transparent;
          overflow: hidden;
          cursor: pointer;
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          transition: all var(--transition);
        }
        .thumbnail-btn.active {
          border-color: var(--c-accent-2);
          box-shadow: var(--glass-highlight), 0 0 12px rgba(37, 99, 235, 0.4);
          transform: translateY(-2px);
        }
        .thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info-col {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-self: start;
          height: fit-content;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          padding: 32px;
          box-sizing: border-box;
        }

        .product-brand {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--c-text-3);
          font-weight: 500;
          margin-bottom: 8px;
        }
        .product-title {
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--c-text-1);
          margin-bottom: 16px;
          line-height: 1.2;
        }
        
        .price-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .price {
          font-size: 24px;
          font-weight: 700;
          color: var(--c-text-1);
        }
        .old-price {
          font-size: 16px;
          color: var(--c-text-3);
          text-decoration: line-through;
        }
        .savings-badge {
          background: var(--c-success);
          color: #fff;
          padding: 4px 8px;
          border-radius: var(--r-sm);
          font-size: 12px;
          font-weight: 600;
        }

        .divider {
          height: 1px;
          background: var(--c-border-subtle);
          margin: 24px 0;
          width: 100%;
        }

        .description {
          font-size: 15px;
          line-height: 1.65;
          color: var(--c-text-2);
          margin-bottom: 24px;
        }
        .desc-text {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .desc-text.clamped {
          -webkit-line-clamp: 4;
        }
        .show-more-btn {
          background: transparent;
          border: none;
          color: var(--c-text-1);
          font-size: 14px;
          font-weight: 500;
          text-decoration: underline;
          cursor: pointer;
          margin-top: 8px;
          padding: 0;
        }

        .actions-row {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .qty-selector {
          display: inline-flex;
          align-items: center;
          border: 1px solid var(--c-border);
          border-radius: var(--r-full);
          padding: 4px;
          width: fit-content;
        }
        .qty-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--c-text-1);
          cursor: pointer;
          transition: background var(--transition);
        }
        .qty-btn:hover {
          background: var(--c-surface-raised);
        }
        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .qty-value {
          width: 40px;
          text-align: center;
          font-size: 15px;
          font-weight: 500;
          color: var(--c-text-1);
        }

        .add-to-bag-main {
          width: 100%;
          height: 52px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity var(--transition);
        }
        .add-to-bag-main:hover {
          opacity: 0.9;
        }
        .add-to-bag-main.in-bag {
          background: var(--c-surface-raised);
          color: var(--c-text-1);
          border: 1px solid var(--c-border);
        }
        .add-to-bag-main.in-bag:hover {
          background: var(--c-accent);
          color: var(--c-accent-fg);
        }
        .add-to-bag-main:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .wishlist-main {
          width: 100%;
          height: 52px;
          border-radius: var(--r-full);
          background: transparent;
          color: var(--c-text-1);
          border: 1px solid var(--c-border);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all var(--transition);
        }
        .wishlist-main:hover {
          border-color: var(--c-text-1);
        }
        .wishlist-main.active {
          border-color: var(--c-error);
          color: var(--c-error);
        }

        .trust-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 0;
          border-top: 1px solid var(--c-border-subtle);
          border-bottom: 1px solid var(--c-border-subtle);
          margin-bottom: 32px;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--c-text-3);
          font-size: 12px;
        }
        @media (max-width: 600px) {
          .trust-item span {
            display: none;
          }
        }

        .accordion {
          display: flex;
          flex-direction: column;
        }
        .accordion-item {
          border-bottom: 1px solid var(--c-border-subtle);
        }
        .accordion-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0;
          background: transparent;
          border: none;
          font-size: 15px;
          font-weight: 500;
          color: var(--c-text-1);
          cursor: pointer;
        }
        .accordion-content {
          padding-bottom: 20px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--c-text-2);
          display: none;
        }
        .accordion-content.open {
          display: block;
          animation: slideDown 0.3s ease-out;
        }

        .related-section {
          margin-top: 80px;
          border-top: 1px solid var(--c-border-subtle);
          padding-top: 64px;
        }
        .related-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--c-text-1);
          margin-bottom: 32px;
          text-align: center;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }
        @media (min-width: 900px) {
          .related-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 32px;
          }
        }
        @media (max-width: 640px) {
          .pdp-container {
            padding: 16px 14px !important;
          }
          .pdp-layout {
            gap: 24px !important;
          }
          .info-col {
            padding: 22px 18px !important;
          }
          .related-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .pdp-breadcrumb {
          font-size: 13px;
          color: var(--c-text-3);
          margin-bottom: 28px;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 18px;
          border-radius: var(--r-full);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          width: fit-content;
          max-width: 100%;
          overflow-x: auto;
          white-space: nowrap;
          box-sizing: border-box;
        }
        .crumb-link {
          color: var(--c-text-2);
          text-decoration: none;
          font-weight: 500;
          transition: color var(--transition);
        }
        .crumb-link:hover {
          color: var(--c-accent-2);
        }
        .crumb-sep {
          color: var(--c-text-3);
          opacity: 0.5;
          flex-shrink: 0;
        }
        .crumb-current {
          color: var(--c-text-1);
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 320px;
        }

        .rel-card {
          text-decoration: none;
          color: inherit;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          padding: 16px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rel-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--glass-shadow), 0 12px 28px rgba(0, 0, 0, 0.15);
          border-color: var(--glass-border-hover);
        }
        .rel-img-wrap {
          aspect-ratio: 1/1;
          border-radius: var(--r-md);
          overflow: hidden;
          background: var(--glass-bg);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
        }
        .rel-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.4s ease;
        }
        .rel-card:hover .rel-img {
          transform: scale(1.06);
        }
        .rel-brand {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--c-accent-2);
          margin-bottom: 4px;
        }
        .rel-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--c-text-1);
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rel-price {
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text-1);
        }
      `}</style>

      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="crumb-link">Home</Link>
        <ChevronRight size={13} className="crumb-sep" />
        <Link to="/products" className="crumb-link">Products</Link>
        {product.categoryName && (
          <>
            <ChevronRight size={13} className="crumb-sep" />
            <Link to={`/products?categoryId=${product.categoryId}`} className="crumb-link">{product.categoryName}</Link>
          </>
        )}
        <ChevronRight size={13} className="crumb-sep" />
        <span className="crumb-current">{product.name}</span>
      </nav>

      <div className="pdp-layout">
        <div className="image-col">
          <div className={`main-image-wrap ${imageFitMode === 'cover' ? 'mode-cover' : 'mode-contain'}`}>
            {/* Ambient frosted matching background to seamlessly cover whole panel */}
            <img 
              src={images[activeImage]} 
              alt="" 
              aria-hidden="true" 
              className="ambient-backdrop-img" 
            />
            <div className="ambient-backdrop-overlay" />

            {/* Main product photo */}
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="main-image" 
            />

            {/* Toggle between fit with ambient blur vs full bleed cover */}
            <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 4, display: 'flex', gap: 8 }}>
              <button 
                type="button" 
                className="image-fit-toggle"
                onClick={() => setIsZoomOpen(true)}
                title="Fullscreen Image Zoom"
                aria-label="Fullscreen Image Zoom"
              >
                <ZoomIn size={16} />
              </button>
              <button 
                type="button" 
                className="image-fit-toggle"
                onClick={() => setImageFitMode(prev => prev === 'contain' ? 'cover' : 'contain')}
                title={imageFitMode === 'cover' ? 'Zoom out to fit full photo' : 'Zoom in to fill panel'}
                aria-label={imageFitMode === 'cover' ? 'Zoom out to fit full photo' : 'Zoom in to fill panel'}
              >
                {imageFitMode === 'cover' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-strip">
              {images.map((img, idx) => (
                <button 
                  key={idx}
                  className={`thumbnail-btn ${activeImage === idx ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="thumbnail-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="info-col">
          <div className="product-brand">{product.brand || 'Lumé'}</div>
          <h1 className="product-title">{product.name}</h1>
          
          <div className="price-row">
            <span className="price">${(product.discountPrice ?? product.price).toFixed(2)}</span>
            {product.discountPrice && product.discountPrice < product.price && (
              <>
                <span className="old-price">${product.price.toFixed(2)}</span>
                {discountPercent > 0 && (
                  <span className="savings-badge">Save {discountPercent}%</span>
                )}
              </>
            )}
          </div>

          {/* Stock Indicator & Delivery Estimate */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '10px 14px',
            borderRadius: 'var(--r-md)',
            background: 'var(--c-bg-alt)',
            border: '1px solid var(--c-border-subtle)',
            fontSize: 12,
            marginTop: 12,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-success)', fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-success)', display: 'inline-block' }} />
              In Stock &bull; Ready to Ship
            </span>
            <span style={{ color: 'var(--c-text-3)' }}>•</span>
            <span style={{ color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Truck size={13} color="var(--c-accent-2)" /> Est. Delivery: <strong>2-3 Business Days</strong>
            </span>
          </div>

          {/* Color Variants */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-2)', marginBottom: 8 }}>
              Color Finish: <strong style={{ color: 'var(--c-text-1)' }}>{selectedColor}</strong>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { name: 'Obsidian', hex: '#1C1917' },
                { name: 'Champagne Gold', hex: '#C4974A' },
                { name: 'Space Gray', hex: '#64748B' },
                { name: 'Pure White', hex: '#F8FAFC' },
              ].map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: c.hex,
                    border: selectedColor === c.name ? '2px solid var(--c-accent-2)' : '1px solid var(--c-border)',
                    boxShadow: selectedColor === c.name ? '0 0 0 2px var(--c-surface), 0 0 0 4px var(--c-accent-2)' : 'none',
                    cursor: 'pointer',
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Size Variants */}
          <div style={{ marginTop: 18, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--c-text-2)', marginBottom: 8 }}>
              <span>Size: <strong style={{ color: 'var(--c-text-1)' }}>{selectedSize}</strong></span>
              <button 
                onClick={() => toggleSection('size')}
                style={{ background: 'none', border: 'none', color: 'var(--c-accent-2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, textDecoration: 'underline' }}
              >
                Size Guide
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['XS', 'S', 'M', 'L', 'XL'].map(sz => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--r-md)',
                    background: selectedSize === sz ? 'var(--c-accent)' : 'var(--c-bg-alt)',
                    color: selectedSize === sz ? 'var(--c-accent-fg)' : 'var(--c-text-1)',
                    border: '1px solid var(--c-border)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="divider" />

          <div className="description">
            <div className={`desc-text ${!showFullDesc ? 'clamped' : ''}`}>
              {product.description || 'Elevate your everyday style with this premium piece from Lumé. Crafted with attention to detail and designed for both comfort and sophistication.'}
            </div>
            <button className="show-more-btn" onClick={() => setShowFullDesc(!showFullDesc)}>
              {showFullDesc ? 'Show less' : 'Read more'}
            </button>
          </div>

          <div className="actions-row">
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="qty-selector">
                <button 
                  className="qty-btn" 
                  disabled={quantity <= 1} 
                  onClick={() => setQuantity(q => q - 1)}
                >
                  <Minus size={16} />
                </button>
                <div className="qty-value">{quantity}</div>
                <button 
                  className="qty-btn" 
                  disabled={quantity >= 10} 
                  onClick={() => setQuantity(q => q + 1)}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button 
                className={`add-to-bag-main ${addSuccess ? 'success' : ''}`}
                onClick={handleAddToCart}
                disabled={isAdding}
                style={{ flex: 1 }}
              >
                {isAdding ? (
                  <div className="spinner" style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : addSuccess ? (
                  <>
                    <Check size={20} />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <span>Add to Bag &bull; ${(((product.discountPrice ?? product.price) * quantity)).toFixed(2)}</span>
                )}
              </button>
            </div>

            {/* Instant Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isBuyingNow}
              style={{
                width: '100%',
                height: 52,
                borderRadius: 'var(--r-full)',
                background: 'linear-gradient(135deg, var(--c-accent-2) 0%, #D4A855 100%)',
                color: '#1A1915',
                border: 'none',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: 'var(--shadow-sm), 0 4px 14px rgba(196, 151, 74, 0.25)',
                transition: 'opacity var(--transition)',
              }}
            >
              <Zap size={18} fill="#1A1915" />
              <span>{isBuyingNow ? 'Redirecting to Checkout...' : 'Buy Now with Express Checkout'}</span>
            </button>

            {(() => {
              const isSaved = product ? isWishlisted(product.id) : false;
              return (
                <button 
                  className={`wishlist-main ${isSaved ? 'active' : ''}`}
                  onClick={() => {
                    if (!product) return;
                    toggleWishlist(product);
                    showToast(
                      isSaved ? `Removed "${product.name}" from your wishlist.` : `Saved "${product.name}" to your wishlist.`,
                      'info',
                      isSaved ? 'Wishlist' : 'Saved Item'
                    );
                  }}
                >
                  <Heart size={18} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : 'currentColor'} />
                  {isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}
                </button>
              );
            })()}
          </div>

          <div className="trust-row">
            <div className="trust-item">
              <Truck size={20} />
              <span>Free Shipping</span>
            </div>
            <div className="trust-item">
              <RotateCcw size={20} />
              <span>Easy Returns</span>
            </div>
            <div className="trust-item">
              <ShieldCheck size={20} />
              <span>Secure Payment</span>
            </div>
          </div>

          <div className="accordion">
            <div className="accordion-item">
              <button className="accordion-header" onClick={() => toggleSection('details')}>
                Product Details
                {expandedSection === 'details' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <div className={`accordion-content ${expandedSection === 'details' ? 'open' : ''}`}>
                Premium materials and expert craftsmanship make this piece a timeless addition to your wardrobe. True to size fit. Dry clean recommended to maintain texture and color.
              </div>
            </div>
            <div className="accordion-item">
              <button className="accordion-header" onClick={() => toggleSection('shipping')}>
                Shipping & Returns
                {expandedSection === 'shipping' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <div className={`accordion-content ${expandedSection === 'shipping' ? 'open' : ''}`}>
                Complimentary standard shipping on all orders. Returns are accepted within 30 days of purchase in original condition with tags attached.
              </div>
            </div>
            <div className="accordion-item">
              <button className="accordion-header" onClick={() => toggleSection('size')}>
                Size Guide
                {expandedSection === 'size' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <div className={`accordion-content ${expandedSection === 'size' ? 'open' : ''}`}>
                Our models typically wear size M. If you are between sizes, we recommend sizing up for a more relaxed fit, or sizing down for a tailored look.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Ratings Breakdown */}
      <div style={{
        marginTop: 64,
        paddingTop: 48,
        borderTop: '1px solid var(--c-border-subtle)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--c-accent-2)' }}>
              Verified Buyer Sentiment
            </div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', margin: '4px 0 0' }}>
              Customer Reviews ({product.reviewCount || 48})
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--c-text-1)' }}>
              {product.rating ? product.rating.toFixed(1) : '4.9'}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2, color: 'var(--c-gold)' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--c-text-2)' }}>98% would recommend</span>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          marginBottom: 36,
          background: 'var(--c-bg-alt)',
          padding: 24,
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--c-border-subtle)',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { stars: 5, pct: 88, count: 42 },
              { stars: 4, pct: 10, count: 5 },
              { stars: 3, pct: 2, count: 1 },
              { stars: 2, pct: 0, count: 0 },
              { stars: 1, pct: 0, count: 0 },
            ].map((row) => (
              <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                <span style={{ width: 44, color: 'var(--c-text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {row.stars} <Star size={11} fill="currentColor" color="var(--c-gold)" />
                </span>
                <div style={{ flex: 1, height: 6, borderRadius: 'var(--r-full)', background: 'var(--c-border)', overflow: 'hidden' }}>
                  <div style={{ width: `${row.pct}%`, height: '100%', background: 'var(--c-accent-2)', borderRadius: 'var(--r-full)' }} />
                </div>
                <span style={{ width: 30, color: 'var(--c-text-3)', textAlign: 'right' }}>{row.count}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--c-text-2)' }}>
              <ShieldCheck size={18} color="var(--c-success)" />
              <span><strong>100% Verified Purchases</strong> from verified Lumé customers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--c-text-2)' }}>
              <Sparkles size={18} color="var(--c-accent-2)" />
              <span>Fit True to Size: <strong>96% agreement</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--c-text-2)' }}>
              <Truck size={18} color="var(--c-accent-2)" />
              <span>Delivery Condition: <strong>5.0 / 5.0 Rating</strong></span>
            </div>
          </div>
        </div>

        {/* Reviews Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            {
              author: 'Elena Rostova',
              date: 'October 1, 2026',
              rating: 5,
              title: 'Exceeded every luxury standard',
              comment: 'The texture and craftsmanship are remarkable. The finish catches the ambient light beautifully and the packaging was immaculate.',
              verified: true,
              helpful: 14,
            },
            {
              author: 'Marcus Vance',
              date: 'September 28, 2026',
              rating: 5,
              title: 'Subtle elegance, prompt delivery',
              comment: 'Fits comfortably and true to size. Received within 48 hours of ordering with real-time delivery notifications.',
              verified: true,
              helpful: 8,
            },
            {
              author: 'Sophie Chen',
              date: 'September 21, 2026',
              rating: 4,
              title: 'Premium build, exceptional texture',
              comment: 'A true centerpiece. Only note is that the shade appears marginally warmer in person, which I actually prefer.',
              verified: true,
              helpful: 6,
            },
          ].map((rev, i) => (
            <div key={i} style={{
              padding: 20,
              background: 'var(--c-surface)',
              borderRadius: 'var(--r-lg)',
              border: '1px solid var(--c-border-subtle)',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-text-1)' }}>{rev.author}</span>
                  {rev.verified && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--c-success)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '2px 8px',
                      borderRadius: 'var(--r-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <Check size={10} strokeWidth={3} /> Verified Buyer
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--c-text-3)' }}>{rev.date}</span>
              </div>

              <div style={{ display: 'flex', gap: 2, color: 'var(--c-gold)', marginBottom: 8 }}>
                {[...Array(rev.rating)].map((_, r) => (
                  <Star key={r} size={13} fill="currentColor" />
                ))}
              </div>

              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text-1)', margin: '0 0 6px' }}>{rev.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.6, margin: 0 }}>{rev.comment}</p>

              <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 12, color: 'var(--c-text-3)' }}>
                <span>Was this helpful? <button style={{ background: 'none', border: 'none', color: 'var(--c-text-2)', cursor: 'pointer', fontWeight: 600 }}>Yes ({rev.helpful})</button></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-section">
          <h2 className="related-title">You May Also Like</h2>
          <div className="related-grid">
            {relatedProducts.map(rel => (
              <Link to={`/products/${rel.id}`} key={rel.id} className="rel-card">
                <div className="rel-img-wrap">
                  <img src={rel.images?.[0] || 'https://via.placeholder.com/600x800'} alt={rel.name} className="rel-img" />
                </div>
                <div className="rel-brand">{rel.brand || 'Lumé'}</div>
                <div className="rel-name">{rel.name}</div>
                <div className="rel-price">${Number(rel.price).toFixed(2)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Image Zoom Modal */}
      {isZoomOpen && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            cursor: 'zoom-out',
          }}
        >
          <button
            onClick={() => setIsZoomOpen(false)}
            aria-label="Close fullscreen zoom"
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            <X size={22} />
          </button>
          <img 
            src={images[activeImage]} 
            alt={product.name} 
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
              borderRadius: 'var(--r-lg)',
            }}
          />
        </div>
      )}

      {/* Sticky Mobile "Add to Bag" Bottom Action Bar */}
      <div className="sticky-mobile-pdp-bar show-on-mobile" style={{
        position: 'fixed',
        bottom: 'calc(64px + env(safe-area-inset-bottom))',
        left: 0,
        right: 0,
        background: 'var(--c-surface-overlay)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--c-border-subtle)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 190,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 11, color: 'var(--c-text-3)', textTransform: 'uppercase', fontWeight: 700 }}>Total</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--c-text-1)' }}>
            ${(((product.discountPrice ?? product.price) * quantity)).toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--r-full)',
              background: 'var(--c-accent)',
              color: 'var(--c-accent-fg)',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ShoppingBag size={15} />
            <span>{addSuccess ? 'Added!' : 'Add to Bag'}</span>
          </button>

          <button
            onClick={handleBuyNow}
            disabled={isBuyingNow}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--r-full)',
              background: 'linear-gradient(135deg, var(--c-accent-2) 0%, #D4A855 100%)',
              color: '#1A1915',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Zap size={14} fill="#1A1915" />
            <span>Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
