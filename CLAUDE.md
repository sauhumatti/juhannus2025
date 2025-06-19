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

**Required environment variables:**
- `DATABASE_URL` - PostgreSQL connection string (Note: Use port 5432 for Prisma operations, not 6543)

## Environment Variables

**Required for photo uploads:**
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Upload preset for unsigned uploads
- `CLOUDINARY_API_KEY` - (Optional) For signed uploads
- `CLOUDINARY_API_SECRET` - (Optional) For signed uploads

## Architecture Overview

This is a Juhannus 2025 (Midsummer) celebration application built with:
- **Next.js 15.3.2** with App Router
- **React 19.0.0**
- **TypeScript**
- **Prisma ORM v6.8.2** with PostgreSQL
- **Tailwind CSS v4** (new version with postcss plugin)
- **Cloudinary** for photo uploads

The app manages traditional Juhannus activities, user profiles, photo sharing, and social interactions for Juhannus 2025 celebration guests.

### Admin Dashboard (`/admin`)

**Critical feature:** Comprehensive admin panel requiring `username === "admin"` for access.

**Core Admin Functions:**
- **Game Controls**: Toggle icebreaker game on/off globally
- **Leaderboard Management**: Edit scores directly, delete individual score entries
- **Beer Pong Match Management**: Change match status (ongoing/completed), assign winners, delete matches
- **User Management**: View all user stats, delete users (except admin), track icebreaker progress
- **Icebreaker Answer Moderation**: View and delete individual answer submissions
- **Photo Moderation**: Delete any user's photos (not just own)

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
- Game scores: `DartScore` (0-50), `PuttingScore` (0-10)
- `BeerPongMatch` - Complex tournament system with teams and statistics
- `MolkkyGame`/`MolkkyPlayer`/`MolkkyThrow` - Traditional Finnish Mölkky game system
- `PhotoMoment` - Photo sharing with user relationship, photoUrl, caption, and timestamps

**API Structure:**
- `/api/auth/*` - Authentication endpoints
- `/api/games/*` - Game-specific scoring APIs (darts, putting, beerpong, molkky)
- `/api/admin/*` - Administrative functions
- `/api/photos/*` - Photo CRUD operations
- `/api/photos/upload-signature` - Cloudinary upload signature generation

### Key Technical Details

**Game Components:**
- Game components in `src/components/games/` use dynamic imports to prevent SSR issues
- Each game has unique scoring logic and API endpoints
- Leaderboard component is reusable across different game types

**Beer Pong System:**
- Most complex feature with team formation, match tracking, and statistics
- Supports 1v1 or 2v2 matches with optional team names for Juhannus tournament
- Individual stats tracking (wins, losses, streaks) throughout the celebration

**Mölkky Game System:**
- Traditional Finnish throwing game with comprehensive scoring
- Real-time multiplayer with live score tracking
- Rule enforcement: exact 50 points to win, penalty system, elimination rules
- Turn-based gameplay with spectator mode

**Photo Sharing System:**
- Cloudinary integration for photo uploads during Juhannus 2025
- Users can upload, view, edit captions, and delete their own celebration photos
- Admin can delete any user's photos
- Photos page with filtering (all photos vs own photos)
- Recent photos feed displayed on celebration landing page

**Party Page (`/party`):**
- Central landing page with Juhannus 2025 celebration schedule
- Quick navigation links to all traditional Juhannus activities
- Live photo feed showing recent uploads from the celebration

**Print Page (`/print`):**
- QR code generator page for sharing the website URL
- Optimized for printing with print-specific CSS
- Currently displays saku30v.fi URL and QR code (may need updating for Juhannus 2025 domain)

**Error Handling:**
- Finnish language error messages throughout API endpoints
- Consistent error response format across all routes

**UI/UX Features:**
- Custom scrollbar hiding with `.scrollbar-hide` utility
- Responsive image handling (different behaviors on mobile/desktop)
- Google Fonts integration with Dancing Script for decorative headers
- Tailwind CSS v4 with inline theme configuration (no tailwind.config.js)
- Print-optimized styles for QR code sharing page
- Theme selection system with Juhannus-inspired color palettes and typography

