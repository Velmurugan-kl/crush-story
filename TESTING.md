# Testing Guide

## Local Testing Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values
# POSTGRES_URL="your-postgres-url"
# ADMIN_PASSWORD="your-password"
```

### 3. Initialize Database
```bash
npm run db:init
```

### 4. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000

## Test Scenarios

### Scenario 1: Happy Path (Qualified User)

**Goal**: User guesses "vel" and answers "Yes" → sees timer → sees story

**Steps**:
1. Visit http://localhost:3000
2. **Page 1**: Enter name "Sarah"
   - Click "Next"
3. **Page 2**: Enter sender guess "Vel" (or "velmurugan" or "velu")
   - Click "Next"
4. **Page 3**: Click "Yes"
5. **Final Page**: Should see countdown timer (2 minutes)
6. Wait for timer to complete
7. Story should appear

**Expected Results**:
- ✅ Redirected to /final after clicking Yes
- ✅ Timer starts at 2:00 (120 seconds)
- ✅ Timer decrements every second
- ✅ Progress bar fills up
- ✅ Story appears when timer hits 0:00
- ✅ Refreshing page shows same remaining time
- ✅ Accessing root URL redirects to /final

### Scenario 2: Wrong Sender Guess

**Goal**: User doesn't guess "vel" → sees rejection message

**Steps**:
1. Visit http://localhost:3000 (clear cookies or use incognito)
2. **Page 1**: Enter name "John"
3. **Page 2**: Enter sender guess "Mike"
4. **Page 3**: Click "Yes"

**Expected Results**:
- ❌ Should see "You know whom to contact" message
- ❌ No timer
- ❌ No story

### Scenario 3: Correct Guess but "No" Answer

**Goal**: User guesses "vel" but answers "No" → sees rejection message

**Steps**:
1. Visit http://localhost:3000 (clear cookies or use incognito)
2. **Page 1**: Enter name "Emma"
3. **Page 2**: Enter sender guess "Velmurugan"
4. **Page 3**: Click "No"

**Expected Results**:
- ❌ Should see "You know whom to contact" message
- ❌ No timer
- ❌ No story

### Scenario 4: Page Locking

**Goal**: Verify user cannot escape timer page

**Setup**: Complete Scenario 1 until timer starts

**Steps**:
1. With timer running, try to access http://localhost:3000
   - Should redirect to /final
2. With timer running, try to access http://localhost:3000/admin
   - Should redirect to /final
3. Refresh /final page
   - Should show correct remaining time
4. Open in different browser (same machine)
   - Should NOT redirect (different session)
5. Copy session cookie to different browser
   - Should redirect to /final

**Expected Results**:
- ✅ All attempts to leave /final redirect back
- ✅ Timer persists across refreshes
- ✅ Remaining time is accurate

### Scenario 5: Timer Persistence Across Devices

**Goal**: Verify timer continues on different devices with same session

**Steps**:
1. Start scenario on Device A
2. Complete form until timer starts
3. Export session cookie from Device A
4. Import session cookie to Device B
5. Visit site on Device B

**Expected Results**:
- ✅ Timer shows same remaining time
- ✅ Timer continues counting down
- ✅ Story appears on both devices when timer completes

### Scenario 6: Admin Dashboard

**Goal**: Test admin functionality

**Steps**:
1. Visit http://localhost:3000/admin
2. Enter correct password
3. Verify dashboard loads
4. **Responses Tab**:
   - Check all previous submissions appear
   - Verify data accuracy
5. **Story Tab**:
   - Edit story content
   - Save changes
6. Complete a new user flow
7. Return to admin
8. Verify new response appears
9. Click "Reset All Data"
10. Confirm reset
11. Visit main site
12. Verify everything is fresh

**Expected Results**:
- ✅ Login works with correct password
- ✅ Login fails with wrong password
- ✅ All responses visible
- ✅ Story can be edited
- ✅ Changes persist
- ✅ Reset clears all data
- ✅ Site works fresh after reset

### Scenario 7: Input Validation

**Goal**: Test edge cases and validation

**Steps**:
1. **Empty inputs**:
   - Try submitting empty name → Should show error
   - Try submitting empty sender guess → Should show error
2. **Special characters**:
   - Submit name with emojis: "Sarah 😊"
   - Submit sender with special chars: "Vel@123"
3. **Long inputs**:
   - Submit 500 character name
   - Submit 500 character sender guess
4. **Case sensitivity**:
   - Try "VEL", "vel", "VeLmUrUgAn"
   - All should match

**Expected Results**:
- ✅ Empty inputs show errors
- ✅ Special characters handled gracefully
- ✅ Long inputs accepted (truncated if needed)
- ✅ Name matching is case-insensitive

### Scenario 8: Concurrent Users

**Goal**: Verify multiple users can use site simultaneously

**Steps**:
1. Open 3 incognito windows
2. Start flow in all 3 windows with different data:
   - Window 1: Name "Alice", Guess "Vel", Feelings "Yes"
   - Window 2: Name "Bob", Guess "John", Feelings "Yes"
   - Window 3: Name "Charlie", Guess "Vel", Feelings "No"
3. Verify each window operates independently
4. Check admin dashboard

**Expected Results**:
- ✅ Each window has independent session
- ✅ Only Window 1 sees timer
- ✅ Window 2 and 3 see rejection message
- ✅ Admin shows 3 separate responses

## Database Testing

### Verify Schema
```bash
# Connect to your Postgres database
psql $POSTGRES_URL

