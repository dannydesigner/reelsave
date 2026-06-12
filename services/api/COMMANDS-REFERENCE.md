# 🔧 Command Reference - Quick Copy/Paste Guide

## SSH & Navigation

```bash
# Connect to server
ssh root@your-server-ip

# Navigate to API directory
cd /var/www/social-downloader/services/api
```

---

## Backup Commands

```bash
# Backup application code
cp -r app app.backup.$(date +%Y%m%d)

# Backup requirements
cp requirements.txt requirements.txt.backup

# Backup environment file
cp .env .env.backup

# Backup nginx config
cp /etc/nginx/sites-available/api.reelsave.me /etc/nginx/sites-available/api.reelsave.me.backup
```

---

## File Permissions

```bash
# Set ownership
chown -R www-data:www-data /var/www/social-downloader

# Set permissions
chmod -R 755 /var/www/social-downloader

# Create and set permissions for log directory
mkdir -p /var/www/social-downloader/logs
chown www-data:www-data /var/www/social-downloader/logs
chmod 755 /var/www/social-downloader/logs

# Create and set permissions for temp directory
mkdir -p /var/www/social-downloader/tmp
chown www-data:www-data /var/www/social-downloader/tmp
chmod 755 /var/www/social-downloader/tmp
```

---

## Python Environment

```bash
# Activate virtual environment
cd /var/www/social-downloader/services/api
source .venv/bin/activate

# Install/upgrade dependencies
pip install -r requirements.txt --upgrade

# Test import (check for errors)
python -c "from app.main import app; print('OK')"

# Run local test server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

---

## Service Management

```bash
# Restart API service
systemctl restart social-downloader-api

# Check service status
systemctl status social-downloader-api

# View service logs
journalctl -u social-downloader-api -n 50

# Follow service logs
journalctl -u social-downloader-api -f

# Stop service
systemctl stop social-downloader-api

# Start service
systemctl start social-downloader-api
```

---

## Nginx Commands

```bash
# Test nginx configuration
nginx -t

# Reload nginx (without downtime)
systemctl reload nginx

# Restart nginx
systemctl restart nginx

# Check nginx status
systemctl status nginx

# Edit nginx config
nano /etc/nginx/sites-available/api.reelsave.me
```

---

## Log Management

```bash
# View API logs (last 50 lines)
tail -n 50 /var/www/social-downloader/logs/api.log

# Follow API logs in real-time
tail -f /var/www/social-downloader/logs/api.log

# View nginx access logs
tail -f /var/log/nginx/api.reelsave.me.access.log

# View nginx error logs
tail -f /var/log/nginx/api.reelsave.me.error.log

# Search for errors today
grep "ERROR" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d)

# Count requests today
grep $(date +%Y-%m-%d) /var/www/social-downloader/logs/api.log | wc -l
```

---

## Testing Commands

```bash
# Test health endpoint
curl https://api.reelsave.me/health

# Test with rate limit headers
curl -I -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Test bot blocking (should return 403)
curl -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'

# Test metadata endpoint with browser user-agent
curl -X POST https://api.reelsave.me/api/metadata \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

---

## Monitoring Commands

```bash
# Check disk usage
df -h

# Check specific directory sizes
du -sh /var/www/social-downloader/tmp
du -sh /var/www/social-downloader/logs

# Check memory usage
free -h

# Check CPU and process usage
htop

# Count temp directories
ls /var/www/social-downloader/tmp | wc -l

# Find old temp files (>1 day)
find /var/www/social-downloader/tmp -type d -name "socialdl-*" -mtime +1

# Check total log size
du -sh /var/www/social-downloader/logs/*.log
```

---

## Log Analysis

```bash
# Count rate limit events today
grep "rate_limited" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d) | wc -l

# Count bot blocks today
grep "blocked" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d) | wc -l

# Count successful downloads today
grep "download.*success" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d) | wc -l

# Find most active IPs today (requires jq)
grep $(date +%Y-%m-%d) /var/www/social-downloader/logs/api.log | jq -r '.client_ip' | sort | uniq -c | sort -rn | head -10

# Find largest downloads today
grep "filesize_mb" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d) | jq -r '.filesize_mb' | sort -rn | head -10

# Find all 413 errors (file too large)
grep "413" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d)

# Find all 429 errors (rate limited)
grep "429" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d)

# Find all timeout errors
grep "504" /var/www/social-downloader/logs/api.log | grep $(date +%Y-%m-%d)
```

