import React from 'react';
import { X, Phone, Mail, Clock, Truck, ShieldCheck, RotateCcw, ExternalLink, HelpCircle } from 'lucide-react';
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { sheetProps, handleProps, backdropStyle } = useBottomSheetDismiss({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      style={backdropStyle}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-[28px] sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl safe-bottom overflow-hidden animate-slide-up text-slate-900 dark:text-slate-100 touch-pan-y"
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
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Segítség & Ügyfélszolgálat</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Teniszruha.hu hivatalos szaküzlet</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm no-scrollbar">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:+36301234567"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 hover:bg-slate-100 dark:hover:bg-slate-950 transition-all flex flex-col gap-1.5 group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Telefonos segítség</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                +36 30 123 4567
              </span>
            </a>

            <a
              href="mailto:info@teniszruha.hu"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 hover:bg-slate-100 dark:hover:bg-slate-950 transition-all flex flex-col gap-1.5 group active:scale-95"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">E-mail kapcsolat</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                info@teniszruha.hu
              </span>
            </a>
          </div>

          {/* Business Hours */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0" />
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white block">Nyitvatartás & Hívásfogadás</span>
              Hétfő – Péntek: 09:00 – 17:00 (Hétvégén e-mailben)
            </div>
          </div>

          {/* Service Promises */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gyakori Tudnivalók
            </h3>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <Truck className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Szállítás & Átvétel</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  GLS és Foxpost futárszolgálattal 1-2 munkanap alatt házhoz vagy csomagpontra. <strong className="text-amber-600 dark:text-amber-400">30 000 Ft felett díjmentes!</strong>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">100% Eredeti Garancia</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Közvetlenül a hivatalos márkagyártóktól (Nike, Babolat, Head, Puma, Mizuno, Sergio Tacchini stb.) érkező termékek.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">14 Napos Méretcsere</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Nem lett megfelelő a méret? 14 napon belül egyszerűen és gyorsan kicseréljük.
                </p>
              </div>
            </div>
          </div>

          {/* Links to Official teniszruha.hu pages */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Hivatalos Oldalak
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="https://www.teniszruha.hu/altalanos-szerzodesi-feltetelek/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-between border border-slate-200 dark:border-slate-800/80 transition-colors"
              >
                <span>ÁSZF feltételek</span>
                <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </a>
              <a
                href="https://www.teniszruha.hu/adatkezeles/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-between border border-slate-200 dark:border-slate-800/80 transition-colors"
              >
                <span>Adatkezelés</span>
                <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </a>
              <a
                href="https://www.teniszruha.hu/szallitas-es-visszakuldes/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-between border border-slate-200 dark:border-slate-800/80 transition-colors"
              >
                <span>Szállítás</span>
                <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </a>
              <a
                href="https://www.teniszruha.hu/rolunk/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-between border border-slate-200 dark:border-slate-800/80 transition-colors"
              >
                <span>Rólunk</span>
                <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