# List tables
\dt

# Check sessions table
SELECT * FROM sessions;

# Check responses table
SELECT * FROM responses;

# Check story table
SELECT * FROM story;
```

### Test Timer Calculation
```sql
-- Insert test response with timer started 30 seconds ago
INSERT INTO sessions (session_token) VALUES ('test-token-123');

INSERT INTO responses (
  session_id, 
  is_qualified, 
  timer_started_at,
  locked_to_final
) VALUES (
  (SELECT id FROM sessions WHERE session_token = 'test-token-123'),
  true,
  NOW() - INTERVAL '30 seconds',
  true
);

-- Verify it exists
SELECT 
  timer_started_at,
  EXTRACT(EPOCH FROM (NOW() - timer_started_at)) as elapsed_seconds,
  120 - EXTRACT(EPOCH FROM (NOW() - timer_started_at)) as remaining_seconds
FROM responses
WHERE session_id = (SELECT id FROM sessions WHERE session_token = 'test-token-123');
```

## API Testing

### Using curl

#### Test Session Creation
```bash
curl -X GET http://localhost:3000/api/session \
  -H "Cookie: story_session=test-$(date +%s)"
```

#### Test Name Submission
```bash
curl -X POST http://localhost:3000/api/submit-name \
  -H "Content-Type: application/json" \
  -H "Cookie: story_session=test-123" \
  -d '{"name":"Test User"}'
```

#### Test Sender Submission
```bash
curl -X POST http://localhost:3000/api/submit-sender \
  -H "Content-Type: application/json" \
  -H "Cookie: story_session=test-123" \
  -d '{"senderGuess":"Vel"}'
```

#### Test Feelings Submission
```bash
curl -X POST http://localhost:3000/api/submit-feelings \
  -H "Content-Type: application/json" \
  -H "Cookie: story_session=test-123" \
  -d '{"feelings":true}'
```

#### Test Timer Status
```bash
curl -X GET http://localhost:3000/api/timer \
  -H "Cookie: story_session=test-123"
