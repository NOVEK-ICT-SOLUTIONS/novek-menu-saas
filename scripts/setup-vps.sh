#!/bin/bash
set -e

DOMAIN="menu.novektech.com"
EMAIL="${1:-admin@novektech.com}"

echo "=== Menu SaaS VPS Setup ==="
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Installing Docker Compose..."
    apt-get update
    apt-get install -y docker-compose-plugin
fi

mkdir -p /opt/menu/nginx
cd /opt/menu

cat > nginx/nginx-init.conf << 'NGINX_CONF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name menu.novektech.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'Menu SaaS - SSL Setup in progress';
            add_header Content-Type text/plain;
        }
    }
}
NGINX_CONF

cat > docker-compose.init.yml << 'COMPOSE_INIT'
services:
  nginx-init:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx-init.conf:/etc/nginx/nginx.conf:ro
      - certbot_webroot:/var/www/certbot:ro

volumes:
  certbot_webroot:
COMPOSE_INIT

echo "Starting temporary Nginx for SSL setup..."
docker compose -f docker-compose.init.yml up -d

sleep 5

echo "Obtaining SSL certificate..."
docker run --rm \
    -v certbot_webroot:/var/www/certbot \
    -v certbot_certs:/etc/letsencrypt \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN"

echo "Stopping temporary Nginx..."
docker compose -f docker-compose.init.yml down

rm -f docker-compose.init.yml nginx/nginx-init.conf

echo ""
echo "=== SSL Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Add these secrets to your GitHub repository:"
echo "   - VPS_HOST: Your VPS IP address"
echo "   - VPS_USER: root (or your SSH user)"
echo "   - VPS_SSH_KEY: Your private SSH key"
echo "   - DATABASE_URL: postgresql://menu_user:YOUR_PASSWORD@db:5432/menu_saas"
echo "   - JWT_SECRET: $(openssl rand -hex 32)"
echo "   - JWT_REFRESH_SECRET: $(openssl rand -hex 32)"
echo "   - POSTGRES_PASSWORD: $(openssl rand -hex 16)"
echo ""
echo "2. Push to main branch to trigger deployment"
echo ""
