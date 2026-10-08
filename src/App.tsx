import React, { useState, useEffect, useMemo } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistModal } from './components/WishlistModal';
import { HelpModal } from './components/HelpModal';
import { AccountModal } from './components/AccountModal';
import { CategoriesModal } from './components/CategoriesModal';
import { BottomNav } from './components/BottomNav';
import { IosInstallBanner } from './components/IosInstallBanner';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { Product, ProductCategory } from './types';
import { fetchProducts, fetchCategories, formatPrice, isLiveConnectedToStore } from './services/api';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data/mockData';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronUp, Sparkles, Trophy, Tag, ShieldCheck, Truck, RotateCcw, Facebook, Instagram, Mail, Phone, ExternalLink, SearchX, Package } from 'lucide-react';

export type ThemeMode = 'system' | 'light' | 'dark';

const AppContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<ProductCategory[]>(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  // Modals
  const { isCartOpen, setIsCartOpen } = useCart();
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'wishlist' | 'cart' | 'account'>('home');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Pull-To-Refresh State for Catalog
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const pullStartYRef = React.useRef<number>(0);
  const pullStartXRef = React.useRef<number>(0);
  const isPullActiveRef = React.useRef<boolean>(false);

  // Sync active bottom tab when modals close
  useEffect(() => {
    if (!isWishlistOpen && !isCategoriesOpen && !isAccountOpen && !isCartOpen) {
      setActiveTab('home');
    }
  }, [isWishlistOpen, isCategoriesOpen, isAccountOpen, isCartOpen]);

  // Ensure modals are mutually exclusive to prevent double overlays / black screens
  useEffect(() => {
    if (isCartOpen) {
      setActiveProductModal(null);
      setIsWishlistOpen(false);
      setIsCategoriesOpen(false);
      setIsAccountOpen(false);
      setIsHelpOpen(false);
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (activeProductModal) {
      setIsCartOpen(false);
      setIsWishlistOpen(false);
      setIsCategoriesOpen(false);
      setIsAccountOpen(false);
      setIsHelpOpen(false);
    }
  }, [activeProductModal]);

  useEffect(() => {
    if (isWishlistOpen) {
      setIsCartOpen(false);
      setActiveProductModal(null);
      setIsCategoriesOpen(false);
      setIsAccountOpen(false);
      setIsHelpOpen(false);
    }
  }, [isWishlistOpen]);

  useEffect(() => {
    if (isCategoriesOpen) {
      setIsCartOpen(false);
      setActiveProductModal(null);
      setIsWishlistOpen(false);
      setIsAccountOpen(false);
      setIsHelpOpen(false);
    }
  }, [isCategoriesOpen]);

  useEffect(() => {
    if (isAccountOpen) {
      setIsCartOpen(false);
      setActiveProductModal(null);
      setIsWishlistOpen(false);
      setIsCategoriesOpen(false);
      setIsHelpOpen(false);
    }
  }, [isAccountOpen]);

  useEffect(() => {
    if (isHelpOpen) {
      setIsCartOpen(false);
      setActiveProductModal(null);
      setIsWishlistOpen(false);
      setIsCategoriesOpen(false);
      setIsAccountOpen(false);
    }
  }, [isHelpOpen]);

  // Theme Mode: 'system' (default) | 'light' | 'dark'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const savedMode = localStorage.getItem('teniszruha_theme_mode');
      if (savedMode === 'system' || savedMode === 'light' || savedMode === 'dark') {
        return savedMode;
      }
      return 'system';
    } catch {
      return 'system';
    }
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Dynamic listener for phone / OS system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleChange);
    }

    // Also sync whenever app is brought back to foreground from Android quick settings
    const handleSync = () => {
      setSystemPrefersDark(mediaQuery.matches);
    };
    window.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if ((mediaQuery as any).removeListener) {
        (mediaQuery as any).removeListener(handleChange);
      }
      window.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  // Evaluated isDarkMode boolean based on current mode and system preference
  const isDarkMode = themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';

  // Apply theme class, meta theme-color, and Capacitor Android status bar
  useEffect(() => {
    try {
      localStorage.setItem('teniszruha_theme_mode', themeMode);
      localStorage.setItem('teniszruha_theme', isDarkMode ? 'dark' : 'light');

      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }

      // Update meta theme-color for browser address bar
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDarkMode ? '#090d16' : '#ffffff');
      }

      // Sync native status bar with Capacitor plugin (iOS and Android)
      const syncNativeStatusBar = async () => {
        try {
          if (Capacitor.isPluginAvailable('StatusBar')) {
            await StatusBar.setStyle({ style: isDarkMode ? Style.Dark : Style.Light });
            if (Capacitor.getPlatform() === 'android') {
              await StatusBar.setBackgroundColor({ color: isDarkMode ? '#090d16' : '#ffffff' });
            }
          }
        } catch {
          // Native StatusBar not available on web
        }
      };
      syncNativeStatusBar();
    } catch (e) {
      console.error('Theme sync error:', e);
    }
  }, [isDarkMode, themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => {
      const currentSystemIsDark = systemPrefersDark;
      if (prev === 'system') {
        return currentSystemIsDark ? 'light' : 'dark';
      }
      if (prev === (currentSystemIsDark ? 'light' : 'dark')) {
        return currentSystemIsDark ? 'dark' : 'light';
      }
      return 'system';
    });
  };

  // Monitor scroll for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Android hardware/gesture Back button
  useEffect(() => {
    let backListener: any = null;
    const setupBack = async () => {
      try {
        backListener = await CapApp.addListener('backButton', () => {
          if (activeProductModal) {
            setActiveProductModal(null);
          } else if (isCartOpen) {
            setIsCartOpen(false);
          } else if (isWishlistOpen) {
            setIsWishlistOpen(false);
          } else if (isCategoriesOpen) {
            setIsCategoriesOpen(false);
          } else if (isHelpOpen) {
            setIsHelpOpen(false);
          } else if (isAccountOpen) {
            setIsAccountOpen(false);
          } else if (searchQuery) {
            setSearchQuery('');
          } else if (selectedCategoryId !== null || selectedCategorySlug !== null || selectedBrand !== null) {
            setSelectedCategoryId(null);
            setSelectedCategorySlug(null);
            setSelectedBrand(null);
          } else {
            CapApp.exitApp();
          }
        });
      } catch {
        // Not running in native Capacitor environment
      }
    };
    setupBack();

    return () => {
      if (backListener?.remove) {
        backListener.remove();
      }
    };
  }, [
    activeProductModal,
    isCartOpen,
    isWishlistOpen,
    isCategoriesOpen,
    isHelpOpen,
    isAccountOpen,
    searchQuery,
    selectedCategoryId,
    selectedCategorySlug,
    selectedBrand,
    setIsCartOpen,
  ]);

  // Load or refresh data from WooCommerce Store API
  const fetchStoreData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [liveCats, liveProds] = await Promise.all([
        fetchCategories(),
        fetchProducts({ perPage: 40 }),
      ]);

      if (liveProds.length > 0) {
        setProducts(liveProds);
      }
      setIsLiveConnected(isLiveConnectedToStore());
      if (liveCats.length > 0) {
        setCategories(liveCats);
      }
    } catch (err) {
      console.warn('API connection check:', err);
      setIsLiveConnected(false);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  // Pull-To-Refresh Touch Event Handlers
  const handleCatalogTouchStart = (e: React.TouchEvent) => {
    // Disable when modals are active
    if (activeProductModal || isCartOpen || isWishlistOpen || isCategoriesOpen || isHelpOpen || isAccountOpen) {
      isPullActiveRef.current = false;
      return;
    }
    if (e.touches.length !== 1) return;
    if (window.scrollY <= 2) {
      pullStartYRef.current = e.touches[0].clientY;
      pullStartXRef.current = e.touches[0].clientX;
      isPullActiveRef.current = true;
    } else {
      isPullActiveRef.current = false;
    }
  };

  const handleCatalogTouchMove = (e: React.TouchEvent) => {
    if (!isPullActiveRef.current || isRefreshing) return;
    if (window.scrollY > 2) {
      isPullActiveRef.current = false;
      setPullDistance(0);
      return;
    }
    const touch = e.touches[0];
    const deltaY = touch.clientY - pullStartYRef.current;
    const deltaX = touch.clientX - pullStartXRef.current;

    if (deltaY <= 0) {
      setPullDistance(0);
      return;
    }

    // Discard horizontal gestures (e.g. category pill scrolling or banner swipes)
    if (Math.abs(deltaX) > deltaY * 1.2) {
      return;
    }

    const distance = Math.min(deltaY * 0.45, 85);
    setPullDistance(distance);
  };

  const handleCatalogTouchEnd = async () => {
    if (!isPullActiveRef.current || isRefreshing) return;
    isPullActiveRef.current = false;

    if (pullDistance >= 60) {
      setIsRefreshing(true);
      setPullDistance(60);
      try {
        await fetchStoreData(true);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  };

  const handleCatalogTouchCancel = () => {
    isPullActiveRef.current = false;
    setPullDistance(0);
  };

  // Extract all unique brands from products
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach(p => {
      const brandAttr = p.attributes?.find(
        a => a.name.toLowerCase() === 'márka' || a.taxonomy === 'pa_marka'
      );
      if (brandAttr && brandAttr.terms?.[0]?.name) {
        brandsSet.add(brandAttr.terms[0].name);
      }
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Featured sections for home matching teniszruha.hu
  const nadalProducts = useMemo(() => {
    return products.filter(p =>
      p.categories?.some(c => c.slug === 'nadal' || c.name.toLowerCase().includes('nadal')) ||
      p.name.toLowerCase().includes('nadal')
    ).slice(0, 6);
  }, [products]);

  const racketProducts = useMemo(() => {
    return products.filter(p =>
      p.categories?.some(c => c.slug === 'teniszutok' || c.name.toLowerCase().includes('teniszütő')) ||
      p.sku?.startsWith('SKU-12')
    ).slice(0, 6);
  }, [products]);

  const accessoryProducts = useMemo(() => {
    return products.filter(p =>
      p.categories?.some(c =>
        c.slug === 'kiegeszitok' ||
        ['zokni', 'grip', 'sapka', 'csukloszorito', 'fejvedo-szalag', 'csuklovedo'].includes(c.slug)
      ) ||
      p.name.toLowerCase().includes('grip') ||
      p.name.toLowerCase().includes('szalag') ||
      p.name.toLowerCase().includes('zokni') ||
      p.name.toLowerCase().includes('visor')
    ).slice(0, 6);
  }, [products]);

  // Footer special widgets
  const latestProducts = useMemo(() => {
    return products
      .filter(p => p.sku?.startsWith('SKU-12') || p.id === 14046)
      .slice(0, 4);
  }, [products]);

  const popularProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes('nadal') || p.on_sale)
      .slice(0, 4);
  }, [products]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category slug filter
        if (selectedCategorySlug && selectedCategorySlug !== 'all') {
          if (selectedCategorySlug === 'akciok') {
            const regPrice = parseInt(p.prices?.regular_price || '0', 10);
            const curPrice = parseInt(p.prices?.price || '0', 10);
            if (!p.on_sale && regPrice <= curPrice) return false;
          } else if (selectedCategorySlug === 'nadal') {
            const isNadal =
              p.categories?.some(c => c.slug === 'nadal' || c.name.toLowerCase().includes('nadal')) ||
              p.name.toLowerCase().includes('nadal');
            if (!isNadal) return false;
          } else if (selectedCategorySlug === 'teniszutok') {
            const isRacket =
              p.categories?.some(c => c.slug === 'teniszutok' || c.name.toLowerCase().includes('teniszütő')) ||
              p.sku?.startsWith('SKU-12');
            if (!isRacket) return false;
          } else if (selectedCategorySlug === 'ruhazat') {
            // Clothing includes men's, women's, nadal clothing, polos, pants, etc.
            const isClothing =
              p.categories?.some(c =>
                ['ruhazat', 'ferfi', 'noi', 'polok', 'nadragok', 'szoknyak', 'trening-felsok', 'dzsekik', 'sportmelltartok', 'top', 'nadragok-nadal', 'polok-nadal'].includes(c.slug) ||
                c.name.toLowerCase().includes('ruha') ||
                c.name.toLowerCase().includes('póló') ||
                c.name.toLowerCase().includes('nadrág') ||
                c.name.toLowerCase().includes('szoknya') ||
                c.name.toLowerCase().includes('dzseki')
              ) ||
              p.name.toLowerCase().includes('póló') ||
              p.name.toLowerCase().includes('nadrág') ||
              p.name.toLowerCase().includes('szoknya') ||
              p.name.toLowerCase().includes('dzseki') ||
              p.name.toLowerCase().includes('polo');
            if (!isClothing) return false;
          } else if (selectedCategorySlug === 'ferfi') {
            const isMen =
              p.categories?.some(c => c.slug === 'ferfi' || c.name.toLowerCase().includes('férfi')) ||
              p.name.toLowerCase().includes('férfi');
            if (!isMen) return false;
          } else if (selectedCategorySlug === 'noi') {
            const isWomen =
              p.categories?.some(c => c.slug === 'noi' || c.name.toLowerCase().includes('női')) ||
              p.name.toLowerCase().includes('női') ||
              p.name.toLowerCase().includes('szoknya');
            if (!isWomen) return false;
          } else if (selectedCategorySlug === 'kiegeszitok') {
            const isAcc =
              p.categories?.some(c =>
                c.slug === 'kiegeszitok' ||
                ['zokni', 'grip', 'sapka', 'csukloszorito', 'fejvedo-szalag', 'csuklovedo'].includes(c.slug)
              ) ||
              p.name.toLowerCase().includes('grip') ||
              p.name.toLowerCase().includes('szalag') ||
              p.name.toLowerCase().includes('zokni') ||
              p.name.toLowerCase().includes('visor');
            if (!isAcc) return false;
          } else if (selectedCategoryId !== null) {
            const matchCat = p.categories?.some(c => c.id === selectedCategoryId);
            if (!matchCat) return false;
          }
        } else if (selectedCategoryId !== null) {
          const matchCat = p.categories?.some(c => c.id === selectedCategoryId);
          if (!matchCat) return false;
        }

        // Brand filter
        if (selectedBrand !== null) {
          const brandAttr = p.attributes?.find(
            a => a.name.toLowerCase() === 'márka' || a.taxonomy === 'pa_marka'
          );
          if (brandAttr?.terms?.[0]?.name !== selectedBrand) return false;
        }

        // Search query filter
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCategory = p.categories?.some(c => c.name.toLowerCase().includes(q));
          const matchBrand = p.attributes?.some(a =>
            a.terms?.some(t => t.name.toLowerCase().includes(q))
          );
          const matchSku = p.sku?.toLowerCase().includes(q);
          if (!matchName && !matchCategory && !matchBrand && !matchSku) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = parseInt(a.prices?.price || '0', 10);
        const priceB = parseInt(b.prices?.price || '0', 10);

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // featured/default
      });
  }, [products, selectedCategoryId, selectedCategorySlug, selectedBrand, searchQuery, sortBy]);

  const handleSelectCategory = (catId: number | null, slug?: string) => {
    setSelectedCategoryId(catId);
    setSelectedCategorySlug(slug || null);
    setSelectedBrand(null);
    setActiveTab('home');
    const el = document.getElementById('catalog-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategorySlug = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    setSelectedCategoryId(cat?.id || null);
    setSelectedCategorySlug(slug);
    setSelectedBrand(null);
    setActiveTab('home');
    const el = document.getElementById('catalog-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const isFilteringActive =
    searchQuery !== '' ||
    (selectedCategorySlug !== null && selectedCategorySlug !== 'all') ||
    selectedBrand !== null ||
    sortBy !== 'featured';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20 selection:bg-amber-400 selection:text-slate-950 transition-colors duration-200">
      {/* App Header with Live Search, Theme Toggle & Belépés */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onSelectCategorySlug={handleSelectCategorySlug}
        onOpenProduct={prod => setActiveProductModal(prod)}
        isLiveConnected={isLiveConnected}
        products={products}
        isDarkMode={isDarkMode}
        themeMode={themeMode}
        onToggleTheme={toggleTheme}
      />

      <main
        className="flex-1"
        onTouchStart={handleCatalogTouchStart}
        onTouchMove={handleCatalogTouchMove}
        onTouchEnd={handleCatalogTouchEnd}
        onTouchCancel={handleCatalogTouchCancel}
      >
        {/* Animated Pull-To-Refresh Indicator */}
        {(pullDistance > 0 || isRefreshing) && (
          <div
            className="w-full flex items-center justify-center overflow-hidden transition-all duration-150 pointer-events-none z-30"
            style={{
              height: `${pullDistance}px`,
              opacity: Math.min(1, pullDistance / 35),
            }}
          >
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200">
              <RotateCcw
                className={`w-3.5 h-3.5 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`}
                style={{
                  transform: !isRefreshing ? `rotate(${pullDistance * 5}deg)` : undefined,
                }}
              />
              <span>
                {isRefreshing
                  ? 'Termékek frissítése...'
                  : pullDistance >= 60
                  ? 'Engedd el a frissítéshez!'
                  : 'Húzd le a frissítéshez'}
              </span>
            </div>
          </div>
        )}

        {/* Authentic teniszruha.hu Hero Banner Section (when not actively searching) */}
        {!isFilteringActive && (
          <HeroBanner onSelectCategorySlug={handleSelectCategorySlug} />
        )}

        {/* Anchor for smooth scroll */}
        <div id="catalog-anchor" />

        {/* Sticky Category Pills Navigation */}
        <div className="sticky top-[53px] z-30 bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors">
          <CategoryNav
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategory={handleSelectCategory}
          />
        </div>

        {/* Brand Bar & Filter Controls */}
        <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
          {/* Brand quick pills with logo */}
          {availableBrands.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar mb-2">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-amber-500" />
                Márka:
              </span>
              <button
                onClick={() => setSelectedBrand(null)}
                className={`shrink-0 px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  selectedBrand === null
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                Mindent
              </button>
              {availableBrands.map(brand => {
                const brandSlug = brand.toLowerCase().replace(/['\s]/g, '-');
                const isBrandSelected = selectedBrand === brand;
                return (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      isBrandSelected
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-black'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <img
                      src={`/brands/${brandSlug}.png`}
                      alt=""
                      className={`h-3 w-auto max-w-[40px] object-contain ${
                        isBrandSelected ? 'brightness-0' : 'dark:invert opacity-80'
                      }`}
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span>{brand}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Result Count & Sorting */}
          <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/80 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <span>
                <strong className="text-slate-900 dark:text-white text-sm font-black">{filteredProducts.length}</strong>{' '}
                termék
              </span>
              {selectedCategorySlug && selectedCategorySlug !== 'all' && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                  Kategória: {selectedCategorySlug}
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                  Márka: {selectedBrand}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                aria-label="Rendezés"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
              >
                <option value="featured">Kiemelt / Ajánlott</option>
                <option value="price-asc">Ár szerint: növekvő</option>
                <option value="price-desc">Ár szerint: csökkenő</option>
                <option value="name">Név szerint (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Curated Carousels on Home view when no filter is applied */}
        {!isFilteringActive && (
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-8">
            {/* 1. Rafa Nadal Termékek Section (direct match to teniszruha.hu) */}
            {nadalProducts.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-6 rounded bg-amber-400"></div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Rafa Nadal Termékek
                    </h2>
                  </div>
                  <button
                    onClick={() => handleSelectCategorySlug('nadal')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                  >
                    Összes Nadal termék →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {nadalProducts.map(p => (
                    <ProductCard
                      key={`nadal-${p.id}`}
                      product={p}
                      onOpenDetails={prod => setActiveProductModal(prod)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 2. Teniszütők Section */}
            {racketProducts.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-6 rounded bg-amber-400"></div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Teniszütők & Versenyütők
                    </h2>
                  </div>
                  <button
                    onClick={() => handleSelectCategorySlug('teniszutok')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                  >
                    Összes ütő →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {racketProducts.map(p => (
                    <ProductCard
                      key={`racket-${p.id}`}
                      product={p}
                      onOpenDetails={prod => setActiveProductModal(prod)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. Válassz Kiegészítőt Section (direct match to teniszruha.hu) */}
            {accessoryProducts.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-6 rounded bg-amber-400"></div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Válassz Kiegészítőt
                    </h2>
                  </div>
                  <button
                    onClick={() => handleSelectCategorySlug('kiegeszitok')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
                  >
                    Összes kiegészítő →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {accessoryProducts.map(p => (
                    <ProductCard
                      key={`acc-${p.id}`}
                      product={p}
                      onOpenDetails={prod => setActiveProductModal(prod)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Products header when on home view */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
              <div className="w-2.5 h-6 rounded bg-slate-400 dark:bg-slate-600"></div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Teljes Termékkínálat
              </h2>
            </div>
          </div>
        )}

        {/* Product Catalog Grid */}
        <div className="max-w-7xl mx-auto px-4 py-3">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-sm font-semibold">Termékek betöltése a Teniszruha.hu szerveréről...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/80 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <SearchX className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Nincs találat a megadott szűrésre</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
                Próbálj más keresési kulcsszót vagy töröld a kiválasztott márka- és kategóriaszűrőket!
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId(null);
                  setSelectedCategorySlug(null);
                  setSelectedBrand(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-300 transition-all active:scale-95 shadow-md"
              >
                Szűrők visszaállítása
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetails={prod => setActiveProductModal(prod)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer widgets & Links directly matching teniszruha.hu */}
      <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 pt-10 pb-24 md:pb-8 mt-12 w-full border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          {/* Footer Top: Legújabb & Népszerű termékek (Matching original site footer widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-slate-200 dark:border-slate-800">
            {/* Widget 1: Legújabb Termékek */}
            <div>
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Legújabb Termékek
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {latestProducts.map(p => (
                  <div
                    key={`latest-${p.id}`}
                    onClick={() => setActiveProductModal(p)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-amber-400/50 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 p-1 shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden">
                      {p.images?.[0]?.src ? (
                        <img src={p.images[0].src} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                        {formatPrice(p.prices?.price || '0')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Népszerű Termékek */}
            <div>
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Népszerű Termékek
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {popularProducts.map(p => (
                  <div
                    key={`pop-${p.id}`}
                    onClick={() => setActiveProductModal(p)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 hover:border-amber-400/50 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-900 p-1 shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden">
                      {p.images?.[0]?.src ? (
                        <img src={p.images[0].src} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                        {formatPrice(p.prices?.price || '0')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Middle Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
                Kategóriák
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <button onClick={() => handleSelectCategorySlug('ruhazat')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Ruházat
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategorySlug('nadal')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Rafa Nadal
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategorySlug('teniszutok')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Teniszütők
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategorySlug('kiegeszitok')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Kiegészítők
                  </button>
                </li>
                <li>
                  <button onClick={() => handleSelectCategorySlug('akciok')} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Akciók
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
                Márkák
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>Babolat Tenisz</li>
                <li>Nike Rafa Kollekció</li>
                <li>Head Ütők & Táskák</li>
                <li>Puma & Sergio Tacchini</li>
                <li>Mizuno, Under Armour & Ellesse</li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
                Segítség & Infók
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <button onClick={() => setIsHelpOpen(true)} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Ügyfélszolgálat & Kapcsolat
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsAccountOpen(true)} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Fiókom & Belépés
                  </button>
                </li>
                <li>
                  <a href="https://www.teniszruha.hu/szallitas-es-visszakuldes/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Szállítási Információk
                  </a>
                </li>
                <li>
                  <a href="https://www.teniszruha.hu/altalanos-szerzodesi-feltetelek/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Általános Szerződési Feltételek
                  </a>
                </li>
                <li>
                  <a href="https://www.teniszruha.hu/adatkezeles/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Adatkezelési Tájékoztató
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs mb-3">
                Teniszruha.hu
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                Hivatalos teniszfelszerelések, versenyütők és Rafa Nadal ruházati kollekció közvetlenül raktárról.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>1-2 munkanapos kiszállítás</span>
              </div>
              <div className="flex items-center gap-3">
                <a href="https://www.facebook.com/teniszruha" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a href="https://www.instagram.com/teniszruha" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="mailto:info@teniszruha.hu" className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all">
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
            <p>
              Minden jog fenntartva 2026 © <strong className="text-slate-700 dark:text-slate-300">TENISZRUHA.HU</strong>
            </p>
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
              <a href="https://www.teniszruha.hu" target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Hivatalos Weboldal
              </a>
              <span>•</span>
              <button onClick={() => setIsHelpOpen(true)} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Segítség
              </button>
              <span>•</span>
              <button onClick={() => setIsAccountOpen(true)} className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Belépés
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-20 right-4 z-30 p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 dark:text-amber-400 hover:text-slate-950 dark:hover:text-white hover:bg-amber-400 shadow-xl transition-all duration-300 active:scale-90"
          aria-label="Ugrás a tetejére"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
      />

      <CartDrawer />

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        products={products}
        onOpenDetails={prod => setActiveProductModal(prod)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        themeMode={themeMode}
        onSetThemeMode={setThemeMode}
      />

      <CategoriesModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedCategorySlug={selectedCategorySlug}
        onSelectCategory={handleSelectCategory}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* iOS Safari Add to Home Screen Banner */}
      <IosInstallBanner />

      {/* Bottom App Navigation Bar for Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCategories={() => setIsCategoriesOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}
