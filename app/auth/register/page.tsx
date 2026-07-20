'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Plan = 'pro_yearly' | 'pro_monthly' | 'event_pass';

function parsePlan(raw: string | null): Plan | null {
  if (raw === 'pro_yearly' || raw === 'pro_monthly' || raw === 'event_pass') return raw;
  return null;
}

const PLAN_LABEL: Record<Plan, string> = {
  pro_yearly: 'Pro · jährlich',
  pro_monthly: 'Pro · monatlich',
  event_pass: 'Event-Pass',
};

function RegisterPageInner() {
  const params = useSearchParams();
  const plan = parsePlan(params.get('plan'));
  const postRegisterUrl = plan ? `/pricing?plan=${plan}` : '/dj';
  const signinHref = plan ? `/auth/signin?plan=${plan}` : '/auth/signin';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptedAgb, setAcceptedAgb] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const consentGiven = acceptedAgb && acceptedPrivacy;

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: postRegisterUrl });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!consentGiven) {
      setError('Bitte stimme den AGB und der Datenschutzerklärung zu.');
      return;
    }
    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }
    if (password !== confirm) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Registrierung fehlgeschlagen.');
        setLoading(false);
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Registriert, aber Login fehlgeschlagen. Bitte manuell anmelden.');
        setLoading(false);
        return;
      }
      window.location.href = postRegisterUrl;
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="text-center text-[#c9a961] text-3xl mb-3">♪</p>
        <h1 className="font-serif text-3xl font-bold text-[#2a2520] text-center mb-1">
          BeatControl
        </h1>
        <p className="text-[#8a7a6e] text-sm text-center mb-10">DJ-Account erstellen</p>

        {plan && (
          <div className="mb-6 rounded-2xl border border-[#c9a961]/40 bg-[#c9a961]/10 px-4 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-[#c9a961] font-semibold mb-1">
              Ausgewählter Plan
            </p>
            <p className="text-sm text-[#2a2520] font-semibold">{PLAN_LABEL[plan]}</p>
            <p className="text-xs text-[#8a7a6e] mt-1">
              Nach dem Anlegen geht&apos;s direkt zur Buchung.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 border border-[#e8d9b8] shadow-sm space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border border-[#e8d9b8] bg-white text-[#2a2520] text-sm font-medium hover:bg-[#faf6f0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.312 0-9.626-3.634-11.285-8.524l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            {googleLoading ? 'Weiterleitung…' : 'Mit Google registrieren'}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e8d9b8]" />
            <span className="text-xs text-[#8a7a6e]">oder</span>
            <div className="h-px flex-1 bg-[#e8d9b8]" />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-[#2a2520] mb-1">
                Name <span className="text-[#8a7a6e]">(optional)</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e8d9b8] bg-[#faf6f0] text-[#2a2520] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent"
              />
            </div>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e8d9b8] bg-[#faf6f0] text-[#2a2520] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent"
              />
              <p className="text-xs text-[#8a7a6e] mt-1">Mindestens 8 Zeichen</p>
            </div>
            <div>
              <label htmlFor="confirm" className="block text-xs font-medium text-[#2a2520] mb-1">
                Passwort bestätigen
              </label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e8d9b8] bg-[#faf6f0] text-[#2a2520] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a961] focus:border-transparent"
              />
            </div>
            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 text-xs text-[#2a2520] cursor-pointer leading-snug">
                <input
                  type="checkbox"
                  checked={acceptedAgb}
                  onChange={(e) => setAcceptedAgb(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#c9a961] text-[#c9a961] focus:ring-[#c9a961] flex-shrink-0"
                />
                <span>
                  Ich stimme den{' '}
                  <Link href="/agb" target="_blank" className="text-[#c9a961] hover:underline font-medium">
                    AGB
                  </Link>{' '}
                  zu.
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-xs text-[#2a2520] cursor-pointer leading-snug">
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#c9a961] text-[#c9a961] focus:ring-[#c9a961] flex-shrink-0"
                />
                <span>
                  Ich habe die{' '}
                  <Link href="/datenschutz" target="_blank" className="text-[#c9a961] hover:underline font-medium">
                    Datenschutzerklärung
                  </Link>{' '}
                  gelesen.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !consentGiven}
              className="w-full px-5 py-3 rounded-xl bg-[#c9a961] text-white text-sm font-medium hover:bg-[#b8985a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registriere…' : 'Account erstellen'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[#2a2520] mt-6">
          Schon registriert?{' '}
          <Link href={signinHref} className="text-[#c9a961] hover:underline font-medium">
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf6f0]" />}>
      <RegisterPageInner />
    </Suspense>
  );
}
