# IMPLEMENTATION & FIX PLAN
## QR Menu SaaS Application - Detailed Roadmap

**Version:** 1.0
**Date:** 2025-11-16
**Target:** Production-Ready System
**Timeline:** 16 weeks (4 months)
**Team Size:** 2-3 developers

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Resource Requirements](#resource-requirements)
3. [Phase 1: Critical Security & Foundation](#phase-1-critical-security--foundation)
4. [Phase 2: Testing & Quality](#phase-2-testing--quality)
5. [Phase 3: Scalability & Performance](#phase-3-scalability--performance)
6. [Phase 4: Compliance & Optimization](#phase-4-compliance--optimization)
7. [Success Criteria](#success-criteria)
8. [Risk Mitigation](#risk-mitigation)
9. [Rollout Strategy](#rollout-strategy)

---

## EXECUTIVE SUMMARY

### Current State
- **Maturity:** MVP/Early Production (60%)
- **Test Coverage:** 0%
- **Security Score:** 4/10
- **Scalability:** Single server only
- **Code Compliance:** 60%

### Target State
- **Maturity:** Production-Ready (90%+)
- **Test Coverage:** 70%+
- **Security Score:** 8/10
- **Scalability:** Multi-server capable
- **Code Compliance:** 95%+

### Timeline Overview

```
Phase 1: Weeks 1-4   | Critical Security & Foundation
Phase 2: Weeks 5-8   | Testing & Quality
Phase 3: Weeks 9-12  | Scalability & Performance
Phase 4: Weeks 13-16 | Compliance & Optimization
```

### Investment Summary

| Phase | Duration | Effort (hrs) | Team Size | Cost Estimate* |
|-------|----------|--------------|-----------|----------------|
| Phase 1 | 4 weeks | 320h | 2 devs | $32,000 |
| Phase 2 | 4 weeks | 320h | 2 devs | $32,000 |
| Phase 3 | 4 weeks | 280h | 2 devs | $28,000 |
| Phase 4 | 4 weeks | 240h | 2 devs | $24,000 |
| **Total** | **16 weeks** | **1,160h** | **2 devs** | **$116,000** |

*Assumes $100/hour blended rate

---

## RESOURCE REQUIREMENTS

### Team Composition

**Required Roles:**
1. **Senior Full-Stack Developer** (1)
   - Lead implementation
   - Architecture decisions
   - Code reviews

2. **Full-Stack Developer** (1)
   - Feature implementation
   - Test development
   - Documentation

3. **DevOps Engineer** (0.5 FTE)
   - Infrastructure setup
   - CI/CD improvements
   - Monitoring configuration

4. **Security Consultant** (Advisory)
   - Security audit
   - Penetration testing
   - Best practices review

### Infrastructure Requirements

**Development:**
- Development PostgreSQL database
- Development Redis instance
- Local testing environment
- CI/CD runners

**Staging:**
- Staging environment (mirrors production)
- Staging database
- Redis cluster
- S3 bucket (or equivalent)

**Production:**
- Production database (managed PostgreSQL)
- Redis cluster (managed)
- S3 bucket (or equivalent)
- CDN (CloudFront, Cloudflare)
- Load balancer
- Monitoring tools (Sentry, APM)

**Estimated Monthly Infrastructure Cost:** $500-1,000

### Tools & Services

**Required Subscriptions:**
- Sentry (Error Tracking): ~$29/month
- APM Solution (New Relic/DataDog): ~$100/month
- Uptime Monitoring: ~$10/month
- CI/CD (GitHub Actions): Free tier likely sufficient
- Cloud Storage: ~$50/month

**Total Monthly Services:** ~$200-300

---

## PHASE 1: CRITICAL SECURITY & FOUNDATION
**Duration:** Weeks 1-4 (320 hours)
**Focus:** Fix critical security vulnerabilities and establish testing foundation

### Week 1: Security Foundations

#### Sprint Goals
- Set up rate limiting
- Implement input sanitization
- Begin testing infrastructure setup

#### Detailed Tasks

**Day 1-2: Rate Limiting (16h)**
```bash
# Install dependencies
npm install express-rate-limit --workspace=backend

# Implementation
1. Create rate-limit.middleware.ts
   - Configure general rate limit (100 req/15min per IP)
   - Configure auth rate limit (5 req/15min per IP)
   - Configure API rate limit (1000 req/hour per user)

2. Apply to routes in app.ts
   - Add general limiter to all routes
   - Add strict limiter to auth routes
   - Add user-specific limiter to API routes

3. Add rate limit headers
   - X-RateLimit-Limit
   - X-RateLimit-Remaining
   - X-RateLimit-Reset

4. Test rate limiting
   - Write integration tests
   - Test different endpoints
   - Verify headers present

Files affected:
- packages/backend/src/shared/middleware/rate-limit.middleware.ts (new)
- packages/backend/src/app.ts
- packages/backend/package.json
```

**Day 3-4: Input Sanitization (16h)**
```bash
# Install dependencies
npm install dompurify isomorphic-dompurify --workspace=frontend
npm install validator --workspace=backend

# Implementation
1. Backend sanitization
   - Create sanitize.middleware.ts
   - Sanitize all text inputs
   - Validate URLs, emails
   - Strip HTML tags where needed

2. Frontend sanitization
   - Create sanitize utility
   - Sanitize before rendering user content
   - Use DOMPurify for HTML content

3. Update validation schemas
   - Add sanitization to Zod schemas
   - Prevent script injection

4. Test XSS scenarios
   - Test script injection
   - Test HTML injection
   - Test URL manipulation

Files affected:
- packages/backend/src/shared/middleware/sanitize.middleware.ts (new)
- packages/frontend/src/lib/sanitize.ts (new)
- All validation files
```

**Day 5: Testing Infrastructure Setup (8h)**
```bash
# Backend testing setup
cd packages/backend
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# Create configuration
1. jest.config.js
2. setupTests.ts
3. testUtils.ts (database helpers)

# Frontend testing setup
cd packages/frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Create configuration
1. vitest.config.ts
2. setupTests.ts
3. testUtils.tsx (render helpers)

Files created:
- packages/backend/jest.config.js
- packages/backend/src/test/setupTests.ts
- packages/backend/src/test/testUtils.ts
- packages/frontend/vitest.config.ts
- packages/frontend/src/test/setupTests.ts
- packages/frontend/src/test/testUtils.tsx
```

### Week 2: Authentication Hardening

#### Sprint Goals
- Implement account lockout
- Enforce strong passwords
- Begin token blacklist implementation

#### Detailed Tasks

**Day 1-2: Account Lockout (16h)**
```typescript
// 1. Update User schema
model User {
  // ... existing fields
  failedLoginAttempts Int      @default(0)
  lockedUntil         DateTime?
  lastFailedLogin     DateTime?
}

// 2. Update auth.service.ts
async login(data: LoginRequest) {
  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError("Account is locked. Try again later.", 423);
  }

  // If password invalid
  if (!isPasswordValid) {
    await this.authRepository.incrementFailedAttempts(user.id);

    if (user.failedLoginAttempts + 1 >= 5) {
      // Lock for 30 minutes
      await this.authRepository.lockAccount(user.id, 30);
      throw new AppError("Account locked due to too many failed attempts.", 423);
    }

    throw new AppError("Invalid credentials", 401);
  }

  // If password valid, reset attempts
  await this.authRepository.resetFailedAttempts(user.id);
  // ... continue login
}

// 3. Add repository methods
// auth.repository.ts
async incrementFailedAttempts(userId: string) { }
async lockAccount(userId: string, minutes: number) { }
async resetFailedAttempts(userId: string) { }

// 4. Create database migration
// 5. Write tests
// 6. Add admin unlock endpoint
```

**Day 3-4: Strong Password Requirements (16h)**
```typescript
// 1. Update validation schema
export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number")
    .regex(/[^A-Za-z0-9]/, "Password must contain special character"),
});

// 2. Add password strength indicator
// packages/frontend/src/shared/components/PasswordStrengthMeter.tsx
export const PasswordStrengthMeter = ({ password }) => {
  const strength = calculateStrength(password);
  return (
    <div className="password-strength">
      <div className={`strength-bar strength-${strength}`} />
      <span>{strength} strength</span>
    </div>
  );
};

// 3. Update RegisterPage to show strength meter
// 4. Add password history (prevent reuse)
model PasswordHistory {
  id        String   @id @default(cuid())
  userId    String
  password  String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}

// 5. Check password history on change
// 6. Store last 5 passwords
// 7. Write tests
```

**Day 5: Token Blacklist - Part 1 (8h)**
```bash
# 1. Install Redis
npm install redis ioredis --workspace=backend

# 2. Create Redis client
// packages/backend/src/database/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
});

// 3. Create token blacklist service
// packages/backend/src/shared/services/token-blacklist.service.ts
export class TokenBlacklistService {
  async addToBlacklist(token: string, expiresIn: number): Promise<void> {
    await redis.setex(`blacklist:${token}`, expiresIn, 'true');
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await redis.get(`blacklist:${token}`);
    return result === 'true';
  }
}

# 4. Update environment variables
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 5. Update docker-compose for development
```

### Week 3: Cookie-Based Auth & CSRF

#### Sprint Goals
- Migrate from localStorage to httpOnly cookies
- Implement CSRF protection
- Complete token blacklist

#### Detailed Tasks

**Day 1-3: Cookie-Based Authentication (24h)**
```typescript
// 1. Update auth service to set cookies
// packages/backend/src/modules/auth/auth.controller.ts
async login(req: Request, res: Response) {
  const result = await this.authService.login(req.body);

  // Set httpOnly cookies
  res.cookie('access_token', result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Return user data only (no tokens)
  res.json({
    status: 'success',
    data: { user: result.user },
  });
}

// 2. Update auth middleware to read from cookies
// packages/backend/src/shared/middleware/auth.middleware.ts
export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    throw new AppError("No token provided", 401);
  }

  const payload = verifyAccessToken(token);
  req.user = payload;
  next();
};

// 3. Update frontend API client
// packages/frontend/src/lib/api-client.ts
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Remove request interceptor (no need to attach token)

// 4. Update AuthContext
// Remove localStorage usage
// Store user data in state only
// Fetch user data on mount if cookie exists

// 5. Update logout to clear cookies
async logout(req: Request, res: Response) {
  // Add token to blacklist
  const token = req.cookies.access_token;
  await this.tokenBlacklistService.addToBlacklist(token, 15 * 60);

  // Clear cookies
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');

  res.json({ status: 'success' });
}

// 6. Test authentication flow
// 7. Test logout
// 8. Test token expiration
```

**Day 4-5: CSRF Protection (16h)**
```bash
# 1. Install csurf
npm install csurf cookie-parser --workspace=backend

# 2. Configure CSRF middleware
// packages/backend/src/app.ts
import cookieParser from 'cookie-parser';
import csrf from 'csurf';

app.use(cookieParser());

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  }
});

// Apply to all routes except GET requests
app.use((req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  return csrfProtection(req, res, next);
});

// 3. Create CSRF token endpoint
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

# 4. Update frontend to fetch and send CSRF token
// packages/frontend/src/lib/api-client.ts
let csrfToken: string | null = null;

export const fetchCsrfToken = async () => {
  const response = await apiClient.get('/csrf-token');
  csrfToken = response.data.csrfToken;
};

// Add interceptor to include CSRF token
apiClient.interceptors.request.use((config) => {
  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase() || '')) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// 5. Fetch CSRF token on app load
// 6. Handle CSRF errors
// 7. Test CSRF protection
```

### Week 4: Email Verification & Testing

#### Sprint Goals
- Implement email verification
- Write critical security tests
- Complete Phase 1 deliverables

#### Detailed Tasks

**Day 1-3: Email Verification (24h)**
```typescript
// 1. Update User schema
model User {
  // ... existing fields
  isEmailVerified      Boolean   @default(false)
  emailVerificationToken String? @unique
  verificationTokenExpiry DateTime?
}

// 2. Install email service
npm install nodemailer --workspace=backend

// 3. Create email service
// packages/backend/src/shared/services/email.service.ts
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `,
    });
  }
}

// 4. Update auth service to send verification email
async register(data: RegisterRequest) {
  // ... create user

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await this.authRepository.setVerificationToken(user.id, verificationToken, tokenExpiry);

  // Send email
  await this.emailService.sendVerificationEmail(user.email, verificationToken);

  return result;
}

// 5. Create verification endpoint
async verifyEmail(token: string) {
  const user = await this.authRepository.findByVerificationToken(token);

  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }

  if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
    throw new AppError('Verification token has expired', 400);
  }

  await this.authRepository.markEmailAsVerified(user.id);

  return { message: 'Email verified successfully' };
}

// 6. Create frontend verification page
// 7. Block unverified users from certain actions
// 8. Add resend verification email endpoint
```

**Day 4-5: Critical Security Tests (16h)**
```typescript
// Test suite for authentication security
describe('Auth Security', () => {
  describe('Rate Limiting', () => {
    it('should block after 5 failed login attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' });
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' });

      expect(response.status).toBe(429);
    });

    it('should include rate limit headers', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  describe('Account Lockout', () => {
    it('should lock account after 5 failed attempts', async () => {
      // ... test implementation
    });

    it('should unlock account after timeout', async () => {
      // ... test implementation
    });
  });

  describe('Password Requirements', () => {
    it('should reject weak passwords', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com', password: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Password must');
    });

    it('should accept strong passwords', async () => {
      // ... test implementation
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize script tags', async () => {
      // ... test implementation
    });

    it('should sanitize HTML injection', async () => {
      // ... test implementation
    });
  });

  describe('Token Security', () => {
    it('should reject blacklisted tokens', async () => {
      // ... test implementation
    });

    it('should use httpOnly cookies', async () => {
      // ... test implementation
    });
  });

  describe('CSRF Protection', () => {
    it('should reject POST without CSRF token', async () => {
      // ... test implementation
    });

    it('should accept POST with valid CSRF token', async () => {
      // ... test implementation
    });
  });
});
```

### Phase 1 Deliverables

**Completed Features:**
- ✅ Rate limiting on all endpoints
- ✅ Input sanitization (XSS protection)
- ✅ Account lockout mechanism
- ✅ Strong password requirements
- ✅ Cookie-based authentication (httpOnly)
- ✅ CSRF protection
- ✅ Token blacklist (Redis)
- ✅ Email verification
- ✅ Testing infrastructure setup
- ✅ Critical security test suite

**Security Score:** Improved from 4/10 to 7/10

**Deployment:**
- Deploy to staging environment
- Run security tests
- Conduct basic penetration testing
- Document new security features

---

## PHASE 2: TESTING & QUALITY
**Duration:** Weeks 5-8 (320 hours)
**Focus:** Achieve 70%+ test coverage and improve code quality

### Week 5: Backend Test Coverage

#### Sprint Goals
- Complete auth module tests
- Test restaurant module
- Begin menu tests

#### Detailed Tasks (32h per module)

**Auth Module Tests:**
```typescript
// auth.service.test.ts
describe('AuthService', () => {
  describe('register', () => {
    it('should create new user with hashed password', async () => {});
    it('should throw error if email exists', async () => {});
    it('should generate JWT tokens', async () => {});
    it('should send verification email', async () => {});
    it('should log registration action', async () => {});
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {});
    it('should throw error for invalid email', async () => {});
    it('should throw error for invalid password', async () => {});
    it('should increment failed attempts', async () => {});
    it('should lock account after 5 failures', async () => {});
    it('should reset failed attempts on success', async () => {});
    it('should throw error for locked account', async () => {});
    it('should throw error for unverified email', async () => {});
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token', async () => {});
    it('should throw error for invalid refresh token', async () => {});
    it('should throw error for expired refresh token', async () => {});
  });
});

