import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, Sparkles, Check } from 'lucide-react';
import { useWishlist, useCart } from '../context/AppContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [moveAllSuccess, setMoveAllSuccess] = useState(false);

  const handleMoveToBag = (product: any) => {
    setMovingId(product.id);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      sku: product.sku
    }, 1);
    
    setTimeout(() => {
      removeFromWishlist(product.id);
      setMovingId(null);
    }, 400);
  };

  const handleMoveAllToBag = () => {
    wishlist.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        images: item.images,
        sku: item.sku
      }, 1);
    });
    setMoveAllSuccess(true);
    setTimeout(() => {
      clearWishlist();
      setMoveAllSuccess(false);
    }, 600);
  };

  return (
    <div className="wishlist-page">
      {/* Header */}
      <div className="wishlist-hero">
        <div className="wishlist-hero-badge">
          <Heart size={14} fill="#EF4444" color="#EF4444" />
          <span>Curated Saves</span>
        </div>
        <h1 className="wishlist-title">My Wishlist</h1>
        <p className="wishlist-subtitle">
          {wishlist.length === 1 
            ? '1 item saved for later consideration.' 
            : `${wishlist.length} items saved for later consideration.`}
        </p>

        {wishlist.length > 0 && (
          <div className="wishlist-hero-actions">
            <button 
              className="move-all-btn" 
              onClick={handleMoveAllToBag}
              disabled={moveAllSuccess}
            >
              {moveAllSuccess ? (
                <>
                  <Check size={16} />
                  <span>Moved All to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Move All to Bag ({wishlist.length})</span>
                </>
              )}
            </button>
            <button className="clear-all-btn" onClick={clearWishlist}>
              Clear Wishlist
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {wishlist.length === 0 ? (
        <div className="wishlist-empty-card">
          <div className="empty-heart-bubble">
            <Heart size={48} strokeWidth={1.2} />
          </div>
          <h2>Your wishlist is currently empty</h2>
          <p>Explore our latest arrivals, archival collections, and special sales to save the pieces you desire.</p>
          <div className="empty-actions">
            <Link to="/products" className="empty-explore-btn">
              <span>Browse Catalog</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/new-arrivals" className="empty-new-btn">
              <span>New Arrivals</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map(product => {
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const isMoving = movingId === product.id;

            return (
              <div key={product.id} className="wishlist-item-card">
                <div className="item-media-wrap">
                  <Link to={`/products/${product.id}`} className="item-img-link">
                    <img 
                      src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'} 
                      alt={product.name} 
                      className="item-img"
                    />
                  </Link>
                  <button 
                    className="item-delete-btn"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Remove item"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                  {hasDiscount && (
                    <div className="item-discount-tag">SALE</div>
                  )}
                </div>

                <div className="item-body">
                  <div className="item-brand">{product.brand || 'LUMÉ'}</div>
                  <Link to={`/products/${product.id}`} className="item-title">
                    {product.name}
                  </Link>

                  <div className="item-price-row">
                    <span className="item-current-price">
                      ${(product.discountPrice ?? product.price).toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="item-old-price">${product.price.toFixed(2)}</span>
                    )}
                  </div>

                  <button 
                    className={`item-move-btn ${isMoving ? 'moving' : ''}`}
                    onClick={() => handleMoveToBag(product)}
                    disabled={isMoving}
                  >
                    {isMoving ? (
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      <>
                        <ShoppingBag size={14} />
                        <span>Move to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .wishlist-page {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px 80px;
          box-sizing: border-box;
        }

        .wishlist-hero {
          text-align: center;
          margin-bottom: 48px;
        }

        .wishlist-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #EF4444;
          background: rgba(239, 68, 68, 0.12);
          padding: 6px 14px;
          border-radius: var(--r-full);
          margin-bottom: 16px;
        }

        .wishlist-title {
          font-size: clamp(32px, 5vw, 44px);
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.03em;
          margin: 0 0 12px;
        }

        .wishlist-subtitle {
          font-size: 16px;
          color: var(--c-text-2);
          margin: 0 0 24px;
        }

        .wishlist-hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .move-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity var(--transition), transform var(--transition);
        }

        .move-all-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .clear-all-btn {
          padding: 12px 20px;
          border-radius: var(--r-full);
          background: transparent;
          border: 1px solid var(--c-border);
          color: var(--c-text-2);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: color var(--transition), border-color var(--transition);
        }

        .clear-all-btn:hover {
          color: #EF4444;
          border-color: #EF4444;
        }

        .wishlist-empty-card {
          text-align: center;
          padding: 80px 24px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
          border-radius: var(--r-xl);
          max-width: 600px;
          margin: 0 auto;
        }

        .empty-heart-bubble {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.08);
          color: #EF4444;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .wishlist-empty-card h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--c-text-1);
          margin: 0 0 10px;
        }

        .wishlist-empty-card p {
          font-size: 15px;
          color: var(--c-text-2);
          line-height: 1.6;
          margin: 0 0 32px;
        }

        .empty-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .empty-explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 26px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .empty-new-btn {
          display: inline-flex;
          align-items: center;
          padding: 13px 24px;
          border-radius: var(--r-full);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border);
          color: var(--c-text-1);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }

        .wishlist-item-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          border-radius: var(--r-xl);
          padding: 16px;
          display: flex;
          flex-direction: column;
          transition: transform var(--transition), box-shadow var(--transition);
        }

        .wishlist-item-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--glass-hover-shadow), var(--glass-highlight);
        }

        .item-media-wrap {
          position: relative;
          aspect-ratio: 1/1;
          border-radius: var(--r-lg);
          overflow: hidden;
          background: var(--c-surface);
          border: 1px solid var(--glass-border);
          margin-bottom: 14px;
        }

        .item-img-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .wishlist-item-card:hover .item-img {
          transform: scale(1.05);
        }

        .item-delete-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid var(--glass-border);
          color: var(--c-text-3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        [data-theme='dark'] .item-delete-btn {
          background: rgba(30, 41, 59, 0.85);
        }

        .item-delete-btn:hover {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
          border-color: #EF4444;
        }

        .item-discount-tag {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 3px 8px;
          border-radius: var(--r-full);
          background: #DC2626;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
        }

        .item-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .item-brand {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--c-accent-2);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .item-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--c-text-1);
          text-decoration: none;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .item-title:hover {
          color: var(--c-accent-2);
        }

        .item-price-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
          margin-top: auto;
        }

        .item-current-price {
          font-size: 16px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .item-old-price {
          font-size: 13px;
          color: var(--c-text-3);
          text-decoration: line-through;
        }

        .item-move-btn {
          width: 100%;
          height: 38px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: opacity var(--transition);
        }

        .item-move-btn:hover {
          opacity: 0.9;
        }

        @media (max-width: 640px) {
          .wishlist-page {
            padding: 20px 14px 80px !important;
          }
          .wishlist-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .wishlist-hero-actions {
            flex-direction: column;
            width: 100%;
          }
          .move-all-btn, .clear-all-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
