import React, { useState, useEffect, useCallback } from 'react';
import { Package, Search, RefreshCw, Star, Tag, Layers, ExternalLink } from 'lucide-react';
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
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Product Catalog & Pricing Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            Direct catalog inspection, SKU tracking, category mapping, and pricing rules.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Sync Catalog</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 420 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search by title, SKU, or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 18,
        }}
      >
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ height: 160, background: 'var(--bg-tertiary)', overflow: 'hidden', position: 'relative' }}>
              {product.images?.[0] ? (
                <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={36} color="var(--text-tertiary)" />
                </div>
              )}
              <span
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                }}
              >
                {product.sku}
              </span>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                {product.brand}
              </span>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {product.name}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={13} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{product.rating}</span>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>({product.reviewCount} reviews)</span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${(product.discountPrice || product.price).toFixed(2)}
                  </span>
                  {product.discountPrice && (
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'line-through', marginLeft: 6 }}>
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: 99 }}>
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