**Selected Theme: Forest Folklore**
- **Primary Color**: #228B22 (Forest Green)
- **Secondary Color**: #32CD32 (Lime Green) 
- **Accent Color**: #DAA520 (Goldenrod)
- **Background Color**: #F0FFF0 (Honeydew)
- **Text Color**: #2F4F4F (Dark Slate Gray)
- **Primary Font**: Fredoka One (headings, decorative)
- **Secondary Font**: Nunito (body text, UI)
- **Theme Concept**: Deep forest greens with mystical Finnish nature vibes, hand-crafted folklore feel

**Other Theme Options (`/themes`):**
- **Midsummer Classic**: Gold and sky blue with serif fonts (traditional elegance)
- **Midnight Sun**: Bright oranges with modern fonts (endless summer light)
- **Bonfire Celebration**: Warm reds with bold fonts (kokko fire energy)
- **Lake Reflection**: Cool blues with clean fonts (Finnish lake inspiration)
- **Birch & Berries**: White and crimson with elegant fonts (summer forest theme)

**Typography Recommendations:**
- **Serif Style**: Playfair Display + Georgia (classic Finnish elegance)
- **Rustic Style**: Fredoka One + Nunito (hand-crafted folklore feel)
- **Modern Style**: Poppins + Inter (contemporary summer brightness)
- **Bold Style**: Oswald + Roboto (celebration energy)
- **Clean Style**: Lato + Source Sans Pro (clear like lake water)
- **Elegant Style**: Dancing Script + Crimson Text (birch tree grace)

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

**Mobile Text Visibility:**
- **CRITICAL ISSUE**: Light-colored text (gray-500, gray-600, gray-700) is often unreadable on mobile devices
- Always test text visibility on mobile, especially in bright lighting conditions
- When adding new pages or components, ensure dark text colors for mobile:
  - Use `text-gray-900` or `#111827` for primary text on mobile
  - Add mobile-specific CSS overrides in `src/app/globals.css` under `@media (max-width: 640px)`
  - Follow existing patterns for `.admin-page`, `.icebreaker-page`, and `.records-page` classes
- Example mobile override pattern:
  ```css
  @media (max-width: 640px) {
    .your-page-class p,
    .your-page-class span,
    .your-page-class td {
      color: #111827 !important;
    }
  }
  ```

## MCP Tool Usage

**Image Generation MCP (`mcp__mcp-image-server__*`):**
- Use for creating visuals, graphics, and other images needed for the application
- Supports transparent backgrounds and custom dimensions
- Available functions: `generate_image`, `resize_image`, `create_image_variants`

**Screenshot MCP (`mcp__mcp-screenshot-server__*`):**
- **IMPORTANT**: Always take screenshots to verify visual appearance after making UI changes
- Take both desktop and mobile screenshots to ensure responsive design works correctly
- Use `take_screenshot` for desktop view (1920x1080 default)
- Use `take_mobile_screenshot` for mobile view (with device emulation)
- Check for:
  - Text readability (especially on mobile with light backgrounds)
  - Layout issues and responsive breakpoints
  - Theme colors appearing correctly
  - Any visual glitches or alignment problems

**Visual Testing Workflow:**
1. **IMPORTANT**: The dev server should already be running (managed by the user, not Claude)
2. Check dev server logs with `tail -n 50 dev-logs.txt` to ensure no errors
3. After making UI changes, take desktop screenshot: `take_screenshot` with URL `http://localhost:3000/[page-path]`
4. Take mobile screenshot: `take_mobile_screenshot` with same URL
5. Review both screenshots for visual issues
6. Check logs again for any runtime errors: `tail -n 20 dev-logs.txt`
7. Fix any problems found and re-test

**Development Server Notes:**
- **DO NOT** start the dev server with `npm run dev`
- The dev server is managed externally by the user
- Logs are available in `dev-logs.txt`
- Use `tail -f dev-logs.txt` or `tail -n [lines] dev-logs.txt` to monitor logs
- Check logs after changes to catch compilation errors or warnings