# Deployment Guide - Digital Ocean Ubuntu

This guide walks through deploying the orchestrator webhook server on a Digital Ocean Ubuntu droplet.

## Prerequisites

- Digital Ocean account
- Ubuntu 22.04 LTS droplet (minimum: 1GB RAM, 1 vCPU)
- Domain name (optional, for HTTPS)
- n8n instance running (for Telegram integration)

## Quick Setup (5 minutes)

### 1. Create Droplet

```bash
# From Digital Ocean dashboard:
# - Create Droplet
# - Ubuntu 22.04 LTS
# - Basic plan ($6/month is sufficient)
# - Add SSH key
# - Create
```

### 2. SSH into Droplet

```bash
ssh root@your-droplet-ip
```

### 3. Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install Python 3.11+
apt install python3 python3-pip python3-venv git -y

# Verify versions
python3 --version  # Should be 3.10+
pip3 --version
```

### 4. Install Claude Code CLI

```bash
# Follow official installation at https://claude.com/claude-code
# Or use curl/wget method provided by Anthropic

# Verify installation
claude --version
```

### 5. Clone/Upload Your Code

```bash
# Option 1: Git clone (if code is in a repo)
cd /opt
git clone https://github.com/yourusername/outwardsign.git
cd outwardsign/orchestrator

# Option 2: SCP from local machine
# From your local machine:
# scp -r orchestrator/ root@your-droplet-ip:/opt/orchestrator/

# Or Option 3: Create directory and upload manually
mkdir -p /opt/orchestrator
cd /opt/orchestrator
# Then upload files via SCP or SFTP
```

### 6. Set Up Python Environment

```bash
cd /opt/orchestrator

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 7. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Generate secure webhook secret
openssl rand -hex 32

# Edit .env file
nano .env
```

**Set these variables:**
```bash
WEBHOOK_SECRET=<paste-generated-secret-here>
N8N_NOTIFY_URL=https://your-n8n-instance.com/webhook/orchestrator-notify
HOST=0.0.0.0
PORT=5000
DEBUG=false
```

Save and exit (`Ctrl+X`, `Y`, `Enter`)

### 8. Test the Server

```bash
# Make sure you're in venv
source venv/bin/activate

# Start server
python3 webhook_server.py
```

You should see:
```
============================================================
🌐 Orchestrator Webhook Server
============================================================
...
🚀 Starting server on http://0.0.0.0:5000
```

Test from another terminal:
```bash
curl http://your-droplet-ip:5000/health
```

Should return:
```json
{"status": "ok", "timestamp": "..."}
```

Press `Ctrl+C` to stop.

---

## Production Setup

### 1. Create Systemd Service

This keeps the server running in the background and auto-restarts on crashes.

```bash
# Create service file
sudo nano /etc/systemd/system/orchestrator.service
```

**Paste this content:**
```ini
[Unit]
Description=Orchestrator Webhook Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/orchestrator
Environment="PATH=/opt/orchestrator/venv/bin"
ExecStart=/opt/orchestrator/venv/bin/python3 /opt/orchestrator/webhook_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Save and exit.

**Enable and start service:**
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable on boot
sudo systemctl enable orchestrator

# Start service
sudo systemctl start orchestrator

# Check status
sudo systemctl status orchestrator
```

### 2. Set Up Firewall (UFW)

```bash
# Enable UFW
ufw --force enable

# Allow SSH (IMPORTANT! Do this first)
ufw allow 22/tcp

# Allow webhook server port
ufw allow 5000/tcp

# Check status
ufw status
```

### 3. Set Up Nginx Reverse Proxy (Optional but Recommended)

This adds HTTPS support and better security.

```bash
# Install Nginx
apt install nginx -y

# Create Nginx config
nano /etc/nginx/sites-available/orchestrator
```

**Paste this content:**
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Or use IP if no domain

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Enable site:**
```bash
# Create symlink
ln -s /etc/nginx/sites-available/orchestrator /etc/nginx/sites-enabled/

