import { handlers } from '@/auth';
import { initDB } from '@/app/lib/db';
import type { NextRequest } from 'next/server';

const dbReady = initDB();

export async function GET(req: NextRequest) {
  await dbReady;
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  await dbReady;
  return handlers.POST(req);
}
