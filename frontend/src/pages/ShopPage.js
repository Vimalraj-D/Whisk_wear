import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import ScrollReveal from '../components/ScrollReveal';

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"></path>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const getCategoryKey = (name) => name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '_') : '';

export default function ShopPage({ user, addToCart, openCart, showToast, wishlist = [], toggleWishlist }) {
  const navigate = useNavigate();
  const query = useQuery();
  const focusParam = query.get('focus');
  const categoryParam = query.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState(categoryParam);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('recommended');
  // New view mode state: 'grid' or 'list'
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const searchInputRef = useRef(null);

  // Sidebar toggles and collapsible sections
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    size: true,
    color: true
  });

  // Advanced Sidebar Filters State
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);

  // Option lists derived or predefined
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Standard'];
  
  // Custom aesthetic colors palette for filter swatches (mapping hex codes to readable labels)
  const availableColors = [
    { hex: '#f5f6fa', name: 'White' },
    { hex: '#dcdde1', name: 'Soft Grey' },
    { hex: '#1b1464', name: 'Midnight Navy' },
    { hex: '#0652dd', name: 'Royal Blue' },
    { hex: '#fbc531', name: 'Warm Yellow' },
    { hex: '#4cd137', name: 'Green' },
    { hex: '#ffc0cb', name: 'Rose Pink' },
    { hex: '#e8a7a1', name: 'Salmon Coral' },
    { hex: '#d4f0f0', name: 'Soft Mint' }
  ];

  useEffect(() => {
    if (focusParam === 'search' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focusParam]);

  useEffect(() => {
    setFilter(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    apiService.getCategories()
      .then(res => {
        const cats = res.data || res;
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    apiService.getProducts()
      .then(res => {
        const prodList = res.data || res;
        setProducts(Array.isArray(prodList) ? prodList : []);
      })
      .catch(e => showToast('Failed to load products'))
      .finally(() => setLoading(false));
  }, [showToast]);

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
    setFilter('all');
    setSearch('');
    setMinPrice(0);
    setMaxPrice(5000);
    setSelectedSizes([]);
    setSelectedColors([]);
    setSortOption('recommended');
  };

  // ─── Filter Logic ───
  let filteredProducts = Array.isArray(products) ? products.filter(p => {
    // 1. Search Query
    const nameText = (p.name || '').toLowerCase();
    const descText = (p.description || '').toLowerCase();
    const matchesSearch = nameText.includes(search.toLowerCase()) || 
                          descText.includes(search.toLowerCase());

    // 2. Category
    const dbCategoryKey = p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '_') : '';
    const matchesCategory = filter === 'all' || dbCategoryKey === filter;

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

    return matchesSearch && matchesCategory && matchesPrice && matchesSizes && matchesColors;
  }) : [];

  // ─── Sorting Logic ───
  if (sortOption === 'price_asc') {
    filteredProducts.sort((a, b) => {
      const pA = a.discount_percent > 0 ? parseFloat(a.price) * (1 - a.discount_percent / 100) : parseFloat(a.price);
      const pB = b.discount_percent > 0 ? parseFloat(b.price) * (1 - b.discount_percent / 100) : parseFloat(b.price);
      return pA - pB;
    });
  } else if (sortOption === 'price_desc') {
    filteredProducts.sort((a, b) => {
      const pA = a.discount_percent > 0 ? parseFloat(a.price) * (1 - a.discount_percent / 100) : parseFloat(a.price);
      const pB = b.discount_percent > 0 ? parseFloat(b.price) * (1 - b.discount_percent / 100) : parseFloat(b.price);
      return pB - pA;
    });
  } else if (sortOption === 'discount') {
    filteredProducts.sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0));
  }

  // ─── Active Tags Helpers ───
  const getActiveFilters = () => {
    const list = [];
    if (filter !== 'all') {
      const catObj = categories.find(c => getCategoryKey(c.name) === filter);
      list.push({ type: 'category', label: catObj ? catObj.name : filter, value: filter });
    }
    if (search !== '') {
      list.push({ type: 'search', label: `"${search}"`, value: search });
    }
    if (minPrice > 0 || maxPrice < 5000) {
      list.push({ type: 'price', label: `₹${minPrice} - ₹${maxPrice}`, value: { minPrice, maxPrice } });
    }
    selectedSizes.forEach(sz => {
      list.push({ type: 'size', label: `Size: ${sz}`, value: sz });
    });
    selectedColors.forEach(col => {
      const colorObj = availableColors.find(c => c.hex === col);
      list.push({ type: 'color', label: colorObj ? colorObj.name : col, value: col });
    });
    return list;
  };

  const removeFilterItem = (item) => {
    if (item.type === 'category') setFilter('all');
    else if (item.type === 'search') setSearch('');
    else if (item.type === 'price') { setMinPrice(0); setMaxPrice(5000); }
    else if (item.type === 'size') setSelectedSizes(prev => prev.filter(s => s !== item.value));
    else if (item.type === 'color') setSelectedColors(prev => prev.filter(c => c !== item.value));
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="shop-page-wrapper" style={{ padding: '2.5rem 5%', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* 1. Center-Aligned Premium Search Header (Top) */}
      <div className="shop-search-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <div className="search-bar-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '680px', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
            <SearchIcon />
          </span>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search for clothes, towels, blankets, dungarees..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '1.1rem 1.1rem 1.1rem 3.25rem',
              borderRadius: '50px',
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              transition: 'border-color 0.25s, box-shadow 0.25s'
            }}
            className="shop-main-search-input"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: '16px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Active Filters Tag Bar */}
      {activeFilters.length > 0 && (
        <div className="active-filter-tags-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem', background: 'var(--bg-secondary)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', marginRight: '6px' }}>Active Filters:</span>
          {activeFilters.map((item, idx) => (
            <span 
              key={idx} 
              className="filter-pill-tag"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '50px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => removeFilterItem(item)}
            >
              {item.label}
              <span style={{ color: 'var(--color-cancelled)', fontSize: '0.9rem', marginLeft: '2px', fontWeight: 'bold' }}>×</span>
            </span>
          ))}
          <button 
            onClick={resetAllFilters} 
            style={{
              background: 'none', border: 'none', color: 'var(--brand-purple)', fontSize: '0.78rem', fontWeight: 'bold', cursor: 'pointer', marginLeft: 'auto', padding: '4px 8px', transition: 'text-decoration 0.2s'
            }}
            className="clear-all-pills-btn"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 3. 2-Column Sidebar Grid */}
      <div 
        className="shop-layout-grid" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: isSidebarCollapsed ? '0px 1fr' : '280px 1fr', 
          gap: isSidebarCollapsed ? '0' : '2.5rem', 
          alignItems: 'start',
          transition: 'grid-template-columns 0.45s cubic-bezier(0.16, 1, 0.3, 1), gap 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        
        {/* Left Sidebar: Collapsible Accordion Filter Panels */}
        <aside 
          className={`shop-filter-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`} 
          style={{ 
            background: 'var(--glossy-bg)', 
            border: isSidebarCollapsed ? 'none' : '1px solid var(--glossy-border)', 
            borderRadius: '16px', 
            padding: isSidebarCollapsed ? '0' : '1.5rem', 
            boxShadow: isSidebarCollapsed ? 'none' : 'var(--shadow-sm)', 
            position: 'sticky', 
            top: '130px', 
            maxHeight: '82vh', 
            overflowY: 'auto',
            opacity: isSidebarCollapsed ? 0 : 1,
            pointerEvents: isSidebarCollapsed ? 'none' : 'auto',
            transition: 'opacity 0.35s ease, padding 0.45s cubic-bezier(0.16, 1, 0.3, 1), border 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', margin: 0 }}>Filter By</h3>
            {activeFilters.length > 0 && (
              <button 
                onClick={resetAllFilters} 
                style={{ background: 'none', border: 'none', color: 'var(--color-cancelled)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <TrashIcon /> Reset
              </button>
            )}
          </div>

          {/* Collapsible Accordion: Category */}
          <div className="filter-group-accordion" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div 
              className="filter-group-header" 
              onClick={() => toggleSection('category')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', cursor: 'pointer' }}
            >
              <h4 style={{ fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0, letterSpacing: '0.75px' }}>Category</h4>
              <span className={`accordion-arrow ${openSections.category ? 'open' : ''}`} style={{ transition: 'transform 0.3s', transform: openSections.category ? 'rotate(90deg)' : 'rotate(0deg)' }}>➔</span>
            </div>
            {openSections.category && (
              <div className="filter-group-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="category_filter"
                    checked={filter === 'all'} 
                    onChange={() => setFilter('all')} 
                    style={{ accentColor: 'var(--brand-purple)' }}
                  />
                  All Collections
                </label>
                {categories.map(cat => {
                  const catKey = getCategoryKey(cat.name);
                  return (
                    <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="category_filter"
                        checked={filter === catKey} 
                        onChange={() => setFilter(catKey)} 
                        style={{ accentColor: 'var(--brand-purple)' }}
                      />
                      {cat.name}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Collapsible Accordion: Price Range */}
          <div className="filter-group-accordion" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div 
              className="filter-group-header" 
              onClick={() => toggleSection('price')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', cursor: 'pointer' }}
            >
              <h4 style={{ fontSize: '0.8rem', fontWeight: '855', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0, letterSpacing: '0.75px' }}>Price (₹)</h4>
              <span className={`accordion-arrow ${openSections.price ? 'open' : ''}`} style={{ transition: 'transform 0.3s', transform: openSections.price ? 'rotate(90deg)' : 'rotate(0deg)' }}>➔</span>
            </div>
            {openSections.price && (
              <div className="filter-group-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={e => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width: '100%', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>
                
                {/* Preset Price Ranges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <button 
                    onClick={() => { setMinPrice(0); setMaxPrice(1000); }}
                    className="preset-price-btn"
                    style={{ textAlign: 'left', border: 'none', background: 'none', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 0' }}
                  >
                    Under ₹1,000
                  </button>
                  <button 
                    onClick={() => { setMinPrice(1000); setMaxPrice(2000); }}
                    className="preset-price-btn"
                    style={{ textAlign: 'left', border: 'none', background: 'none', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 0' }}
                  >
                    ₹1,000 to ₹2,000
                  </button>
                  <button 
                    onClick={() => { setMinPrice(2000); setMaxPrice(5000); }}
                    className="preset-price-btn"
                    style={{ textAlign: 'left', border: 'none', background: 'none', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 0' }}
                  >
                    Over ₹2,000
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Accordion: Sizes */}
          <div className="filter-group-accordion" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div 
              className="filter-group-header" 
              onClick={() => toggleSection('size')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', cursor: 'pointer' }}
            >
              <h4 style={{ fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0, letterSpacing: '0.75px' }}>Sizes</h4>
              <span className={`accordion-arrow ${openSections.size ? 'open' : ''}`} style={{ transition: 'transform 0.3s', transform: openSections.size ? 'rotate(90deg)' : 'rotate(0deg)' }}>➔</span>
            </div>
            {openSections.size && (
              <div className="filter-group-content" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                {availableSizes.map(size => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSizeFilter(size)}
                      style={{
                        border: '1.5px solid',
                        borderColor: isSelected ? 'var(--brand-purple)' : 'var(--border-color)',
                        background: isSelected ? 'var(--brand-teal-lt)' : 'var(--bg-card)',
                        color: isSelected ? 'var(--brand-purple)' : 'var(--text-secondary)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Collapsible Accordion: Colors */}
          <div className="filter-group-accordion" style={{ marginBottom: '0.5rem' }}>
            <div 
              className="filter-group-header" 
              onClick={() => toggleSection('color')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', cursor: 'pointer' }}
            >
              <h4 style={{ fontSize: '0.8rem', fontWeight: '850', textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0, letterSpacing: '0.75px' }}>Colors</h4>
              <span className={`accordion-arrow ${openSections.color ? 'open' : ''}`} style={{ transition: 'transform 0.3s', transform: openSections.color ? 'rotate(90deg)' : 'rotate(0deg)' }}>➔</span>
            </div>
            {openSections.color && (
              <div className="filter-group-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '10px' }}>
                {availableColors.map(color => {
                  const isSelected = selectedColors.includes(color.hex);
                  return (
                    <button
                      key={color.hex}
                      onClick={() => toggleColorFilter(color.hex)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: color.hex,
                        border: '2px solid #fff',
                        cursor: 'pointer',
                        outline: 'none',
                        boxShadow: isSelected ? '0 0 0 2px var(--brand-purple)' : '0 0 0 1px var(--border-color)',
                        transition: 'all 0.2s'
                      }}
                      title={color.name}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Right Content Area: Results toolbar and Products Grid */}
        <main className="shop-products-column">
          
          {/* Header Row: Result count, Collapse Button, & Sort option */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'var(--glossy-bg)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--glossy-border)', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: '12px' }}>
            
            {/* Collapse toggle and counts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => setIsSidebarCollapsed(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-color)',
                  padding: '0.45rem 1rem',
                  borderRadius: '30px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.2s'
                }}
                className="sidebar-toggle-btn desktop-only-nav-item"
              >
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
                >
                  <line x1="21" y1="4" x2="14" y2="4"></line>
                  <line x1="10" y1="4" x2="3" y2="4"></line>
                  <line x1="21" y1="12" x2="12" y2="12"></line>
                  <line x1="8" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="20" x2="16" y2="20"></line>
                  <line x1="12" y1="20" x2="3" y2="20"></line>
                  <circle cx="12" cy="4" r="2"></circle>
                  <circle cx="10" cy="12" r="2"></circle>
                  <circle cx="14" cy="20" r="2"></circle>
                </svg>
                {isSidebarCollapsed ? 'Show Filters' : 'Hide Filters'}
              </button>
              
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            
            {/* Sort Dropdown and View Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
              <select 
                className="form-control" 
                style={{ width: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.35rem 1rem', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-xs)',
                transition: 'background 0.2s'
              }}
              aria-label="Toggle view mode"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
            </div>
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-info">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line short"></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem' }}>
                      <div className="skeleton-line" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, marginBottom: '1rem', color: 'var(--brand-purple)' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No products match filters</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Try adjusting your search queries, size selections, or pricing parameters.</p>
              <button className="btn btn-teal" onClick={resetAllFilters} style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid" style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(240px, 1fr))' : '1fr',
              gap: '1.5rem'
            }}>
              {filteredProducts.map((p, idx) => {
                const originalPrice = parseFloat(p.price);
                const hasDiscount = p.discount_percent > 0;
                const discountPrice = hasDiscount ? originalPrice * (1 - p.discount_percent / 100) : originalPrice;
                const isWishlisted = wishlist.some(item => item.id === p.id);
                
                return (
                  <ScrollReveal key={p.id} delay={(idx % 3) * 100} threshold={0.05}>
                    <div className="product-card" style={{
                      transition: 'transform 0.25s, box-shadow 0.25s',
                      cursor: 'pointer',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'var(--bg-card)',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    }}
                    >
                      <div className="product-img-wrapper" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id}`)}>
                        <ImageWithSkeleton src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)} alt={p.name} className="product-img" style={{ position: 'absolute', inset: 0 }} />
                        {hasDiscount ? (
                          <div className="discount-badge">{p.discount_percent}% OFF</div>
                        ) : (
                          <div className="product-category-badge badge-kitchen">New Arrival</div>
                        )}
                        {user && (
                          <button 
                            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(p);
                            }}
                            aria-label="Toggle wishlist"
                            style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              zIndex: 10,
                              background: 'rgba(255, 255, 255, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: isWishlisted ? 'var(--color-cancelled)' : 'var(--text-secondary)',
                              boxShadow: 'var(--shadow-sm)',
                              transition: 'color 0.2s, background-color 0.2s'
                            }}
                          >
                            <HeartIcon />
                          </button>
                        )}
                        <div className="product-hover-overlay">
                          <div className="hover-actions">
                            <button className="btn btn-teal" onClick={(e) => { e.stopPropagation(); addToCart({ ...p, price: discountPrice, image_url: p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url }); }}>Add to Bag</button>
                            <button className="btn-outline-white" onClick={(e) => { e.stopPropagation(); navigate(`/product/${p.id}`); }}>Quick View</button>
                          </div>
                        </div>
                      </div>
                      <div className="product-info" style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id}`)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h3 className="product-name" style={{ marginBottom: 0, fontSize: '0.95rem' }}>{p.name}</h3>
                          <div className="product-pricing" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            {hasDiscount ? (
                              <>
                                <span className="discount-price" style={{ fontSize: '0.95rem' }}>₹{discountPrice.toFixed(2)}</span>
                                <span className="original-price" style={{ fontSize: '0.75rem', textDecoration: 'line-through' }}>₹{originalPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="discount-price" style={{ fontSize: '0.95rem' }}>₹{originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        {/* Star Rating */}
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem', alignItems: 'center' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg key={star} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={star <= 4 ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          ))}
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '4px' }}>(24)</span>
                        </div>
                        <p className="product-desc" style={{ fontSize: '0.78rem', marginBottom: 0 }}>{p.description}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </main>
        
      </div>
      
    </div>
  );
}