# Test config
nginx -t

# Restart Nginx
systemctl restart nginx

# Allow HTTP through firewall
ufw allow 'Nginx Full'
```

### 4. Add HTTPS with Let's Encrypt (If using domain)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal:
certbot renew --dry-run
```

---

## Testing the Deployment

### Test Health Endpoint

```bash
# Direct to server
curl http://localhost:5000/health

# Through Nginx (if configured)
curl http://your-domain.com/health

# With HTTPS (if configured)
curl https://your-domain.com/health
```

### Test Command Endpoint

```bash
# Save this to test.sh
cat > test.sh << 'EOF'
#!/bin/bash
curl -X POST http://localhost:5000/webhook/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "status",
    "secret": "YOUR_WEBHOOK_SECRET"
  }'
EOF

chmod +x test.sh
./test.sh
```

Should return orchestrator status.

### Test Starting a Task

```bash
# Create a simple test task file
cat > /opt/orchestrator/test-task.md << 'EOF'
# Test Task

## Task 1: Echo test
**Type:** testing
**Priority:** low
**Requires Approval:** false
**Description:** Simple echo test
**Acceptance Criteria:**
- Command runs successfully

**Claude Instruction:**
Use the Bash tool to run: echo "Orchestrator is working on Digital Ocean!"

---
EOF

# Start orchestrator via webhook
curl -X POST http://localhost:5000/webhook/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "start",
    "secret": "YOUR_WEBHOOK_SECRET",
    "params": {
      "task_file": "/opt/orchestrator/test-task.md",
      "auto_approve": true
    }
  }'

# Check status after a few seconds
curl -X POST http://localhost:5000/webhook/status \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_WEBHOOK_SECRET"
  }'

# Check logs
curl -X POST http://localhost:5000/webhook/logs \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "YOUR_WEBHOOK_SECRET",
    "lines": 20
  }'
```

---

## Monitoring & Maintenance

### View Server Logs

```bash
# View systemd logs
journalctl -u orchestrator -f

# View last 50 lines
journalctl -u orchestrator -n 50

# View logs since 1 hour ago
journalctl -u orchestrator --since "1 hour ago"
```

### View Task Logs

```bash
# List all task logs
ls -lah /opt/orchestrator/orchestrator_logs/

# View latest task log
tail -f /opt/orchestrator/orchestrator_logs/task-*.log
```

### Check Server Status

```bash
# Service status
systemctl status orchestrator

# Is it running?
ps aux | grep webhook_server

# Check port is listening
netstat -tulpn | grep 5000
```

### Restart Server

```bash
# Restart service
systemctl restart orchestrator

# If changes made to .env or config.yaml
systemctl restart orchestrator
```

### Update Code

```bash
# Stop service
systemctl stop orchestrator

# Update code (if using git)
cd /opt/orchestrator
git pull

# Or re-upload files via SCP

# Restart
systemctl start orchestrator
```

---

## Security Best Practices

### 1. Change Default Port (Optional)

```bash
# Edit .env
nano /opt/orchestrator/.env

# Change PORT=5000 to PORT=8080 (or any unused port)

# Update firewall
ufw delete allow 5000/tcp
ufw allow 8080/tcp

# Update Nginx config if using
nano /etc/nginx/sites-available/orchestrator
# Change proxy_pass to http://127.0.0.1:8080

# Restart services
systemctl restart orchestrator
systemctl restart nginx
```

### 2. Use Strong Webhook Secret

```bash
# Generate strong secret
openssl rand -hex 32

# Update .env
nano /opt/orchestrator/.env
```

### 3. Restrict Firewall Access

```bash
# Allow only from n8n server IP
ufw delete allow 5000/tcp
ufw allow from n8n-server-ip to any port 5000

# Or if using Nginx, only allow localhost
# The Nginx config already uses 127.0.0.1, so external access is blocked
```

