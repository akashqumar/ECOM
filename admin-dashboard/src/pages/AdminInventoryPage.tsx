import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Boxes,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  Lock,
  Package,
  X,
  ChevronLeft,
  ChevronRight
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);



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

  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const lowCount = combinedItems.filter((i) => i.availableQuantity > 0 && i.availableQuantity < threshold).length;
  const outCount = combinedItems.filter((i) => i.availableQuantity === 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Toast Notification */}
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
          <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 460 }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--c-text-3)', fontWeight: 600 }}>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="glass-input"
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--r-sm)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
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
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 12px' }}>SKU</th>
                <th style={{ padding: '12px 12px' }}>Warehouse</th>
                <th style={{ padding: '12px 12px' }}>Available</th>
                <th style={{ padding: '12px 12px' }}>Reserved</th>
                <th style={{ padding: '12px 12px' }}>Total</th>
                <th style={{ padding: '12px 12px' }}>Health</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td colSpan={8} style={{ padding: '12px 16px' }}><div className="skeleton" style={{ height: 20 }} /></td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--c-text-3)' }}>
                    <Package size={44} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)' }}>No inventory records match</div>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const product = item.product;
                  const isZero = item.availableQuantity === 0;
                  const isLow = item.availableQuantity > 0 && item.availableQuantity < threshold;

                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
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
                              <Package size={16} color="var(--c-text-3)" />
                            )}
                          </div>
                          <div style={{ minWidth: 0, maxWidth: 240 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--c-text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {product?.name || `Product: ${item.productId.slice(0, 8)}...`}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--c-text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {product?.brand ? `${product.brand} • ` : ''}{product ? `$${product.price.toFixed(2)}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: 'var(--c-text-2)', whiteSpace: 'nowrap' }}>
                        {product?.sku || 'N/A'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--c-text-2)' }}>
                          <Warehouse size={12} />
                          {item.warehouseId || customization.defaultWarehouse}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: isZero ? 'var(--danger)' : isLow ? 'var(--warning)' : 'var(--c-text-1)' }}>
                          {item.availableQuantity}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {item.reservedQuantity > 0 ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--info)', background: 'var(--info-light)', padding: '2px 7px', borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid var(--border-subtle)' }}>
                            <Lock size={10} />
                            {item.reservedQuantity} locked
                          </span>
                        ) : (
                          <span style={{ color: 'var(--c-text-3)' }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--c-text-2)' }}>
                        {item.totalQuantity}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {isZero ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-light)', padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--warning)', background: 'var(--warning-light)', padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
                            Low ({item.availableQuantity})
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', background: 'var(--success-light)', padding: '2px 8px', borderRadius: 'var(--r-full)', border: '1px solid var(--border-subtle)' }}>
                            Optimal
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => { setSelectedItem(item); setAdjustDelta(20); }}
                          className="glass-btn-primary"
                          style={{
                            padding: '5px 12px',
                            height: 28,
                            borderRadius: 'var(--r-full)',
                            fontSize: 11,
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Boxes size={12} />
                          <span>Adjust Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="pagination-container">
            <div style={{ fontSize: 12, color: 'var(--c-text-3)', fontWeight: 500 }}>
              Showing <strong style={{ color: 'var(--c-text-1)' }}>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong style={{ color: 'var(--c-text-1)' }}>{Math.min(currentPage * pageSize, totalItems)}</strong> of{' '}
              <strong style={{ color: 'var(--c-text-1)' }}>{totalItems}</strong> SKUs
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                // Display surrounding pages or first/last
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={pageNum} style={{ color: 'var(--c-text-3)', padding: '0 4px', fontSize: 12 }}>
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal Portaled to Document Body */}
      {selectedItem && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(5, 10, 20, 0.70)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 99999,
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: 480,
              padding: 30,
              boxShadow: 'var(--glass-hover-shadow), var(--glass-highlight)',
              animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <Boxes size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--c-text-1)' }}>Adjust Stock Level</h3>
                  <span style={{ fontSize: 12, color: 'var(--c-text-3)', fontFamily: 'monospace' }}>
                    {selectedItem.product?.sku || selectedItem.productId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--c-text-3)',
                  cursor: 'pointer',
                  padding: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleModalAdjustSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stock Delta Adjustment
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" onClick={() => setAdjustDelta((d) => d - 10)} className="glass-btn" style={{ padding: '8px 12px' }}>-10</button>
                  <button type="button" onClick={() => setAdjustDelta((d) => d - 1)} className="glass-btn" style={{ padding: '8px 12px' }}>-1</button>
                  <input
                    type="number"
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(parseInt(e.target.value) || 0)}
                    className="glass-input"
                    style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 800, padding: '8px', borderRadius: 'var(--radius-sm)' }}
                  />
                  <button type="button" onClick={() => setAdjustDelta((d) => d + 1)} className="glass-btn" style={{ padding: '8px 12px' }}>+1</button>
                  <button type="button" onClick={() => setAdjustDelta((d) => d + 10)} className="glass-btn" style={{ padding: '8px 12px' }}>+10</button>
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
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--glass-highlight)',
                  marginBottom: 22,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: 'var(--c-text-2)' }}>Projected Stock Level:</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>
                  {selectedItem.availableQuantity} → {Math.max(0, selectedItem.availableQuantity + adjustDelta)} units
                </span>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setSelectedItem(null)} className="glass-btn" style={{ flex: 1, padding: '10px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={isAdjusting} className="glass-btn-primary" style={{ flex: 2, padding: '10px' }}>
                  {isAdjusting ? 'Committing Atomic Update...' : 'Confirm Atomic Stock Update'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
