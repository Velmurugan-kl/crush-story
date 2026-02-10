# Setup with Neon Database

## Quick Setup (5 minutes)

### 1. Install Neon from Vercel Marketplace

1. Go to your Vercel project
2. Click **Storage** tab
3. Click **Connect Store**
4. Select **Neon** (Serverless Postgres)
5. Click **Connect**
6. Follow the integration steps
7. Copy the `DATABASE_URL` connection string

### 2. Configure Environment Variables

Create a `.env.local` file:

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
ADMIN_PASSWORD="your-secure-password"
```

Or add them in Vercel Dashboard:
- Go to Project Settings → Environment Variables
- Add `DATABASE_URL` (from Neon)
- Add `ADMIN_PASSWORD` (choose a strong password)

### 3. Install Dependencies

```bash
npm install
```

### 4. Initialize Database

```bash
npm run db:init
```

This creates the necessary tables:
- `sessions` - User session tracking
- `responses` - Form submissions and state
- `story` - Your story content

### 5. Start Development

```bash
npm run dev
```

Visit http://localhost:3000

## Neon Free Tier Limits

✅ **3 GB storage** - Way more than needed  
✅ **Always-available compute** - No sleep/wake delays  
✅ **Unlimited projects** - Create as many as you want  
✅ **Point-in-time restore** - 7 days of history  
✅ **Connection pooling** - Built-in  

Perfect for this project!

## Connection String Format

Neon provides the connection string in this format:

```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
```

Just copy and paste it directly into `DATABASE_URL`.

## Troubleshooting

### "Connection refused"
- Check if `DATABASE_URL` is set correctly
- Verify the connection string includes `?sslmode=require`
- Make sure you're using the connection string from Neon (not localhost)

### "Database does not exist"
- Run `npm run db:init` to create tables
- Check that database name in connection string matches

### "Too many connections"
- Neon includes automatic connection pooling
- This shouldn't happen with normal usage
- Free tier supports plenty of connections

## Production Deployment

When deploying to Vercel:

1. Environment variables are automatically set by Neon integration
2. No additional configuration needed
3. Database connection is optimized for Vercel's edge network

## Why Neon?

✅ **Serverless** - Auto-scales with your traffic  
✅ **Fast** - Low latency from Vercel functions  
✅ **Simple** - Zero configuration needed  
✅ **Free** - Generous free tier  
✅ **Reliable** - PostgreSQL under the hood  

## Alternative: If You Want Vercel Postgres Instead

If you prefer Vercel's native Postgres, you can switch back:

1. Change dependency in `package.json`:
   ```json
   "@vercel/postgres": "^0.5.1"
   ```

2. Update imports in `lib/db.ts`:
   ```typescript
   import { sql } from '@vercel/postgres';
   ```

3. Use `POSTGRES_URL` environment variable instead of `DATABASE_URL`

But Neon is recommended since it's available in your marketplace!

---

**You're all set!** The code is now optimized for Neon Database. 🚀
