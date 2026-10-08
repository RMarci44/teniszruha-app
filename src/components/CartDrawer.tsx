import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Truck, ShieldCheck, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/api';
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    totalItems,
  } = useCart();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const { sheetProps, handleProps, backdropStyle } = useBottomSheetDismiss({
    isOpen: isCartOpen,
    onClose: () => setIsCartOpen(false),
  });

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 30000;
  const validSubtotal = subtotal || 0;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - validSubtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((validSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const shippingCost = validSubtotal >= FREE_SHIPPING_THRESHOLD || validSubtotal === 0 ? 0 : 1490;
  const totalAmount = validSubtotal + shippingCost;

  const handleCheckout = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      window.open('https://www.teniszruha.hu/penztar/', '_blank');
      setCheckoutSuccess(false);
      setIsCartOpen(false);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-end bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      style={backdropStyle}
      onClick={() => setIsCartOpen(false)}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 rounded-t-[28px] sm:rounded-none flex flex-col max-h-[92vh] sm:max-h-full sm:h-full shadow-2xl safe-bottom animate-slide-up sm:animate-slide-left overflow-hidden text-slate-900 dark:text-slate-100 touch-pan-y"
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
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Kosár tartalma</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{totalItems} termék a kosárban</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress bar */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Truck className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>
                {remainingForFreeShipping === 0 ? (
                  <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Díjmentes szállítás elérve!
                  </span>
                ) : (
                  <span>
                    Még <strong className="text-amber-600 dark:text-amber-400">{formatPrice(remainingForFreeShipping)}</strong> az ingyenes szállításhoz
                  </span>
                )}
              </span>
            </div>
            <span className="font-extrabold text-amber-600 dark:text-amber-400">{freeShippingProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-base">A kosarad jelenleg üres</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs leading-relaxed">
                Fedezd fel a legújabb ütőket, teniszruhákat és kiegészítőket a kínálatban!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-all shadow-md active:scale-95"
              >
                Vásárlás folytatása
              </button>
            </div>
          ) : (
            cart.map(item => {
              const price = parseInt(item.product.prices?.price || '0', 10);
              const imgUrl = item.product.images?.[0]?.src || '';

              return (
                <div
                  key={`${item.product.id}-${item.selectedSize || 'def'}`}
                  className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl items-center"
                >
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 shrink-0 overflow-hidden p-1 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-contain" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.product.name}</h4>
                    {item.selectedSize && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block">
                        Méret: {item.selectedSize}
                      </span>
                    )}
                    <p className="text-xs font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                      {formatPrice(price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1, item.selectedSize)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold active:scale-95"
                          aria-label="Csökkentés"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1, item.selectedSize)}
                          className="w-6 h-6 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold active:scale-95"
                          aria-label="Növelés"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold ml-auto">
                        {formatPrice(price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 active:scale-95 transition-colors"
                    title="Törlés a kosárból"
                    aria-label="Törlés"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Sheet Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-4 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 space-y-3 shrink-0 safe-bottom">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Részösszeg</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Szállítási díj</span>
                <span className={`font-semibold ${shippingCost === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-200'}`}>
                  {shippingCost === 0 ? 'INGYENES' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Fizetendő összeg</span>
                <span className="text-amber-600 dark:text-amber-400">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              disabled={checkoutSuccess}
              className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 active:scale-95"
            >
              {checkoutSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-slate-950 animate-bounce" />
                  <span>Átirányítás a Teniszruha.hu pénztárához...</span>
                </>
              ) : (
                <>
                  <span>Megrendelés a Pénztárban</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>Biztonságos SSL titkosított vásárlás</span>
              </div>
              <button
                onClick={clearCart}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
              >
                Kosár ürítése
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
