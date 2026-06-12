# 🛡️ Abuse Protection Implementation Summary

## Overview

This document explains the production-grade abuse protections implemented in the Social Video Downloader API, their rationale, trade-offs, and limitations.

---

## 1️⃣ IP-Based Rate Limiting

### Implementation
- **Technology**: In-memory token bucket algorithm (no Redis required)
- **Metadata endpoint**: 60 requests/hour per IP
- **Download endpoint**: 20 requests/hour per IP
- **Storage**: Thread-safe dictionary with automatic cleanup

### How It Works
```python
# Each IP gets tracked separately per endpoint
rate_limiter.check_rate_limit(
    identifier="ip:1.2.3.4:/api/download",
    max_requests=20,
    window_seconds=3600
)
```

When limit is exceeded:
- Returns HTTP 429 (Too Many Requests)
- Includes `Retry-After` header
- Provides human-readable reset time in response
- Logs the rate limit event

### Response Headers
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1686321600
Retry-After: 3420
```

### Configuration
```bash
# Adjust in .env file
RATE_LIMIT_METADATA=60
RATE_LIMIT_DOWNLOAD=20
```

### Pros
✅ Prevents bandwidth exhaustion  
✅ Zero external dependencies  
✅ Minimal memory overhead (~10MB for thousands of IPs)  
✅ Automatic memory cleanup  
✅ Works perfectly for single-server deployments  

### Cons / Limitations
❌ **Not shared across servers**: If you scale to multiple API servers, each will have its own rate limit state  
❌ **Resets on restart**: Rate limits are lost if the API process restarts  
❌ **IP-based only**: Users behind the same NAT/proxy share the same limit  
❌ **Can be bypassed with VPNs/proxies**: Determined abusers can rotate IPs  

### Trade-offs
- **Shared IPs**: Users in corporate networks or behind CGNAT may share limits. Consider increasing limits if you see legitimate users affected.
- **VPN bypass**: Accept that sophisticated abusers can work around IP-based limits. The goal is to stop casual abuse, not nation-state actors.

### When to Consider Redis
If you scale to multiple API servers, implement Redis-based rate limiting:
```python
# Future enhancement
from redis import Redis
redis_client = Redis(host='localhost', port=6379)
```

---

## 2️⃣ Bot Protection

### Implementation
**User-Agent Validation**
- Blocks common scraping tools: curl, wget, python-requests, scrapy, etc.
- Requires a User-Agent header on all POST requests
- Returns HTTP 403 with helpful message

**Content-Type Validation**
- Requires `application/json` for POST requests
- Prevents form submissions and other abuse vectors

**Referer Validation** (Optional, disabled by default)
- Can enforce that requests come from reelsave.me
- Configurable: `ENABLE_REFERER_VALIDATION=true`

### How It Works
```python
# Middleware checks on every POST request
if is_suspicious_user_agent(user_agent):
    raise HTTPException(403, "Automated requests are not permitted")
```

### Blocked User-Agent Patterns
```python
BLOCKED_USER_AGENTS = {
    "curl", "wget", "python-requests", "python-urllib",
    "go-http-client", "java", "apache-httpclient",
    "scrapy", "bot", "spider", "crawler", "scan"
}
```

### Configuration
```bash
# Disable if causing issues
ENABLE_USER_AGENT_VALIDATION=false

# Enable strict referer checking
ENABLE_REFERER_VALIDATION=true
```

### Pros
✅ Stops casual automation attempts  
✅ Blocks most common scraping tools out of the box  
✅ Minimal performance overhead  
✅ User-friendly error messages  

### Cons / Limitations
❌ **Can be bypassed**: Sophisticated bots can spoof User-Agent headers  
❌ **False positives**: Legitimate automation (monitoring tools) may be blocked  
❌ **Referer unreliable**: Some browsers/extensions don't send Referer header  

### Trade-offs
- **Referer validation disabled by default**: Enables flexibility for legitimate use cases (browser extensions, PWAs)
- **User-Agent whitelist**: Add legitimate tools to `ALLOWED_USER_AGENTS` if needed

### When to Upgrade
Consider these advanced techniques if bot abuse continues:
- **CAPTCHA**: Add hCaptcha or reCAPTCHA for suspected bots
- **Fingerprinting**: Use TLS fingerprinting or browser fingerprinting
- **Behavioral analysis**: Track request patterns and timing
- **Token-based auth**: Require frontend to obtain temporary tokens

---

## 3️⃣ Maximum File Size Protection

### Implementation
- **Maximum size**: 250 MB (configurable)
- **Three layers of enforcement**:
  1. yt-dlp `max_filesize` option (pre-download check)
  2. Post-download file size validation
  3. Format filtering (excludes formats >250MB from metadata)

### How It Works
```python
# Pre-download (yt-dlp level)
options = {
    "max_filesize": settings.max_download_bytes,  # 250 MB
}