---

## Environment Configuration

```bash
# Edit environment file
nano /var/www/social-downloader/services/api/.env

# View current environment
cat /var/www/social-downloader/services/api/.env

# Check if environment variables are loaded
cd /var/www/social-downloader/services/api
source .venv/bin/activate
python -c "from app.config import settings; print(f'Rate limit: {settings.rate_limit_download}')"
```

---

## Cron Jobs

```bash
# Edit crontab
crontab -e

# View current crontab
crontab -l

# Add temp file cleanup (paste this line)
0 3 * * * find /var/www/social-downloader/tmp -type d -name "socialdl-*" -mtime +1 -exec rm -rf {} + 2>/dev/null
```

---

## Log Rotation

```bash
# Create logrotate config
nano /etc/logrotate.d/social-downloader

# Test logrotate (dry run)
logrotate -d /etc/logrotate.d/social-downloader

# Force logrotate
logrotate -f /etc/logrotate.d/social-downloader

# View logrotate status
cat /var/lib/logrotate/status
```

---

## Cleanup Commands

```bash
# Manually clean old temp files
find /var/www/social-downloader/tmp -type d -name "socialdl-*" -mtime +1 -exec rm -rf {} +

# Clean old logs manually (keeps last 14 days)
find /var/www/social-downloader/logs -name "*.log.*" -mtime +14 -delete

# Clean all temp directories (emergency cleanup)
rm -rf /var/www/social-downloader/tmp/socialdl-*

# Compress old logs manually
gzip /var/www/social-downloader/logs/api.log.1
```

---

## Rollback Commands

```bash
# Full rollback procedure
systemctl stop social-downloader-api

cd /var/www/social-downloader/services/api
rm -rf app
mv app.backup.YYYYMMDD app  # Replace YYYYMMDD with your backup date

cp requirements.txt.backup requirements.txt
source .venv/bin/activate
pip install -r requirements.txt

cp .env.backup .env

cp /etc/nginx/sites-available/api.reelsave.me.backup /etc/nginx/sites-available/api.reelsave.me
nginx -t && systemctl reload nginx

systemctl start social-downloader-api
systemctl status social-downloader-api
```

---

## Debugging Commands

```bash
# Check if port 8000 is listening
netstat -tlnp | grep 8000

# Check recent system logs
journalctl -n 100

# Check for Python errors in API
cd /var/www/social-downloader/services/api
source .venv/bin/activate
python -m app.main

# Test specific module import
python -c "from app.rate_limiter import rate_limiter; print('Rate limiter OK')"
python -c "from app.bot_protection import validate_user_agent; print('Bot protection OK')"
python -c "from app.logging_config import app_logger; print('Logging OK')"

# Check nginx error log for specific errors
grep "error" /var/log/nginx/api.reelsave.me.error.log | tail -20

# Check if yt-dlp is working
cd /var/www/social-downloader/services/api
source .venv/bin/activate
python -c "import yt_dlp; print(yt_dlp.version.__version__)"
```

---

## Security Checks

```bash
# Check file permissions
ls -la /var/www/social-downloader/services/api/app/
ls -la /var/www/social-downloader/logs/
ls -la /var/www/social-downloader/tmp/

# Check who owns files
stat /var/www/social-downloader/services/api/app/main.py

# Check open ports
netstat -tlnp

# Check firewall status (if using UFW)
ufw status

# Check for security updates
apt list --upgradable
```

---

## Package Management

```bash
# Update system packages
apt update
apt upgrade -y

# Update yt-dlp specifically
cd /var/www/social-downloader/services/api
source .venv/bin/activate
pip install -U yt-dlp

# Check installed Python packages
pip list

# Check for outdated Python packages
pip list --outdated
```

---

## Performance Monitoring

```bash
# Check server load
uptime

# Check memory usage details
free -m

# Check disk I/O
iostat -x 1

# Check network connections
netstat -an | grep :443 | wc -l

# Check top processes by CPU
ps aux --sort=-%cpu | head -10

# Check top processes by memory
ps aux --sort=-%mem | head -10

# Monitor in real-time
watch -n 5 'systemctl status social-downloader-api | grep Active'
```

---

## Quick Diagnostic Script

