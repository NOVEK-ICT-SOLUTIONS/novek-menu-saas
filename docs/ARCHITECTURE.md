# Architecture Documentation

## System Overview

QR Menu SaaS is a monorepo application built with TypeScript, featuring a React frontend and Express backend with PostgreSQL database.

## Frontend Architecture

### Feature-Based Structure

The frontend follows a feature-based architecture where each feature is self-contained:

```
src/
├── features/           # Feature modules
│   ├── auth/          # Authentication
│   ├── menus/         # Menu management
│   ├── menu-items/    # Menu item management
│   ├── restaurants/   # Restaurant management
│   ├── qr-codes/      # QR code generation
│   └── admin/         # Admin dashboard
├── shared/            # Shared resources
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── layouts/       # Layout components
│   ├── utils/         # Utility functions
│   └── types/         # Shared TypeScript types
├── lib/               # Third-party library configurations
├── routes/            # Route definitions
├── config/            # App configuration
└── assets/            # Static assets
```

### Key Patterns

- **Barrel Exports**: Each feature exports through `index.ts` for clean imports
- **Absolute Imports**: All imports use path aliases (`@features/*`, `@shared/*`, etc.)
- **React Query**: Server state management
- **Axios**: HTTP client with interceptors for authentication

## Backend Architecture

### Layered Architecture

The backend follows a layered architecture with dependency injection:

```
src/
├── modules/              # Feature modules
│   ├── auth/            # Authentication module
│   │   ├── *.controller.ts  # HTTP request handling
│   │   ├── *.service.ts     # Business logic
│   │   ├── *.repository.ts  # Data access
│   │   ├── *.routes.ts      # Route definitions
│   │   ├── *.validation.ts  # Request validation
│   │   └── *.types.ts       # TypeScript types
│   └── ...
├── shared/              # Shared resources
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   ├── types/           # Shared types
│   └── errors/          # Error classes
├── config/              # Configuration
├── database/            # Database client
├── container.ts         # DI container
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

### Layer Responsibilities

1. **Controller Layer**: Handles HTTP requests/responses, validation
2. **Service Layer**: Contains business logic, orchestrates operations
3. **Repository Layer**: Direct database access through Prisma

### Dependency Injection

A simple DI container pattern is used to manage service dependencies:

```typescript
// container.ts registers services
container.register('authService', authService);

// Controllers access services through the container
const authService = container.get<AuthService>('authService');
```

## Database Schema

### Key Models

- **User**: System users (owners, admins, customers)
- **Restaurant**: Restaurant entities owned by users
- **Menu**: Menus belonging to restaurants
- **MenuItem**: Individual menu items
- **Category**: Menu item categories

### Relationships

- User → Restaurant (one-to-many)
- Restaurant → Menu (one-to-many)
- Restaurant → Category (one-to-many)
- Menu → MenuItem (one-to-many)
- Category → MenuItem (one-to-many)

## Authentication & Authorization

- JWT-based authentication
- Access tokens (short-lived, 15 minutes)
- Refresh tokens (long-lived, 7 days)
- Role-based access control (OWNER, ADMIN, CUSTOMER)

## API Design

### RESTful Principles

- Resources identified by URLs
- HTTP methods for CRUD operations
- Proper status codes
- JSON request/response bodies

### Error Handling

Centralized error handling middleware catches and formats errors:

```typescript
{
  "status": "error",
  "message": "Error description"
}
```

## Deployment Architecture

### Backend Deployment

- Docker containerized application
- Node.js 20 Alpine base image
- Multi-stage build for optimization
- Non-root user for security

### Frontend Deployment

- Static build served via CDN (Vercel)
- Environment variables injected at build time

### Database

- PostgreSQL database
- Prisma for migrations and ORM
- Connection pooling for performance

## Development Workflow

1. Feature branches from `main`
2. Local development with hot reload
3. Type checking and linting before commit
4. CI/CD pipeline runs tests and checks
5. Merge to `main` triggers deployment

## Code Quality

- **TypeScript Strict Mode**: Enabled for type safety
- **Biome**: Linting and formatting
- **Path Aliases**: No relative imports
- **Barrel Exports**: Clean import structure
