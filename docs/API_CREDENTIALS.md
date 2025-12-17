# API Credentials (Development)

## Test Users

### Restaurant Owner
- **Email:** `test@example.com`
- **Password:** `Password123@`
- **Role:** `OWNER`

### Admin User
- **Email:** `admin@example.com`
- **Password:** `Admin123@`
- **Role:** `ADMIN`

---

## API Endpoints (v1)

Base URL: `http://localhost:3000/api/v1`

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout | No |

### Restaurants (Owner)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/restaurants` | List owner's restaurants | Bearer |
| GET | `/restaurants/stats` | Get owner stats | Bearer |
| GET | `/restaurants/:id` | Get restaurant by ID | Bearer |
| POST | `/restaurants` | Create restaurant | Bearer |
| PATCH | `/restaurants/:id` | Update restaurant | Bearer |
| DELETE | `/restaurants/:id` | Delete restaurant | Bearer |

### Categories (Owner)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories/restaurant/:restaurantId` | List categories | Bearer |
| GET | `/categories/:id` | Get category by ID | Bearer |
| POST | `/categories` | Create category | Bearer |
| PATCH | `/categories/:id` | Update category | Bearer |
| DELETE | `/categories/:id` | Delete category | Bearer |

### Menu Items (Owner)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/items/category/:categoryId` | List items in category | Bearer |
| GET | `/items/:id` | Get item by ID | Bearer |
| POST | `/items` | Create item | Bearer |
| PATCH | `/items/:id` | Update item | Bearer |
| DELETE | `/items/:id` | Delete item | Bearer |

### Public (Customer)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/public/menu/:slug` | Get restaurant menu by slug | No |

### Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | System statistics | Bearer (ADMIN) |
| GET | `/admin/stats/restaurants` | Restaurant statistics | Bearer (ADMIN) |
| GET | `/admin/users` | List all users | Bearer (ADMIN) |
| PATCH | `/admin/users/:userId/role` | Update user role | Bearer (ADMIN) |
| GET | `/admin/restaurants` | List all restaurants | Bearer (ADMIN) |
| GET | `/admin/restaurants/:restaurantId` | Get restaurant details | Bearer (ADMIN) |

---

## Request/Response Examples

### Register
```json
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "Password123@"
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "OWNER" },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

### Create Restaurant
```json
POST /api/v1/restaurants
Authorization: Bearer <token>
{
  "name": "My Restaurant",
  "slug": "my-restaurant"
}
```

### Create Category
```json
POST /api/v1/categories
Authorization: Bearer <token>
{
  "restaurantId": "<restaurant-id>",
  "name": "Appetizers",
  "description": "Start your meal",
  "sortOrder": 0
}
```

### Create Menu Item
```json
POST /api/v1/items
Authorization: Bearer <token>
{
  "categoryId": "<category-id>",
  "name": "Spring Rolls",
  "description": "Crispy vegetable rolls",
  "price": 8.99,
  "isAvailable": true,
  "sortOrder": 0
}
```

### Public Menu Response
```json
GET /api/v1/public/menu/my-restaurant

{
  "success": true,
  "data": {
    "restaurant": {
      "id": "...",
      "name": "My Restaurant",
      "slug": "my-restaurant",
      "categories": [
        {
          "id": "...",
          "name": "Appetizers",
          "items": [
            {
              "id": "...",
              "name": "Spring Rolls",
              "price": 8.99
            }
          ]
        }
      ]
    }
  }
}
```

---

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@, $, !, %, *, ?, &)
