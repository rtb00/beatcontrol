import { MetadataRoute } from 'next';

// KI-Crawler explizit erlauben: OAI-SearchBot/Claude-SearchBot/PerplexityBot
// sind die Such-/Zitations-Crawler (ohne sie taucht die Seite in ChatGPT
// Search & Co. nicht auf), GPTBot/ClaudeBot/Google-Extended sind
// Trainings-Crawler (erwünscht, damit die Marke im Modellwissen landet).
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Bingbot',
];

const DISALLOW = ['/api/', '/auth/', '/account', '/dj'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: 'https://beatcontrol.io/sitemap.xml',
  };
}
