# 🌐 Domain Setup Guide

## 📋 What You Need

- A domain name (buy from Namecheap, GoDaddy, Cloudflare, etc.)
- Vercel account (frontend hosting)
- Railway account (backend hosting)

## 💰 Domain Registrars (Recommended)

| Registrar | Price/year | Notes |
|-----------|------------|-------|
| **Cloudflare** | $8-10 | Cheapest, best DNS management |
| **Namecheap** | $10-12 | User-friendly, good support |
| **Porkbun** | $9-11 | Simple, affordable |
| **GoDaddy** | $12-20 | Popular but more expensive |
| **Google Domains** | Moved to Squarespace | |

### 🏆 Recommendation: Cloudflare or Namecheap

---

## 🎯 Setup Steps

### **Step 1: Buy Your Domain**

Example domain ideas for your project:
- `reelsave.me` (your chosen domain!)
- `socialvideodownloader.com`
- `quickviddownload.com`
- `videosaver.app`
- `snapvideo.io`

1. Go to Cloudflare Registrar: https://www.cloudflare.com/products/registrar/
2. Search for your desired domain
3. Complete purchase (~$10/year)

---

### **Step 2: Configure DNS for Vercel (Frontend)**

After deploying to Vercel:

1. **In Vercel Dashboard**:
   - Go to your project → **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `yourdomain.com`

2. Vercel will show you DNS records to add:

#### Option A: Using Vercel Nameservers (Easiest)
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**At Your Domain Registrar**:
1. Go to DNS settings
2. Change nameservers to Vercel's nameservers above
3. Save changes
4. Wait 5-60 minutes

#### Option B: Using A Records
**At Your Domain Registrar**, add these DNS records:

```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto or 3600

Type: A
Name: www
Value: 76.76.21.21
TTL: Auto or 3600

Type: CNAME (optional, for www redirect)
Name: www
Value: yourdomain.com
TTL: Auto or 3600
```

---

### **Step 3: Configure DNS for Railway (Backend API)**

1. **In Railway Dashboard**:
   - Go to your API service
   - Click **Settings** → **Domains**
   - Click **Custom Domain**
   - Enter: `api.yourdomain.com`

2. Railway will show you a CNAME target like:
   ```
   your-project.up.railway.app
   ```

3. **At Your Domain Registrar**, add this DNS record:
   ```
   Type: CNAME
   Name: api
   Value: your-project.up.railway.app
   TTL: Auto or 3600
   ```

---

## 📝 Complete DNS Configuration Example

If your domain is `reelsave.me`, your final DNS should look like:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 3600 |
| A | www | 76.76.21.21 | 3600 |
| CNAME | api | your-project.up.railway.app | 3600 |

This gives you:
- ✅ `reelsave.me` → Frontend (Vercel)
- ✅ `www.reelsave.me` → Frontend (Vercel)
- ✅ `api.reelsave.me` → Backend API (Railway)

---

## 🔧 Platform-Specific Instructions

### Cloudflare DNS Setup

1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Add each record from the table above
6. **Important**: Set Proxy status to **DNS only** (gray cloud) for better compatibility

### Namecheap DNS Setup

1. Log in to Namecheap
2. Go to **Domain List**
3. Click **Manage** next to your domain
4. Go to **Advanced DNS** tab
5. Click **Add New Record**
6. Add each record from the table above

### GoDaddy DNS Setup

1. Log in to GoDaddy
2. Go to **My Products** → **DNS**
3. Select your domain
4. Click **Add** under DNS Records
5. Add each record from the table above

---

## ⏱️ DNS Propagation Time

DNS changes take time to propagate globally:
- **Minimum**: 5-10 minutes
- **Average**: 30-60 minutes
- **Maximum**: 24-48 hours

### Check DNS Propagation Status

Use these tools:
- https://dnschecker.org
- https://whatsmydns.net
- Command line: `nslookup yourdomain.com`

---

