# Anonymous Story Website

## Project Overview
A story-based anonymous website to understand your crush's opinion through a questionnaire.

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Vercel Serverless Functions
- **Database**: Neon Serverless Postgres (Free tier)
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

### 3. Database Setup (Neon Postgres)
1. Go to your Vercel dashboard
2. Navigate to Storage → Connect Store
3. Select **Neon** (Serverless Postgres)
4. Follow integration steps
5. Copy the `DATABASE_URL` connection string

### 4. Configure Environment
Add to `.env.local`:

```env
DATABASE_URL="your-neon-connection-string"
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
