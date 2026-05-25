'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export type PaywallLimit = 'songs' | 'events' | 'export' | 'branding';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: PaywallLimit;
  current?: number;
  max?: number;
}

export default function PaywallModal({ isOpen, onClose, limitType, current, max }: PaywallModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const headline = (() => {
    switch (limitType) {
      case 'songs':
        return `${max ?? 30} Songs erreicht`;
      case 'events':
        return 'Dein Free-Event ist belegt';
      case 'export':
        return 'Export ist Pro-Feature';
      case 'branding':
        return 'Eigenes Branding ist Pro-Feature';
      default:
        return 'Upgrade nötig';
    }
  })();

  const description = (() => {
    switch (limitType) {
      case 'songs':
        return `Deine Gäste haben das Free-Limit von ${max ?? 30} Songwünschen erreicht${
          typeof current === 'number' ? ` (aktuell ${current})` : ''
        }. Mit Pro können deine Gäste unbegrenzt viele Songs vorschlagen. Mit dem Event-Pass schaltest du dieses eine Event frei.`;
      case 'events':
        return 'Du hast schon ein aktives Event. Im Free-Plan ist genau eines erlaubt. Mit Pro legst du beliebig viele Events parallel an. Mit dem Event-Pass kaufst du genau dieses zusätzliche Event frei.';
      case 'export':
        return 'Den Export der Wunschliste als CSV gibt es ab Pro oder mit dem Event-Pass für genau dieses Event.';
      case 'branding':
        return 'Eigenes Branding mit Name und Logo gibt es ab Pro oder mit dem Event-Pass.';
      default:
        return 'Für dieses Feature brauchst du Pro oder einen Event-Pass.';
    }
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2a2520]/40 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        className="bg-[#faf6f0] rounded-3xl border border-[#e8d9b8] shadow-2xl max-w-lg w-full p-8 sm:p-10 animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <p className="text-[#c9a961] text-xs font-semibold uppercase tracking-widest">Upgrade</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="text-[#8a7a6e] hover:text-[#2a2520] transition-colors -mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <h2 id="paywall-title" className="font-serif text-3xl font-semibold text-[#2a2520] mb-4">
          {headline}
        </h2>
        <p className="text-[#8a7a6e] leading-relaxed mb-8">{description}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/pricing?cycle=yearly"
            className="flex-1 py-3 rounded-2xl bg-[#c9a961] text-white text-sm font-semibold text-center hover:bg-[#b8953a] transition-colors"
          >
            Pro starten
          </Link>
          <Link
            href="/pricing#event-pass"
            className="flex-1 py-3 rounded-2xl border border-[#2a2520]/20 text-sm font-semibold text-center text-[#2a2520] hover:border-[#c9a961] hover:text-[#c9a961] transition-colors"
          >
            Event-Pass kaufen
          </Link>
        </div>

        <p className="text-xs text-[#8a7a6e] text-center mt-6">
          30 Tage Geld-zurück-Garantie · monatlich kündbar
        </p>
      </div>
    </div>
  );
}
