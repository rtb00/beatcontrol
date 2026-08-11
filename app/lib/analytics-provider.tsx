'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

// Produktanalyse über PostHog. Der Reiz gegenüber selbst gesetzten Ereignissen:
// Autocapture erfasst Klicks, Eingaben und Seitenwechsel von allein, und die
// Sitzungsaufzeichnung zeigt, woran jemand tatsächlich hängen bleibt, statt es
// aus Zahlen zu erraten.
//
// Ohne Schlüssel bleibt alles stumm: keine Anfragen, keine Fehler. Damit läuft
// die Anwendung lokal und in Vorschau-Bereitstellungen unverändert weiter.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

let gestartet = false;

function starten() {
  if (gestartet || !KEY || typeof window === 'undefined') return;
  posthog.init(KEY, {
    api_host: HOST,
    // Seitenaufrufe schicken wir selbst, weil der App Router bei einem Wechsel
    // ohne Neuladen sonst nichts meldet.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      // Alles, was jemand eintippt, wird maskiert. Songwünsche und Namen von
      // Gästen gehen niemanden etwas an, auch uns nicht.
      maskAllInputs: true,
    },
    // Datensparsam von Anfang an: keine IP-Adresse, kein Erfassen bei gesetztem
    // Do-Not-Track, keine automatische Aufzeichnung von Formularinhalten.
    property_denylist: ['$ip'],
    respect_dnt: true,
    persistence: 'localStorage+cookie',
    // Später, sobald das Einwilligungsbanner steht: auf true stellen und nach
    // erteilter Einwilligung posthog.opt_in_capturing() aufrufen. Bis dahin
    // läuft die Erfassung, was ohne Banner rechtlich angreifbar bleibt.
    opt_out_capturing_by_default: false,
  });
  gestartet = true;
}

/** Meldet Seitenwechsel, die der App Router ohne Neuladen ausführt. */
function SeitenaufrufMelder() {
  const pfad = usePathname();
  const parameter = useSearchParams();

  useEffect(() => {
    if (!KEY || !pfad) return;
    const query = parameter?.toString();
    posthog.capture('$pageview', {
      $current_url: window.origin + pfad + (query ? `?${query}` : ''),
    });
  }, [pfad, parameter]);

  return null;
}

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    starten();
  }, []);

  if (!KEY) return <>{children}</>;

  return (
    <PostHogProvider client={posthog}>
      <SeitenaufrufMelder />
      {children}
    </PostHogProvider>
  );
}

/**
 * Verknüpft die bisher anonyme Sitzung mit einem Konto, sobald jemand
 * angemeldet ist. Erst dadurch lässt sich ein abgebrochener Kaufweg einer
 * Person zuordnen, statt nur einen Abbruch zu zählen.
 */
export function personErkennen(id: string, eigenschaften?: Record<string, unknown>) {
  if (!KEY || typeof window === 'undefined') return;
  posthog.identify(id, eigenschaften);
}

/** Benanntes Ereignis zusätzlich zum Autocapture, für die Schlüsselmomente. */
export function ereignis(name: string, eigenschaften?: Record<string, unknown>) {
  if (!KEY || typeof window === 'undefined') return;
  posthog.capture(name, eigenschaften);
}
