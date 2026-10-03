import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth, useTheme } from '../context/AppContext';
import { orderApi } from '../services/api';
import { Order } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  Moon, 
  Sun, 
  LogOut, 
  Package, 
  CreditCard, 
  Check, 
  Sparkles, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight,
  XCircle,
  Gift
} from 'lucide-react';

type Tab = 'INFO' | 'ORDERS' | 'PREF';
type OrderFilter = 'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = (searchParams.get('tab')?.toUpperCase() as Tab) || 'INFO';
  const [activeTab, setActiveTab] = useState<Tab>(['INFO', 'ORDERS', 'PREF'].includes(initialTab) ? initialTab : 'INFO');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Orders & Stats state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('ALL');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ orderCount: 0, totalSpent: 0 });

  // Form state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Keep form state in sync with user context
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrdersAndStats = async () => {
      try {
        setLoadingOrders(true);
        const res = await orderApi.getOrders();
        const orderList = res.data?.content ?? [];
        // Sort newest first
        const sorted = [...orderList].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setOrders(sorted);

        let total = 0;
        sorted.forEach(order => {
          if (order.status !== 'CANCELLED' && order.status !== 'FAILED') {
            order.items?.forEach(item => {
              total += (item.price || 0) * item.quantity;
            });
          }
        });
        setStats({ orderCount: sorted.length, totalSpent: total });
      } catch (err) {
        console.error('Failed to load orders and stats', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrdersAndStats();
  }, [user, navigate]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'INFO' ? {} : { tab: tab.toLowerCase() });
  };

  if (!user) return null;

  const initials = `${(user.firstName || 'U').charAt(0)}${(user.lastName || '').charAt(0)}`.toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setSaveError('First and last name are required');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim()
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1200);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setSaveError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setPhone(user.phone || '');
    setSaveError('');
    setIsEditing(false);
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancellingId(orderId);
    try {
      await orderApi.cancelOrder(orderId, 'User requested cancellation from profile');
      // Reload orders
      const res = await orderApi.getOrders();
      const orderList = res.data?.content ?? [];
      setOrders([...orderList].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      console.error('Failed to cancel order', err);
      alert('Could not cancel this order. It may have already shipped.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'INVENTORY_RESERVED':
      case 'PAYMENT_PENDING':
      case 'PAID':
      case 'CONFIRMED':
        return { label: 'Processing', color: '#D97706', bg: 'rgba(217, 119, 6, 0.12)' };
      case 'PROCESSING':
        return { label: 'Preparing', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' };
      case 'SHIPPED':
        return { label: 'Shipped', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' };
      case 'DELIVERED':
        return { label: 'Delivered', color: '#16A34A', bg: 'rgba(22, 163, 74, 0.12)' };
      case 'CANCELLED':
      case 'FAILED':
        return { label: 'Cancelled', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)' };
      case 'REFUND_PENDING':
      case 'REFUNDED':
        return { label: 'Refunded', color: '#9333EA', bg: 'rgba(147, 51, 234, 0.12)' };
      default:
        return { label: status, color: 'var(--c-text-2)', bg: 'var(--c-surface-raised)' };
    }
  };

  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'ALL') return true;
    const { label } = getStatusDisplay(order.status);
    if (orderFilter === 'PROCESSING' && (label === 'Processing' || label === 'Preparing')) return true;
    if (orderFilter === 'SHIPPED' && label === 'Shipped') return true;
    if (orderFilter === 'DELIVERED' && label === 'Delivered') return true;
    if (orderFilter === 'CANCELLED' && label === 'Cancelled') return true;
    return false;
  });

  return (
    <div className="profile-page-container">
      <div className="profile-grid-layout">
        
        {/* Unified Sidebar Card */}
        <aside className="profile-sidebar-card">
          <div className="sidebar-avatar-section">
            <div className="sidebar-avatar">
              {initials}
            </div>
            <h2 className="sidebar-user-name">
              {user.firstName} {user.lastName}
            </h2>
            <p className="sidebar-user-email">{user.email}</p>
            <div className="sidebar-member-badge">
              Member since 2026
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Navigation Items */}
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-nav-btn ${activeTab === 'INFO' ? 'active' : ''}`}
              onClick={() => handleTabChange('INFO')}
            >
              <User size={18} />
              <span>Account Info</span>
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'ORDERS' ? 'active' : ''}`}
              onClick={() => handleTabChange('ORDERS')}
            >
              <Package size={18} />
              <span>My Orders</span>
              {stats.orderCount > 0 && (
                <span className="sidebar-badge">{stats.orderCount}</span>
              )}
            </button>

            <button 
              className={`sidebar-nav-btn ${activeTab === 'PREF' ? 'active' : ''}`}
              onClick={() => handleTabChange('PREF')}
            >
              <Moon size={18} />
              <span>Preferences</span>
            </button>

            <Link 
              to="/gift-cards"
              className="sidebar-nav-btn"
              style={{ textDecoration: 'none' }}
            >
              <Gift size={18} />
              <span>Gift Cards & Vault</span>
              <span className="sidebar-badge" style={{ background: 'rgba(196,151,74,0.15)', color: 'var(--c-accent-2)' }}>ACTIVE</span>
            </Link>
          </nav>

          <div className="sidebar-divider" />

          {/* Sign Out Button */}
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="sidebar-logout-btn">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="profile-main-content">
          
          {/* TAB 1: ACCOUNT INFORMATION */}
          {activeTab === 'INFO' && (
            <div className="tab-pane">
              
              {/* Account Information Header */}
              <div className="panel-header-row">
                <div>
                  <h3 className="panel-heading">Account Information</h3>
                  <p className="panel-subheading">Manage your personal contact details and account credentials.</p>
                </div>
                {!isEditing ? (
                  <button 
                    className="panel-action-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button 
                    className="panel-cancel-btn"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Account Details Card */}
              <div className="profile-glass-card">
                {saveError && (
                  <div className="profile-error-alert">
                    <AlertCircle size={16} />
                    <span>{saveError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveChanges}>
                  <div className="details-2col-grid">
                    <div className="detail-field">
                      <label className="field-label">First Name</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          required
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                          className="field-input"
                          placeholder="Your first name"
                        />
                      ) : (
                        <p className="field-value">{user.firstName || '—'}</p>
                      )}
                    </div>

                    <div className="detail-field">
                      <label className="field-label">Last Name</label>
                      {isEditing ? (
                        <input 
                          type="text"
                          required
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                          className="field-input"
                          placeholder="Your last name"
                        />
                      ) : (
                        <p className="field-value">{user.lastName || '—'}</p>
                      )}
                    </div>

                    <div className="detail-field">
                      <label className="field-label">Email Address</label>
                      <p className="field-value readonly">{user.email}</p>
                      {isEditing && (
                        <span className="field-hint">Email address is fixed to your identity</span>
                      )}
                    </div>

                    <div className="detail-field">
                      <label className="field-label">Phone Number</label>
                      {isEditing ? (
                        <input 
                          type="tel"
                          value={phone} 
                          placeholder="+1 (555) 000-0000"
                          onChange={(e) => setPhone(e.target.value)} 
                          className="field-input"
                        />
                      ) : (
                        <p className="field-value">{user.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="edit-actions-bar">
                      <button 
                        type="button" 
                        className="btn-text-cancel"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className={`btn-save-changes ${saveSuccess ? 'success' : ''}`}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        ) : saveSuccess ? (
                          <>
                            <Check size={16} />
                            <span>Saved Successfully!</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Quick Stats Section */}
              <div className="panel-header-row" style={{ marginTop: '36px' }}>
                <div>
                  <h3 className="panel-heading">Quick Stats</h3>
                  <p className="panel-subheading">Your lifetime purchasing summary and activity overview.</p>
                </div>
              </div>

              <div className="stats-2col-grid">
                <div className="stat-glass-card">
                  <div className="stat-icon-wrapper">
                    <Package size={22} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">{stats.orderCount}</span>
                    <span className="stat-caption">Total Orders Placed</span>
                  </div>
                </div>

                <div className="stat-glass-card">
                  <div className="stat-icon-wrapper">
                    <CreditCard size={22} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">${stats.totalSpent.toFixed(2)}</span>
                    <span className="stat-caption">Total Lifetime Spent</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDER SUMMARY & HISTORY */}
          {activeTab === 'ORDERS' && (
            <div className="tab-pane">
              <div className="panel-header-row">
                <div>
                  <h3 className="panel-heading">Order Summary & History</h3>
                  <p className="panel-subheading">Track live fulfillment, view itemized receipts, and order progress.</p>
                </div>
                <Link to="/products" className="panel-action-btn" style={{ textDecoration: 'none' }}>
                  Browse Catalog
                </Link>
              </div>

              {/* Filter Chips */}
              <div className="orders-filter-chips">
                {(['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderFilter[]).map((f) => (
                  <button
                    key={f}
                    className={`order-filter-chip ${orderFilter === f ? 'active' : ''}`}
                    onClick={() => setOrderFilter(f)}
                  >
                    {f === 'ALL' ? `All Orders (${orders.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* Orders List / Empty State */}
              {loadingOrders ? (
                <div className="orders-loading-card">
                  <div style={{ width: 28, height: 28, border: '3px solid var(--glass-border)', borderTopColor: 'var(--c-accent-2)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, color: 'var(--c-text-2)', fontSize: '14px' }}>Loading order history...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="orders-empty-card">
                  <div className="orders-empty-icon">
                    <Package size={44} strokeWidth={1.2} />
                  </div>
                  <h4>No orders found</h4>
                  <p>
                    {orderFilter === 'ALL'
                      ? "You haven't placed any orders yet. Discover our curated collections and enjoy complimentary delivery."
                      : `No orders currently matching the "${orderFilter.toLowerCase()}" filter.`}
                  </p>
                  <Link to="/products" className="orders-explore-btn">
                    <span>Explore Products</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : (
                <div className="orders-cards-stack">
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusDisplay(order.status);
                    const isExpanded = expandedOrders.has(order.id);
                    const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    const canCancel = order.status === 'PENDING' || order.status === 'PROCESSING' || order.status === 'INVENTORY_RESERVED' || order.status === 'CONFIRMED';

                    return (
                      <div key={order.id} className="order-summary-card">
                        {/* Top Summary Bar */}
                        <div className="order-card-header">
                          <div className="order-id-meta">
                            <span className="order-num-text">Order #{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="order-date-text">{orderDate}</span>
                            <span className="order-count-pill">{order.items?.length || 0} items</span>
                          </div>

                          <div className="order-header-right">
                            <span 
                              className="order-status-badge" 
                              style={{ color: statusInfo.color, background: statusInfo.bg }}
                            >
                              {statusInfo.label}
                            </span>
                            <span className="order-total-price">
                              ${Number(order.totalAmount).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Items Preview Row */}
                        <div className="order-items-preview">
                          <div className="order-thumbs-row">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="order-item-chip" title={`${item.productName} (x${item.quantity})`}>
                                <span className="item-name-preview">{item.productName}</span>
                                <span className="item-qty-tag">×{item.quantity}</span>
                              </div>
                            ))}
                            {order.items && order.items.length > 2 && (
                              <button 
                                type="button"
                                className="order-more-chip" 
                                onClick={() => toggleExpandOrder(order.id)}
                                title="Click to view all items"
                              >
                                +{order.items.length - 2} more items
                              </button>
                            )}
                          </div>

                          <button 
                            className="order-toggle-expand-btn"
                            onClick={() => toggleExpandOrder(order.id)}
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>

                        {/* Expandable Order Details Panel */}
                        {isExpanded && (
                          <div className="order-expanded-details">
                            {/* Simple Progress Bar */}
                            <div className="order-progress-stepper">
                              <div className="stepper-step completed">
                                <div className="step-circle"><Check size={12} /></div>
                                <span className="step-label">Placed</span>
                              </div>
                              <div className={`stepper-line ${order.status !== 'CANCELLED' ? 'active' : ''}`} />
                              <div className={`stepper-step ${order.status !== 'CANCELLED' ? 'completed' : ''}`}>
                                <div className="step-circle">
                                  {['SHIPPED', 'DELIVERED'].includes(order.status) ? <Check size={12} /> : <Clock size={12} />}
                                </div>
                                <span className="step-label">Processing</span>
                              </div>
                              <div className={`stepper-line ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'active' : ''}`} />
                              <div className={`stepper-step ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'completed' : ''}`}>
                                <div className="step-circle">
                                  {order.status === 'DELIVERED' ? <Check size={12} /> : <Truck size={12} />}
                                </div>
                                <span className="step-label">Shipped</span>
                              </div>
                              <div className={`stepper-line ${order.status === 'DELIVERED' ? 'active' : ''}`} />
                              <div className={`stepper-step ${order.status === 'DELIVERED' ? 'completed' : ''}`}>
                                <div className="step-circle"><CheckCircle2 size={12} /></div>
                                <span className="step-label">Delivered</span>
                              </div>
                            </div>

                            {/* Itemized Table */}
                            <div className="order-itemized-list">
                              <h5 className="sub-title">Purchased Items ({order.items?.length || 0})</h5>
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="itemized-row">
                                  <div className="item-desc">
                                    <span className="item-title-text">{item.productName}</span>
                                    <span className="item-sku-text">SKU: {item.sku || 'N/A'}</span>
                                  </div>
                                  <div className="item-qty-price">
                                    <span className="item-qty-calc">{item.quantity} × ${(item.price || 0).toFixed(2)}</span>
                                    <span className="item-subtotal">${((item.price || 0) * item.quantity).toFixed(2)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Shipping & Payment Footer Info */}
                            <div className="order-footer-details">
                              <div className="shipping-dest">
                                <span className="dest-label">Delivery Destination:</span>
                                <span className="dest-addr">{order.shippingAddress || 'Address on file'}</span>
                              </div>

                              {canCancel && (
                                <button
                                  className="btn-cancel-order"
                                  onClick={() => handleCancelOrder(order.id)}
                                  disabled={cancellingId === order.id}
                                >
                                  {cancellingId === order.id ? (
                                    <span>Cancelling...</span>
                                  ) : (
                                    <>
                                      <XCircle size={14} />
                                      <span>Cancel Order</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PREFERENCES */}
          {activeTab === 'PREF' && (
            <div className="tab-pane">
              <div className="panel-header-row">
                <div>
                  <h3 className="panel-heading">Preferences</h3>
                  <p className="panel-subheading">Personalize your visual theme and notification settings.</p>
                </div>
              </div>

              <div className="profile-glass-card">
                <div className="pref-row-item">
                  <div>
                    <h4 className="pref-title">Visual Appearance</h4>
                    <p className="pref-desc">Toggle between Light aesthetic and Dark high-contrast palette</p>
                  </div>
                  <button className="pref-theme-btn" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                  </button>
                </div>

                <div className="pref-divider" />

                <div className="pref-row-item">
                  <div>
                    <h4 className="pref-title">Concierge Notifications</h4>
                    <p className="pref-desc">Receive real-time order dispatch notifications and tracking updates</p>
                  </div>
                  <label className="pref-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="switch-slider" />
                  </label>
                </div>

                <div className="pref-divider" />

                <div className="pref-row-item">
                  <div>
                    <h4 className="pref-title">Currency & Region</h4>
                    <p className="pref-desc">Display catalogue pricing in your local currency</p>
                  </div>
                  <select className="pref-select" defaultValue="USD">
                    <option value="USD">USD ($) — United States Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      <style>{`
        .profile-page-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 24px 80px;
          box-sizing: border-box;
        }

        .profile-grid-layout {
          width: 100%;
          display: grid;
          grid-template-columns: 290px minmax(0, 1fr);
          gap: 36px;
          align-items: start;
          box-sizing: border-box;
        }

        /* Unified Left Sidebar Card */
        .profile-sidebar-card {
          width: 100%;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .sidebar-avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding-bottom: 20px;
        }

        .sidebar-avatar {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1E3A8A 0%, #172554 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 14px;
          box-shadow: 0 4px 14px rgba(30, 58, 138, 0.35);
        }

        .sidebar-user-name {
          font-size: 19px;
          font-weight: 700;
          color: var(--c-text-1);
          margin: 0 0 4px 0;
          line-height: 1.3;
        }

        .sidebar-user-email {
          font-size: 13px;
          color: var(--c-text-2);
          margin: 0 0 10px 0;
          word-break: break-all;
        }

        .sidebar-member-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--c-accent-2);
          background: rgba(196, 151, 74, 0.12);
          padding: 4px 12px;
          border-radius: var(--r-full);
        }

        .sidebar-divider {
          height: 1px;
          background: var(--glass-border);
          margin: 8px 0 16px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sidebar-nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--r-md);
          background: transparent;
          border: none;
          color: var(--c-text-2);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
          width: 100%;
          box-sizing: border-box;
          text-align: left;
          position: relative;
        }

        .sidebar-nav-btn:hover {
          color: var(--c-text-1);
          background: var(--c-surface-raised);
        }

        .sidebar-nav-btn.active {
          color: var(--c-text-1);
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border: 1px solid var(--glass-border);
        }

        [data-theme='dark'] .sidebar-nav-btn.active {
          background: rgba(30, 41, 59, 0.85);
        }

        .sidebar-badge {
          margin-left: auto;
          background: var(--c-surface-raised);
          border: 1px solid var(--glass-border);
          color: var(--c-text-1);
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--r-full);
        }

        .sidebar-footer {
          padding-top: 4px;
        }

        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--r-md);
          background: transparent;
          border: none;
          color: #EF4444;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: left;
          transition: background var(--transition);
        }

        .sidebar-logout-btn:hover {
          background: rgba(239, 68, 68, 0.08);
        }

        /* Right Content Column */
        .profile-main-content {
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .tab-pane {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .panel-header-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .panel-heading {
          margin: 0 0 4px;
          font-size: 22px;
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.02em;
        }

        .panel-subheading {
          margin: 0;
          font-size: 13px;
          color: var(--c-text-2);
        }

        .panel-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 22px;
          border-radius: var(--r-full);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          color: var(--c-text-1);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .panel-action-btn:hover {
          background: var(--c-surface-raised);
          border-color: var(--c-accent-2);
        }

        .panel-cancel-btn {
          padding: 8px 18px;
          border-radius: var(--r-full);
          background: transparent;
          border: 1px solid var(--c-border);
          color: var(--c-text-2);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .panel-cancel-btn:hover {
          color: var(--c-text-1);
          border-color: var(--c-text-1);
        }

        .profile-glass-card {
          width: 100%;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          padding: 32px;
          box-sizing: border-box;
        }

        .profile-error-alert {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: var(--r-md);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #DC2626;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .details-2col-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 28px 32px;
        }

        .detail-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--c-text-3);
        }

        .field-value {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          color: var(--c-text-1);
          padding: 6px 0;
        }

        .field-value.readonly {
          color: var(--c-text-2);
        }

        .field-hint {
          font-size: 11px;
          color: var(--c-text-3);
          font-style: italic;
        }

        .field-input {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--r-md);
          border: 1px solid var(--c-border);
          background: var(--c-surface);
          color: var(--c-text-1);
          font-size: 14px;
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
        }

        .field-input:focus {
          border-color: var(--c-accent-2);
          box-shadow: 0 0 0 3px rgba(196, 151, 74, 0.2);
        }

        .edit-actions-bar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid var(--glass-border);
        }

        .btn-text-cancel {
          padding: 10px 20px;
          border-radius: var(--r-full);
          background: transparent;
          border: 1px solid var(--c-border);
          color: var(--c-text-2);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-save-changes {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .btn-save-changes:hover {
          opacity: 0.9;
        }

        .btn-save-changes.success {
          background: var(--c-success);
        }

        /* Quick Stats Grid — strictly 2 equal columns spanning 100% */
        .stats-2col-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          box-sizing: border-box;
        }

        .stat-glass-card {
          width: 100%;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-sizing: border-box;
          transition: transform var(--transition);
        }

        .stat-glass-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: var(--r-lg);
          background: rgba(196, 151, 74, 0.12);
          color: var(--c-accent-2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stat-number {
          font-size: 26px;
          font-weight: 800;
          color: var(--c-text-1);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .stat-caption {
          font-size: 13px;
          color: var(--c-text-2);
          font-weight: 500;
        }

        /* Order Summary & History Tab Styles */
        .orders-filter-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .order-filter-chip {
          padding: 8px 16px;
          border-radius: var(--r-full);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          color: var(--c-text-2);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .order-filter-chip:hover {
          color: var(--c-text-1);
          border-color: var(--c-accent-2);
        }

        .order-filter-chip.active {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border-color: var(--c-accent);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .orders-loading-card {
          text-align: center;
          padding: 60px 20px;
          background: var(--glass-bg);
          border-radius: var(--r-xl);
          border: 1px solid var(--glass-border);
        }

        .orders-empty-card {
          text-align: center;
          padding: 60px 24px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border-radius: var(--r-xl);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow);
        }

        .orders-empty-icon {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: rgba(196, 151, 74, 0.1);
          color: var(--c-accent-2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .orders-empty-card h4 {
          margin: 0 0 8px;
          font-size: 19px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .orders-empty-card p {
          font-size: 14px;
          color: var(--c-text-2);
          max-width: 440px;
          margin: 0 auto 24px;
          line-height: 1.6;
        }

        .orders-explore-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .orders-cards-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .order-summary-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          border-radius: var(--r-xl);
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: border-color var(--transition);
        }

        .order-summary-card:hover {
          border-color: var(--glass-border-hover);
        }

        .order-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--glass-border);
          flex-wrap: wrap;
          gap: 12px;
        }

        .order-id-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .order-num-text {
          font-family: monospace;
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text-1);
          letter-spacing: 0.04em;
        }

        .order-date-text {
          font-size: 13px;
          color: var(--c-text-3);
        }

        .order-count-pill {
          font-size: 11px;
          font-weight: 600;
          color: var(--c-text-2);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border);
          padding: 2px 8px;
          border-radius: var(--r-full);
          white-space: nowrap;
        }

        .order-header-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .order-status-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: var(--r-full);
        }

        .order-total-price {
          font-size: 17px;
          font-weight: 800;
          color: var(--c-text-1);
        }

        .order-items-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .order-thumbs-row {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          flex: 1;
        }

        .order-item-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--r-md);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border-subtle);
          font-size: 12px;
          color: var(--c-text-1);
          max-width: 220px;
        }

        .item-name-preview {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .item-qty-tag {
          font-weight: 700;
          color: var(--c-accent-2);
        }

        .order-more-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: var(--r-md);
          background: rgba(196, 151, 74, 0.12);
          border: 1px solid rgba(196, 151, 74, 0.28);
          color: var(--c-accent-2);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition);
          white-space: nowrap;
        }

        .order-more-chip:hover {
          background: var(--c-accent-2);
          color: #FFFFFF;
          border-color: var(--c-accent-2);
        }

        .order-toggle-expand-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: var(--r-full);
          background: transparent;
          border: 1px solid var(--c-border);
          color: var(--c-text-2);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .order-toggle-expand-btn:hover {
          color: var(--c-text-1);
          border-color: var(--c-text-1);
        }

        .order-expanded-details {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fadeIn 0.2s ease;
        }

        .order-progress-stepper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--c-surface-raised);
          border-radius: var(--r-lg);
          border: 1px solid var(--c-border-subtle);
        }

        .stepper-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .step-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--c-surface);
          border: 1px solid var(--c-border);
          color: var(--c-text-3);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stepper-step.completed .step-circle {
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border-color: var(--c-accent);
        }

        .step-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--c-text-3);
        }

        .stepper-step.completed .step-label {
          color: var(--c-text-1);
        }

        .stepper-line {
          flex: 1;
          height: 2px;
          background: var(--c-border);
          margin: 0 10px -14px;
        }

        .stepper-line.active {
          background: var(--c-accent);
        }

        .order-itemized-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sub-title {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--c-text-3);
        }

        .itemized-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: var(--r-md);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border-subtle);
        }

        .item-desc {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-title-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--c-text-1);
        }

        .item-sku-text {
          font-size: 11px;
          color: var(--c-text-3);
          font-family: monospace;
        }

        .item-qty-price {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .item-qty-calc {
          font-size: 13px;
          color: var(--c-text-2);
        }

        .item-subtotal {
          font-size: 14px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .order-footer-details {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 8px;
        }

        .shipping-dest {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .dest-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--c-text-3);
        }

        .dest-addr {
          font-size: 13px;
          color: var(--c-text-2);
        }

        .btn-cancel-order {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--r-full);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #DC2626;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .btn-cancel-order:hover {
          background: #DC2626;
          color: #FFFFFF;
        }

        /* Preferences Tab Content */
        .pref-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          gap: 20px;
        }

        .pref-title {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .pref-desc {
          margin: 0;
          font-size: 13px;
          color: var(--c-text-2);
        }

        .pref-divider {
          height: 1px;
          background: var(--c-border-subtle);
          margin: 20px 0;
        }

        .pref-theme-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: var(--r-full);
          background: var(--c-surface-raised);
          border: 1px solid var(--c-border);
          color: var(--c-text-1);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .pref-theme-btn:hover {
          border-color: var(--c-accent-2);
        }

        .pref-select {
          padding: 8px 14px;
          border-radius: var(--r-md);
          border: 1px solid var(--c-border);
          background: var(--c-surface);
          color: var(--c-text-1);
          font-size: 13px;
          font-family: inherit;
          outline: none;
        }

        .pref-switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 26px;
        }

        .pref-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .switch-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: var(--c-border);
          transition: 0.3s;
          border-radius: 34px;
        }

        .switch-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        .pref-switch input:checked + .switch-slider {
          background-color: var(--c-accent-2);
        }

        .pref-switch input:checked + .switch-slider:before {
          transform: translateX(22px);
        }

        /* Responsive */
        @media (max-width: 860px) {
          .profile-grid-layout {
            grid-template-columns: 1fr;
          }
          .details-2col-grid {
            grid-template-columns: 1fr;
          }
          .stats-2col-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