## 🔐 SSL Certificate (HTTPS)

Both Vercel and Railway **automatically generate SSL certificates** for your custom domains!

- ✅ **Free** via Let's Encrypt
- ✅ **Auto-renewal**
- ✅ **No configuration needed**

After DNS propagates, visit your domain:
- `https://yourdomain.com` ← Should work with padlock icon
- `https://api.yourdomain.com/health` ← Should return JSON

---

## 🔄 Update Environment Variables

After setting up your domain, update environment variables:

### Update Railway (Backend)

1. Go to Railway Dashboard
2. Select your API service
3. Go to **Variables**
4. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   ```
5. Save (auto-redeploys)

### Update Vercel (Frontend)

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update `NEXT_PUBLIC_API_BASE_URL`:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
   ```
5. Save
6. Go to **Deployments** tab
7. Click ⋯ next to latest deployment → **Redeploy**

---

## ✅ Verification Checklist

After setup, test these URLs:

- [ ] `https://yourdomain.com` loads the homepage
- [ ] `https://www.yourdomain.com` loads the homepage
- [ ] `https://api.yourdomain.com/health` returns JSON
- [ ] SSL certificate is valid (green padlock in browser)
- [ ] Can paste a video URL and analyze it
- [ ] Can download a video successfully
- [ ] No CORS errors in browser console (F12)

---

## 🐛 Troubleshooting

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN"
**Cause**: DNS not propagated yet  
**Solution**: Wait 30-60 minutes, check DNS with dnschecker.org

### Issue: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"
**Cause**: SSL certificate not generated yet  
**Solution**: Wait 5-10 minutes after DNS propagates, then refresh

### Issue: CORS Error in Browser Console
**Cause**: Backend doesn't allow frontend domain  
**Solution**: Update `CORS_ORIGINS` in Railway environment variables

### Issue: API Returns 404
**Cause**: Railway custom domain not configured  
**Solution**: Re-check CNAME record, verify Railway shows domain as active

### Issue: www Subdomain Not Working
**Cause**: Missing www DNS record  
**Solution**: Add A record for `www` pointing to `76.76.21.21`

---

## 💡 Pro Tips

1. **Use Cloudflare**: Free CDN, DDoS protection, analytics
2. **Enable Vercel Analytics**: Get visitor insights for free
3. **Subdomain for API**: Keep API on `api.` subdomain for clean separation
4. **Short Domain**: Shorter domains are easier to remember and share
5. **Relevant Name**: Include keywords like "video", "download", "clip" for SEO

---

## 📊 Example: Full Setup for clipsavestudio.com

### Buy Domain
- Register `clipsavestudio.com` on Cloudflare ($9.77/year)

### DNS Configuration
```
A     @     76.76.21.21       (Vercel)
A     www   76.76.21.21       (Vercel)
CNAME api   xxx.railway.app   (Railway)
```

### Vercel Domain
- Add `clipsavestudio.com` in Vercel
- Vercel auto-handles SSL

### Railway Domain
- Add `api.clipsavestudio.com` in Railway
- Railway auto-handles SSL

### Environment Variables
**Railway**:
```env
CORS_ORIGINS=https://clipsavestudio.com,https://www.clipsavestudio.com
```

**Vercel**:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.clipsavestudio.com
```

### Final URLs
- Frontend: https://clipsavestudio.com
- API: https://api.clipsavestudio.com
- Health: https://api.clipsavestudio.com/health

---

## 🎉 You're Done!

Your social video downloader is now live with a custom domain!

Share your app:
- 🌐 Website: https://yourdomain.com
- 📱 Mobile: Works on all devices
- 🔒 Secure: HTTPS everywhere
- ⚡ Fast: Global CDN

---

## 📞 Need Help?

- Vercel Support: https://vercel.com/support
- Railway Support: https://railway.app/help
- DNS Help: https://dnschecker.org
- Cloudflare Docs: https://developers.cloudflare.com

Happy deploying! 🚀
