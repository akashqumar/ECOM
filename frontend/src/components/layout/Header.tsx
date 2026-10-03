import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Sun, Moon, Menu, X, User, Package, LogOut, ChevronDown, ChevronRight, Heart, Trash2 } from 'lucide-react';
import { useAuth, useCart, useTheme, useWishlist } from '../../context/AppContext';
import { catalogApi } from '../../services/api';
import { Product } from '../../types';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live search suggestions
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { user, logout } = useAuth();
  const { itemCount, addItem } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileNavOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Live search suggestions with debounce
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await catalogApi.getProducts({ search: trimmed, size: 6 });
        const items = res.data?.content || [];
        setSuggestions(items);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch search suggestions', err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSelectSuggestion = (productId: string) => {
    navigate(`/products/${productId}`);
    setShowSuggestions(false);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: 'var(--header-height, 64px)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: scrolled ? 'var(--glass-shadow), var(--glass-highlight)' : 'var(--glass-highlight)',
        transition: 'background var(--transition), box-shadow var(--transition), border-color var(--transition)'
      }}>
        <div style={{
          maxWidth: '1320px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Left: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="show-on-mobile"
              onClick={() => setMobileNavOpen(true)}
              style={{ color: 'var(--c-text-1)', padding: '4px' }}
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '26px', 
                height: '26px', 
                borderRadius: '8px', 
                background: 'linear-gradient(135deg, var(--c-accent-2) 0%, #38BDF8 100%)',
                boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 800
              }}>
                ✦
              </div>
              <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--c-text-1)' }}>LUMÉ</span>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          {(() => {
            const isShopAll = location.pathname === '/products';
            const isNewArrivals = location.pathname === '/new-arrivals' || location.search.includes('view=new') || location.search.includes('sort=createdAt,desc');
            const isSale = location.pathname === '/sale' || location.search.includes('view=sale') || location.search.includes('sort=discountPrice,asc');

            return (
              <nav className="hide-on-mobile" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                <Link to="/products" className={`nav-link ${isShopAll && !isNewArrivals && !isSale ? 'active' : ''}`}>
                  Shop All
                </Link>
                <Link to="/new-arrivals" className={`nav-link ${isNewArrivals ? 'active' : ''}`}>
                  New Arrivals
                  <span className="nav-badge nav-badge-new">NEW</span>
                </Link>
                <Link to="/sale" className={`nav-link ${isSale ? 'active' : ''} nav-link-sale`}>
                  Sale
                  <span className="nav-badge nav-badge-sale">HOT</span>
                </Link>
                <Link to="/gift-cards" className={`nav-link ${location.pathname === '/gift-cards' ? 'active' : ''}`}>
                  Gift Cards
                  <span className="nav-badge" style={{ background: 'rgba(196,151,74,0.15)', color: 'var(--c-accent-2)' }}>GIFT</span>
                </Link>
              </nav>
            );
          })()}

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Inline Navbar Search Container with Live Suggestions */}
            <div ref={searchContainerRef} className="nav-search-wrapper hide-on-mobile">
              <form onSubmit={handleSearch} className="nav-search-form">
                <Search size={15} className="nav-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="nav-search-input"
                />
                {isSearching ? (
                  <div className="nav-search-spinner" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="nav-search-clear"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                ) : null}
              </form>

              {/* Suggestions Dropdown Popover */}
              {showSuggestions && (
                <div className="search-suggestions-popover">
                  {suggestions.length > 0 ? (
                    <>
                      <div className="suggestions-header">
                        <span>Suggested Products</span>
                        <span className="suggestions-count">{suggestions.length} matches</span>
                      </div>
                      <div className="suggestions-list">
                        {suggestions.map((item) => {
                          const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              className="suggestion-item"
                              onClick={() => handleSelectSuggestion(item.id)}
                            >
                              <img
                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                                alt={item.name}
                                className="suggestion-thumb"
                              />
                              <div className="suggestion-details">
                                <span className="suggestion-name">{item.name}</span>
                                <span className="suggestion-brand">{item.brand || item.categoryName || 'LUMÉ'}</span>
                              </div>
                              <div className="suggestion-price-col">
                                <span className="suggestion-price">
                                  ${(item.discountPrice ?? item.price).toFixed(2)}
                                </span>
                                {hasDiscount && (
                                  <span className="suggestion-old-price">${item.price.toFixed(2)}</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        className="suggestions-view-all"
                        onClick={handleViewAllResults}
                      >
                        <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                        <ChevronRight size={14} />
                      </button>
                    </>
                  ) : searchQuery.trim().length >= 2 && !isSearching ? (
                    <div className="suggestions-empty">
                      <span>No products found matching &ldquo;{searchQuery}&rdquo;</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="show-on-mobile"
              style={{ color: 'var(--c-text-1)', padding: '4px' }}
              aria-label="Search"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button onClick={toggleTheme} className="hide-on-mobile" style={{ color: 'var(--c-text-1)', padding: '4px' }}>
              {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>
            
            {user ? (
              <div ref={userMenuRef} style={{ position: 'relative' }} className="hide-on-mobile">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--c-surface-raised), var(--c-border))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--c-text-1)',
                    border: '1px solid var(--c-border-subtle)'
                  }}>
                    {getInitials(`${user.firstName} ${user.lastName}`)}
                  </div>
                </button>
                
                {userMenuOpen && (
                  <div className="user-profile-menu-popover">
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--c-border-subtle)', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text-1)' }}>{user.firstName} {user.lastName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--c-text-2)' }} className="truncate-1">{user.email}</div>
                    </div>
                    <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <Package size={16} /> My Orders
                    </Link>
                    <button onClick={() => { setUserMenuOpen(false); logout(); }} className="dropdown-item" style={{ width: '100%', color: 'var(--c-error)' }}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hide-on-mobile" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--c-text-1)', marginLeft: '8px' }}>
                Sign in
              </Link>
            )}

            {/* Wishlist Button */}
            <button 
              type="button" 
              onClick={() => setWishlistDrawerOpen(true)}
              style={{
                position: 'relative',
                color: 'var(--c-text-1)',
                padding: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              aria-label="View Wishlist"
              title="View Wishlist"
            >
              <Heart 
                size={20} 
                strokeWidth={1.6} 
                fill={wishlist.length > 0 ? "#EF4444" : "none"} 
                color={wishlist.length > 0 ? "#EF4444" : "currentColor"} 
              />
              {wishlist.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-6px',
                  background: '#EF4444',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  height: '16px',
                  minWidth: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                }}>
                  {wishlist.length}
                </span>
              )}
            </button>

            <Link to="/cart" style={{ position: 'relative', color: 'var(--c-text-1)', padding: '4px' }}>
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-6px',
                  background: 'var(--c-accent-2)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 700,
                  height: '16px',
                  minWidth: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px'
                }}>
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Inline Search Dropdown Bar */}
      {searchOpen && (
        <div className="mobile-search-bar show-on-mobile">
          <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="mobile-search-input"
            />
            {isSearching ? (
              <div className="nav-search-spinner" style={{ position: 'absolute', right: '68px' }} />
            ) : searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="mobile-search-clear"
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setShowSuggestions(false);
              }}
              className="mobile-search-close-btn"
            >
              Cancel
            </button>
          </form>

          {/* Mobile Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="mobile-suggestions-list">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="suggestion-item"
                  onClick={() => handleSelectSuggestion(item.id)}
                >
                  <img
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="suggestion-thumb"
                  />
                  <div className="suggestion-details">
                    <span className="suggestion-name">{item.name}</span>
                    <span className="suggestion-brand">{item.brand || item.categoryName}</span>
                  </div>
                  <span className="suggestion-price">
                    ${(item.discountPrice ?? item.price).toFixed(2)}
                  </span>
                </button>
              ))}
              <button
                type="button"
                className="suggestions-view-all"
                onClick={handleViewAllResults}
              >
                <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--c-bg)',
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideDown 0.3s var(--transition)'
        }}>
          <div style={{ height: '56px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border-subtle)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', color: 'var(--c-text-1)' }}>LUMÉ</span>
            <button onClick={() => setMobileNavOpen(false)} style={{ color: 'var(--c-text-1)' }}><X size={20} strokeWidth={1.5} /></button>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto' }}>
            {(() => {
              const isShopAll = location.pathname === '/products';
              const isNewArrivals = location.pathname === '/new-arrivals' || location.search.includes('view=new') || location.search.includes('sort=createdAt,desc');
              const isSale = location.pathname === '/sale' || location.search.includes('view=sale') || location.search.includes('sort=discountPrice,asc');

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '18px' }}>
                  <Link 
                    to="/products" 
                    onClick={() => setMobileNavOpen(false)}
                    style={{ 
                      fontWeight: isShopAll && !isNewArrivals && !isSale ? 700 : 500,
                      color: isShopAll && !isNewArrivals && !isSale ? 'var(--c-accent-2)' : 'var(--c-text-1)'
                    }}
                  >
                    Shop All
                  </Link>
                  <Link 
                    to="/new-arrivals" 
                    onClick={() => setMobileNavOpen(false)}
                    style={{ 
                      fontWeight: isNewArrivals ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: isNewArrivals ? 'var(--c-accent-2)' : 'var(--c-text-1)'
                    }}
                  >
                    New Arrivals
                    <span className="nav-badge nav-badge-new">NEW</span>
                  </Link>
                  <Link 
                    to="/sale" 
                    onClick={() => setMobileNavOpen(false)}
                    style={{ 
                      fontWeight: isSale ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#EF4444'
                    }}
                  >
                    Sale
                    <span className="nav-badge nav-badge-sale">HOT</span>
                  </Link>
                  <Link 
                    to="/gift-cards" 
                    onClick={() => setMobileNavOpen(false)}
                    style={{ 
                      fontWeight: location.pathname === '/gift-cards' ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--c-accent-2)'
                    }}
                  >
                    Digital Gift Cards
                    <span className="nav-badge" style={{ background: 'rgba(196,151,74,0.15)', color: 'var(--c-accent-2)' }}>GIFT</span>
                  </Link>
                </div>
              );
            })()}
            
            <div style={{ height: '1px', background: 'var(--c-border-subtle)' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '16px' }}>
              <button 
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  setWishlistDrawerOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: 'var(--c-text-1)',
                  fontSize: '16px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Heart size={18} color="#EF4444" fill={wishlist.length > 0 ? "#EF4444" : "none"} />
                  My Wishlist
                </span>
                {wishlist.length > 0 && (
                  <span style={{
                    background: '#EF4444',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--r-full)'
                  }}>
                    {wishlist.length}
                  </span>
                )}
              </button>

              {user ? (
                <>
                  <Link to="/profile">Profile</Link>
                  <Link to="/orders">My Orders</Link>
                  <button onClick={() => { logout(); setMobileNavOpen(false); }} style={{ textAlign: 'left', color: 'var(--c-error)' }}>Sign out</button>
                </>
              ) : (
                <Link to="/login" style={{ fontWeight: 500 }}>Sign in</Link>
              )}
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--c-text-2)' }}>Theme</span>
              <button onClick={toggleTheme} style={{ color: 'var(--c-text-1)', padding: '8px', background: 'var(--c-surface-raised)', borderRadius: 'var(--r-full)' }}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Slide-Over Drawer */}
      {wishlistDrawerOpen && (
        <div className="wishlist-drawer-backdrop" onClick={() => setWishlistDrawerOpen(false)}>
          <div className="wishlist-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="wishlist-drawer-header">
              <div className="wishlist-header-title">
                <Heart size={20} color="#EF4444" fill="#EF4444" />
                <h3>My Wishlist ({wishlist.length})</h3>
              </div>
              <button 
                className="wishlist-close-btn" 
                onClick={() => setWishlistDrawerOpen(false)}
                aria-label="Close wishlist"
              >
                <X size={20} />
              </button>
            </div>

            <div className="wishlist-drawer-body">
              {wishlist.length === 0 ? (
                <div className="wishlist-empty-state">
                  <div className="wishlist-empty-icon">
                    <Heart size={44} strokeWidth={1.2} />
                  </div>
                  <h4>Your wishlist is empty</h4>
                  <p>Save items you love by tapping the heart icon on any product.</p>
                  <button 
                    className="wishlist-explore-btn"
                    onClick={() => {
                      setWishlistDrawerOpen(false);
                      navigate('/products');
                    }}
                  >
                    Discover Products
                  </button>
                </div>
              ) : (
                <div className="wishlist-items-list">
                  {wishlist.map((item) => {
                    const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                    return (
                      <div key={item.id} className="wishlist-card">
                        <Link 
                          to={`/products/${item.id}`} 
                          onClick={() => setWishlistDrawerOpen(false)}
                          className="wishlist-card-img-link"
                        >
                          <img 
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'} 
                            alt={item.name} 
                            className="wishlist-card-img"
                          />
                        </Link>
                        <div className="wishlist-card-info">
                          <span className="wishlist-card-brand">{item.brand || 'LUMÉ'}</span>
                          <Link 
                            to={`/products/${item.id}`} 
                            onClick={() => setWishlistDrawerOpen(false)}
                            className="wishlist-card-name"
                          >
                            {item.name}
                          </Link>
                          <div className="wishlist-card-price-row">
                            <span className="wishlist-card-price">
                              ${(item.discountPrice ?? item.price).toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="wishlist-card-old-price">${item.price.toFixed(2)}</span>
                            )}
                          </div>
                          
                          <div className="wishlist-card-actions">
                            <button
                              className="wishlist-add-bag-btn"
                              onClick={() => {
                                addItem({
                                  id: item.id,
                                  name: item.name,
                                  price: item.price,
                                  images: item.images,
                                  sku: item.sku
                                }, 1);
                                removeFromWishlist(item.id);
                              }}
                            >
                              <ShoppingBag size={13} />
                              Move to Bag
                            </button>
                            <button
                              className="wishlist-remove-btn"
                              onClick={() => removeFromWishlist(item.id)}
                              aria-label="Remove from wishlist"
                              title="Remove"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {wishlist.length > 0 && (
              <div className="wishlist-drawer-footer">
                <button 
                  className="wishlist-continue-btn"
                  onClick={() => {
                    setWishlistDrawerOpen(false);
                    navigate('/products');
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--c-text-2);
          position: relative;
          transition: all var(--transition);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 2px;
        }
        .nav-link:hover {
          color: var(--c-text-1);
        }
        .nav-link.active {
          color: var(--c-text-1);
          font-weight: 700;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0%;
          height: 2px;
          border-radius: 2px;
          background: var(--c-text-1);
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }
        .nav-link.active::after {
          background: var(--c-accent-2);
        }
        .nav-link-sale.active::after {
          background: #EF4444;
        }
        .nav-badge {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: var(--r-full);
          letter-spacing: 0.05em;
          line-height: 1;
        }
        .nav-badge-new {
          background: rgba(37, 99, 235, 0.15);
          color: #2563EB;
          border: 1px solid rgba(37, 99, 235, 0.3);
        }
        [data-theme='dark'] .nav-badge-new {
          background: rgba(56, 189, 248, 0.2);
          color: #38BDF8;
          border-color: rgba(56, 189, 248, 0.4);
        }
        .nav-badge-sale {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .user-profile-menu-popover {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 215px;
          background: #FFFFFF;
          border: 1px solid var(--c-border);
          border-radius: var(--r-md);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08);
          padding: 8px;
          z-index: 300;
          animation: slideDown 0.2s var(--transition);
        }
        [data-theme='dark'] .user-profile-menu-popover {
          background: #0F172A;
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65), 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          font-size: 13px;
          color: var(--c-text-1);
          border-radius: var(--r-sm);
          transition: background 0.15s ease;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
          box-sizing: border-box;
        }
        .dropdown-item:hover {
          background: #F1F5F9;
        }
        [data-theme='dark'] .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        /* Inline Navbar Search Box */
        .nav-search-form {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-full);
          padding: 0 12px 0 34px;
          height: 38px;
          width: 210px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), var(--shadow-xs);
        }
        [data-theme='dark'] .nav-search-form {
          background: rgba(255, 255, 255, 0.06);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .nav-search-form:focus-within {
          width: 290px;
          border-color: var(--c-accent-2);
          box-shadow: 0 0 0 3px rgba(196, 151, 74, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6);
          background: var(--c-surface);
        }
        .nav-search-icon {
          position: absolute;
          left: 11px;
          color: var(--c-text-3);
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .nav-search-form:focus-within .nav-search-icon {
          color: var(--c-accent-2);
        }
        .nav-search-input {
          width: 100%;
          border: none;
          background: transparent;
          font-size: 13px;
          color: var(--c-text-1);
          outline: none;
        }
        .nav-search-input::placeholder {
          color: var(--c-text-3);
          font-size: 13px;
        }
        .nav-search-clear {
          background: transparent;
          border: none;
          color: var(--c-text-3);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: color 0.15s ease;
        }
        .nav-search-clear:hover {
          color: var(--c-text-1);
        }

        /* Mobile Inline Dropdown (Directly under header, NOT full-screen) */
        .mobile-search-bar {
          position: fixed;
          top: 56px;
          left: 0;
          right: 0;
          height: 56px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: 1px solid var(--glass-border);
          box-shadow: var(--shadow-sm);
          z-index: 199;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          animation: slideDown 0.2s ease;
          box-sizing: border-box;
        }
        .mobile-search-input {
          width: 100%;
          height: 40px;
          border-radius: var(--r-full);
          border: 1px solid var(--glass-border);
          background: var(--c-surface-raised);
          padding: 0 75px 0 36px;
          font-size: 14px;
          color: var(--c-text-1);
          outline: none;
          box-sizing: border-box;
        }
        .mobile-search-input:focus {
          border-color: var(--c-accent-2);
        }
        .mobile-search-clear {
          position: absolute;
          right: 64px;
          background: transparent;
          border: none;
          color: var(--c-text-3);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mobile-search-close-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--c-text-2);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        /* Nav Search Wrapper & Suggestions */
        .nav-search-wrapper {
          position: relative;
        }

        .nav-search-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid var(--c-border);
          border-top-color: var(--c-accent-2);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        .search-suggestions-popover {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 340px;
          background: #FFFFFF;
          border: 1px solid var(--c-border);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(15, 23, 42, 0.08);
          border-radius: var(--r-lg);
          overflow: hidden;
          z-index: 250;
          animation: slideDown 0.2s var(--transition);
        }
        [data-theme='dark'] .search-suggestions-popover {
          background: #0F172A;
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65), 0 4px 14px rgba(0, 0, 0, 0.4);
        }

        .suggestions-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--c-text-3);
          border-bottom: 1px solid var(--c-border-subtle);
        }

        .suggestions-count {
          color: var(--c-accent-2);
          font-weight: 600;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          max-height: 320px;
          overflow-y: auto;
        }

        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s ease;
          border-bottom: 1px solid var(--c-border-subtle);
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: #F8FAFC;
        }
        [data-theme='dark'] .suggestion-item:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .suggestion-thumb {
          width: 38px;
          height: 38px;
          border-radius: var(--r-sm);
          object-fit: contain;
          background: #F8FAFC;
          border: 1px solid var(--c-border-subtle);
          flex-shrink: 0;
        }
        [data-theme='dark'] .suggestion-thumb {
          background: #1E293B;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .suggestion-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }

        .suggestion-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-1);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .suggestion-brand {
          font-size: 11px;
          color: var(--c-text-3);
          text-transform: uppercase;
        }

        .suggestion-price-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
        }

        .suggestion-price {
          font-size: 13px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .suggestion-old-price {
          font-size: 11px;
          color: var(--c-text-3);
          text-decoration: line-through;
        }

        .suggestions-view-all {
          width: 100%;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: none;
          border-top: 1px solid var(--c-border-subtle);
          background: #F8FAFC;
          color: var(--c-accent-2);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        [data-theme='dark'] .suggestions-view-all {
          background: #111827;
        }

        .suggestions-view-all:hover {
          background: #F1F5F9;
        }
        [data-theme='dark'] .suggestions-view-all:hover {
          background: #1E293B;
        }

        .suggestions-empty {
          padding: 18px 14px;
          text-align: center;
          font-size: 13px;
          color: var(--c-text-2);
        }

        .mobile-suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--c-bg);
          border-bottom: 1px solid var(--glass-border);
          box-shadow: var(--shadow-md);
          max-height: 280px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          header {
            height: 56px !important;
          }
        }

        /* Wishlist Slide-Over Drawer */
        .wishlist-drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.2s ease;
        }

        .wishlist-drawer-panel {
          width: 100%;
          max-width: 420px;
          height: 100%;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-left: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), -10px 0 30px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .wishlist-drawer-header {
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--glass-border);
        }

        .wishlist-header-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wishlist-header-title h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .wishlist-close-btn {
          background: none;
          border: none;
          color: var(--c-text-2);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
        }

        .wishlist-close-btn:hover {
          background: var(--c-surface-raised);
          color: var(--c-text-1);
        }

        .wishlist-drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }

        .wishlist-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
          padding: 40px 20px;
        }

        .wishlist-empty-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.08);
          color: #EF4444;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .wishlist-empty-state h4 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .wishlist-empty-state p {
          margin: 0 0 24px;
          font-size: 14px;
          color: var(--c-text-3);
          line-height: 1.5;
        }

        .wishlist-explore-btn {
          padding: 12px 28px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .wishlist-explore-btn:hover {
          opacity: 0.9;
        }

        .wishlist-items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .wishlist-card {
          display: flex;
          gap: 14px;
          padding: 12px;
          border-radius: var(--r-lg);
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        [data-theme='dark'] .wishlist-card {
          background: rgba(30, 41, 59, 0.45);
        }

        .wishlist-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .wishlist-card-img-link {
          width: 76px;
          height: 76px;
          border-radius: var(--r-md);
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(0, 0, 0, 0.03);
          display: block;
        }

        .wishlist-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .wishlist-card-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 0;
        }

        .wishlist-card-brand {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--c-accent-2);
          text-transform: uppercase;
        }

        .wishlist-card-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-1);
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wishlist-card-name:hover {
          color: var(--c-accent-2);
        }

        .wishlist-card-price-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 2px;
        }

        .wishlist-card-price {
          font-size: 14px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        .wishlist-card-old-price {
          font-size: 12px;
          color: var(--c-text-3);
          text-decoration: line-through;
        }

        .wishlist-card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 6px;
        }

        .wishlist-add-bag-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--r-full);
          background: var(--c-accent);
          color: var(--c-accent-fg);
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .wishlist-add-bag-btn:hover {
          opacity: 0.9;
        }

        .wishlist-remove-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid var(--c-border);
          background: transparent;
          color: var(--c-text-3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .wishlist-remove-btn:hover {
          color: #EF4444;
          border-color: #EF4444;
          background: rgba(239, 68, 68, 0.08);
        }

        .wishlist-drawer-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--glass-border);
          background: var(--c-surface-raised);
        }

        .wishlist-continue-btn {
          width: 100%;
          padding: 12px;
          border-radius: var(--r-full);
          background: transparent;
          border: 1px solid var(--c-border);
          color: var(--c-text-1);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
        }

        .wishlist-continue-btn:hover {
          border-color: var(--c-text-1);
          background: var(--c-surface);
        }
      `}</style>
    </>
  );
}
