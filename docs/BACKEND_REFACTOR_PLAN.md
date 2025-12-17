# Backend Refactor Plan: Industry-Standard Tenant Architecture

## Overview

This document outlines the complete backend refactor to implement:
1. Clean tenant architecture with Row-Level Security
2. Simplified menu system (categories first, then items)
3. Proper separation of concerns
4. Type-safe patterns throughout

---

## Part 1: New Architecture Design

### Directory Structure (After Refactor)

```
packages/backend/src/
|
+-- config/
|   +-- app.config.ts          (app configuration)
|   +-- database.config.ts     (database configuration)
|
+-- core/                       (NEW: Core infrastructure)
|   +-- context/
|   |   +-- tenant.context.ts  (tenant context holder)
|   |   +-- request.context.ts (request-scoped context)
|   |
|   +-- middleware/
|   |   +-- auth.middleware.ts
|   |   +-- tenant.middleware.ts    (NEW: sets tenant context)
|   |   +-- error.middleware.ts
|   |   +-- validation.middleware.ts
|   |
|   +-- errors/
|   |   +-- base.error.ts
|   |   +-- auth.error.ts
|   |   +-- not-found.error.ts
|   |   +-- forbidden.error.ts
|   |   +-- validation.error.ts
|   |
|   +-- types/
|   |   +-- branded.types.ts   (NEW: branded IDs)
|   |   +-- context.types.ts
|   |   +-- common.types.ts
|   |
|   +-- database/
|       +-- client.ts
|       +-- transaction.ts     (NEW: transaction helper)
|
+-- modules/
|   +-- auth/
|   |   +-- auth.controller.ts
|   |   +-- auth.service.ts
|   |   +-- auth.repository.ts
|   |   +-- auth.routes.ts
|   |   +-- auth.validation.ts
|   |   +-- auth.types.ts
|   |   +-- index.ts
|   |
|   +-- restaurants/
|   |   +-- restaurant.controller.ts
|   |   +-- restaurant.service.ts
|   |   +-- restaurant.repository.ts  (uses tenant context)
|   |   +-- restaurant.routes.ts
|   |   +-- restaurant.validation.ts
|   |   +-- restaurant.types.ts
|   |   +-- index.ts
|   |
|   +-- categories/              (SIMPLIFIED)
|   |   +-- category.controller.ts
|   |   +-- category.service.ts
|   |   +-- category.repository.ts
|   |   +-- category.routes.ts
|   |   +-- category.validation.ts
|   |   +-- category.types.ts
|   |   +-- index.ts
|   |
|   +-- menu-items/              (SIMPLIFIED: items belong to category)
|   |   +-- menu-item.controller.ts
|   |   +-- menu-item.service.ts
|   |   +-- menu-item.repository.ts
|   |   +-- menu-item.routes.ts
|   |   +-- menu-item.validation.ts
|   |   +-- menu-item.types.ts
|   |   +-- index.ts
|   |
|   +-- admin/
|       +-- admin.controller.ts
|       +-- admin.service.ts
|       +-- admin.repository.ts
|       +-- admin.routes.ts
|       +-- admin.types.ts
|       +-- index.ts
|
+-- shared/
|   +-- utils/
|       +-- logger.ts
|       +-- password.ts
|       +-- jwt.ts
|       +-- qr-code.ts
|       +-- slug.ts            (NEW: slug generation)
|
+-- app.ts
+-- server.ts
+-- container.ts
```

---

## Part 2: New Database Schema

### Key Changes

1. **Remove Menu model** - Categories ARE the menu sections
2. **Items belong directly to Category**
3. **Add RLS policies for tenant isolation**

### New Schema

