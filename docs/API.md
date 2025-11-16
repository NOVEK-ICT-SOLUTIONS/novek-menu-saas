# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.yourdomain.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "OWNER"
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### POST /auth/login
Login to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "OWNER"
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### POST /auth/refresh
Refresh an access token.

**Request Body:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new-jwt-token"
}
```

### Restaurants

#### GET /restaurants
Get all restaurants for the authenticated user.

**Response:** `200 OK`
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "My Restaurant",
      "slug": "my-restaurant",
      "qrCodeUrl": "https://...",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /restaurants
Create a new restaurant.

**Request Body:**
```json
{
  "name": "My Restaurant",
  "slug": "my-restaurant"
}
```

**Response:** `201 Created`
```json
{
  "restaurant": {
    "id": "uuid",
    "name": "My Restaurant",
    "slug": "my-restaurant",
    "qrCodeUrl": null,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /restaurants/:id
Get a specific restaurant.

**Response:** `200 OK`
```json
{
  "restaurant": {
    "id": "uuid",
    "name": "My Restaurant",
    "slug": "my-restaurant",
    "qrCodeUrl": "https://...",
    "menus": [],
    "categories": []
  }
}
```

#### PATCH /restaurants/:id
Update a restaurant.

**Request Body:**
```json
{
  "name": "Updated Name"
}
```

**Response:** `200 OK`

#### DELETE /restaurants/:id
Delete a restaurant.

**Response:** `204 No Content`

### Menus

#### GET /restaurants/:restaurantId/menus
Get all menus for a restaurant.

#### POST /restaurants/:restaurantId/menus
Create a new menu.

**Request Body:**
```json
{
  "name": "Lunch Menu",
  "isActive": true
}
```

#### GET /menus/:id
Get a specific menu with items.

#### PATCH /menus/:id
Update a menu.

#### DELETE /menus/:id
Delete a menu.

### Menu Items

#### GET /menus/:menuId/items
Get all items in a menu.

#### POST /menus/:menuId/items
Create a new menu item.

**Request Body:**
```json
{
  "name": "Burger",
  "description": "Delicious burger",
  "price": 12.99,
  "categoryId": "uuid",
  "imageUrl": "https://...",
  "isAvailable": true
}
```

#### PATCH /items/:id
Update a menu item.

#### DELETE /items/:id
Delete a menu item.

### Categories

#### GET /restaurants/:restaurantId/categories
Get all categories for a restaurant.

#### POST /restaurants/:restaurantId/categories
Create a new category.

**Request Body:**
```json
{
  "name": "Main Dishes",
  "sortOrder": 1
}
```

### QR Codes

#### POST /restaurants/:id/qr-code
Generate QR code for a restaurant's menu.

**Response:** `200 OK`
```json
{
  "qrCodeUrl": "https://..."
}
```

### Admin

#### GET /admin/users
Get all users (admin only).

#### GET /admin/restaurants
Get all restaurants (admin only).

## Error Responses

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Common Status Codes

- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
