# System Architecture

## Overview
Anonymous story-based website built with Next.js 14 App Router, deployed on Vercel with Postgres database.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Frontend (React/Next.js)                           │   │
│  │   - Cookie-based session tracking                     │   │
│  │   - Client-side state management                      │   │
│  │   - Real-time timer display                           │   │
│  └──────────────┬───────────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              VERCEL EDGE NETWORK                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Next.js App Router (Serverless Functions)          │   │
│  │   ┌────────────────────────────────────────────────┐ │   │
│  │   │  API Routes                                     │ │   │
│  │   │  - /api/session                                 │ │   │
│  │   │  - /api/submit-name                             │ │   │
│  │   │  - /api/submit-sender                           │ │   │
│  │   │  - /api/submit-feelings                         │ │   │
│  │   │  - /api/timer                                   │ │   │
│  │   │  - /api/story                                   │ │   │
│  │   │  - /api/admin/*                                 │ │   │
│  │   └────────────────────────────────────────────────┘ │   │
│  └──────────────┬───────────────────────────────────────┘   │
└─────────────────┼───────────────────────────────────────────┘
                  │
                  │ Postgres Protocol
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              VERCEL POSTGRES                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Database Tables                                    │   │
│  │   ┌────────────┐  ┌──────────────┐  ┌───────────┐   │   │
│  │   │  sessions  │  │  responses   │  │   story   │   │   │
│  │   └────────────┘  └──────────────┘  └───────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### sessions table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### responses table
```sql
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  
  -- User inputs
  name_input VARCHAR(255),
  sender_guess VARCHAR(255),
  feelings_answer BOOLEAN,
  
  -- State management
  current_page INTEGER DEFAULT 1,
  is_name_match BOOLEAN DEFAULT FALSE,
  is_qualified BOOLEAN DEFAULT FALSE,
  
  -- Timer management
  timer_started_at TIMESTAMP WITH TIME ZONE,
  timer_duration_seconds INTEGER DEFAULT 120,
  timer_completed BOOLEAN DEFAULT FALSE,
  story_revealed BOOLEAN DEFAULT FALSE,
  
  -- Page locking
  locked_to_final BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(session_id)
);
```

### story table
```sql
CREATE TABLE story (
  id SERIAL PRIMARY KEY,
  content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## User Flow Logic

### 1. Initial Visit
```
User visits site
    ↓
Session cookie created (UUID)
    ↓
Session record created in DB
    ↓
Response record created (current_page: 1)
    ↓
Show Page 1: Name Input
```

### 2. Name Submission
```
User submits name
    ↓
POST /api/submit-name
    ↓
Update response: {name_input, current_page: 2}
    ↓
Show Page 2: Sender Guess
```

### 3. Sender Guess Submission
```
User submits guess
    ↓
POST /api/submit-sender
    ↓
Check if guess contains "vel"/"velu"/"velmurugan"
    ↓
Update response: {sender_guess, is_name_match, current_page: 3}
    ↓
Show Page 3: Feelings Question
```

### 4. Feelings Submission - CRITICAL LOGIC
```
User selects Yes/No
    ↓
POST /api/submit-feelings
    ↓
Check qualification: is_name_match AND feelings === true
    ↓
    ├─ IF QUALIFIED:
    │   Update response: {
    │     feelings_answer: true,
    │     is_qualified: true,
    │     timer_started_at: NOW(),
    │     locked_to_final: true,
    │     current_page: 4
    │   }
    │   ↓
    │   Redirect to /final (Timer Page)
    │
    └─ IF NOT QUALIFIED:
        Update response: {
          feelings_answer,
          is_qualified: false,
          current_page: 4
        }
        ↓
        Show "You know whom to contact" message
```

### 5. Final Page with Timer (Qualified Users Only)
```
User on /final
    ↓
GET /api/timer (every second)
    ↓
Calculate: remaining = duration - (now - timer_started_at)
    ↓
    ├─ IF remaining > 0:
    │   Display countdown timer
    │   Show progress bar
    │
    └─ IF remaining === 0:
        Update response: {timer_completed: true, story_revealed: true}
        ↓
        GET /api/story
        ↓
        Display story content
```

## Page Locking Mechanism

### How It Works
```
On ANY page load:
    ↓
GET /api/session
    ↓
Check response.locked_to_final
    ↓
    ├─ IF true:
    │   Redirect to /final (regardless of URL)
    │
    └─ IF false:
        Load requested page normally
```

This ensures:
- Once qualified → always redirected to /final
- Timer persists across:
  - Page refreshes
  - Browser closes/reopens
  - Different devices (same session cookie)
  - Direct URL access attempts

## Timer Implementation (Serverless-Safe)

### Server-Side Timer
```typescript
// NO background jobs
// NO setInterval on server
// Purely timestamp-based calculation

function getRemainingSeconds(response: Response): number {
  if (!response.timer_started_at) return response.timer_duration_seconds;
  
  const startTime = new Date(response.timer_started_at).getTime();
  const currentTime = Date.now();
  const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
  const remaining = response.timer_duration_seconds - elapsedSeconds;
  
  return Math.max(0, remaining);
}
```

### Client-Side Timer Display
```typescript
// Poll server every second
useEffect(() => {
  const interval = setInterval(() => {
    fetchTimerStatus(); // GET /api/timer
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

### Why This Works on Vercel
- ✅ No long-running processes
- ✅ No in-memory state
- ✅ Pure computation from timestamps
- ✅ Database as single source of truth
- ✅ Function executes, calculates, returns, terminates

## Admin Authentication

### Simple Password-Based Auth
```
Admin visits /admin
    ↓
Enter password
    ↓
POST /api/admin/auth
    ↓
Compare password with ADMIN_PASSWORD env var
    ↓
    ├─ IF match:
    │   Set admin_token cookie
    │   Redirect to /admin/dashboard
    │
    └─ IF no match:
        Show error
```

### Protected Routes
All `/api/admin/*` routes check:
```typescript
async function checkAuth(): Promise<boolean> {
  const token = cookies().get('admin_token')?.value;
  return token === process.env.ADMIN_PASSWORD;
}
```

## API Routes Summary

### Public Routes
- `GET /api/session` - Initialize/get session state
- `POST /api/submit-name` - Submit name
- `POST /api/submit-sender` - Submit sender guess
- `POST /api/submit-feelings` - Submit feelings (triggers qualification)
- `GET /api/timer` - Get timer status (qualified users only)
- `GET /api/story` - Get story content (revealed users only)

### Admin Routes (Protected)
- `POST /api/admin/auth` - Login
- `DELETE /api/admin/auth` - Logout
- `GET /api/admin/responses` - Get all responses
- `GET /api/admin/story` - Get current story
- `POST /api/admin/story` - Update story
- `POST /api/admin/reset` - Reset all data

## Security Considerations

### Session Management
- HttpOnly cookies
- Secure flag in production
- SameSite: Lax
- 1-year expiration

### Input Validation
- Server-side validation for all inputs
- No client-side bypass possible
- SQL injection prevented (parameterized queries)

### Admin Protection
- Password-based authentication
- Environment variable storage
- Cookie-based session
- No brute-force protection (add if needed)

### Privacy
- No analytics
- No tracking
- No third-party services
- Minimal data collection

## Performance Optimizations

### Database Queries
- Indexed columns: session_token, session_id, is_qualified
- Single query per API call
- No N+1 query problems

### Caching Strategy
- None needed (privacy-first design)
- Fresh data on every request
- Acceptable for low-traffic use case

### Edge Functions
- Vercel Edge Network for low latency
- Serverless functions scale automatically
- Cold start: ~100-300ms (acceptable)

## Scalability Notes

Current architecture supports:
- ~1000 concurrent users (Vercel free tier)
- Unlimited total submissions
- Database: 256MB = ~100,000 responses

For higher scale, consider:
- Add Redis for session caching
- Upgrade Vercel Postgres tier
- Add rate limiting
- Implement CDN for static assets

## Error Handling

### Frontend
```typescript
try {
  const res = await fetch('/api/...');
  const data = await res.json();
  if (!data.success) {
    setError(data.error);
  }
} catch (err) {
  setError('Network error');
}
```

### Backend
```typescript
try {
  // Database operation
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { success: false, error: 'Operation failed' },
    { status: 500 }
  );
}
```

## Monitoring & Debugging

### Vercel Dashboard
- Real-time function logs
- Error tracking
- Performance metrics
- Database usage

### Database Monitoring
- Connection pool status
- Query performance
- Storage usage
- Compute hours

### Custom Logging
```typescript
console.log('[API] Timer check:', {
  sessionId,
  remainingSeconds,
  timerCompleted
});
```

## Deployment Pipeline

```
Local Development
    ↓
Git Commit
    ↓
Push to GitHub
    ↓
Vercel Auto-Deploy
    ↓
Build & Test
    ↓
Deploy to Production
```

### Environment Parity
- Development: `npm run dev`
- Production: Vercel Edge
- Database: Same Vercel Postgres instance

## Future Enhancements (Optional)

1. Rate limiting per IP
2. Email notifications on submission
3. Multiple story variants
4. Custom timer duration per session
5. Analytics dashboard (if privacy allows)
6. Backup automation
7. Multi-language support
8. Progressive Web App (PWA)

---

**This architecture is production-ready, serverless-friendly, and optimized for Vercel's free tier.**
