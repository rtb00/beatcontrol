import { NextRequest, NextResponse } from 'next/server';

const MASTER_PASSWORD = 'djmaster2027';

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({ password: '' }));
  if (password === MASTER_PASSWORD) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
}
