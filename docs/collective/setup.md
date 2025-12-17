Create a production-ready TypeScript monorepo for a QR code menu SaaS using npm workspaces. Use CLI commands wherever possible to save time and follow latest documentation.

SETUP APPROACH:
- Use npm CLI commands (npm init, npm create, npm install -w) for scaffolding
- Check latest official documentation for: React 19, Vite 6, TailwindCSS 4 setup
- Only manually create files when no CLI exists
- Prefer CLI generators over manual file creation

TECH STACK:
- Frontend: Vite 6 + React 19 + TypeScript + TailwindCSS 4 (CSS-first, no PostCSS if possible per Vite docs)
- Backend: Node.js + Express + TypeScript + Prisma
- Monorepo: npm workspaces (native)

PROJECT STRUCTURE:

Root:
- packages/frontend, packages/backend
- Root files: package.json (workspaces config), tsconfig.base.json, biome.json, .gitignore, README.md
- docs/ folder: ARCHITECTURE.md, API.md, DEPLOYMENT.md
- .github/workflows/ (CI/CD stubs)

FRONTEND (packages/frontend):

Architecture: Feature-based structure
src/
├── features/           # auth, menus, menu-items, restaurants, qr-codes, admin
├── shared/            # components, hooks, layouts, utils, types
├── lib/               # api-client.ts, query-client.ts
├── routes/
├── config/
├── App.tsx
└── main.tsx

Essential packages only:
- react, react-dom, react-router-dom
- @tanstack/react-query@latest, @tanstack/react-table
- axios, zod
- tailwindcss (v4 if stable, else v3)

TypeScript absolute imports:
"@features/": ["./src/features/"]
"@shared/": ["./src/shared/"]
"@lib/": ["./src/lib/"]
"@config/": ["./src/config/"]
"@routes/": ["./src/routes/"]

Config files: vite.config.ts (path aliases), tsconfig.json (extends base), tailwind.config (check latest docs), .env.example

BACKEND (packages/backend):

Architecture: Layered (Controller → Service → Repository) with DI container
src/
├── modules/           # auth, restaurants, menus, menu-items, admin
│   └── [module]/     # *.controller.ts, *.service.ts, *.repository.ts, *.routes.ts, *.validation.ts, *.types.ts
├── shared/
│   ├── middleware/   # auth, error, validation
│   ├── utils/
│   ├── types/
│   └── errors/
├── config/
├── database/
├── container.ts
├── app.ts
└── server.ts

Essential packages only:
- express, cors, helmet, compression
- prisma, @prisma/client
- bcryptjs, jsonwebtoken, zod, dotenv, qrcode
- Dev: tsx, tsc-alias

TypeScript absolute imports:
"@modules/": ["./src/modules/"]
"@shared/": ["./src/shared/"]
"@config/": ["./src/config/"]
"@database/": ["./src/database/"]

Prisma models: User, Restaurant, Menu, MenuItem, Category (with proper relations)
Config files: tsconfig.json (extends base), .env.example, Dockerfile (multi-stage)

ROOT SCRIPTS (package.json):
```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:backend": "npm run dev -w backend",
    "dev:frontend": "npm run dev -w frontend",
    "build": "npm run build --workspaces",
    "type-check": "npm run type-check --workspaces",
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "test": "npm run test --workspaces",
    "db:migrate": "npm run db:migrate -w backend",
    "db:studio": "npm run db:studio -w backend",
    "db:seed": "npm run db:seed -w backend",
    "clean": "npm run clean --workspaces"
  }
}
```

BACKEND SCRIPTS:
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/server.js",
    "type-check": "tsc --noEmit",
    "lint": "biome check src/",
    "lint:fix": "biome check --apply src/",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts"
  }
}
```

FRONTEND SCRIPTS:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "biome check src/",
    "lint:fix": "biome check --apply src/"
  }
}
```

REQUIREMENTS:
1. Use CLI commands: npm create vite@latest, npm init, npx prisma init, etc.
2. Check official latest docs for React 19, Vite 6, TailwindCSS 4 setup steps
3. NO relative imports - only absolute via path aliases
4. Barrel exports (index.ts) in features/modules
5. Production-ready configs (builds work immediately)
6. TypeScript strict mode
7. Biome for linting (not ESLint)
8. Simple DI container (manual container.ts file)
9. Deployment configs: Dockerfile, .env.example with all vars