// auth.controller.test.ts (Integration tests)
// auth.middleware.test.ts
// auth.repository.test.ts
```

**Restaurant Module Tests:**
```typescript
// restaurants.service.test.ts
// restaurants.controller.test.ts
// restaurants.repository.test.ts
```

**Menu & MenuItem Tests:**
```typescript
// menus.service.test.ts
// menu-items.service.test.ts
// categories.service.test.ts
```

### Week 6: Frontend Test Coverage

#### Sprint Goals
- Test authentication flow
- Test main components
- Test custom hooks

**Component Tests:**
```typescript
// LoginPage.test.tsx
describe('LoginPage', () => {
  it('should render login form', () => {});
  it('should validate email format', () => {});
  it('should show error for invalid credentials', () => {});
  it('should redirect to dashboard on success', () => {});
  it('should show loading state during login', () => {});
});

// AuthContext.test.tsx
// ProtectedRoute.test.tsx
// RestaurantForm.test.tsx
// MenuItemForm.test.tsx
```

**Hook Tests:**
```typescript
// useAuth.test.tsx
// useRestaurants.test.tsx
// useMenus.test.tsx
```

### Week 7: E2E Tests & Integration

#### Sprint Goals
- Set up Playwright
- Write critical user flows
- Integration tests

**E2E Test Scenarios:**
```typescript
// e2e/auth.spec.ts
test('complete registration flow', async ({ page }) => {
  await page.goto('/register');
  await page.fill('[name="email"]', 'newuser@test.com');
  await page.fill('[name="password"]', 'StrongP@ss123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});

test('complete restaurant creation flow', async ({ page }) => {
  // Login
  // Navigate to restaurants
  // Create new restaurant
  // Verify restaurant appears in list
});

test('complete menu creation flow', async ({ page }) => {
  // Login
  // Select restaurant
  // Create menu
  // Add items
  // View public menu
});
```

### Week 8: Quality Improvements

#### Sprint Goals
- Improve test coverage to 70%
- Fix failing tests
- Add error boundaries
- Documentation

**Tasks:**
- Fill coverage gaps
- Optimize slow tests
- Add React error boundaries
- Document testing practices

### Phase 2 Deliverables

**Test Coverage:**
- ✅ Backend services: 80%+
- ✅ Backend repositories: 90%+
- ✅ Frontend components: 70%+
- ✅ E2E critical paths: 100%

**Quality Improvements:**
- ✅ Error boundaries implemented
- ✅ Test documentation
- ✅ CI runs all tests
- ✅ Coverage reports

---

## PHASE 3: SCALABILITY & PERFORMANCE
**Duration:** Weeks 9-12 (280 hours)
**Focus:** Enable multi-server deployment and optimize performance

### Week 9: Scalability Foundations

#### Sprint Goals
- Move logs to database
- Migrate QR codes to S3
- Configure database pooling

**Key Tasks:**

**1. Database Log Storage (16h)**
```typescript
// Create ActionLog table
model ActionLog {
  id         String   @id @default(cuid())
  level      String   // success, error, warning, info
  action     String
  details    String
  userId     String?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
  @@index([level])
}

// Update log-store service to use database
// Add log retention job (delete logs older than 90 days)
// Update admin logs endpoint
```

**2. S3 Migration (24h)**
```bash
# Install AWS SDK
npm install @aws-sdk/client-s3 --workspace=backend

# Create storage service
// packages/backend/src/shared/services/storage.service.ts
export class StorageService {
  private s3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }));

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }));
  }
}

