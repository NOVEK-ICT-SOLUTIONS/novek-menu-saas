# Deployment Guide

## Local Testing

```bash
npm run docker:build
npm run docker:up
npm run docker:migrate
```

Access: http://localhost

Stop:
```bash
npm run docker:down
```

---

## VPS Deployment

### 1. First time VPS setup

```bash
ssh root@YOUR_VPS_IP

# Install Docker
curl -fsSL https://get.docker.com | sh

# Create directory
mkdir -p /opt/menu
```

### 2. Add GitHub Secrets

Go to: **GitHub repo > Settings > Secrets and variables > Actions**

| Name | Value |
|------|-------|
| `VPS_HOST` | Your VPS IP |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Your private SSH key |
| `POSTGRES_PASSWORD` | Any strong password |
| `JWT_SECRET` | Run: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Run: `openssl rand -hex 32` |
| `DATABASE_URL` | `postgresql://menu_user:YOUR_POSTGRES_PASSWORD@db:5432/menu_saas` |

### 3. Setup SSL (first time only)

```bash
ssh root@YOUR_VPS_IP
cd /opt/menu

# Start temporary nginx for SSL
docker run -d --name nginx-temp -p 80:80 -v certbot_webroot:/var/www/certbot nginx:alpine

# Get SSL certificate
docker run --rm -v certbot_webroot:/var/www/certbot -v certbot_certs:/etc/letsencrypt certbot/certbot certonly --webroot --webroot-path=/var/www/certbot --email your-email@example.com --agree-tos --no-eff-email -d menu.novektech.com

# Stop temporary nginx
docker stop nginx-temp && docker rm nginx-temp
```

### 4. Deploy

Push to main:
```bash
git add .
git commit -m "deploy"
git push origin main
```

GitHub Actions deploys automatically.

---

## After Deployment

```bash
ssh root@YOUR_VPS_IP
cd /opt/menu

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart
docker compose -f docker-compose.prod.yml restart

# Check status
docker compose -f docker-compose.prod.yml ps

# View specific service logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend

# Run migrations manually
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Access database
docker compose -f docker-compose.prod.yml exec db psql -U menu_user -d menu_saas

# Backup database
docker compose -f docker-compose.prod.yml exec db pg_dump -U menu_user menu_saas > backup.sql
```

---

## URLs

| URL | Description |
|-----|-------------|
| https://menu.novektech.com | Homepage |
| https://menu.novektech.com/restaurant | Customer menu |
| https://menu.novektech.com/dashboard | Owner dashboard |
| https://menu.novektech.com/admin | Admin panel |
