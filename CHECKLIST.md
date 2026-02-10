# Deployment Checklist

## Pre-Deployment

### Local Setup
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Git installed and configured
- [ ] Code editor ready

### Project Setup
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created with correct values
- [ ] Database initialized (`npm run db:init`)
- [ ] Development server runs (`npm run dev`)
- [ ] No TypeScript errors
- [ ] No ESLint warnings

### Testing
- [ ] Happy path works (vel + yes = timer)
- [ ] Rejection works (no vel or no = rejection)
- [ ] Timer counts down correctly
- [ ] Timer persists on refresh
- [ ] Page locking works
- [ ] Story appears after timer
- [ ] Admin login works
- [ ] Story can be edited
- [ ] Responses appear in admin
- [ ] Reset functionality works

### Code Review
- [ ] Name matching logic is correct
- [ ] Timer duration is set (default: 120 seconds)
- [ ] Admin password is strong
- [ ] No console.log statements in production code
- [ ] No commented-out code
- [ ] All files properly formatted

## Vercel Setup

### Account & Database
- [ ] Vercel account created
- [ ] Vercel Postgres database created
- [ ] Database connection string copied
- [ ] Database region selected (closest to users)

### GitHub Repository
- [ ] GitHub repository created
- [ ] Code pushed to main branch
- [ ] Repository is private (recommended for privacy)
- [ ] `.gitignore` excludes sensitive files
- [ ] README.md is clear

### Vercel Project
- [ ] Project imported from GitHub
- [ ] Framework preset: Next.js
- [ ] Root directory: ./
- [ ] Build command: default
- [ ] Output directory: default

### Environment Variables
- [ ] `POSTGRES_URL` added to Vercel
- [ ] `ADMIN_PASSWORD` added to Vercel
- [ ] Variables set for Production
- [ ] Variables set for Preview (optional)
- [ ] Variables set for Development (optional)

### Database Initialization
- [ ] Connected to production database
- [ ] Ran `npm run db:init` with production POSTGRES_URL
- [ ] Verified tables created (sessions, responses, story)
- [ ] Verified indexes created
- [ ] Default story inserted

## Post-Deployment

### Functional Testing
- [ ] Production URL accessible
- [ ] Homepage loads correctly
- [ ] Forms submit successfully
- [ ] Timer works on production
- [ ] Story reveals correctly
- [ ] Admin panel accessible
- [ ] Admin authentication works
- [ ] Can view responses in admin
- [ ] Can edit story in admin
- [ ] Reset functionality works

### Cross-Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### Device Testing
- [ ] Desktop (Windows/Mac/Linux)
- [ ] Tablet (iPad/Android)
- [ ] Mobile (iOS/Android)
- [ ] Different screen sizes

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Timer updates smoothly
- [ ] No console errors
- [ ] Lighthouse score > 90

### Security
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Cookies are HttpOnly
- [ ] Cookies are Secure in production
- [ ] Admin password is strong
- [ ] No sensitive data in client-side code
- [ ] Environment variables are private

### SEO & Privacy
- [ ] robots.txt set to noindex (in metadata)
- [ ] No analytics scripts
- [ ] No tracking pixels
- [ ] No third-party services
- [ ] Privacy-first design confirmed

## Content Preparation

### Story Writing
- [ ] Story content written
- [ ] Story is appropriate and respectful
- [ ] Story length is reasonable
- [ ] Story formatting is clean
- [ ] Story uploaded via admin panel

### User Communication
- [ ] Gift card message prepared
- [ ] URL to share is clean
- [ ] Instructions (if any) are clear
- [ ] Timing is appropriate

## Monitoring Setup

### Vercel Dashboard
- [ ] Deployment notifications enabled
- [ ] Error tracking reviewed
- [ ] Function logs accessible
- [ ] Database metrics visible

### Database Monitoring
- [ ] Storage usage checked
- [ ] Compute hours tracked
- [ ] Connection pool monitored
- [ ] Backup strategy planned (manual export)

## Go-Live Checklist

### Final Verification
- [ ] All previous items checked
- [ ] Story content is final
- [ ] Admin password is secure and saved
- [ ] Database is properly configured
- [ ] Production URL tested end-to-end
- [ ] Mobile experience verified

### Launch
- [ ] URL shared (anonymously via gift card)
- [ ] Monitoring active
- [ ] Ready to check admin for responses
- [ ] Backup plan in place (if needed)

## Post-Launch

### First 24 Hours
- [ ] Check for responses in admin
- [ ] Monitor error logs
- [ ] Verify timer functionality
- [ ] Check database usage
- [ ] Respond to any issues

### First Week
- [ ] Review all responses
- [ ] Monitor database growth
- [ ] Check Vercel usage stats
- [ ] Ensure staying within free tier
- [ ] Plan next steps based on response

## Troubleshooting Guide

If something goes wrong:

1. **Check Vercel Logs**
   - Go to Project → Deployments → Latest → Runtime Logs
   
2. **Check Database**
   - Verify connection in Vercel dashboard
   - Run test query in SQL editor
   
3. **Environment Variables**
   - Ensure all variables are set
   - Re-deploy if variables were added after deployment
   
4. **Clear Cache**
   - Clear browser cache
   - Clear Vercel cache (re-deploy)
   
5. **Contact Support**
   - Vercel support: https://vercel.com/support
   - Check Vercel status page

## Rollback Plan

If deployment fails:

1. Revert to previous deployment in Vercel
2. Check what changed
3. Fix issues locally
4. Test thoroughly
5. Re-deploy

## Success Criteria

Deployment is successful when:

✅ User can complete happy path  
✅ Timer works correctly  
✅ Story reveals after timer  
✅ Page locking prevents escape  
✅ Admin can view responses  
✅ No console errors  
✅ Performance is good  
✅ Mobile works well  

---

## Ready to Deploy?

If all items are checked, you're ready to share your link!

**Remember:**
- Test thoroughly before sharing
- Monitor the first submission
- Be prepared to respond if needed
- Have fun! 🎉

---

**Deployment Date**: __________  
**Production URL**: __________  
**Admin Password**: __________ (keep this secure!)  
**Database**: __________  