# Update QR code service to use S3
# Migrate existing QR codes to S3
# Update database URLs
# Configure CloudFront CDN
```

**3. Database Connection Pooling (8h)**
```typescript
// packages/backend/src/database/client.ts
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error', 'warn'],
}).$extends({
  name: 'connectionPool',
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();

        // Log slow queries
        if (end - start > 1000) {
          logger.warn(`Slow query detected: ${model}.${operation} took ${end - start}ms`);
        }

        return result;
      },
    },
  },
});

// Configure pool size in DATABASE_URL
// DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"
```

### Week 10: Caching & Performance

#### Sprint Goals
- Implement Redis caching
- Add job queue
- Optimize queries

**Key Tasks:**

**1. Redis Caching Layer (24h)**
```typescript
// packages/backend/src/shared/services/cache.service.ts
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Cache public menu data
async getRestaurantBySlug(slug: string) {
  const cacheKey = `restaurant:${slug}`;

  // Try cache first
  let restaurant = await this.cacheService.get(cacheKey);

  if (!restaurant) {
    // Fetch from database
    restaurant = await this.restaurantsRepository.findBySlug(slug);

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, restaurant, 300);
  }

  return restaurant;
}

// Invalidate cache on update
// Add cache warming for popular restaurants
```

**2. Job Queue Implementation (24h)**
```bash
# Install Bull
npm install bull --workspace=backend

