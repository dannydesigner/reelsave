# VPS Deployment Guide (Ubuntu Server)

## Server Requirements
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- 20GB storage
- Providers: DigitalOcean, Hetzner, Vultr, AWS EC2

## Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm nginx certbot python3-certbot-nginx ffmpeg git

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Reload shell
source ~/.bashrc
```

## Step 2: Clone Your Repository

```bash
# Clone project
cd /var/www
sudo git clone https://github.com/yourusername/social-video-downloader.git
sudo chown -R $USER:$USER social-video-downloader
cd social-video-downloader

# Install dependencies
pnpm install
```

## Step 3: Setup Backend (FastAPI)

```bash
# Create Python virtual environment
cd /var/www/social-video-downloader/services/api
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MAX_DOWNLOAD_BYTES=262144000
DOWNLOAD_TIMEOUT_SECONDS=300
SOCKET_TIMEOUT_SECONDS=20
DOWNLOAD_TEMP_ROOT=/tmp/downloads
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EOF

# Create systemd service
sudo tee /etc/systemd/system/video-api.service > /dev/null << EOF
[Unit]
Description=Social Video Downloader API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/social-video-downloader/services/api
Environment="PATH=/var/www/social-video-downloader/services/api/.venv/bin"
ExecStart=/var/www/social-video-downloader/services/api/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start API service
sudo systemctl daemon-reload
sudo systemctl enable video-api
sudo systemctl start video-api
sudo systemctl status video-api
```

## Step 4: Setup Frontend (Next.js)

```bash
cd /var/www/social-video-downloader/apps/web

# Create .env.production
cat > .env.production << EOF
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
EOF

# Build Next.js
pnpm build

# Create systemd service for Next.js
sudo tee /etc/systemd/system/video-web.service > /dev/null << EOF
[Unit]
Description=Social Video Downloader Web
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/social-video-downloader/apps/web
Environment="PATH=/usr/local/bin:/usr/bin"
ExecStart=/usr/bin/pnpm start
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start web service
sudo systemctl daemon-reload
sudo systemctl enable video-web
sudo systemctl start video-web
sudo systemctl status video-web
```

## Step 5: Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/social-video-downloader > /dev/null << 'EOF'
# API Backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for large downloads
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/social-video-downloader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Setup SSL with Let's Encrypt

```bash
# Get SSL certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 7: Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Step 8: DNS Configuration

Add these records at your domain registrar:

```
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A
Name: www
Value: YOUR_SERVER_IP

Type: A
Name: api
Value: YOUR_SERVER_IP
```

## Maintenance Commands

```bash
# View API logs
sudo journalctl -u video-api -f

# View Web logs
sudo journalctl -u video-web -f

# Restart services
sudo systemctl restart video-api
sudo systemctl restart video-web
sudo systemctl reload nginx

# Update application
cd /var/www/social-video-downloader
git pull
pnpm install
cd apps/web && pnpm build
sudo systemctl restart video-web
sudo systemctl restart video-api
```

## Monitoring & Optimization

```bash
# Install PM2 for better process management (optional)
npm install -g pm2

# Monitor system resources
htop

# Check disk space
df -h

# Clean old temp files
sudo find /tmp/downloads -type d -mtime +1 -exec rm -rf {} +
```

## Security Best Practices

1. **Setup automatic security updates**:
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

2. **Configure fail2ban** (protect against brute force):
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

3. **Regular backups** of your code and configuration

4. **Monitor logs** for suspicious activity

5. **Keep yt-dlp updated**:
```bash
source /var/www/social-video-downloader/services/api/.venv/bin/activate
pip install --upgrade yt-dlp
sudo systemctl restart video-api
```
