import React, { useState, useEffect, useCallback } from 'react';
import { Package, Search, RefreshCw, Star } from 'lucide-react';
import { catalogApi } from '../services/api';
import type { Product } from '../types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        catalogApi.getProducts({ size: 100 }),
        catalogApi.getCategories(),
      ]);

      if (prodRes.success && prodRes.data?.content) {
        setProducts(prodRes.data.content);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory && p.categoryId !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="glass-pill" style={{ color: 'var(--accent)' }}>
              CATALOG REPOSITORY
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', letterSpacing: '-0.5px' }}>
            Product Catalog & Pricing Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>
            Direct catalog inspection, SKU tracking, category mapping, and pricing rules.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="glass-btn"
          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Sync Catalog</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 440 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)' }} />
          <input
            type="text"
            placeholder="Search by title, SKU, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input"
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--c-text-2)', fontWeight: 600 }}>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <option value="">All Categories ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: 20,
        }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="glass-panel" style={{ height: 320, padding: 18 }}>
              <div className="skeleton" style={{ height: 160, marginBottom: 14 }} />
              <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 24, width: '50%' }} />
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', color: 'var(--c-text-3)' }}>
            <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)' }}>No products found</div>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glass-panel glass-panel-hover"
              style={{
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: 170, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={40} color="var(--c-text-3)" />
                  </div>
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    fontSize: 10,
                    fontWeight: 700,
                    background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)',
                    color: '#fff',
                    padding: '3px 8px',
                    borderRadius: 'var(--r-xs)',
                    fontFamily: 'monospace',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  {product.sku}
                </span>
              </div>

              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.brand}
                </span>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--c-text-1)', lineHeight: 1.35 }}>
                  {product.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-1)' }}>{product.rating}</span>
                  <span style={{ fontSize: 11, color: 'var(--c-text-3)' }}>({product.reviewCount} reviews)</span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text-1)' }}>
                      ${(product.discountPrice || product.price).toFixed(2)}
                    </span>
                    {product.discountPrice && (
                      <span style={{ fontSize: 12, color: 'var(--c-text-3)', textDecoration: 'line-through', marginLeft: 6 }}>
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
