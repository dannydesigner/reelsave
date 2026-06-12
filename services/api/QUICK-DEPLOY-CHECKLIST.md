# ✅ Quick Deployment Checklist

## Pre-Deployment (Local Testing)

- [ ] Read `PROTECTION-SUMMARY.md` to understand the protections
- [ ] Review all code changes
- [ ] Verify new dependencies in `requirements.txt`
- [ ] Test locally if possible

---

## Deployment Steps (30-45 minutes)

### 1️⃣ Backup (5 minutes)
```bash
ssh root@your-server-ip
cd /var/www/social-downloader/services/api

# Backup current code
cp -r app app.backup.$(date +%Y%m%d)
cp requirements.txt requirements.txt.backup
cp .env .env.backup
```

- [ ] Backed up application code
- [ ] Backed up requirements.txt
- [ ] Backed up .env file

---

### 2️⃣ Upload New Files (10 minutes)

Upload to `/var/www/social-downloader/services/api/app/`:
- [ ] `rate_limiter.py` (new)
- [ ] `bot_protection.py` (new)
- [ ] `logging_config.py` (new)
- [ ] `config.py` (modified)
- [ ] `main.py` (modified)
- [ ] `downloader.py` (modified)

```bash
# Set permissions
chown -R www-data:www-data /var/www/social-downloader
chmod -R 755 /var/www/social-downloader
```

- [ ] All files uploaded
- [ ] Permissions set correctly

---

### 3️⃣ Install Dependencies (5 minutes)
```bash
cd /var/www/social-downloader/services/api
source .venv/bin/activate
pip install -r requirements.txt --upgrade
```

- [ ] Dependencies installed successfully
- [ ] No error messages

---

### 4️⃣ Create Directories (2 minutes)
```bash
mkdir -p /var/www/social-downloader/logs
mkdir -p /var/www/social-downloader/tmp
chown -R www-data:www-data /var/www/social-downloader/logs
chown -R www-data:www-data /var/www/social-downloader/tmp
chmod 755 /var/www/social-downloader/logs
chmod 755 /var/www/social-downloader/tmp
```

- [ ] Log directory created
- [ ] Temp directory created
- [ ] Permissions set

---

### 5️⃣ Update Environment Variables (5 minutes)
```bash
nano /var/www/social-downloader/services/api/.env
```

Add/update these variables:
```bash
DOWNLOAD_TEMP_ROOT=/var/www/social-downloader/tmp
LOG_DIRECTORY=/var/www/social-downloader/logs
MAX_DOWNLOAD_BYTES=262144000
DOWNLOAD_TIMEOUT_SECONDS=300
SOCKET_TIMEOUT_SECONDS=20
YT_DLP_TIMEOUT_SECONDS=240
RATE_LIMIT_METADATA=60
RATE_LIMIT_DOWNLOAD=20
ENABLE_USER_AGENT_VALIDATION=true
ENABLE_REFERER_VALIDATION=false
CORS_ORIGINS=https://reelsave.me,https://www.reelsave.me
ALLOWED_REFERERS=https://reelsave.me,https://www.reelsave.me
```

- [ ] All variables added/updated
- [ ] File saved

---

### 6️⃣ Test API Locally (3 minutes)
```bash
cd /var/www/social-downloader/services/api
source .venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

In another terminal:
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{"status":"ok","yt_dlp_available":true,"ffmpeg_available":true,"max_download_mb":250}
```

- [ ] API starts without errors
- [ ] Health endpoint responds correctly
- [ ] Stopped test server (Ctrl+C)

---

### 7️⃣ Update Nginx Configuration (5 minutes)
```bash
cp /etc/nginx/sites-available/api.reelsave.me /etc/nginx/sites-available/api.reelsave.me.backup
nano /etc/nginx/sites-available/api.reelsave.me
```

**Key sections to add/verify:**

Rate limiting zones (add at top, outside server block):
```nginx
limit_req_zone $binary_remote_addr zone=metadata_limit:10m rate=60r/h;
limit_req_zone $binary_remote_addr zone=download_limit:10m rate=20r/h;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/m;
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
```

In server block:
```nginx
# Connection limits
limit_conn conn_limit 5;

# Security headers
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Request size limits
client_max_body_size 1M;
client_body_timeout 30s;
send_timeout 300s;
```

For /api/metadata location:
```nginx
limit_req zone=metadata_limit burst=5 nodelay;
```

For /api/download location:
```nginx
limit_req zone=download_limit burst=2 nodelay;
```

```bash
# Test configuration
nginx -t
```

- [ ] Nginx config updated
- [ ] nginx -t shows OK
- [ ] Backup created

---

### 8️⃣ Restart Services (2 minutes)
```bash
# Reload nginx
systemctl reload nginx

# Restart API
systemctl restart social-downloader-api

# Check status
systemctl status social-downloader-api
```

- [ ] Nginx reloaded successfully
- [ ] API service restarted
- [ ] Service status shows "active (running)"

---

### 9️⃣ Verify Production Deployment (5 minutes)

**Test 1: Health Check**
```bash
curl https://api.reelsave.me/health
```
Expected: Status 200, JSON response with `"status":"ok"`