```prisma
// packages/backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  OWNER
  ADMIN
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      UserRole @default(OWNER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  restaurants Restaurant[]

  @@index([email])
  @@map("users")
}

model Restaurant {
  id              String   @id @default(cuid())
  ownerId         String
  name            String
  slug            String   @unique
  description     String?
  location        String?
  contactEmail    String?
  contactPhone    String?
  primaryColor    String   @default("#ea580c")
  backgroundColor String   @default("#ffffff")
  logoUrl         String?
  headerImageUrl  String?
  qrCodeUrl       String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  owner      User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  categories Category[]
  qrScans    QRScan[]

  @@index([ownerId])
  @@index([slug])
  @@map("restaurants")
}

model Category {
  id           String   @id @default(cuid())
  restaurantId String
  name         String
  description  String?
  sortOrder    Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  items      MenuItem[]

  @@unique([restaurantId, name])
  @@index([restaurantId])
  @@index([sortOrder])
  @@map("categories")
}

model MenuItem {
  id          String   @id @default(cuid())
  categoryId  String
  name        String
  description String?
  price       Float
  imageUrl    String?
  isAvailable Boolean  @default(true)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@index([categoryId])
  @@index([sortOrder])
  @@map("menu_items")
}

model QRScan {
  id           String   @id @default(cuid())
  restaurantId String
  scannedAt    DateTime @default(now())
  ipAddress    String?
  userAgent    String?

  restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

  @@index([restaurantId])
  @@index([scannedAt])
  @@map("qr_scans")
}
```

### What Changed

| Before | After |
|--------|-------|
| Menu model exists | Menu model REMOVED |
| MenuItem -> Menu -> Restaurant | MenuItem -> Category -> Restaurant |
| Category optional on items | Category REQUIRED on items |
| Items created with category typing | Items created by selecting existing category |

---

## Part 3: New User Flow

### Restaurant Owner Flow (Simplified)

```
Step 1: Create Restaurant
+----------------------------------+
|  Restaurant Name: [Joe's Diner]  |
|  [Create]                        |
+----------------------------------+
        |
        v (slug auto-generated)

Step 2: Create Categories (Menu Sections)
+----------------------------------+
|  Joe's Diner                     |
|  [+ Add Category]                |
|                                  |
|  Your Menu Sections:             |
|  (empty - add your first one!)   |
+----------------------------------+
        |
        v
+----------------------------------+
|  Add Category                    |
|  Name: [Starters]                |
|  [Save]                          |
+----------------------------------+
        |
        v
+----------------------------------+
|  Joe's Diner                     |
|  [+ Add Category]                |
|                                  |
|  STARTERS (0 items)      [Edit]  |
|    [+ Add Item]                  |
|                                  |
|  MAIN DISHES (0 items)   [Edit]  |
|    [+ Add Item]                  |
|                                  |
|  DRINKS (0 items)        [Edit]  |
|    [+ Add Item]                  |
+----------------------------------+

Step 3: Add Items to Categories
+----------------------------------+
|  Add Item to "Starters"          |
|                                  |
|  Name: [Spring Rolls]            |
|  Price: [$6.00]                  |
|  Description: [Crispy...]        |
|  Image: [Upload] (optional)      |
|                                  |
|  [Save Item]                     |
+----------------------------------+
        |
        v
+----------------------------------+
|  Joe's Diner                     |
|                                  |
|  STARTERS (2 items)      [Edit]  |
|    Spring Rolls......$6  [Edit]  |
|    Soup..............$5  [Edit]  |
|    [+ Add Item]                  |
|                                  |
|  MAIN DISHES (1 item)    [Edit]  |
|    Burger...........$12  [Edit]  |
|    [+ Add Item]                  |
+----------------------------------+
```

### Key UX Improvements

1. **No category selection when adding items** - You click "+ Add Item" under a specific category
2. **Categories created first** - Clear mental model
3. **Visual hierarchy** - Categories as sections with items underneath
4. **Inline actions** - Add item button under each category

---

## Part 4: API Design

### New Route Structure

