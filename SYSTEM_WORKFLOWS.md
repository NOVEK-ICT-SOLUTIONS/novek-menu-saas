# SYSTEM WORKFLOWS & USER JOURNEYS
## QR Menu SaaS - Technical User Flow Documentation

**Version:** 1.0
**Date:** 2025-11-16
**Audience:** Technical team members, developers, architects
**Purpose:** Detailed explanation of system behavior and user workflows

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [User Registration & Onboarding](#user-registration--onboarding)
3. [Restaurant Owner Complete Workflow](#restaurant-owner-complete-workflow)
4. [Customer Experience Workflow](#customer-experience-workflow)
5. [Admin Management Workflow](#admin-management-workflow)
6. [Technical Flow Diagrams](#technical-flow-diagrams)
7. [API Call Sequences](#api-call-sequences)
8. [Database State Changes](#database-state-changes)
9. [Error Scenarios & Edge Cases](#error-scenarios--edge-cases)

---

## OVERVIEW

### System Purpose

The QR Menu SaaS platform enables restaurant owners to create digital menus that customers can access by scanning QR codes. The system supports three user types:

1. **Restaurant Owners (OWNER role)** - Create and manage restaurants, menus, and items
2. **Administrators (ADMIN role)** - Platform-wide management and oversight
3. **Customers (CUSTOMER role / Public)** - View menus via QR codes (no account needed)

### High-Level Architecture

```
┌─────────────┐
│   Customer  │ Scans QR Code
│  (Public)   │────────────────┐
└─────────────┘                │
                               ▼
┌─────────────┐        ┌──────────────┐        ┌──────────────┐
│  Restaurant │───────▶│   Frontend   │───────▶│   Backend    │
│    Owner    │ Manage │   React SPA  │  API   │   Express    │
└─────────────┘        └──────────────┘        └──────────────┘
                               │                        │
┌─────────────┐                │                        │
│    Admin    │────────────────┘                        │
│             │ Monitor                                 ▼
└─────────────┘                                ┌──────────────┐
                                               │  PostgreSQL  │
                                               │   Database   │
                                               └──────────────┘
                                                        │
                                               ┌──────────────┐
                                               │  S3/Storage  │
                                               │  (QR Codes)  │
                                               └──────────────┘
```

---

## USER REGISTRATION & ONBOARDING

### 1. New Restaurant Owner Registration

**User Goal:** Create an account to start managing restaurant menus

**Entry Point:** User navigates to `/register` page

#### Frontend Flow

```typescript
// User Journey:
1. User lands on /register page
2. User sees registration form with fields:
   - Email (required, must be valid email)
   - Password (required, min 8 characters - will be strengthened in Phase 1)
3. User fills in email: "john@restaurantabc.com"
4. User fills in password: "SecurePass123"
5. User clicks "Register" button
```

#### Technical Flow - Registration

**Step 1: Form Validation (Client-Side)**

```typescript
// File: packages/frontend/src/features/auth/pages/RegisterPage.tsx

// React Hook Form with Zod validation
const form = useForm<RegisterFormData>({
  resolver: zodResolver(registerSchema),
});

const onSubmit = async (data: RegisterFormData) => {
  try {
    await register(data); // Calls AuthContext register method
    navigate('/dashboard'); // Redirect on success
  } catch (error) {
    // Show error message
  }
};

// Validation happens before API call:
// - Email format validation
// - Password length validation
```

**Step 2: API Request**

```typescript
// File: packages/frontend/src/features/auth/context/AuthContext.tsx

const register = async (data: RegisterRequest) => {
  // POST request to backend
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    email: 'john@restaurantabc.com',
    password: 'SecurePass123',
  });

  // Response structure:
  // {
  //   status: 'success',
  //   data: {
  //     user: { id, email, role },
  //     accessToken: 'jwt_access_token',
  //     refreshToken: 'jwt_refresh_token'
  //   }
  // }

  const { user, accessToken, refreshToken } = response.data.data;

  // Store tokens in localStorage (will be moved to cookies in Phase 1)
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));

  // Update React state
  setUser(user);
};
```

**HTTP Request:**
```http
POST /api/auth/register HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john@restaurantabc.com",
  "password": "SecurePass123"
}
```

**Step 3: Backend Processing**

```typescript
// File: packages/backend/src/modules/auth/auth.routes.ts

// Route definition
router.post(
  '/register',
  validate(registerSchema), // Zod validation middleware
  authController.register.bind(authController)
);

// File: packages/backend/src/modules/auth/auth.controller.ts

async register(req: Request, res: Response, next: NextFunction) {
  try {
    // Call service layer
    const result = await this.authService.register(req.body);

    // Return response
    res.status(201).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
}

// File: packages/backend/src/modules/auth/auth.service.ts

async register(data: RegisterRequest): Promise<AuthResponse> {
  const { email, password } = data;

  logger.info(`Registration attempt for email: ${email}`);

  // 1. Check if email already exists
  const existingUser = await this.authRepository.findUserByEmail(email);
  if (existingUser) {
    logger.warn(`Registration failed: Email already exists - ${email}`);
    throw new AppError('Email already registered', 409);
  }

  // 2. Hash password using bcryptjs
  const hashedPassword = await hashPassword(password);
  // bcryptjs hashes with salt automatically
  // Example hash: $2a$10$N9qo8uLOickgx2ZMRZoMye...

  // 3. Create user in database
  const user = await this.authRepository.createUser(email, hashedPassword);

  // 4. Generate JWT tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role, // 'OWNER' by default
  });
  // Access token expires in 15 minutes

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
  // Refresh token expires in 7 days

  // 5. Log the action for audit trail
  logAction('success', 'User Registration', `New user registered: ${email}`, email);

  // 6. Return user data and tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}
```

**Step 4: Database Operations**

```typescript
// File: packages/backend/src/modules/auth/auth.repository.ts

async createUser(email: string, hashedPassword: string): Promise<User> {
  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'OWNER', // Default role
    },
  });
}
```

**SQL Query Executed:**
```sql
INSERT INTO "User" (
  "id",
  "email",
  "password",
  "role",
  "createdAt",
  "updatedAt"
) VALUES (
  'cm1abc123xyz', -- Generated CUID
  'john@restaurantabc.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye...', -- Hashed password
  'OWNER',
  '2025-11-16 10:30:00',
  '2025-11-16 10:30:00'
) RETURNING *;
```

**Database State After Registration:**

```
User Table:
┌──────────────┬──────────────────────────┬─────────────────────────┬────────┬─────────────────────┐
│      id      │          email           │        password         │  role  │     createdAt       │
├──────────────┼──────────────────────────┼─────────────────────────┼────────┼─────────────────────┤
│ cm1abc123xyz │ john@restaurantabc.com   │ $2a$10$N9qo8uLO...     │ OWNER  │ 2025-11-16 10:30:00 │
└──────────────┴──────────────────────────┴─────────────────────────┴────────┴─────────────────────┘
```

**Step 5: Response & Redirect**

```typescript
// Backend sends response:
{
  "status": "success",
  "data": {
    "user": {
      "id": "cm1abc123xyz",
      "email": "john@restaurantabc.com",
      "role": "OWNER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Frontend receives response and:
// 1. Stores tokens in localStorage
// 2. Updates AuthContext state
// 3. Redirects to /dashboard
```

**Step 6: Dashboard Load**

```typescript
// User is now on /dashboard
// Protected route checks authentication
// File: packages/frontend/src/shared/components/ProtectedRoute.tsx

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Since user just registered, isAuthenticated = true
// Dashboard renders successfully
```

### Summary: Registration Complete

**Time:** ~2 seconds
**API Calls:** 1 (POST /api/auth/register)
**Database Writes:** 1 (User table INSERT)
**User State:** Logged in, redirected to dashboard
**Next Step:** Create first restaurant

---

## RESTAURANT OWNER COMPLETE WORKFLOW

### 2. Creating First Restaurant

**User Goal:** Set up a restaurant to start managing menus

**Entry Point:** User clicks "Create Restaurant" on dashboard

#### Frontend Flow

```typescript
// User Journey:
1. User is on /dashboard (empty state - no restaurants yet)
2. User sees "Create Your First Restaurant" button
3. User clicks button → navigates to /restaurants/new
4. User fills in restaurant form:
   - Restaurant Name: "The Pizza Palace"
   - Slug: "pizza-palace" (auto-generated from name, can be edited)
   - Location: "123 Main St, New York, NY"
   - Contact Email: "contact@pizzapalace.com"
   - Contact Phone: "+1-555-0123"
5. User clicks "Create Restaurant"
```

#### Technical Flow - Restaurant Creation

**Step 1: Form Submission**

```typescript
// File: packages/frontend/src/features/restaurants/pages/RestaurantsPage.tsx

const createRestaurant = async (data: CreateRestaurantRequest) => {
  const response = await apiClient.post('/restaurants', {
    name: 'The Pizza Palace',
    slug: 'pizza-palace',
    location: '123 Main St, New York, NY',
    contactEmail: 'contact@pizzapalace.com',
    contactPhone: '+1-555-0123',
  });

  // Response includes created restaurant
  return response.data.data;
};
```

**HTTP Request:**
```http
POST /api/restaurants HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "The Pizza Palace",
  "slug": "pizza-palace",
  "location": "123 Main St, New York, NY",
  "contactEmail": "contact@pizzapalace.com",
  "contactPhone": "+1-555-0123"
}
```

**Step 2: Authentication & Authorization**

```typescript
// Middleware chain:
// 1. authMiddleware - Verify JWT token
// 2. requireRole('OWNER', 'ADMIN') - Check user role

// File: packages/backend/src/shared/middleware/auth.middleware.ts

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  // "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  const [bearer, token] = authHeader.split(' ');

  // Verify JWT
  const payload = verifyAccessToken(token);
  // Decoded payload:
  // {
  //   userId: 'cm1abc123xyz',
  //   email: 'john@restaurantabc.com',
  //   role: 'OWNER',
  //   iat: 1234567890,
  //   exp: 1234567900
  // }

  // Attach to request
  req.user = payload;

  next();
};

// Role check passes because user.role = 'OWNER'
```

**Step 3: Backend Processing**

```typescript
// File: packages/backend/src/modules/restaurants/restaurants.controller.ts

async createRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const ownerId = req.user!.userId; // From auth middleware
    const restaurant = await this.restaurantsService.createRestaurant(
      ownerId,
      req.body
    );

    res.status(201).json({
      status: 'success',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
}

// File: packages/backend/src/modules/restaurants/restaurants.service.ts

async createRestaurant(ownerId: string, data: CreateRestaurantRequest) {
  logger.info(`Creating restaurant: ${data.name} for owner: ${ownerId}`);

  // 1. Check if slug is already taken
  const slugExists = await this.restaurantsRepository.checkSlugExists(data.slug);
  if (slugExists) {
    throw new AppError('Restaurant with this slug already exists', 409);
  }

  // 2. Create restaurant in database
  const restaurant = await this.restaurantsRepository.create(
    ownerId,
    data.name,
    data.slug
  );

  // 3. Generate QR code for the restaurant
  const qrCodeUrl = await generateQRCode(
    `${process.env.FRONTEND_URL}/menu/${data.slug}`
  );

  // 4. Update restaurant with QR code URL
  await this.restaurantsRepository.update(restaurant.id, {
    qrCodeUrl,
    location: data.location,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
  });

  logger.info(`Restaurant created: ${restaurant.id}`);

  return restaurant;
}
```

**Step 4: Database Operations**

```sql
-- 1. Check slug uniqueness
SELECT "id" FROM "Restaurant" WHERE "slug" = 'pizza-palace';
-- Result: Empty (slug is available)

-- 2. Create restaurant
INSERT INTO "Restaurant" (
  "id",
  "ownerId",
  "name",
  "slug",
  "primaryColor",
  "backgroundColor",
  "createdAt",
  "updatedAt"
) VALUES (
  'cm1def456uvw', -- Generated CUID
  'cm1abc123xyz', -- Owner's user ID
  'The Pizza Palace',
  'pizza-palace',
  '#ea580c', -- Default orange
  '#ffffff', -- Default white
  '2025-11-16 10:35:00',
  '2025-11-16 10:35:00'
) RETURNING *;

-- 3. Update with additional details after QR code generation
UPDATE "Restaurant"
SET
  "qrCodeUrl" = './uploads/qr-codes/cm1def456uvw.png',
  "location" = '123 Main St, New York, NY',
  "contactEmail" = 'contact@pizzapalace.com',
  "contactPhone" = '+1-555-0123',
  "updatedAt" = '2025-11-16 10:35:05'
WHERE "id" = 'cm1def456uvw'
RETURNING *;
```

**Step 5: QR Code Generation**

```typescript
// File: packages/backend/src/shared/utils/qr-code.ts

import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export const generateQRCode = async (url: string): Promise<string> => {
  // 1. Create QR code as buffer
  const qrCodeBuffer = await QRCode.toBuffer(url, {
    type: 'png',
    width: 500,
    margin: 2,
    errorCorrectionLevel: 'M',
  });

  // 2. Generate file path
  const restaurantId = 'cm1def456uvw';
  const fileName = `${restaurantId}.png`;
  const qrCodeDir = process.env.QR_CODE_DIR || './uploads/qr-codes';
  const filePath = path.join(qrCodeDir, fileName);

  // 3. Ensure directory exists
  if (!fs.existsSync(qrCodeDir)) {
    fs.mkdirSync(qrCodeDir, { recursive: true });
  }

  // 4. Save to filesystem
  fs.writeFileSync(filePath, qrCodeBuffer);

  logger.info(`QR code generated: ${filePath}`);

  return filePath;
};
```

**QR Code Content:**
```
https://yourapp.com/menu/pizza-palace

This URL encodes to a QR code image saved at:
./uploads/qr-codes/cm1def456uvw.png
```

**Database State After Restaurant Creation:**

```
User Table:
┌──────────────┬──────────────────────────┬─────────┐
│      id      │          email           │  role   │
├──────────────┼──────────────────────────┼─────────┤
│ cm1abc123xyz │ john@restaurantabc.com   │ OWNER   │
└──────────────┴──────────────────────────┴─────────┘

Restaurant Table:
┌──────────────┬──────────────┬──────────────────┬───────────────┬─────────────────────────────────────────┐
│      id      │   ownerId    │      name        │     slug      │           qrCodeUrl                     │
├──────────────┼──────────────┼──────────────────┼───────────────┼─────────────────────────────────────────┤
│ cm1def456uvw │ cm1abc123xyz │ The Pizza Palace │ pizza-palace  │ ./uploads/qr-codes/cm1def456uvw.png     │
└──────────────┴──────────────┴──────────────────┴───────────────┴─────────────────────────────────────────┘

Relationship: Restaurant.ownerId → User.id (Foreign Key)
```

**Step 6: Frontend Update**

```typescript
// Response received:
{
  "status": "success",
  "data": {
    "id": "cm1def456uvw",
    "ownerId": "cm1abc123xyz",
    "name": "The Pizza Palace",
    "slug": "pizza-palace",
    "qrCodeUrl": "./uploads/qr-codes/cm1def456uvw.png",
    "location": "123 Main St, New York, NY",
    "contactEmail": "contact@pizzapalace.com",
    "contactPhone": "+1-555-0123",
    "primaryColor": "#ea580c",
    "backgroundColor": "#ffffff",
    "createdAt": "2025-11-16T10:35:00.000Z",
    "updatedAt": "2025-11-16T10:35:05.000Z"
  }
}

// Frontend:
// 1. React Query cache is updated automatically
// 2. User is redirected to /restaurants (list view)
// 3. Restaurant appears in the list
// 4. User sees success message: "Restaurant created successfully"
```

### 3. Creating a Menu

**User Goal:** Create a menu for the restaurant (e.g., "Dinner Menu")

**Entry Point:** User clicks on restaurant → "Menus" tab → "Create Menu"

#### Technical Flow - Menu Creation

**Step 1: User Navigation**

```
/dashboard
  → /restaurants (list of restaurants)
  → /restaurants/cm1def456uvw (restaurant details)
  → Click "Menus" tab
  → Click "Create Menu" button
  → Modal/form appears
```

**Step 2: Form Submission**

```typescript
// User fills in:
// - Menu Name: "Dinner Menu"
// - Is Active: true (checkbox checked)

const createMenu = async () => {
  const response = await apiClient.post(
    '/menus/restaurant/cm1def456uvw',
    {
      name: 'Dinner Menu',
      isActive: true,
    }
  );
  return response.data.data;
};
```

**HTTP Request:**
```http
POST /api/menus/restaurant/cm1def456uvw HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Dinner Menu",
  "isActive": true
}
```

**Step 3: Backend Processing**

```typescript
// File: packages/backend/src/modules/menus/menus.service.ts

async createMenu(restaurantId: string, ownerId: string, data: CreateMenuRequest) {
  // 1. Verify ownership of restaurant
  const hasOwnership = await this.restaurantsRepository.checkOwnership(
    restaurantId,
    ownerId
  );

  if (!hasOwnership) {
    throw new AppError('Unauthorized to create menu for this restaurant', 403);
  }

  // 2. Create menu
  const menu = await this.menusRepository.create(restaurantId, data.name, data.isActive);

  return menu;
}
```

**Step 4: Database Operation**

```sql
-- Verify ownership
SELECT "id" FROM "Restaurant"
WHERE "id" = 'cm1def456uvw' AND "ownerId" = 'cm1abc123xyz';
-- Result: Found (ownership confirmed)

-- Create menu
INSERT INTO "Menu" (
  "id",
  "restaurantId",
  "name",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'cm1ghi789rst',
  'cm1def456uvw',
  'Dinner Menu',
  true,
  '2025-11-16 10:40:00',
  '2025-11-16 10:40:00'
) RETURNING *;
```

**Database State After Menu Creation:**

```
Menu Table:
┌──────────────┬──────────────┬──────────────┬──────────┐
│      id      │ restaurantId │     name     │ isActive │
├──────────────┼──────────────┼──────────────┼──────────┤
│ cm1ghi789rst │ cm1def456uvw │ Dinner Menu  │   true   │
└──────────────┴──────────────┴──────────────┴──────────┘

Relationship: Menu.restaurantId → Restaurant.id
```

### 4. Adding Menu Items

**User Goal:** Add food items to the menu

**Entry Point:** User selects menu → "Add Item" button

#### Technical Flow - Menu Item Creation

**Step 1: User Adds Item**

```
User fills in item details:
- Name: "Margherita Pizza"
- Description: "Classic pizza with tomato sauce, mozzarella, and basil"
- Price: 12.99
- Category: (dropdown - user selects "Pizza" or creates new category)
- Image URL: "https://example.com/margherita.jpg"
- Is Available: true
```

**Step 2: Category Creation (If New)**

If user creates a new category "Pizza":

```http
POST /api/categories/restaurant/cm1def456uvw HTTP/1.1

{
  "name": "Pizza",
  "sortOrder": 0
}
```

```sql
INSERT INTO "Category" (
  "id",
  "restaurantId",
  "name",
  "sortOrder",
  "createdAt",
  "updatedAt"
) VALUES (
  'cm1jkl012mno',
  'cm1def456uvw',
  'Pizza',
  0,
  '2025-11-16 10:45:00',
  '2025-11-16 10:45:00'
) RETURNING *;
```

**Step 3: Menu Item Creation**

```http
POST /api/menu-items/menu/cm1ghi789rst HTTP/1.1

{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato sauce, mozzarella, and basil",
  "price": 12.99,
  "categoryId": "cm1jkl012mno",
  "imageUrl": "https://example.com/margherita.jpg",
  "isAvailable": true
}
```

```sql
INSERT INTO "MenuItem" (
  "id",
  "menuId",
  "categoryId",
  "name",
  "description",
  "price",
  "imageUrl",
  "isAvailable",
  "createdAt",
  "updatedAt"
) VALUES (
  'cm1pqr345stu',
  'cm1ghi789rst',
  'cm1jkl012mno',
  'Margherita Pizza',
  'Classic pizza with tomato sauce, mozzarella, and basil',
  12.99,
  'https://example.com/margherita.jpg',
  true,
  '2025-11-16 10:46:00',
  '2025-11-16 10:46:00'
) RETURNING *;
```

**Complete Database State:**

```
Restaurant: The Pizza Palace (cm1def456uvw)
  └─ Menu: Dinner Menu (cm1ghi789rst) [ACTIVE]
      └─ Category: Pizza (cm1jkl012mno)
          └─ MenuItem: Margherita Pizza (cm1pqr345stu) - $12.99 [AVAILABLE]

┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE TABLES                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ User (cm1abc123xyz)                                                     │
│   └─ Restaurant (cm1def456uvw)                                          │
│        ├─ Menu (cm1ghi789rst)                                           │
│        │   └─ MenuItem (cm1pqr345stu) ──┐                               │
│        │                                 │                               │
│        └─ Category (cm1jkl012mno) ◄─────┘                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**User adds more items:**

```
Following same process, user adds:
1. Pepperoni Pizza - $14.99
2. Vegetarian Pizza - $13.99
3. Caesar Salad - $8.99 (new category: "Salads")
4. Tiramisu - $6.99 (new category: "Desserts")
```

**Final Database State:**

```
Menu Table:
┌──────────────┬──────────────┬──────────────┬──────────┐
│      id      │ restaurantId │     name     │ isActive │
├──────────────┼──────────────┼──────────────┼──────────┤
│ cm1ghi789rst │ cm1def456uvw │ Dinner Menu  │   true   │
└──────────────┴──────────────┴──────────────┴──────────┘

Category Table:
┌──────────────┬──────────────┬───────────┬───────────┐
│      id      │ restaurantId │   name    │ sortOrder │
├──────────────┼──────────────┼───────────┼───────────┤
│ cm1jkl012mno │ cm1def456uvw │ Pizza     │     0     │
│ cm1jkl013mno │ cm1def456uvw │ Salads    │     1     │
│ cm1jkl014mno │ cm1def456uvw │ Desserts  │     2     │
└──────────────┴──────────────┴───────────┴───────────┘

MenuItem Table:
┌──────────────┬──────────────┬──────────────┬───────────────────────┬────────┬──────────────┐
│      id      │    menuId    │  categoryId  │         name          │ price  │ isAvailable  │
├──────────────┼──────────────┼──────────────┼───────────────────────┼────────┼──────────────┤
│ cm1pqr345stu │ cm1ghi789rst │ cm1jkl012mno │ Margherita Pizza      │ 12.99  │     true     │
│ cm1pqr346stu │ cm1ghi789rst │ cm1jkl012mno │ Pepperoni Pizza       │ 14.99  │     true     │
│ cm1pqr347stu │ cm1ghi789rst │ cm1jkl012mno │ Vegetarian Pizza      │ 13.99  │     true     │
│ cm1pqr348stu │ cm1ghi789rst │ cm1jkl013mno │ Caesar Salad          │  8.99  │     true     │
│ cm1pqr349stu │ cm1ghi789rst │ cm1jkl014mno │ Tiramisu              │  6.99  │     true     │
└──────────────┴──────────────┴──────────────┴───────────────────────┴────────┴──────────────┘
```

### 5. Customizing Restaurant Branding

**User Goal:** Customize the look of the public menu page

**Entry Point:** Restaurant settings → "Customization" tab

#### Technical Flow

```typescript
// User updates:
// - Primary Color: #e74c3c (red)
// - Background Color: #2c3e50 (dark blue)
// - Logo URL: https://example.com/logo.png
// - Header Image: https://example.com/header.jpg

const updateRestaurant = async () => {
  const response = await apiClient.patch(
    '/restaurants/cm1def456uvw',
    {
      primaryColor: '#e74c3c',
      backgroundColor: '#2c3e50',
      logoUrl: 'https://example.com/logo.png',
      headerImageUrl: 'https://example.com/header.jpg',
    }
  );
  return response.data.data;
};
```

```sql
UPDATE "Restaurant"
SET
  "primaryColor" = '#e74c3c',
  "backgroundColor" = '#2c3e50',
  "logoUrl" = 'https://example.com/logo.png',
  "headerImageUrl" = 'https://example.com/header.jpg',
  "updatedAt" = '2025-11-16 10:50:00'
WHERE "id" = 'cm1def456uvw'
RETURNING *;
```

### 6. Downloading QR Code

**User Goal:** Get the QR code to display in restaurant

**Entry Point:** Restaurant → "QR Code" tab → "Download QR Code"

#### Technical Flow

```typescript
// Frontend fetches restaurant data (already has qrCodeUrl)
const restaurant = await apiClient.get('/restaurants/cm1def456uvw');

// QR Code URL: ./uploads/qr-codes/cm1def456uvw.png

// User clicks "Download" button
// Frontend creates download link
const downloadQRCode = () => {
  const link = document.createElement('a');
  link.href = `/api/restaurants/${restaurantId}/qr-code`;
  link.download = `${restaurant.name}-qr-code.png`;
  link.click();
};

// Backend serves the file
router.get('/:id/qr-code', async (req, res) => {
  const restaurant = await restaurantsService.getRestaurantById(req.params.id);
  const filePath = restaurant.qrCodeUrl;
  res.sendFile(path.resolve(filePath));
});
```

**User Action:**
1. Downloads QR code PNG file
2. Prints QR code
3. Places on restaurant table/entrance
4. Customers can now scan to view menu

---

## CUSTOMER EXPERIENCE WORKFLOW

### 7. Customer Scans QR Code

**Customer Goal:** View restaurant menu

**Entry Point:** Customer scans QR code with phone camera

#### Technical Flow - QR Code Scan

**Step 1: QR Code Scan**

```
Customer's phone camera app scans QR code
QR code contains URL: https://yourapp.com/menu/pizza-palace

Phone shows notification: "Open in browser?"
Customer taps → Browser opens URL
```

**Step 2: Frontend Route Handling**

```typescript
// URL: https://yourapp.com/menu/pizza-palace

// Route matches: /menu/:slug
// File: packages/frontend/src/routes/AppRoutes.tsx

<Route path="/menu/:slug" element={<CustomerMenuPage />} />

// Also supports: /:slug (shorter URL)
<Route path="/:slug" element={<CustomerMenuPage />} />
```

**Step 3: Page Load & API Request**

```typescript
// File: packages/frontend/src/features/restaurants/pages/CustomerMenuPage.tsx

const CustomerMenuPage = () => {
  const { slug } = useParams(); // "pizza-palace"

  // Fetch restaurant data (includes menus, items, categories)
  const { data: restaurant, isLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => getRestaurantBySlug(slug),
  });

  // API call made:
  // GET /api/restaurants/slug/pizza-palace
};
```

**HTTP Request:**
```http
GET /api/restaurants/slug/pizza-palace HTTP/1.1
Host: localhost:3000
User-Agent: Mozilla/5.0 (iPhone...)
```

**Step 4: Backend Processing**

```typescript
// File: packages/backend/src/modules/restaurants/restaurants.controller.ts

async getRestaurantBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;

    // Get restaurant data
    const restaurant = await this.restaurantsService.getRestaurantBySlug(slug);

    // Track QR scan for analytics
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    await this.restaurantsService.trackQRScan(
      restaurant.id,
      ipAddress,
      userAgent
    );

    res.json({
      status: 'success',
      data: restaurant,
    });
  } catch (error) {
    next(error);
  }
}
```

**Step 5: Database Query**

```sql
-- Fetch restaurant with all related data
SELECT
  r.*,
  m."id" as "menu_id",
  m."name" as "menu_name",
  m."isActive" as "menu_isActive",
  mi."id" as "item_id",
  mi."name" as "item_name",
  mi."description" as "item_description",
  mi."price" as "item_price",
  mi."imageUrl" as "item_imageUrl",
  mi."isAvailable" as "item_isAvailable",
  c."id" as "category_id",
  c."name" as "category_name",
  c."sortOrder" as "category_sortOrder"
FROM "Restaurant" r
LEFT JOIN "Menu" m ON m."restaurantId" = r."id"
LEFT JOIN "MenuItem" mi ON mi."menuId" = m."id"
LEFT JOIN "Category" c ON mi."categoryId" = c."id"
WHERE r."slug" = 'pizza-palace'
  AND m."isActive" = true
  AND mi."isAvailable" = true
ORDER BY c."sortOrder" ASC, mi."name" ASC;

-- Track QR scan
INSERT INTO "QRScan" (
  "id",
  "restaurantId",
  "scannedAt",
  "ipAddress",
  "userAgent"
) VALUES (
  'cm1vwx678yza',
  'cm1def456uvw',
  '2025-11-16 11:00:00',
  '192.168.1.100',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)...'
);
```

**Response Data Structure:**

```json
{
  "status": "success",
  "data": {
    "id": "cm1def456uvw",
    "name": "The Pizza Palace",
    "slug": "pizza-palace",
    "location": "123 Main St, New York, NY",
    "contactEmail": "contact@pizzapalace.com",
    "contactPhone": "+1-555-0123",
    "primaryColor": "#e74c3c",
    "backgroundColor": "#2c3e50",
    "logoUrl": "https://example.com/logo.png",
    "headerImageUrl": "https://example.com/header.jpg",
    "menus": [
      {
        "id": "cm1ghi789rst",
        "name": "Dinner Menu",
        "isActive": true,
        "menuItems": [
          {
            "id": "cm1pqr345stu",
            "name": "Margherita Pizza",
            "description": "Classic pizza with tomato sauce, mozzarella, and basil",
            "price": 12.99,
            "imageUrl": "https://example.com/margherita.jpg",
            "isAvailable": true,
            "category": {
              "id": "cm1jkl012mno",
              "name": "Pizza",
              "sortOrder": 0
            }
          },
          {
            "id": "cm1pqr346stu",
            "name": "Pepperoni Pizza",
            "description": "Classic pepperoni pizza",
            "price": 14.99,
            "imageUrl": "https://example.com/pepperoni.jpg",
            "isAvailable": true,
            "category": {
              "id": "cm1jkl012mno",
              "name": "Pizza",
              "sortOrder": 0
            }
          },
          // ... more items
        ]
      }
    ],
    "categories": [
      {
        "id": "cm1jkl012mno",
        "name": "Pizza",
        "sortOrder": 0
      },
      {
        "id": "cm1jkl013mno",
        "name": "Salads",
        "sortOrder": 1
      },
      {
        "id": "cm1jkl014mno",
        "name": "Desserts",
        "sortOrder": 2
      }
    ]
  }
}
```

**Step 6: Frontend Rendering**

```typescript
// Customer sees:
// 1. Restaurant header with logo and cover image
// 2. Restaurant name and contact info
// 3. Menu categorized by sections:
//    - Pizza (3 items)
//    - Salads (1 item)
//    - Desserts (1 item)
// 4. Each item shows:
//    - Image (if provided)
//    - Name
//    - Description
//    - Price (formatted with $ symbol)
//    - Availability status

// Styled with restaurant's custom colors:
// - Primary color (#e74c3c) for headings, buttons
// - Background color (#2c3e50) for header

// Page is fully responsive:
// - Mobile: Single column, touch-friendly
// - Tablet: Two columns
// - Desktop: Multiple columns (grid)
```

**QR Scan Analytics Tracked:**

```
QRScan Table:
┌──────────────┬──────────────┬─────────────────────┬─────────────────┬─────────────────────────┐
│      id      │ restaurantId │     scannedAt       │   ipAddress     │      userAgent          │
├──────────────┼──────────────┼─────────────────────┼─────────────────┼─────────────────────────┤
│ cm1vwx678yza │ cm1def456uvw │ 2025-11-16 11:00:00 │ 192.168.1.100   │ Mozilla/5.0 (iPhone...) │
└──────────────┴──────────────┴─────────────────────┴─────────────────┴─────────────────────────┘
```

### Customer Experience Summary

**Total Time:** 1-3 seconds (depending on network)
**API Calls:** 1 (GET /api/restaurants/slug/:slug)
**Database Reads:** 1 complex query with joins
**Database Writes:** 1 (QRScan insert)
**User Experience:**
- No login required
- Fast loading
- Mobile-optimized
- Branded with restaurant colors
- Easy to browse menu

---

## ADMIN MANAGEMENT WORKFLOW

### 8. Admin User Journey

**Admin Goal:** Monitor platform, manage users, view analytics

**Entry Point:** Admin logs in → Redirected to /admin dashboard

#### Admin Capabilities

**1. View System Statistics**

```typescript
// Admin dashboard loads
const { data: stats } = useQuery({
  queryKey: ['admin-stats'],
  queryFn: getAdminStats,
});

// API Call:
// GET /api/admin/stats

// Response:
{
  "totalUsers": 150,
  "totalRestaurants": 85,
  "totalMenus": 120,
  "totalMenuItems": 1250,
  "totalQRScans": 15680,
  "recentUsers": [...],
  "recentRestaurants": [...],
  "scansByMonth": [...]
}
```

**2. View All Users**

```http
GET /api/admin/users HTTP/1.1
Authorization: Bearer <admin-jwt-token>
```

```typescript
// Returns list of all users
{
  "status": "success",
  "data": [
    {
      "id": "cm1abc123xyz",
      "email": "john@restaurantabc.com",
      "role": "OWNER",
      "createdAt": "2025-11-16T10:30:00.000Z",
      "restaurants": [
        {
          "id": "cm1def456uvw",
          "name": "The Pizza Palace",
          "slug": "pizza-palace"
        }
      ]
    },
    // ... more users
  ]
}
```

**3. Change User Role**

```http
PATCH /api/admin/users/cm1abc123xyz/role HTTP/1.1
Content-Type: application/json

{
  "role": "ADMIN"
}
```

```sql
UPDATE "User"
SET "role" = 'ADMIN', "updatedAt" = NOW()
WHERE "id" = 'cm1abc123xyz'
RETURNING *;
```

**4. View Action Logs**

```http
GET /api/admin/logs HTTP/1.1
```

```typescript
// Returns audit log of all system actions
{
  "status": "success",
  "data": [
    {
      "level": "success",
      "action": "User Registration",
      "details": "New user registered: john@restaurantabc.com",
      "userId": "john@restaurantabc.com",
      "timestamp": "2025-11-16T10:30:00.000Z"
    },
    {
      "level": "success",
      "action": "Restaurant Created",
      "details": "New restaurant: The Pizza Palace",
      "userId": "john@restaurantabc.com",
      "timestamp": "2025-11-16T10:35:00.000Z"
    },
    // ... more logs
  ]
}
```

**5. View Restaurant Analytics**

```http
GET /api/admin/restaurants/cm1def456uvw HTTP/1.1
```

```typescript
// Detailed restaurant analytics
{
  "status": "success",
  "data": {
    "restaurant": {
      "id": "cm1def456uvw",
      "name": "The Pizza Palace",
      "owner": {
        "email": "john@restaurantabc.com"
      }
    },
    "stats": {
      "totalMenus": 1,
      "totalMenuItems": 5,
      "totalQRScans": 45,
      "scansByDate": [
        { "date": "2025-11-15", "count": 12 },
        { "date": "2025-11-16", "count": 33 }
      ],
      "scansByHour": [
        { "hour": 11, "count": 8 },
        { "hour": 12, "count": 15 },
        { "hour": 13, "count": 10 }
      ]
    }
  }
}
```

---

## TECHNICAL FLOW DIAGRAMS

### Complete User Registration Flow

```
┌──────────┐
│  User    │
│ Browser  │
└────┬─────┘
     │
     │ 1. Navigate to /register
     │
     ▼
┌─────────────────────────────────┐
│  Frontend React App             │
│  /register page                 │
│                                 │
│  - Email input                  │
│  - Password input               │
│  - Register button              │
└────────┬────────────────────────┘
         │
         │ 2. Form submission
         │    POST /api/auth/register
         │    { email, password }
         │
         ▼
┌─────────────────────────────────┐
│  Backend Express Server         │
│                                 │
│  Middleware Stack:              │
│  ┌───────────────────────────┐  │
│  │ 1. Helmet (security)      │  │
│  │ 2. CORS                   │  │
│  │ 3. Body parser            │  │
│  │ 4. Validation (Zod)       │  │
│  └───────────────────────────┘  │
│                                 │
│  Route Handler:                 │
│  /api/auth/register             │
└────────┬────────────────────────┘
         │
         │ 3. Controller calls Service
         │
         ▼
┌─────────────────────────────────┐
│  Auth Service                   │
│                                 │
│  1. Check email exists          │──┐
│  2. Hash password               │  │
│  3. Create user                 │  │
│  4. Generate JWT tokens         │  │
│  5. Log action                  │  │
└────────┬────────────────────────┘  │
         │                            │
         │ 4. Repository operations   │
         │                            │
         ▼                            │
┌─────────────────────────────────┐  │
│  Auth Repository                │  │
│                                 │  │
│  - findUserByEmail()            │◄─┘
│  - createUser()                 │──┐
│                                 │  │
└────────┬────────────────────────┘  │
         │                            │
         │ 5. Database queries        │
         │                            │
         ▼                            │
┌─────────────────────────────────┐  │
│  PostgreSQL Database            │  │
│                                 │  │
│  User Table:                    │  │
│  ┌────────────────────────────┐ │  │
│  │ INSERT INTO User ...       │◄┘  │
│  │ RETURNING *                │    │
│  └────────────────────────────┘ │  │
└────────┬────────────────────────┘  │
         │                            │
         │ 6. Return user data        │
         │                            │
         ▼                            │
┌─────────────────────────────────┐  │
│  Response to Frontend           │  │
│                                 │  │
│  {                              │  │
│    user: { id, email, role },   │  │
│    accessToken: "jwt...",       │  │
│    refreshToken: "jwt..."       │  │
│  }                              │  │
└────────┬────────────────────────┘  │
         │                            │
         │ 7. Store tokens            │
         │    Update state            │
         │    Redirect to /dashboard  │
         │                            │
         ▼                            │
┌─────────────────────────────────┐  │
│  User Dashboard                 │  │
│  (Logged in)                    │  │
└─────────────────────────────────┘  │
```

### Restaurant & Menu Creation Flow

```
┌────────────────────────────────────────────────────────────┐
│                    RESTAURANT OWNER FLOW                   │
└────────────────────────────────────────────────────────────┘

Step 1: Create Restaurant
─────────────────────────
Owner → Dashboard → "Create Restaurant"
  │
  ▼
POST /api/restaurants
{ name, slug, location, contactEmail, contactPhone }
  │
  ▼
Backend:
  1. Verify slug uniqueness
  2. Create restaurant record
  3. Generate QR code → Save to filesystem
  4. Update restaurant with QR URL
  │
  ▼
Database:
  INSERT INTO Restaurant (...)
  UPDATE Restaurant SET qrCodeUrl = ...
  │
  ▼
Response: Restaurant data (includes QR code URL)

Step 2: Create Menu
────────────────────
Owner → Restaurant → "Create Menu"
  │
  ▼
POST /api/menus/restaurant/:restaurantId
{ name, isActive }
  │
  ▼
Backend:
  1. Verify ownership
  2. Create menu record
  │
  ▼
Database:
  INSERT INTO Menu (restaurantId, name, isActive, ...)
  │
  ▼
Response: Menu data

Step 3: Create Category
────────────────────────
Owner → Restaurant → "Create Category"
  │
  ▼
POST /api/categories/restaurant/:restaurantId
{ name, sortOrder }
  │
  ▼
Database:
  INSERT INTO Category (restaurantId, name, sortOrder, ...)
  │
  ▼
Response: Category data

Step 4: Add Menu Items
───────────────────────
Owner → Menu → "Add Item"
  │
  ▼
POST /api/menu-items/menu/:menuId
{ name, description, price, categoryId, imageUrl, isAvailable }
  │
  ▼
Backend:
  1. Verify menu ownership
  2. Create menu item
  │
  ▼
Database:
  INSERT INTO MenuItem (menuId, categoryId, name, price, ...)
  │
  ▼
Response: Menu item data

Step 5: Customize Branding
───────────────────────────
Owner → Restaurant → "Customization"
  │
  ▼
PATCH /api/restaurants/:id
{ primaryColor, backgroundColor, logoUrl, headerImageUrl }
  │
  ▼
Database:
  UPDATE Restaurant SET colors, images ...
  │
  ▼
Response: Updated restaurant data

Step 6: Download QR Code
─────────────────────────
Owner → Restaurant → "Download QR Code"
  │
  ▼
GET /api/restaurants/:id/qr-code
  │
  ▼
Backend: Serve QR code image file
  │
  ▼
Owner: Saves and prints QR code
```

### Customer Viewing Flow

```
┌────────────────────────────────────────────────────────────┐
│                    CUSTOMER FLOW                           │
└────────────────────────────────────────────────────────────┘

Step 1: Scan QR Code
────────────────────
Customer scans QR code at restaurant
  │
  ▼
Phone camera reads: https://yourapp.com/menu/pizza-palace
  │
  ▼
Phone opens browser with URL

Step 2: Page Load
─────────────────
Browser → GET /menu/pizza-palace
  │
  ▼
Frontend React App loads CustomerMenuPage
  │
  ▼
API Call: GET /api/restaurants/slug/pizza-palace
  │
  ▼
Backend:
  1. Find restaurant by slug
  2. Include menus, menu items, categories
  3. Track QR scan (INSERT into QRScan table)
  │
  ▼
Database Query:
  SELECT r.*, m.*, mi.*, c.*
  FROM Restaurant r
  LEFT JOIN Menu m ON m.restaurantId = r.id
  LEFT JOIN MenuItem mi ON mi.menuId = m.id
  LEFT JOIN Category c ON mi.categoryId = c.id
  WHERE r.slug = 'pizza-palace'
    AND m.isActive = true
    AND mi.isAvailable = true
  │
  ▼
Response: Complete restaurant data with menu structure
  │
  ▼
Frontend renders:
  - Restaurant header (logo, cover image)
  - Restaurant info (name, location, contact)
  - Menu items organized by category
  - Styled with custom colors

Step 3: Customer Browses
─────────────────────────
Customer scrolls through menu
Views item details (name, description, price, image)
No login required
No ordering (view-only in current implementation)
```

---

## API CALL SEQUENCES

### Complete Owner Onboarding Sequence

```
1. Registration
   POST /api/auth/register
   ↓
   Response: { user, accessToken, refreshToken }

2. Dashboard Load
   GET /api/restaurants (with Auth header)
   ↓
   Response: [] (empty - no restaurants yet)

3. Create Restaurant
   POST /api/restaurants
   Body: { name, slug, location, contactEmail, contactPhone }
   ↓
   Response: { restaurant with qrCodeUrl }

4. Fetch Restaurant Details
   GET /api/restaurants/:id
   ↓
   Response: { restaurant with menus: [] }

5. Create Menu
   POST /api/menus/restaurant/:restaurantId
   Body: { name, isActive: true }
   ↓
   Response: { menu }

6. Create Categories (multiple calls)
   POST /api/categories/restaurant/:restaurantId
   Body: { name: "Pizza", sortOrder: 0 }
   ↓
   POST /api/categories/restaurant/:restaurantId
   Body: { name: "Salads", sortOrder: 1 }
   ↓
   Response: { category } (for each)

7. Add Menu Items (multiple calls)
   POST /api/menu-items/menu/:menuId
   Body: { name, description, price, categoryId, imageUrl, isAvailable }
   ↓
   (Repeat for each item)
   ↓
   Response: { menuItem } (for each)

8. Update Restaurant Branding
   PATCH /api/restaurants/:id
   Body: { primaryColor, backgroundColor, logoUrl, headerImageUrl }
   ↓
   Response: { updated restaurant }

9. View Analytics
   GET /api/restaurants/:id/stats
   ↓
   Response: { totalMenus, totalMenuItems, totalQRScans, scansByDate }

Total API Calls for Complete Setup:
- 1 Registration
- 1 Dashboard load
- 1 Create restaurant
- 1 Create menu
- 3 Create categories
- 5 Create menu items
- 1 Update branding
= 13 API calls
```

---

## DATABASE STATE CHANGES

### State Progression Example

**Initial State (After User Registration):**
```sql
User Table:
┌──────────────┬──────────────────────────┬─────────┐
│      id      │          email           │  role   │
├──────────────┼──────────────────────────┼─────────┤
│ cm1abc123xyz │ john@restaurantabc.com   │ OWNER   │
└──────────────┴──────────────────────────┴─────────┘

Restaurant Table: (empty)
Menu Table: (empty)
MenuItem Table: (empty)
Category Table: (empty)
QRScan Table: (empty)
```

**After Restaurant Creation:**
```sql
Restaurant Table:
┌──────────────┬──────────────┬──────────────────┬───────────────┐
│      id      │   ownerId    │      name        │     slug      │
├──────────────┼──────────────┼──────────────────┼───────────────┤
│ cm1def456uvw │ cm1abc123xyz │ The Pizza Palace │ pizza-palace  │
└──────────────┴──────────────┴──────────────────┴───────────────┘
```

**After Menu Creation:**
```sql
Menu Table:
┌──────────────┬──────────────┬──────────────┬──────────┐
│      id      │ restaurantId │     name     │ isActive │
├──────────────┼──────────────┼──────────────┼──────────┤
│ cm1ghi789rst │ cm1def456uvw │ Dinner Menu  │   true   │
└──────────────┴──────────────┴──────────────┴──────────┘
```

**After Categories Creation:**
```sql
Category Table:
┌──────────────┬──────────────┬───────────┬───────────┐
│      id      │ restaurantId │   name    │ sortOrder │
├──────────────┼──────────────┼───────────┼───────────┤
│ cm1jkl012mno │ cm1def456uvw │ Pizza     │     0     │
│ cm1jkl013mno │ cm1def456uvw │ Salads    │     1     │
│ cm1jkl014mno │ cm1def456uvw │ Desserts  │     2     │
└──────────────┴──────────────┴───────────┴───────────┘
```

**After Menu Items Creation:**
```sql
MenuItem Table:
┌──────────────┬──────────────┬──────────────┬───────────────────┬────────┐
│      id      │    menuId    │  categoryId  │       name        │ price  │
├──────────────┼──────────────┼──────────────┼───────────────────┼────────┤
│ cm1pqr345stu │ cm1ghi789rst │ cm1jkl012mno │ Margherita Pizza  │ 12.99  │
│ cm1pqr346stu │ cm1ghi789rst │ cm1jkl012mno │ Pepperoni Pizza   │ 14.99  │
│ cm1pqr347stu │ cm1ghi789rst │ cm1jkl012mno │ Vegetarian Pizza  │ 13.99  │
│ cm1pqr348stu │ cm1ghi789rst │ cm1jkl013mno │ Caesar Salad      │  8.99  │
│ cm1pqr349stu │ cm1ghi789rst │ cm1jkl014mno │ Tiramisu          │  6.99  │
└──────────────┴──────────────┴──────────────┴───────────────────┴────────┘
```

**After Customer Scans (3 scans):**
```sql
QRScan Table:
┌──────────────┬──────────────┬─────────────────────┬─────────────────┐
│      id      │ restaurantId │     scannedAt       │   ipAddress     │
├──────────────┼──────────────┼─────────────────────┼─────────────────┤
│ cm1vwx678yza │ cm1def456uvw │ 2025-11-16 11:00:00 │ 192.168.1.100   │
│ cm1vwx679yza │ cm1def456uvw │ 2025-11-16 11:15:00 │ 192.168.1.101   │
│ cm1vwx680yza │ cm1def456uvw │ 2025-11-16 11:30:00 │ 192.168.1.102   │
└──────────────┴──────────────┴─────────────────────┴─────────────────┘
```

### Data Relationships Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                     COMPLETE DATA MODEL                     │
└─────────────────────────────────────────────────────────────┘

User
├─ id: cm1abc123xyz
├─ email: john@restaurantabc.com
├─ role: OWNER
└─ restaurants ──────┐
                     │
                     ▼
                Restaurant
                ├─ id: cm1def456uvw
                ├─ name: The Pizza Palace
                ├─ slug: pizza-palace
                ├─ qrCodeUrl: ./uploads/qr-codes/cm1def456uvw.png
                ├─ menus ────────┐
                ├─ categories ───┼───┐
                └─ qrScans ──────┼───┼───┐
                                 │   │   │
                     ┌───────────┘   │   │
                     ▼               │   │
                   Menu              │   │
                   ├─ id: cm1ghi789rst
                   ├─ name: Dinner Menu
                   ├─ isActive: true
                   └─ menuItems ────┐
                                    │
                     ┌──────────────┼───────────────┐
                     │              │               │
                     ▼              ▼               ▼
                  MenuItem      MenuItem       MenuItem
                  (Pizza)       (Salad)        (Dessert)
                  ├─ id         ├─ id          ├─ id
                  ├─ name       ├─ name        ├─ name
                  ├─ price      ├─ price       ├─ price
                  └─ category   └─ category    └─ category
                       │              │              │
                       ▼              ▼              ▼
              ┌────────┴──────────────┴──────────────┘
              │
              ▼
           Category
           ├─ id: cm1jkl012mno (Pizza)
           ├─ id: cm1jkl013mno (Salads)
           └─ id: cm1jkl014mno (Desserts)

                     ┌───────────────────────────┘
                     │
                     ▼
                  QRScan (Multiple records)
                  ├─ id: cm1vwx678yza
                  ├─ scannedAt: 2025-11-16 11:00:00
                  └─ ipAddress: 192.168.1.100
```

---

## ERROR SCENARIOS & EDGE CASES

### Common Error Scenarios

**1. Email Already Registered**

```typescript
// User tries to register with existing email

POST /api/auth/register
{ "email": "john@restaurantabc.com", "password": "password123" }

// Backend checks and finds existing user
const existingUser = await authRepository.findUserByEmail(email);
if (existingUser) {
  throw new AppError("Email already registered", 409);
}

// Response:
{
  "status": "error",
  "message": "Email already registered"
}

// Frontend shows error message to user
```

**2. Slug Already Taken**

```typescript
// Owner tries to create restaurant with existing slug

POST /api/restaurants
{ "name": "New Restaurant", "slug": "pizza-palace" }

// Backend checks slug
const slugExists = await restaurantsRepository.checkSlugExists("pizza-palace");
if (slugExists) {
  throw new AppError("Restaurant with this slug already exists", 409);
}

// Response:
{
  "status": "error",
  "message": "Restaurant with this slug already exists"
}

// Frontend: Shows error, suggests alternative slugs
// "pizza-palace-2", "pizza-palace-nyc", etc.
```

**3. Unauthorized Access**

```typescript
// User A tries to access User B's restaurant

GET /api/restaurants/xyz789
Authorization: Bearer <user-a-token>

// Backend checks ownership
const restaurant = await restaurantsRepository.findById("xyz789");
if (restaurant.ownerId !== currentUserId) {
  throw new AppError("Unauthorized to access this restaurant", 403);
}

// Response:
{
  "status": "error",
  "message": "Unauthorized to access this restaurant"
}
```

**4. Invalid JWT Token**

```typescript
// User's token is expired or invalid

GET /api/restaurants
Authorization: Bearer <expired-or-invalid-token>

// Auth middleware catches error
const payload = verifyAccessToken(token);
// Throws: JsonWebTokenError or TokenExpiredError

// Response:
{
  "status": "error",
  "message": "Invalid or expired token"
}

// Frontend: Redirects to /login
// Clears localStorage
```

**5. Menu Item Not Found**

```typescript
// Customer views menu but item was deleted

// Restaurant has menu items: [item1, item2, item3]
// Owner deletes item2
// Customer loads page

// Query only returns active items
WHERE mi."isAvailable" = true

// Result: Customer sees [item1, item3]
// No error, item simply not displayed
```

**6. Restaurant Not Found by Slug**

```typescript
// Customer scans old/invalid QR code

GET /api/restaurants/slug/non-existent-restaurant

// Backend:
const restaurant = await restaurantsRepository.findBySlug("non-existent-restaurant");
if (!restaurant) {
  throw new AppError("Restaurant not found", 404);
}

// Response:
{
  "status": "error",
  "message": "Restaurant not found"
}

// Frontend: Shows 404 page
// "This restaurant menu is not available"
```

**7. QR Code File Missing**

```typescript
// Owner requests QR code but file was deleted

GET /api/restaurants/:id/qr-code

// Backend tries to serve file
const filePath = restaurant.qrCodeUrl; // "./uploads/qr-codes/xyz.png"

if (!fs.existsSync(filePath)) {
  // Regenerate QR code
  const newQRCodeUrl = await generateQRCode(restaurant.slug);
  await restaurantsRepository.update(restaurant.id, { qrCodeUrl: newQRCodeUrl });

  res.sendFile(newQRCodeUrl);
} else {
  res.sendFile(filePath);
}
```

### Edge Cases Handled

**1. Multiple Active Menus**
- System allows multiple active menus per restaurant
- Customer sees all active menus
- Items can be in multiple menus

**2. Items Without Categories**
- `categoryId` is nullable
- Uncategorized items appear in "Other" section
- Frontend handles gracefully

**3. Empty Menus**
- Restaurant with no menu items
- Customer page shows: "Menu coming soon"
- No errors thrown

**4. Inactive Menu**
- Owner can deactivate menu without deleting
- Customer doesn't see inactive menus
- Items remain in database

**5. Price Updates**
- Owner changes price
- Updates immediately in database
- Customer sees new price on next page load
- No price history tracked (potential feature)

---

## SUMMARY

### Key Takeaways for Technical Team

**User Flow Complexity:**
- **Registration**: 1 API call, 1 DB write, ~2 seconds
- **Restaurant Setup**: 13+ API calls, multiple DB writes, ~2-5 minutes
- **Customer View**: 1 API call, 1 DB read, 1 analytics write, ~1-3 seconds

**Performance Characteristics:**
- Most operations are synchronous
- QR code generation is CPU-intensive (should be queued)
- Customer page loads all data at once (no pagination)
- No caching implemented (all requests hit database)

**Scalability Considerations:**
- localStorage for tokens (won't scale, migrate to cookies)
- Local filesystem for QR codes (won't scale, migrate to S3)
- No rate limiting (vulnerable to abuse)
- Synchronous operations (blocking)

**Security Considerations:**
- Public endpoint for menu viewing (by design)
- QR scan tracking (privacy concern - stores IP)
- No email verification (anyone can register)
- Token expiration handled, but no refresh mechanism fully implemented

**Data Integrity:**
- Foreign key constraints enforce relationships
- Cascade deletes prevent orphaned records
- Nullable categoryId allows flexible organization
- No soft deletes (records permanently deleted)

---

**Document End**

*This document provides a complete technical understanding of user workflows and system behavior for the QR Menu SaaS platform.*
