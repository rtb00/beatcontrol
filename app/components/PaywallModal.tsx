'use client';

import Link from 'next/link';
import { buttonVariants } from '@/app/components/ui';
import Modal from '@/app/components/ui/Modal';

export type PaywallLimit = 'songs' | 'events' | 'export' | 'branding';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: PaywallLimit;
  current?: number;
  max?: number;
}

export default function PaywallModal({ isOpen, onClose, limitType, current, max }: PaywallModalProps) {
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
    <Modal isOpen={isOpen} onClose={onClose} tone="party">
      <div className="flex items-start justify-between gap-4 mb-2">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-neon-gold">Upgrade</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="text-fg-muted hover:text-fg transition-colors -mt-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>

      <h2 id="paywall-title" className="font-display text-3xl font-bold uppercase text-fg mb-4">
        {headline}
      </h2>
      <p className="text-fg-muted leading-relaxed mb-8">{description}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/pricing?cycle=yearly" className={buttonVariants({ variant: 'primary', size: 'md', tilt: true, className: 'flex-1' })}>
          Pro starten
        </Link>
        <Link href="/pricing#event-pass" className={buttonVariants({ variant: 'secondary', size: 'md', className: 'flex-1' })}>
          Event-Pass kaufen
        </Link>
      </div>

      <p className="text-xs text-fg-muted text-center mt-6">
        30 Tage Geld-zurück-Garantie · monatlich kündbar
      </p>
    </Modal>
  );
}