```

### Using Postman

Import this collection:

```json
{
  "info": {
    "name": "Crush Story API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Session",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/api/session"
      }
    },
    {
      "name": "Submit Name",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/submit-name",
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Test User\"}"
        }
      }
    },
    {
      "name": "Submit Sender",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/submit-sender",
        "body": {
          "mode": "raw",
          "raw": "{\"senderGuess\":\"Vel\"}"
        }
      }
    },
    {
      "name": "Submit Feelings",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/submit-feelings",
        "body": {
          "mode": "raw",
          "raw": "{\"feelings\":true}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

## Browser DevTools Testing

### Check Cookies
1. Open DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Check Cookies for localhost:3000
4. Verify `story_session` cookie exists
5. Note: HttpOnly cookies won't be visible in JavaScript

### Check Network Tab
1. Open Network tab
2. Perform user flow
3. Verify API calls:
   - `/api/session` - Should return 200
   - `/api/submit-name` - Should return 200
   - `/api/submit-sender` - Should return 200
   - `/api/submit-feelings` - Should return 200
   - `/api/timer` - Should return 200 (if qualified)

### Check Console
- Should have no errors
- May have intentional logs (if you added any)

## Performance Testing

### Measure Page Load Times
```javascript
// In browser console
performance.measure('page-load');
performance.getEntriesByType('navigation')[0];
```

### Measure API Response Times
```javascript
// In browser console on /final page
const start = Date.now();
fetch('/api/timer').then(() => {
  console.log('API response time:', Date.now() - start, 'ms');
});
```

### Expected Performance
- Page load: < 2 seconds
- API response: < 200ms (local), < 500ms (production)
- Timer update: Every 1 second exactly

## Accessibility Testing

### Keyboard Navigation
1. Tab through all forms
2. Verify all inputs are focusable
3. Press Enter on buttons
4. Verify focus indicators visible

### Screen Reader Testing
1. Use NVDA (Windows) or VoiceOver (Mac)
2. Navigate through forms
3. Verify all labels are read correctly
4. Verify button purposes are clear

### Color Contrast
Use browser extension or online tool:
- Text should have 4.5:1 contrast ratio minimum
- Our design uses slate-800 on white (good contrast)

## Security Testing

### Session Hijacking Prevention
1. Get session cookie from one browser
2. Try to use it in another browser
3. Should work (as designed for cross-device)
4. No XSS vulnerabilities (Next.js handles this)

### SQL Injection
Try these in form inputs:
```
'; DROP TABLE responses; --
' OR '1'='1
<script>alert('xss')</script>
```

**Expected**: All should be safely stored as text, no execution

### Admin Access
1. Try accessing /admin/dashboard without login
2. Should redirect to /admin
3. Try accessing API routes directly without cookie
4. Should return 401 Unauthorized

## Load Testing (Optional)

Using `wrk` or `artillery`:

```bash
# Install artillery
npm install -g artillery

# Create test script
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - get:
        url: "/"
    - post:
        url: "/api/submit-name"
        json:
          name: "Load Test User"
EOF

# Run test
artillery run load-test.yml
```

**Expected**: 
- All requests succeed
- Response time < 1 second
- No errors

## Troubleshooting Common Issues

### Timer Not Updating
- Check browser console for errors
- Verify `/api/timer` returns correct data
- Check if timer_started_at is set in database
- Verify interval is running (check with debugger)

### Page Locking Not Working
- Check if `locked_to_final` is true in database
- Verify session cookie is being sent
- Check API response from `/api/session`
- Clear cookies and try again

### Admin Can't Login
- Verify ADMIN_PASSWORD environment variable is set
- Check if password matches exactly (case-sensitive)
- Check browser console for network errors
- Verify cookie is being set (check Application tab)

### Database Connection Issues
- Verify POSTGRES_URL is correct
- Check if database is initialized
- Run `npm run db:init` again
- Check Vercel dashboard for database status

## Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Timer works correctly
- [ ] Page locking works
- [ ] Admin dashboard works
- [ ] Story can be updated
- [ ] Reset functionality works
- [ ] No console errors
- [ ] Environment variables set
- [ ] Database initialized
- [ ] README.md updated
- [ ] .env.example updated
- [ ] Git repository clean

---

**Once all tests pass, you're ready to deploy to Vercel!**
