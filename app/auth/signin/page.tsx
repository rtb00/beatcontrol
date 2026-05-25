import { auth, signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type Plan = 'pro_yearly' | 'pro_monthly' | 'event_pass';

function parsePlan(raw: string | undefined): Plan | null {
  if (raw === 'pro_yearly' || raw === 'pro_monthly' || raw === 'event_pass') return raw;
  return null;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: { error?: string; plan?: string };
}) {
  const plan = parsePlan(searchParams?.plan);
  const redirectTo = plan ? `/pricing?plan=${plan}` : '/dj';

  const session = await auth();
  if (session?.user) {
    redirect(redirectTo);
  }

  async function googleSignIn() {
    'use server';
    await signIn('google', { redirectTo });
  }

  async function appleSignIn() {
    'use server';
    await signIn('apple', { redirectTo });
  }

  async function credentialsSignIn(formData: FormData) {
    'use server';
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        const errorUrl = plan
          ? `/auth/signin?error=CredentialsSignin&plan=${plan}`
          : '/auth/signin?error=CredentialsSignin';
        redirect(errorUrl);
      }
      throw error;
    }
  }

  const appleEnabled = !!process.env.AUTH_APPLE_ID;
  const errorMsg =
    searchParams?.error === 'CredentialsSignin'
      ? 'Email oder Passwort falsch.'
      : searchParams?.error
        ? 'Anmeldung fehlgeschlagen.'
        : null;

  const planLabel: Record<Plan, string> = {
    pro_yearly: 'Pro · jährlich',
    pro_monthly: 'Pro · monatlich',
    event_pass: 'Event-Pass',
  };
  const registerHref = plan ? `/auth/register?plan=${plan}` : '/auth/register';

  return (
    <div className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="text-center text-[#c9a961] text-3xl mb-3">♪</p>
        <h1 className="font-serif text-3xl font-bold text-[#2a2520] text-center mb-1">
          BeatControl
        </h1>
        <p className="text-[#8a7a6e] text-sm text-center mb-10">DJ-Bereich</p>

        {plan && (
          <div className="mb-6 rounded-2xl border border-[#c9a961]/40 bg-[#c9a961]/10 px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#c9a961] font-semibold mb-1">
              Ausgewählter Plan
            </p>
            <p className="text-sm text-[#2a2520] font-semibold">{planLabel[plan]}</p>
            <p className="text-xs text-[#8a7a6e] mt-1">
              Nach der Anmeldung geht&apos;s direkt zur Buchung.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 border border-[#e8d9b8] shadow-sm space-y-4">
          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <form action={credentialsSignIn} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-[#2a2520] mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#e8d9b8] bg-[#faf6f0] text-[#2a2520] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-[#2a2520] mb-1">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-[#e8d9b8] bg-[#faf6f0] text-[#2a2520] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full px-5 py-3 rounded-xl bg-[#c9a961] text-white text-sm font-medium hover:bg-[#b8985a] transition-colors"
            >
              Anmelden
            </button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e8d9b8]" />
            <span className="text-xs text-[#8a7a6e]">oder</span>
            <div className="h-px flex-1 bg-[#e8d9b8]" />
          </div>

          <form action={googleSignIn}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-[#e8d9b8] bg-white text-[#2a2520] text-sm font-medium hover:bg-[#faf6f0] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.312 0-9.626-3.634-11.285-8.524l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              Mit Google anmelden
            </button>
          </form>

          <p className="text-[11px] text-[#8a7a6e] leading-relaxed text-center">
            Mit der Anmeldung stimmst du unseren{' '}
            <Link href="/agb" className="text-[#c9a961] hover:underline">
              AGB
            </Link>{' '}
            zu und nimmst die{' '}
            <Link href="/datenschutz" className="text-[#c9a961] hover:underline">
              Datenschutzerklärung
            </Link>{' '}
            zur Kenntnis.
          </p>

          {appleEnabled && (
            <form action={appleSignIn}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-[#2a2520] text-white text-sm font-medium hover:bg-black transition-colors"
              >
                <svg width="16" height="18" viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-38.4-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 268.5-317.3 99.8 0 165 56.1 221.3 56.1 53.9 0 128.8-59.3 240.8-59.3zm-220.8-78.8c-28 34.4-73.3 60.5-116.4 60.5-4.5 0-9-.6-13.5-1.3.6-39.5 22.7-80.3 48.4-107.9 27.4-30.3 72.7-54.5 114.6-57.5.6 5.2 1.3 10.3 1.3 15.5 0 38.4-16.6 77.3-34.4 90.7z"/>
                </svg>
                Mit Apple anmelden
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#2a2520] mt-6">
          Noch kein Account?{' '}
          <Link href={registerHref} className="text-[#c9a961] hover:underline font-medium">
            Registrieren
          </Link>
        </p>
        <p className="text-center text-xs text-[#8a7a6e] mt-3">
          Nur für DJs. Gäste brauchen keinen Account.
        </p>
      </div>
    </div>
  );
}
