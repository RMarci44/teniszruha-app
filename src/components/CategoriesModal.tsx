import React from 'react';
import {
  X,
  ChevronRight,
  Layers,
  Crown,
  Zap,
  Shirt,
  User,
  Sparkles,
  ShoppingBag,
  Flame,
  HelpCircle,
  Grid3X3,
  Check,
} from 'lucide-react';
import { ProductCategory } from '../types';
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss';

interface CategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategory[];
  selectedCategoryId: number | null;
  selectedCategorySlug: string | null;
  onSelectCategory: (id: number | null, slug?: string) => void;
  onOpenAccount: () => void;
  onOpenHelp: () => void;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  onClose,
  selectedCategoryId,
  selectedCategorySlug,
  onSelectCategory,
  onOpenAccount,
  onOpenHelp,
}) => {
  const { sheetProps, handleProps, backdropStyle } = useBottomSheetDismiss({ isOpen, onClose });

  if (!isOpen) return null;

  const categoryTree = [
    {
      name: 'Összes termék',
      slug: 'all',
      id: null,
      icon: Layers,
      badge: 'Minden',
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
      subcategories: [],
    },
    {
      name: 'Rafa Nadal Kollekció',
      slug: 'nadal',
      id: 1057,
      icon: Crown,
      badge: 'Hivatalos kollekció',
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
      subcategories: [
        { name: 'Nadal Pólók & Mezek', slug: 'nadal' },
        { name: 'Nadal Nadrágok', slug: 'nadal' },
        { name: 'Babolat Pure Aero Rafa', slug: 'nadal' },
      ],
    },
    {
      name: 'Teniszütők & Versenyütők',
      slug: 'teniszutok',
      id: 1463,
      icon: Zap,
      badge: 'Ütők & Húrozás',
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
      subcategories: [
        { name: 'Babolat Pure Aero', slug: 'teniszutok' },
        { name: 'Head Radical & Speed', slug: 'teniszutok' },
        { name: 'Prince Chrome 100', slug: 'teniszutok' },
      ],
    },
    {
      name: 'Ruházat (Összes)',
      slug: 'ruhazat',
      id: 71,
      icon: Shirt,
      badge: '199+ termék',
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
      subcategories: [
        { name: 'Férfi Ruházat', slug: 'ferfi' },
        { name: 'Női Ruházat', slug: 'noi' },
        { name: 'Rafa Nadal Ruházat', slug: 'nadal' },
        { name: 'Pólók & Galléros', slug: 'ruhazat' },
        { name: 'Nadrágok', slug: 'ruhazat' },
      ],
    },
    {
      name: 'Férfi Ruházat',
      slug: 'ferfi',
      id: 1055,
      icon: User,
      badge: 'Férfi kollekció',
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
      subcategories: [
        { name: 'Férfi Pólók', slug: 'ferfi' },
        { name: 'Férfi Nadrágok', slug: 'ferfi' },
        { name: 'Férfi Melegítők', slug: 'ferfi' },
      ],
    },
    {
      name: 'Női Ruházat',
      slug: 'noi',
      id: 1059,
      icon: Sparkles,
      badge: 'Női kollekció',
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
      subcategories: [
        { name: 'Női Szoknyák', slug: 'noi' },
        { name: 'Női Topok & Pólók', slug: 'noi' },
        { name: 'Női Visorok & Sapkák', slug: 'noi' },
      ],
    },
    {
      name: 'Kiegészítők',
      slug: 'kiegeszitok',
      id: 1077,
      icon: ShoppingBag,
      badge: 'Kellékek & Táskák',
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
      subcategories: [
        { name: 'Grip & Overgrip', slug: 'kiegeszitok' },
        { name: 'Zoknik', slug: 'kiegeszitok' },
        { name: 'Fejvédő Szalag', slug: 'kiegeszitok' },
        { name: 'Sapkák & Visorok', slug: 'kiegeszitok' },
        { name: 'Csuklószorítók', slug: 'kiegeszitok' },
      ],
    },
    {
      name: 'Akciók & Kedvezmények',
      slug: 'akciok',
      id: 9999,
      icon: Flame,
      badge: 'Kiemelt Akció',
      colorClass: 'text-amber-500 dark:text-amber-400 bg-amber-400/10 border-amber-400/20',
      subcategories: [],
    },
  ];

  const handlePick = (id: number | null, slug: string) => {
    onSelectCategory(id, slug);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      style={backdropStyle}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-[28px] sm:rounded-3xl flex flex-col max-h-[90vh] sm:max-h-[85vh] shadow-2xl safe-bottom animate-slide-up overflow-hidden text-slate-900 dark:text-slate-100 touch-pan-y"
        onClick={e => e.stopPropagation()}
        {...sheetProps}
      >
        {/* Mobile Pull / Grab Handle Bar with touch priority */}
        <div
          className="w-full py-2.5 flex items-center justify-center sm:hidden shrink-0 cursor-grab active:cursor-grabbing touch-none select-none"
          {...handleProps}
        >
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700/80 rounded-full" />
        </div>

        {/* Header */}
        <div
          className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 sticky top-0 z-10 shrink-0 select-none"
          {...handleProps}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
              <Grid3X3 className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Termékkategóriák</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Teniszruha.hu hivatalos kínálat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {categoryTree.map(cat => {
            const isSelected =
              cat.slug === 'all'
                ? selectedCategoryId === null && (!selectedCategorySlug || selectedCategorySlug === 'all')
                : selectedCategorySlug === cat.slug || selectedCategoryId === cat.id;

            const Icon = cat.icon;

            return (
              <div
                key={cat.slug}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400/60 shadow-lg shadow-amber-400/10'
                    : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-950'
                }`}
              >
                {/* Main Category Header Row */}
                <button
                  onClick={() => handlePick(cat.id, cat.slug)}
                  className="w-full flex items-center justify-between p-3.5 text-left transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${cat.colorClass}`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`text-xs sm:text-sm font-bold block truncate ${
                          isSelected ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {cat.name}
                      </span>
                      {cat.badge && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected ? (
                      <span className="p-1 rounded-full bg-amber-400 text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Subcategory Chips if present */}
                {cat.subcategories.length > 0 && (
                  <div className="px-3.5 pb-3 pt-0 flex flex-wrap gap-1.5 border-t border-slate-200 dark:border-slate-800/60 mt-1">
                    {cat.subcategories.map((sub, i) => (
                      <button
                        key={i}
                        onClick={e => {
                          e.stopPropagation();
                          handlePick(cat.id, sub.slug);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400/40 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all active:scale-95"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky Sheet Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 shrink-0 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenAccount();
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-amber-400/40 active:scale-95 transition-all shadow-sm"
          >
            <User className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Fiók & Belépés</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenHelp();
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-amber-400/40 active:scale-95 transition-all shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Ügyfélszolgálat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