# Create queue service
// packages/backend/src/shared/services/queue.service.ts
import Bull from 'bull';

export const qrCodeQueue = new Bull('qr-code-generation', {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

export const emailQueue = new Bull('email-sending', {
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

# Create workers
// packages/backend/src/workers/qr-code.worker.ts
qrCodeQueue.process(async (job) => {
  const { restaurantId, slug } = job.data;

  // Generate QR code
  const qrCodeBuffer = await generateQRCode(slug);

  // Upload to S3
  const url = await storageService.uploadFile(
    `qr-codes/${restaurantId}.png`,
    qrCodeBuffer,
    'image/png'
  );

  // Update database
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { qrCodeUrl: url },
  });
});

# Update restaurant creation to use queue
await qrCodeQueue.add({
  restaurantId: restaurant.id,
  slug: restaurant.slug,
});

# Add job monitoring dashboard
```

**3. Query Optimization (16h)**
- Analyze slow queries
- Add select statements
- Optimize includes
- Add pagination
- Create database indexes

### Week 11: Monitoring Setup

#### Sprint Goals
- Integrate Sentry
- Set up APM
- Configure log aggregation

**Key Tasks:**

**1. Sentry Integration (8h)**
```bash
# Install Sentry
npm install @sentry/node @sentry/tracing --workspace=backend
npm install @sentry/react @sentry/tracing --workspace=frontend

# Backend configuration
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// After all routes
app.use(Sentry.Handlers.errorHandler());

# Frontend configuration
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_APP_ENV,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

# Test error reporting
```

**2. APM Setup (8h)**
- Choose APM solution (New Relic, DataDog, etc.)
- Install APM agent
- Configure metrics collection
- Create dashboards
- Set up alerts

**3. Log Aggregation (8h)**
- Set up log aggregation (CloudWatch, ELK, etc.)
- Configure log shipping
- Create log queries
- Set up log-based alerts

### Week 12: Optimization & Graceful Shutdown

#### Sprint Goals
- Frontend code splitting
- React optimization
- Graceful shutdown

**Key Tasks:**

**1. Code Splitting (16h)**
```typescript
// Lazy load routes
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const AdminOverviewPage = lazy(() => import('@/features/admin/pages/AdminOverviewPage'));

// Split by feature
const ownerFeature = () => import('@/features/owner');
const adminFeature = () => import('@/features/admin');

// Configure Vite code splitting
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
        },
      },
    },
  },
});

