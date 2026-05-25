'use client';

import { useEffect, useRef } from 'react';

export interface PollingOptions<T> {
  url: string;
  baseInterval: number;
  maxInterval?: number;
  onData: (data: T) => void;
  onError?: (err: Error) => void;
  enabled?: boolean;
  // Headers as a function so it can read fresh refs/state per request.
  // Useful for headers that depend on a clientId loaded from localStorage post-mount.
  headers?: () => Record<string, string>;
}

// Adaptive polling hook with three robustness improvements over setInterval:
//   1. Page-Visibility-API: pauses when the tab is hidden, fires immediately when it returns.
//   2. Exponential backoff: on 304 (no change) the interval grows up to maxInterval.
//      Any real update resets the interval back to baseInterval.
//   3. ETag-based conditional GET: sends If-None-Match, so the server can short-circuit
//      with 304 and an empty body when nothing changed.
export function usePolling<T>({
  url,
  baseInterval,
  maxInterval,
  onData,
  onError,
  enabled = true,
  headers,
}: PollingOptions<T>) {
  const onDataRef = useRef(onData);
  const onErrorRef = useRef(onError);
  const headersRef = useRef(headers);

  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    headersRef.current = headers;
  }, [headers]);

  useEffect(() => {
    if (!enabled) return;

    const cap = maxInterval ?? baseInterval * 6;
    let cancelled = false;
    let currentInterval = baseInterval;
    let etag: string | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      if (cancelled) return;
      if (typeof document !== 'undefined' && document.hidden) {
        schedule(baseInterval);
        return;
      }
      try {
        const dyn = headersRef.current?.() ?? {};
        const reqHeaders: Record<string, string> = { ...dyn };
        if (etag) reqHeaders['If-None-Match'] = etag;

        const res = await fetch(url, { headers: reqHeaders });

        if (res.status === 304) {
          currentInterval = Math.min(Math.floor(currentInterval * 1.5), cap);
        } else if (res.ok) {
          const newEtag = res.headers.get('etag');
          if (newEtag) etag = newEtag;
          const data = (await res.json()) as T;
          onDataRef.current(data);
          currentInterval = baseInterval;
        } else {
          onErrorRef.current?.(new Error(`HTTP ${res.status}`));
        }
      } catch (err) {
        onErrorRef.current?.(err as Error);
      } finally {
        schedule(currentInterval);
      }
    }

    function schedule(ms: number) {
      if (cancelled) return;
      timer = setTimeout(tick, ms);
    }

    function handleVisibility() {
      if (!document.hidden) {
        currentInterval = baseInterval;
        if (timer) clearTimeout(timer);
        tick();
      }
    }

    tick();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [url, baseInterval, maxInterval, enabled]);
}