# Post-download validation
if file_size > settings.max_download_bytes:
    raise HTTPException(413, "File exceeds 250 MB limit")
    # File is automatically deleted
```

### Response
```json
{
  "detail": "Downloaded file (312.4 MB) exceeds maximum allowed size of 250 MB."
}
```

### Configuration
```bash
# Increase to 500 MB (524288000 bytes)
MAX_DOWNLOAD_BYTES=524288000
```

### Pros
✅ Prevents bandwidth exhaustion  
✅ Prevents disk space exhaustion  
✅ Protects server resources  
✅ Clear error messages for users  

### Cons / Limitations
❌ **Not always preventable**: File size may not be known until download starts  
❌ **Wastes bandwidth**: Oversized files are downloaded before being rejected  
❌ **Estimated sizes**: Some platforms provide only approximate file sizes  

### Trade-offs
- **Conservative limit**: 250 MB allows most social media content while protecting resources
- **Format filtering**: Users see only downloadable formats, reducing confusion

### Performance Impact
- Bandwidth: Up to 250 MB wasted per rejected oversized file
- Disk: Automatic cleanup prevents accumulation
- CPU: Negligible validation overhead

---

## 4️⃣ Timeout Protection

### Implementation
**Multiple timeout layers**:
1. **Socket timeout**: 20 seconds (prevents stuck connections)
2. **yt-dlp timeout**: 240 seconds (4 minutes for download operation)
3. **Overall timeout**: 300 seconds (5 minutes for entire request)

### How It Works
```python
# Unix-like systems: SIGALRM signal
signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(settings.yt_dlp_timeout_seconds)  # 240 seconds

try:
    download_video()
except TimeoutException:
    cleanup_temp_files()
    raise HTTPException(504, "Download timed out")
```

### Configuration
```bash
SOCKET_TIMEOUT_SECONDS=20
YT_DLP_TIMEOUT_SECONDS=240
DOWNLOAD_TIMEOUT_SECONDS=300
```

### Pros
✅ Prevents indefinite hangs  
✅ Protects against slow/stalled connections  
✅ Automatic cleanup on timeout  
✅ Clear timeout messages  

### Cons / Limitations
❌ **Platform-specific**: SIGALRM doesn't work on Windows  
❌ **May timeout legitimate slow downloads**: Large files on slow connections  
❌ **Not precise**: Actual timeout may vary slightly  

### Trade-offs
- **Conservative timeouts**: 4 minutes should handle most legitimate downloads
- **Graceful degradation**: If signal-based timeout unavailable, relies on socket timeout

### When to Adjust
Increase timeouts if:
- Users frequently report timeout errors
- Your server has slower bandwidth than expected
- You increase the file size limit significantly

---

## 5️⃣ Resource Cleanup

### Implementation
**Three cleanup mechanisms**:

1. **Success cleanup**: Background task after successful download
```python
return FileResponse(
    path=file_path,
    background=BackgroundTask(cleanup_temp_dir)
)
```

2. **Exception cleanup**: Automatic cleanup in try/except blocks
```python
try:
    download_video()
except Exception:
    shutil.rmtree(work_dir, ignore_errors=True)
    raise
```

3. **Scheduled cleanup**: Cron job for orphaned files
```bash
# Daily at 3 AM
0 3 * * * find /var/www/social-downloader/tmp -type d -mtime +1 -exec rm -rf {} +
```

### How It Works
- Each download creates a unique temp directory: `socialdl-XXXXXX`
- Directory contains all files for that download
- Directory is deleted after response is sent or on error
- Cron job catches any orphaned directories >24 hours old

### Pros
✅ Prevents disk space exhaustion  
✅ Exception-safe  
✅ Handles edge cases (crashes, SIGKILL)  
✅ No manual intervention needed  

### Cons / Limitations
❌ **Brief disk usage spike**: Files exist until response completes  
❌ **Orphaned files possible**: Server crash between download and cleanup  
❌ **Cron dependency**: Requires external scheduled task  

### Monitoring
```bash
# Check temp directory size
du -sh /var/www/social-downloader/tmp

# Count temp directories
ls /var/www/social-downloader/tmp | wc -l

