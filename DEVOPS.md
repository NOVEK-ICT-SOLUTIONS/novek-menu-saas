# DevOps Documentation - QR Menu SaaS

## Server Information

| Item | Value |
|------|-------|
| Provider | Your VPS Provider |
| IP Address | YOUR_SERVER_IP |
| Domain | YOUR_DOMAIN |
| SSH User | YOUR_SSH_USER |
| App Directory | /opt/menu |

> **Note**: Store actual server credentials in a secure password manager, not in this file.

---

## SSH Access

```bash
# Connect to VPS
ssh YOUR_SSH_USER@YOUR_SERVER_IP

# Connect with specific key (if needed)
ssh -i ~/.ssh/your_deploy_key YOUR_SSH_USER@YOUR_SERVER_IP
```

---

## Docker Commands

### View Running Containers

```bash
# List all running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container resource usage
docker stats
```

### Container Management

```bash
cd /opt/menu

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
docker compose -f docker-compose.prod.yml restart nginx
docker compose -f docker-compose.prod.yml restart db
```

### View Logs

```bash
cd /opt/menu

# View all logs
docker compose -f docker-compose.prod.yml logs

# View logs for specific service
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs db

# Follow logs in real-time
docker compose -f docker-compose.prod.yml logs -f

# Follow specific service logs
docker compose -f docker-compose.prod.yml logs -f backend

# View last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Update and Redeploy

```bash
cd /opt/menu

# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Recreate containers with new images
docker compose -f docker-compose.prod.yml up -d

# Or do both in one command
docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d

# Clean up old images
docker image prune -f
```

---

## Database Operations

### Access Database Shell

```bash
cd /opt/menu

# Connect to PostgreSQL
docker compose -f docker-compose.prod.yml exec db psql -U menu_user -d menu_saas

# Run single query
docker compose -f docker-compose.prod.yml exec -T db psql -U menu_user -d menu_saas -c "SELECT * FROM users;"
```

### Common Database Queries

```sql
-- List all users
SELECT id, email, role, created_at FROM users;

-- List all restaurants
SELECT id, name, slug, owner_id FROM restaurants;

-- List categories for a restaurant
SELECT c.name, c.sort_order FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
WHERE r.slug = 'pizza-palace';

-- Count menu items
SELECT COUNT(*) FROM menu_items;
```

### Database Migrations

```bash
cd /opt/menu

# Run pending migrations
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

# Check migration status
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate status
```

### Database Seeding

```bash
cd /opt/menu

# Seed database with initial data
docker compose -f docker-compose.prod.yml exec -T backend npm run db:seed
```

---

## Backup and Restore

### Database Backup

```bash
cd /opt/menu

# Create backup directory
mkdir -p /opt/menu/backups

# Backup database (with timestamp)
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U menu_user -d menu_saas > /opt/menu/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Backup database (compressed)
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U menu_user -d menu_saas | gzip > /opt/menu/backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz

# List backups
ls -la /opt/menu/backups/
```

### Database Restore

```bash
cd /opt/menu

# Restore from SQL file
docker compose -f docker-compose.prod.yml exec -T db psql -U menu_user -d menu_saas < /opt/menu/backups/backup_YYYYMMDD_HHMMSS.sql

# Restore from compressed file
gunzip -c /opt/menu/backups/backup_YYYYMMDD_HHMMSS.sql.gz | docker compose -f docker-compose.prod.yml exec -T db psql -U menu_user -d menu_saas
```

### Automated Daily Backup (Cron)

```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * cd /opt/menu && docker compose -f docker-compose.prod.yml exec -T db pg_dump -U menu_user -d menu_saas | gzip > /opt/menu/backups/backup_$(date +\%Y\%m\%d).sql.gz

# Keep only last 7 days of backups (add to crontab)
0 3 * * * find /opt/menu/backups -name "*.sql.gz" -mtime +7 -delete
```

### Backup Uploads Directory

```bash
# Backup uploads
tar -czf /opt/menu/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz -C /var/lib/docker/volumes/ menu_uploads

# Or using docker volume
docker run --rm -v menu_uploads:/data -v /opt/menu/backups:/backup alpine tar czf /backup/uploads_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
```

---

## SSL Certificate

### Check Certificate Status

```bash
# View certificate expiry
docker compose -f docker-compose.prod.yml exec certbot certbot certificates

# Or check directly
echo | openssl s_client -servername menu.novektech.com -connect menu.novektech.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Manual Certificate Renewal

```bash
cd /opt/menu

# Test renewal (dry run)
docker compose -f docker-compose.prod.yml exec certbot certbot renew --dry-run

# Force renewal
docker compose -f docker-compose.prod.yml exec certbot certbot renew --force-renewal

# Reload nginx after renewal
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

Note: Certbot container auto-renews certificates every 12 hours.

---

## Server Maintenance

### Check Disk Space

```bash
# Overall disk usage
df -h

