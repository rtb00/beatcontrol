import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2a2520] font-sans flex flex-col items-center justify-center px-4 py-20">
      <p className="text-[#c9a961] text-5xl mb-6">♪</p>
      <h1 className="font-serif text-5xl md:text-6xl font-bold text-center mb-4">
        Diese Seite gibt&rsquo;s nicht.
      </h1>
      <p className="text-[#8a7a6e] text-lg text-center max-w-md mb-10">
        Vielleicht der falsche Link, vielleicht ein Event, das deaktiviert wurde.
        Zurück zur Startseite, dann findest du, was du suchst.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-7 py-3.5 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors shadow-sm text-center"
        >
          Zur Startseite
        </Link>
        <Link
          href="/pricing"
          className="px-7 py-3.5 rounded-full border border-[#2a2520]/20 text-sm font-medium hover:border-[#c9a961] transition-colors text-center"
        >
          Tarife ansehen
        </Link>
      </div>
    </div>
  );
}
