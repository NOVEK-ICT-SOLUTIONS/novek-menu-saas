# Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL database
- Docker (for containerized deployment)
- Git

## Environment Setup

### Backend Environment Variables

Create a `.env` file in `packages/backend/`:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secure-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-secure-refresh-secret-min-32-chars
CORS_ORIGIN=https://yourdomain.com
QR_CODE_DIR=./uploads/qr-codes
```

### Frontend Environment Variables

Create a `.env.production` file in `packages/frontend/`:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
```

## Database Setup

### 1. Create Database

```bash
createdb qr_menu_saas_production
```

### 2. Run Migrations

```bash
cd packages/backend
npm run db:migrate
```

### 3. Seed Database (Optional)

```bash
npm run db:seed
```

## Deployment Options

### Option 1: Docker Deployment

#### Build Docker Image

```bash
cd packages/backend
docker build -t qr-menu-backend:latest .
```

#### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name qr-menu-backend \
  qr-menu-backend:latest
```

#### With Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./packages/backend
    ports:
      - "3000:3000"
    env_file:
      - ./packages/backend/.env
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: qr_menu_saas
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

### Option 2: Railway Deployment

#### Backend on Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Create new project:
   ```bash
   railway init
   ```

4. Add PostgreSQL:
   ```bash
   railway add postgresql
   ```

5. Set environment variables:
   ```bash
   railway variables set NODE_ENV=production
   railway variables set JWT_SECRET=your-secret
   # ... set other variables
   ```

6. Deploy:
   ```bash
   railway up
   ```

#### Frontend on Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd packages/frontend
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard

### Option 3: Render Deployment

#### Backend on Render

1. Create new Web Service on render.com
2. Connect your GitHub repository
3. Configure build settings:
   - Build Command: `npm install && npm run build -w backend`
   - Start Command: `npm run start -w backend`
4. Add environment variables in Render dashboard
5. Deploy

#### Frontend on Render (Static Site)

1. Create new Static Site on render.com
2. Configure build settings:
   - Build Command: `npm install && npm run build -w frontend`
   - Publish Directory: `packages/frontend/dist`
3. Add environment variables
4. Deploy

### Option 4: Traditional VPS (DigitalOcean, AWS EC2, etc.)

#### 1. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2
```

#### 2. Clone Repository

```bash
git clone https://github.com/yourusername/qr-menu-saas.git
cd qr-menu-saas
```

#### 3. Install Dependencies

```bash
npm install
```

#### 4. Build Applications

```bash
npm run build
```

#### 5. Setup Database

```bash
sudo -u postgres psql
CREATE DATABASE qr_menu_saas_production;
\q
```

#### 6. Run Migrations

```bash
cd packages/backend
npm run db:migrate
```

#### 7. Start with PM2

```bash
cd packages/backend
pm2 start dist/server.js --name qr-menu-backend
pm2 save
pm2 startup
```

#### 8. Setup Nginx (Optional)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 9. Setup SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

## CI/CD Pipeline

The project includes GitHub Actions workflows for automated deployment.

### Setup GitHub Secrets

Add these secrets to your GitHub repository:

- `RAILWAY_TOKEN` (for Railway deployment)
- `VERCEL_TOKEN` (for Vercel deployment)
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

## Post-Deployment

### Health Check

```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{"status":"ok"}
```

### Monitor Logs

#### Docker
```bash
docker logs -f qr-menu-backend
```

#### PM2
```bash
pm2 logs qr-menu-backend
```

### Database Backup

```bash
pg_dump -U postgres qr_menu_saas_production > backup.sql
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Check database is running
   - Verify network connectivity

2. **JWT Errors**
   - Ensure JWT_SECRET is set
   - Check token expiration times

3. **CORS Errors**
   - Verify CORS_ORIGIN matches frontend URL
   - Check headers are properly set

4. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version
   - Verify all environment variables are set
