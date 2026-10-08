import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, ExternalLink, Check, ShieldCheck, Truck, RotateCcw, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../services/api';
import { useCart } from '../context/CartContext';
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const { sheetProps, handleProps, backdropStyle } = useBottomSheetDismiss({
    isOpen: Boolean(product),
    onClose,
  });

  // Horizontal swipe gesture for image gallery
  const [galleryTouchStartX, setGalleryTouchStartX] = useState<number | null>(null);
  const [galleryTouchStartY, setGalleryTouchStartY] = useState<number | null>(null);
  const [galleryDragX, setGalleryDragX] = useState<number>(0);
  const [isGalleryDragging, setIsGalleryDragging] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedSize('');
      setIsAdded(false);
    }
  }, [product?.id]);

  if (!product) return null;

  const isFavorite = isWishlisted(product.id);
  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIndex]?.src || '';
  const price = product.prices?.price || '0';
  const regularPrice = product.prices?.regular_price || price;
  const isOnSale = product.on_sale || parseInt(regularPrice, 10) > parseInt(price, 10);
  const savings = Math.max(0, parseInt(regularPrice, 10) - parseInt(price, 10));

  // Find brand
  const brandAttr = product.attributes?.find(
    a => a.name.toLowerCase() === 'márka' || a.taxonomy === 'pa_marka'
  );
  const brandName = brandAttr?.terms?.[0]?.name;

  // Find sizes
  const sizeAttr = product.attributes?.find(
    a => a.name.toLowerCase() === 'méret' || a.taxonomy === 'pa_meret'
  );
  const availableSizes = sizeAttr?.terms || [];

  const handleGalleryTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setGalleryTouchStartX(e.touches[0].clientX);
    setGalleryTouchStartY(e.touches[0].clientY);
    setGalleryDragX(0);
    setIsGalleryDragging(true);
  };

  const handleGalleryTouchMove = (e: React.TouchEvent) => {
    if (galleryTouchStartX === null || galleryTouchStartY === null) return;
    const deltaX = e.touches[0].clientX - galleryTouchStartX;
    const deltaY = e.touches[0].clientY - galleryTouchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      e.stopPropagation();
      const resistance = images.length <= 1 ? 0.15 : 0.85;
      setGalleryDragX(deltaX * resistance);
    }
  };

  const handleGalleryTouchEnd = (e?: React.TouchEvent) => {
    if (e) e.stopPropagation();
    setIsGalleryDragging(false);
    if (images.length > 1) {
      if (galleryDragX < -40) {
        setSelectedImageIndex(prev => (prev + 1) % images.length);
      } else if (galleryDragX > 40) {
        setSelectedImageIndex(prev => (prev - 1 + images.length) % images.length);
      }
    }
    setGalleryTouchStartX(null);
    setGalleryTouchStartY(null);
    setGalleryDragX(0);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize || availableSizes[0]?.name);
    setIsAdded(true);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/85 backdrop-blur-sm animate-fade-in"
      style={backdropStyle}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-[28px] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl safe-bottom animate-slide-up overflow-hidden text-slate-900 dark:text-slate-100 touch-pan-y"
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

        {/* Header Bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shrink-0 select-none"
          {...handleProps}
        >
          <div className="flex items-center gap-2">
            {brandName && (
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-950 text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-800">
                {brandName}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Termék Részletei</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all active:scale-95 ${
                isFavorite
                  ? 'bg-amber-400/20 text-amber-500 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="Kedvencekhez"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
              aria-label="Bezárás"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 no-scrollbar">
          {/* Main Image Gallery with Swipe */}
          <div className="space-y-3">
            <div
              className="relative w-full aspect-square max-h-72 sm:max-h-80 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-6 border border-slate-200 dark:border-slate-800/80 select-none touch-pan-y"
              onTouchStart={handleGalleryTouchStart}
              onTouchMove={handleGalleryTouchMove}
              onTouchEnd={handleGalleryTouchEnd}
              onTouchCancel={handleGalleryTouchEnd}
            >
              <div
                className="w-full h-full flex items-center justify-center select-none"
                style={{
                  transform: galleryDragX !== 0 ? `translateX(${galleryDragX}px)` : undefined,
                  transition: isGalleryDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                ) : (
                  <Package className="w-16 h-16 text-slate-400 dark:text-slate-600 stroke-[1.5]" />
                )}
              </div>

              {isOnSale && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-black uppercase bg-amber-400 text-slate-950 shadow-md">
                  Akció!
                </span>
              )}

              {/* Gallery Navigation Controls & Indicators */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 min-w-[40px] min-h-[40px] rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-md active:scale-90 transition-all"
                    aria-label="Előző kép"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(prev => (prev + 1) % images.length);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 min-w-[40px] min-h-[40px] rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-md active:scale-90 transition-all"
                    aria-label="Következő kép"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-black tracking-wider">
                    {selectedImageIndex + 1} / {images.length}
                  </div>

                  <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          selectedImageIndex === idx
                            ? 'w-6 bg-amber-400 shadow-sm'
                            : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 shrink-0 rounded-xl bg-white dark:bg-slate-950 overflow-hidden border-2 transition-all p-1 active:scale-95 ${
                      selectedImageIndex === idx
                        ? 'border-amber-400 shadow-md shadow-amber-400/20'
                        : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.src} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title, Brand & Price */}
          <div>
            <div className="flex items-center justify-between gap-2">
              {product.categories?.[0] && (
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {product.categories[0].name}
                </span>
              )}
              {product.sku && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  Cikkszám: {product.sku}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 leading-snug">
              {product.name}
            </h2>

            {/* Price Box */}
            <div className="mt-3 flex items-baseline gap-3 flex-wrap">
              {isOnSale && (
                <del className="text-base font-semibold text-slate-400">
                  {formatPrice(regularPrice)}
                </del>
              )}
              <span className={`text-2xl sm:text-3xl font-black ${isOnSale ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {formatPrice(price)}
              </span>
              {isOnSale && savings > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-600 dark:text-amber-400 border border-amber-400/20 font-bold">
                  Megtakarítás: {formatPrice(savings)}
                </span>
              )}
              <span className="ml-auto text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                {product.is_in_stock ? 'Raktáron' : 'Rendelésre'}
              </span>
            </div>
          </div>

          {/* Size Selector */}
          {availableSizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex justify-between">
                <span>Válassz méretet:</span>
                {selectedSize && <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedSize}</span>}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(sz => {
                  const isCurSelected = selectedSize === sz.name;
                  return (
                    <button
                      key={sz.id}
                      onClick={() => setSelectedSize(sz.name)}
                      className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 flex items-center justify-center ${
                        isCurSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-400/20 font-black'
                          : 'bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {sz.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <Truck className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Ingyenes szállítás 30 000 Ft-tól</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>100% Eredeti teniszmárka</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <RotateCcw className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>14 napos cseregarancia</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Részletes Leírás
              </h3>
              <div
                className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-none text-left space-y-2"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}

          {/* External link to teniszruha.hu */}
          {product.permalink && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <a
                href={product.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-bold transition-colors"
              >
                <span>Termék adatlapja a teniszruha.hu webshopban</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Sticky Mobile & Desktop Action Footer */}
        <div className="p-3.5 sm:p-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center gap-3 safe-bottom">
          {/* Quantity Controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-sm active:scale-90 transition-all"
              aria-label="Kevesebb"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-sm active:scale-90 transition-all"
              aria-label="Több"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`flex-1 min-h-[48px] py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-lg ${
              isAdded
                ? 'bg-amber-300 text-slate-950 shadow-amber-400/20'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Kosárhoz adva!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>Kosárba teszem • {formatPrice(parseInt(price, 10) * quantity)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