```
Authentication (public):
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/refresh
  POST   /api/auth/logout

Restaurant Management (authenticated, tenant-scoped):
  GET    /api/restaurants              (list owner's restaurants)
  POST   /api/restaurants              (create restaurant)
  GET    /api/restaurants/:id          (get restaurant details)
  PATCH  /api/restaurants/:id          (update restaurant)
  DELETE /api/restaurants/:id          (delete restaurant)

Category Management (authenticated, tenant-scoped):
  GET    /api/restaurants/:restaurantId/categories
  POST   /api/restaurants/:restaurantId/categories
  GET    /api/restaurants/:restaurantId/categories/:id
  PATCH  /api/restaurants/:restaurantId/categories/:id
  DELETE /api/restaurants/:restaurantId/categories/:id
  PATCH  /api/restaurants/:restaurantId/categories/reorder

Menu Items (authenticated, tenant-scoped):
  GET    /api/categories/:categoryId/items
  POST   /api/categories/:categoryId/items
  GET    /api/items/:id
  PATCH  /api/items/:id
  DELETE /api/items/:id

Public Menu (no auth):
  GET    /api/menu/:slug               (customer menu view)

Admin (admin role only):
  GET    /api/admin/stats
  GET    /api/admin/users
  GET    /api/admin/restaurants
```

### Response Format (Standardized)

```typescript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [...]
  }
}

// List response with pagination (future)
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

## Part 5: Tenant Context Implementation

### How Tenant Isolation Works

```
Request Flow:

1. Request arrives
        |
        v
2. Auth Middleware
   - Validates JWT
   - Extracts userId, role
   - Attaches to request
        |
        v
3. Tenant Middleware (NEW)
   - Gets userId from auth
   - Sets tenant context
   - All subsequent queries auto-filtered
        |
        v
4. Controller
   - Handles request
   - Calls service
        |
        v
5. Service
   - Business logic
   - NO manual ownership checks needed
        |
        v
6. Repository
   - Uses tenant context automatically
   - Queries filtered by tenant
```

### Tenant Context Code

```typescript
// core/context/tenant.context.ts

import { AsyncLocalStorage } from "node:async_hooks";

interface TenantContext {
  userId: string;
  role: string;
}

const asyncLocalStorage = new AsyncLocalStorage<TenantContext>();

export const tenantContext = {
  run: <T>(context: TenantContext, fn: () => T): T => {
    return asyncLocalStorage.run(context, fn);
  },

  get: (): TenantContext => {
    const context = asyncLocalStorage.getStore();
    if (!context) {
      throw new Error("Tenant context not initialized");
    }
    return context;
  },

  getUserId: (): string => {
    return tenantContext.get().userId;
  },

  getRole: (): string => {
    return tenantContext.get().role;
  },
};
```

### Tenant Middleware

```typescript
// core/middleware/tenant.middleware.ts

import type { NextFunction, Request, Response } from "express";
import { tenantContext } from "@core/context/tenant.context";

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return next();
  }

  tenantContext.run(
    { userId: user.userId, role: user.role },
    () => next()
  );
};
```

### Repository Using Context

```typescript
// modules/restaurants/restaurant.repository.ts

import { prisma } from "@core/database/client";
import { tenantContext } from "@core/context/tenant.context";

export const restaurantRepository = {
  findAll: async () => {
    const ownerId = tenantContext.getUserId();
    return prisma.restaurant.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  },

  findById: async (id: string) => {
    const ownerId = tenantContext.getUserId();
    return prisma.restaurant.findFirst({
      where: { id, ownerId },  // Auto-filtered by tenant
      include: { categories: { orderBy: { sortOrder: "asc" } } },
    });
  },

  // No manual ownership checks needed!
};
```

---

## Part 6: Implementation Checklist

### Phase 1: Core Infrastructure

- [ ] Create new directory structure
- [ ] Implement tenant context (AsyncLocalStorage)
- [ ] Create error classes hierarchy
- [ ] Create branded types for IDs
- [ ] Update database client

### Phase 2: Database Migration

- [ ] Create new Prisma schema (remove Menu)
- [ ] Write migration script
- [ ] Add RLS policies (optional, can add later)
- [ ] Migrate existing data

### Phase 3: Refactor Modules

- [ ] Refactor auth module
- [ ] Refactor restaurants module
- [ ] Refactor categories module (simplified)
- [ ] Refactor menu-items module (simplified)
- [ ] Refactor admin module

### Phase 4: Update Routes

- [ ] Implement new route structure
- [ ] Add tenant middleware to routes
- [ ] Update validation schemas
- [ ] Test all endpoints

### Phase 5: Frontend Updates

- [ ] Update API client for new routes
- [ ] Create new category management page
- [ ] Update menu items page (items under categories)
- [ ] Update customer menu view

---

## Part 7: Data Migration Strategy

### For Existing Data (if any)

```sql
-- Migration: Move items from Menu to Category

