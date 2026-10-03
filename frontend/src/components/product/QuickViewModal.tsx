import React, { useState } from 'react';
import { X, Heart, ShoppingBag, Star, Check, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Product } from '../../types';
import { useCart, useWishlist, useToast } from '../../context/AppContext';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem, setIsCartOpen } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Obsidian');
  const [selectedSize, setSelectedSize] = useState('M');
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  if (!product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'];

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const currentPrice = product.discountPrice ?? product.price;
  const discountPct = hasDiscount 
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;
  const isSaved = isWishlisted(product.id);

  const colors = [
    { name: 'Obsidian', hex: '#1C1917' },
    { name: 'Champagne Gold', hex: '#C4974A' },
    { name: 'Pure White', hex: '#E2E8F0' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: currentPrice,
        images: images,
        sku: product.sku || `SKU-${product.id.slice(0, 8)}`,
      }, quantity);
      setAddSuccess(true);
      showToast(`Added ${quantity} × "${product.name}" to shopping bag.`, 'success', 'Bag Updated');
      setTimeout(() => {
        setAddSuccess(false);
        onClose();
        setIsCartOpen(true);
      }, 900);
    } catch {
      showToast('Could not add item to bag.', 'error', 'Error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div 
      className="quickview-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div 
        className="quickview-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          background: 'var(--c-surface)',
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--c-border-subtle)',
          boxShadow: 'var(--shadow-lg), 0 25px 60px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          position: 'relative',
          animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--c-bg-alt)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text-1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background var(--transition)',
          }}
        >
          <X size={18} />
        </button>

        {/* Left: Gallery & Zoom Preview */}
        <div style={{
          padding: 24,
          background: 'var(--c-bg-alt)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          position: 'relative',
        }}>
          <div style={{
            width: '100%',
            aspectRatio: '1/1',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border-subtle)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
              }}
            />
            {hasDiscount && (
              <span style={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'var(--c-error)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--r-full)',
              }}>
                −{discountPct}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'center' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 'var(--r-sm)',
                    overflow: 'hidden',
                    border: activeImage === i ? '2px solid var(--c-accent-2)' : '1px solid var(--c-border)',
                    padding: 0,
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div style={{
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',
          maxHeight: '90vh',
          gap: 20,
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--c-accent-2)',
              }}>
                {product.brand || 'LUMÉ EXCLUSIVE'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)' }}>
                <Star size={14} fill="var(--c-accent-2)" color="var(--c-accent-2)" />
                {product.rating ? product.rating.toFixed(1) : '4.9'}
                <span style={{ color: 'var(--c-text-3)', fontWeight: 400 }}>({product.reviewCount || 48})</span>
              </div>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-1)', margin: '0 0 12px' }}>
              {product.name}
            </h2>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-text-1)' }}>
                ${currentPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: 15, color: 'var(--c-text-3)', textDecoration: 'line-through' }}>
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <p style={{ fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.6, margin: '0 0 20px' }}>
              {product.description || 'Precision crafted with signature high-density materials, offering uncompromising luxury, timeless aesthetics, and ergonomic durability.'}
            </p>

            {/* Color Swatches */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-2)', marginBottom: 8 }}>
                Color: <strong style={{ color: 'var(--c-text-1)' }}>{selectedColor}</strong>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    style={{
                      width: 28,
                      height: 28,
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

            {/* Size Selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-2)', marginBottom: 8 }}>
                Size: <strong style={{ color: 'var(--c-text-1)' }}>{selectedSize}</strong>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--r-sm)',
                      background: selectedSize === s ? 'var(--c-accent)' : 'var(--c-bg-alt)',
                      color: selectedSize === s ? 'var(--c-accent-fg)' : 'var(--c-text-1)',
                      border: '1px solid var(--c-border)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                style={{
                  flex: 1,
                  height: 48,
                  borderRadius: 'var(--r-full)',
                  background: 'var(--c-accent)',
                  color: 'var(--c-accent-fg)',
                  fontSize: 14,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'opacity var(--transition)',
                }}
              >
                {addSuccess ? (
                  <>
                    <Check size={18} /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add to Bag &bull; ${(currentPrice * quantity).toFixed(2)}
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  toggleWishlist(product);
                  showToast(
                    isSaved ? `Removed "${product.name}" from wishlist.` : `Saved "${product.name}" to wishlist.`,
                    'info'
                  );
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--r-full)',
                  background: 'var(--c-bg-alt)',
                  border: '1px solid var(--c-border)',
                  color: isSaved ? 'var(--c-error)' : 'var(--c-text-1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Wishlist toggle"
              >
                <Heart size={20} fill={isSaved ? '#EF4444' : 'none'} color={isSaved ? '#EF4444' : 'currentColor'} />
              </button>
            </div>

            <Link
              to={`/products/${product.id}`}
              onClick={onClose}
              style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--c-accent-2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                textDecoration: 'none',
              }}
            >
              View Full Product Specifications <ArrowRight size={14} />
            </Link>

            {/* Micro Trust Strip */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--c-text-3)',
              paddingTop: 12,
              borderTop: '1px solid var(--c-border-subtle)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Truck size={13} color="var(--c-accent-2)" /> Free shipping over $75
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={13} color="var(--c-accent-2)" /> 30-day hassle-free returns
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
