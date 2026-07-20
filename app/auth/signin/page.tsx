import { auth, signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CalmScope, Card, Button } from '@/app/components/ui';

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
    <CalmScope className="min-h-screen bg-base flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="text-center text-neon-gold text-3xl mb-3">♪</p>
        <h1 className="font-display text-3xl font-bold text-fg text-center mb-1">
          BeatControl
        </h1>
        <p className="text-fg-muted text-sm text-center mb-10">DJ-Bereich</p>

        {plan && (
          <div className="mb-6 rounded-2xl border border-neon-gold/40 bg-neon-gold/10 px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-neon-gold font-semibold mb-1">
              Ausgewählter Plan
            </p>
            <p className="text-sm text-fg font-semibold">{planLabel[plan]}</p>
            <p className="text-xs text-fg-muted mt-1">
              Nach der Anmeldung geht&apos;s direkt zur Buchung.
            </p>
          </div>
        )}

        <Card tone="calm" className="space-y-4">
          {errorMsg && (
            <div className="rounded-lg border border-danger/40 bg-danger-bg px-4 py-3 text-sm text-danger">
              {errorMsg}
            </div>
          )}

          <form action={credentialsSignIn} className="space-y-3">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-fg mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-2xl border border-line bg-panel text-fg placeholder:text-fg-muted focus:outline-none focus:border-neon-gold transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-fg mb-1">
                Passwort
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-2xl border border-line bg-panel text-fg placeholder:text-fg-muted focus:outline-none focus:border-neon-gold transition-colors"
              />
            </div>
            <Button type="submit" tone="calm" variant="primary" className="w-full">
              Anmelden
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-fg-muted">oder</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form action={googleSignIn}>
            <Button type="submit" tone="calm" variant="secondary" className="w-full">
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.312 0-9.626-3.634-11.285-8.524l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              Mit Google anmelden
            </Button>
          </form>

          <p className="text-[11px] text-fg-muted leading-relaxed text-center">
            Mit der Anmeldung stimmst du unseren{' '}
            <Link href="/agb" className="text-neon-gold hover:underline">
              AGB
            </Link>{' '}
            zu und nimmst die{' '}
            <Link href="/datenschutz" className="text-neon-gold hover:underline">
              Datenschutzerklärung
            </Link>{' '}
            zur Kenntnis.
          </p>

          {appleEnabled && (
            <form action={appleSignIn}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm rounded-xl font-sans font-semibold bg-fg text-base hover:brightness-110 transition-all active:scale-95"
              >
                <svg width="16" height="18" viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-38.4-155.5-127.4C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.3 268.5-317.3 99.8 0 165 56.1 221.3 56.1 53.9 0 128.8-59.3 240.8-59.3zm-220.8-78.8c-28 34.4-73.3 60.5-116.4 60.5-4.5 0-9-.6-13.5-1.3.6-39.5 22.7-80.3 48.4-107.9 27.4-30.3 72.7-54.5 114.6-57.5.6 5.2 1.3 10.3 1.3 15.5 0 38.4-16.6 77.3-34.4 90.7z"/>
                </svg>
                Mit Apple anmelden
              </button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-fg mt-6">
          Noch kein Account?{' '}
          <Link href={registerHref} className="text-neon-gold hover:underline font-medium">
            Registrieren
          </Link>
        </p>
        <p className="text-center text-xs text-fg-muted mt-3">
          Nur für DJs. Gäste brauchen keinen Account.
        </p>
      </div>
    </CalmScope>
  );
}
