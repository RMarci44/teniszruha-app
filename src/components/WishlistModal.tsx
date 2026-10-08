import React from 'react';
import { X, Heart, Trash2, ShoppingBag, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';
import { formatPrice } from '../services/api';
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOpenDetails: (product: Product) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  products,
  onOpenDetails,
}) => {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { sheetProps, handleProps, backdropStyle } = useBottomSheetDismiss({ isOpen, onClose });

  if (!isOpen) return null;

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistedProducts.forEach(p => {
      addToCart(p, 1);
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      style={backdropStyle}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-[28px] sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl safe-bottom overflow-hidden animate-slide-up text-slate-900 dark:text-slate-100 touch-pan-y"
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
          className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 shrink-0 select-none"
          {...handleProps}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500 dark:text-amber-400 shrink-0">
              <Heart className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Elmentett Kedvencek</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{wishlistedProducts.length} kedvenc mentve</p>
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

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {wishlistedProducts.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-3 text-amber-500 dark:text-amber-400">
                <Heart className="w-8 h-8 stroke-[1.5]" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-base">Nincsenek még elmentett kedvencek</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                Kattints a szív ikonra bármelyik termékkártyán a tenisztermékek elmentéséhez!
              </p>
            </div>
          ) : (
            wishlistedProducts.map(product => {
              const price = product.prices?.price || '0';
              return (
                <div
                  key={product.id}
                  onClick={() => {
                    onClose();
                    onOpenDetails(product);
                  }}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-950 active:scale-[0.99] transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 shrink-0 p-1 flex items-center justify-center border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {product.images?.[0]?.src ? (
                      <img
                        src={product.images[0].src}
                        alt=""
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatPrice(price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-all shadow-md active:scale-95"
                      title="Kosárba teszem"
                      aria-label="Kosárba teszem"
                    >
                      <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 transition-colors"
                      title="Törlés a kedvencek közül"
                      aria-label="Törlés"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Sheet Footer */}
        {wishlistedProducts.length > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shrink-0 safe-bottom">
            <button
              onClick={handleAddAllToCart}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>Mindent a kosárba ({wishlistedProducts.length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