# Analyze bundle size
# Target: Main bundle < 300KB
```

**2. React Optimization (16h)**
- Add React.memo() to components (per CLAUDE.md)
- Add useCallback() for handlers
- Add useMemo() for computations
- Add displayName to components
- Benchmark rendering improvements

**3. Graceful Shutdown (8h)**
```typescript
// packages/backend/src/server.ts
const server = app.listen(PORT);

const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, starting graceful shutdown...');

  // Stop accepting new requests
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close database connections
      await prisma.$disconnect();
      logger.info('Database disconnected');

      // Close Redis connections
      await redis.quit();
      logger.info('Redis disconnected');

      // Wait for jobs to complete
      await qrCodeQueue.close();
      await emailQueue.close();
      logger.info('Job queues closed');

      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### Phase 3 Deliverables

**Scalability:**
- ✅ Multi-server capable
- ✅ Stateless application
- ✅ S3 for file storage
- ✅ Redis for caching
- ✅ Job queue implemented
- ✅ Database optimized

**Performance:**
- ✅ Response time < 200ms
- ✅ Bundle size < 300KB
- ✅ React rendering optimized
- ✅ Database queries optimized

**Monitoring:**
- ✅ Error tracking (Sentry)
- ✅ APM configured
- ✅ Log aggregation
- ✅ Graceful shutdown