**Test 2: Rate Limit Headers**
```bash
curl -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' \
  -I
```
Expected: See `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers

**Test 3: Bot Protection**
```bash
curl -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```
Expected: Status 403, "Automated requests are not permitted"

**Test 4: Real Browser Request from Frontend**
- Go to https://reelsave.me
- Try to download a video
- Should work normally

- [ ] Health check works
- [ ] Rate limit headers present
- [ ] Bot protection blocks curl
- [ ] Frontend still works normally

---

### 🔟 Setup Log Rotation (3 minutes)
```bash
nano /etc/logrotate.d/social-downloader
```

Add:
```
/var/www/social-downloader/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    create 0644 www-data www-data
    sharedscripts
    postrotate
        systemctl reload social-downloader-api > /dev/null 2>&1 || true
    endscript
}
```

Test:
```bash
logrotate -d /etc/logrotate.d/social-downloader
```

- [ ] Logrotate config created
- [ ] Test shows no errors

---

### 1️⃣1️⃣ Setup Temp File Cleanup Cron (2 minutes)
```bash
crontab -e
```

Add:
```bash
# Clean up old temp files daily at 3 AM
0 3 * * * find /var/www/social-downloader/tmp -type d -name "socialdl-*" -mtime +1 -exec rm -rf {} + 2>/dev/null
```

- [ ] Cron job added
- [ ] Crontab saved

---

### 1️⃣2️⃣ Monitor Logs (5 minutes)
```bash
# Watch API logs
tail -f /var/www/social-downloader/logs/api.log

# Watch nginx access logs
tail -f /var/log/nginx/api.reelsave.me.access.log
```

- [ ] Logs are being written
- [ ] No error messages appearing
- [ ] Requests are being logged with proper JSON structure

---

## Post-Deployment Monitoring (First 24 Hours)

### Immediate (First Hour)
- [ ] Monitor logs for errors: `tail -f /var/www/social-downloader/logs/api.log`
- [ ] Check server resources: `htop`
- [ ] Test several downloads from frontend
- [ ] Verify rate limiting kicks in after exceeding limits

### First Day
- [ ] Check for any user complaints
- [ ] Review rate limit hit frequency
- [ ] Check disk usage: `df -h`
- [ ] Review temp directory: `ls -la /var/www/social-downloader/tmp`

### Analysis Commands
```bash
# Count total requests today
grep $(date +%Y-%m-%d) /var/www/social-downloader/logs/api.log | wc -l

# Count rate limit hits
grep "rate_limited" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d) | wc -l

# Count bot blocks
grep "blocked" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d) | wc -l

# Most active IPs
grep $(date +%Y-%m-%d) /var/www/social-downloader/logs/api.log | jq -r '.client_ip' | sort | uniq -c | sort -rn | head -10

# Check disk usage
du -sh /var/www/social-downloader/tmp
du -sh /var/www/social-downloader/logs
```

---

## Rollback Procedure (If Issues Occur)

```bash
# Stop API
systemctl stop social-downloader-api

# Restore code
cd /var/www/social-downloader/services/api
rm -rf app
mv app.backup.YYYYMMDD app

# Restore requirements
cp requirements.txt.backup requirements.txt
source .venv/bin/activate
pip install -r requirements.txt

# Restore .env
cp .env.backup .env

# Restore nginx
cp /etc/nginx/sites-available/api.reelsave.me.backup /etc/nginx/sites-available/api.reelsave.me
nginx -t && systemctl reload nginx

# Restart API
systemctl start social-downloader-api
```

- [ ] Services restored
- [ ] Frontend working again

---

## Success Criteria

✅ **Deployment is successful if:**
- Health endpoint responds correctly
- Frontend can download videos normally
- Rate limiting works (test by making >20 downloads/hour)
- Bot requests are blocked (curl returns 403)
- Logs are being written
- No error messages in logs
- Server resources are stable

❌ **Rollback if:**
- Frontend users cannot download videos
- 5xx errors appearing frequently
- Server becomes unresponsive
- Memory/CPU usage spikes abnormally

---

## Troubleshooting Quick Reference

### Issue: API won't start
```bash
# Check service logs
journalctl -u social-downloader-api -n 50

# Check for Python errors
cd /var/www/social-downloader/services/api
source .venv/bin/activate
python -c "from app.main import app"
```

### Issue: Rate limiting not working
```bash
# Check nginx config
nginx -t

# Verify IP detection in logs
grep "client_ip" /var/www/social-downloader/logs/api.log | tail -5
```

### Issue: Legitimate users blocked
```bash
# Temporarily disable User-Agent validation
nano /var/www/social-downloader/services/api/.env
# Set: ENABLE_USER_AGENT_VALIDATION=false
systemctl restart social-downloader-api
```

### Issue: Logs not appearing
```bash
# Check directory permissions
ls -la /var/www/social-downloader/logs

# Check if directory exists and is writable
sudo -u www-data touch /var/www/social-downloader/logs/test.txt
```

---

## Support Resources

- **Deployment Guide**: `SECURITY-DEPLOYMENT.md`
- **Protection Details**: `PROTECTION-SUMMARY.md`
- **Nginx Config**: `nginx-production.conf`
- **API Logs**: `/var/www/social-downloader/logs/api.log`
- **Nginx Logs**: `/var/log/nginx/api.reelsave.me.error.log`

---

## Final Checklist

- [ ] All deployment steps completed
- [ ] All tests passed
- [ ] Logs are being written
- [ ] Frontend works normally
- [ ] Rate limiting active
- [ ] Bot protection active
- [ ] Log rotation configured
- [ ] Cleanup cron configured
- [ ] Monitoring setup complete

**Deployment Time**: ________  
**Deployed By**: ________  
**Issues Encountered**: ________

---

## What's Next?

### Week 1
- Monitor logs daily
- Adjust rate limits if needed
- Watch for abuse patterns

### Month 1
- Review disk usage trends
- Consider adjusting timeouts based on user feedback
- Update yt-dlp: `pip install -U yt-dlp`

### Ongoing
- Keep Ubuntu updated
- Monitor server resources
- Review security patches
- Adjust protections based on abuse patterns

---

**Deployment Status**: 🟢 Ready | 🟡 In Progress | 🔴 Issues

**Last Updated**: June 12, 2026
