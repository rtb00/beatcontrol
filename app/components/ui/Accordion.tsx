'use client';

import { useState, type ReactNode } from 'react';

export interface AccordionItem {
  question: string;
  answer: ReactNode;
}

/**
 * Classic single-open FAQ accordion (Airbnb/Stripe-style): question row with
 * a rotating "+" affordance, answer expands via a CSS grid-rows trick (no JS
 * height measurement needed). Deliberately plain — this is a well-worn,
 * recognizable pattern, not a bespoke visual.
 */
export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-semibold text-fg">{item.question}</span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`w-5 h-5 shrink-0 text-neon-gold transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                aria-hidden="true"
              >
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
            </button>
            <div className={`grid transition-all duration-300 ease-out overflow-hidden ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="min-h-0">
                <div className="pb-5 text-sm text-fg-muted leading-relaxed">{item.answer}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
