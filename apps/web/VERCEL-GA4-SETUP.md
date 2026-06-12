# 🚀 Vercel Environment Variable Setup - Quick Guide

## Copy-Paste Ready Configuration

### Vercel Dashboard Steps

1. **Navigate to your project**: https://vercel.com/dashboard
2. Click on your **ReelSave** project
3. Go to **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Add This Variable

```
Key:   NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: G-BET5PY95FM
```

**Environments to Enable:**
- ✅ Production
- ✅ Preview (recommended)
- ❌ Development (not needed)

### Redeploy

After saving the environment variable:

**Option 1 - Automatic** (Recommended)
```bash
git add .
git commit -m "Add GA4 integration"
git push
```

**Option 2 - Manual**
- Go to **Deployments** tab
- Click the ⋮ menu on the latest deployment
- Click **Redeploy**
- Select **Use existing Build Cache** (faster)
- Click **Redeploy**

---

## ✅ Verification Checklist

After deployment:

1. Visit your production site: `https://your-domain.com`
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Refresh the page
5. Search for: `googletagmanager.com/gtag`
6. ✅ You should see the request with status `200`

**Alternative Verification:**

1. Open Google Analytics 4 dashboard
2. Navigate to: **Reports** → **Realtime**
3. Visit your production site
4. ✅ Your visit should appear within 30 seconds

---

## 🔧 Local Development (Already Configured)

Your local environment is ready! Just run:

```bash
cd apps/web
pnpm dev
```

GA4 will load automatically using `.env.local`

---

## 📋 What Was Implemented

| File | Change |
|------|--------|
| `package.json` | Added `@next/third-parties` |
| `src/app/layout.tsx` | Added `<GoogleAnalytics>` component |
| `.env.example` | Added `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| `.env.local` | Created with your GA4 ID |

---

## 🎯 Key Features

✅ **Automatic page view tracking** - No manual code needed  
✅ **Performance optimized** - Uses Partytown for script isolation  
✅ **Type-safe** - Full TypeScript support  
✅ **Conditional loading** - Only loads when env var is set  
✅ **App Router compatible** - Latest Next.js best practices  

---

## 🐛 Quick Troubleshooting

**Not seeing data?**
- Wait 24-48 hours for historical data (Realtime works immediately)
- Check environment variable is saved in Vercel
- Verify you redeployed after adding the variable
- Disable browser ad blockers for testing

**Script not loading?**
- Environment variable name must start with `NEXT_PUBLIC_`
- Check browser console for errors
- Verify GA4 Measurement ID is correct: `G-BET5PY95FM`

---

## 📞 Need Help?

See the complete guide: `GA4-SETUP.md`