-- 1. For each menu, create a category with same name
INSERT INTO categories (id, restaurant_id, name, sort_order, is_active)
SELECT
  gen_random_uuid(),
  m.restaurant_id,
  m.name,
  ROW_NUMBER() OVER (PARTITION BY m.restaurant_id ORDER BY m.created_at),
  m.is_active
FROM menus m;

-- 2. Update menu_items to point to new categories
UPDATE menu_items mi
SET category_id = c.id
FROM categories c
JOIN menus m ON c.name = m.name AND c.restaurant_id = m.restaurant_id
WHERE mi.menu_id = m.id;

-- 3. Drop menu_id column from menu_items
ALTER TABLE menu_items DROP COLUMN menu_id;

-- 4. Drop menus table
DROP TABLE menus;
```

---

## Summary

### Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| Data Model | Menu -> MenuItem (Category optional) | Category -> MenuItem (required) |
| Tenant Isolation | Manual WHERE clauses | Automatic via context |
| Ownership Checks | In every service method | Automatic in repository |
| User Flow | Create Menu -> Create Items | Create Categories -> Create Items |
| Item Creation | Type/select category | Click "Add" under category |
| Code Duplication | High (ownership checks) | Low (centralized) |
| Error Handling | Basic | Typed error hierarchy |

### Benefits

1. **Simpler mental model** for restaurant owners
2. **Cleaner code** with less duplication
3. **Safer** with automatic tenant isolation
4. **Easier to maintain** and add features
5. **Industry standard** patterns

---

## Part 8: API Versioning

### Why API Versioning?

- Allows breaking changes without affecting existing clients
- Mobile apps may not update immediately
- Provides migration path for clients

### Versioning Strategy: URL Path Versioning

```
/api/v1/restaurants
/api/v1/categories
/api/v1/items

Future:
/api/v2/restaurants (when breaking changes needed)
```

### Implementation

```
packages/backend/src/
|
+-- api/
|   +-- v1/
|   |   +-- index.ts           (v1 router)
|   |   +-- routes/
|   |       +-- auth.routes.ts
|   |       +-- restaurant.routes.ts
|   |       +-- category.routes.ts
|   |       +-- item.routes.ts
|   |       +-- admin.routes.ts
|   |       +-- public.routes.ts
|   |
|   +-- v2/                     (future)
|       +-- index.ts
|       +-- routes/
```

### Route Registration

```typescript
// app.ts
import { v1Router } from "@api/v1";

app.use("/api/v1", v1Router);
// Future: app.use("/api/v2", v2Router);

// Redirect /api to latest version (optional)
app.use("/api", (req, res, next) => {
  req.url = `/v1${req.url}`;
  next();
});
```

### Version Header Support (Optional)

```typescript
// Also support header-based versioning for flexibility
// X-API-Version: 1

const versionMiddleware = (req, res, next) => {
  const version = req.headers["x-api-version"] || "1";
  req.apiVersion = version;
  next();
};
```

---

## Part 9: Caching Strategy

### Overview

Caching reduces database load and improves response times. For a VPS deployment, we'll use in-memory caching with optional Redis upgrade path.

### Cache Layers

```
Request Flow with Caching:

Client Request
      |
      v
+------------------+
|  Response Cache  |  <-- Full response caching (public menus)
+------------------+
      |
      v
