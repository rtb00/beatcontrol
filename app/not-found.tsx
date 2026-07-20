import Link from 'next/link';
import { buttonVariants } from '@/app/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-rave-gradient text-fg font-sans flex flex-col items-center justify-center px-4 py-20">
      <p className="text-neon-gold text-glow-gold text-5xl mb-6">♪</p>
      <h1 className="font-display text-5xl md:text-6xl font-bold uppercase text-center mb-4">
        Diese Seite gibt&rsquo;s nicht.
      </h1>
      <p className="text-fg-muted text-lg text-center max-w-md mb-10">
        Vielleicht der falsche Link, vielleicht ein Event, das deaktiviert wurde.
        Zurück zur Startseite, dann findest du, was du suchst.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className={buttonVariants({ variant: 'primary', size: 'lg', tilt: true })}>
          Zur Startseite
        </Link>
        <Link href="/pricing" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
          Tarife ansehen
        </Link>
      </div>
    </div>
  );
}
