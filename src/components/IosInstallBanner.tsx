import React, { useState, useEffect } from 'react';
import { Share, X, PlusSquare } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export const IosInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const isIos = 
        (/iPhone|iPad|iPod/i.test(navigator.userAgent) || 
        ((navigator.platform === 'MacIntel' || navigator.userAgent.includes('Macintosh')) && navigator.maxTouchPoints > 1)) && 
        !(window as any).MSStream;
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        Boolean((navigator as any).standalone) || 
        Capacitor.isNativePlatform();
      const isDismissed = sessionStorage.getItem('teniszruha_ios_banner_dismissed') === 'true';

      if (isIos && !isStandalone && !isDismissed) {
        // Show banner after brief delay
        const timer = setTimeout(() => setShowBanner(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore in unsupported environments
    }
  }, []);

  if (!showBanner) return null;

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      sessionStorage.setItem('teniszruha_ios_banner_dismissed', 'true');
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div 
      className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-slide-up"
      style={{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-400/30 rounded-2xl p-3.5 shadow-2xl flex items-start gap-3 text-slate-900 dark:text-slate-100">
        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <PlusSquare className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            <span>Telepítés iPhone-ra</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-600 dark:text-amber-400">iOS WebClip</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
            Érintsd meg a Safari alsó menüjében a <Share className="inline w-3 h-3 text-amber-500 mx-0.5" /> <strong>Megosztás</strong> gombot, majd válaszd a <strong>„Hozzáadás a főképernyőhöz”</strong> pontot a teljes app élményhez!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Értesítés bezárása"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
