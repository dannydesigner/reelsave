# 🔒 Security & Abuse Protection Deployment Guide

## Overview

This document provides step-by-step instructions for deploying production-grade abuse protection to your Social Video Downloader API on DigitalOcean VPS (Ubuntu 24.04).

## 🛡️ Implemented Protections

### 1. **IP-Based Rate Limiting**
- **Metadata endpoint**: 60 requests/hour per IP
- **Download endpoint**: 20 requests/hour per IP
- In-memory implementation (no Redis required)
- Returns HTTP 429 with clear retry information
- Automatic memory cleanup to prevent bloat

### 2. **Bot Protection**
- Blocks suspicious User-Agent headers
- Rejects common scrapers (curl, wget, python-requests, etc.)
- Optional referer validation (disabled by default for flexibility)
- Content-Type validation for POST requests

### 3. **File Size Protection**
- Maximum file size: 250 MB (configurable)
- Pre-download size validation when possible
- Post-download size enforcement
- Automatic cleanup of oversized files
- Returns HTTP 413 with clear error messages

### 4. **Timeout Protection**
- Socket timeout: 20 seconds
- yt-dlp operation timeout: 240 seconds (4 minutes)
- Overall download timeout: 300 seconds (5 minutes)
- Prevents indefinite hangs

### 5. **Resource Cleanup**
- Guaranteed temp file cleanup on success
- Exception-safe cleanup on failures
- Background cleanup tasks
- Automatic cleanup of orphaned files

### 6. **Logging & Monitoring**
- JSON-structured logs
- Tracks: IP, timestamp, URL, status, rejection reasons
- No sensitive user data logged
- File and console output

### 7. **Nginx Hardening**
- Proxy-level rate limiting
- Request size limits
- Security headers
- Connection limits (5 per IP)
- TLS/SSL configuration

## 📦 Prerequisites