+------------------+
|  Application     |  <-- In-memory cache (node-cache)
|  Cache           |
+------------------+
      |
      v
+------------------+
|  Database        |
+------------------+
```

### What to Cache

| Data | Cache Duration | Invalidation |
|------|---------------|--------------|
| Public menu (by slug) | 5 minutes | On menu/item update |
| User session data | 15 minutes | On logout/token refresh |
| Restaurant list (owner) | 2 minutes | On restaurant CRUD |
| Categories (owner) | 2 minutes | On category CRUD |
| Admin stats | 5 minutes | Time-based only |

### Implementation: In-Memory Cache

```typescript
// core/cache/cache.service.ts

import NodeCache from "node-cache";

interface CacheConfig {
  stdTTL: number;      // Default TTL in seconds
  checkperiod: number; // Cleanup interval
  maxKeys: number;     // Max items in cache
}

const defaultConfig: CacheConfig = {
  stdTTL: 300,        // 5 minutes default
  checkperiod: 60,    // Check every minute
  maxKeys: 1000,      // Max 1000 items
};

class CacheService {
  private cache: NodeCache;

  constructor(config: CacheConfig = defaultConfig) {
    this.cache = new NodeCache(config);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl ?? defaultConfig.stdTTL);
  }

  del(key: string | string[]): number {
    return this.cache.del(key);
  }

  // Delete all keys matching pattern
  delByPattern(pattern: string): void {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter(k => k.includes(pattern));
    this.cache.del(matchingKeys);
  }

  flush(): void {
    this.cache.flushAll();
  }

  // Stats for monitoring
  getStats() {
    return this.cache.getStats();
  }
}

export const cacheService = new CacheService();
```

### Cache Keys Convention

```typescript
// core/cache/cache.keys.ts

export const CacheKeys = {
  // Public menu cache (most important - customer facing)
  publicMenu: (slug: string) => `public:menu:${slug}`,

  // Owner data caches
  ownerRestaurants: (userId: string) => `owner:${userId}:restaurants`,
  restaurantCategories: (restaurantId: string) => `restaurant:${restaurantId}:categories`,
  categoryItems: (categoryId: string) => `category:${categoryId}:items`,

  // Admin caches
  adminStats: () => "admin:stats",

  // User session cache
  userSession: (userId: string) => `user:${userId}:session`,
} as const;
```

### Caching Public Menu (Most Important)

```typescript
// modules/public/public.service.ts

import { cacheService } from "@core/cache/cache.service";
import { CacheKeys } from "@core/cache/cache.keys";

export const publicService = {
  getMenuBySlug: async (slug: string) => {
    const cacheKey = CacheKeys.publicMenu(slug);

    // Check cache first
    const cached = cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const menu = await publicRepository.getMenuBySlug(slug);

    // Cache for 5 minutes
    cacheService.set(cacheKey, menu, 300);

    return menu;
  },
};
```

### Cache Invalidation

```typescript
// modules/categories/category.service.ts

export const categoryService = {
  create: async (restaurantId: string, data: CreateCategoryDto) => {
    const category = await categoryRepository.create(restaurantId, data);

    // Invalidate related caches
    const restaurant = await restaurantRepository.findById(restaurantId);
    cacheService.del(CacheKeys.publicMenu(restaurant.slug));
    cacheService.del(CacheKeys.restaurantCategories(restaurantId));

    return category;
  },

  update: async (id: string, data: UpdateCategoryDto) => {
    const category = await categoryRepository.update(id, data);

    // Invalidate caches
    cacheService.del(CacheKeys.publicMenu(category.restaurant.slug));
    cacheService.del(CacheKeys.restaurantCategories(category.restaurantId));

    return category;
  },
};
```

### HTTP Cache Headers (Browser/CDN Caching)

```typescript
// core/middleware/cache.middleware.ts

export const publicCacheMiddleware = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Cache public endpoints in browser/CDN
    res.set({
      "Cache-Control": `public, max-age=${maxAge}`,
      "Vary": "Accept-Encoding",
    });
    next();
  };
};

