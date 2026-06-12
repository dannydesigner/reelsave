# Google Analytics 4 Integration Guide

## ✅ Implementation Complete

Google Analytics 4 has been successfully integrated into your Next.js application using `@next/third-parties/google`.

## 📁 Files Modified

### 1. **package.json**
- Added `@next/third-parties` package

### 2. **src/app/layout.tsx**
- Imported `GoogleAnalytics` component from `@next/third-parties/google`
- Added GA4 component to root layout (only loads when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set)
- Automatic page view tracking enabled

### 3. **.env.example**
- Added `NEXT_PUBLIC_GA_MEASUREMENT_ID` variable

### 4. **.env.local** (created)
- Local environment configuration with your GA4 Measurement ID

---

## 🚀 Vercel Deployment Setup

### Step 1: Add Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

   ```
   Name:  NEXT_PUBLIC_GA_MEASUREMENT_ID
   Value: G-BET5PY95FM
   ```

4. Select environments where this should be available:
   - ✅ **Production**
   - ✅ **Preview** (optional, recommended for testing)
   - ❌ **Development** (not needed, uses .env.local)

5. Click **Save**

### Step 2: Redeploy

After adding the environment variable, you need to redeploy:

- **Option A**: Push a new commit to trigger automatic deployment
- **Option B**: Go to **Deployments** tab → Click the three dots on latest deployment → **Redeploy**

---

## 🧪 Testing

### Local Development

1. Verify `.env.local` contains:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-BET5PY95FM
   ```

2. Start the dev server:
   ```bash
   pnpm dev
   ```

3. Open browser DevTools → Network tab
4. Visit your app at `http://localhost:3000`
5. Look for requests to `https://www.googletagmanager.com/gtag/js?id=G-BET5PY95FM`

### Production Verification

1. After deploying to Vercel, visit your production URL
2. Open browser DevTools → Console
3. Type `dataLayer` and press Enter
4. You should see an array with tracking events

**OR**

1. Open Google Analytics 4 Dashboard
2. Go to **Reports** → **Realtime**
3. Visit your production site
4. You should see your visit appear within 30 seconds

---

## 📊 What's Tracked Automatically

The `@next/third-parties/google` package automatically tracks:

- ✅ **Page Views** - Every route navigation
- ✅ **First Visit** - New user sessions
- ✅ **Session Start** - When users start browsing
- ✅ **Engagement Time** - How long users stay on pages

---

## 🔧 Advanced Configuration (Optional)

### Custom Event Tracking

If you want to track custom events (e.g., button clicks, downloads), add this to any component:

```typescript
'use client';

import { sendGAEvent } from '@next/third-parties/google';

export function DownloadButton() {
  const handleDownload = () => {
    // Track the download event
    sendGAEvent({ event: 'video_download', value: 'tiktok' });
    
    // Your download logic here
  };

  return (
    <button onClick={handleDownload}>
      Download Video
    </button>
  );
}
```

### Common Custom Events for Your App

```typescript
// Track video download
sendGAEvent({ event: 'video_download', platform: 'tiktok' });

// Track platform selection
sendGAEvent({ event: 'platform_select', platform: 'instagram' });

// Track URL paste
sendGAEvent({ event: 'url_paste', platform: 'facebook' });

// Track download completion
sendGAEvent({ event: 'download_complete', platform: 'tiktok', quality: 'hd' });
```

---

## 🛡️ Privacy & GDPR Compliance

The current implementation loads GA4 for all users. For GDPR compliance, consider:

1. **Cookie Consent Banner** - Ask users for permission before loading GA4
2. **IP Anonymization** - Already enabled by default in GA4
3. **Data Retention** - Configure in GA4 dashboard settings

### Example: Conditional Loading with Consent

```typescript
'use client';

import { GoogleAnalytics } from '@next/third-parties/google';
import { useState, useEffect } from 'react';

export function ConditionalGA() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // Check if user has given consent (from cookie/localStorage)
    const hasConsent = localStorage.getItem('ga-consent') === 'true';
    setConsent(hasConsent);
  }, []);

  if (!consent) return null;

  return <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />;
}
```

---

## 📈 Benefits of Using @next/third-parties

✅ **Optimized Loading** - Scripts load with Partytown for better performance  
✅ **Automatic Page Views** - No manual tracking code needed  
✅ **Type Safety** - Full TypeScript support  
✅ **App Router Compatible** - Works seamlessly with Next.js 13+  
✅ **Server Component Support** - Can be used in RSC layouts  

---

## 🐛 Troubleshooting

### GA4 Not Tracking

**Issue**: No data appearing in Google Analytics

**Solutions**:
1. Check environment variable is set in Vercel
2. Verify GA4 Measurement ID is correct (`G-BET5PY95FM`)
3. Wait 24-48 hours for data to appear (Real-time should work immediately)
4. Check browser console for errors
5. Ensure ad blockers are disabled when testing

### Environment Variable Not Loading

**Issue**: `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` is undefined

**Solutions**:
1. Variable name MUST start with `NEXT_PUBLIC_`
2. Restart dev server after adding to `.env.local`
3. In Vercel, redeploy after adding environment variable
4. Check variable is set for correct environment (Production/Preview)

### Page Views Not Tracking

**Issue**: Page views show incorrectly

**Solutions**:
1. This is handled automatically by `@next/third-parties`
2. Ensure you're using Next.js `<Link>` components for navigation
3. Check that GA4 component is inside `<html>` tag as shown

---

## 📚 Resources

- [Next.js Third Parties Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)
- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/9304153)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✨ Summary

Your Google Analytics 4 integration is complete and production-ready. The implementation:

- Uses the official `@next/third-parties/google` package
- Reads GA4 ID from environment variables
- Tracks page views automatically
- Only loads when the environment variable is set
- Follows Next.js App Router best practices
- Is fully type-safe with TypeScript

**Next Step**: Add the environment variable in Vercel and redeploy! 🚀
