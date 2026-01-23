# API Integration Guides

## Stripe Payment Integration

### Setup

1. **Create Stripe Account**
   - Visit https://stripe.com/
   - Register business account
   - Complete business verification
   - Enable CZK and EUR currencies

2. **Get API Keys**
   - Dashboard → Developers → API keys
   - Copy Publishable key and Secret key
   - Create webhook endpoint secret

3. **Configure Environment Variables**
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. **Set Up Webhooks**
   - Webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`

### Implementation

```typescript
// lib/payments/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Create payment intent
async function createPaymentIntent(amount: number, currency: string = 'CZK') {
  return await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to smallest currency unit
    currency: currency.toLowerCase(),
    automatic_payment_methods: { enabled: true },
  });
}
```

### Testing
- Use test cards: https://stripe.com/docs/testing
- Test card: `4242 4242 4242 4242`
- 3D Secure test: `4000 0027 6000 3184`

---

## Google Maps API

### Setup

1. **Enable APIs**
   - Go to Google Cloud Console
   - Create new project
   - Enable APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API

2. **Create API Key**
   - APIs & Services → Credentials
   - Create API key
   - Restrict key to your domain

3. **Configure Environment**
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

### Implementation

```typescript
// components/maps/MapPicker.tsx
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export function MapPicker({ onLocationSelect }: Props) {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        center={{ lat: 50.0755, lng: 14.4378 }} // Prague center
        zoom={12}
      >
        <Marker position={location} />
      </GoogleMap>
    </LoadScript>
  );
}
```

### Autocomplete for Address

```typescript
const autocomplete = new google.maps.places.Autocomplete(inputElement, {
  componentRestrictions: { country: 'cz' },
  fields: ['address_components', 'geometry', 'name'],
});
```

---

## Salto KS Access Management API

### Overview
Salto KS (Key as a Service) provides cloud-based access control for smart locks.

### Setup

1. **Contact Salto**
   - Request API access: https://saltosystems.com/
   - May require business partnership
   - Receive API credentials

2. **Environment Configuration**
```env
SALTO_API_KEY=your_api_key
SALTO_API_URL=https://api.saltoks.com
SALTO_CLIENT_ID=your_client_id
SALTO_CLIENT_SECRET=your_client_secret
```

### Implementation

```typescript
// lib/access/salto.ts
interface AccessCodeResponse {
  code: string;
  validFrom: string;
  validUntil: string;
  lockIds: string[];
}

async function generateAccessCode(
  lockId: string,
  validFrom: Date,
  validUntil: Date,
  userId: string
): Promise<AccessCodeResponse> {
  const response = await fetch(`${process.env.SALTO_API_URL}/access-codes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SALTO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lockId,
      validFrom: validFrom.toISOString(),
      validUntil: validUntil.toISOString(),
      userId,
      accessLevel: 'temporary',
    }),
  });

  return await response.json();
}
```

### Mock Implementation (for development)

```typescript
// lib/access/saltoMock.ts
export function generateMockAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
```

---

## SMS Notifications (Twilio)

### Setup

1. **Create Twilio Account**
   - Visit https://www.twilio.com/
   - Get phone number
   - Note Account SID and Auth Token

2. **Environment Configuration**
```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+420...
```

### Implementation

```typescript
// lib/notifications/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(to: string, message: string) {
  return await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to,
  });
}

// Send access code
async function sendAccessCode(phoneNumber: string, code: string) {
  const message = `Your Weekend Space Booker access code is: ${code}. Valid for your booking period only.`;
  return await sendSMS(phoneNumber, message);
}
```

---

## Email Service (Resend or SendGrid)

### Option 1: Resend (Recommended for Next.js)

```bash
npm install resend
```

```typescript
// lib/notifications/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to: string, subject: string, html: string) {
  return await resend.emails.send({
    from: 'Weekend Space Booker <noreply@weekendspacebooker.com>',
    to,
    subject,
    html,
  });
}
```

### Option 2: SendGrid

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmail(to: string, subject: string, html: string) {
  return await sgMail.send({
    to,
    from: 'noreply@weekendspacebooker.com',
    subject,
    html,
  });
}
```

---

## OAuth Providers

### Google OAuth

1. **Google Cloud Console**
   - APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Environment**
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

3. **NextAuth Configuration**
```typescript
// app/api/auth/[...nextauth]/route.ts
import GoogleProvider from 'next-auth/providers/google';

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
]
```

### Apple OAuth

1. **Apple Developer Account**
   - Create Service ID
   - Configure Sign in with Apple
   - Download private key

2. **Configuration**
```env
APPLE_ID=com.weekendspacebooker
APPLE_TEAM_ID=...
APPLE_PRIVATE_KEY=...
APPLE_KEY_ID=...
```

---

## Database (PostgreSQL)

### Local Development

```bash
# Install PostgreSQL
# Windows: Download from https://www.postgresql.org/download/windows/

# Create database
createdb weekend_space_booker

# Environment
DATABASE_URL="postgresql://user:password@localhost:5432/weekend_space_booker"
```

### Production (Recommended: Supabase or Neon)

**Supabase**:
- Visit https://supabase.com/
- Create project
- Copy connection string

**Neon**:
- Visit https://neon.tech/
- Create project
- Copy connection string

---

## File Storage (for Photos)

### Option 1: Vercel Blob Storage

```bash
npm install @vercel/blob
```

```typescript
import { put } from '@vercel/blob';

async function uploadPhoto(file: File) {
  const blob = await put(file.name, file, {
    access: 'public',
  });
  return blob.url;
}
```

### Option 2: AWS S3

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'eu-central-1' });

async function uploadToS3(file: File) {
  const command = new PutObjectCommand({
    Bucket: 'weekend-space-booker',
    Key: file.name,
    Body: file,
  });
  await s3.send(command);
}
```

---

## Testing Tools

### Stripe CLI
```bash
# Install Stripe CLI
# Listen for webhooks locally
stripe listen --forward-to localhost:3000/api/payments/webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

### Postman Collection
- Import API endpoints
- Test authentication flow
- Verify payment processing

---

## Monitoring & Logging

### Sentry (Error Tracking)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Rate Limiting

### Upstash Redis

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

---

## Summary

Before production:
1. ✅ Obtain all API keys
2. ✅ Test in sandbox/development mode
3. ✅ Set up webhooks
4. ✅ Configure monitoring
5. ✅ Test error scenarios
6. ✅ Review security settings
7. ✅ Document API usage limits
8. ✅ Set up backup procedures
