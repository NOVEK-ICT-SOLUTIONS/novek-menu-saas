# QR Menu SaaS

A production-ready TypeScript monorepo for a QR code menu SaaS platform.

## Overview

Restaurant owners can sign up, manage menus, and generate QR codes. System admins monitor all users. Customers scan QR codes to view menus.

## Tech Stack

- **Frontend**: Vite 6 + React 19 + TypeScript + TailwindCSS 4
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Monorepo**: npm workspaces
- **Linting**: Biome
- **Database**: PostgreSQL

## Project Structure

```
qr-menu-saas/
├── packages/
│   ├── frontend/          # React frontend application
│   └── backend/           # Express backend API
├── docs/                  # Documentation
├── .github/workflows/     # CI/CD workflows
└── package.json           # Root workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables:
   ```bash
   cp packages/backend/.env.example packages/backend/.env
   cp packages/frontend/.env.example packages/frontend/.env
   ```

4. Configure your `.env` files with proper values

5. Run database migrations:
   ```bash
   npm run db:migrate:dev
   ```

6. Start development servers:
   ```bash
   npm run dev
   ```

## Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build all workspaces
- `npm run type-check` - Type check all workspaces
- `npm run lint` - Lint all workspaces
- `npm run lint:fix` - Fix linting issues in all workspaces
- `npm run clean` - Clean build artifacts

### Database Commands

- `npm run db:migrate:dev` - Run database migrations (development)
- `npm run db:migrate` - Deploy database migrations (production)
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database
- `npm run db:reset` - Reset the database

### Frontend Specific

```bash
cd packages/frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # Type check only
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
```

### Backend Specific

```bash
cd packages/backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Type check only
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
```

## Environment Variables

### Backend

See `packages/backend/.env.example` for required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - Allowed CORS origin
- `QR_CODE_DIR` - Directory for QR code storage

### Frontend

See `packages/frontend/.env.example` for required variables:
- `VITE_API_URL` - Backend API URL
- `VITE_APP_ENV` - Application environment

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System architecture and design patterns
- [API Documentation](./docs/API.md) - API endpoints and usage
- [Deployment](./docs/DEPLOYMENT.md) - Deployment instructions

## License

MIT
