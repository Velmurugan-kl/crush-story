# Deployment Guide - Vercel Free Plan

## Prerequisites
1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Basic knowledge of Git

## Step-by-Step Deployment

### 1. Prepare Your Project

```bash
# Navigate to project directory
cd crush-story

# Initialize git repository (if not already done)
git init

# Create initial commit
git add .
git commit -m "Initial commit"
```

### 2. Push to GitHub

```bash
# Create a new repository on GitHub (don't initialize with README)
# Then link your local repo to GitHub:

git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 3. Set Up Vercel Postgres Database

1. Go to https://vercel.com/dashboard
2. Click on "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose a name (e.g., "crush-story-db")
6. Select region closest to your users
7. Click "Create"
8. Once created, go to the ".env.local" tab
9. Copy the `POSTGRES_URL` value

### 4. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
5. Add Environment Variables:
   ```
   POSTGRES_URL = [paste your postgres connection string]
   ADMIN_PASSWORD = [choose a strong password]
   ```
6. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? crush-story (or your choice)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add POSTGRES_URL
# Paste your Postgres URL when prompted
# Select: Production, Preview, Development

vercel env add ADMIN_PASSWORD
# Enter your admin password
# Select: Production, Preview, Development

# Deploy to production
vercel --prod
```

### 5. Initialize Database

After deployment, you need to set up the database schema:

```bash
# Set environment variables locally for one-time setup
export POSTGRES_URL="your-postgres-url"

# Run database initialization
npm run db:init
```

Alternatively, you can run this via Vercel CLI:

```bash
# Connect to production environment
vercel env pull .env.local

# Run init script
npm run db:init
```

### 6. Verify Deployment

1. Visit your deployed URL (e.g., https://your-project.vercel.app)
2. Test the questionnaire flow
3. Access admin panel at https://your-project.vercel.app/admin
4. Login with your ADMIN_PASSWORD
5. Verify you can see the dashboard

### 7. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Free Plan Limitations

Vercel Free Plan includes:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions (100GB-hours)
- ✅ 1 concurrent build
- ✅ Custom domains

Vercel Postgres Free Plan includes:
- ✅ 256 MB storage
- ✅ 60 hours compute time/month
- ✅ Unlimited queries within limits

**This is MORE than enough for a personal project with occasional traffic.**

## Monitoring & Maintenance

### Check Database Usage
1. Go to Vercel Dashboard → Storage → Your Database
2. Monitor usage stats
3. Free tier is plenty for this use case

### View Logs
```bash
# Via CLI
vercel logs

# Or in dashboard: Project → Deployments → Click deployment → Runtime Logs
```

### Update Environment Variables
```bash
# Via CLI
vercel env rm ADMIN_PASSWORD production
vercel env add ADMIN_PASSWORD production

# Or in dashboard: Project → Settings → Environment Variables
```

## Troubleshooting

### Database Connection Issues
```bash
# Verify connection string format
postgres://username:password@host:port/database?sslmode=require

# Test connection locally
npm run db:init
```

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### Runtime Errors
- Check Runtime Logs in Vercel dashboard
- Verify environment variables are set
- Check database is initialized

## Security Best Practices

1. **Strong Admin Password**: Use a password manager to generate secure passwords
2. **HTTPS Only**: Vercel provides free SSL/TLS certificates
3. **No Analytics**: This project deliberately excludes tracking
4. **Regular Updates**: Keep dependencies updated

## Backup Strategy

### Export Responses (Manual)
1. Login to admin dashboard
2. Copy response data manually
3. Or use pgAdmin to connect to Vercel Postgres

### Database Backup
Vercel Postgres free tier doesn't include automated backups, but you can:
1. Connect via psql or pgAdmin
2. Run `pg_dump` to create backups
3. Store backups securely

## Cost Optimization

To stay within free tier:
- Monitor bandwidth usage in Vercel dashboard
- Check database compute hours
- This project is designed to be extremely lightweight

## Next Steps After Deployment

1. ✅ Test full user flow
2. ✅ Upload your story in admin dashboard
3. ✅ Test timer functionality
4. ✅ Verify page locking works across devices
5. ✅ Share the link anonymously

## Support

If issues persist:
- Check Vercel status: https://vercel.com/status
- Review Vercel docs: https://vercel.com/docs
- Check Next.js docs: https://nextjs.org/docs

---

**Your anonymous story website is now live! 🎉**