# Docker disk usage
docker system df

# Find large files
du -sh /var/lib/docker/*
```

### Clean Up Docker

```bash
# Remove unused images
docker image prune -f

# Remove all unused data (images, containers, networks)
docker system prune -f

# Remove unused volumes (CAUTION: may delete data)
docker volume prune -f

# Full cleanup (CAUTION)
docker system prune -a -f
```

### Check Memory Usage

```bash
# Overall memory
free -h

# Per-container memory
docker stats --no-stream
```

### Restart Server

```bash
# Restart VPS (will auto-start containers due to restart: unless-stopped)
sudo reboot

# After reboot, verify containers are running
docker ps
```

---

## Troubleshooting

### Container Won't Start

```bash
cd /opt/menu

# Check container logs
docker compose -f docker-compose.prod.yml logs backend

# Check container status
docker compose -f docker-compose.prod.yml ps

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --force-recreate backend
```

### Database Connection Issues

```bash
# Check if db container is healthy
docker compose -f docker-compose.prod.yml ps db

# Check db logs
docker compose -f docker-compose.prod.yml logs db

# Test connection from backend
docker compose -f docker-compose.prod.yml exec backend sh -c "nc -zv db 5432"
```

### Nginx Issues

```bash
# Test nginx config
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Reload nginx config
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Check nginx logs
docker compose -f docker-compose.prod.yml logs nginx
```

### Check API Health

```bash
# From server
curl http://localhost:3000/api/v1/public/menu/YOUR_RESTAURANT_SLUG

# From outside
curl https://YOUR_DOMAIN/api/v1/public/menu/YOUR_RESTAURANT_SLUG
```

---

## Environment Variables

Location: `/opt/menu/.env`

```bash
# View current env
cat /opt/menu/.env

# Edit env (be careful)
nano /opt/menu/.env

# After editing, restart services
docker compose -f docker-compose.prod.yml up -d
```

### Required Variables

| Variable | Description |
|----------|-------------|
| REGISTRY | Container registry (ghcr.io) |
| IMAGE_PREFIX | Image path (novek-ict-solutions/novek-menu-saas) |
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | JWT signing secret |
| JWT_REFRESH_SECRET | Refresh token secret |
| POSTGRES_PASSWORD | Database password |
| CORS_ORIGIN | Allowed CORS origin |

---

## CI/CD Pipeline

### How It Works

1. Push code to `main` branch
2. GitHub Actions builds Docker images
3. Images pushed to GitHub Container Registry (ghcr.io)
4. SSH into VPS and pull new images
5. Restart containers with new images
6. Run database migrations

### Manual Deployment

```bash
# On VPS
cd /opt/menu

# Login to GHCR (if needed)
echo "YOUR_GHCR_TOKEN" | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin

# Pull and deploy
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
```

### Trigger Deployment from GitHub

```bash
# Using GitHub CLI (from local machine)
gh workflow run "Deploy to VPS" --ref main
```

---

## Security Checklist

- [ ] SSH key authentication only (disable password auth)
- [ ] Firewall enabled (UFW)
- [ ] SSL certificate active
- [ ] Environment variables secured
- [ ] Database not exposed publicly
- [ ] Regular backups enabled
- [ ] Docker images from trusted sources

### Firewall Setup

```bash
# Enable UFW
ufw enable

# Allow SSH
ufw allow 22

# Allow HTTP/HTTPS
ufw allow 80
ufw allow 443

# Check status
ufw status
```

---

## Quick Reference

| Task | Command |
|------|---------|
| SSH to server | `ssh YOUR_USER@YOUR_SERVER_IP` |
| View containers | `docker ps` |
| View logs | `docker compose -f docker-compose.prod.yml logs -f` |
| Restart all | `docker compose -f docker-compose.prod.yml restart` |
| Restart backend | `docker compose -f docker-compose.prod.yml restart backend` |
| Backup DB | `docker compose -f docker-compose.prod.yml exec -T db pg_dump -U menu_user -d menu_saas > backup.sql` |
| Run migrations | `docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy` |
| Check disk | `df -h` |
| Clean docker | `docker system prune -f` |

---

## Support Contacts

- **Hosting**: Your VPS provider support
- **Domain**: Your domain registrar
- **SSL**: Let's Encrypt (automated)

---

## Test Credentials

> **SECURITY**: Default test credentials are defined in `packages/backend/prisma/seed.ts`.
> Change all passwords immediately after initial setup in production.
> Never commit real credentials to version control.