- Ubuntu 24.04 server
- Python 3.10+
- Nginx installed
- SSL certificate (Let's Encrypt)
- Root or sudo access

## 🚀 Deployment Steps

### Step 1: Backup Current Configuration

```bash
# SSH into your server
ssh root@your-server-ip

# Navigate to API directory
cd /var/www/social-downloader/services/api

# Backup current code
cp -r app app.backup.$(date +%Y%m%d)
cp requirements.txt requirements.txt.backup
cp .env .env.backup
```

### Step 2: Update Dependencies

```bash
# Activate virtual environment
source .venv/bin/activate

# Update requirements.txt with new dependencies
# (Upload the updated requirements.txt file)

# Install new dependencies
pip install -r requirements.txt --upgrade
```

### Step 3: Deploy New Code Files

Upload the following new files to `/var/www/social-downloader/services/api/app/`:
- `rate_limiter.py`
- `bot_protection.py`
- `logging_config.py`

Update existing files:
- `config.py`
- `main.py`
- `downloader.py`

```bash
# Set proper permissions
chown -R www-data:www-data /var/www/social-downloader
chmod -R 755 /var/www/social-downloader
```

### Step 4: Create Required Directories

```bash
# Create log directory
mkdir -p /var/www/social-downloader/logs
chown www-data:www-data /var/www/social-downloader/logs
chmod 755 /var/www/social-downloader/logs

# Ensure temp directory exists
mkdir -p /var/www/social-downloader/tmp
chown www-data:www-data /var/www/social-downloader/tmp
chmod 755 /var/www/social-downloader/tmp
```

### Step 5: Update Environment Variables

```bash
# Edit .env file
nano /var/www/social-downloader/services/api/.env
```

Add the following configuration:

```bash
# File Storage
DOWNLOAD_TEMP_ROOT=/var/www/social-downloader/tmp
LOG_DIRECTORY=/var/www/social-downloader/logs

# Download Limits
MAX_DOWNLOAD_BYTES=262144000

# Timeout Settings
DOWNLOAD_TIMEOUT_SECONDS=300
SOCKET_TIMEOUT_SECONDS=20
YT_DLP_TIMEOUT_SECONDS=240

# Rate Limiting (requests per hour per IP)
RATE_LIMIT_METADATA=60
RATE_LIMIT_DOWNLOAD=20

# Bot Protection
ENABLE_USER_AGENT_VALIDATION=true
ENABLE_REFERER_VALIDATION=false

# CORS and Referers
CORS_ORIGINS=https://reelsave.me,https://www.reelsave.me
ALLOWED_REFERERS=https://reelsave.me,https://www.reelsave.me
```

### Step 6: Test the API Locally

```bash
# Test that the API starts without errors
cd /var/www/social-downloader/services/api
source .venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001

# In another terminal, test the health endpoint
curl http://localhost:8001/health

# If successful, stop the test server (Ctrl+C)
```

### Step 7: Update Nginx Configuration

```bash
# Backup current nginx config
cp /etc/nginx/sites-available/api.reelsave.me /etc/nginx/sites-available/api.reelsave.me.backup

# Edit nginx configuration
nano /etc/nginx/sites-available/api.reelsave.me
```

Replace or update with the production configuration from `nginx-production.conf`.

Key sections to verify:
- Rate limiting zones
- Connection limits
- Security headers
- Timeout settings
- SSL configuration

```bash
# Test nginx configuration
nginx -t

# If test passes, reload nginx
systemctl reload nginx
```

### Step 8: Restart the API Service

```bash
# If using systemd service
systemctl restart social-downloader-api

# Or if using supervisor
supervisorctl restart social-downloader-api

# Verify it's running
systemctl status social-downloader-api

# Check logs for any errors
tail -f /var/www/social-downloader/logs/api.log
```

### Step 9: Verify Deployment

#### Test Health Endpoint
```bash
curl https://api.reelsave.me/health
# Expected: {"status":"ok","yt_dlp_available":true,"ffmpeg_available":true,"max_download_mb":250}
```

#### Test Rate Limiting
```bash
# Test metadata endpoint (should work)
curl -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Check rate limit headers in response
# Should see: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
```

#### Test Bot Protection
```bash
# This should be blocked (curl user agent)
curl -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Expected: {"detail":"Automated requests are not permitted..."}
```

#### Test File Size Protection
```bash
# Test with a known large video
curl -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"url":"https://www.youtube.com/watch?v=LARGE_VIDEO_ID"}'

# Formats over 250MB should be filtered out
```

### Step 10: Monitor Logs

```bash
# Watch API logs in real-time
tail -f /var/www/social-downloader/logs/api.log

# Watch nginx access logs
tail -f /var/log/nginx/api.reelsave.me.access.log

# Watch nginx error logs
tail -f /var/log/nginx/api.reelsave.me.error.log
```

## 📊 Log Rotation Setup

To prevent log files from consuming too much disk space:

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/social-downloader
```

Add the following:

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

Test log rotation:
```bash
logrotate -d /etc/logrotate.d/social-downloader
```

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor

1. **Rate Limit Hits**: Check logs for `rate_limited` status
2. **Bot Blocks**: Check logs for `blocked` status with bot-related reasons
3. **File Size Rejections**: Check logs for HTTP 413 errors
4. **Timeout Events**: Check logs for HTTP 504 errors
5. **Disk Usage**: Monitor `/var/www/social-downloader/tmp` for orphaned files
6. **Memory Usage**: Monitor server RAM (rate limiter uses minimal memory)

### Sample Log Analysis Commands

```bash
# Count rate limit events today
grep "rate_limited" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d) | wc -l

# Find most active IPs
grep "client_ip" /var/www/social-downloader/logs/api.log | jq -r '.client_ip' | sort | uniq -c | sort -rn | head -10

# Count bot blocks
grep "blocked" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d) | wc -l

# Check for file size rejections
grep "413" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d)
```

## 🔧 Configuration Tuning

### Adjusting Rate Limits

If you need to adjust rate limits based on traffic patterns:

```bash
# Edit .env file
nano /var/www/social-downloader/services/api/.env

# Modify these values:
RATE_LIMIT_METADATA=60  # Increase/decrease as needed
RATE_LIMIT_DOWNLOAD=20  # Increase/decrease as needed

# Restart API
systemctl restart social-downloader-api
```

### Enabling Strict Referer Validation

To enforce that only requests from reelsave.me are allowed:

```bash
# Edit .env file
nano /var/www/social-downloader/services/api/.env

# Change this:
ENABLE_REFERER_VALIDATION=true

# Restart API
systemctl restart social-downloader-api
```

**Warning**: Enabling strict referer validation may block legitimate users if their browser doesn't send the Referer header.

### Adjusting File Size Limits

```bash
# Edit .env file
nano /var/www/social-downloader/services/api/.env

# Change (e.g., to 500 MB = 524288000 bytes):
MAX_DOWNLOAD_BYTES=524288000

# Also update nginx client_max_body_size if needed
# (though this is for request bodies, not responses)

# Restart API
systemctl restart social-downloader-api
```

## 🚨 Troubleshooting

### Issue: Rate Limiting Not Working

**Check:**
1. Verify nginx is passing `X-Forwarded-For` or `X-Real-IP` headers
2. Check logs to see what IP is being detected
3. Ensure rate limiter middleware is active

```bash
# Test IP detection
curl -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' \
  -v 2>&1 | grep "X-RateLimit"
