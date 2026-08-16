import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import ScrollReveal, { StaggerGroup } from '../components/ScrollReveal';
import AnimatedButton from '../components/AnimatedButton';
import { ProductGridSkeleton } from '../components/SkeletonLoader';

// Custom inline SVG icons for premium look and self-containment
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const getCategoryKey = (name) => name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : '';

export default function ShopPage({ user, addToCart, openCart, showToast, wishlist = [], toggleWishlist }) {
  const navigate = useNavigate();
  const query = useQuery();
  
  // URL Params
  const categoryParam = query.get('category') || 'all';
  const subcategoryParam = query.get('subcategory') || 'all';
  const focusParam = query.get('focus');

  // Master Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // category_id
  const [selectedSubcategories, setSelectedSubcategories] = useState([]); // array of subcategory_ids
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [sortOption, setSortOption] = useState('recommended');
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Auto expand selected category
  useEffect(() => {
    if (selectedCategory && !expandedCategories.includes(selectedCategory)) {
      setExpandedCategories(prev => [...prev, selectedCategory]);
    }
  }, [selectedCategory]);

  // UI Toggles
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth <= 768);
  const [activeQuickFilter, setActiveQuickFilter] = useState(null); // 'size' | 'color' | 'category' | 'discount' | null
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: true,
    color: true,
    discount: true
  });

  const searchInputRef = useRef(null);
  const quickFilterRef = useRef(null);

  // Available Filter Lists
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Standard'];
  // Derive available colors dynamically from the loaded products
  // Each product stores colors as an array of hex strings (e.g. ["#ff0000", "#0000ff"])
  const availableColors = useMemo(() => {
    const seen = new Set();
    const cols = [];
    products.forEach(p => {
      if (!Array.isArray(p.colors)) return;
      p.colors.forEach(hex => {
        const normalized = hex.trim().toLowerCase();
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        // Detect light colors by relative luminance so swatches get a dark border
        const r = parseInt(normalized.slice(1, 3), 16);
        const g = parseInt(normalized.slice(3, 5), 16);
        const b = parseInt(normalized.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        cols.push({ hex: hex.trim(), name: hex.trim(), isLight: luminance > 0.6 });
      });
    });
    return cols;
  }, [products]);
  const discountOptions = [
    { label: 'All Offers', value: 0 },
    { label: '10% and above', value: 10 },
    { label: '20% and above', value: 20 },
    { label: '30% and above', value: 30 }
  ];

  // Fetch Master Data
  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getCategories(),
      apiService.getSubcategories(),
      apiService.getProducts()
    ])
      .then(([catRes, subRes, prodRes]) => {
        setCategories(catRes || []);
        setSubcategories(subRes || []);
        setProducts(prodRes || []);
      })
      .catch(err => {
        console.error('Error fetching shop data:', err);
        showToast('Failed to load shop products');
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  // Handle Focus Search
  useEffect(() => {
    if (focusParam === 'search' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focusParam]);

  // Sync state with URL Category/Subcategory parameters
  useEffect(() => {
    if (categories.length === 0 && subcategories.length === 0) return;

    if (subcategoryParam !== 'all') {
      const sub = subcategories.find(s => getCategoryKey(s.name) === subcategoryParam);
      if (sub) {
        setSelectedSubcategories([sub.id]);
        setSelectedCategory(sub.category_id);
      }
    } else if (categoryParam !== 'all') {
      const cat = categories.find(c => getCategoryKey(c.name) === categoryParam);
      if (cat) {
        setSelectedCategory(cat.id);
        setSelectedSubcategories([]);
      } else {
        setSelectedCategory(null);
        setSelectedSubcategories([]);
      }
    } else {
      setSelectedCategory(null);
      setSelectedSubcategories([]);
    }
  }, [categoryParam, subcategoryParam, categories, subcategories]);

  // Close Quick Filter dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (quickFilterRef.current && !quickFilterRef.current.contains(e.target)) {
        setActiveQuickFilter(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter Updates & URL Syncer
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setSelectedSubcategories([]);
    if (catId) {
      const cat = categories.find(c => c.id === catId);
      if (cat) navigate(`/shop?category=${getCategoryKey(cat.name)}`, { replace: true });
    } else {
      navigate('/shop', { replace: true });
    }
  };

  const toggleCategoryExpand = (catId, e) => {
    if (e) e.stopPropagation();
    setExpandedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSubcategoryToggle = (subId) => {
    setSelectedSubcategories(prev => {
      const exists = prev.includes(subId);
      const updated = exists ? prev.filter(id => id !== subId) : [...prev, subId];

      if (updated.length === 1) {
        const sub = subcategories.find(s => s.id === updated[0]);
        if (sub) navigate(`/shop?subcategory=${getCategoryKey(sub.name)}`, { replace: true });
      } else if (updated.length === 0 && selectedCategory) {
        const cat = categories.find(c => c.id === selectedCategory);
        if (cat) navigate(`/shop?category=${getCategoryKey(cat.name)}`, { replace: true });
      } else {
        navigate('/shop', { replace: true });
      }

      // Automatically sync parent category if we checked a subcategory
      if (!exists && updated.length > 0) {
        const sub = subcategories.find(s => s.id === subId);
        if (sub && sub.category_id !== selectedCategory) {
          setSelectedCategory(sub.category_id);
        }
      }

      return updated;
    });
  };

  const toggleSizeFilter = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColorFilter = (hex) => {
    setSelectedColors(prev => 
      prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
    );
  };

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategories([]);
    setSearch('');
    setMinPrice(0);
    setMaxPrice(5000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedDiscount(0);
    setSortOption('recommended');
    navigate('/shop', { replace: true });
  };

  // Compute Product Dynamic Rating
  const getProductRating = (id) => {
    const rating = 4.0 + ((id * 7) % 11) / 10;
    const count = 12 + ((id * 13) % 89);
    return { rating: rating.toFixed(1), count };
  };

  // ─── Filter Logic ───
  const filteredProducts = products.filter(p => {
    // 1. Search Query
    const nameText = (p.name || '').toLowerCase();
    const descText = (p.description || '').toLowerCase();
    const matchesSearch = !search || nameText.includes(search.toLowerCase()) || descText.includes(search.toLowerCase());

    // 2. Category / Subcategory
    let matchesCategoryAndSub = true;
    if (selectedSubcategories.length > 0) {
      matchesCategoryAndSub = selectedSubcategories.includes(p.subcategory_id);
    } else if (selectedCategory) {
      const activeCat = categories.find(c => c.id === selectedCategory);
      const activeCatSlug = activeCat ? getCategoryKey(activeCat.name) : '';
      const pCatSlug = p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '_') : '';
      matchesCategoryAndSub = p.category_id === selectedCategory || (activeCatSlug && pCatSlug === activeCatSlug);
    }

    // 3. Price
    const op = parseFloat(p.price) || 0;
    const hasDiscount = p.discount_percent > 0;
    const finalPrice = hasDiscount ? op * (1 - p.discount_percent / 100) : op;
    const matchesPrice = finalPrice >= minPrice && finalPrice <= maxPrice;

    // 4. Sizes
    const matchesSizes = selectedSizes.length === 0 || 
                         (Array.isArray(p.sizes) && p.sizes.some(s => selectedSizes.includes(s)));

    // 5. Colors
    const matchesColors = selectedColors.length === 0 || 
                          (Array.isArray(p.colors) && p.colors.some(c => selectedColors.includes(c)));

    // 6. Discount
    const matchesDiscount = (p.discount_percent || 0) >= selectedDiscount;

    return matchesSearch && matchesCategoryAndSub && matchesPrice && matchesSizes && matchesColors && matchesDiscount;
  });

  // ─── Sorting Logic ───
  const sortedProducts = [...filteredProducts];
  if (sortOption === 'price_asc') {
    sortedProducts.sort((a, b) => {
      const pA = a.discount_percent > 0 ? parseFloat(a.price) * (1 - a.discount_percent / 100) : parseFloat(a.price);
      const pB = b.discount_percent > 0 ? parseFloat(b.price) * (1 - b.discount_percent / 100) : parseFloat(b.price);
      return pA - pB;
    });
  } else if (sortOption === 'price_desc') {
    sortedProducts.sort((a, b) => {
      const pA = a.discount_percent > 0 ? parseFloat(a.price) * (1 - a.discount_percent / 100) : parseFloat(a.price);
      const pB = b.discount_percent > 0 ? parseFloat(b.price) * (1 - b.discount_percent / 100) : parseFloat(b.price);
      return pB - pA;
    });
  } else if (sortOption === 'discount') {
    sortedProducts.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
  } else if (sortOption === 'rating') {
    sortedProducts.sort((a, b) => {
      const rA = parseFloat(getProductRating(a.id).rating);
      const rB = parseFloat(getProductRating(b.id).rating);
      return rB - rA;
    });
  } else if (sortOption === 'newest') {
    sortedProducts.sort((a, b) => b.id - a.id);
  } else {
    // recommended: featured first, then sales count
    sortedProducts.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (b.sales_count || 0) - (a.sales_count || 0);
    });
  }

  // Active Category & Subcategory Labels for title/breadcrumbs
  const activeCatObj = categories.find(c => c.id === selectedCategory);
  const activeSubsObjList = subcategories.filter(s => selectedSubcategories.includes(s.id));
  const activeSubName = activeSubsObjList.length === 1 ? activeSubsObjList[0].name : '';

  return (
    <div className="shop-page-wrapper" style={{ padding: '2rem 0', width: '90%', maxWidth: '1720px', margin: '0 auto' }}>
      
      {/* Breadcrumbs */}
      <nav className="shop-breadcrumbs-nav">
        <span className="shop-breadcrumb-link" onClick={resetAllFilters}>Home</span>
        <span className="shop-breadcrumb-divider">/</span>
        <span className="shop-breadcrumb-link" onClick={() => handleCategorySelect(null)}>Shop</span>
        {activeCatObj && (
          <>
            <span className="shop-breadcrumb-divider">/</span>
            <span className="shop-breadcrumb-link" onClick={() => handleCategorySelect(activeCatObj.id)}>{activeCatObj.name}</span>
          </>
        )}
        {activeSubName && (
          <>
            <span className="shop-breadcrumb-divider">/</span>
            <span className="shop-breadcrumb-link" style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{activeSubName}</span>
          </>
        )}
      </nav>

      {/* Header Info Section */}
      <div className="shop-header-info-container">
        {/* Left: Title & Count */}
        <div className="shop-header-title-wrapper">
          <h2 style={{ fontSize: '2rem', fontWeight: 850, margin: 0, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
            {activeSubName || (activeCatObj ? activeCatObj.name : 'All Products')}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontWeight: '500' }}>
            Showing {sortedProducts.length === 0 ? '0' : `1-${sortedProducts.length}`} of {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Center: Search Bar aligned in header */}
        <div className="shop-header-search-wrapper" style={{ gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <SearchIcon />
            </span>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.75rem',
                borderRadius: '8px',
                border: '1.5px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                boxShadow: 'var(--shadow-sm)',
                transition: 'border-color 0.2s'
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: '16px', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)', padding: 0
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Show Filters button right next to the search input */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`quick-filter-dropdown-btn sidebar-toggle-btn ${!isSidebarCollapsed ? 'active' : ''}`}
            style={{ margin: 0, flexShrink: 0 }}
          >
            <FilterIcon /> {isSidebarCollapsed ? 'Show Filters' : 'Hide Filters'}
          </button>
        </div>

        {/* Right: Sort & View Mode Toggles */}
        <div className="shop-header-sort-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Sort by:</span>
            <select 
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
              style={{
                border: '1.5px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.5rem 2rem 0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="recommended">Popularity</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
              <option value="rating">Top Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>

          {/* Group box/list view buttons tightly */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button 
              className={`view-toggle-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <GridIcon />
            </button>
            <button 
              className={`view-toggle-icon-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters Row Bar */}
      <div className="quick-filters-row-bar" ref={quickFilterRef}>
        
        {/* Size Dropdown */}
        <div className="quick-filter-select-wrapper">
          <button 
            className={`quick-filter-dropdown-btn has-chevron ${selectedSizes.length > 0 ? 'active' : ''}`}
            onClick={() => setActiveQuickFilter(activeQuickFilter === 'size' ? null : 'size')}
          >
            Size {selectedSizes.length > 0 ? `(${selectedSizes.join(', ')})` : '(All)'}
          </button>
          {activeQuickFilter === 'size' && (
            <div className="quick-filter-popup-card">
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Select Sizes</span>
              <div className="sizes-grid-layout" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {availableSizes.map(sz => (
                  <label key={sz} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedSizes.includes(sz)}
                      onChange={() => toggleSizeFilter(sz)}
                    />
                    {sz}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color Dropdown */}
        <div className="quick-filter-select-wrapper">
          <button 
            className={`quick-filter-dropdown-btn has-chevron ${selectedColors.length > 0 ? 'active' : ''}`}
            onClick={() => setActiveQuickFilter(activeQuickFilter === 'color' ? null : 'color')}
          >
            Color {selectedColors.length > 0 ? `(${selectedColors.length} Selected)` : '(All)'}
          </button>
          {activeQuickFilter === 'color' && (
            <div className="quick-filter-popup-card" style={{ minWidth: '240px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Select Colors</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {availableColors.map(col => (
                  <button 
                    key={col.hex}
                    className={`color-swatch-circle-btn ${selectedColors.includes(col.hex) ? 'active' : ''} ${col.isLight ? 'light-color' : ''}`}
                    style={{ backgroundColor: col.hex }}
                    onClick={() => toggleColorFilter(col.hex)}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="quick-filter-select-wrapper">
          <button 
            className={`quick-filter-dropdown-btn has-chevron ${selectedCategory ? 'active' : ''}`}
            onClick={() => setActiveQuickFilter(activeQuickFilter === 'category' ? null : 'category')}
          >
            Category {activeCatObj ? `(${activeCatObj.name})` : '(All)'}
          </button>
          {activeQuickFilter === 'category' && (
            <div className="quick-filter-popup-card">
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Select Category</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0' }}>
                <input 
                  type="radio" 
                  name="quick_cat"
                  checked={selectedCategory === null}
                  onChange={() => handleCategorySelect(null)}
                />
                All Categories
              </label>
              {categories.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0' }}>
                  <input 
                    type="radio" 
                    name="quick_cat"
                    checked={selectedCategory === cat.id}
                    onChange={() => handleCategorySelect(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Discount Dropdown */}
        <div className="quick-filter-select-wrapper">
          <button 
            className={`quick-filter-dropdown-btn has-chevron ${selectedDiscount > 0 ? 'active' : ''}`}
            onClick={() => setActiveQuickFilter(activeQuickFilter === 'discount' ? null : 'discount')}
          >
            Discount {selectedDiscount > 0 ? `(${selectedDiscount}%+ Off)` : '(All)'}
          </button>
          {activeQuickFilter === 'discount' && (
            <div className="quick-filter-popup-card">
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Offers</span>
              {discountOptions.map(opt => (
                <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', padding: '4px 0' }}>
                  <input 
                    type="radio" 
                    name="quick_discount"
                    checked={selectedDiscount === opt.value}
                    onChange={() => setSelectedDiscount(opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Main Grid Layout */}
      <div className={`shop-layout-container ${isSidebarCollapsed ? 'sidebar-hidden' : ''}`}>
        
        {/* Sidebar Filter Panel */}
        {!isSidebarCollapsed && (
          <>
            <div className="shop-sidebar-backdrop" onClick={() => setIsSidebarCollapsed(true)} />
            <aside className="shop-sidebar-card">
              {/* Close button for mobile */}
              <div className="sidebar-mobile-close-row">
                <button 
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="sidebar-mobile-close-btn"
                >
                  ← Close Filters
                </button>
              </div>
            
            {/* Sidebar Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="sidebar-main-title">Filters</h3>
              <button onClick={resetAllFilters} className="sidebar-clear-all">Clear All</button>
            </div>

            {/* Category Accordion */}
            <div className="sidebar-accordion-item">
              <button className="sidebar-accordion-trigger" onClick={() => toggleSection('category')}>
                <span className="sidebar-accordion-title">Category</span>
                <span className={`sidebar-accordion-chevron ${openSections.category ? 'open' : ''}`}><ChevronDownIcon /></span>
              </button>

              {openSections.category && (
                <div className="sidebar-accordion-content">
                  
                  {/* All Categories Option */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="sidebar_cat"
                      checked={selectedCategory === null}
                      onChange={() => handleCategorySelect(null)}
                    />
                    All Categories
                  </label>

                  {/* Nested Category-Subcategory list */}
                  {categories.map(cat => {
                    const catSubs = subcategories.filter(s => s.category_id === cat.id);
                    const isExpanded = expandedCategories.includes(cat.id);
                    return (
                      <div key={cat.id} className="category-group-container" style={{ marginBottom: '0.5rem' }}>
                        <div 
                          className="category-group-header" 
                          onClick={() => handleCategorySelect(cat.id)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            fontWeight: selectedCategory === cat.id ? '800' : '600',
                            fontSize: '0.88rem',
                            cursor: 'pointer',
                            padding: '4px 0'
                          }}
                        >
                          <span 
                            onClick={(e) => toggleCategoryExpand(cat.id, e)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '8px',
                              cursor: 'pointer',
                              fontSize: '0.65rem',
                              color: selectedCategory === cat.id ? 'var(--brand-orange)' : 'var(--text-muted)',
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s',
                              padding: '2px 4px'
                            }}
                          >
                            ▶
                          </span>
                          {cat.name}
                        </div>
                        
                        {isExpanded && (
                          <div className="subcategory-list-indented" style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {catSubs.map(sub => {
                              const subProductCount = products.filter(p => p.subcategory_id === sub.id).length;
                              return (
                                <label 
                                  key={sub.id} 
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={selectedSubcategories.includes(sub.id)}
                                      onChange={() => handleSubcategoryToggle(sub.id)}
                                    />
                                    {sub.name}
                                  </div>
                                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({subProductCount})</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Price Range Accordion */}
            <div className="sidebar-accordion-item">
              <button className="sidebar-accordion-trigger" onClick={() => toggleSection('price')}>
                <span className="sidebar-accordion-title">Price Range</span>
                <span className={`sidebar-accordion-chevron ${openSections.price ? 'open' : ''}`}><ChevronDownIcon /></span>
              </button>

              {openSections.price && (
                <div className="sidebar-accordion-content">
                  <div className="price-inputs-row">
                    <div className="price-input-field-container">
                      <span className="price-input-symbol">₹</span>
                      <input 
                        type="number" 
                        value={minPrice} 
                        onChange={e => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="price-input-box"
                        placeholder="0"
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
                    <div className="price-input-field-container">
                      <span className="price-input-symbol">₹</span>
                      <input 
                        type="number" 
                        value={maxPrice} 
                        onChange={e => setMaxPrice(Math.max(0, parseInt(e.target.value) || 0))}
                        className="price-input-box"
                        placeholder="5000"
                      />
                    </div>
                  </div>

                  {/* Range Slider for max price */}
                  <div className="price-slider-track-container">
                    <input 
                      type="range"
                      min={0}
                      max={5000}
                      step={50}
                      value={maxPrice}
                      onChange={e => setMaxPrice(parseInt(e.target.value))}
                      className="price-slider-native"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sizes Accordion */}
            <div className="sidebar-accordion-item">
              <button className="sidebar-accordion-trigger" onClick={() => toggleSection('size')}>
                <span className="sidebar-accordion-title">Size</span>
                <span className={`sidebar-accordion-chevron ${openSections.size ? 'open' : ''}`}><ChevronDownIcon /></span>
              </button>

              {openSections.size && (
                <div className="sidebar-accordion-content">
                  <div className="sizes-grid-layout">
                    {availableSizes.map(sz => (
                      <button 
                        key={sz}
                        className={`size-pill-button ${selectedSizes.includes(sz) ? 'active' : ''}`}
                        onClick={() => toggleSizeFilter(sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colors Accordion */}
            <div className="sidebar-accordion-item">
              <button className="sidebar-accordion-trigger" onClick={() => toggleSection('color')}>
                <span className="sidebar-accordion-title">Color</span>
                <span className={`sidebar-accordion-chevron ${openSections.color ? 'open' : ''}`}><ChevronDownIcon /></span>
              </button>

              {openSections.color && (
                <div className="sidebar-accordion-content">
                  <div className="colors-swatch-grid">
                    {availableColors.map(col => (
                      <button 
                        key={col.hex}
                        className={`color-swatch-circle-btn ${selectedColors.includes(col.hex) ? 'active' : ''} ${col.isLight ? 'light-color' : ''}`}
                        style={{ backgroundColor: col.hex }}
                        onClick={() => toggleColorFilter(col.hex)}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Discount Accordion */}
            <div className="sidebar-accordion-item">
              <button className="sidebar-accordion-trigger" onClick={() => toggleSection('discount')}>
                <span className="sidebar-accordion-title">Discount</span>
                <span className={`sidebar-accordion-chevron ${openSections.discount ? 'open' : ''}`}><ChevronDownIcon /></span>
              </button>

              {openSections.discount && (
                <div className="sidebar-accordion-content">
                  {discountOptions.map(opt => (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="discount_sidebar"
                        checked={selectedDiscount === opt.value}
                        onChange={() => setSelectedDiscount(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              )}
            </div>

          </aside>
        </>
      )}

        {/* Product List Grid Column */}
        <main style={{ width: '100%' }}>
          
           {loading ? (
            /* Skeletons */
            <div className="shop-products-grid-layout product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
              <ProductGridSkeleton count={8} />
            </div>
          ) : sortedProducts.length === 0 ? (
            /* Empty State */
            <div style={{ textAlign: 'center', padding: '6rem 2rem', border: '1px solid var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔍</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No products match your filters</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try clearing some of your search parameters or select a different category.</p>
              <AnimatedButton 
                onClick={resetAllFilters} 
                className="btn btn-primary ripple-button"
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '30px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                Reset All Filters
              </AnimatedButton>
            </div>
          ) : (
            /* Products List / Grid */
            <ScrollReveal
              stagger
              key={`${viewMode}-${selectedCategory}-${selectedSubcategories.join(',')}-${selectedSizes.join(',')}`}
              className={viewMode === 'grid' ? 'shop-products-grid-layout product-grid' : 'shop-products-list-layout'}
              threshold={0.02}
              style={viewMode === 'grid' ? {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1.5rem'
              } : { gap: '1.5rem' }}
            >
              {sortedProducts.map((p, idx) => {
                const originalPrice = parseFloat(p.price);
                const hasDiscount = p.discount_percent > 0;
                const discountPrice = hasDiscount ? originalPrice * (1 - p.discount_percent / 100) : originalPrice;
                const isWishlisted = wishlist.some(item => item.id === p.id);
                const ratingInfo = getProductRating(p.id);
                return (
                  <article key={p.id} className={`premium-product-card ${viewMode === 'list' ? 'list-mode' : ''}`}>
                    
                    {/* Image Frame */}
                    <div className="premium-product-img-wrapper">
                      <ImageWithSkeleton 
                        src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)} 
                        alt={p.name}
                        onClick={() => navigate(`/product/${p.id}`)}
                        style={{ cursor: 'pointer', position: 'absolute', inset: 0 }}
                      />

                      {/* Badges */}
                      {hasDiscount ? (
                        <div className="card-discount-badge">-{p.discount_percent}%</div>
                      ) : (
                        p.is_featured && <div className="card-new-badge">FEATURED</div>
                      )}

                      {/* Wishlist Button */}
                      {user && (
                        <button 
                          className={`card-wishlist-circle-btn ${isWishlisted ? 'wishlisted' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(p);
                          }}
                          aria-label="Wishlist"
                        >
                          <HeartIcon filled={isWishlisted} />
                        </button>
                      )}

                      {/* Hover Quick Panel */}
                      <div className="premium-card-hover-panel">
                        <AnimatedButton 
                          className="hover-panel-btn primary ripple-button"
                          onClick={(e) => {
                             e.stopPropagation();
                             addToCart({ ...p, price: discountPrice, image_url: p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url }, e);
                           }}
                        >
                          Add to Bag
                        </AnimatedButton>
                        <button 
                          className="hover-panel-btn secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${p.id}`);
                          }}
                        >
                          Details
                        </button>
                      </div>
                    </div>

                    {/* Product details */}
                    {viewMode === 'list' ? (
                      <div 
                        className="premium-product-details list-layout-split" 
                        onClick={() => navigate(`/product/${p.id}`)} 
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="list-details-left-side">
                          <span className="premium-card-brand-label">
                            {categories.find(c => c.id === p.category_id)?.name || 'Apparel'}
                          </span>
                          
                          <h4 className="premium-card-name-title" title={p.name}>{p.name}</h4>

                          {/* Star rating */}
                          <div className="premium-card-rating-line">
                            <StarIcon />
                            <span>{ratingInfo.rating}</span>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({ratingInfo.count})</span>
                          </div>

                          {/* Price line */}
                          <div className="premium-card-price-row">
                            <span className="premium-card-current-price">₹{discountPrice.toFixed(2)}</span>
                            {hasDiscount && (
                              <span className="premium-card-original-price">₹{originalPrice.toFixed(2)}</span>
                            )}
                          </div>

                          {/* Color Dots */}
                          {Array.isArray(p.colors) && p.colors.length > 0 && (
                            <div className="premium-card-swatches-row">
                              {p.colors.slice(0, 4).map((cHex, cIdx) => (
                                <div 
                                  key={cIdx} 
                                  className="card-color-dot-swatch"
                                  style={{ backgroundColor: cHex }}
                                />
                              ))}
                              {p.colors.length > 4 && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>+{p.colors.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right part: Action Buttons stacked in a column */}
                        <div className="list-details-right-side" onClick={e => e.stopPropagation()}>
                          <AnimatedButton 
                            className="premium-list-action-btn primary ripple-button"
                             onClick={(e) => addToCart({ ...p, price: discountPrice, image_url: p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url }, e)}
                          >
                            Add to Bag
                          </AnimatedButton>
                          <button 
                            className="premium-list-action-btn secondary"
                            onClick={() => navigate(`/product/${p.id}`)}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="premium-product-details" 
                        onClick={() => navigate(`/product/${p.id}`)} 
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="premium-card-brand-label">
                          {categories.find(c => c.id === p.category_id)?.name || 'Apparel'}
                        </span>
                        
                        <h4 className="premium-card-name-title" title={p.name}>{p.name}</h4>

                        {/* Star rating */}
                        <div className="premium-card-rating-line">
                          <StarIcon />
                          <span>{ratingInfo.rating}</span>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({ratingInfo.count})</span>
                        </div>

                        {/* Price line */}
                        <div className="premium-card-price-row">
                          <span className="premium-card-current-price">₹{discountPrice.toFixed(2)}</span>
                          {hasDiscount && (
                            <span className="premium-card-original-price">₹{originalPrice.toFixed(2)}</span>
                          )}
                        </div>

                        {/* Color Dots */}
                        {Array.isArray(p.colors) && p.colors.length > 0 && (
                          <div className="premium-card-swatches-row">
                            {p.colors.slice(0, 4).map((cHex, cIdx) => (
                              <div 
                                key={cIdx} 
                                className="card-color-dot-swatch"
                                style={{ backgroundColor: cHex }}
                              />
                            ))}
                            {p.colors.length > 4 && (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>+{p.colors.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </ScrollReveal>
          )}

        </main>
      </div>

    </div>
  );
}
