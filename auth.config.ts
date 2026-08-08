import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/auth/signin' },
  providers: [],
  callbacks: {
    authorized({ auth: session, request }) {
      // DJ-Link ohne Account: /dj/[slug]?dj=TOKEN darf die Login-Wand passieren.
      // Ob das Token stimmt, prüft jede Schreib-API serverseitig — die Seite
      // selbst zeigt nur Daten, die ohnehin über offene GET-Endpunkte lesbar sind.
      if (request.nextUrl.searchParams.get('dj')) return true;
      return !!session?.user;
    },
  },
};
