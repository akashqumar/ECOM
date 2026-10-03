import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart, useWishlist } from '../context/AppContext';
import { catalogApi } from '../services/api';
import { Product, Category } from '../types';
import { 
  Filter, 
  ChevronDown, 
  Heart, 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Search,
  SlidersHorizontal,
  Sparkles,
  Zap,
  Flame,
  Tag,
  Copy,
  Check
} from 'lucide-react';

interface ProductsPageProps {
  mode?: 'all' | 'new' | 'sale';
}

export default function ProductsPage({ mode: propMode }: ProductsPageProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const gridTopRef = useRef<HTMLDivElement>(null);

  // Detect mode from prop or path or query param
  const activeMode = useMemo(() => {
    if (propMode) return propMode;
    if (location.pathname === '/sale' || searchParams.get('view') === 'sale' || searchParams.get('sort') === 'discountPrice,asc') {
      return 'sale';
    }
    if (location.pathname === '/new-arrivals' || searchParams.get('view') === 'new' || searchParams.get('sort') === 'createdAt,desc') {
      return 'new';
    }
    return 'all';
  }, [propMode, location.pathname, searchParams]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [cartLoadingId, setCartLoadingId] = useState<string | null>(null);
  const [cartSuccessId, setCartSuccessId] = useState<string | null>(null);

  // Quick mode-specific filter states
  const [saleFilter, setSaleFilter] = useState<'all' | '30' | '50' | 'under100'>('all');
  const [newFilter, setNewFilter] = useState<'all' | 'topRated' | 'under100'>('all');
  const [couponCopied, setCouponCopied] = useState(false);

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('EXTRA15');
    setCouponCopied(true);
    setTimeout(() => setCouponCopied(false), 2000);
  };

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('categoryId') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentMaxPrice = searchParams.get('maxPrice') || '2000';

  const [activeCategoryState, setActiveCategoryState] = useState(currentCategory);

  useEffect(() => {
    setActiveCategoryState(currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await catalogApi.getCategories();
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchProducts = async () => {
      if (products.length === 0 && isInitialLoading) {
        // Initial load
      } else {
        setIsFetching(true);
      }

      try {
        // Pick appropriate sort for mode if none specified
        let effectiveSort = currentSort;
        if (!effectiveSort) {
          if (activeMode === 'new') effectiveSort = 'createdAt,desc';
          else if (activeMode === 'sale') effectiveSort = 'discountPrice,asc';
        }

        const res = await catalogApi.getProducts({
          search: currentSearch || undefined,
          categoryId: currentCategory || undefined,
          sort: effectiveSort || undefined,
          page: 0,
          size: 100, // Fetch up to 100 to enable robust multi-page pagination & filtering
        });
        
        if (isCancelled) return;

        const page = res.data;
        const fetchedItems = page?.content || [];
        
        const maxPriceNum = parseFloat(currentMaxPrice);
        let filtered = maxPriceNum < 2000 
          ? fetchedItems.filter(p => (p.discountPrice ?? p.price) <= maxPriceNum)
          : fetchedItems;

        // Apply Mode-Specific Filtering
        if (activeMode === 'sale') {
          // Strictly items with discounts
          filtered = filtered.filter(p => p.discountPrice && p.discountPrice < p.price);

          if (saleFilter === '30') {
            filtered = filtered.filter(p => ((p.price - (p.discountPrice ?? p.price)) / p.price) >= 0.20);
          } else if (saleFilter === '50') {
            filtered = filtered.filter(p => ((p.price - (p.discountPrice ?? p.price)) / p.price) >= 0.35);
          } else if (saleFilter === 'under100') {
            filtered = filtered.filter(p => (p.discountPrice ?? p.price) <= 100);
          }
        } else if (activeMode === 'new') {
          if (newFilter === 'topRated') {
            filtered = filtered.filter(p => (p.rating ?? 0) >= 4.8);
          } else if (newFilter === 'under100') {
            filtered = filtered.filter(p => (p.discountPrice ?? p.price) <= 100);
          }
        }

        // Apply Client-Side Sorting
        if (effectiveSort === 'price,asc') {
          filtered.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        } else if (effectiveSort === 'price,desc') {
          filtered.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        } else if (effectiveSort === 'createdAt,desc') {
          filtered.sort((a, b) => {
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            return timeB - timeA;
          });
        } else if (effectiveSort === 'rating,desc') {
          filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        } else if (effectiveSort === 'discountPrice,asc') {
          filtered.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        }

        const ITEMS_PER_PAGE = 12;
        const totalItemsCount = filtered.length;
        const totalPagesCalculated = Math.max(1, Math.ceil(totalItemsCount / ITEMS_PER_PAGE));
        
        // Paginate items based on currentPage
        const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPagesCalculated);
        const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        const paginatedProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        setProducts(paginatedProducts);
        setTotalProducts(totalItemsCount);
        setTotalPages(totalPagesCalculated);
      } catch (err) {
        if (!isCancelled) {
          console.error('Failed to fetch products', err);
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false);
          setIsFetching(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isCancelled = true;
    };
  }, [currentSearch, currentCategory, currentSort, currentPage, currentMaxPrice, activeMode, saleFilter, newFilter]);

  const updateFilter = useCallback((key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    updateFilter('page', String(newPage));
    
    // Smooth scroll up to where products start
    if (gridTopRef.current) {
      const headerOffset = 90;
      const elementPosition = gridTopRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategorySelect = (catId: string | null) => {
    setActiveCategoryState(catId || '');
    updateFilter('categoryId', catId);
  };

  const clearFilters = () => {
    setActiveCategoryState('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    setCartLoadingId(product.id);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        sku: product.sku
      }, 1);
      
      setCartSuccessId(product.id);
      setTimeout(() => {
        setCartSuccessId(null);
      }, 1800);
    } catch (err) {
      console.error('Failed to add to cart', err);
    } finally {
      setCartLoadingId(null);
    }
  };

  const hasActiveFilters = currentSearch || currentCategory || currentSort || (currentMaxPrice !== '2000');

  const FilterContent = () => (
    <div className="filters-content">
      <div className="filter-section">
        <div className="filter-header-row">
          <SlidersHorizontal size={16} className="filter-header-icon" />
          <h3 className="filter-title">Categories</h3>
        </div>
        <div className="filter-list">
          <button 
            className={`filter-chip ${!activeCategoryState ? 'active' : ''}`}
            onClick={() => handleCategorySelect(null)}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`filter-chip ${activeCategoryState === cat.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Price Range</h3>
        <div className="price-slider-container">
          <input 
            type="range" 
            min="0" 
            max="2000" 
            step="50"
            value={currentMaxPrice}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="price-slider"
          />
          <div className="price-labels">
            <span>$0</span>
            <span className="price-val">${currentMaxPrice}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Sort By</h3>
        <div className="filter-list vertical">
          {[
            { label: 'Featured', value: '' },
            { label: 'Newest Releases', value: 'createdAt,desc' },
            { label: 'Price: Low to High', value: 'price,asc' },
            { label: 'Price: High to Low', value: 'price,desc' }
          ].map(opt => (
            <label key={opt.value} className="radio-label">
              <input 
                type="radio" 
                name="sort" 
                value={opt.value}
                checked={currentSort === opt.value}
                onChange={() => updateFilter('sort', opt.value)}
                className="radio-input"
              />
              <span className="radio-text">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button className="clear-filters-btn" onClick={clearFilters}>
          Reset all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="products-page">
      <style>{`
        .products-page {
          width: 100%;
          max-width: 1360px;
          margin: 0 auto;
          padding: 24px;
          min-height: 100vh;
          position: relative;
          box-sizing: border-box;
        }
        
        .breadcrumb {
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
        }
        .breadcrumb a {
          color: var(--c-text-2);
          text-decoration: none;
          font-weight: 500;
          transition: color var(--transition);
        }
        .breadcrumb a:hover {
          color: var(--c-accent-2);
        }
        .breadcrumb .crumb-sep {
          color: var(--c-text-3);
          opacity: 0.5;
          flex-shrink: 0;
        }
        .breadcrumb span.active-crumb {
          color: var(--c-text-1);
          font-weight: 600;
        }

        /* Page Hero Banners */
        .page-hero-banner {
          width: 100%;
          border-radius: var(--r-xl);
          padding: 32px 36px;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-sizing: border-box;
        }

        .page-hero-banner.sale-banner {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.06) 50%, var(--glass-bg) 100%);
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 16px 40px -10px rgba(239, 68, 68, 0.18), var(--glass-highlight);
        }

        .page-hero-banner.new-banner {
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(16, 185, 129, 0.06) 50%, var(--glass-bg) 100%);
          border-color: rgba(14, 165, 233, 0.3);
          box-shadow: 0 16px 40px -10px rgba(14, 165, 233, 0.18), var(--glass-highlight);
        }

        .page-hero-banner.all-banner {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, var(--glass-bg) 100%);
        }
        [data-theme='dark'] .page-hero-banner.all-banner {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, var(--glass-bg) 100%);
        }

        .hero-badge-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--r-full);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          width: fit-content;
        }
        .hero-badge-sale {
          background: rgba(239, 68, 68, 0.15);
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .hero-badge-new {
          background: rgba(14, 165, 233, 0.15);
          color: #0EA5E9;
          border: 1px solid rgba(14, 165, 233, 0.3);
        }
        .hero-badge-all {
          background: rgba(196, 151, 74, 0.15);
          color: var(--c-accent-2);
          border: 1px solid rgba(196, 151, 74, 0.3);
        }

        .hero-banner-title {
          font-size: clamp(24px, 3.5vw, 34px);
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--c-text-1);
          line-height: 1.15;
          margin: 0;
        }

        .hero-banner-subtitle {
          font-size: 15px;
          line-height: 1.6;
          color: var(--c-text-2);
          max-width: 680px;
          margin: 0;
        }

        .promo-coupon-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 10px 16px;
          border-radius: var(--r-lg);
          background: rgba(239, 68, 68, 0.08);
          border: 1px dashed rgba(239, 68, 68, 0.35);
          width: fit-content;
          margin-top: 4px;
        }
        .promo-code-pill {
          background: #EF4444;
          color: #FFFFFF;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 3px 10px;
          border-radius: var(--r-sm);
          font-size: 13px;
        }
        .promo-copy-btn {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-full);
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
          color: var(--c-text-1);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s ease;
        }
        .promo-copy-btn:hover {
          background: #FFFFFF;
          color: #000;
        }

        .quick-filter-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .quick-filter-chip {
          padding: 6px 14px;
          border-radius: var(--r-full);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          color: var(--c-text-2);
        }
        .quick-filter-chip:hover {
          color: var(--c-text-1);
          border-color: var(--glass-border-hover);
        }
        .quick-filter-chip.active {
          background: var(--c-text-1);
          color: var(--c-bg);
          border-color: var(--c-text-1);
        }

        .new-drop-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%);
          color: #FFFFFF;
          padding: 4px 10px;
          border-radius: var(--r-full);
          font-size: 10px;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
          letter-spacing: 0.05em;
          z-index: 2;
        }

        /* Stable Grid: Prevents layout jumping or width shrinking */
        .layout-grid {
          width: 100%;
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: start;
          box-sizing: border-box;
        }

        @media (min-width: 900px) {
          .layout-grid {
            grid-template-columns: 280px minmax(0, 1fr);
            gap: 32px;
            min-height: 750px;
          }
        }

        .sidebar {
          display: none;
        }
        
        @media (min-width: 900px) {
          .sidebar {
            display: block;
            width: 280px;
            min-width: 280px;
            max-width: 280px;
            position: sticky;
            top: 96px;
            align-self: start;
            min-height: 520px;
            background: var(--glass-bg);
            backdrop-filter: var(--glass-blur);
            -webkit-backdrop-filter: var(--glass-blur);
            border: 1px solid var(--glass-border);
            box-shadow: var(--glass-shadow), var(--glass-highlight);
            border-radius: var(--r-xl);
            padding: 24px;
            box-sizing: border-box;
          }
        }

        .filters-content {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .filter-header-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .filter-header-icon {
          color: var(--c-accent-2);
        }

        .filter-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--c-text-1);
        }

        .filter-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .filter-list.vertical {
          flex-direction: column;
          gap: 10px;
        }

        .filter-chip {
          padding: 8px 16px;
          border-radius: var(--r-full);
          font-size: 13px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.45);
          color: var(--c-text-2);
          border: 1px solid var(--glass-border);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        [data-theme='dark'] .filter-chip {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .filter-chip:hover {
          color: var(--c-text-1);
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-hover);
          transform: translateY(-1px);
        }

        .filter-chip.active {
          background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 14px -2px rgba(15, 23, 42, 0.35), inset 0 1px 0 rgba(255,255,255,0.4);
          font-weight: 600;
        }

        [data-theme='dark'] .filter-chip.active {
          background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
          color: #0F172A;
          border-color: rgba(255, 255, 255, 0.6);
          box-shadow: 0 4px 18px -2px rgba(56, 189, 248, 0.5), inset 0 1px 0 rgba(255,255,255,0.7);
        }

        .price-slider-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .price-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: var(--r-full);
          background: rgba(148, 163, 184, 0.3);
          outline: none;
        }

        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid var(--c-accent-2);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: transform 0.15s;
        }

        .price-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .price-labels {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--c-text-3);
          font-weight: 500;
        }

        .price-val {
          color: var(--c-text-1);
          font-weight: 700;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: var(--c-text-2);
          transition: color var(--transition);
        }

        .radio-label:hover {
          color: var(--c-text-1);
        }

        .radio-input {
          accent-color: var(--c-accent-2);
          width: 16px;
          height: 16px;
        }

        .clear-filters-btn {
          width: 100%;
          padding: 10px 16px;
          border-radius: var(--r-full);
          font-size: 13px;
          font-weight: 600;
          color: var(--c-error);
          background: var(--c-error-bg);
          border: 1px solid rgba(239, 68, 68, 0.2);
          cursor: pointer;
          transition: all var(--transition);
        }

        .clear-filters-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          transform: translateY(-1px);
        }

        .main-content {
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-height: 750px;
          box-sizing: border-box;
        }

        .top-bar {
          width: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-lg);
        }

        .results-count {
          font-size: 14px;
          font-weight: 600;
          color: var(--c-text-1);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .updating-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--c-accent-2);
          animation: pulseGlow 0.8s infinite alternate;
        }

        .sort-dropdown {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--c-text-2);
        }

        .sort-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .sort-select {
          appearance: none;
          background: rgba(255, 255, 255, 0.5);
          border: 1px solid var(--glass-border);
          border-radius: var(--r-full);
          padding: 6px 32px 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--c-text-1);
          cursor: pointer;
          outline: none;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
        }

        [data-theme='dark'] .sort-select {
          background: rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
        }

        .sort-select-icon {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: var(--c-text-3);
        }

        /* Seamless Grid Transition: Smooth fade, zero skeleton flickering */
        .product-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
          box-sizing: border-box;
          transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-grid.fetching {
          opacity: 0.55;
          pointer-events: none;
        }

        @media (max-width: 1100px) {
          .product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .top-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .sort-dropdown {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .products-page {
            padding: 16px 14px !important;
          }
        }

        /* Windows 7 Aero Glass Product Card - UNIFORM HEIGHT & SPACING */
        .product-card {
          width: 100%;
          height: 100%;
          min-height: 440px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          padding: 16px;
          text-decoration: none;
          color: inherit;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
          transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
        }


        .product-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -120%;
          width: 200%;
          height: 100%;
          background: linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.35) 45%, transparent 60%);
          pointer-events: none;
          transition: transform 0.8s ease;
          transform: translateX(-100%);
        }

        .product-card:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: var(--glass-hover-shadow), var(--glass-highlight);
          border-color: var(--glass-border-hover);
        }

        .product-card:hover::before {
          transform: translateX(100%);
        }

        .product-image-wrap {
          position: relative;
          aspect-ratio: 1/1;
          border-radius: var(--r-lg);
          overflow: hidden;
          background: rgba(255, 255, 255, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        [data-theme='dark'] .product-image-wrap {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-card:hover .product-image {
          transform: scale(1.08);
        }

        .discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
          color: #FFFFFF;
          padding: 4px 10px;
          border-radius: var(--r-full);
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(220, 38, 38, 0.35);
          letter-spacing: 0.02em;
        }

        .wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), 0 4px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--c-text-2);
          cursor: pointer;
          opacity: 0;
          transform: scale(0.8);
          transition: all var(--transition);
        }

        .product-card:hover .wishlist-btn {
          opacity: 1;
          transform: scale(1);
        }

        .wishlist-btn:hover {
          color: #EF4444;
          transform: scale(1.1);
          background: #FFFFFF;
        }

        .wishlist-btn.active {
          opacity: 1;
          transform: scale(1);
          color: #EF4444;
          background: rgba(255, 255, 255, 0.95);
        }

        [data-theme='dark'] .wishlist-btn.active {
          background: rgba(30, 41, 59, 0.95);
        }

        .product-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          justify-content: space-between;
        }

        .product-brand {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--c-accent-2);
        }

        .product-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--c-text-1);
          line-height: 22px;
          height: 44px;
          min-height: 44px;
          max-height: 44px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-top: 4px;
          margin-bottom: 12px;
        }

        .product-price {
          font-size: 18px;
          font-weight: 800;
          color: var(--c-text-1);
        }

        .product-old-price {
          font-size: 13px;
          color: var(--c-text-3);
          text-decoration: line-through;
        }

        .add-to-bag-btn {
          width: 100%;
          padding: 10px 16px;
          border-radius: var(--r-full);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 4px 12px rgba(15, 23, 42, 0.15);
          cursor: pointer;
          transition: all var(--transition);
        }

        [data-theme='dark'] .add-to-bag-btn {
          background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
          color: #0F172A;
          font-weight: 700;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 4px 16px rgba(56, 189, 248, 0.3);
        }

        .add-to-bag-btn:hover {
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 20px rgba(37, 99, 235, 0.35);
        }

        .add-to-bag-btn.added {
          background: #10B981 !important;
          color: #FFFFFF !important;
          border-color: #10B981 !important;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: 48px;
          padding: 16px 0;
          flex-wrap: wrap;
        }

        .page-numbers {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .page-num-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          color: var(--c-text-1);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .page-num-btn:hover {
          transform: translateY(-2px);
          border-color: var(--glass-border-hover);
          box-shadow: var(--glass-highlight), var(--shadow-sm);
        }

        .page-num-btn.active {
          background: var(--c-accent-2);
          color: #FFFFFF;
          border-color: var(--c-accent-2);
          box-shadow: 0 4px 14px rgba(196, 151, 74, 0.4), var(--glass-highlight);
        }

        .page-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: var(--r-full);
          font-size: 13px;
          font-weight: 600;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-highlight), var(--shadow-xs);
          color: var(--c-text-1);
          cursor: pointer;
          transition: all var(--transition);
        }

        .page-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--glass-highlight), var(--shadow-md);
        }

        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .empty-state {
          width: 100%;
          min-height: 480px;
          box-sizing: border-box;
          text-align: center;
          padding: 80px 24px;
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--glass-border);
          box-shadow: var(--glass-shadow), var(--glass-highlight);
          border-radius: var(--r-xl);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .empty-icon {
          width: 56px;
          height: 56px;
          color: var(--c-text-3);
          stroke-width: 1.5;
        }

        .empty-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--c-text-1);
        }

        /* Mobile Filter Modal Rules - COMPLETELY HIDDEN ON DESKTOP */
        .mobile-filter-btn {
          display: none !important;
        }

        .mobile-modal-overlay {
          display: none !important;
        }

        .mobile-modal {
          display: none !important;
        }

        @media (max-width: 899px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }

          .mobile-filter-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            gap: 8px;
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
            color: #FFFFFF;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 12px 24px;
            border-radius: var(--r-full);
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4);
            z-index: 40;
            cursor: pointer;
          }

          [data-theme='dark'] .mobile-filter-btn {
            background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
            color: #0F172A;
          }

          .mobile-modal-overlay {
            display: block !important;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            z-index: 998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }
          
          .mobile-modal-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }

          .mobile-modal {
            display: block !important;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: var(--c-bg);
            border-radius: 28px 28px 0 0;
            padding: 24px;
            max-height: 85vh;
            overflow-y: auto;
            z-index: 999;
            transform: translateY(100%);
            transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            border-top: 1px solid var(--glass-border);
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
          }
          
          .mobile-modal.open {
            transform: translateY(0);
          }

          .mobile-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 14px;
            border-bottom: 1px solid var(--c-border-subtle);
          }

          .mobile-modal-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--c-text-1);
          }

          .close-modal-btn {
            background: transparent;
            border: none;
            color: var(--c-text-2);
            cursor: pointer;
            padding: 4px;
          }

          .show-results-btn {
            width: 100%;
            background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
            color: #FFFFFF;
            border: none;
            padding: 14px;
            border-radius: var(--r-full);
            font-size: 15px;
            font-weight: 600;
            margin-top: 24px;
            cursor: pointer;
          }

          [data-theme='dark'] .show-results-btn {
            background: linear-gradient(135deg, #38BDF8 0%, #2563EB 100%);
            color: #0F172A;
          }
        }
      `}</style>

      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={13} className="crumb-sep" />
        {activeMode === 'sale' ? (
          <Link to="/sale">Sale Collection</Link>
        ) : activeMode === 'new' ? (
          <Link to="/new-arrivals">New Arrivals</Link>
        ) : (
          <Link to="/products">All Products</Link>
        )}
        {activeCategoryState && (
          <>
            <ChevronRight size={13} className="crumb-sep" />
            <span className="active-crumb">{categories.find(c => c.id === activeCategoryState)?.name || 'Category'}</span>
          </>
        )}
      </div>

      {activeMode === 'sale' ? (
        <div className="page-hero-banner sale-banner">
          <div className="hero-badge-tag hero-badge-sale">
            <Flame size={13} />
            Limited Archive Sale • Up to 50% Off
          </div>
          <h1 className="hero-banner-title">Seasonal Archive & Private Sale</h1>
          <p className="hero-banner-subtitle">
            Exceptional curated pricing on iconic essentials, limited runs, and seasonal classics. Once sold out, archive items will not return.
          </p>

          <div className="promo-coupon-bar">
            <Tag size={16} style={{ color: '#EF4444' }} />
            <span style={{ fontSize: '13px', color: 'var(--c-text-1)', fontWeight: 500 }}>
              Use coupon code for an extra 15% off at checkout:
            </span>
            <span className="promo-code-pill">EXTRA15</span>
            <button className="promo-copy-btn" onClick={handleCopyCoupon}>
              {couponCopied ? (
                <>
                  <Check size={13} style={{ color: '#10B981' }} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="quick-filter-row">
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deals:</span>
            <button 
              className={`quick-filter-chip ${saleFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSaleFilter('all')}
            >
              All Deals ({products.length})
            </button>
            <button 
              className={`quick-filter-chip ${saleFilter === 'under100' ? 'active' : ''}`}
              onClick={() => setSaleFilter('under100')}
            >
              Under $100
            </button>
            <button 
              className={`quick-filter-chip ${saleFilter === '30' ? 'active' : ''}`}
              onClick={() => setSaleFilter('30')}
            >
              20%+ Off
            </button>
            <button 
              className={`quick-filter-chip ${saleFilter === '50' ? 'active' : ''}`}
              onClick={() => setSaleFilter('50')}
            >
              Deep Markdowns (35%+)
            </button>
          </div>
        </div>
      ) : activeMode === 'new' ? (
        <div className="page-hero-banner new-banner">
          <div className="hero-badge-tag hero-badge-new">
            <Zap size={13} />
            Fresh Drops • Spring/Summer 2026
          </div>
          <h1 className="hero-banner-title">New Arrivals: Just Landed</h1>
          <p className="hero-banner-subtitle">
            The latest innovations, limited seasonal drops, and modern silhouettes freshly crafted and curated for your collection.
          </p>

          <div className="quick-filter-row">
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--c-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter:</span>
            <button 
              className={`quick-filter-chip ${newFilter === 'all' ? 'active' : ''}`}
              onClick={() => setNewFilter('all')}
            >
              All New Drops ({products.length})
            </button>
            <button 
              className={`quick-filter-chip ${newFilter === 'topRated' ? 'active' : ''}`}
              onClick={() => setNewFilter('topRated')}
            >
              ★ Top Rated Drops (4.8+)
            </button>
            <button 
              className={`quick-filter-chip ${newFilter === 'under100' ? 'active' : ''}`}
              onClick={() => setNewFilter('under100')}
            >
              Under $100
            </button>
          </div>
        </div>
      ) : (
        <div className="page-hero-banner all-banner">
          <div className="hero-badge-tag hero-badge-all">
            <Sparkles size={13} />
            The Full Collection • 2026 Edition
          </div>
          <h1 className="hero-banner-title">The Complete Collection</h1>
          <p className="hero-banner-subtitle">
            Explore our full curated catalog of high-performance tech, modern workspaces, and lifestyle essentials engineered for everyday excellence.
          </p>
        </div>
      )}

      <div className="layout-grid">
        <aside className="sidebar">
          <FilterContent />
        </aside>

        <main className="main-content" ref={gridTopRef}>
          <div className="top-bar">
            <div className="results-count">
              {isFetching ? (
                <>
                  <div className="updating-dot" />
                  <span style={{ color: 'var(--c-accent-2)' }}>Updating catalog...</span>
                </>
              ) : activeMode === 'sale' ? (
                `${totalProducts} Items on Sale`
              ) : activeMode === 'new' ? (
                `${totalProducts} Fresh Arrivals`
              ) : (
                `${totalProducts} Products Available`
              )}
            </div>
            <div className="sort-dropdown">
              <span>Sort by:</span>
              <div className="sort-select-wrapper">
                <select 
                  className="sort-select"
                  value={currentSort}
                  onChange={(e) => updateFilter('sort', e.target.value)}
                >
                  <option value="">Featured</option>
                  <option value="createdAt,desc">Newest Releases</option>
                  <option value="price,asc">Price: Low to High</option>
                  <option value="price,desc">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="sort-select-icon" />
              </div>
            </div>
          </div>

          {isInitialLoading ? (
            <div className="product-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="product-card" style={{ height: 380 }}>
                  <div className="skeleton" style={{ width: '100%', height: 220, marginBottom: 16 }} />
                  <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '85%', height: 16, marginBottom: 12 }} />
                  <div className="skeleton" style={{ width: '30%', height: 20 }} />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={`product-grid ${isFetching ? 'fetching' : ''}`}>
                {products.map(product => {
                  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                  const discountPct = hasDiscount 
                    ? Math.round(((product.price - (product.discountPrice ?? 0)) / product.price) * 100)
                    : 0;

                  return (
                    <Link to={`/products/${product.id}`} key={product.id} className="product-card">
                      <div className="product-image-wrap">
                        <img 
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'} 
                          alt={product.name}
                          className="product-image"
                          loading="lazy"
                        />
                        {activeMode === 'new' ? (
                          <div className="new-drop-badge">NEW DROP</div>
                        ) : hasDiscount ? (
                          <div className="discount-badge">−{discountPct}% OFF</div>
                        ) : null}
                        <button 
                          className={`wishlist-btn ${isWishlisted(product.id) ? 'active' : ''}`} 
                          aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product);
                          }}
                        >
                          <Heart 
                            size={16} 
                            fill={isWishlisted(product.id) ? "#EF4444" : "none"} 
                            color={isWishlisted(product.id) ? "#EF4444" : "currentColor"} 
                          />
                        </button>
                      </div>
                      
                      <div className="product-info">
                        <div className="product-brand">{product.brand || 'LUMÉ COLLECTION'}</div>
                        <div className="product-name">{product.name}</div>
                        <div className="product-price-row">
                          <span className="product-price" style={{ color: activeMode === 'sale' ? '#EF4444' : 'var(--c-text-1)' }}>
                            ${(product.discountPrice ?? product.price).toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="product-old-price">${product.price.toFixed(2)}</span>
                              {activeMode === 'sale' && (
                                <span style={{ fontSize: '11px', color: 'var(--c-success)', fontWeight: 600, marginLeft: '4px' }}>
                                  Save ${(product.price - (product.discountPrice ?? 0)).toFixed(0)}
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <button 
                          className={`add-to-bag-btn ${cartSuccessId === product.id ? 'added' : ''}`}
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          {cartLoadingId === product.id ? (
                            <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          ) : cartSuccessId === product.id ? (
                            <span>✓ Added to Bag</span>
                          ) : (
                            <>
                              <ShoppingBag size={14} />
                              Add to Bag
                            </>
                          )}
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                    <span>Prev</span>
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                        aria-label={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button 
                    className="page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <Search className="empty-icon" />
              <h2 className="empty-title">No products found</h2>
              <p style={{ color: 'var(--c-text-2)', maxWidth: 360, lineHeight: 1.5 }}>
                We couldn't find any products matching your selected criteria. Try adjusting your filters.
              </p>
              <button 
                className="glass-btn glass-btn-primary" 
                style={{ marginTop: 12 }} 
                onClick={clearFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Floating Filter Toggle */}
      <button className="mobile-filter-btn" onClick={() => setIsMobileFilterOpen(true)}>
        <Filter size={16} />
        Filter & Sort
        {hasActiveFilters && (
          <span style={{ 
            background: 'var(--c-accent-2)', 
            color: '#fff', 
            borderRadius: '50%', 
            width: 18, 
            height: 18, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 11,
            fontWeight: 700 
          }}>
            •
          </span>
        )}
      </button>

      {/* Mobile Drawer (Only visible on mobile when toggled) */}
      <div 
        className={`mobile-modal-overlay ${isMobileFilterOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileFilterOpen(false)} 
      />
      <div className={`mobile-modal ${isMobileFilterOpen ? 'open' : ''}`}>
        <div className="mobile-modal-header">
          <h2 className="mobile-modal-title">Filter & Sort</h2>
          <button className="close-modal-btn" onClick={() => setIsMobileFilterOpen(false)}>
            <X size={22} />
          </button>
        </div>
        <FilterContent />
        <button className="show-results-btn" onClick={() => setIsMobileFilterOpen(false)}>
          Show {totalProducts} Results
        </button>
      </div>
    </div>
  );
}