```bash
# Create diagnostic script
cat > /root/diagnose.sh << 'EOF'
#!/bin/bash
echo "=== Service Status ==="
systemctl status social-downloader-api | grep Active

echo -e "\n=== Disk Usage ==="
df -h | grep -E "Filesystem|/$|/var"

echo -e "\n=== Memory Usage ==="
free -h

echo -e "\n=== Temp Directory ==="
echo "Files: $(ls /var/www/social-downloader/tmp 2>/dev/null | wc -l)"
echo "Size: $(du -sh /var/www/social-downloader/tmp 2>/dev/null | cut -f1)"

echo -e "\n=== Log Directory ==="
echo "Size: $(du -sh /var/www/social-downloader/logs 2>/dev/null | cut -f1)"

echo -e "\n=== Recent Errors ==="
grep "ERROR" /var/www/social-downloader/logs/api.log 2>/dev/null | tail -5

echo -e "\n=== Rate Limits Today ==="
echo "Rate limited: $(grep "rate_limited" /var/www/social-downloader/logs/api.log 2>/dev/null | grep $(date +%Y-%m-%d) | wc -l)"

echo -e "\n=== Bot Blocks Today ==="
echo "Blocked: $(grep "blocked" /var/www/social-downloader/logs/api.log 2>/dev/null | grep $(date +%Y-%m-%d) | wc -l)"

echo -e "\n=== Requests Today ==="
echo "Total: $(grep $(date +%Y-%m-%d) /var/www/social-downloader/logs/api.log 2>/dev/null | wc -l)"
EOF

chmod +x /root/diagnose.sh

# Run diagnostic
/root/diagnose.sh
```

---

## One-Liner Utilities

```bash
# Check if API is responding
curl -s https://api.reelsave.me/health | jq '.status'

# Count active temp directories
find /var/www/social-downloader/tmp -maxdepth 1 -type d -name "socialdl-*" | wc -l

# Get rate limiter stats (if debug endpoint added)
curl -s https://api.reelsave.me/debug/stats | jq .

# Find largest temp directories
du -sh /var/www/social-downloader/tmp/* 2>/dev/null | sort -rh | head -5

# Check nginx rate limit status
grep "limiting requests" /var/log/nginx/api.reelsave.me.error.log | tail -10

# Show last 5 successful downloads
grep "download.*success" /var/www/social-downloader/logs/api.log | tail -5 | jq -r '[.timestamp, .client_ip, .filesize_mb] | @csv'
```

---

## Environment Variables Quick Reference

```bash
# Production .env template
cat > .env.prod.template << 'EOF'
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
EOF
```

---

## SSL/TLS Certificate

```bash
# Renew Let's Encrypt certificate
certbot renew

# Test certificate renewal
certbot renew --dry-run

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/api.reelsave.me/cert.pem -noout -dates
```

---

## Emergency Commands

```bash
# Kill all API processes (emergency)
pkill -f "uvicorn app.main"

# Restart everything (emergency)
systemctl restart nginx
systemctl restart social-downloader-api

# Clear all temp files (emergency)
rm -rf /var/www/social-downloader/tmp/*

# View last 100 system messages
dmesg | tail -100

# Check for out of memory errors
grep -i "out of memory" /var/log/syslog

# Check for disk full errors
grep -i "no space left" /var/log/syslog
```

---

## Helpful Aliases (Optional)

```bash
# Add to ~/.bashrc for convenience
cat >> ~/.bashrc << 'EOF'

# Social Downloader API aliases
alias api-status='systemctl status social-downloader-api'
alias api-restart='systemctl restart social-downloader-api'
alias api-logs='tail -f /var/www/social-downloader/logs/api.log'
alias api-nginx='tail -f /var/log/nginx/api.reelsave.me.access.log'
alias api-cd='cd /var/www/social-downloader/services/api'
alias api-env='cd /var/www/social-downloader/services/api && source .venv/bin/activate'
alias api-diagnose='/root/diagnose.sh'

EOF

# Reload bashrc
source ~/.bashrc
```

---

## Notes

- Replace `your-server-ip` with your actual server IP
- Replace `YYYYMMDD` with actual backup date (e.g., 20260612)
- Ensure you have root or sudo access
- Most commands require being in the API directory
- Always test nginx config with `nginx -t` before reloading
- Keep backups before making changes

---

**Quick Access Commands**
```bash
# The 5 most common commands
systemctl restart social-downloader-api
tail -f /var/www/social-downloader/logs/api.log
nginx -t && systemctl reload nginx
curl https://api.reelsave.me/health
du -sh /var/www/social-downloader/tmp
```

---

**Last Updated**: June 12, 2026