```

### Issue: Legitimate Users Being Blocked

**Solution:**
1. Check logs to identify the rejection reason
2. If it's User-Agent blocking, consider temporarily disabling: `ENABLE_USER_AGENT_VALIDATION=false`
3. Add legitimate automation tools to `ALLOWED_USER_AGENTS` in `bot_protection.py`

### Issue: Downloads Timing Out

**Adjust timeouts:**
```bash
# Increase timeouts in .env
YT_DLP_TIMEOUT_SECONDS=360  # 6 minutes
DOWNLOAD_TIMEOUT_SECONDS=420  # 7 minutes

# Also increase nginx timeouts in /etc/nginx/sites-available/api.reelsave.me
proxy_read_timeout 420s;
send_timeout 420s;
```

### Issue: Temp Files Not Being Cleaned Up

**Check:**
1. Verify temp directory permissions: `ls -la /var/www/social-downloader/tmp`
2. Manually clean old files: `find /var/www/social-downloader/tmp -type d -mtime +1 -exec rm -rf {} +`
3. Set up cron job for cleanup:

```bash
# Add to crontab
crontab -e

# Add this line (runs daily at 3 AM):
0 3 * * * find /var/www/social-downloader/tmp -type d -name "socialdl-*" -mtime +1 -exec rm -rf {} + 2>/dev/null
```

### Issue: High Memory Usage

**Check rate limiter stats:**
```python
# Add a debug endpoint to main.py temporarily
@app.get("/debug/stats")
def debug_stats():
    from .rate_limiter import rate_limiter
    return rate_limiter.get_stats()
```

Visit `https://api.reelsave.me/debug/stats` to see active IPs and memory usage.

## 🔐 Security Hardening Checklist

- [x] Rate limiting enabled (application + nginx)
- [x] Bot protection active
- [x] File size limits enforced
- [x] Timeouts configured
- [x] Resource cleanup implemented
- [x] Structured logging active
- [x] SSL/TLS enabled
- [x] Security headers configured
- [x] Log rotation configured
- [ ] Firewall rules configured (ufw)
- [ ] Fail2ban configured (optional)
- [ ] Monitoring/alerting set up (optional)

## 📈 Performance Impact

### Resource Usage (1GB VPS)

- **Memory**: ~5-10 MB additional for rate limiter (scales with active IPs)
- **CPU**: Negligible (<1% additional)
- **Disk**: Logs grow ~10-50 MB/day (depending on traffic)

### Optimization Tips

1. **Log Rotation**: Keep max 14 days of logs
2. **Rate Limiter Cleanup**: Runs automatically every hour
3. **Temp File Cleanup**: Set up daily cron job
4. **Nginx Caching**: Not recommended for this use case (files are dynamic)

## 🎯 Testing Checklist

Before marking deployment complete:

- [ ] Health endpoint responds correctly
- [ ] Metadata endpoint works with valid User-Agent
- [ ] Download endpoint works with valid User-Agent
- [ ] Rate limiting triggers after exceeding limits
- [ ] Bot requests are blocked (curl, wget, etc.)
- [ ] Oversized files are rejected
- [ ] Logs are being written correctly
- [ ] Temp files are cleaned up after downloads
- [ ] Nginx rate limiting is active
- [ ] SSL certificate is valid
- [ ] Frontend can successfully make requests
- [ ] Error messages are user-friendly

## 📞 Rollback Procedure

If issues occur after deployment:

```bash
# Stop the API service
systemctl stop social-downloader-api

# Restore backup code
cd /var/www/social-downloader/services/api
rm -rf app
mv app.backup.YYYYMMDD app

# Restore old requirements
cp requirements.txt.backup requirements.txt
pip install -r requirements.txt

# Restore old .env
cp .env.backup .env

# Restore old nginx config
cp /etc/nginx/sites-available/api.reelsave.me.backup /etc/nginx/sites-available/api.reelsave.me
nginx -t && systemctl reload nginx

# Restart API service
systemctl start social-downloader-api
```

## 📚 Additional Resources

- [FastAPI Rate Limiting](https://slowapi.readthedocs.io/)
- [Nginx Rate Limiting](https://www.nginx.com/blog/rate-limiting-nginx/)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)
- [Ubuntu Logrotate](https://www.digitalocean.com/community/tutorials/how-to-manage-logfiles-with-logrotate-on-ubuntu-20-04)

## 💡 Support

For issues or questions:
1. Check application logs: `/var/www/social-downloader/logs/api.log`
2. Check nginx logs: `/var/log/nginx/api.reelsave.me.error.log`
3. Review this deployment guide
4. Check FastAPI documentation
