import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { catalogApi } from '../services/api';
import { useCart, useWishlist } from '../context/AppContext';
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
  Minimize2
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams<{ productId?: string; id?: string }>();
  const id = params.productId || params.id;
  const navigate = useNavigate();
  const { cart, addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState(0);
  const [imageFitMode, setImageFitMode] = useState<'contain' | 'cover'>('cover');
  const [quantity, setQuantity] = useState(1);
  const [addedQuantity, setAddedQuantity] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('details');
  const [showFullDesc, setShowFullDesc] = useState(false);

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
      setTimeout(() => {
        setAddSuccess(false);
      }, 1800);
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setIsAdding(false);
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

            {(() => {
              const isSaved = product ? isWishlisted(product.id) : false;
              return (
                <button 
                  className={`wishlist-main ${isSaved ? 'active' : ''}`}
                  onClick={() => product && toggleWishlist(product)}
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
    </div>
  );
}
