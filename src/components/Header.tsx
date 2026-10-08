import React, { useState, useMemo } from 'react';
import { ShoppingBag, Heart, Search, X, MessageCircleQuestion, Phone, User, Sun, Moon, Sparkles, ExternalLink, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';
import { Product } from '../types';
import logoImg from '../assets/logo.png';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenWishlist: () => void;
  onOpenHelp: () => void;
  onOpenAccount: () => void;
  onSelectCategorySlug?: (slug: string) => void;
  onOpenProduct?: (product: Product) => void;
  isLiveConnected: boolean;
  products?: Product[];
  isDarkMode?: boolean;
  themeMode?: 'system' | 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenWishlist,
  onOpenHelp,
  onOpenAccount,
  onSelectCategorySlug,
  onOpenProduct,
  isLiveConnected,
  products = [],
  isDarkMode = true,
  themeMode = 'system',
  onToggleTheme,
}) => {
  const { totalItems, subtotal, setIsCartOpen, wishlist } = useCart();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navItems = [
    { label: 'Ruházat', slug: 'ruhazat' },
    { label: 'Nadal', slug: 'nadal' },
    { label: 'Teniszütők', slug: 'teniszutok' },
    { label: 'Kiegészítők', slug: 'kiegeszitok' },
    { label: 'Akciók', slug: 'akciok' },
  ];

  // Instant live search suggestions
  const liveSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(p => {
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.categories?.some(c => c.name.toLowerCase().includes(q));
        const matchBrand = p.attributes?.some(a =>
          a.terms?.some(t => t.name.toLowerCase().includes(q))
        );
        const matchSku = p.sku?.toLowerCase().includes(q);
        return matchName || matchCat || matchBrand || matchSku;
      })
      .slice(0, 5);
  }, [searchQuery, products]);

  const handleSuggestionClick = (product: Product) => {
    if (onOpenProduct) {
      onOpenProduct(product);
    }
    setIsSearchFocused(false);
    setShowMobileSearch(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090d16]/95 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/90 backdrop-blur-md safe-top transition-colors">
      {/* Top Main Navigation Bar matching teniszruha.hu */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand / Official Teniszruha Logo */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group transition-transform active:scale-95"
            title="Teniszruha.hu - Hivatalos Tenisz Szaküzlet"
          >
            <div className="relative flex items-center h-8 sm:h-9">
              <img
                src={logoImg}
                alt="Teniszruha.hu"
                className="h-7 sm:h-8 w-auto object-contain drop-shadow"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = document.getElementById('logo-text-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                id="logo-text-fallback"
                style={{ display: 'none' }}
                className="items-center text-lg font-black tracking-tight text-slate-900 dark:text-white"
              >
                teniszruha<span className="text-amber-500 dark:text-amber-400">.hu</span>
              </div>
            </div>
          </a>

          {/* Live store badge */}
          {isLiveConnected && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              LIVE SHOP
            </span>
          )}
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.slug}
              onClick={() => onSelectCategorySlug && onSelectCategorySlug(item.slug)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all uppercase tracking-wider"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Search Input with Live Suggestions Dropdown */}
        <div className="hidden md:flex flex-1 max-w-sm mx-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Keresés ütők, ruhák, márkák..."
            className="w-full bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 rounded-full pl-10 pr-9 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setIsSearchFocused(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Desktop Live Search Popup */}
          {isSearchFocused && liveSuggestions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-slide-up"
              onMouseDown={e => e.preventDefault()}
            >
              <div className="px-2 py-1 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <span>Gyors Találatok</span>
                <span>{liveSuggestions.length} termék</span>
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {liveSuggestions.map(product => {
                  const price = product.prices?.price || '0';
                  return (
                    <div
                      key={`sugg-${product.id}`}
                      onClick={() => handleSuggestionClick(product)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-950 p-1 shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {product.images?.[0]?.src ? (
                          <img src={product.images[0].src} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400 dark:text-slate-500 stroke-[1.5]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[11px] font-black text-amber-600 dark:text-amber-400">
                          {formatPrice(price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions & Utilities */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-95 transition-all"
            aria-label="Kereső"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Toggle (System / Light / Dark mode) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-95 transition-all relative"
              title={
                themeMode === 'system'
                  ? `Téma: Rendszer (${isDarkMode ? 'Sötét' : 'Világos'}) - kattints a váltáshoz`
                  : isDarkMode
                  ? 'Téma: Sötét - kattints a váltáshoz'
                  : 'Téma: Világos - kattints a váltáshoz'
              }
              aria-label="Téma váltás"
            >
              {themeMode === 'system' ? (
                <div className="relative flex items-center justify-center">
                  {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span className="absolute -bottom-1.5 -right-2 text-[8px] font-black bg-amber-400 text-slate-950 rounded-full px-1 py-0.2 leading-none border border-slate-900/10">
                    A
                  </span>
                </div>
              ) : isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}

          {/* Account Button (Belépés matching teniszruha.hu) */}
          <button
            onClick={onOpenAccount}
            className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/80 hover:border-amber-400/60 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Belépés / Fiókom"
          >
            <User className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Belépés</span>
          </button>

          {/* Help Button (Segítség matching teniszruha.hu) */}
          <button
            onClick={onOpenHelp}
            className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/80 hover:border-amber-400/60 bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="Segítség & Kapcsolat"
          >
            <MessageCircleQuestion className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Segítség</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="relative min-w-[44px] min-h-[44px] p-2.5 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-95 transition-all"
            aria-label="Kedvencek"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-all shadow-md shadow-amber-400/20 active:scale-95 group"
            aria-label="Kosár"
          >
            <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[11px] font-black">{totalItems} db</span>
              {subtotal > 0 && (
                <span className="text-[9px] font-extrabold opacity-90 hidden sm:inline">
                  {formatPrice(subtotal)}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Expand Panel with Live Suggestions */}
      {showMobileSearch && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-200 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Keresés ütők, ruhák, márkák..."
              autoFocus
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile suggestions list */}
          {liveSuggestions.length > 0 && (
            <div className="mt-2 space-y-1 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-2 max-h-60 overflow-y-auto">
              <div className="px-1 text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 mb-1">
                Gyors Találatok ({liveSuggestions.length})
              </div>
              {liveSuggestions.map(p => (
                <div
                  key={`mob-sugg-${p.id}`}
                  onClick={() => handleSuggestionClick(p)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-950 p-1 shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {p.images?.[0]?.src ? (
                      <img src={p.images[0].src} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 stroke-[1.5]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{formatPrice(p.prices?.price || '0')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