---

## PHASE 4: COMPLIANCE & OPTIMIZATION
**Duration:** Weeks 13-16 (240 hours)
**Focus:** CLAUDE.md compliance and final optimizations

### Week 13-14: CLAUDE.md Compliance

#### Sprint Goals
- Rename files to snake_case
- Remove try/catch blocks
- Complete React optimization

**Key Tasks:**

**1. File Renaming (16h)**
```bash
# Create renaming script
node scripts/rename-to-snake-case.js

# Update all imports
# Update build configuration
# Test build
# Commit changes
```

**2. Remove Try/Catch (24h)**
- Implement error boundaries
- Refactor error handling
- Update error propagation
- Test error scenarios

**3. Complete React Optimization (40h)**
- Ensure all components use React.memo()
- Add comparison functions
- Add displayName to all components
- Performance testing

### Week 15: Database & API Improvements

#### Sprint Goals
- Migrate to UUID
- Fix currency type
- Add API versioning

**Key Tasks:**

**1. UUID Migration (16h)**
```typescript
// Create migration script
// Update schema to use uuid()
// Migrate data
// Test thoroughly
```

**2. Currency Fix (8h)**
```typescript
model MenuItem {
  price Decimal @db.Decimal(10, 2)
}
```

**3. API Versioning (8h)**
```typescript
// Add /api/v1 prefix
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/restaurants', restaurantsRouter);
// Update frontend API_URL
```

