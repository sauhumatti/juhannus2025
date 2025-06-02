# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary development workflow:**
- `npm run dev` - Start development server with Turbopack (fast builds)
- `npm run build` - Production build (includes Prisma client generation)
- `npm run lint` - Run ESLint checks
- `npm start` - Start production server

**Database commands:**
- `npx prisma generate` - Generate Prisma client (runs automatically on postinstall)
- `npx prisma db push` - Push schema changes to database
- `npx prisma studio` - Open database browser

## Architecture Overview

This is a Finnish party/social gaming application built with **Next.js 15 App Router**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. The app manages multiple party games, user profiles, and social interactions for birthday party guests.

### Admin Dashboard (`/admin`)

**Critical feature:** Comprehensive admin panel requiring `username === "admin"` for access.

**Core Admin Functions:**
- **Game Controls**: Toggle icebreaker game on/off globally
- **Leaderboard Management**: Edit scores directly, delete individual score entries
- **Beer Pong Match Management**: Change match status (ongoing/completed), assign winners, delete matches
- **User Management**: View all user stats, delete users (except admin), track icebreaker progress
- **Icebreaker Answer Moderation**: View and delete individual answer submissions

**Admin API Endpoints:**
- `/api/admin/game-state` - GET/PUT icebreaker toggle state
- `/api/admin/leaderboard` - GET all scores, PUT/DELETE individual scores
- `/api/admin/beerpong` - GET matches, PUT match status/winners, DELETE matches
- `/api/admin/users` - GET all users with stats, DELETE users
- `/api/admin/icebreaker/answers` - GET/DELETE answer submissions

### Core Application Structure

**Authentication & Sessions:**
- Session-based auth using `sessionStorage` (not JWT)
- Admin access via `username === "admin"`
- User state managed in client components

**Database Models:**
- `User` - Central user model with Cloudinary photo URLs
- Game scores: `DartScore` (0-50), `PuttingScore` (0-10), `BeerScore` (time in seconds)
- `BeerPongMatch` - Complex tournament system with teams and statistics
- `IcebreakerCard`/`IcebreakerAnswer` - Social card game system using `tutustumiskortit.json`

**API Structure:**
- `/api/auth/*` - Authentication endpoints
- `/api/games/*` - Game-specific scoring APIs
- `/api/admin/*` - Administrative functions
- `/api/icebreaker/*` - Social game management

### Key Technical Details

**Game Components:**
- Game components in `src/components/games/` use dynamic imports to prevent SSR issues
- Each game has unique scoring logic and API endpoints
- Leaderboard component is reusable across different game types

**Beer Pong System:**
- Most complex feature with team formation, match tracking, and statistics
- Supports 1v1 or 2v2 matches with optional team names
- Individual stats tracking (wins, losses, streaks)

**Icebreaker Game:**
- JSON-based question cards from `tutustumiskortit.json`
- Social interaction system where users answer questions about each other
- Database tracks who answered what about whom

**Error Handling:**
- Finnish language error messages throughout API endpoints
- Consistent error response format across all routes

## Development Guidelines

**File Organization:**
- Use absolute imports with `@/*` path mapping
- API routes follow RESTful conventions
- Components are organized by feature area

**Database Operations:**
- Always use Prisma client from `@/lib/prisma`
- CUID primary keys for all models
- Proper relationship handling with foreign keys

**Authentication Patterns:**
- Check session storage for user data in client components
- Verify admin status with `user?.username === "admin"`
- Handle authentication state in layout and navigation

**API Development:**
- Return Finnish error messages for user-facing errors
- Use proper HTTP status codes
- Include comprehensive error handling for database operations