### 4. Regular Updates

```bash
# Update system monthly
apt update && apt upgrade -y

# Update Python packages
cd /opt/orchestrator
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

---

## Connecting to n8n

Once your orchestrator is deployed:

1. **Get your webhook URL:**
   ```
   http://your-droplet-ip:5000/webhook/command
   # Or with domain:
   https://your-domain.com/webhook/command
   ```

2. **Configure n8n:**
   - Create workflow with HTTP Request node
   - Method: POST
   - URL: Your webhook URL
   - Body: JSON
   ```json
   {
     "command": "start",
     "secret": "YOUR_WEBHOOK_SECRET",
     "params": {
       "task_file": "/opt/orchestrator/orchestrator_tasks/daily-tasks.md",
       "auto_approve": true
     }
   }
   ```

3. **Test from n8n:**
   - Execute workflow
   - Check orchestrator logs: `journalctl -u orchestrator -f`

---

## Troubleshooting

### Server won't start

```bash
# Check logs
journalctl -u orchestrator -n 100

# Common issues:
# 1. Port already in use
sudo lsof -i :5000
# Kill process: sudo kill -9 <PID>

# 2. Python dependencies missing
cd /opt/orchestrator
source venv/bin/activate
pip install -r requirements.txt

# 3. Claude CLI not found
which claude
# If not found, reinstall Claude CLI
```

### Can't connect from n8n

```bash
# Check if server is listening
netstat -tulpn | grep 5000

# Check firewall
ufw status

# Test from n8n server
# From n8n server:
curl http://orchestrator-ip:5000/health

# Check Nginx if using
systemctl status nginx
nginx -t
```

### Tasks not executing

```bash
# Check Claude CLI works
claude --version

# Check orchestrator can find Claude
which claude

# Test Claude manually
echo "test" | claude -p --dangerously-skip-permissions "say hello"

# Check task file exists
ls -la /opt/orchestrator/orchestrator_tasks/

# Check permissions
ls -la /opt/orchestrator/
```

### High CPU/Memory usage

```bash
# Check resource usage
htop

# View orchestrator process
ps aux | grep webhook_server

# Consider upgrading droplet if needed
```

---

## Backup & Recovery

### Backup Important Files

```bash
# Create backup directory
mkdir -p /opt/backups

# Backup script
cat > /opt/backup-orchestrator.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Backup configuration
cp /opt/orchestrator/.env $BACKUP_DIR/.env-$DATE
cp /opt/orchestrator/config.yaml $BACKUP_DIR/config-$DATE.yaml
cp /opt/orchestrator/state.json $BACKUP_DIR/state-$DATE.json 2>/dev/null || true

# Backup task files
tar -czf $BACKUP_DIR/tasks-$DATE.tar.gz /opt/orchestrator/orchestrator_tasks/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*-20*" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /opt/backup-orchestrator.sh

# Run backup
/opt/backup-orchestrator.sh

# Or set up cron for daily backups
crontab -e
# Add line:
# 0 2 * * * /opt/backup-orchestrator.sh
```

---

## Cost Optimization

**Smallest viable setup:**
- Droplet: $6/month (1GB RAM, 1 vCPU)
- Bandwidth: 1TB included
- Total: **$6/month**

**Recommended setup:**
- Droplet: $12/month (2GB RAM, 1 vCPU)
- Better performance for Claude CLI
- Total: **$12/month**

**No additional costs for:**
- Nginx
- Let's Encrypt SSL
- UFW firewall
- Systemd service

---

## Next Steps

After deployment is working:

1. ✅ Test webhook endpoints
2. ✅ Configure n8n integration
3. ✅ Set up Telegram bot (Phase 3)
4. ✅ Create daily task workflows
5. ✅ Set up monitoring/alerts

See `ORCHESTRATOR_PLAN.md` for Phase 3 (n8n + Telegram integration).
