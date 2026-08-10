import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const COOKIE_NAME = 'bc_gid';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Liest die Gästekennung aus einem httpOnly-Cookie, das der Server beim
 * ersten Besuch selbst vergibt. Anders als ein client-gesetzter Header
 * (z.B. X-Client-Id) kann der Browser diesen Wert weder lesen noch frei
 * wählen — ein Skript müsste für jede "neue" Kennung tatsächlich einen neuen
 * Cookie-Store bekommen, nicht nur einen Header-Wert ändern.
 */
export function readOrCreateGuestId(req: NextRequest): { id: string; isNew: boolean } {
  const existing = req.cookies.get(COOKIE_NAME)?.value ?? '';
  if (UUID_RE.test(existing)) {
    return { id: existing, isNew: false };
  }
  return { id: randomUUID(), isNew: true };
}

/**
 * Setzt den Gäste-Cookie auf der Antwort, falls er neu vergeben wurde.
 * Muss auf jeder Antwort aufgerufen werden, die readOrCreateGuestId nutzt.
 */
export function attachGuestCookie(res: NextResponse, id: string, isNew: boolean): NextResponse {
  if (isNew) {
    res.cookies.set(COOKIE_NAME, id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365 * 2,
      path: '/',
    });
  }
  return res;
}
