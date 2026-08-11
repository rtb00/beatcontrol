'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

// Produktanalyse über PostHog, aufgebaut nach der offiziellen Anleitung für
// Next.js. Der Reiz gegenüber selbst gesetzten Ereignissen: Autocapture erfasst
// Klicks, Eingaben und Seitenwechsel von allein, und die Sitzungsaufzeichnung
// zeigt, woran jemand tatsächlich hängen bleibt, statt es aus Zahlen zu raten.
//
// Ohne Schlüssel bleibt alles stumm: keine Anfragen, keine Fehler. Damit läuft
// die Anwendung lokal und in Vorschau-Bereitstellungen unverändert weiter.
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

let gestartet = false;

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (gestartet || !KEY) return;
    posthog.init(KEY, {
      api_host: HOST,
      // Die Voreinstellung der Bibliothek. Sie regelt unter anderem, wie
      // Seitenwechsel im App Router erfasst werden. Ein eigener Melder mit
      // capture_pageview: false hat hier zuvor dazu geführt, dass die
      // Einbindung zwar lud, aber kein einziges Ereignis absetzte.
      defaults: '2026-05-30',
      session_recording: {
        // Alles, was jemand eintippt, wird maskiert. Songwünsche und Namen von
        // Gästen gehen niemanden etwas an, auch uns nicht.
        maskAllInputs: true,
      },
      // Datensparsam von Anfang an: keine IP-Adresse, kein Erfassen bei
      // gesetztem Do-Not-Track.
      property_denylist: ['$ip'],
      respect_dnt: true,
      // Später, sobald das Einwilligungsbanner steht: auf true stellen und nach
      // erteilter Einwilligung posthog.opt_in_capturing() aufrufen.
      opt_out_capturing_by_default: false,
    });
    gestartet = true;
  }, []);

  if (!KEY) return <>{children}</>;

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
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
