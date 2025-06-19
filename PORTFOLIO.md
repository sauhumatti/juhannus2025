# Saku30v - Finnish Party Gaming Platform

## Project Overview

**Saku30v** is a comprehensive full-stack web application designed for Finnish birthday party management and social gaming. Built as an interactive party hub, it facilitates multiple games, social interactions, photo sharing, and real-time leaderboards for party guests.

## 🚀 Live Demo & Features

### Core Functionality
- **Multi-Game Platform**: Dart throwing, mini golf putting, beer chugging, and beer pong tournaments
- **Social Icebreaker Game**: Question-based interaction system using Finnish "tutustumiskortit" cards
- **Photo Sharing**: Cloudinary-powered photo uploads with captions and moderation
- **Real-time Leaderboards**: Dynamic scoring and ranking across all games
- **Administrative Dashboard**: Comprehensive game management and user moderation tools

### Key User Flows
1. **User Registration**: Simple sign-up with profile photo upload
2. **Game Participation**: Score tracking across multiple party games
3. **Social Interaction**: Icebreaker card answering system for guest mingling
4. **Photo Memories**: Upload and share party moments with other guests
5. **Competition Tracking**: View personal stats and compete on leaderboards

## 🛠 Technical Architecture

### Frontend Technology Stack
- **Next.js 15.3.2** with App Router architecture
- **React 19.0.0** with modern hooks and concurrent features
- **TypeScript** for type safety and developer experience
- **Tailwind CSS v4** for responsive design and mobile optimization
- **Server-Side Rendering** for optimal performance and SEO

### Backend & Database
- **Next.js API Routes** for RESTful backend services
- **Prisma ORM v6.8.2** for type-safe database operations
- **PostgreSQL** as the primary database
- **Session-based Authentication** with role-based access control

### Cloud Services & Integrations
- **Cloudinary** for image storage, optimization, and delivery
- **Signed Upload Strategy** for secure photo handling
- **Environment-based Configuration** for different deployment stages

## 📊 Database Design

### Core Models
```typescript
// User Management
User: id, username, name, photoUrl, createdAt
BeerPongStats: wins, losses, winStreak, bestStreak

// Game Scoring Systems  
DartScore: score (0-50), userId, timestamp
PuttingScore: score (0-10), userId, timestamp
BeerScore: time (seconds), userId, timestamp

// Tournament System
BeerPongMatch: teams, winners, status, teamNames
- Supports 1v1 and 2v2 formats
- Real-time match tracking

// Social Features
IcebreakerCard: cardId, userId (from JSON question bank)
IcebreakerAnswer: questionNumber, giver, receiver
PhotoMoment: photoUrl, caption, userId, timestamp

// Admin Controls
GameState: isIcebreakerEnabled, lastUpdated, updatedBy
```

### Advanced Relationships
- **Many-to-Many**: Beer pong team assignments and winner tracking
- **One-to-Many**: User scoring across multiple game types
- **Self-Referential**: Icebreaker answers linking users to each other

## 🎯 Complex Features Implemented

### 1. Beer Pong Tournament System
- **Dynamic Team Formation**: 1v1 or 2v2 match creation
- **Real-time Match Tracking**: Ongoing vs completed status management
- **Individual Statistics**: Win/loss records and streak tracking
- **Match Management**: Admin tools for result modification and dispute resolution

### 2. Icebreaker Social Game
- **JSON-Driven Questions**: External question bank from `tutustumiskortit.json`
- **Cross-User Interactions**: Users answer questions about other guests
- **Answer Tracking**: Database records of who answered what about whom
- **Admin Moderation**: Tools to manage inappropriate responses

### 3. Photo Sharing Platform
- **Cloudinary Integration**: Secure upload with signature verification
- **Image Optimization**: Automatic resizing and format optimization
- **Caption Management**: Editable photo descriptions
- **Admin Moderation**: Photo deletion capabilities for content management

### 4. Administrative Dashboard
- **Game State Control**: Toggle icebreaker game availability
- **Score Management**: Direct leaderboard editing and score deletion
- **User Management**: View statistics, manage accounts (except admin protection)
- **Content Moderation**: Photo and answer content oversight tools

## 🔧 Technical Challenges Solved

### Mobile Optimization
- **Text Visibility Issue**: Solved light text readability on mobile devices
- **Custom CSS Overrides**: Media queries for mobile-specific styling
- **Responsive Image Handling**: Different behaviors for mobile vs desktop

### Performance Optimization
- **Dynamic Imports**: Game components loaded on-demand to prevent SSR issues
- **Turbopack Integration**: Fast development builds with `--turbopack`
- **Prisma Client Generation**: Automated on build and install processes

### Security Implementation
- **Role-Based Access**: Admin-only features with `username === "admin"` verification
- **Session Management**: Client-side session storage with server-side validation
- **Photo Upload Security**: Signed uploads and content type validation

## 📱 User Experience Features

### Responsive Design
- **Mobile-First Approach**: Optimized for party guests using phones
- **Custom Scrollbar Styling**: Hidden scrollbars for cleaner mobile experience
- **Touch-Friendly UI**: Large buttons and gesture-friendly navigation

### Internationalization
- **Finnish Language Support**: Error messages and UI text in Finnish
- **Cultural Context**: Party games and social interactions tailored for Finnish celebrations

### Real-time Updates
- **Live Leaderboards**: Immediate score updates across all game types
- **Photo Feed**: Recent uploads displayed on main party page
- **Match Status**: Real-time beer pong tournament progress

## 🚀 Deployment & DevOps

### Development Workflow
```bash
npm run dev --turbopack  # Fast development with Turbopack
npm run build           # Production build with Prisma generation
npm run lint           # ESLint code quality checks
npx prisma studio      # Database management interface
```

### Environment Configuration
- **Cloudinary Settings**: Cloud name, upload presets, API credentials
- **Database URL**: PostgreSQL connection string
- **Development vs Production**: Environment-specific configurations

## 📈 Project Impact & Learning Outcomes

### Technical Skills Demonstrated
- **Full-Stack Development**: End-to-end application architecture
- **Modern React Patterns**: Hooks, concurrent features, and server components
- **Database Design**: Complex relationships and query optimization
- **Cloud Integration**: Third-party service integration and file management
- **Mobile Development**: Responsive design and mobile-specific optimizations

### Problem-Solving Approach
- **User-Centered Design**: Features designed around actual party scenarios
- **Scalable Architecture**: Database and API design for growth
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Performance Considerations**: Optimized for mobile devices and network conditions

## 🔗 Repository Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Administrative dashboard
│   ├── api/            # Backend API routes
│   ├── games/          # Game-specific pages
│   └── photos/         # Photo sharing interface
├── components/         # Reusable React components
├── lib/                # Utility functions and Prisma client
└── types/              # TypeScript type definitions

prisma/
├── schema.prisma       # Database schema definition
└── dev.db             # Development database file
```

This project showcases modern full-stack development practices, complex state management, real-time features, and mobile-optimized user experiences in a real-world social application context.