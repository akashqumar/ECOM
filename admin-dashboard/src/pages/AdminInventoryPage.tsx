import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Boxes,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  Lock,
  Package,
  X
} from 'lucide-react';
import { inventoryApi, catalogApi } from '../services/api';
import { useAdmin } from '../context/AdminContext';
import type { InventoryItem, Product } from '../types';

export default function AdminInventoryPage() {
  const { customization } = useAdmin();
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'healthy' | 'low' | 'out' | 'reserved'>('all');
  const [sortField] = useState<'available' | 'reserved' | 'total' | 'name'>('available');
  const [sortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal State
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [invRes, prodRes] = await Promise.all([
        inventoryApi.getAll(),
        catalogApi.getProducts({ size: 100 }),
      ]);

      if (invRes.success) {
        setInventoryList(invRes.data);
      }
      if (prodRes.success && prodRes.data?.content) {
        const map: Record<string, Product> = {};
        prodRes.data.content.forEach((p) => {
          map[p.id] = p;
        });
        setProductsMap(map);
      }
    } catch (err) {
      console.error('Failed to load inventory', err);
      showToast('Failed to load inventory telemetry', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickAdjust = async (productId: string, delta: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await inventoryApi.adjustStock(productId, delta);
      if (res.success) {
        setInventoryList((prev) =>
          prev.map((item) => (item.productId === productId ? res.data : item))
        );
        showToast(`Stock updated (${delta > 0 ? '+' : ''}${delta})`, 'success');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to adjust stock';
      showToast(msg, 'error');
    }
  };

  const handleModalAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || adjustDelta === 0) return;
    setIsAdjusting(true);
    try {
      const res = await inventoryApi.adjustStock(selectedItem.productId, adjustDelta);
      if (res.success) {
        setInventoryList((prev) =>
          prev.map((item) => (item.productId === selectedItem.productId ? res.data : item))
        );
        showToast(`Stock updated by ${adjustDelta > 0 ? '+' : ''}${adjustDelta}`, 'success');
        setSelectedItem(null);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to adjust stock';
      showToast(msg, 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  const combinedItems: InventoryItem[] = useMemo(() => {
    return inventoryList.map((inv) => ({
      ...inv,
      product: productsMap[inv.productId],
    }));
  }, [inventoryList, productsMap]);

  const threshold = customization.lowStockThreshold || 25;

  const filteredItems = useMemo(() => {
    return combinedItems
      .filter((item) => {
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const pName = item.product?.name?.toLowerCase() || '';
          const pSku = item.product?.sku?.toLowerCase() || '';
          const pId = item.productId.toLowerCase();
          const wId = item.warehouseId?.toLowerCase() || '';
          if (!pName.includes(q) && !pSku.includes(q) && !pId.includes(q) && !wId.includes(q)) {
            return false;
          }
        }

        if (statusFilter === 'out') {
          return item.availableQuantity === 0;
        } else if (statusFilter === 'low') {
          return item.availableQuantity > 0 && item.availableQuantity < threshold;
        } else if (statusFilter === 'healthy') {
          return item.availableQuantity >= threshold;
        } else if (statusFilter === 'reserved') {
          return item.reservedQuantity > 0;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a.availableQuantity;
        let valB: any = b.availableQuantity;
        if (sortField === 'reserved') { valA = a.reservedQuantity; valB = b.reservedQuantity; }
        else if (sortField === 'total') { valA = a.totalQuantity; valB = b.totalQuantity; }
        else if (sortField === 'name') { valA = a.product?.name || ''; valB = b.product?.name || ''; }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [combinedItems, searchTerm, statusFilter, sortField, sortOrder, threshold]);

  const lowCount = combinedItems.filter((i) => i.availableQuantity > 0 && i.availableQuantity < threshold).length;
  const outCount = combinedItems.filter((i) => i.availableQuantity === 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 22px',
            borderRadius: 'var(--r-md)',
            background: toastMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="glass-pill" style={{ color: 'var(--accent)' }}>
              WAREHOUSE CONTROL
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', letterSpacing: '-0.5px' }}>
            Warehouse Inventory Console
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>
            Zero-overselling atomic lock management, threshold reorder triggers, and real-time inventory adjustments.
          </p>
        </div>
        <button
          onClick={() => loadData(false)}
          disabled={refreshing}
          className="glass-btn"
          style={{ cursor: refreshing ? 'not-allowed' : 'pointer' }}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Syncing...' : 'Sync Stock'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 440 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)' }} />
            <input
              type="text"
              placeholder="Search product name, SKU, or Product ID..."
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
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Items', count: combinedItems.length },
            { id: 'healthy', label: `In Stock (≥${threshold})`, count: combinedItems.filter((i) => i.availableQuantity >= threshold).length },
            { id: 'low', label: `Low Stock (<${threshold})`, count: lowCount },
            { id: 'out', label: 'Out of Stock (0)', count: outCount },
            { id: 'reserved', label: 'Active Reservations', count: combinedItems.filter((i) => i.reservedQuantity > 0).length },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--r-full)',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                  background: active ? 'var(--accent-light)' : 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)',
                  color: active ? 'var(--accent)' : 'var(--c-text-2)',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: active ? '0 0 12px var(--accent-glow)' : 'var(--glass-highlight)',
                  transition: 'all var(--transition)',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 7px',
                    borderRadius: 'var(--r-full)',
                    background: active ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: active ? '#fff' : 'var(--c-text-3)',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Glass Table */}
      <div
        className="glass-panel"
        style={{
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px solid var(--border-subtle)',
                  color: 'var(--c-text-3)',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <th style={{ padding: '16px 20px' }}>Product</th>
                <th style={{ padding: '16px 16px' }}>SKU</th>
                <th style={{ padding: '16px 16px' }}>Warehouse</th>
                <th style={{ padding: '16px 16px' }}>Available</th>
                <th style={{ padding: '16px 16px' }}>Reserved</th>
                <th style={{ padding: '16px 16px' }}>Total</th>
                <th style={{ padding: '16px 16px' }}>Health</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Atomic Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td colSpan={8} style={{ padding: '16px 20px' }}><div className="skeleton" style={{ height: 20 }} /></td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--c-text-3)' }}>
                    <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)' }}>No inventory records match</div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const product = item.product;
                  const isZero = item.availableQuantity === 0;
                  const isLow = item.availableQuantity > 0 && item.availableQuantity < threshold;

                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 'var(--r-sm)',
                              background: 'var(--glass-bg)',
                              border: '1px solid var(--glass-border)',
                              overflow: 'hidden',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: 'var(--glass-highlight)',
                            }}
                          >
                            {product?.images?.[0] ? (
                              <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Package size={18} color="var(--c-text-3)" />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--c-text-1)' }}>
                              {product?.name || `Product: ${item.productId.slice(0, 8)}...`}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--c-text-3)' }}>
                              {product?.brand ? `${product.brand} • ` : ''}${product ? `$${product.price.toFixed(2)}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: 'var(--c-text-2)' }}>
                        {product?.sku || 'N/A'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--c-text-2)' }}>
                          <Warehouse size={13} />
                          {item.warehouseId || customization.defaultWarehouse}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: isZero ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--c-text-1)' }}>
                          {item.availableQuantity}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {item.reservedQuantity > 0 ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--info)', background: 'var(--info-light)', padding: '2px 8px', borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--border-subtle)' }}>
                            <Lock size={10} />
                            {item.reservedQuantity} locked
                          </span>
                        ) : (
                          <span style={{ color: 'var(--c-text-3)' }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--c-text-2)' }}>
                        {item.totalQuantity}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {isZero ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-light)', padding: '3px 9px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', background: 'var(--warning-light)', padding: '3px 9px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
                            Low ({item.availableQuantity})
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', background: 'var(--success-light)', padding: '3px 9px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
                            Optimal
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={(e) => handleQuickAdjust(item.productId, -5, e)}
                            disabled={item.availableQuantity < 5}
                            className="glass-btn"
                            style={{
                              width: 32,
                              height: 30,
                              padding: 0,
                              borderRadius: 'var(--r-sm)',
                              fontWeight: 700,
                              fontSize: 11,
                              cursor: item.availableQuantity < 5 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            -5
                          </button>
                          <button
                            onClick={(e) => handleQuickAdjust(item.productId, 10, e)}
                            className="glass-btn"
                            style={{
                              width: 34,
                              height: 30,
                              padding: 0,
                              borderRadius: 'var(--r-sm)',
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          >
                            +10
                          </button>
                          <button
                            onClick={(e) => handleQuickAdjust(item.productId, 50, e)}
                            className="glass-btn"
                            style={{
                              width: 34,
                              height: 30,
                              padding: 0,
                              borderRadius: 'var(--r-sm)',
                              fontWeight: 700,
                              fontSize: 11,
                            }}
                          >
                            +50
                          </button>
                          <button
                            onClick={() => { setSelectedItem(item); setAdjustDelta(20); }}
                            className="glass-btn-primary"
                            style={{
                              padding: '5px 12px',
                              height: 30,
                              borderRadius: 'var(--r-full)',
                              fontSize: 12,
                              marginLeft: 4,
                            }}
                          >
                            Adjust...
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 1000,
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: 500,
              padding: 32,
              boxShadow: 'var(--glass-hover-shadow), var(--glass-highlight)',
              animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <Boxes size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--c-text-1)' }}>Adjust Stock Level</h3>
                  <span style={{ fontSize: 12, color: 'var(--c-text-3)', fontFamily: 'monospace' }}>
                    {selectedItem.product?.sku || selectedItem.productId}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalAdjustSubmit}>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stock Delta Adjustment
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" onClick={() => setAdjustDelta((d) => d - 10)} className="glass-btn" style={{ padding: '10px 14px' }}>-10</button>
                  <button type="button" onClick={() => setAdjustDelta((d) => d - 1)} className="glass-btn" style={{ padding: '10px 14px' }}>-1</button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                    className="glass-input"
                    style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 800, padding: '10px', borderRadius: 'var(--radius-sm)' }}
                  />
                  <button type="button" onClick={() => setAdjustDelta((d) => d + 1)} className="glass-btn" style={{ padding: '10px 14px' }}>+1</button>
                  <button type="button" onClick={() => setAdjustDelta((d) => d + 10)} className="glass-btn" style={{ padding: '10px 14px' }}>+10</button>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  {[+5, +20, +50, +100, -5, -20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdjustDelta(preset)}
                      className={adjustDelta === preset ? 'glass-btn-primary' : 'glass-btn'}
                      style={{ padding: '5px 12px', fontSize: 12, height: 28 }}
                    >
                      {preset > 0 ? `+${preset}` : preset}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--glass-highlight)',
                  marginBottom: 24,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--c-text-2)' }}>Projected Stock Level:</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>
                  {selectedItem.availableQuantity} → {Math.max(0, selectedItem.availableQuantity + adjustDelta)} units
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setSelectedItem(null)} className="glass-btn" style={{ flex: 1, padding: '12px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isAdjusting} className="glass-btn-primary" style={{ flex: 2, padding: '12px' }}>
                  {isAdjusting ? 'Committing Atomic Update...' : 'Confirm Atomic Stock Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
