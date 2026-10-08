import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Truck, Trophy, ChevronRight, ChevronLeft } from 'lucide-react';

interface HeroBannerProps {
  onSelectCategorySlug?: (slug: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategorySlug }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const heroBanners = [
    {
      id: 'nadal',
      title: 'Rafa Nadal',
      subtitle: 'Hivatalos Nike & Babolat kollekció',
      tag: 'Kiemelt Kollekció',
      image: '/banner-nadal.jpg',
      slug: 'nadal',
      accentColor: 'from-amber-500/80 to-slate-900',
    },
    {
      id: 'ferfi',
      title: 'Férfi',
      subtitle: 'Pólók, nadrágok & melegítők',
      tag: 'Prémium Ruházat',
      image: '/banner-ferfi.jpg',
      slug: 'ferfi',
      accentColor: 'from-amber-500/80 to-slate-900',
    },
    {
      id: 'noi',
      title: 'Női',
      subtitle: 'Szoknyák, topok & kiegészítők',
      tag: 'Új Kollekció',
      image: '/banner-noi.jpg',
      slug: 'noi',
      accentColor: 'from-amber-500/80 to-slate-900',
    },
  ];

  const handleBannerClick = (slug: string) => {
    if (onSelectCategorySlug) {
      onSelectCategorySlug(slug);
    }
  };

  return (
    <section className="px-4 pt-3 pb-2 max-w-7xl mx-auto space-y-3">
      {/* Visual Banners - Desktop 3-Card Grid matching teniszruha.hu, Mobile Touch Carousel */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {heroBanners.map(banner => (
          <div
            key={banner.id}
            onClick={() => handleBannerClick(banner.slug)}
            className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-2xl hover:-translate-y-1"
          >
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Inner Content Box */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end items-center text-center">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-400 border border-amber-400/30 backdrop-blur-md mb-2">
                {banner.tag}
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-md mb-1">
                {banner.title}
              </h2>
              <p className="text-xs text-slate-300 mb-4 line-clamp-1">{banner.subtitle}</p>

              {/* Authentic 'Kattints' outline button with backdrop blur */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleBannerClick(banner.slug);
                }}
                className="px-6 py-2 rounded-lg border-2 border-white/90 bg-black/40 hover:bg-white hover:text-slate-950 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 backdrop-blur-md active:scale-95 shadow-lg group-hover:border-amber-400"
              >
                Kattints
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Interactive Swipeable Banner */}
      <div className="md:hidden relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl h-72">
        {heroBanners.map((banner, index) => {
          const isActive = index === activeSlide;
          return (
            <div
              key={banner.id}
              onClick={() => handleBannerClick(banner.slug)}
              className={`absolute inset-0 transition-opacity duration-500 cursor-pointer ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              <div className="absolute inset-0 p-5 flex flex-col justify-end items-center text-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-400 border border-amber-400/30 backdrop-blur-md mb-1.5">
                  {banner.tag}
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                  {banner.title}
                </h2>
                <p className="text-xs text-slate-300 mb-3">{banner.subtitle}</p>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleBannerClick(banner.slug);
                  }}
                  className="px-6 py-2 rounded-lg border-2 border-white bg-black/50 text-white font-black text-xs uppercase tracking-wider shadow-lg active:scale-95"
                >
                  Kattints
                </button>
              </div>
            </div>
          );
        })}

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center items-center gap-1.5">
          {heroBanners.map((_, i) => (
            <button
              key={i}
              onClick={e => {
                e.stopPropagation();
                setActiveSlide(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === activeSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrows for mobile browsing */}
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveSlide(prev => (prev === 0 ? heroBanners.length - 1 : prev - 1));
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white backdrop-blur-md"
          aria-label="Előző"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={e => {
            e.stopPropagation();
            setActiveSlide(prev => (prev === heroBanners.length - 1 ? 0 : prev + 1));
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/40 text-white/80 hover:text-white backdrop-blur-md"
          aria-label="Következő"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Value props & trust bar from teniszruha.hu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 text-xs shadow-sm">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Truck className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-[11px]">Ingyenes szállítás 30 000 Ft-tól</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-[11px]">100% Eredeti teniszmárkák</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-[11px]">Professzionális ütők & felszerelések</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <span className="font-semibold text-[11px]">Gyors, 1-2 napos raktári kiszolgálás</span>
        </div>
      </div>
    </section>
  );
};
