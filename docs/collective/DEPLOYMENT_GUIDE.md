# DEPLOYMENT GUIDE - VERCEL
## QR Menu SaaS - Team Testing Deployment

**Version:** 1.0
**Date:** 2025-11-16
**Target:** Internal team testing environment
**Platform:** Vercel (Frontend + Backend)

---

## ⚠️ IMPORTANT - READ FIRST

### Current Deployment Status

**✅ Safe for Internal Testing:**
- Core functionality works
- Good for team demos
- Fine for closed testing

**❌ NOT Ready for Public Production:**
- Missing security features (rate limiting, CSRF, etc.)
- No tests
- LocalStorage tokens (should be httpOnly cookies)
- Local file storage for QR codes

**Recommendation:** Deploy for team testing now, implement Phase 1 security fixes before public launch.

---

## TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Database Setup (Neon/Supabase)](#database-setup)
3. [Backend Deployment to Vercel](#backend-deployment)
4. [Frontend Deployment to Vercel](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Setup](#post-deployment-setup)
7. [Testing the Deployment](#testing-the-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Updating After Changes](#updating-after-changes)

---

## PREREQUISITES

### What You Need

1. **Vercel Account** (free tier is fine)
   - Sign up at: https://vercel.com/signup
   - Connect your GitHub account

2. **GitHub Repository** (if not already set up)
   - Push your code to GitHub
   - Both frontend and backend in same repo

3. **PostgreSQL Database** (free options)
   - Option A: Neon (recommended - free tier generous)
   - Option B: Supabase (free tier available)
   - Option C: Railway (has free tier)

4. **Node.js 20+** installed locally (for testing)

### Time Required
- First-time setup: 30-45 minutes
- Subsequent deployments: 2-5 minutes (automatic)

---

## DATABASE SETUP

### Option A: Neon (Recommended)

**Why Neon:**
- ✅ Free tier: 10 GB storage
- ✅ No credit card required
- ✅ Serverless PostgreSQL
- ✅ Perfect for Vercel

**Steps:**

1. **Create Neon Account**
   ```
   Go to: https://neon.tech/
   Click "Sign Up"
   Sign in with GitHub (easiest)
   ```

2. **Create New Project**
   ```
   Click "Create Project"
   Project name: qr-menu-saas-test
   Region: Choose closest to you
   PostgreSQL version: 16 (latest)
   Click "Create Project"
   ```

3. **Get Connection String**
   ```
   After creation, you'll see:

   Connection string:
   postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require

   COPY THIS - you'll need it!
   ```

4. **Save for Later**
   ```
   You'll use this as DATABASE_URL in environment variables
   ```

### Option B: Supabase

**Steps:**

1. **Create Account**
   ```
   Go to: https://supabase.com/
   Sign up with GitHub
   ```

2. **Create Project**
   ```
   Click "New Project"
   Name: qr-menu-test
   Database Password: [choose strong password]
   Region: Choose closest
   Click "Create new project"
   Wait 2-3 minutes for setup
   ```

3. **Get Connection String**
   ```
   Go to: Project Settings > Database
   Look for "Connection string" > "URI"

   Format:
   postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres

   Replace [PASSWORD] with your database password
   ```

---

## BACKEND DEPLOYMENT

### Step 1: Prepare Backend for Serverless

Vercel uses serverless functions. We need to make a small adjustment.

**Create `vercel.json` in backend folder:**

```bash
# Navigate to backend folder
cd packages/backend
```

**Create file: `packages/backend/vercel.json`**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Create file: `packages/backend/api/index.js`** (Vercel serverless entry)

```javascript
// This file makes the Express app work as a Vercel serverless function
const { app } = require('../dist/app');

module.exports = app;
```

**Update `packages/backend/package.json` - Add build script:**

```json
{
  "scripts": {
    "build": "tsc && tsc-alias",
    "vercel-build": "npm run build && npx prisma generate && npx prisma migrate deploy"
  }
}
```

### Step 2: Deploy Backend to Vercel

**Method 1: Using Vercel CLI (Recommended)**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Backend**
   ```bash
   # Navigate to backend folder
   cd packages/backend

   # Deploy
   vercel

   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? Choose your account
   # - Link to existing project? No
   # - Project name: qr-menu-backend
   # - Directory: ./ (current)
   # - Override settings? No
   ```

4. **Wait for deployment**
   ```
   You'll get a URL like:
   https://qr-menu-backend-xxx.vercel.app

   SAVE THIS URL - this is your backend API URL
   ```

**Method 2: Using Vercel Dashboard**

1. **Go to Vercel Dashboard**
   ```
   https://vercel.com/dashboard
   ```

2. **Import Project**
   ```
   Click "Add New..."
   Choose "Project"
   Import Git Repository
   Select your GitHub repo
   ```

3. **Configure Backend**
   ```
   Framework Preset: Other
   Root Directory: packages/backend
   Build Command: npm run vercel-build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables** (see next section)

5. **Deploy**
   ```
   Click "Deploy"
   Wait 2-3 minutes
   ```

### Step 3: Add Backend Environment Variables

**In Vercel Dashboard:**

```
Go to: Project Settings > Environment Variables

Add these variables:
```

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Your Neon/Supabase connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Random 32+ character string | `your-very-long-random-secret-key-min-32-chars` |
| `JWT_REFRESH_SECRET` | Different random 32+ character | `another-long-random-secret-key-different` |
| `NODE_ENV` | `production` | `production` |
| `PORT` | `3000` | `3000` |
| `CORS_ORIGIN` | Your frontend URL (add after frontend deploy) | `https://qr-menu-frontend.vercel.app` |
| `LOG_LEVEL` | `info` | `info` |

**Generate random secrets:**
```bash
# In terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run twice for two different secrets
```

**After adding variables:**
```
Click "Redeploy" to apply changes
```

### Step 4: Run Database Migrations

**Option A: From Local (Easiest)**

```bash
# In packages/backend folder
# Set DATABASE_URL temporarily
export DATABASE_URL="your-neon-connection-string"

# Or on Windows:
set DATABASE_URL=your-neon-connection-string

# Run migrations
npm run db:migrate

# You should see:
# "Your database is now in sync with your schema"
```

**Option B: Use Prisma Studio**

```bash
# Connect to your production database
npx prisma studio --schema=./packages/backend/prisma/schema.prisma

# It will open in browser
# Migrations run automatically during build
```

### Step 5: Verify Backend Deployment

**Test the health endpoint:**

```bash
# Replace with your actual backend URL
curl https://qr-menu-backend-xxx.vercel.app/health

# Should return:
# {"status":"ok","timestamp":"2025-11-16T..."}
```

---

## FRONTEND DEPLOYMENT

### Step 1: Update Frontend Configuration

**Create/Update `packages/frontend/.env.production`:**

```bash
# Your backend URL from previous step
VITE_API_URL=https://qr-menu-backend-xxx.vercel.app/api
VITE_APP_ENV=production
```

### Step 2: Deploy Frontend to Vercel

**Method 1: Using Vercel CLI**

```bash
# Navigate to frontend folder
cd packages/frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Choose your account
# - Link to existing project? No
# - Project name: qr-menu-frontend
# - Directory: ./ (current)
# - Override settings? No
```

**You'll get a URL like:**
```
https://qr-menu-frontend-xxx.vercel.app
```

**Method 2: Using Vercel Dashboard**

1. **Import Project**
   ```
   Vercel Dashboard > Add New > Project
   Import your Git repository
   ```

2. **Configure Frontend**
   ```
   Framework Preset: Vite
   Root Directory: packages/frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Add Environment Variable**
   ```
   Variable: VITE_API_URL
   Value: https://qr-menu-backend-xxx.vercel.app/api

   Variable: VITE_APP_ENV
   Value: production
   ```

4. **Deploy**
   ```
   Click "Deploy"
   Wait 2-3 minutes
   ```

### Step 3: Update Backend CORS

**Important:** Update backend to allow frontend URL

**In Vercel Backend Project:**
```
Settings > Environment Variables
Edit CORS_ORIGIN variable:
Value: https://qr-menu-frontend-xxx.vercel.app
```

**Redeploy backend:**
```
Deployments tab > Click "..." > Redeploy
```

---

## ENVIRONMENT VARIABLES

### Complete Environment Variables List

**Backend (packages/backend):**

```env
# Required
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
JWT_SECRET=your-secret-key-at-least-32-characters-long
JWT_REFRESH_SECRET=different-secret-key-at-least-32-chars
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Optional (with defaults)
PORT=3000
LOG_LEVEL=info
QR_CODE_DIR=./uploads/qr-codes

# Future (for Phase 1 improvements)
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_REGION=
```

**Frontend (packages/frontend):**

```env
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_APP_ENV=production
```

---

## POST-DEPLOYMENT SETUP

### Step 1: Create First User (Admin)

**Option A: Via API (using curl or Postman)**

```bash
# Register admin user
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!"
  }'
```

**Option B: Via Frontend**

```
1. Go to: https://your-frontend.vercel.app/register
2. Register with your admin email
3. You're now logged in as the first user (OWNER role)
```

### Step 2: Manually Upgrade to Admin (Database)

If you want admin privileges:

**Using Neon SQL Editor:**

```sql
-- Go to Neon Dashboard > SQL Editor
-- Run this query:

UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'admin@yourcompany.com';
```

**Or using Prisma Studio:**

```bash
# Locally with production database
npx prisma studio

# Change the user's role to ADMIN
# Save changes
```

### Step 3: Test Complete Flow

1. **Register a test user**
   - Go to frontend URL
   - Register new account

2. **Create a test restaurant**
   - Name: "Test Restaurant"
   - Slug: "test-restaurant"

3. **Create a menu**
   - Name: "Test Menu"

4. **Add test items**
   - Add 2-3 menu items

5. **View public menu**
   - Go to: `https://your-frontend.vercel.app/menu/test-restaurant`
   - Verify items display correctly

---

## TESTING THE DEPLOYMENT

### Health Checks

**Backend Health:**
```bash
curl https://your-backend.vercel.app/health

# Expected:
# {"status":"ok","timestamp":"2025-11-16T..."}
```

**Frontend Load:**
```
Open: https://your-frontend.vercel.app
Should see login page
```

### API Tests

**Test Registration:**
```bash
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"testpass123"}'

# Should return user object and tokens
```

**Test Login:**
```bash
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"testpass123"}'

# Should return user object and tokens
```

### Frontend Tests

1. **Registration Flow**
   - Visit `/register`
   - Register new user
   - Should redirect to dashboard

2. **Restaurant Creation**
   - Create new restaurant
   - Verify QR code generates

3. **Menu Creation**
   - Create menu
   - Add items
   - Verify items appear

4. **Public Menu View**
   - Visit `/menu/[your-slug]`
   - Verify menu displays correctly
   - Test on mobile device

---

## TROUBLESHOOTING

### Issue: Backend "Module not found" Error

**Problem:** Deployment succeeds but API returns errors

**Solution:**
```bash
# Check vercel.json is correct
# Verify package.json has vercel-build script
# Check that build output is in dist/ folder

# Redeploy with:
vercel --force
```

### Issue: Database Connection Error

**Problem:** "P1001: Can't reach database server"

**Solution:**
```bash
# Verify DATABASE_URL is correct
# Ensure ?sslmode=require is at the end
# Check database is running (Neon dashboard)
# Verify IP allowlist (Neon allows all by default)
```

### Issue: CORS Error in Browser

**Problem:** "Access to fetch blocked by CORS policy"

**Solution:**
```bash
# Update backend CORS_ORIGIN environment variable
# Set to your frontend URL (without trailing slash)
# Redeploy backend after change
```

### Issue: QR Codes Not Generating

**Problem:** QR code generation fails on Vercel

**Solution:**
```javascript
// Vercel serverless functions have read-only filesystem
// You'll need to use cloud storage (Phase 1 improvement)

// Temporary workaround: Generate QR codes locally
// Upload manually to a service like Imgur
// Store URL in database

// For production, implement S3 storage (see IMPLEMENTATION_PLAN.md)
```

### Issue: Environment Variables Not Working

**Problem:** Variables not being read

**Solution:**
```bash
# For backend: Variables should NOT have VITE_ prefix
# For frontend: Variables MUST have VITE_ prefix

# After adding variables:
# Go to Deployments > Click ... > Redeploy
```

### Issue: 404 on Frontend Routes

**Problem:** Refresh on /dashboard returns 404

**Solution:**

Create `packages/frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Commit and redeploy.

---

## UPDATING AFTER CHANGES

### Automatic Deployments (Recommended)

**Setup:**

1. **Connect GitHub to Vercel**
   ```
   Vercel Dashboard > Project Settings > Git
   Connect your GitHub repository
   ```

2. **Configure Auto-Deploy**
   ```
   Production Branch: main (or master)
   Deploy on push: Enabled
   ```

**Now:**
- Every push to `main` branch → automatic deployment
- See deployment status in Vercel dashboard
- Rollback to previous deployment if needed

### Manual Deployments

**Update Backend:**
```bash
cd packages/backend
vercel --prod
```

**Update Frontend:**
```bash
cd packages/frontend
vercel --prod
```

### Database Migrations

**After schema changes:**

```bash
# Create new migration
cd packages/backend
npx prisma migrate dev --name your_migration_name

# Deploy to production database
export DATABASE_URL="your-production-db-url"
npx prisma migrate deploy

# Vercel will also run migrations automatically during build
# (due to vercel-build script)
```

---

## PRODUCTION CHECKLIST (Before Public Launch)

Before making this publicly accessible, complete these from IMPLEMENTATION_PLAN.md:

### Critical Security (Phase 1)

- [ ] Implement rate limiting
- [ ] Add input sanitization (XSS protection)
- [ ] Move tokens to httpOnly cookies
- [ ] Add CSRF protection
- [ ] Implement email verification
- [ ] Add account lockout mechanism
- [ ] Enforce strong passwords

### Infrastructure

- [ ] Move QR codes to S3 or cloud storage
- [ ] Set up Redis for caching
- [ ] Add monitoring (Sentry)
- [ ] Configure database backups
- [ ] Set up staging environment

### Testing

- [ ] Add test suite
- [ ] Run security audit
- [ ] Load testing
- [ ] Mobile device testing

---

## QUICK REFERENCE

### Your Deployment URLs

```
Backend API: https://qr-menu-backend-[your-id].vercel.app
Frontend:    https://qr-menu-frontend-[your-id].vercel.app
Database:    [Your Neon/Supabase URL]

API Endpoints:
- Health: /health
- Auth: /api/auth/register, /api/auth/login
- Restaurants: /api/restaurants
- Menus: /api/menus
- Items: /api/menu-items
- Categories: /api/categories
```

### Useful Commands

```bash
# Deploy backend
cd packages/backend && vercel --prod

# Deploy frontend
cd packages/frontend && vercel --prod

# View logs
vercel logs [deployment-url]

# Rollback deployment
vercel rollback

# Check environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove deployment
vercel rm [project-name]
```

### Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Share with Team**
   ```
   Send frontend URL to team members
   Have them test registration and features
   Collect feedback
   ```

2. **Monitor Usage**
   ```
   Check Vercel Analytics
   Monitor error logs
   Track API usage
   ```

3. **Plan Improvements**
   ```
   Review IMPROVEMENT_CHECKLIST.md
   Prioritize Phase 1 security fixes
   Schedule development sprints
   ```

4. **Set Up Staging**
   ```
   Create separate Vercel projects:
   - qr-menu-staging (for testing)
   - qr-menu-production (for customers)
   ```

---

## COST ESTIMATE

### Free Tier (Good for Testing)

**Vercel:**
- ✅ Free for 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ SSL certificates included
- ✅ Good for small team testing

**Neon Database:**
- ✅ Free tier: 10 GB storage
- ✅ Unlimited queries
- ✅ 100 hours compute/month

**Total: $0/month for testing**

### Paid Tier (For Production)

**Vercel Pro:** $20/month
- 1 TB bandwidth
- Better performance
- Analytics included

**Neon Scale:** $19/month
- Unlimited compute
- Better performance
- 24/7 uptime

**Total: ~$40/month**

---

## CONCLUSION

Your QR Menu SaaS is now deployed and ready for team testing! 🎉

**What you have:**
- ✅ Backend API running on Vercel
- ✅ Frontend app running on Vercel
- ✅ PostgreSQL database hosted on Neon/Supabase
- ✅ Automatic deployments from Git
- ✅ SSL certificates
- ✅ Production-grade hosting

**Remember:**
- This is for **internal testing only**
- Implement **Phase 1 security** before public launch
- Monitor usage and gather feedback
- Follow IMPLEMENTATION_PLAN.md for production readiness

---

**Questions or Issues?**

1. Check [Troubleshooting](#troubleshooting) section
2. Review Vercel deployment logs
3. Check database connection in Neon dashboard
4. Verify environment variables are set correctly

**Happy Testing!** 🚀

---

**Document End**

*Last Updated: 2025-11-16*
