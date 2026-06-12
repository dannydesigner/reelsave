# 🔍 SEO Setup - Sitemap & Robots.txt

## ✅ Implementation Complete

Sitemap and robots.txt have been successfully created using Next.js App Router best practices.

---

## 📁 Files Created

### 1. **`src/app/sitemap.ts`**
Dynamic XML sitemap generator that includes all your routes:
- Homepage (`/`)
- About page (`/about`)
- Privacy policy (`/privacy`)
- Terms of service (`/terms`)

### 2. **`src/app/robots.ts`**
Robots.txt file that:
- Allows all search engines to crawl your site
- Blocks AI scrapers (GPTBot, Claude, etc.)
- References your sitemap
- Protects API and internal routes

### 3. **Enhanced Metadata in `layout.tsx`**
- Added `metadataBase` for proper URL resolution
- Enhanced OpenGraph tags with siteName and URL
- Added robots directives for better indexing
- Added canonical URL support

---

## 🌐 Generated URLs

After deployment, these files will be automatically available at:

```
https://reelsave.me/sitemap.xml
https://reelsave.me/robots.txt
```

### Local Development
```
http://localhost:3000/sitemap.xml
http://localhost:3000/robots.txt
```

---

## 📋 Sitemap Structure

Your sitemap includes:

| URL | Priority | Change Frequency |
|-----|----------|------------------|
| `/` (Homepage) | 1.0 | Daily |
| `/about` | 0.8 | Monthly |
| `/privacy` | 0.5 | Monthly |
| `/terms` | 0.5 | Monthly |

### Priority Explained
- **1.0** - Most important (homepage)
- **0.8** - High importance (main pages)
- **0.5** - Medium importance (legal pages)

### Change Frequency
- **Daily** - Content updates frequently
- **Monthly** - Content rarely changes

---

## 🤖 Robots.txt Configuration

### Allowed
✅ All search engines can crawl your site  
✅ All public pages are indexable  
✅ Google, Bing, DuckDuckGo, etc.

### Blocked
❌ `/api/*` - API routes  
❌ `/_next/*` - Next.js internal files  
❌ AI scrapers (GPTBot, Claude, ChatGPT, etc.)

### AI Crawlers Blocked
The following AI crawlers are explicitly disallowed:
- **GPTBot** - OpenAI's web crawler
- **ChatGPT-User** - ChatGPT's crawler
- **CCBot** - Common Crawl bot
- **anthropic-ai** - Anthropic's Claude
- **Claude-Web** - Claude web crawler

This prevents AI models from training on your content without permission.

---

## 🚀 Vercel Environment Variable Setup

### Required Variable

Add this to Vercel for production:

```
Name:  NEXT_PUBLIC_SITE_URL
Value: https://reelsave.me
```

**Steps:**
1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add `NEXT_PUBLIC_SITE_URL` with your production domain
4. Enable for: **Production** and **Preview**
5. Redeploy

### Why This Matters
The `NEXT_PUBLIC_SITE_URL` is used to:
- Generate absolute URLs in sitemap
- Set canonical URLs for SEO
- Configure OpenGraph metadata
- Reference sitemap in robots.txt

---

## ✅ Verification

### Test Locally

1. Start dev server:
   ```bash
   pnpm dev
   ```

2. Visit in browser:
   - http://localhost:3000/sitemap.xml
   - http://localhost:3000/robots.txt

### Test in Production

After deploying to Vercel:

1. **Sitemap**: https://reelsave.me/sitemap.xml
   - Should show XML with all your URLs
   
2. **Robots.txt**: https://reelsave.me/robots.txt
   - Should show rules and sitemap reference

---

## 🔧 Google Search Console Setup

### Step 1: Submit Your Sitemap

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://reelsave.me`
3. Navigate to **Sitemaps** in the left sidebar
4. Enter: `sitemap.xml`
5. Click **Submit**

Google will now regularly crawl your sitemap for updates.

### Step 2: Verify Robots.txt

