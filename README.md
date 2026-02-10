# Anonymous Story Website

## Project Overview
A story-based anonymous website to understand your crush's opinion through a questionnaire.

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel Postgres (Free tier)
- **Hosting**: Vercel (Free plan)

## Setup Instructions

### 1. Prerequisites
```bash
node >= 18.x
npm or yarn
Vercel account
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup (Vercel Postgres)
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the connection string
4. Add to `.env.local`:

```env
POSTGRES_URL="your-connection-string"
ADMIN_PASSWORD="your-secure-password"
```

### 4. Initialize Database
```bash
npm run db:init
```

### 5. Local Development
```bash
npm run dev
```

### 6. Deploy to Vercel
```bash
vercel
```

Add environment variables in Vercel dashboard:
- `POSTGRES_URL`
- `ADMIN_PASSWORD`

## Features
- ✅ Anonymous questionnaire flow
- ✅ Server-side validation & logic
- ✅ Persistent countdown timer
- ✅ Page locking after completion
- ✅ Admin dashboard for viewing responses
- ✅ Story upload/edit capability
- ✅ Complete reset functionality

## Routes
- `/` - Main questionnaire
- `/admin` - Admin dashboard (protected)

## Security
- Server-side only validation
- No client-side state manipulation
- Admin password protection
- No URL-based bypass possible
