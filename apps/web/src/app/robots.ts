import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Base URL - update this to your production domain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reelsave.me';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/', // Disallow API routes
          '/_next/', // Disallow Next.js internal routes
        ],
      },
      {
        userAgent: 'GPTBot', // OpenAI's crawler
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User', // ChatGPT
        disallow: '/',
      },
      {
        userAgent: 'CCBot', // Common Crawl
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai', // Claude
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web', // Claude web crawler
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
