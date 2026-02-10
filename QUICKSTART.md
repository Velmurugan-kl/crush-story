# 🚀 Quick Start Guide

## Overview
This is a complete, production-ready anonymous story website built for Vercel's free tier.

## What's Included
✅ Next.js 14 App Router  
✅ Vercel Postgres database  
✅ Server-side timer logic  
✅ Admin dashboard  
✅ Complete deployment guide  
✅ Testing documentation  

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Vercel Postgres
1. Create a free account at https://vercel.com
2. Go to Storage → Create Database → Select Postgres
3. Copy the `POSTGRES_URL` from the .env.local tab

### 3. Configure Environment
```bash
# Create .env.local file
cat > .env.local << EOF
POSTGRES_URL="your-postgres-url-here"
ADMIN_PASSWORD="your-secure-password-here"
EOF
```

### 4. Initialize Database
```bash
npm run db:init
```

### 5. Start Development
```bash
npm run dev
```

Visit http://localhost:3000

## Test the Flow

### Happy Path
1. Enter any name
2. Enter "vel" (or "velu" or "velmurugan") as sender guess
3. Click "Yes" for feelings
4. See 2-minute countdown timer
5. Wait for story reveal

### Rejection Path
1. Enter any name
2. Enter anything other than "vel" as sender guess
3. Click "Yes" or "No"
4. See rejection message

## Access Admin Dashboard
1. Visit http://localhost:3000/admin
2. Enter your `ADMIN_PASSWORD`
3. View responses, edit story, or reset data

## Deploy to Production

### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then run database init one more time
```

### Detailed Guide
See `DEPLOYMENT.md` for complete deployment instructions.

## Project Structure
```
crush-story/
├── app/
│   ├── page.tsx              # Main questionnaire
│   ├── final/page.tsx        # Timer & story reveal
│   ├── admin/
│   │   ├── page.tsx          # Admin login
│   │   └── dashboard/        # Admin dashboard
│   └── api/                  # All API routes
├── lib/
│   ├── db.ts                 # Database utilities
│   └── session.ts            # Session management
├── scripts/
│   └── init-db.js            # Database setup
└── Documentation
    ├── README.md             # Project overview
    ├── DEPLOYMENT.md         # Deploy to Vercel
    ├── ARCHITECTURE.md       # System design
    └── TESTING.md            # Testing guide
```

## Key Features

### 🔒 Page Locking
Once qualified, user is locked to final page across:
- Browser refreshes
- Different tabs
- Different devices (with same session)

### ⏰ Persistent Timer
Timer runs server-side and persists:
- Across page refreshes
- In different browsers (same session)
- On different devices

### 🛡️ Security
- HttpOnly cookies
- Server-side validation
- No client-side bypasses
- Password-protected admin

### 💰 Free Tier Friendly
- Optimized for Vercel free plan
- Minimal database usage
- No external dependencies

## Customization

### Change Timer Duration
Edit `lib/db.ts`:
```typescript
timer_duration_seconds INTEGER DEFAULT 120, // Change to your desired seconds
```

### Change Name Match Logic
Edit `lib/db.ts` in `checkNameMatch()` function:
```typescript
export function checkNameMatch(input: string): boolean {
  const normalized = input.toLowerCase().trim();
  return normalized.includes('yourname'); // Change this
}
```

### Update Story Content
1. Visit /admin
2. Login
3. Go to "Story" tab
4. Edit content
5. Click "Update Story"

## Troubleshooting

### "Failed to load" error
- Check POSTGRES_URL is correct
- Verify database is initialized
- Run `npm run db:init`

### Timer not working
- Check browser console for errors
- Verify timer_started_at is set in database
- Ensure /api/timer returns data

### Admin can't login
- Verify ADMIN_PASSWORD in .env.local
- Check password is exact match (case-sensitive)

### Database connection error
- Verify Vercel Postgres is created
- Check connection string format
- Ensure database is active

## Next Steps

1. ✅ Test locally (see TESTING.md)
2. ✅ Customize name matching logic
3. ✅ Write your story in admin
4. ✅ Deploy to Vercel
5. ✅ Share the link

## Need Help?

- 📖 Read ARCHITECTURE.md for system design
- 🧪 Check TESTING.md for test scenarios
- 🚀 See DEPLOYMENT.md for deploy guide
- ⚙️ Review code comments for details

## Important Notes

⚠️ **Privacy First**: No analytics, no tracking, no third-party services

⚠️ **Irreversible**: Once user reaches final page, they cannot go back

⚠️ **Single Use**: Each session can only complete the flow once

⚠️ **Free Tier**: Optimized for Vercel's free plan limits

---

**Your anonymous story website is ready! 🎉**

Start by running `npm install && npm run dev`
