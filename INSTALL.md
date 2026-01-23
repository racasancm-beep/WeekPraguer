# Weekend Space Booker - Installation Guide

Follow these steps to get the Weekend Space Booker platform running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## Step-by-Step Installation

### 1. Navigate to Project Directory

```bash
cd C:\Users\racas\.gemini\antigravity\scratch\weekend-space-booker
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Prisma (database ORM)
- NextAuth.js (authentication)
- Stripe SDK (payments)
- Tailwind CSS (styling)
- And many more...

**Expected time:** 2-5 minutes depending on internet speed

### 3. Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Create a new database
createdb weekend_space_booker

# Note the connection string format:
# postgresql://username:password@localhost:5432/weekend_space_booker
```

#### Option B: Cloud Database (Recommended for Easy Setup)

**Using Supabase (Free tier available):**
1. Go to [https://supabase.com/](https://supabase.com/)
2. Create a new project
3. Wait for database to provision
4. Copy the connection string from Settings → Database

**Using Neon (Free tier available):**
1. Go to [https://neon.tech/](https://neon.tech/)
2. Create a new project
3. Copy the connection string

### 4. Configure Environment Variables

```bash
# Copy the example file
copy .env.example .env
```

Now open `.env` and fill in the required values:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://your-connection-string-here"

# NextAuth (REQUIRED - for authentication)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"
# Generate secret: Run in terminal: openssl rand -base64 32

# OAuth Providers (Optional for basic demo, required for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (Required for payment processing)
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Google Maps (Required for location features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Optional for full functionality
EMAIL_SERVER="smtp://user:password@smtp.example.com:587"
EMAIL_FROM="noreply@weekendspacebooker.com"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

**Minimum Required for Demo:**
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### 5. Initialize Database Schema

```bash
# Push Prisma schema to database
npx prisma db push

# Optionally open Prisma Studio to view database
npx prisma studio
```

This creates all the necessary tables (users, spaces, bookings, etc.) in your database.

### 6. Run Development Server

```bash
npm run dev
```

You should see output like:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
- Environments: .env

✓ Starting...
✓ Ready in 3.2s
```

### 7. Open in Browser

Visit [http://localhost:3000](http://localhost:3000)

You should see the beautiful landing page! 🎉

## Quick Setup for Demo (Minimal Configuration)

If you just want to see the UI without setting up all integrations:

### 1. Install Node.js

Download from [https://nodejs.org/](https://nodejs.org/) and install.

### 2. Navigate and Install

```bash
cd C:\Users\racas\.gemini\antigravity\scratch\weekend-space-booker
npm install
```

### 3. Use SQLite (No PostgreSQL needed)

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 4. Minimal .env

Create `.env`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="any-random-string-for-development-only"
```

### 5. Init DB and Run

```bash
npx prisma db push
npm run dev
```

## Troubleshooting

### Issue: "npm not recognized"
**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### Issue: "Database connection error"
**Solution:** 
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Test connection string in database client

### Issue: "Port 3000 already in use"
**Solution:** 
- Stop other processes using port 3000
- Or change port: `npm run dev -- -p 3001`

### Issue: "Module not found" errors
**Solution:**
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Run `npm run dev`

### Issue: Prisma errors
**Solution:**
```bash
npx prisma generate
npx prisma db push
```

## Next Steps After Installation

1. **Explore the Landing Page**: Check out the design and navigation
2. **Try Registration**: Create an account to see the auth flow
3. **Check Documentation**: Read `README.md` for full feature list
4. **Review Code Structure**: Explore the `app/` and `components/` directories

## Getting API Keys (Optional)

For full functionality, you'll need:

### Stripe (Payment Processing)
1. Visit [https://stripe.com/](https://stripe.com/)
2. Create account
3. Get test API keys from Dashboard → Developers → API keys

### Google Maps API
1. Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Create project
3. Enable Maps JavaScript API
4. Create API key

### Google OAuth (Social Login)
1. Same Google Cloud Console
2. APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`

See `docs/API_INTEGRATIONS.md` for detailed guides.

## Development Workflow

```bash
# Start dev server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# View database
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate
```

## Additional Resources

- **Documentation**: See `README.md` and `docs/` folder
- **Compliance**: Review `docs/COMPLIANCE.md` before production
- **API Setup**: Follow `docs/API_INTEGRATIONS.md` for third-party services

## Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Review error messages carefully
3. Ensure all prerequisites are installed
4. Verify environment variables are correct

---

**Congratulations!** You now have Weekend Space Booker running locally. 🚀

Time to start building out the remaining features!
