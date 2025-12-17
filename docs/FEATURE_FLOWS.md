# Feature Flows Analysis & Recommendations

## Table of Contents
1. [Current System Overview](#current-system-overview)
2. [Restaurant Owner Flows](#restaurant-owner-flows)
3. [Menu & Category Management](#menu--category-management)
4. [Customer Experience Flow](#customer-experience-flow)
5. [Image Handling Analysis](#image-handling-analysis)
6. [Recommendations](#recommendations)
7. [Implementation Priority](#implementation-priority)

---

## Current System Overview

### Entity Relationship

```
User (Owner)
    |
    +-- Restaurant (1:N)
            |
            +-- Menu (1:N)
            |       |
            |       +-- MenuItem (1:N)
            |               |
            |               +-- Category (N:1, optional)
            |
            +-- Category (1:N, shared across menus)
            |
            +-- QRScan (1:N, analytics)
```

### Data Model Summary

| Entity | Key Fields | Notes |
|--------|-----------|-------|
| User | id, email, password, role | Roles: OWNER, ADMIN, CUSTOMER |
| Restaurant | id, ownerId, name, slug, qrCodeUrl, logoUrl, headerImageUrl, colors, contact | Multi-tenant by ownerId |
| Menu | id, restaurantId, name, isActive | Active/inactive toggle |
| MenuItem | id, menuId, categoryId?, name, description?, price, imageUrl?, isAvailable | Optional category & image |
| Category | id, restaurantId, name, sortOrder | Restaurant-level, shared across menus |
| QRScan | id, restaurantId, scannedAt, ipAddress, userAgent | Analytics tracking |

---

## Restaurant Owner Flows

### Flow 1: User Registration & Login

```
[Current Implementation]

Register Flow:
+------------------+     +------------------+     +------------------+
|  Frontend Form   | --> |  POST /auth/     | --> |  Database        |
|  (email, pass)   |     |  register        |     |  Create User     |
+------------------+     +------------------+     +------------------+
                                |
                                v
                         Hash password (bcrypt)
                         Generate JWT tokens
                                |
                                v
+------------------+     +------------------+
|  Store tokens    | <-- |  Return tokens   |
|  in localStorage |     |  + user data     |
+------------------+     +------------------+

Login Flow:
Same as above but verifies existing user credentials
```

**Assessment:** Basic but functional. Missing email verification, password reset.

---

### Flow 2: Restaurant Creation

```
[Current Implementation]

+------------------+     +------------------+     +------------------+
|  Owner Dashboard | --> |  POST /api/      | --> |  Validate slug   |
|  "New Restaurant"|     |  restaurants     |     |  uniqueness      |
|  Form: name,slug |     +------------------+     +------------------+
+------------------+              |
                                  v
                         +------------------+
                         |  Create in DB    |
                         |  Generate QR Code|
                         |  (PNG file)      |
                         +------------------+
                                  |
                                  v
                         +------------------+
                         |  Return restaurant|
                         |  with qrCodeUrl  |
                         +------------------+
```

**What happens:**
1. User fills form with restaurant name and URL slug
2. Backend validates slug is unique (no duplicate restaurants)
3. Restaurant created in database with owner reference
4. QR code PNG generated and saved to filesystem
5. Restaurant returned with all data

**Current Limitations:**
- No logo/header image upload at creation
- QR code file generated but NOT SERVED (missing static middleware)
- No branch/location concept (single location only)

---

### Flow 3: Restaurant Customization

```
[Current Implementation]

+------------------+     +------------------+
|  Customization   | --> |  PATCH /api/     |
|  Page            |     |  restaurants/:id |
+------------------+     +------------------+
                                |
Fields updated:                 v
- location          +------------------+
- contactEmail      |  Update in DB    |
- contactPhone      |  Return updated  |
- primaryColor      +------------------+
- backgroundColor
- logoUrl (external URL only)
- headerImageUrl (external URL only)
```

**What the owner can customize:**
1. Contact Information: address, email, phone
2. Brand Colors: primary color, background color
3. Images: logo URL, header image URL (EXTERNAL URLS ONLY)

**Live Preview:** The customization page shows a real-time preview of how the customer menu page will look.

---

## Menu & Category Management

### Flow 4: Menu Creation

```
[Current Implementation]

Restaurant --> Menus Page --> Create Menu Dialog

+------------------+     +------------------+     +------------------+
|  "New Menu"      | --> |  POST /api/menus/| --> |  Create Menu     |
|  Form:           |     |  restaurant/:id  |     |  Link to         |
|  - name          |     +------------------+     |  Restaurant      |
|  - isActive      |                              +------------------+
+------------------+

Example Menus: "Breakfast", "Lunch", "Dinner", "Drinks", "Desserts"
```

**Current Menu Structure:**
- Menus belong to a restaurant
- Each menu has a name and active/inactive toggle
- Active menus are shown to customers
- A restaurant can have multiple menus

**Navigation:**
```
Restaurants Page --> Click "Manage Menus" --> Menus Page for that restaurant
```

---

### Flow 5: Menu Item Creation

```
[Current Implementation]

Menu --> Menu Items Page --> Create Item Dialog

+------------------+
|  "New Item"      |
|  Form:           |
|  - name*         |
|  - description   |
|  - price*        |
|  - category      | --> Category handling (see below)
|  - imageUrl      |
|  - isAvailable   |
+------------------+

Category Handling:
+------------------+
|  User types      |
|  category name   |
+-------+----------+
        |
        v
+-------+----------+
|  Check if exists |
|  in restaurant   |
+-------+----------+
        |
   +----+----+
   |         |
Exists    Not Exists
   |         |
   v         v
Use ID    Create new category
          then use new ID
```

**Item Fields:**
| Field | Required | Type | Notes |
|-------|----------|------|-------|
| name | Yes | string | Item display name |
| description | No | string | Optional description |
| price | Yes | number | Decimal price |
| category | No | string/select | Auto-create if new |
| imageUrl | No | URL string | External URL only |
| isAvailable | Yes | boolean | Show/hide from customers |

**Category Auto-Creation Flow:**
1. User types or selects category name in combobox
2. System checks if category exists for this restaurant
3. If exists: uses existing category ID
4. If not exists: creates new category, then assigns to item

**Limitation:** No dedicated category management page - categories only created through menu items.

---

### Flow 6: Category System

```
[Current Implementation]

Categories are:
- Restaurant-scoped (not menu-scoped)
- Created on-the-fly when adding menu items
- Shared across all menus in a restaurant
- Have sortOrder for display ordering

Database Structure:
+------------------+
|  Category        |
|  - id            |
|  - restaurantId  |  <-- Categories belong to restaurant, not menu
|  - name          |
|  - sortOrder     |
+------------------+
        |
        v (N:1 relationship)
+------------------+
|  MenuItem        |
|  - categoryId?   |  <-- Optional link
+------------------+
```

**How categories work in customer view:**
1. All menu items fetched with category data
2. Frontend groups items by category name
3. Categories displayed in order (by sortOrder or name)
4. "Uncategorized" shown for items without category

---

## Customer Experience Flow

### Flow 7: QR Scan to Menu View

```
[Current Implementation]

+------------------+     +------------------+     +------------------+
|  Customer scans  | --> |  Browser opens   | --> |  GET /api/       |
|  QR Code         |     |  /menu/{slug}    |     |  restaurants/    |
+------------------+     +------------------+     |  slug/{slug}     |
                                                  +------------------+
                                                          |
                                                          v
                                                  +------------------+
                                                  |  Track QR Scan   |
                                                  |  (analytics)     |
                                                  +------------------+
                                                          |
                                                          v
                                                  +------------------+
                                                  |  Return:         |
                                                  |  - Restaurant    |
                                                  |  - Active Menus  |
                                                  |  - Available     |
                                                  |    Items         |
                                                  +------------------+
```

**Customer Page States:**

1. **Landing Page:**
   - Restaurant logo (or icon fallback)
   - Restaurant name
   - Branded header/background
   - Action buttons: View Menu, Location, Contact, Feedback
   - Contact information footer

2. **Menu View:**
   - Sticky header with branding
   - Menu selector (tabs or dropdown)
   - Items grouped by category
   - Each item shows: name, description, price, image (if any)

**Data Fetched (single API call):**
```json
{
  "restaurant": {
    "id": "...",
    "name": "...",
    "slug": "...",
    "location": "...",
    "contactEmail": "...",
    "contactPhone": "...",
    "primaryColor": "#ea580c",
    "backgroundColor": "#ffffff",
    "logoUrl": "...",
    "headerImageUrl": "...",
    "menus": [
      {
        "id": "...",
        "name": "Lunch",
        "isActive": true,
        "menuItems": [
          {
            "id": "...",
            "name": "Burger",
            "description": "...",
            "price": 12.99,
            "imageUrl": "...",
            "isAvailable": true,
            "category": {
              "id": "...",
              "name": "Main Dishes"
            }
          }
        ]
      }
    ]
  }
}
```

---

## Image Handling Analysis

### Current State: URL-Based Only

```
[Current Implementation]

Images are NOT uploaded. Users must:
1. Host image elsewhere (Imgur, Cloudinary, etc.)
2. Copy URL
3. Paste into form field

Validation: Only URL format check (z.string().url())
```

### Where Images Are Used

| Location | Field | Purpose | Required |
|----------|-------|---------|----------|
| Restaurant | logoUrl | Restaurant logo in header | No |
| Restaurant | headerImageUrl | Background image on landing | No |
| MenuItem | imageUrl | Item thumbnail | No |

### Problems with Current Approach

1. **User Experience:**
   - Restaurant owners must use external services
   - Extra steps to upload elsewhere and copy URL
   - Technical barrier for non-technical users

2. **Reliability:**
   - External URLs can break (deleted, moved)
   - No control over image availability
   - Performance varies by external host

3. **Security:**
   - External images could be malicious
   - No validation of actual image content
   - Potential XSS through crafted URLs

4. **QR Code Issue:**
   - QR codes are generated to `./uploads/qr-codes/`
   - BUT: No `express.static()` serving these files
   - QR codes exist on disk but cannot be accessed via HTTP

---

## Recommendations

### 1. Image Upload System for VPS

**Recommended Architecture:**

```
+------------------+     +------------------+     +------------------+
|  Frontend        | --> |  POST /api/      | --> |  Multer          |
|  File Input      |     |  upload/:type/:id|     |  Middleware      |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
                                                  +------------------+
                                                  |  Sharp (resize)  |
                                                  |  - Max 1200px    |
                                                  |  - WebP format   |
                                                  |  - Quality 80%   |
                                                  +------------------+
                                                          |
                                                          v
                                                  +------------------+
                                                  |  Save to:        |
                                                  |  ./uploads/      |
                                                  |  {type}/{id}/    |
                                                  +------------------+
                                                          |
                                                          v
                                                  +------------------+
                                                  |  Update DB with  |
                                                  |  local URL path  |
                                                  +------------------+
```

**Directory Structure:**
```
uploads/
  qr-codes/
    {restaurantId}-{timestamp}.png
  restaurants/
    {restaurantId}/
      logo.webp
      header.webp
  menu-items/
    {itemId}.webp
```

**API Endpoints Needed:**
```
POST   /api/upload/restaurant/:id/logo
POST   /api/upload/restaurant/:id/header
POST   /api/upload/menu-item/:id/image
DELETE /api/upload/restaurant/:id/logo
DELETE /api/upload/restaurant/:id/header
DELETE /api/upload/menu-item/:id/image
```

---

### 2. Menu & Category Improvements

**Current Issues:**
- No dedicated category management UI
- Categories only created via menu items
- No reordering of categories
- No category descriptions or images

**Recommended Category Page:**
```
Categories Management Page:
+----------------------------------+
|  Categories for [Restaurant]     |
+----------------------------------+
|  [+ New Category]                |
|                                  |
|  +---------------------------+   |
|  | Main Dishes        [Edit] |   |
|  | Sort: 1  Items: 5         |   |
|  +---------------------------+   |
|  | Appetizers         [Edit] |   |
|  | Sort: 2  Items: 3         |   |
|  +---------------------------+   |
|  | Desserts           [Edit] |   |
|  | Sort: 3  Items: 2         |   |
|  +---------------------------+   |
+----------------------------------+
```

---

### 3. Branch/Location Support

**Current:** One restaurant = one location

**Recommended Structure for Multi-Location:**
```
Restaurant (Brand)
    |
    +-- Branch/Location (1:N)
            |
            +-- Each branch has own:
                - Address
                - Contact info
                - QR Code
                - Operating hours
            |
            +-- Shares with parent:
                - Menus
                - Categories
                - Branding
```

**Database Changes:**
```prisma
model Restaurant {
  // ... existing fields
  branches Branch[]
}

model Branch {
  id           String   @id @default(cuid())
  restaurantId String
  name         String   // "Downtown", "Mall Location"
  slug         String   @unique
  location     String
  contactPhone String?
  qrCodeUrl    String?
  isActive     Boolean  @default(true)

  restaurant   Restaurant @relation(...)
}
```

---

### 4. Menu Organization Options

**Option A: Current Approach (Separate Menus)**
```
Restaurant
  +-- Breakfast Menu
  |     +-- Items...
  +-- Lunch Menu
  |     +-- Items...
  +-- Dinner Menu
        +-- Items...
```
- Pros: Simple, clear separation
- Cons: Items duplicated across menus, harder to maintain

**Option B: Time-Based Menu Visibility**
```
Restaurant
  +-- Master Menu (all items)
        +-- Items with time rules:
            - "Pancakes" (6am-11am)
            - "Burger" (11am-10pm)
            - "Steak" (5pm-10pm)
```
- Pros: Single source of truth, auto-switching
- Cons: More complex, requires time management

**Option C: Menu Collections (Recommended)**
```
Restaurant
  +-- Categories (master list)
  |     +-- Breakfast Items
  |     +-- Lunch Items
  |     +-- Dinner Items
  |     +-- Drinks (all day)
  |
  +-- Menus (views/collections)
        +-- Breakfast Menu: [Breakfast Items, Drinks]
        +-- Lunch Menu: [Lunch Items, Drinks]
        +-- Dinner Menu: [Dinner Items, Drinks]
```
- Pros: Items exist once, menus are just collections
- Cons: Slightly more complex UI

---

### 5. Optional Images Best Practice

**Current Handling:** Items without images just don't show image

**Recommended UX:**
1. Show placeholder icon when no image
2. Different card layout for items with/without images
3. Lazy loading for images
4. Fallback to category icon if no item image

**Frontend Component:**
```tsx
// MenuItem with optional image
{item.imageUrl ? (
  <img src={item.imageUrl} alt={item.name} loading="lazy" />
) : (
  <div className="placeholder-icon">
    <CategoryIcon category={item.category?.name} />
  </div>
)}
```

---

## Implementation Priority

### Phase 1: Critical Fixes (Immediate)

1. **Fix QR Code Serving**
   - Add `express.static('./uploads')` to app.ts
   - Verify QR codes accessible via HTTP

2. **Add Basic File Upload**
   - Install multer, sharp
   - Create upload endpoints
   - Update frontend forms with file inputs

### Phase 2: Core Improvements

3. **Category Management Page**
   - Dedicated UI for categories
   - Drag-and-drop reordering
   - Category descriptions

4. **Image Optimization**
   - Resize on upload
   - Convert to WebP
   - Generate thumbnails

### Phase 3: Advanced Features

5. **Multi-Location Support**
   - Branch model
   - Shared menus across locations
   - Location-specific QR codes

6. **Menu Collections**
   - Link categories to menus
   - Time-based visibility
   - Special/seasonal menus

### Phase 4: Polish

7. **Image Fallbacks**
   - Category icons
   - Placeholder images
   - Lazy loading

8. **Analytics Dashboard**
   - QR scan stats
   - Popular items
   - Peak hours

---

## Summary

| Feature | Current Status | Recommended Action |
|---------|---------------|-------------------|
| Restaurant Creation | Working | Add image upload at creation |
| Menu Management | Working | Add menu collections concept |
| Category System | Basic (auto-create only) | Add dedicated management page |
| Item Management | Working | Add image upload |
| Image Handling | External URLs only | Implement local upload system |
| QR Codes | Generated but not served | Fix static file serving |
| Multi-Location | Not supported | Add Branch model |
| Customer View | Working well | Add lazy loading, placeholders |

The system has a solid foundation. The critical gap is the image upload infrastructure, which should be addressed first before adding new features.
