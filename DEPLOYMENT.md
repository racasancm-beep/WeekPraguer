# Deployment Guide - Weekend Space Booker to Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Cloudflare account (for DNS management of weekpraguer.com)

---

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web Interface (Recommended)
1. Go to https://github.com/new
2. Repository name: `weekend-space-booker`
3. Set to **Private** (recommended for production apps)
4. **Do NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### Option B: Using GitHub Desktop
1. Download and install GitHub Desktop
2. Open the project folder in GitHub Desktop
3. Create new repository and publish to GitHub

---

## Step 2: Upload Code to GitHub

### Manual Upload (If Git not installed):
1. On your new GitHub repository page, click "uploading an existing file"
2. **Important**: Zip the project folder EXCLUDING:
   - `node_modules`
   - `.next`
   - `prisma/dev.db`
   - `.env`
3. Upload the zip file and commit

### Using Git (If available):
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/weekend-space-booker.git
git push -u origin main
```

---

## Step 3: Set Up Database (Neon PostgreSQL)

1. Go to https://neon.tech
2. Sign in with GitHub
3. Click "Create Project"
   - Name: `weekend-space-booker`
   - Region: Choose closest to your users (Europe recommended)
   - PostgreSQL version: 16 (latest)
4. Copy the **Connection String** (starts with `postgresql://`)
5. Save it - you'll need this for Vercel

---

## Step 4: Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `weekend-space-booker` repository
4. Configure Project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: Leave default
   - **Output Directory**: Leave default

5. **Environment Variables** - Add these:
   ```
   DATABASE_URL = [paste your Neon connection string]
   NEXTAUTH_URL = https://weekpraguer.com
   NEXTAUTH_SECRET = [generate with: openssl rand -base64 32]
   NEXT_PUBLIC_APP_URL = https://weekpraguer.com
   ```

6. Click "Deploy"
7. Wait 2-3 minutes for build to complete

---

## Step 5: Run Database Migrations

After first deployment:

1. In Vercel Dashboard → Your Project → Settings → General
2. Copy the deployment URL (e.g., `your-project.vercel.app`)
3. Open Vercel CLI or use their web interface:
   - Go to Storage → Connect Store → Select your Neon database
4. Run migrations:
   - Option A: Via Vercel CLI: `vercel env pull && npx prisma migrate deploy`
   - Option B: Manually via Neon SQL Editor - paste the migration SQL

**Migration SQL** (if needed manually):
You can generate it locally with:
```bash
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
```

---

## Step 6: Connect Custom Domain (weekpraguer.com)

### In Vercel:
1. Go to your project → Settings → Domains
2. Click "Add Domain"
3. Enter: `weekpraguer.com`
4. Also add: `www.weekpraguer.com`
5. Vercel will show DNS records to configure

### In Cloudflare (DNS):
1. Go to https://dash.cloudflare.com/044ea4c41aa701b525d1526ff7e44e0c/weekpraguer.com/dns
2. Add these records:

   **For Root Domain:**
   - Type: `CNAME`
   - Name: `@`
   - Target: `cname.vercel-dns.com`
   - Proxy: Off (DNS only - orange cloud OFF)

   **For WWW:**
   - Type: `CNAME`
   - Name: `www`
   - Target: `cname.vercel-dns.com`
   - Proxy: Off

3. Save changes
4. Wait 5-30 minutes for DNS propagation

### Verify:
- Check https://weekpraguer.com
- Check https://www.weekpraguer.com
- Both should show your app with SSL

---

## Step 7: Update Environment Variables for Production

1. In Vercel → Your Project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to `https://weekpraguer.com` (if not done already)
3. Redeploy: Deployments → (latest) → ⋯ → Redeploy

---

## Step 8: Test Production Deployment

1. Visit https://weekpraguer.com
2. Test registration flow
3. Test space listing
4. Test booking flow
5. Verify database persistence

---

## Troubleshooting

### Build Failures:
- Check Vercel deployment logs
- Ensure all environment variables are set
- Verify `DATABASE_URL` is correct

### Database Connection Issues:
- Confirm Neon database is not paused (auto-pauses after inactivity)
- Check connection string includes `?sslmode=require`
- Verify Prisma migrations were applied

### Domain Not Working:
- DNS can take up to 48 hours (usually 5-30 min)
- Check DNS propagation: https://dnschecker.org/#CNAME/weekpraguer.com
- Ensure Cloudflare proxy is OFF (orange cloud disabled)

---

## Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Domain connected and SSL active
- [ ] Environment variables set correctly
- [ ] Test user registration
- [ ] Test space listing
- [ ] Test booking creation
- [ ] Monitor Vercel analytics
- [ ] Set up monitoring (optional: Sentry, LogRocket)

---

## Continuous Deployment

Every push to `main` branch on GitHub will automatically trigger a new deployment on Vercel.

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Next.js Docs: https://nextjs.org/docs
