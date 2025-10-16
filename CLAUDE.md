# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Bible study application with an offline-first PWA frontend and Django REST backend. The app is designed to work completely offline with automatic sync when connectivity is restored.

**Stack:**
- Frontend: Next.js 14 (App Router), React 18, TypeScript/JavaScript
- Backend: Django 5.1, Django REST Framework, PostgreSQL
- Offline: IndexedDB (via idb), PWA with service workers
- Deployment: Docker Compose

## Common Commands

### Development

```bash
# Start full stack with Docker
docker-compose up

# Frontend development (from project root)
cd frontend
npm install
npm run dev              # Start dev server on :3000
npm run build           # Production build
npm run start           # Production server

# Backend development (from project root)
cd backend
pip install -r requirements.txt
python manage.py runserver  # Start on :8000
```

### Code Quality

```bash
# Lint and format (from frontend/)
npm run lint            # Check for issues
npm run lint:fix        # Auto-fix issues
npm run format          # Format all files
npm run format:check    # Check formatting

# Lint from project root
./lint-frontend.sh
```

### Testing Offline Functionality

```bash
# Use Chrome/Firefox DevTools:
# Network tab → Set to "Offline" → Test offline features
# Application tab → IndexedDB → BibleStudyDB → Inspect stores
```

## Architecture

### Frontend Structure

The frontend uses Next.js App Router with a carefully orchestrated offline-first architecture:

**Storage Layer** (`frontend/lib/db.js`):
- IndexedDB wrapper with 4 object stores: verses, studyNotes, userSettings, syncQueue
- Provides CRUD operations for all stores with automatic timestamping

**API Client** (`frontend/lib/apiClient.js`):
- Implements 3 caching strategies:
  - **Cache-First**: Bible content (check cache → fetch if missing)
  - **Network-First**: User data (try API → fallback to cache)
  - **Network + Queue**: Mutations (POST to API or queue if offline)
- 5-second timeout on all requests
- Offline detection via `navigator.onLine`

**Sync Manager** (`frontend/lib/syncManager.js`):
- Automatic sync when connection restored (online/offline event listeners)
- Timestamp-based ordering (oldest first)
- Last-write-wins conflict resolution
- Retry on failure (items stay in queue)
- Browser notifications for sync status

**React Integration** (`frontend/lib/DBProvider.jsx`):
- Context provider wrapping the app in `frontend/app/layout.jsx`
- `useDB()` hook provides: `{ isInitialized, db, syncStatus, triggerSync }`
- Auto-initialization and cleanup

**PWA Configuration** (`frontend/next.config.js`):
- Service worker via @ducanh2912/next-pwa
- Disabled in development, active in production
- Manifest at `frontend/public/manifest.json`

### Backend Structure

Standard Django REST API:
- `backend/bible_app/` - Main Django project (settings, URLs)
- `backend/api/` - REST API app
- PostgreSQL database via Docker

### Key Files

- `frontend/OFFLINE_FIRST_COMPLETE.md` - Complete offline architecture documentation
- `frontend/lib/API_CLIENT_README.md` - Detailed API client usage guide
- `frontend/MOBILE_UTILS_README.md` - Mobile detection utilities
- `LINTING.md` - Code quality setup and common fixes

## Path Aliases

The frontend uses TypeScript path aliases:
- `@/*` maps to `frontend/*`
- Example: `import { useDB } from '@/lib/DBProvider'`

## Code Quality Standards

**Pre-commit hooks** (Husky + lint-staged):
- Auto-format with Prettier (4 spaces, semicolons, single quotes)
- Auto-fix ESLint issues
- Commit blocked if errors remain

**ESLint rules** (see `frontend/.eslintrc.json`):
- Import ordering: builtin → external → internal (alphabetical within groups)
- React/Next.js best practices
- Accessibility checks
- No unused variables, no console.log in production code

**Import order violations are auto-fixed**. Other common issues:
- Missing alt text on images: Add descriptive `alt` attribute
- Unused variables: Remove or prefix with underscore
- Console statements: Use proper logging or remove

## JWT Authentication (Planned - Step 5)

The codebase has TODO comments marking JWT integration points:
- `frontend/lib/apiClient.js` - Add token checks and 401 handling
- `frontend/lib/syncManager.js` - Validate tokens before sync
- Search for "TODO: Step 5" or "TODO: Add JWT" to find all integration points

## Testing Offline Features

1. Open Chrome DevTools → Network tab → Set to "Offline"
2. Add a study note (should queue in IndexedDB)
3. Check Application → IndexedDB → BibleStudyDB → syncQueue
4. Switch back to "Online"
5. Watch automatic sync in console logs

Console commands:
```javascript
// Get sync status
const status = await getSyncStatus();
console.log('Pending:', status.pendingCount);

// Manual sync trigger
const result = await triggerManualSync();

// Inspect queue
const queue = await db.getSyncQueue();
```

## Environment Variables

Copy `.env.example` to `.env` and configure:
- `POSTGRES_*` - Database credentials
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Django secret key
- `DEBUG` - Django debug mode
- `ALLOWED_HOSTS` - Django allowed hosts
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:8000/api)

## Docker Services

The docker-compose.yml defines 3 services:
- `db` - PostgreSQL 16 (port 5432) with health checks
- `backend` - Django app (port 8000) depends on db
- `frontend` - Next.js app (port 3000) depends on backend

## Important Notes

- The frontend mixes `.js`, `.jsx`, `.ts`, and `.tsx` files - this is intentional during migration
- Service worker is disabled in development to avoid caching issues
- All data modifications while offline are queued and synced automatically
- The syncQueue uses auto-increment IDs and timestamp/type indexes for efficient queries
- Mobile utilities (`useMediaQuery`, `useTouchGestures`) are in `frontend/hooks/`