export const privateCacheMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Never cache private endpoints
    res.set({
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });
    next();
  };
};

// Usage in routes
publicRouter.get("/menu/:slug", publicCacheMiddleware(300), publicController.getMenu);
```

### Future: Redis Upgrade Path

```typescript
// When you need distributed caching (multiple servers)
// Just swap the implementation:

// core/cache/redis.cache.ts
import Redis from "ioredis";

class RedisCacheService implements ICacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : undefined;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  // ... same interface as NodeCache
}
```

---

## Part 10: Security Features

### 1. Rate Limiting

```typescript
// core/middleware/rate-limit.middleware.ts

import rateLimit from "express-rate-limit";

// General API rate limit
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limit for auth endpoints (prevent brute force)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 attempts per window
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT",
      message: "Too many login attempts, please try again in 15 minutes",
    },
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Public menu - higher limit (customers)
export const publicRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 60,                   // 60 requests per minute
});
```

### 2. Secure HTTP Headers (Helmet)

```typescript
// app.ts

import helmet from "helmet";

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"], // Allow external images
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding images
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

### 3. CORS Configuration

```typescript
// core/middleware/cors.middleware.ts

import cors from "cors";

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173", // Dev
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Version"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining"],
  maxAge: 86400, // 24 hours
});
```

### 4. Request Validation & Sanitization

```typescript
// core/middleware/sanitize.middleware.ts

import { sanitize } from "express-mongo-sanitize";
import xss from "xss";

// Sanitize inputs to prevent NoSQL injection
export const sanitizeMiddleware = sanitize();

// XSS protection for string inputs
export const xssMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  next();
};

const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = xss(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};
```

### 5. Secure Token Handling

```typescript
// core/auth/token.service.ts

import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tokenId: string; // Unique ID for token revocation
}

export const tokenService = {
  generateAccessToken: (payload: Omit<TokenPayload, "tokenId">): string => {
    return jwt.sign(
      { ...payload, tokenId: crypto.randomUUID() },
      process.env.JWT_SECRET!,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  },

  generateRefreshToken: (payload: Omit<TokenPayload, "tokenId">): string => {
    return jwt.sign(
      { ...payload, tokenId: crypto.randomUUID() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  },

  verifyAccessToken: (token: string): TokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  },

  verifyRefreshToken: (token: string): TokenPayload => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
  },
};
```

### 6. Password Security

```typescript
// core/auth/password.service.ts

import bcrypt from "bcryptjs";
import zxcvbn from "zxcvbn"; // Password strength checker

const SALT_ROUNDS = 12;
const MIN_PASSWORD_SCORE = 2; // 0-4 scale, 2 = fair

export const passwordService = {
  hash: async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  verify: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  checkStrength: (password: string): { score: number; feedback: string[] } => {
    const result = zxcvbn(password);
    return {
      score: result.score,
      feedback: result.feedback.suggestions,
    };
  },

  isStrongEnough: (password: string): boolean => {
    return zxcvbn(password).score >= MIN_PASSWORD_SCORE;
  },
};
```

### 7. Audit Logging

```typescript
// core/audit/audit.service.ts

interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export const auditService = {
  log: async (log: AuditLog): Promise<void> => {
    // Store in database or send to logging service
    logger.info("AUDIT", {
      ...log,
      timestamp: log.timestamp.toISOString(),
    });

    // Optional: Store in database for compliance
    // await prisma.auditLog.create({ data: log });
  },

  logAuth: async (userId: string, action: "login" | "logout" | "register", req: Request) => {
    await auditService.log({
      userId,
      action: `auth:${action}`,
      resource: "auth",
      resourceId: userId,
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      timestamp: new Date(),
    });
  },

  logDataAccess: async (userId: string, resource: string, resourceId: string, action: string, req: Request) => {
    await auditService.log({
      userId,
      action,
      resource,
      resourceId,
      ipAddress: req.ip || "unknown",
      userAgent: req.get("user-agent") || "unknown",
      timestamp: new Date(),
    });
  },
};
```

