# 🗄️ Database Setup (Neon PostgreSQL)

We need a database accessible by Vercel. We'll use **Neon** (Serverless Postgres).

## Step 1: Create Database
1.  Go to **[https://neon.tech](https://neon.tech)**.
2.  **Sign Up/Login** (e.g., with GitHub).
3.  Click **"Create Project"**.
    *   **Name**: `weekend-space-booker`
    *   **Region**: Choose `Frankfurt (eu-central-1)` (or closest to Prague).
    *   **Postgres Version**: 16 (or default).
4.  **Create Project**.

## Step 2: Get Connection String
1.  Once created, look for the **Connection String** on the Dashboard.
2.  It looks like: `postgresql://neondb_owner:AbC123...@ep-cool-....neon.tech/neondb?sslmode=require`
3.  **Click "Copy to Clipboard"**.

## Step 3: Deployment Variables
Keep this connection string safe. We will paste it into Vercel in the next step.

## ✅ Next Steps
Once you have the connection string, we are ready to deploy to Vercel!