1. In Google Search Console, go to **Settings** → **Crawling**
2. Click **robots.txt Tester** (or visit: https://reelsave.me/robots.txt)
3. Verify the rules are correct

---

## 📊 SEO Enhancements Included

### Metadata Improvements

✅ **metadataBase** - Proper URL resolution for all metadata  
✅ **Canonical URLs** - Prevents duplicate content issues  
✅ **Enhanced OpenGraph** - Better social media sharing  
✅ **Robots directives** - Explicit crawling instructions  
✅ **Structured data ready** - Foundation for rich snippets

### Example Output in HTML

```html
<head>
  <meta name="robots" content="index, follow">
  <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1">
  <link rel="canonical" href="https://reelsave.me">
  <meta property="og:url" content="https://reelsave.me">
  <meta property="og:site_name" content="ReelSave">
</head>
```

---

## 🛠️ Customization

### Add New Pages to Sitemap

Edit `src/app/sitemap.ts`:

```typescript
const routes = [
  // ... existing routes
  {
    url: `${baseUrl}/new-page`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  },
];
```

### Update Robots Rules

Edit `src/app/robots.ts`:

```typescript
rules: [
  {
    userAgent: '*',
    allow: '/',
    disallow: [
      '/api/',
      '/_next/',
      '/admin/', // Add new disallowed path
    ],
  },
]
```

### Allow Specific AI Crawler

Remove or comment out in `robots.ts`:

```typescript
// {
//   userAgent: 'GPTBot',
//   disallow: '/',
// },
```

---

## 🧪 Testing Tools

### Validate Sitemap
- [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- Google Search Console → Sitemaps

### Validate Robots.txt
- [Robots.txt Tester](https://support.google.com/webmasters/answer/6062598)
- Google Search Console → robots.txt Tester

### Check SEO Metadata
- [OpenGraph Checker](https://www.opengraph.xyz/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Meta Tags Checker](https://metatags.io/)

---

## 📈 Benefits

### SEO Advantages
✅ **Faster indexing** - Search engines find all pages easily  
✅ **Better crawl budget** - Robots know what to crawl  
✅ **Duplicate content prevention** - Canonical URLs  
✅ **Social media optimization** - Enhanced OpenGraph  
✅ **Rich snippets ready** - Proper metadata foundation

### Privacy Protection
✅ **AI scraper blocking** - Prevents unauthorized training  
✅ **API protection** - Internal routes not indexed  
✅ **Bandwidth savings** - Unwanted bots blocked

---

## 🐛 Troubleshooting

### Sitemap Not Showing Pages

**Issue**: Sitemap is empty or missing pages

**Solutions**:
1. Check `NEXT_PUBLIC_SITE_URL` is set
2. Rebuild: `pnpm build`
3. Clear browser cache
4. Check TypeScript errors in `sitemap.ts`

### Robots.txt Not Working

**Issue**: Bots ignoring robots.txt

**Solutions**:
1. Verify file is accessible at `/robots.txt`
2. Check syntax (no trailing spaces)
3. Remember: Robots.txt is advisory, not enforced
4. Use server-level blocks for strict enforcement

### Wrong Domain in Sitemap

**Issue**: Sitemap shows `localhost` in production

**Solutions**:
1. Add `NEXT_PUBLIC_SITE_URL` to Vercel environment variables
2. Set value to: `https://reelsave.me`
3. Redeploy application

### Google Search Console Errors

**Issue**: GSC shows sitemap errors

**Solutions**:
1. Wait 24-48 hours after first submission
2. Verify sitemap URL is correct: `https://reelsave.me/sitemap.xml`
3. Check all URLs in sitemap are accessible (200 status)
4. Ensure HTTPS is working properly

---

## 📚 Additional SEO Resources

### Next.js Documentation
- [Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Sitemap Generation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

### SEO Tools
- [Google Search Console](https://search.google.com/search-console)
- [Bing Webmaster Tools](https://www.bing.com/webmasters)
- [Ahrefs Webmaster Tools](https://ahrefs.com/webmaster-tools)

---

## 🎯 Next Steps

1. **Deploy to Vercel** with `NEXT_PUBLIC_SITE_URL` environment variable
2. **Submit sitemap** to Google Search Console
3. **Verify robots.txt** is working correctly
4. **Monitor indexing** in Google Search Console (takes 1-7 days)
5. **Check page rankings** after 2-4 weeks

---

## ✨ Summary

Your SEO foundation is complete:

✅ Dynamic XML sitemap  
✅ Robots.txt with AI scraper blocking  
✅ Enhanced metadata with canonical URLs  
✅ OpenGraph optimization  
✅ Proper URL structure  
✅ Search engine friendly configuration

**Status: PRODUCTION READY** 🚀

Just add the `NEXT_PUBLIC_SITE_URL` environment variable in Vercel and you're all set!
