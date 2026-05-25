import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/auth/signin' },
  providers: [],
  callbacks: {
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
};