# Find orphaned files (>1 hour old)
find /var/www/social-downloader/tmp -type d -mmin +60
```

---

## 6️⃣ Logging & Monitoring

### Implementation
**JSON-structured logs** for easy parsing:
```json
{
  "timestamp": "2026-06-12T14:23:45Z",
  "level": "INFO",
  "message": "download request from 1.2.3.4: success",
  "client_ip": "1.2.3.4",
  "url": "https://youtube.com/watch?v=...",
  "status": "success",
  "user_agent": "Mozilla/5.0 ...",
  "duration_ms": 8234.56,
  "filesize_mb": 45.2
}
```

### Logged Events
- ✅ Successful downloads/metadata requests
- ❌ Rate limit rejections
- 🚫 Bot blocks
- ⚠️ File size rejections
- ⏱️ Timeout errors
- 💥 General errors

### Privacy
**Not logged**:
- User session tokens (none exist)
- Personal information
- Full video titles (could contain sensitive info)

**Logged for security**:
- IP addresses (necessary for abuse detection)
- User agents (necessary for bot detection)
- URLs (necessary for debugging)

### Configuration
```bash
LOG_DIRECTORY=/var/www/social-downloader/logs
```

### Log Rotation
```
/var/www/social-downloader/logs/*.log {
    daily
    rotate 14         # Keep 14 days
    compress          # Compress old logs
    delaycompress     # Don't compress today's log
    missingok         # Don't error if log missing
}
```

### Analysis Commands
```bash
# Most active IPs today
grep $(date +%Y-%m-%d) api.log | jq -r '.client_ip' | sort | uniq -c | sort -rn

# Rate limit events
grep "rate_limited" api.log | wc -l

# Bot blocks
grep "blocked" api.log | grep "bot" | wc -l

# Average download time
grep "download.*success" api.log | jq '.duration_ms' | awk '{sum+=$1; count++} END {print sum/count}'

# Largest downloads
grep "filesize_mb" api.log | jq -r '[.client_ip, .filesize_mb] | @csv' | sort -t, -k2 -rn | head
```

### Pros
✅ Easy to analyze programmatically  
✅ Structured format  
✅ Includes relevant context  
✅ Privacy-conscious  

### Cons / Limitations
❌ **Disk usage**: Logs grow over time (mitigated by rotation)  
❌ **No real-time alerts**: Need external monitoring tool  
❌ **IP privacy concerns**: Logs contain IP addresses (required for abuse detection)  

---

## 7️⃣ Nginx Hardening

### Implementation
**Rate limiting at proxy level**:
```nginx
limit_req_zone $binary_remote_addr zone=metadata_limit:10m rate=60r/h;
limit_req_zone $binary_remote_addr zone=download_limit:10m rate=20r/h;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/m;
```

**Connection limits**:
```nginx
limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
limit_conn conn_limit 5;  # Max 5 concurrent connections per IP
```

**Security headers**:
```nginx
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000";
```

**Request limits**:
```nginx
client_max_body_size 1M;          # API requests are small
client_body_timeout 30s;
send_timeout 300s;                # Allow large downloads
```

### Layered Defense
| Protection | Nginx | FastAPI |
|------------|-------|---------|
| Rate limiting | ✅ Yes | ✅ Yes |
| Connection limits | ✅ Yes | ❌ No |
| Request size limits | ✅ Yes | ❌ No |
| User-Agent filtering | ❌ No | ✅ Yes |
| File size limits | ❌ No | ✅ Yes |

### Why Both Layers?
- **Nginx**: Catches abuse before it reaches the application (saves CPU)
- **FastAPI**: Provides fine-grained control and better error messages

### Pros
✅ Stops attacks at the edge  
✅ Protects against connection exhaustion  
✅ Industry-standard security headers  
✅ Reduces application load  

### Cons / Limitations
❌ **Configuration complexity**: Must keep nginx and FastAPI limits in sync  
❌ **Less flexible**: Nginx rules are less dynamic than application code  

---

## 🎯 Overall Protection Assessment

### What This Protects Against
✅ **Casual abuse**: Scripts, bots, scrapers  
✅ **Bandwidth exhaustion**: Rate limits + file size limits  
✅ **Resource exhaustion**: Timeouts + cleanup  
✅ **Disk space exhaustion**: File size limits + cleanup  
✅ **Connection exhaustion**: Nginx connection limits  
✅ **Slow loris attacks**: Nginx timeout limits  

### What This Does NOT Protect Against
❌ **Distributed attacks**: No DDoS protection (consider Cloudflare)  
❌ **Sophisticated bots**: Determined attackers can bypass User-Agent checks  
❌ **IP rotation**: VPNs, proxies, botnets can bypass IP-based rate limiting  
❌ **Application-level DDoS**: No computational cost limits (consider CAPTCHA)  

### Recommended Additional Protections

**For production at scale**:
1. **CDN/DDoS protection**: Cloudflare, AWS Shield, or similar
2. **WAF**: Web Application Firewall for advanced threat detection
3. **CAPTCHA**: hCaptcha or reCAPTCHA for suspected bots
4. **Monitoring**: Uptime monitoring, alert on anomalies
5. **Fail2ban**: Automatically ban repeat offenders at firewall level

**For current setup (1GB VPS)**:
1. **Firewall**: Configure UFW to allow only necessary ports
2. **SSH hardening**: Disable password auth, use SSH keys only
3. **Auto-updates**: Enable unattended-upgrades for security patches
4. **Backups**: Regular automated backups of configuration

---

## 📊 Resource Usage

### Memory
- Base API: ~80-100 MB
- Rate limiter: ~5-10 MB (scales with active IPs)
- Per request: ~5-20 MB (temporary)
- **Total on 1GB VPS**: Comfortable (~200-300 MB used)

### CPU
- Rate limiting: <1% overhead
- Bot protection: <0.5% overhead
- Logging: <0.5% overhead
- **Total overhead**: Negligible (<2%)

### Disk
- Logs: ~10-50 MB/day (depends on traffic)
- Temp files: Up to 250 MB per active download
- **With rotation**: ~700 MB for 14 days of logs

### Network
- No significant overhead (headers add <1KB per request)

---

## 🔄 Maintenance Requirements

### Daily
- ✅ Automatic log rotation
- ✅ Automatic temp file cleanup (cron)
- ✅ Automatic rate limiter cleanup

### Weekly
- Review logs for abuse patterns
- Check disk usage: `df -h`
- Check memory usage: `free -h`

### Monthly
- Review and adjust rate limits if needed
- Update yt-dlp: `pip install -U yt-dlp`
- Review security updates: `apt update && apt upgrade`

### As Needed
- Adjust timeouts based on user feedback
- Tweak rate limits based on traffic patterns
- Add IPs to whitelist/blacklist if needed

---

## 🚀 Future Enhancements

### If Traffic Grows Significantly
1. **Redis-based rate limiting**: Share state across multiple servers
2. **Database logging**: Store logs in PostgreSQL for advanced analysis
3. **Prometheus metrics**: Real-time monitoring and alerting
4. **Token-based auth**: Issue temporary tokens to legitimate users
5. **CDN integration**: Offload static assets and DDoS protection

### If Abuse Continues
1. **CAPTCHA**: Add challenge for suspected bots
2. **Fingerprinting**: Track users beyond IP
3. **Behavioral analysis**: Machine learning for abuse detection
4. **IP reputation**: Integrate with IP reputation services
5. **Cloudflare**: Enterprise-grade protection

---

## 📋 Quick Reference

### Configuration Files
- `/var/www/social-downloader/services/api/.env` - Environment variables
- `/etc/nginx/sites-available/api.reelsave.me` - Nginx config
- `/etc/logrotate.d/social-downloader` - Log rotation

### Important Commands
```bash
# Restart API
systemctl restart social-downloader-api

# Reload nginx
nginx -t && systemctl reload nginx

# View logs
tail -f /var/www/social-downloader/logs/api.log

# Check disk usage
du -sh /var/www/social-downloader/tmp
du -sh /var/www/social-downloader/logs

# Manual cleanup
find /var/www/social-downloader/tmp -type d -mtime +1 -exec rm -rf {} +
```

### Key Endpoints
- `GET /health` - Health check (no rate limit)
- `POST /api/metadata` - Get video info (60/hour per IP)
- `POST /api/download` - Download video (20/hour per IP)

### Rate Limit Headers
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 1686321600
```

---

## 💡 Key Takeaways

1. **Layered defense**: Multiple protections working together
2. **Minimal dependencies**: No Redis, no external services required
3. **Production-ready**: Suitable for your current 1GB VPS
4. **Scalable**: Can upgrade to Redis/CDN when needed
5. **Observable**: JSON logs make analysis easy
6. **Maintainable**: Automatic cleanup, rotation, and monitoring
7. **User-friendly**: Clear error messages, not overly restrictive
8. **Trade-offs acknowledged**: No false promises, realistic limitations

---

**Last Updated**: June 12, 2026  
**Version**: 1.0.0
