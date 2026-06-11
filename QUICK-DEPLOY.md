# ⚡ Quick Deploy Checklist

## 🎯 Fastest Way to Deploy (30 minutes)

### Prerequisites ✅
- [ ] Code pushed to GitHub
- [ ] GitHub account
- [ ] Credit/debit card (for domain - optional)

---

## 📦 Step-by-Step (Copy & Paste Ready)

### **1️⃣ Deploy Backend (Railway) - 10 mins**

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `social-video-downloader`
5. **Settings** → **Root Directory**: `services/api`
6. **Variables** → Add these:
   ```env
   MAX_DOWNLOAD_BYTES=262144000
   DOWNLOAD_TIMEOUT_SECONDS=300
   SOCKET_TIMEOUT_SECONDS=20
   DOWNLOAD_TEMP_ROOT=/tmp/downloads
   CORS_ORIGINS=http://localhost:3000
   ```
7. **Deploy** → Wait 3-5 mins
8. **Copy the Railway URL**: `https://xxx.railway.app`
9. **Test**: Visit `https://xxx.railway.app/health` ✅

---

### **2️⃣ Deploy Frontend (Vercel) - 10 mins**

1. **Go to**: https://vercel.com
2. **Sign up** with GitHub
3. **Add New Project** → **Import Git Repository**
4. **Select**: `social-video-downloader`
5. **Configure**:
   - Root Directory: `apps/web`
   - Framework: Next.js (auto-detected)
   - Install Command: `pnpm install`
6. **Environment Variables** → Add:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://xxx.railway.app
   ```
   (Use your Railway URL from step 1)
7. **Deploy** → Wait 2-3 mins
8. **Copy the Vercel URL**: `https://xxx.vercel.app`
9. **Test**: Visit your Vercel URL ✅

---

### **3️⃣ Update CORS - 2 mins**

1. **Go back to Railway** Dashboard
2. **Variables** → Update `CORS_ORIGINS`:
   ```env
   CORS_ORIGINS=https://xxx.vercel.app,http://localhost:3000
   ```
   (Use your Vercel URL from step 2)
3. **Save** (auto-redeploys in 1 min)

---

### **4️⃣ Test Everything - 5 mins**

Visit your Vercel URL and test:
- [ ] Paste a TikTok URL: `https://www.tiktok.com/@user/video/xxx`
- [ ] Click "Analyze video" → Should show video info
- [ ] Click "Download video" → Should download
- [ ] Check browser console (F12) → No errors

---

## 🌐 Add Custom Domain (Optional) - 15 mins

### Buy Domain
1. **Go to**: https://www.cloudflare.com/products/registrar/
2. **Search** for domain name (e.g., `clipsavestudio.com`)
3. **Buy** (~$10/year)

### Frontend Domain (Vercel)
1. **Vercel** → Project → **Settings** → **Domains**
2. **Add**: `reelsave.me`
3. **At Cloudflare**, add DNS records:
   ```
   Type: A, Name: @, Value: 76.76.21.21
   Type: A, Name: www, Value: 76.76.21.21
   ```
4. Wait 10-30 mins for DNS propagation

### Backend Domain (Railway)
1. **Railway** → Project → **Settings** → **Domains**
2. **Add**: `api.reelsave.me`
3. **At Cloudflare**, add DNS record:
   ```
   Type: CNAME, Name: api, Value: xxx.railway.app
   ```
4. Wait 10-30 mins

### Update Environment Variables
**Railway**:
```env
CORS_ORIGINS=https://reelsave.me,https://www.reelsave.me
```

**Vercel**:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.reelsave.me
```

Then redeploy both services.

---

## 🎉 Done! Your URLs:

### Without Custom Domain:
- 🌐 **Frontend**: `https://xxx.vercel.app`
- 🔌 **API**: `https://xxx.railway.app`

### With Custom Domain:
- 🌐 **Frontend**: `https://reelsave.me`
- 🔌 **API**: `https://api.reelsave.me`

---

## 💰 Cost Summary

### Free Tier (Start Here):
- **Vercel**: Free forever (100GB bandwidth/month)
- **Railway**: $5 free credits (~500 hours)
- **Total**: **$0** for first month

### With Custom Domain:
- **Vercel**: Free
- **Railway**: $5/month after free credits
- **Domain**: $10/year
- **Total**: **~$6/month** ($10 first month for domain)

---

## 🔄 Auto-Deploy Setup

Both platforms auto-deploy when you push to GitHub!

```bash
# Make a change
git add .
git commit -m "Update feature"
git push origin main

# ✨ Auto-deploys in 2-3 minutes!
```

---

## 📊 Monitoring

### Vercel Dashboard
- **Deployments**: View all deploys
- **Analytics**: See visitor stats
- **Logs**: Debug errors

### Railway Dashboard
- **Deployments**: View deploy history
- **Metrics**: CPU, memory, network
- **Logs**: View API logs

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error | Update Railway `CORS_ORIGINS` |
| API 404 | Check Railway deployment logs |
| Can't download | Check Railway URL in Vercel env vars |
| Domain not working | Wait 30 mins, check dnschecker.org |
| SSL error | Wait 10 mins after DNS propagates |

---

## 📞 Support Links

- **Railway**: https://railway.app/help
- **Vercel**: https://vercel.com/docs
- **DNS Check**: https://dnschecker.org
- **API Docs**: `https://your-api-url/docs` (auto-generated)

---

## 🚀 Next Steps

1. **Share your app** with friends
2. **Monitor usage** in dashboards
3. **Update yt-dlp** monthly (rebuild on Railway)
4. **Add analytics** (Vercel Analytics or Google Analytics)
5. **Customize branding** in the frontend code

---

**That's it! You're live! 🎉**

Questions? Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed docs.
