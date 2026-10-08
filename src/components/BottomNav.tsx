import React from 'react';
import { Home, Grid3X3, Heart, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface BottomNavProps {
  activeTab: 'home' | 'categories' | 'wishlist' | 'cart' | 'account';
  setActiveTab: (tab: 'home' | 'categories' | 'wishlist' | 'cart' | 'account') => void;
  onOpenCategories: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCategories,
  onOpenWishlist,
  onOpenAccount,
}) => {
  const { totalItems, wishlist, setIsCartOpen } = useCart();

  const navItems = [
    {
      id: 'home' as const,
      label: 'Főoldal',
      icon: Home,
      action: () => {
        setActiveTab('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'categories' as const,
      label: 'Kategóriák',
      icon: Grid3X3,
      action: () => {
        setActiveTab('categories');
        onOpenCategories();
      },
    },
    {
      id: 'wishlist' as const,
      label: 'Kedvencek',
      icon: Heart,
      badge: wishlist.length > 0 ? wishlist.length : null,
      badgeColor: 'bg-amber-400 text-slate-950 shadow-amber-400/30',
      action: () => {
        setActiveTab('wishlist');
        onOpenWishlist();
      },
    },
    {
      id: 'cart' as const,
      label: 'Kosár',
      icon: ShoppingBag,
      badge: totalItems > 0 ? totalItems : null,
      badgeColor: 'bg-amber-400 text-slate-950 shadow-amber-400/40',
      action: () => {
        setActiveTab('cart');
        setIsCartOpen(true);
      },
    },
    {
      id: 'account' as const,
      label: 'Fiók',
      icon: User,
      action: () => {
        setActiveTab('account');
        onOpenAccount();
      },
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/85 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.6)] md:hidden transition-all"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      role="navigation"
      aria-label="Mobil alsó navigáció"
    >
      <div className="max-w-md mx-auto px-2 pt-1.5 grid grid-cols-5 items-center">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={item.action}
              className="group relative flex flex-col items-center justify-center gap-1 min-h-[48px] py-1.5 rounded-2xl transition-all duration-200 active:scale-90 select-none"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon Container with glowing active pill */}
              <div
                className={`relative px-3.5 py-1 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-400/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-105 stroke-[2.4]' : 'stroke-[1.8] group-hover:scale-110'
                  }`}
                />

                {/* Badge if present */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-black flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-950 animate-fade-in ${item.badgeColor || ''}`}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] tracking-tight transition-colors duration-200 ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400 font-black'
                    : 'text-slate-500 dark:text-slate-400 font-semibold group-hover:text-slate-900 dark:group-hover:text-slate-200'
                }`}
              >
                {item.label}
              </span>

              {/* Subtle bottom active dot */}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400 shadow-[0_0_6px_#fbbf24] -mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
