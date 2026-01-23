# 🚀 Deploy to Vercel

## Prerequisites
- [x] GitHub Repository created.
- [x] Database created (Neon).
- [ ] **Important**: Have your Neon **Connection String** ready.

## Step 1: Import to Vercel
1.  Go to **[https://vercel.com/new](https://vercel.com/new)**.
2.  Click **"Import"** next to `weekend-space-booker`.
    *(If you don't see it, check permissions or click "Add GitHub Account").*

## Step 2: Configure Project
*   **Framework**: Next.js (should be auto-detected).
*   **Root Directory**: `./` (default).

## Step 3: Environment Variables (CRITICAL)
Expand the **"Environment Variables"** section and add these:

| Name | Value | Instructions |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Paste your **Neon Connection String** here. |
| `NEXTAUTH_URL` | `https://weekpraguer.com` | The final domain. |
| `NEXT_PUBLIC_APP_URL` | `https://weekpraguer.com` | Same as above. |
| `NEXTAUTH_SECRET` | *(Random String)* | Generate one or type random characters (e.g. `mysecret123`). |

## Step 4: Deploy
1.  Click **"Deploy"**.
2.  Wait for the build to finish (approx 2 minutes).
3.  **If it fails**, check the logs. Usually it's a database connection issue.

## Step 5: Connect Domain
1.  Once deployed, go to the **Dashboard** for the project.
2.  Click **Settings** > **Domains**.
3.  Add `weekpraguer.com`.
4.  Vercel will give you DNS records (CNAME/A records).
5.  Go to **Cloudflare** and update your DNS to match Vercel's instructions.

## ✅ Done?
When the site is live at `weekpraguer.com`, let me know!
