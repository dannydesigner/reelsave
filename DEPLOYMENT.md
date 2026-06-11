# 🚀 Deployment Guide - Social Video Downloader

## 📋 Pre-Deployment Checklist

- [ ] Code pushed to GitHub/GitLab
- [ ] Domain purchased (optional but recommended)
- [ ] Decided on hosting strategy (Vercel+Railway OR VPS)
- [ ] Environment variables documented
- [ ] Dependencies tested locally

---

## 🎯 Recommended: Vercel + Railway (Free Tier Available)

### ✅ Pros
- Free tier for both services
- Auto-scaling
- Automatic SSL certificates
- GitHub integration (auto-deploy on push)
- No server management
- Built-in CDN

### ❌ Cons
- Less control over infrastructure
- Railway free tier has limits (500 hours/month)

---

## 📦 Deployment Steps (Vercel + Railway)

### **STEP 1: Deploy Backend to Railway**

#### 1.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"**

#### 1.2 Deploy from GitHub
1. Click **"Deploy from GitHub repo"**
2. Authorize Railway to access your repository
3. Select your repository: `social-video-downloader`
4. Railway will auto-detect the Dockerfile

#### 1.3 Configure Service
1. Click **"Settings"**
2. Set **Root Directory**: `services/api`
3. Add **Environment Variables**:
   ```
   MAX_DOWNLOAD_BYTES=262144000
   DOWNLOAD_TIMEOUT_SECONDS=300
   SOCKET_TIMEOUT_SECONDS=20
   DOWNLOAD_TEMP_ROOT=/tmp/downloads
   CORS_ORIGINS=http://localhost:3000
   ```
   (We'll update CORS_ORIGINS later with your domain)

#### 1.4 Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~3-5 minutes)
3. Railway will provide a URL like: `https://your-api.up.railway.app`
4. Test it: Visit `https://your-api.up.railway.app/health`

#### 1.5 Add Custom Domain (Optional)
1. In Railway, go to **Settings → Domains**
2. Click **"Custom Domain"**
3. Enter: `api.yourdomain.com`
4. Railway shows DNS instructions (add CNAME record)
5. Go to your domain registrar and add:
   ```
   Type: CNAME
   Name: api
   Value: your-api.up.railway.app
   ```
6. Wait for DNS propagation (5-60 minutes)

---

### **STEP 2: Deploy Frontend to Vercel**

#### 2.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New Project"**

#### 2.2 Import Project
1. Click **"Import Git Repository"**
2. Select your repository: `social-video-downloader`
3. Vercel auto-detects Next.js

#### 2.3 Configure Project
1. Set **Framework Preset**: Next.js
2. Set **Root Directory**: `apps/web`
3. **Build Command**: Leave default (auto-detected)
4. **Install Command**: `pnpm install`
5. Add **Environment Variable**:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api.up.railway.app
   ```
   (Use your Railway URL or custom domain)

#### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Vercel provides URL: `https://your-app.vercel.app`

#### 2.5 Add Custom Domain
1. Buy domain from: Namecheap, GoDaddy, Cloudflare, Porkbun
2. In Vercel Dashboard, go to **Settings → Domains**
3. Click **"Add Domain"**
4. Enter: `yourdomain.com`
5. Vercel shows DNS instructions
6. At your domain registrar, add:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
7. Wait for DNS propagation
8. Vercel auto-generates SSL certificate

---

### **STEP 3: Update CORS Configuration**

After deploying frontend:

1. Go to **Railway Dashboard** → Your API project → **Variables**
2. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://your-app.vercel.app
   ```
3. Save (Railway auto-redeploys)

---

### **STEP 4: Update Frontend API URL**

1. Go to **Vercel Dashboard** → Your project → **Settings → Environment Variables**
2. Update `NEXT_PUBLIC_API_BASE_URL`:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
   ```
   (or keep Railway default URL if not using custom domain)
3. **Redeploy**: Go to **Deployments** → Click ⋯ → **Redeploy**

---

## 🧪 Test Your Deployment

### Backend API Test
```bash
# Health check
curl https://api.yourdomain.com/health

# Should return:
# {"status":"ok","yt_dlp_available":true,"ffmpeg_available":true,"max_download_mb":250}
```

### Frontend Test
1. Visit `https://yourdomain.com`
2. Paste a TikTok video URL
3. Click "Analyze video"
4. Check browser console for any CORS errors
5. Try downloading a video

---

## 🔧 Continuous Deployment

Both platforms support auto-deployment:

### Vercel
- **Auto-deploys** on push to `main` branch
- Pull requests get preview deployments
- View logs in Vercel Dashboard

### Railway
- **Auto-deploys** on push to `main` branch
- View build logs in Railway Dashboard
- Rollback available in Deployments tab

---

## 💰 Cost Estimates

### Free Tier Limits

**Vercel (Free)**:
- Bandwidth: 100GB/month
- Build time: 6,000 minutes/month
- Unlimited deployments
- Perfect for this project

**Railway (Free Trial)**:
- $5 free credits
- ~500 hours/month
- After trial: ~$5-10/month for small traffic

**Alternative: VPS**
- DigitalOcean: $6/month (1GB RAM)
- Hetzner: €4.5/month (2GB RAM)
- Vultr: $6/month (1GB RAM)

---

## 🛠️ Troubleshooting

### Issue: CORS Error
**Solution**: Update `CORS_ORIGINS` in Railway to include your frontend domain

### Issue: API Returns 502
**Solution**: 
- Check Railway logs for errors
- Ensure Dockerfile builds successfully
- Verify ffmpeg is installed (it is in our Dockerfile)

### Issue: Large Videos Timeout
**Solution**: Increase timeouts in Railway (Settings → Timeouts)

### Issue: yt-dlp Can't Download Certain Videos
**Solution**: Platform may have changed
- SSH into Railway (if possible) or rebuild
- Update yt-dlp: `pip install --upgrade yt-dlp`

### Issue: Domain Not Working
**Solution**:
- DNS propagation takes 5-60 minutes
- Check DNS with: https://dnschecker.org
- Verify DNS records are correct

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel Dashboard → Analytics
- Track page views, performance

### Railway Logs
- Click your service → "View Logs"
- Monitor errors and requests

### Uptime Monitoring (Optional)
- Use UptimeRobot (free): https://uptimerobot.com
- Monitor both API and frontend

---

## 🔒 Security Checklist

- [x] HTTPS enabled (automatic on Vercel & Railway)
- [x] CORS configured correctly
- [x] Private IP blocking enabled
- [x] File size limits set
- [x] No secrets in code (use environment variables)
- [ ] Rate limiting (consider adding to API)
- [ ] Monitoring for abuse

---

## 📈 Scaling

If your app grows:

1. **Upgrade Railway**: Add more resources ($5-20/month)
2. **Add CDN**: Use Cloudflare (free)
3. **Optimize Frontend**: Enable Vercel Image Optimization
4. **Add Redis**: Cache metadata responses
5. **Horizontal Scaling**: Railway can auto-scale
6. **Move to VPS**: For full control and cost savings at scale

---

## 🎉 You're Live!

Your app is now deployed at:
- 🌐 Frontend: `https://yourdomain.com`
- 🔌 API: `https://api.yourdomain.com`
- 📚 API Docs: `https://api.yourdomain.com/docs` (FastAPI auto-generates)

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **yt-dlp Issues**: https://github.com/yt-dlp/yt-dlp/issues
- **FastAPI Docs**: https://fastapi.tiangolo.com

---

## 🔄 Maintenance

### Weekly
- Check Railway & Vercel for any issues
- Monitor disk usage on Railway

### Monthly
- Update yt-dlp: Push a rebuild or update requirements.txt
- Review usage and costs
- Check for security updates

### As Needed
- Clear old temporary files (auto-cleaned but monitor)
- Update dependencies
- Add new platform support
