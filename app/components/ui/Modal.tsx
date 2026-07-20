'use client';

import { useEffect, type ReactNode } from 'react';
import type { Tone } from './Button';

/**
 * Generic modal shell (backdrop + escape handling + panel chrome). Feature
 * modals (e.g. PaywallModal) render their own headline/body/actions as
 * children — this component owns none of that content.
 */
export default function Modal({
  isOpen,
  onClose,
  tone = 'party',
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  tone?: Tone;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full max-w-md rounded-3xl border border-line bg-panel-elevated p-8 shadow-2xl animate-fade-up ${
          tone === 'party' ? 'glow-magenta' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
