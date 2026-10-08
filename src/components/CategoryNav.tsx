import React from 'react';
import { Layers, Crown, Zap, Shirt, User, Sparkles, ShoppingBag, Flame } from 'lucide-react';
import { ProductCategory } from '../types';

interface CategoryNavProps {
  categories: ProductCategory[];
  selectedCategoryId: number | null;
  selectedCategorySlug?: string | null;
  onSelectCategory: (id: number | null, slug?: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategoryId,
  selectedCategorySlug,
  onSelectCategory,
}) => {
  // Signature top-level categories with sleek Lucide icons instead of emojis
  const mainCategories = [
    { id: null, name: 'Összes termék', slug: 'all', icon: Layers, isSpecial: false },
    { id: 1057, name: 'Rafa Nadal', slug: 'nadal', icon: Crown, isSpecial: false },
    { id: 1463, name: 'Teniszütők', slug: 'teniszutok', icon: Zap, isSpecial: false },
    { id: 71, name: 'Ruházat', slug: 'ruhazat', icon: Shirt, isSpecial: false },
    { id: 1055, name: 'Férfi', slug: 'ferfi', icon: User, isSpecial: false },
    { id: 1059, name: 'Női', slug: 'noi', icon: Sparkles, isSpecial: false },
    { id: 1077, name: 'Kiegészítők', slug: 'kiegeszitok', icon: ShoppingBag, isSpecial: false },
    { id: 9999, name: 'Akciók', slug: 'akciok', icon: Flame, isSpecial: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 -mx-1 px-1">
        {mainCategories.map(cat => {
          const isSelected =
            cat.slug === 'all'
              ? selectedCategoryId === null && (!selectedCategorySlug || selectedCategorySlug === 'all')
              : selectedCategoryId === cat.id || selectedCategorySlug === cat.slug;

          const Icon = cat.icon;

          return (
            <button
              key={cat.slug}
              data-category-slug={cat.slug}
              onClick={() => onSelectCategory(cat.slug === 'all' ? null : cat.id, cat.slug)}
              className={`shrink-0 flex items-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 select-none ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 font-black ring-1 ring-amber-300'
                  : cat.isSpecial
                  ? 'bg-amber-400/10 text-amber-600 dark:text-amber-300 hover:bg-amber-400/20 border border-amber-400/30'
                  : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 shrink-0 ${
                  isSelected
                    ? 'text-slate-950 stroke-[2.5]'
                    : 'text-amber-500 dark:text-amber-400 stroke-[2]'
                }`}
              />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