### Week 16: Documentation & Final Testing

#### Sprint Goals
- Complete documentation
- Final testing
- Production deployment

**Key Tasks:**

**1. API Documentation (16h)**
- Set up Swagger/OpenAPI
- Document all endpoints
- Add examples
- Generate interactive docs

**2. Architecture Documentation (16h)**
- Create diagrams
- Write ADRs
- Document design decisions
- Deployment guide

**3. Final Testing & Deployment (16h)**
- Run full test suite
- Conduct security audit
- Performance testing
- Deploy to production

### Phase 4 Deliverables

**Compliance:**
- ✅ CLAUDE.md 95%+ compliant
- ✅ Files renamed to snake_case
- ✅ Try/catch removed
- ✅ React fully optimized

**Documentation:**
- ✅ API documentation
- ✅ Architecture documentation
- ✅ Deployment guide
- ✅ Developer guide

**Production Ready:**
- ✅ All tests passing
- ✅ Security audit complete
- ✅ Performance benchmarks met
- ✅ Monitoring configured

---

## SUCCESS CRITERIA

### Technical Metrics

**Test Coverage:**
- [ ] Backend services: ≥ 80%
- [ ] Backend repositories: ≥ 90%
- [ ] Frontend components: ≥ 70%
- [ ] E2E critical paths: 100%
- [ ] Overall coverage: ≥ 70%

**Performance:**
- [ ] Page load time: < 2s
- [ ] API response time: < 200ms (p95)
- [ ] Time to Interactive: < 3s
- [ ] Bundle size: < 300KB (main)
- [ ] Database query time: < 100ms (p95)

**Security:**
- [ ] Security score: ≥ 8/10
- [ ] All OWASP Top 10 addressed
- [ ] Penetration test passed
- [ ] No critical vulnerabilities
- [ ] Rate limiting implemented
- [ ] Input sanitization complete