DO NOT:
- Install unnecessary packages
- Create business logic implementation
- Add UI libraries or state management beyond React Query

OUTPUT FORMAT:
1. List CLI commands to run in sequence
2. Only create files manually where no CLI exists
3. Show minimal file content (configs, types, structure only)
4. Include all package.json files with dependencies and scripts
5. Include all tsconfig files with path aliases
6. Keep explanations minimal - focus on commands and structure

Generate step-by-step CLI commands first, then minimal manual file creation.RetryTo run code, enable code execution and file creation in Settings > Capabilities.KGteh promot is cutting of please make itn a single md file all thepromot please thisi conudisngQR Menu SaaS Monorepo Setup Prompt
Create a production-ready TypeScript monorepo for a QR code menu SaaS using npm workspaces. Use CLI commands wherever possible to save time and follow latest documentation.
Project Context
This is a SaaS where restaurant owners sign up, manage menus, and generate QR codes. System admins monitor all users. Customers scan QR codes to view menus (future: place orders).
Setup Approach

Use npm CLI commands (npm init, npm create, npm install -w) for scaffolding
Check latest official documentation for: React 19, Vite 6, TailwindCSS 4 setup
Only manually create files when no CLI exists
Prefer CLI generators over manual file creation

Tech Stack

Frontend: Vite 6 + React 19 + TypeScript + TailwindCSS 4 (CSS-first, no PostCSS if possible per Vite docs)
Backend: Node.js + Express + TypeScript + Prisma
Monorepo: npm workspaces (native)

Project Structure
Root Level

packages/frontend, packages/backend
Root files: package.json (workspaces config), tsconfig.base.json, biome.json, .gitignore, README.md
docs/ folder: ARCHITECTURE.md, API.md, DEPLOYMENT.md
.github/workflows/ (CI/CD stubs)

Frontend (packages/frontend)
Architecture: Feature-based structure
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── menus/
│   ├── menu-items/
│   ├── restaurants/
│   ├── qr-codes/
│   └── admin/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   ├── utils/
│   └── types/
├── lib/
│   ├── api-client.ts
│   └── query-client.ts
├── routes/
│   ├── owner-routes.tsx
│   ├── admin-routes.tsx
│   └── customer-routes.tsx
├── config/
│   └── constants.ts
├── App.tsx
└── main.tsx
Essential packages only:

react, react-dom, react-router-dom
@tanstack/react-query (latest), @tanstack/react-table
axios, zod
tailwindcss (v4 if stable, else v3)
All necessary @types packages

