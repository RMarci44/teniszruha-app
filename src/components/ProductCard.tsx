import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Check, Eye, Package } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../services/api';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');

  useEffect(() => {
    setImageError(false);
    setSelectedSize('');
  }, [product.id]);

  const isFavorite = isWishlisted(product.id);
  const mainImage = product.images?.[0]?.src || '';
  const price = product.prices?.price || '0';
  const regularPrice = product.prices?.regular_price || price;
  const isOnSale = product.on_sale || (parseInt(regularPrice, 10) > parseInt(price, 10));

  // Find brand from attributes
  const brandAttr = product.attributes?.find(
    a => a.name.toLowerCase() === 'márka' || a.taxonomy === 'pa_marka'
  );
  const brandName = brandAttr?.terms?.[0]?.name;
  const brandSlug = brandName ? brandName.toLowerCase().replace(/['\s]/g, '-') : '';

  // Find sizes from attributes if any
  const sizeAttr = product.attributes?.find(
    a => a.name.toLowerCase() === 'méret' || a.taxonomy === 'pa_meret'
  );
  const availableSizes = sizeAttr?.terms?.slice(0, 4) || [];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sizeToUse = selectedSize || availableSizes[0]?.name;
    addToCart(product, 1, sizeToUse);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleSelectSize = (e: React.MouseEvent, szName: string) => {
    e.stopPropagation();
    setSelectedSize(prev => prev === szName ? '' : szName);
  };

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 hover:border-amber-400/80 dark:hover:border-amber-400/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between cursor-pointer hover:shadow-xl hover:-translate-y-1"
    >
      {/* Top badges & Wishlist */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {/* Akció! Badge matching teniszruha.hu */}
          {isOnSale && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md">
              Akció!
            </span>
          )}

          {/* Out of stock label */}
          {!product.is_in_stock && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
              Elfogyott
            </span>
          )}
        </div>

        {/* Brand logo badge and Wishlist toggle */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {brandName && (
            <div className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/90 shadow-sm backdrop-blur-md flex items-center justify-center h-6">
              <img
                src={`/brands/${brandSlug}.png`}
                alt={brandName}
                className="h-3 w-auto max-w-[45px] object-contain dark:invert opacity-90"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                  const textElem = (e.target as HTMLElement).nextElementSibling;
                  if (textElem) (textElem as HTMLElement).style.display = 'inline';
                }}
              />
              <span style={{ display: 'none' }} className="text-[9px] font-extrabold text-amber-500 uppercase">
                {brandName}
              </span>
            </div>
          )}

          {/* Wishlist toggle */}
          <button
            onClick={handleToggleWishlist}
            className={`min-w-[44px] min-h-[44px] p-2 flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 backdrop-blur-md ${
              isFavorite
                ? 'bg-amber-400/20 text-amber-500 dark:text-amber-400 border border-amber-400/40'
                : 'bg-white/90 dark:bg-slate-950/70 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
            aria-label="Kedvencekhez adás"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Image Container with hover zoom */}
      <div className="relative w-full pt-[95%] bg-slate-50 dark:bg-slate-950/60 overflow-hidden border-b border-slate-100 dark:border-slate-800/40">
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt={product.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-contain p-3.5 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900/60 p-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800/80 flex items-center justify-center mb-1.5 text-slate-500 dark:text-slate-400">
              <Package className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-semibold">Teniszruha.hu termék</span>
          </div>
        )}

        {/* Hover Quick View Trigger */}
        <div className="absolute inset-x-0 bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-bold border border-slate-700/80 backdrop-blur-md flex items-center gap-1 shadow-lg">
            <Eye className="w-3 h-3 text-amber-400" /> Gyors nézet
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Category Tag */}
          {product.categories?.[0] && (
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 line-clamp-1 mb-0.5">
              {product.categories[0].name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>

          {/* Interactive Size preview chips */}
          {availableSizes.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {availableSizes.map(sz => {
                const isSelected = selectedSize === sz.name;
                return (
                  <button
                    key={sz.id}
                    onClick={e => handleSelectSize(e, sz.name)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm ring-1 ring-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 hover:border-amber-400'
                    }`}
                    title={`Méret: ${sz.name}`}
                  >
                    {sz.name}
                  </button>
                );
              })}
              {sizeAttr && sizeAttr.terms.length > 4 && (
                <span className="text-[9px] text-slate-400 font-semibold">
                  +{sizeAttr.terms.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Cart Actions */}
        <div className="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-slate-800/70">
          <div>
            {isOnSale && (
              <del className="text-[11px] text-slate-400 block -mb-0.5">
                {formatPrice(regularPrice)}
              </del>
            )}
            <div className={`text-sm sm:text-base font-black ${isOnSale ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {formatPrice(price)}
            </div>
            <div className="text-[10px] mt-0.5 flex items-center gap-1 font-semibold">
              {product.is_in_stock ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-slate-600 dark:text-slate-300">Raktáron</span>
                </>
              ) : (
                <span className="text-slate-400">Rendelésre</span>
              )}
            </div>
          </div>

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className={`min-w-[44px] min-h-[44px] p-2.5 rounded-xl font-black transition-all duration-200 active:scale-90 flex items-center justify-center ${
              isAdded
                ? 'bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
            }`}
            title={selectedSize ? `Kosárba (${selectedSize} méret)` : 'Kosárba teszem'}
            aria-label="Kosárba"
          >
            {isAdded ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