**Scalability:**
- [ ] Supports horizontal scaling
- [ ] Stateless application
- [ ] Cloud storage integrated
- [ ] Caching implemented
- [ ] Job queue operational

**Code Quality:**
- [ ] CLAUDE.md compliance: ≥ 95%
- [ ] No linter errors
- [ ] Type coverage: 100%
- [ ] Documentation complete

### Business Metrics

**Reliability:**
- [ ] Uptime: ≥ 99.9%
- [ ] Error rate: < 0.1%
- [ ] Mean time to recovery: < 15min

**Deployment:**
- [ ] CI/CD fully automated
- [ ] Zero-downtime deployment
- [ ] Rollback capability
- [ ] Staging environment

**Observability:**
- [ ] Error tracking active
- [ ] APM configured
- [ ] Log aggregation operational
- [ ] Alerts configured
- [ ] Dashboards created

---

## RISK MITIGATION

### Identified Risks

**1. Timeline Overrun**
- **Risk:** Features take longer than estimated
- **Mitigation:**
  - Weekly sprint reviews
  - Adjust scope if needed
  - Prioritize critical items
  - Add buffer time

**2. Breaking Changes**
- **Risk:** Cookie auth breaks existing sessions
- **Mitigation:**
  - Deploy to staging first
  - Gradual rollout
  - Maintain backward compatibility
  - User communication

**3. Performance Degradation**
- **Risk:** New features slow down system
- **Mitigation:**
  - Performance testing in staging
  - Monitor metrics closely
  - Rollback capability
  - Load testing

**4. Data Loss**
- **Risk:** Migration errors cause data loss
- **Mitigation:**
  - Full database backups
  - Test migrations thoroughly
  - Rollback scripts ready
  - Verify data integrity

**5. Third-Party Service Failures**
- **Risk:** S3, Redis, or email service down
- **Mitigation:**
  - Implement fallbacks
  - Circuit breakers
  - Graceful degradation
  - Multi-region setup

---

## ROLLOUT STRATEGY

### Deployment Phases

**Phase 1: Staging Deployment**
- Deploy all Phase 1 changes
- Run full test suite
- Security testing
- Performance testing
- User acceptance testing

**Phase 2: Canary Deployment**
- Deploy to 10% of production traffic
- Monitor for 48 hours
- Check error rates
- Verify performance metrics

**Phase 3: Gradual Rollout**
- Increase to 25% traffic
- Monitor for 24 hours
- Increase to 50% traffic
- Monitor for 24 hours
- Increase to 100% traffic

**Phase 4: Post-Deployment**
- Monitor for 1 week
- Gather user feedback
- Address any issues
- Document lessons learned

### Rollback Plan

**Trigger Conditions:**
- Error rate > 1%
- Response time > 2x baseline
- Critical feature broken
- Security incident

**Rollback Steps:**
1. Stop new deployments
2. Route traffic to previous version
3. Verify system stability
4. Investigate issue
5. Fix and redeploy

---

## CONCLUSION

This implementation plan provides a structured, phased approach to transforming the QR Menu SaaS application from MVP to production-ready status. By following this 16-week roadmap with dedicated resources, the application will achieve:

- **Production-grade security** (8/10 score)
- **Comprehensive test coverage** (70%+)
- **Horizontal scalability** (multi-server capable)
- **High performance** (<200ms API response)
- **Full compliance** (95%+ CLAUDE.md compliance)
- **Complete observability** (monitoring, logging, alerting)

The phased approach ensures that critical security issues are addressed first, followed by quality improvements, scalability enhancements, and finally compliance and optimization. Each phase builds upon the previous one, creating a solid foundation for a scalable, secure, and maintainable SaaS application.

**Next Steps:**
1. Review and approve this plan
2. Allocate resources
3. Set up project tracking
4. Begin Phase 1 implementation

---

**Document End**

*Version: 1.0*
*Last Updated: 2025-11-16*