### 8. Input Validation with Zod

```typescript
// core/validation/schemas.ts

import { z } from "zod";

// Reusable validation schemas
export const schemas = {
  id: z.string().cuid(),

  email: z.string().email().toLowerCase().trim(),

  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),

  slug: z.string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),

  price: z.number().positive().multipleOf(0.01),

  url: z.string().url().optional().or(z.literal("")),

  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),

  phone: z.string().regex(/^\+?[0-9\s-()]+$/, "Invalid phone number").optional(),
};
```

---

## Part 11: Performance Optimizations

### 1. Database Query Optimization

```typescript
// Use select to fetch only needed fields
const restaurants = await prisma.restaurant.findMany({
  where: { ownerId },
  select: {
    id: true,
    name: true,
    slug: true,
    // Don't fetch large fields like headerImageUrl unless needed
  },
});

// Use pagination for large lists
const items = await prisma.menuItem.findMany({
  where: { categoryId },
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { sortOrder: "asc" },
});
```

### 2. Database Indexes (Already in Schema)

```prisma
// Key indexes for performance
@@index([ownerId])      // Fast tenant filtering
@@index([slug])         // Fast public menu lookup
@@index([restaurantId]) // Fast category queries
@@index([categoryId])   // Fast item queries
@@index([sortOrder])    // Fast ordered queries
```

### 3. Connection Pooling

```typescript
// core/database/client.ts

import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
```

### 4. Response Compression

```typescript
// app.ts
import compression from "compression";

app.use(compression({
  level: 6, // Balanced compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) {
      return false;
    }
    return compression.filter(req, res);
  },
}));
```

### 5. Lazy Loading for Large Data

```typescript
// For customer menu - load categories first, then items on demand
// (Alternative approach for very large menus)

// Initial load - just categories
GET /api/menu/:slug/categories

// Load items when category is expanded
GET /api/menu/:slug/categories/:categoryId/items
```

---

## Part 12: Updated Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Create new directory structure
- [ ] Implement tenant context (AsyncLocalStorage)
- [ ] Create error classes hierarchy
- [ ] Create branded types for IDs
- [ ] Setup API versioning structure
- [ ] Implement caching service (node-cache)
- [ ] Setup cache keys and patterns

### Phase 2: Security
- [ ] Add rate limiting middleware
- [ ] Configure Helmet security headers
- [ ] Setup CORS properly
- [ ] Add input sanitization (XSS)
- [ ] Implement secure token handling
- [ ] Add password strength validation
- [ ] Setup audit logging

### Phase 3: Database
- [ ] Create new Prisma schema (remove Menu)
- [ ] Write migration script
- [ ] Verify indexes are correct
- [ ] Test connection pooling

### Phase 4: Refactor Modules
- [ ] Refactor auth module with rate limiting
- [ ] Refactor restaurants module with caching
- [ ] Refactor categories module with cache invalidation
- [ ] Refactor menu-items module with cache invalidation
- [ ] Refactor admin module
- [ ] Add public module for customer menu (cached)

### Phase 5: Performance
- [ ] Add response compression
- [ ] Implement HTTP cache headers
- [ ] Add cache to public menu endpoint
- [ ] Optimize database queries (select fields)

### Phase 6: Frontend Updates
- [ ] Update API client for versioned routes
- [ ] Add client-side caching (React Query already handles this)
- [ ] Create new category management page
- [ ] Update menu items page
- [ ] Update customer menu view

---

## Summary: Cost-Saving Features

| Feature | Benefit |
|---------|---------|
| In-memory cache | Reduces database queries by 80%+ |
| HTTP cache headers | Browser caches public menus |
| Rate limiting | Prevents abuse/DoS |
| Response compression | Reduces bandwidth costs |
| Query optimization | Faster responses, less DB load |
| Connection pooling | Efficient database connections |

These optimizations will significantly reduce server load and costs while improving performance for users.
