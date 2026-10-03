import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Package,
  Search,
  RefreshCw,
  Truck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  Ban,
  Clock,
  User,
  ShoppingBag,
  MoreVertical,
  Copy,
  Check,
  Hash,
  ExternalLink,
  CreditCard,
  Printer,
  FileDown,
  QrCode,
} from 'lucide-react';
import QRCode from 'qrcode';
import { orderApi } from '../services/api';
import type { Order, OrderTimeline } from '../types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [timelines, setTimelines] = useState<Record<string, OrderTimeline>>({});
  const [loadingTimelines, setLoadingTimelines] = useState<Record<string, boolean>>({});

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Shipping Modal State
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState('FedEx Priority');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingNotes, setShippingNotes] = useState('Dispatched from WH-MAIN-01 fulfillment hub');

  // Cancel Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Admin manual cancellation / Out of stock');
  const [isCancelling, setIsCancelling] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const res = await orderApi.getAllOrders({ size: 100 });
      if (res.success && res.data?.content) {
        setOrders(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
      showToast('Failed to load platform orders', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleGlobalClick = () => setActiveActionMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const toggleTimeline = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    setExpandedOrderId(orderId);
    if (!timelines[orderId]) {
      setLoadingTimelines((prev) => ({ ...prev, [orderId]: true }));
      try {
        const res = await orderApi.getOrderTimeline(orderId);
        if (res.success) {
          setTimelines((prev) => ({ ...prev, [orderId]: res.data }));
        }
      } catch (err) {
        console.error('Failed to load timeline', err);
      } finally {
        setLoadingTimelines((prev) => ({ ...prev, [orderId]: false }));
      }
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, tracking?: string, carr?: string, notes?: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await orderApi.updateOrderStatus(orderId, {
        status: newStatus,
        trackingNumber: tracking,
        carrier: carr,
        notes,
      });

      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
        if (timelines[orderId]) {
          const tRes = await orderApi.getOrderTimeline(orderId);
          if (tRes.success) {
            setTimelines((prev) => ({ ...prev, [orderId]: tRes.data }));
          }
        }
        showToast(`Order updated to ${newStatus}`, 'success');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update order status';
      showToast(msg, 'error');
    } finally {
      setIsUpdatingStatus(false);
      setShippingModalOrder(null);
    }
  };

  const generateTrackingNumber = () => {
    const prefix = carrier.startsWith('DHL') ? 'DHL' : carrier.startsWith('UPS') ? '1Z' : 'FDX';
    const rand = Math.floor(100000000 + Math.random() * 900000000);
    setTrackingNumber(`${prefix}-${rand}`);
  };

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    try {
      const res = await orderApi.cancelOrder(cancelModalOrder.id, cancelReason);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === cancelModalOrder.id ? { ...o, status: 'CANCELLED' as any } : o))
        );
        if (timelines[cancelModalOrder.id]) {
          const tRes = await orderApi.getOrderTimeline(cancelModalOrder.id);
          if (tRes.success) {
            setTimelines((prev) => ({ ...prev, [cancelModalOrder.id]: tRes.data }));
          }
        }
        showToast(`Order #${cancelModalOrder.orderNumber} successfully cancelled`, 'success');
        setCancelModalOrder(null);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to cancel order';
      showToast(msg, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const oNum = order.orderNumber?.toLowerCase() || '';
        const oId = order.id.toLowerCase();
        const uId = order.userId.toLowerCase();
        const addr = order.shippingAddress?.toLowerCase() || '';
        const hasItemMatch = order.items?.some(
          (i) => i.productName?.toLowerCase().includes(q) || i.sku?.toLowerCase().includes(q)
        );
        if (!oNum.includes(q) && !oId.includes(q) && !uId.includes(q) && !addr.includes(q) && !hasItemMatch) {
          return false;
        }
      }

      if (statusFilter === 'READY') {
        return order.status === 'CONFIRMED' || order.status === 'PAID';
      } else if (statusFilter === 'PROCESSING') {
        return order.status === 'PROCESSING';
      } else if (statusFilter === 'SHIPPED') {
        return order.status === 'SHIPPED';
      } else if (statusFilter === 'DELIVERED') {
        return order.status === 'DELIVERED';
      } else if (statusFilter === 'CANCELLED') {
        return order.status === 'CANCELLED' || order.status === 'FAILED';
      }
      return true;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalOrders = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const readyCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PAID').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING').length;
  const shippedCount = orders.filter((o) => o.status === 'SHIPPED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;

  const handlePrintOrders = () => {
    if (filteredOrders.length === 0) {
      showToast('No orders found in current filter to export/print', 'error');
      return;
    }

    const filterName =
      statusFilter === 'all'
        ? 'All Orders'
        : statusFilter === 'READY'
        ? 'Ready to Pack'
        : statusFilter === 'PROCESSING'
        ? 'Processing'
        : statusFilter === 'SHIPPED'
        ? 'Dispatched / In-Transit'
        : statusFilter === 'DELIVERED'
        ? 'Delivered'
        : 'Cancelled / Failed';

    const totalFilterRevenue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalFilterItems = filteredOrders.reduce((sum, o) => {
      const itemsCount = o.items?.reduce((iSum, it) => iSum + (it.quantity || 1), 0) || o.items?.length || 0;
      return sum + itemsCount;
    }, 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker prevented print window from opening. Please allow popups.', 'error');
      return;
    }

    const orderRowsHtml = filteredOrders
      .map((order, idx) => {
        const itemRows = (order.items || [])
          .map(
            (item) => `
            <div style="font-size: 11px; margin-bottom: 2px;">
              <strong>${item.productName || 'Item'}</strong> &times; ${item.quantity}
              <span style="color: #64748b; margin-left: 4px;">(SKU: ${item.sku || 'N/A'})</span>
              <span style="float: right; font-weight: 600;">$${(item.subtotal || item.price * item.quantity).toFixed(2)}</span>
            </div>`
          )
          .join('');

        const statusColor =
          order.status === 'DELIVERED' || order.status === 'CONFIRMED'
            ? '#059669'
            : order.status === 'SHIPPED'
            ? '#0284c7'
            : order.status === 'CANCELLED' || order.status === 'FAILED'
            ? '#dc2626'
            : '#d97706';

        return `
          <tr style="page-break-inside: avoid; border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 10px 8px; vertical-align: top; font-weight: 700; font-family: monospace; font-size: 12px;">
              #${order.orderNumber}
              <div style="font-size: 10px; color: #64748b; font-family: system-ui; font-weight: 400; margin-top: 2px;">
                ${new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </td>
            <td style="padding: 10px 8px; vertical-align: top;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; background: ${statusColor}18; color: ${statusColor}; border: 1px solid ${statusColor}40;">
                ${order.status}
              </span>
              ${
                order.trackingNumber
                  ? `<div style="font-size: 10px; color: #0284c7; margin-top: 4px; font-family: monospace;">
                      ${order.carrier || 'Carrier'}: ${order.trackingNumber}
                     </div>`
                  : ''
              }
            </td>
            <td style="padding: 10px 8px; vertical-align: top; font-size: 11px;">
              <div style="font-weight: 600; color: #1e293b;">${order.shippingAddress || 'Standard Destination'}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">User: ${order.userId}</div>
            </td>
            <td style="padding: 10px 8px; vertical-align: top;">
              ${itemRows || '<span style="color: #94a3b8; font-size: 11px;">No item details</span>'}
            </td>
            <td style="padding: 10px 8px; vertical-align: top; text-align: right; font-weight: 800; font-size: 13px; color: #0f172a; white-space: nowrap;">
              $${order.totalAmount.toFixed(2)}
            </td>
          </tr>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lumé Commerce - Orders Manifest (${filterName})</title>
          <meta charset="utf-8" />
          <style>
            @media print {
              @page {
                size: A4;
                margin: 12mm 15mm;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .no-print {
                display: none !important;
              }
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #fff;
              margin: 0;
              padding: 24px;
              line-height: 1.4;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #0f172a;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .brand {
              font-size: 22px;
              font-weight: 800;
              letter-spacing: -0.5px;
            }
            .badge {
              font-size: 11px;
              background: #f1f5f9;
              padding: 4px 10px;
              border-radius: 4px;
              font-weight: 600;
              color: #475569;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 20px;
            }
            .summary-card {
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 10px 14px;
              background: #f8fafc;
            }
            .summary-card .label {
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              font-weight: 700;
            }
            .summary-card .value {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 2px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th {
              background: #f1f5f9;
              padding: 8px;
              font-size: 10px;
              text-transform: uppercase;
              color: #475569;
              letter-spacing: 0.05em;
              text-align: left;
              border-bottom: 2px solid #cbd5e1;
            }
            .print-btn-bar {
              margin-bottom: 20px;
              padding: 12px 16px;
              background: #f1f5f9;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .btn {
              background: #0284c7;
              color: #fff;
              border: none;
              padding: 8px 18px;
              font-size: 13px;
              font-weight: 700;
              border-radius: 6px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="print-btn-bar no-print">
            <div>
              <strong>Report ready:</strong> Click <strong>Print / Save as PDF</strong> or use Ctrl+P (Cmd+P on Mac).
            </div>
            <button class="btn" onclick="window.print()">Print / Save as PDF</button>
          </div>

          <div class="header-bar">
            <div>
              <div class="brand">LUMÉ COMMERCE</div>
              <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px;">
                Orders & Fulfillment Manifest
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                Filter: <strong>${filterName}</strong> ${searchTerm ? `• Search query: "${searchTerm}"` : ''}
              </div>
            </div>
            <div style="text-align: right;">
              <div class="badge">CONFIDENTIAL • INTERNAL DISPATCH</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
                Generated: ${new Date().toLocaleString()}
              </div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="summary-card">
              <div class="label">Total Orders</div>
              <div class="value">${filteredOrders.length}</div>
            </div>
            <div class="summary-card">
              <div class="label">Total Products</div>
              <div class="value">${totalFilterItems} units</div>
            </div>
            <div class="summary-card">
              <div class="label">Active Filter</div>
              <div class="value" style="font-size: 13px;">${filterName}</div>
            </div>
            <div class="summary-card">
              <div class="label">Gross Order Volume</div>
              <div class="value" style="color: #059669;">$${totalFilterRevenue.toFixed(2)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 18%;">Order # / Date</th>
                <th style="width: 18%;">Status / Logistics</th>
                <th style="width: 26%;">Customer / Shipping Address</th>
                <th style="width: 26%;">Products / Line Items</th>
                <th style="width: 12%; text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${orderRowsHtml}
            </tbody>
          </table>

          <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
            <span>Lumé High-Performance Distributed Commerce Platform</span>
            <span>Page 1 of Manifest • Order Lifecycle Outbox & Fulfillment System</span>
          </div>

          <script>
            // Automatically prompt print dialog after page renders
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                window.print();
              }, 400);
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Generate QR-coded Packing & Picking Slips for Ready-to-Pack Orders
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);

  const handlePrintPackingLabels = async (singleOrder?: Order) => {
    const targetOrders = singleOrder
      ? [singleOrder]
      : orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PAID');

    if (targetOrders.length === 0) {
      showToast('No "Ready to Pack" orders available to generate packing labels', 'error');
      return;
    }

    setIsGeneratingQr(true);
    showToast(`Generating QR codes for ${targetOrders.length} order(s)...`, 'success');

    try {
      // Pre-render QR Codes to Data URLs for both order and every item
      const ordersWithQrs = await Promise.all(
        targetOrders.map(async (order) => {
          // Order-level QR encodes JSON payload or link
          const orderQrPayload = JSON.stringify({
            orderNumber: order.orderNumber,
            orderId: order.id,
            status: order.status,
            total: order.totalAmount,
            userId: order.userId,
            address: order.shippingAddress,
          });

          const orderQrDataUrl = await QRCode.toDataURL(orderQrPayload, {
            errorCorrectionLevel: 'M',
            width: 140,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
          });

          // Items QR encodes product & SKU for warehouse verification scanners
          const itemsWithQrs = await Promise.all(
            (order.items || []).map(async (item) => {
              const itemQrPayload = JSON.stringify({
                orderNumber: order.orderNumber,
                sku: item.sku,
                productId: item.productId,
                productName: item.productName,
                qty: item.quantity,
              });

              const itemQrDataUrl = await QRCode.toDataURL(itemQrPayload, {
                errorCorrectionLevel: 'M',
                width: 90,
                margin: 1,
                color: { dark: '#0f172a', light: '#ffffff' },
              });

              return {
                ...item,
                qrDataUrl: itemQrDataUrl,
              };
            })
          );

          return {
            ...order,
            orderQrDataUrl,
            itemsWithQrs,
          };
        })
      );

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        showToast('Popup blocker prevented print window from opening. Please allow popups.', 'error');
        setIsGeneratingQr(false);
        return;
      }

      const slipsHtml = ordersWithQrs
        .map((order, orderIdx) => {
          const itemBoxesHtml = order.itemsWithQrs
            .map(
              (item, iIdx) => `
              <div class="item-card">
                <div class="item-qr-wrap">
                  <img class="qr-img" src="${item.qrDataUrl}" alt="SKU QR" />
                  <div class="qr-sub">Scan to verify</div>
                </div>
                <div class="item-info">
                  <div class="item-name">${item.productName}</div>
                  <div class="item-meta">
                    <span>SKU: <strong>${item.sku}</strong></span>
                    <span>Product ID: <code>${item.productId.slice(0, 12)}...</code></span>
                  </div>
                  <div class="item-qty-row">
                    <span class="qty-badge">PICK QTY: ${item.quantity}</span>
                    <span class="item-price">$${item.price.toFixed(2)} ea • Subtotal: $${item.subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <div class="checkbox-box">
                  <div class="check-square"></div>
                  <div style="font-size: 8px; color: #64748b; margin-top: 3px; font-weight: 700;">PACKED</div>
                </div>
              </div>
            `
            )
            .join('');

          return `
            <div class="slip-container ${orderIdx < ordersWithQrs.length - 1 ? 'page-break' : ''}">
              <!-- Slip Header -->
              <div class="slip-header">
                <div class="header-left">
                  <div class="slip-brand">LUMÉ FULFILLMENT SLIP</div>
                  <div class="order-num-title">ORDER #${order.orderNumber}</div>
                  <div class="order-sub-meta">
                    <span>Date: <strong>${new Date(order.createdAt).toLocaleString()}</strong></span>
                    <span>Status: <strong style="color: #059669;">${order.status}</strong></span>
                  </div>
                </div>
                <div class="header-right">
                  <div class="order-qr-wrap">
                    <img class="order-qr-img" src="${order.orderQrDataUrl}" alt="Order QR" />
                    <div class="qr-caption">Scan Order Barcode</div>
                  </div>
                </div>
              </div>

              <!-- Shipping & Logistics Banner -->
              <div class="dispatch-banner">
                <div class="banner-col" style="flex: 2;">
                  <div class="col-title">SHIP TO DESTINATION</div>
                  <div class="address-text">${order.shippingAddress || 'Standard Warehouse Destination'}</div>
                  <div class="user-ref">Customer ID: <code>${order.userId}</code></div>
                </div>
                <div class="banner-col" style="flex: 1; border-left: 1px dashed #cbd5e1; padding-left: 16px;">
                  <div class="col-title">ORDER METRICS</div>
                  <div class="metric-row"><span>Total Units:</span> <strong>${order.itemsWithQrs.reduce((s, it) => s + (it.quantity || 1), 0)}</strong></div>
                  <div class="metric-row"><span>Total Amount:</span> <strong>$${order.totalAmount.toFixed(2)}</strong></div>
                  <div class="metric-row"><span>Order UUID:</span> <code>${order.id.slice(0, 8)}...</code></div>
                </div>
              </div>

              <!-- Picking & Packing Check List -->
              <div class="section-heading">
                <span>ITEMS TO PICK & PACK (${order.itemsWithQrs.length} Line Items)</span>
                <span style="font-weight: 500; font-size: 10px; color: #64748b;">Scan item QR code with warehouse scanner before sealing pack</span>
              </div>

              <div class="items-list">
                ${itemBoxesHtml}
              </div>

              <!-- Packer Verification Footer -->
              <div class="packer-footer">
                <div class="sign-block">
                  <div class="line"></div>
                  <div class="sign-label">Picked By (Name / ID)</div>
                </div>
                <div class="sign-block">
                  <div class="line"></div>
                  <div class="sign-label">Packed & Verified By</div>
                </div>
                <div class="sign-block">
                  <div class="line"></div>
                  <div class="sign-label">Packing Date & Time</div>
                </div>
              </div>
            </div>
          `;
        })
        .join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Lumé Commerce - Packing & Picking Slips with QR Codes</title>
            <meta charset="utf-8" />
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 10mm 12mm;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .no-print {
                  display: none !important;
                }
                .page-break {
                  page-break-after: always;
                  break-after: page;
                }
              }
              * {
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #0f172a;
                background: #fff;
                margin: 0;
                padding: 16px;
                line-height: 1.35;
              }
              .toolbar {
                margin-bottom: 20px;
                padding: 12px 18px;
                background: #f1f5f9;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .btn {
                background: #0284c7;
                color: #fff;
                border: none;
                padding: 9px 20px;
                font-size: 13px;
                font-weight: 700;
                border-radius: 6px;
                cursor: pointer;
              }
              .slip-container {
                border: 2px solid #0f172a;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 24px;
                background: #fff;
              }
              .page-break {
                page-break-after: always;
                break-after: page;
              }
              .slip-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                border-bottom: 2px solid #0f172a;
                padding-bottom: 14px;
                margin-bottom: 14px;
              }
              .slip-brand {
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 0.1em;
                color: #475569;
              }
              .order-num-title {
                font-size: 24px;
                font-weight: 900;
                font-family: monospace;
                letter-spacing: -0.5px;
                color: #0f172a;
                margin: 4px 0;
              }
              .order-sub-meta {
                display: flex;
                gap: 16px;
                font-size: 11px;
                color: #64748b;
              }
              .order-qr-wrap {
                text-align: center;
              }
              .order-qr-img {
                width: 100px;
                height: 100px;
                display: block;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
              }
              .qr-caption {
                font-size: 9px;
                font-weight: 700;
                color: #475569;
                margin-top: 4px;
                letter-spacing: 0.04em;
              }
              .dispatch-banner {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 12px 14px;
                display: flex;
                gap: 16px;
                margin-bottom: 16px;
              }
              .col-title {
                font-size: 9px;
                font-weight: 800;
                letter-spacing: 0.06em;
                color: #64748b;
                margin-bottom: 4px;
              }
              .address-text {
                font-size: 13px;
                font-weight: 600;
                color: #1e293b;
              }
              .user-ref {
                font-size: 10px;
                color: #64748b;
                margin-top: 4px;
              }
              .metric-row {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                margin-bottom: 2px;
              }
              .section-heading {
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 0.05em;
                color: #0f172a;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 6px;
              }
              .items-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
              }
              .item-card {
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 10px 12px;
                display: flex;
                align-items: center;
                gap: 14px;
                background: #ffffff;
                page-break-inside: avoid;
              }
              .item-qr-wrap {
                text-align: center;
                flex-shrink: 0;
              }
              .qr-img {
                width: 72px;
                height: 72px;
                display: block;
                border: 1px solid #e2e8f0;
                border-radius: 3px;
              }
              .qr-sub {
                font-size: 8px;
                color: #64748b;
                font-weight: 600;
                margin-top: 2px;
              }
              .item-info {
                flex: 1;
                min-width: 0;
              }
              .item-name {
                font-size: 14px;
                font-weight: 700;
                color: #0f172a;
                margin-bottom: 4px;
              }
              .item-meta {
                font-size: 11px;
                color: #475569;
                display: flex;
                gap: 12px;
                margin-bottom: 6px;
              }
              .item-qty-row {
                display: flex;
                align-items: center;
                gap: 12px;
              }
              .qty-badge {
                display: inline-block;
                background: #0f172a;
                color: #fff;
                font-size: 11px;
                font-weight: 800;
                padding: 3px 8px;
                border-radius: 4px;
                letter-spacing: 0.05em;
              }
              .item-price {
                font-size: 11px;
                color: #64748b;
              }
              .checkbox-box {
                text-align: center;
                flex-shrink: 0;
                padding-left: 8px;
              }
              .check-square {
                width: 28px;
                height: 28px;
                border: 2px solid #0f172a;
                border-radius: 4px;
                margin: 0 auto;
              }
              .packer-footer {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-top: 24px;
                padding-top: 16px;
                border-top: 1px solid #e2e8f0;
              }
              .sign-block .line {
                border-bottom: 1px solid #94a3b8;
                height: 28px;
                margin-bottom: 4px;
              }
              .sign-label {
                font-size: 10px;
                color: #64748b;
                text-align: center;
                text-transform: uppercase;
                font-weight: 600;
              }
            </style>
          </head>
          <body>
            <div class="toolbar no-print">
              <div>
                <strong>${targetOrders.length} Ready to Pack Packing Slip(s) generated:</strong>
                Includes individual QR barcodes for warehouse picking scanners.
              </div>
              <button class="btn" onclick="window.print()">Print Packing Slips (PDF)</button>
            </div>

            ${slipsHtml}

            <script>
              window.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                  window.print();
                }, 500);
              });
            </script>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (err: any) {
      showToast('Failed to generate QR codes: ' + (err?.message || err), 'error');
    } finally {
      setIsGeneratingQr(false);
    }
  };

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
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="glass-pill" style={{ color: 'var(--accent)' }}>
              DISPATCH & FULFILLMENT
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-1)', letterSpacing: '-0.5px' }}>
            Orders & Fulfillment Console
          </h1>
          <p style={{ fontSize: 13, color: 'var(--c-text-2)', marginTop: 4 }}>
            Manage order lifecycle, trigger Kafka fulfillment events, and track multi-stage Saga timelines.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Print QR Packing Slips for Ready-to-Pack Orders */}
          <button
            onClick={() => handlePrintPackingLabels()}
            disabled={isGeneratingQr || readyCount === 0}
            className="glass-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              color: readyCount > 0 ? 'var(--warning)' : 'var(--c-text-3)',
              borderColor: readyCount > 0 ? 'rgba(245, 158, 11, 0.4)' : undefined,
              background: readyCount > 0 ? 'rgba(245, 158, 11, 0.08)' : undefined,
            }}
            title="Generate packing slips with individual QR verification codes for all Ready to Pack orders"
          >
            <QrCode size={15} color={readyCount > 0 ? 'var(--warning)' : 'currentColor'} />
            <span>{isGeneratingQr ? 'Generating QRs...' : `Packing Slips QR (${readyCount})`}</span>
          </button>

          <button
            onClick={handlePrintOrders}
            className="glass-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
            }}
            title="Export and print manifest PDF for the selected filter"
          >
            <Printer size={15} color="var(--accent)" />
            <span>Print PDF ({filteredOrders.length})</span>
          </button>

          <button
            onClick={() => loadOrders(false)}
            disabled={refreshing}
            className="glass-btn"
            style={{ cursor: refreshing ? 'not-allowed' : 'pointer' }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync Orders'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-1)' }}>{orders.length}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Awaiting Fulfillment</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning)' }}>{readyCount + processingCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In-Transit Logistics</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--info)' }}>{shippedCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivered</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>{deliveredCount}</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
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
          <div style={{ position: 'relative', flex: 1, maxWidth: 460 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-text-3)' }} />
            <input
              type="text"
              placeholder="Search by Order #, Customer ID, SKU, product, address..."
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

        {/* Status filter tabs & Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'READY', label: 'Ready to Pack', count: readyCount },
              { id: 'PROCESSING', label: 'Processing', count: processingCount },
              { id: 'SHIPPED', label: 'Dispatched / In-Transit', count: shippedCount },
              { id: 'DELIVERED', label: 'Delivered', count: deliveredCount },
              { id: 'CANCELLED', label: 'Cancelled / Failed', count: orders.filter((o) => o.status === 'CANCELLED' || o.status === 'FAILED').length },
            ].map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
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

          <button
            onClick={handlePrintOrders}
            className="glass-btn"
            style={{
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
            title="Print or export filtered list"
          >
            <Printer size={13} color="var(--accent)" />
            <span>Print Manifest ({filteredOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: 22 }}>
              <div className="skeleton" style={{ height: 22, width: '40%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 16, width: '50%' }} />
            </div>
          ))
        ) : paginatedOrders.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--c-text-3)' }}>
            <Package size={48} style={{ margin: '0 auto 14px', opacity: 0.3 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-1)' }}>No orders match this filter</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing your search query or switching to another status tab.</div>
          </div>
        ) : (
          paginatedOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const timelineData = timelines[order.id];
            const isLoadingTimeline = loadingTimelines[order.id];

            // Lifecycle stage calculation for horizontal mini-progress bar
            const stages = [
              { key: 'CONFIRMED', label: 'Confirmed' },
              { key: 'PROCESSING', label: 'Processing' },
              { key: 'SHIPPED', label: 'Dispatched' },
              { key: 'DELIVERED', label: 'Delivered' },
            ];

            const isCancelled = order.status === 'CANCELLED' || order.status === 'FAILED';
            const getStageState = (stageKey: string) => {
              if (isCancelled) return 'cancelled';
              const rankMap: Record<string, number> = {
                PENDING: 0,
                PAID: 0,
                CONFIRMED: 0,
                PROCESSING: 1,
                SHIPPED: 2,
                DELIVERED: 3,
              };
              const currentRank = rankMap[order.status] ?? 0;
              const targetRank = rankMap[stageKey] ?? 0;
              if (currentRank > targetRank) return 'done';
              if (currentRank === targetRank) return 'current';
              return 'upcoming';
            };

            const totalItemCount = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || order.items?.length || 0;

            return (
              <div
                key={order.id}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--glass-shadow), var(--glass-highlight)',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Order Top Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Left: ID & Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          color: 'var(--c-text-1)',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        #{order.orderNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(order.orderNumber, `num-${order.id}`)}
                        className="glass-btn"
                        style={{ padding: '3px 6px', borderRadius: 4, height: 22 }}
                        title="Copy Order Number"
                      >
                        {copiedId === `num-${order.id}` ? (
                          <Check size={11} color="var(--success)" />
                        ) : (
                          <Copy size={11} style={{ opacity: 0.6 }} />
                        )}
                      </button>
                    </div>

                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--r-full)',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        background:
                          order.status === 'SHIPPED'
                            ? 'var(--info-light)'
                            : order.status === 'CONFIRMED' || order.status === 'DELIVERED'
                            ? 'var(--success-light)'
                            : isCancelled
                            ? 'var(--danger-light)'
                            : 'var(--warning-light)',
                        color:
                          order.status === 'SHIPPED'
                            ? 'var(--info)'
                            : order.status === 'CONFIRMED' || order.status === 'DELIVERED'
                            ? 'var(--success)'
                            : isCancelled
                            ? 'var(--danger)'
                            : 'var(--warning)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {order.status}
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--c-text-3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Calendar size={13} style={{ opacity: 0.7 }} />
                      {new Date(order.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Right: Price & Quick Action Toolbar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                        Total
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--c-text-1)', fontVariantNumeric: 'tabular-nums' }}>
                        ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    {/* Operations */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                      {!isCancelled ? (
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId((prev) => (prev === order.id ? null : order.id));
                            }}
                            className="glass-btn"
                            style={{
                              padding: '7px 14px',
                              fontSize: 12,
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span>Manage Order</span>
                            <ChevronDown
                              size={14}
                              style={{
                                transform: activeActionMenuId === order.id ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.15s ease',
                              }}
                            />
                          </button>

                          {activeActionMenuId === order.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="glass-panel"
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: 'calc(100% + 6px)',
                                width: 220,
                                padding: '6px',
                                borderRadius: 'var(--r-md)',
                                boxShadow: 'var(--glass-hover-shadow), 0 10px 25px rgba(0,0,0,0.5)',
                                zIndex: 50,
                                animation: 'scaleIn 0.15s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 4,
                              }}
                            >
                              <div style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Next Step ({order.status})
                              </div>

                              {order.status === 'CONFIRMED' && (
                                <button
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    handleStatusUpdate(order.id, 'PROCESSING');
                                  }}
                                  disabled={isUpdatingStatus}
                                  className="glass-btn"
                                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-sm)' }}
                                >
                                  <Clock size={14} color="var(--warning)" />
                                  <span>Mark Processing</span>
                                </button>
                              )}

                              {(order.status === 'CONFIRMED' || order.status === 'PROCESSING') && (
                                <button
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    setShippingModalOrder(order);
                                    generateTrackingNumber();
                                  }}
                                  className="glass-btn"
                                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-sm)' }}
                                >
                                  <Truck size={14} color="var(--info)" />
                                  <span>Dispatch / Ship...</span>
                                </button>
                              )}

                              {order.status === 'SHIPPED' && (
                                <button
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    handleStatusUpdate(order.id, 'DELIVERED');
                                  }}
                                  disabled={isUpdatingStatus}
                                  className="glass-btn"
                                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-sm)' }}
                                >
                                  <CheckCircle2 size={14} color="var(--success)" />
                                  <span>Mark Delivered</span>
                                </button>
                              )}

                              {order.status === 'DELIVERED' && (
                                <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <CheckCircle2 size={14} />
                                  <span>Order Completed</span>
                                </div>
                              )}

                              {/* Packing Slip with QR Codes for Picking & Packing */}
                              {(order.status === 'CONFIRMED' || order.status === 'PAID' || order.status === 'PROCESSING') && (
                                <button
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    handlePrintPackingLabels(order);
                                  }}
                                  className="glass-btn"
                                  style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px', fontSize: 12, borderRadius: 'var(--r-sm)' }}
                                  title="Print picking slip with QR codes for this order and all its items"
                                >
                                  <QrCode size={14} color="var(--warning)" />
                                  <span>Print QR Packing Slip</span>
                                </button>
                              )}

                              {(order.status === 'CONFIRMED' || order.status === 'PROCESSING' || order.status === 'PENDING' || order.status === 'PAID') && (
                                <>
                                  <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />
                                  <button
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      setCancelModalOrder(order);
                                      setCancelReason('Cancelled by admin operator');
                                    }}
                                    className="glass-btn"
                                    style={{
                                      width: '100%',
                                      justifyContent: 'flex-start',
                                      padding: '8px 12px',
                                      fontSize: 12,
                                      borderRadius: 'var(--r-sm)',
                                      color: 'var(--danger)',
                                    }}
                                  >
                                    <Ban size={14} color="var(--danger)" />
                                    <span>Cancel Order...</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', padding: '6px 12px', borderRadius: 'var(--r-full)', background: 'var(--glass-bg)' }}>
                          Closed
                        </span>
                      )}

                      <button
                        onClick={() => toggleTimeline(order.id)}
                        className="glass-btn"
                        style={{ padding: '7px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <span>Timeline</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress Pipeline Ribbon */}
                {!isCancelled && (
                  <div
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(0,0,0,0.12)',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      overflowX: 'auto',
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: 6 }}>
                      Status Flow:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                      {stages.map((stage, idx) => {
                        const state = getStageState(stage.key);
                        const isDone = state === 'done';
                        const isCurr = state === 'current';

                        return (
                          <React.Fragment key={stage.key}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                padding: '4px 10px',
                                borderRadius: 'var(--r-full)',
                                fontSize: 11,
                                fontWeight: isCurr ? 700 : 500,
                                background: isDone
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : isCurr
                                  ? 'var(--accent-light)'
                                  : 'var(--glass-bg)',
                                color: isDone
                                  ? 'var(--success)'
                                  : isCurr
                                  ? 'var(--accent)'
                                  : 'var(--c-text-3)',
                                border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : isCurr ? 'rgba(56, 189, 248, 0.4)' : 'transparent'}`,
                              }}
                            >
                              <span
                                style={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  background: isDone
                                    ? 'var(--success)'
                                    : isCurr
                                    ? 'var(--accent)'
                                    : 'var(--c-text-3)',
                                }}
                              />
                              <span>{stage.label}</span>
                            </div>
                            {idx < stages.length - 1 && (
                              <div
                                style={{
                                  width: 14,
                                  height: 1,
                                  background: isDone ? 'var(--success)' : 'var(--border-subtle)',
                                  opacity: 0.6,
                                }}
                              />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Details Body */}
                <div style={{ padding: '20px', fontSize: 13 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                    {/* Left: Products & Cart Details */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ShoppingBag size={14} color="var(--accent)" />
                          <span>Purchased Products ({totalItemCount} {totalItemCount === 1 ? 'unit' : 'units'})</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 14px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--glass-bg)',
                              border: '1px solid var(--border-subtle)',
                              boxShadow: 'var(--glass-highlight)',
                              gap: 12,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, color: 'var(--c-text-1)', fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {item.productName}
                              </div>
                              <div style={{ fontSize: 11, color: 'var(--c-text-3)', fontFamily: 'monospace', marginTop: 3 }}>
                                SKU: <strong style={{ color: 'var(--c-text-2)' }}>{item.sku}</strong> • {item.quantity} × ${item.price.toFixed(2)}
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--c-text-1)', fontSize: 14, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                              ${item.subtotal.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Fulfillment, Logistics & Customer info */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Truck size={14} color="var(--accent)" />
                        <span>Fulfillment & Logistics</span>
                      </div>

                      <div
                        style={{
                          padding: '16px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--glass-bg)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          boxShadow: 'var(--glass-highlight)',
                        }}
                      >
                        {/* Shipping Destination */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: 'var(--c-text-2)' }}>
                          <MapPin size={16} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                          <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                            <div style={{ fontSize: 11, color: 'var(--c-text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Delivery Address
                            </div>
                            <span style={{ color: 'var(--c-text-1)' }}>{order.shippingAddress || 'Standard Destination on File'}</span>
                          </div>
                        </div>

                        {/* Dispatch Tracking Banner */}
                        {order.trackingNumber ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              background: 'rgba(56, 189, 248, 0.08)',
                              borderRadius: 'var(--r-sm)',
                              border: '1px solid rgba(56, 189, 248, 0.20)',
                              gap: 10,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                              <Truck size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                              <div style={{ fontSize: 12, minWidth: 0 }}>
                                <div style={{ color: 'var(--c-text-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Carrier: <strong style={{ color: 'var(--c-text-1)' }}>{order.carrier || 'Logistics Partner'}</strong>
                                </div>
                                <code style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 11 }}>
                                  {order.trackingNumber}
                                </code>
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(order.trackingNumber!, `track-${order.id}`)}
                              className="glass-btn"
                              style={{ padding: '4px 8px', fontSize: 11, height: 26, flexShrink: 0 }}
                              title="Copy Tracking Number"
                            >
                              {copiedId === `track-${order.id}` ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
                                  <Check size={12} /> Copied
                                </span>
                              ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Copy size={12} /> Copy
                                </span>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: 'var(--c-text-3)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={13} />
                            <span>Awaiting dispatch manifest generation</span>
                          </div>
                        )}

                        {/* Metadata IDs Grid */}
                        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <User size={12} /> Customer Ref:
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <code style={{ color: 'var(--c-text-2)', fontSize: 11 }}>
                                {order.userId.length > 20 ? `${order.userId.slice(0, 16)}...` : order.userId}
                              </code>
                              <button
                                onClick={() => copyToClipboard(order.userId, `user-${order.id}`)}
                                className="glass-btn"
                                style={{ padding: '2px 5px', height: 20 }}
                                title="Copy User ID"
                              >
                                {copiedId === `user-${order.id}` ? <Check size={10} color="var(--success)" /> : <Copy size={10} />}
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--c-text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Hash size={12} /> Order UUID:
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <code style={{ color: 'var(--c-text-2)', fontSize: 11 }}>
                                {order.id.length > 20 ? `${order.id.slice(0, 16)}...` : order.id}
                              </code>
                              <button
                                onClick={() => copyToClipboard(order.id, `id-${order.id}`)}
                                className="glass-btn"
                                style={{ padding: '2px 5px', height: 20 }}
                                title="Copy Order UUID"
                              >
                                {copiedId === `id-${order.id}` ? <Check size={10} color="var(--success)" /> : <Copy size={10} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Saga Stepper */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 20,
                        paddingTop: 18,
                        borderTop: '1px solid var(--border-subtle)',
                        animation: 'fadeIn 0.25s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Layers size={15} color="var(--accent)" />
                          <span>Distributed Kafka Saga Lifecycle Stepper</span>
                        </div>
                        {timelineData && (
                          <span style={{ fontSize: 11, color: 'var(--c-text-3)', fontFamily: 'monospace' }}>
                            Saga Status: <strong style={{ color: 'var(--accent)' }}>{timelineData.sagaStatus}</strong>
                          </span>
                        )}
                      </div>

                      {isLoadingTimeline ? (
                        <div style={{ padding: 20, textAlign: 'center', color: 'var(--c-text-3)' }}>
                          Loading live event chain from Kafka & Outbox...
                        </div>
                      ) : !timelineData?.timeline?.length ? (
                        <div style={{ padding: 16, color: 'var(--c-text-3)' }}>No timeline events recorded yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {timelineData.timeline.map((step, sIdx) => {
                            const isDone = step.status === 'COMPLETED';
                            const isFail = step.status === 'FAILED';

                            return (
                              <div
                                key={sIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 12,
                                  padding: '12px 16px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: isFail
                                    ? 'var(--danger-light)'
                                    : isDone
                                    ? 'var(--success-light)'
                                    : 'var(--glass-bg)',
                                  border: `1px solid ${isFail ? 'rgba(239, 68, 68, 0.25)' : isDone ? 'rgba(16, 185, 129, 0.20)' : 'var(--border-subtle)'}`,
                                  boxShadow: 'var(--glass-highlight)',
                                }}
                              >
                                <div
                                  style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    background: isFail ? 'var(--danger)' : isDone ? 'var(--success)' : 'var(--border)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    marginTop: 2,
                                  }}
                                >
                                  {isDone ? '✓' : isFail ? '✕' : sIdx + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-1)' }}>
                                      {step.title}
                                    </span>
                                    <span style={{ fontSize: 11, color: 'var(--c-text-3)' }}>
                                      {new Date(step.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 12, color: 'var(--c-text-2)', marginTop: 2 }}>
                                    {step.description}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Pagination Bar */}
        {totalOrders > 0 && (
          <div className="glass-panel pagination-container" style={{ borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: 12, color: 'var(--c-text-3)', fontWeight: 500 }}>
              Showing <strong style={{ color: 'var(--c-text-1)' }}>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
              <strong style={{ color: 'var(--c-text-1)' }}>{Math.min(currentPage * pageSize, totalOrders)}</strong> of{' '}
              <strong style={{ color: 'var(--c-text-1)' }}>{totalOrders}</strong> orders
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

      {/* Dispatch & Shipping Modal Portaled to Document Body */}
      {shippingModalOrder && typeof document !== 'undefined' && createPortal(
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
          onClick={() => setShippingModalOrder(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: 500,
              padding: 30,
              boxShadow: 'var(--glass-hover-shadow), var(--glass-highlight)',
              animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
                    background: 'var(--info-light)',
                    color: 'var(--info)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--c-text-1)' }}>
                    Dispatch & Ship Order
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--c-text-3)', fontFamily: 'monospace' }}>
                    #{shippingModalOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShippingModalOrder(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', padding: 6 }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStatusUpdate(shippingModalOrder.id, 'SHIPPED', trackingNumber, carrier, shippingNotes);
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Logistics Carrier
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="glass-input"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                  }}
                >
                  <option value="FedEx Priority">FedEx Priority</option>
                  <option value="DHL Express Worldwide">DHL Express Worldwide</option>
                  <option value="UPS Express Saver">UPS Express Saver</option>
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                  <option value="BlueDart Logistics">BlueDart Logistics</option>
                </select>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Carrier Tracking Number
                  </label>
                  <button
                    type="button"
                    onClick={generateTrackingNumber}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--accent)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. FDX-98124912"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="glass-input"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    fontFamily: 'monospace',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Dispatch Notes
                </label>
                <input
                  type="text"
                  value={shippingNotes}
                  onChange={(e) => setShippingNotes(e.target.value)}
                  className="glass-input"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  className="glass-btn"
                  style={{ flex: 1, padding: '11px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStatus || !trackingNumber.trim()}
                  className="glass-btn-primary"
                  style={{
                    flex: 2,
                    padding: '11px',
                    fontSize: 13,
                    cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isUpdatingStatus ? 'Transmitting Kafka Event...' : 'Confirm Shipment & Notify Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Cancel Order Confirmation Modal Portaled to Document Body */}
      {cancelModalOrder && typeof document !== 'undefined' && createPortal(
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
          onClick={() => setCancelModalOrder(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: 480,
              padding: 30,
              boxShadow: 'var(--glass-hover-shadow), var(--glass-highlight)',
              animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--r-md)',
                    background: 'var(--danger-light)',
                    color: 'var(--danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--c-text-1)' }}>
                    Cancel Order
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--c-text-3)', fontFamily: 'monospace' }}>
                    #{cancelModalOrder.orderNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCancelModalOrder(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--c-text-3)', cursor: 'pointer', padding: 6 }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--c-text-1)',
                fontSize: 13,
                marginBottom: 18,
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to cancel order <strong>#{cancelModalOrder.orderNumber}</strong>?
              This will publish an <code>ORDER_CANCELLED</code> Kafka event, triggering Saga compensation to release inventory locks.
            </div>

            <form onSubmit={handleCancelOrder}>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--c-text-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Cancellation Reason
                </label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="glass-input"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    boxSizing: 'border-box',
                  }}
                  placeholder="Provide reason for cancellation..."
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="glass-btn"
                  style={{ flex: 1, padding: '11px' }}
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  style={{
                    flex: 2,
                    padding: '11px',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 'var(--r-full)',
                    background: 'var(--danger)',
                    color: '#fff',
                    border: 'none',
                    cursor: isCancelling ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                  }}
                >
                  {isCancelling ? 'Cancelling & Rolling Back...' : 'Confirm Order Cancellation'}
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
