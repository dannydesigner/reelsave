# 📄 Sitemap & Robots.txt - Output Examples

## What Your Generated Files Look Like

---

## 🗺️ Sitemap.xml Example

When you visit `https://reelsave.me/sitemap.xml`, you'll see:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://reelsave.me</loc>
    <lastmod>2026-06-12</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://reelsave.me/about</loc>
    <lastmod>2026-06-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://reelsave.me/privacy</loc>
    <lastmod>2026-06-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://reelsave.me/terms</loc>
    <lastmod>2026-06-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

### Key Elements

- **`<loc>`** - The full URL of the page
- **`<lastmod>`** - Last modification date (ISO 8601 format)
- **`<changefreq>`** - How often the page typically changes
- **`<priority>`** - Relative importance (0.0 to 1.0)

---

## 🤖 Robots.txt Example

When you visit `https://reelsave.me/robots.txt`, you'll see:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

Sitemap: https://reelsave.me/sitemap.xml
```

### Key Directives

- **`User-agent: *`** - Rules for all crawlers
- **`Allow: /`** - Allow crawling the entire site
- **`Disallow: /api/`** - Block API routes from indexing
- **`Disallow: /_next/`** - Block Next.js internal files
- **`User-agent: GPTBot`** - Rules for specific crawler
- **`Sitemap:`** - Location of your sitemap

---

## 🔍 What Search Engines See

### When Google Crawls Your Site

1. **First**, Google requests: `https://reelsave.me/robots.txt`
   - Sees it's allowed to crawl
   - Finds sitemap reference

2. **Then**, Google requests: `https://reelsave.me/sitemap.xml`
   - Gets list of all pages
   - Sees priorities and update frequencies

3. **Finally**, Google crawls each page in priority order
   - Homepage (priority 1.0) first
   - About page (priority 0.8) second
   - Privacy & Terms (priority 0.5) last

---

## 📊 Priority Guidelines

### Priority Values in Your Sitemap

| Page | Priority | Reasoning |
|------|----------|-----------|
| Homepage `/` | 1.0 | Most important - main entry point |
| About `/about` | 0.8 | High value - introduces your service |
| Privacy `/privacy` | 0.5 | Important but low traffic |
| Terms `/terms` | 0.5 | Important but low traffic |

### Priority Best Practices

- **1.0** - Homepage only (your most important page)
- **0.8-0.9** - Main sections, key features
- **0.5-0.7** - Secondary pages, documentation
- **0.3-0.4** - Legal pages, less important content
- **0.1-0.2** - Archive, old content

**Note:** Priority is relative within your own site, not compared to other sites!

---

## 📅 Change Frequency Guidelines

### Change Frequency in Your Sitemap

| Page | Frequency | Reasoning |
|------|-----------|-----------|
| Homepage `/` | daily | Content/features updated often |
| About `/about` | monthly | Rarely changes |
| Privacy `/privacy` | monthly | Only updates for policy changes |
| Terms `/terms` | monthly | Only updates for terms changes |

### Change Frequency Options

- **always** - Changes every time it's accessed (rare)
- **hourly** - Multiple times per day
- **daily** - Once per day (news sites, active sites)
- **weekly** - Once per week (blogs)
- **monthly** - Once per month (static content)
- **yearly** - Once per year (legal pages)
- **never** - Archived content

---

## 🛡️ AI Scraper Blocking Explained

### Why Block AI Scrapers?

Your robots.txt blocks these AI crawlers:

```
User-agent: GPTBot          # OpenAI (ChatGPT, GPT-4)
User-agent: ChatGPT-User    # ChatGPT's web crawler
User-agent: CCBot           # Common Crawl (used by many AI)
User-agent: anthropic-ai    # Anthropic (Claude)
User-agent: Claude-Web      # Claude's web crawler
```

**Benefits:**
- ✅ Prevents AI training on your content without permission
- ✅ Protects your unique content and features
- ✅ Reduces unauthorized bandwidth usage
- ✅ Maintains content ownership

**Note:** This doesn't affect regular search engines (Google, Bing) at all!

### Want to Allow AI Crawlers?

Remove or comment out the specific user-agent blocks in `src/app/robots.ts`:

```typescript
// Remove these to allow AI crawlers:
// {
//   userAgent: 'GPTBot',
//   disallow: '/',
// },
```

---

## 🔧 Advanced Sitemap Features

### Adding More Pages

Edit `src/app/sitemap.ts` to add new pages:

```typescript
const routes = [
  // Existing routes...
  
  // Add new route
  {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  },
];
```

### Dynamic Content

For pages with dynamic content (e.g., blog posts):

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reelsave.me';
  
  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ];
  
  // Fetch dynamic content (example)
  // const posts = await getPosts();
  // const postRoutes = posts.map((post) => ({
  //   url: `${baseUrl}/blog/${post.slug}`,
  //   lastModified: new Date(post.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // }));
  
  // return [...routes, ...postRoutes];
  
  return routes;
}
```

---

## 🧪 Testing Your Implementation

### 1. Local Testing

```bash
# Start dev server
pnpm dev

# Visit in browser
http://localhost:3000/sitemap.xml
http://localhost:3000/robots.txt
```

### 2. Production Testing

After deploying:

```bash
# Test sitemap
curl https://reelsave.me/sitemap.xml

# Test robots.txt
curl https://reelsave.me/robots.txt
```

### 3. Google Validation

Use Google's tools:
- [Robots Testing Tool](https://www.google.com/webmasters/tools/robots-testing-tool)
- [Rich Results Test](https://search.google.com/test/rich-results)

---

## 📈 Monitoring & Analytics

### Google Search Console Metrics

After submitting your sitemap, monitor:

1. **Coverage Report**
   - How many pages are indexed
   - Any indexing errors

2. **Sitemaps Report**
   - Last crawl date
   - Number of URLs discovered
   - Number of URLs submitted

3. **Performance Report**
   - Which pages get traffic
   - Search queries
   - Click-through rates

### Expected Timeline

- **Day 1-2** - Google discovers your sitemap
- **Day 3-7** - Google starts indexing pages
- **Week 2-4** - Full site indexed
- **Month 2+** - See ranking improvements

---

## ✨ SEO Metadata in HTML

Your enhanced metadata produces:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Basic Meta -->
  <title>ReelSave - Free TikTok & Instagram Video Downloader</title>
  <meta name="description" content="Download TikTok videos without watermark in HD...">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://reelsave.me">
  
  <!-- Robots -->
  <meta name="robots" content="index, follow">
  <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1">
  
  <!-- OpenGraph -->
  <meta property="og:url" content="https://reelsave.me">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ReelSave">
  <meta property="og:title" content="ReelSave - Free TikTok & Instagram Video Downloader">
  <meta property="og:description" content="Download TikTok videos without watermark in HD...">
  
  <!-- Links -->
  <link rel="sitemap" type="application/xml" href="/sitemap.xml">
</head>
</html>
```

---

## 🎯 Summary

Your implementation includes:

✅ **Dynamic XML sitemap** with all routes  
✅ **Robots.txt** with AI scraper blocking  
✅ **Enhanced SEO metadata** in layout  
✅ **Canonical URLs** for duplicate prevention  
✅ **OpenGraph optimization** for social sharing  
✅ **Proper URL structure** with metadataBase  

**Everything is production-ready!** 🚀

See `SEO-SETUP.md` for the complete guide.