TypeScript absolute imports:
json{
  "compilerOptions": {
    "paths": {
      "@features/*": ["./src/features/*"],
      "@shared/*": ["./src/shared/*"],
      "@lib/*": ["./src/lib/*"],
      "@config/*": ["./src/config/*"],
      "@routes/*": ["./src/routes/*"],
      "@assets/*": ["./src/assets/*"]
    }
  }
}
```

**Config files needed:**
- vite.config.ts (with path aliases)
- tsconfig.json (extends base, DOM lib, JSX)
- tailwind.config (check latest docs for v4/v3)
- .env.example (VITE_API_URL, VITE_APP_ENV)

### Backend (packages/backend)

**Architecture:** Layered (Controller → Service → Repository) with DI container
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.validation.ts
│   │   └── auth.types.ts
│   ├── restaurants/
│   ├── menus/
│   ├── menu-items/
│   └── admin/
├── shared/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── utils/
│   ├── types/
│   └── errors/
│       └── app-error.ts
├── config/
│   ├── env.ts
│   └── app.config.ts
├── database/
│   └── client.ts
├── container.ts
├── app.ts
└── server.ts
Essential packages only:

express, cors, helmet, compression
prisma, @prisma/client
bcryptjs, jsonwebtoken, zod, dotenv, qrcode
Dev dependencies: tsx, tsc-alias
All necessary @types packages

TypeScript absolute imports:
json{
  "compilerOptions": {
    "paths": {
      "@modules/*": ["./src/modules/*"],
      "@shared/*": ["./src/shared/*"],
      "@config/*": ["./src/config/*"],
      "@database/*": ["./src/database/*"]
    }
  }
}
Prisma schema models:

User (id, email, password, role)
Restaurant (id, owner_id, name, slug, qr_code_url)
Menu (id, restaurant_id, name, is_active)
MenuItem (id, menu_id, name, description, price, image_url)
Category (id, restaurant_id, name)
Order (id, restaurant_id, customer_id, status) [future]
OrderItem (id, order_id, menu_item_id) [future]

Include proper relations, indexes, and constraints.
Config files needed:

tsconfig.json (extends base, Node lib, ES2022, strict)
.env.example (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, PORT, NODE_ENV, CORS_ORIGIN, QR_CODE_DIR)
Dockerfile (Node 20 Alpine, multi-stage build)
.dockerignore

Scripts Configuration
Root package.json
json{
  "name": "qr-menu-saas",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "concurrently \"npm:dev:*\"",
    "dev:backend": "npm run dev -w backend",
    "dev:frontend": "npm run dev -w frontend",
    "build": "npm run build --workspaces",
    "type-check": "npm run type-check --workspaces",
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "test": "npm run test --workspaces",
    "db:migrate": "npm run db:migrate -w backend",
    "db:migrate:dev": "npm run db:migrate:dev -w backend",
    "db:studio": "npm run db:studio -w backend",
    "db:seed": "npm run db:seed -w backend",
    "db:reset": "npm run db:reset -w backend",
    "clean": "npm run clean --workspaces"
  },
  "devDependencies": {
    "concurrently": "latest"
  }
}
Backend package.json scripts
json{
  "scripts": {
    "dev": "tsx watch --clear-screen=false src/server.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/server.js",
    "type-check": "tsc --noEmit",
    "lint": "biome check src/",
    "lint:fix": "biome check --apply src/",
    "test": "vitest",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "clean": "rm -rf dist"
  }
}
Frontend package.json scripts
json{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "biome check src/",
    "lint:fix": "biome check --apply src/",
    "test": "vitest",
    "clean": "rm -rf dist"
  }
}
Critical Requirements

Absolutely NO relative imports - only absolute imports using path aliases
Use CLI commands: npm create vite@latest, npm init, npx prisma init, etc.
Check official latest docs for React 19, Vite 6, TailwindCSS 4 setup steps
Each package must have its own tsconfig.json extending from root
Barrel exports (index.ts) in all features and modules for clean imports
All configs must be deployment-ready (production builds work out of the box)
TypeScript strict mode enabled everywhere
Use Biome for linting (not ESLint/Prettier)
Include build scripts that handle TypeScript path aliases (use tsc-alias for backend)
Simple DI container pattern (manual container.ts file, no libraries)
React Query setup with proper configuration
Axios instance with interceptors for auth tokens
Proper error handling structure in backend
Separate dev/prod environment handling

Additional Files Needed
Root Level

biome.json (strict TypeScript + React rules, import sorting)
tsconfig.base.json (strict mode, ES2022, composite for monorepo)
.gitignore (node_modules, dist, .env, logs, coverage, .DS_Store, .vscode, .idea)
README.md (overview, setup, scripts reference, environment variables)

docs/ folder

ARCHITECTURE.md (explain feature-based frontend, layered backend, DI pattern)
API.md (API documentation structure)
DEPLOYMENT.md (environment setup, deployment steps for Vercel/Railway/Render)

.github/workflows/

ci.yml (lint, type-check, test on PR)
deploy-backend.yml (Railway/Render deployment)
deploy-frontend.yml (Vercel deployment)

Do NOT Include

Unnecessary packages (no Lodash, Moment.js, class-validator, etc.)
State management libraries (Redux, Zustand) - use React Query + Context API
UI component libraries (shadcn, MUI, Ant Design) - only TailwindCSS
Actual business logic implementation
Example data or dummy components
ESLint/Prettier (use Biome instead)

Do Include

Complete folder structure with empty files showing patterns
All package.json files with correct dependencies and scripts
All TypeScript config files with path aliases properly configured
All essential config files (Vite, TailwindCSS, Prisma, Biome, Docker)
Proper .env.example files with all required environment variables
README files in each package explaining structure
Type definition file structure (.d.ts where needed)
Deployment configurations ready to use

Output Format

Start with CLI commands to run in sequence for initial setup
Then create files manually only where no CLI exists
Show minimal file content for configs and structural files only
Include complete package.json files with all dependencies and scripts
Include all tsconfig files with proper path alias configuration
Keep explanations brief - focus on executable commands and file structure
Ensure everything is production-ready and deployment-ready from the start

Generate the complete monorepo setup using maximum CLI automation and minimal manual file creation.