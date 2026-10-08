import React, { useState } from 'react';
import { X, User, Lock, Mail, ExternalLink, PackageSearch, CheckCircle2, ShieldCheck, Sun, Moon, Smartphone } from 'lucide-react';
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: 'system' | 'light' | 'dark';
  onSetThemeMode?: (mode: 'system' | 'light' | 'dark') => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  themeMode = 'system',
  onSetThemeMode,
}) => {
  const { sheetProps, handleProps, backdropStyle } = useBottomSheetDismiss({ isOpen, onClose });
  const [tab, setTab] = useState<'login' | 'register' | 'tracking'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'login') {
      setStatusMessage('Sikeres belépés a Teniszruha fiókba!');
    } else if (tab === 'register') {
      setStatusMessage('Regisztrációs kérelem rögzítve! Ellenőrizd az e-mail fiókodat.');
    } else {
      setStatusMessage(`A #${orderNumber || '10482'} rendelés feldolgozás alatt áll, várható szállítás: 1-2 munkanap.`);
    }

    setTimeout(() => {
      setStatusMessage(null);
      if (tab !== 'tracking') onClose();
    }, 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in"
      style={backdropStyle}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-[28px] sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl safe-bottom animate-slide-up text-slate-900 dark:text-slate-100 touch-pan-y"
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
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Teniszruha.hu Fiók</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Belépés és rendeléskövetés</p>
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

        {/* Tab switch */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-1 gap-1 m-3 rounded-xl shrink-0">
          <button
            onClick={() => { setTab('login'); setStatusMessage(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${
              tab === 'login'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Belépés
          </button>
          <button
            onClick={() => { setTab('register'); setStatusMessage(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${
              tab === 'register'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Regisztráció
          </button>
          <button
            onClick={() => { setTab('tracking'); setStatusMessage(null); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${
              tab === 'tracking'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Nyomkövetés
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-3.5 no-scrollbar">
          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {tab === 'tracking' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Rendelésszám
                </label>
                <div className="relative">
                  <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    placeholder="pl. #14052"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Számlázási e-mail cím
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="pelda@email.hu"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Felhasználónév vagy e-mail cím
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="pelda@email.hu"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Jelszó
                  </label>
                  {tab === 'login' && (
                    <a
                      href="https://www.teniszruha.hu/fiokom/lost-password/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold"
                    >
                      Elfelejtetted?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[44px] py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            {tab === 'login' ? 'Belépés' : tab === 'register' ? 'Fiók Létrehozása' : 'Csomag Keresése'}
          </button>

          {onSetThemeMode && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">Megjelenés & Téma</span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  {themeMode === 'system' ? 'Telefonhoz igazodva (Auto)' : themeMode === 'dark' ? 'Sötét' : 'Világos'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSetThemeMode('system')}
                  className={`min-h-[44px] py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    themeMode === 'system'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Rendszer</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetThemeMode('light')}
                  className={`min-h-[44px] py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    themeMode === 'light'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Világos</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetThemeMode('dark')}
                  className={`min-h-[44px] py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    themeMode === 'dark'
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Sötét</span>
                </button>
              </div>
            </div>
          )}

          <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800/80">
            <a
              href="https://www.teniszruha.hu/fiokom/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
            >
              <span>Megnyitás a weboldalon (teniszruha.hu/fiokom)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>

        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          <span>Biztonságos SSL titkosított kapcsolat</span>
        </div>
      </div>
    </div>
  );
};
