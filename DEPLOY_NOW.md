# Quick Deployment Steps - WeekPraguer

## ✅ Completed:
- Git installed on your system
- Repository created: https://github.com/racasancm-beep/WeekPraguer
- Prisma schema updated for PostgreSQL
- Deployment configs created (`vercel.json`, `.env.production.example`)

---

## 📤 Step 1: Upload Code to GitHub (Manual - 5 minutes)

### Option A: Using GitHub Desktop (Recommended)
1. Download Git HubDesktop: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Click "Add" → "Add existing repository"
4. Browse to: `C:\Users\racas\.gemini\antigravity\scratch\weekend-space-booker`
5. Publish repository → Select `racasancm-beep/WeekPraguer`
6. Click "Publish branch"

### Option B: Using Command Line (After restarting terminal)
**Close and reopen PowerShell**, then run:
```powershell
cd c:\Users\racas\.gemini\antigravity\scratch\weekend-space-booker
git init
git add .
git commit -m "Initial commit: Weekend Space Booker"
git branch -M main
git remote add origin https://github.com/racasancm-beep/WeekPraguer.git
git push -u origin main
```

---

## 🗄️ Step 2: Set Up Database (Neon PostgreSQL - 5 minutes)

1. Go to: https://console.neon.tech/app/projects
2. Click "Create a project"
   - **Name**: `week-praguer`
   - **Region**: `Europe (Frankfurt)` (closest to Prague)
   - **Postgres Version**: 16
3. Click "Create Project"
4. Copy the **Connection String** (starts with `postgresql://`)
   - Example: `postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`
5. **Save this** - you'll paste it into Vercel in Step 3

---

## 🚀 Step 3: Deploy to Vercel (10 minutes)

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select `racasancm-beep/WeekPraguer`
4. **Framework Preset**: Next.js (auto-detected)
5. **Root Directory**: `./` (leave default)
6. Click "Environment Variables" and add:

```env
DATABASE_URL = [paste your Neon connection string from Step 2]
NEXTAUTH_URL = https://weekpraguer.com
NEXTAUTH_SECRET = 8f7a3b2c9e1d4f6a0b5c8d2e7f1a4c6b9e2d5f8a1c4b7e0d3f6a9c2e5f8b1d4a
NEXT_PUBLIC_APP_URL = https://weekpraguer.com
```

7. Click "Deploy"
8. Wait 2-3 minutes for build completion

---

## 🔧 Step 4: Apply Database Migrations (2 minutes)

After deployment succeeds:

1. In Vercel Dashboard → Your Project → Settings → Functions
2. Copy your deployment URL (e.g., `week-praguer.vercel.app`)
3. Open a NEW PowerShell (to get Git working) and run:

```powershell
cd c:\Users\racas\.gemini\antigravity\scratch\weekend-space-booker

# Update .env with your Neon database URL
# DATABASE_URL="postgresql://..."

npx prisma generate
npx prisma db push
```

This creates all database tables in your Neon PostgreSQL database.

---

## 🌐 Step 5: Connect Domain (weekpraguer.com) (10 minutes)

### In Vercel:
1. Go to: Project Settings → Domains
2. Add domains:
   - `weekpraguer.com`
   - `www.weekpraguer.com`

### In Cloudflare:
1. Go to: https://dash.cloudflare.com/044ea4c41aa701b525d1526ff7e44e0c/weekpraguer.com/dns
2. **Delete existing A/AAAA records** for `@` and `www` (if any)
3. Add new CNAME records:

   **Record 1 (Root domain):**
   - Type: `CNAME`
   - Name: `@`
   - Target: `cname.vercel-dns.com`
   - Proxy status: **DNS only** (gray cloud, NOT proxied)
   - TTL: Auto

   **Record 2 (WWW):**
   - Type: `CNAME`
   - Name: `www`
   - Target: `cname.vercel-dns.com`
   - Proxy status: **DNS only** (gray cloud, NOT proxied)
   - TTL: Auto

4. Save changes
5. Wait 5-30 minutes for DNS propagation
6. Verify at: https://weekpraguer.com

---

## ✅ Final Verification

Test these URLs:
- https://weekpraguer.com → Should load the homepage
- https://www.weekpraguer.com → Should redirect to non-www
- https://weekpraguer.com/explore → Should show space listings (empty initially)
- https://weekpraguer.com/register → Should allow user registration

---

## 📞 Need Help?

If stuck at any step, let me know which step number and I'll help debug!

**Estimated Total Time**: 30-40 minutes
