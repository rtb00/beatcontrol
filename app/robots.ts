import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/account', '/dj'],
      },
    ],
    sitemap: 'https://beatcontrol.io/sitemap.xml',
  };
}
