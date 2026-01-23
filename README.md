# Weekend Space Booker

A specialized marketplace platform connecting building owners with renters for weekend-only office space bookings in Prague, Czechia.

## 🎯 Overview

Weekend Space Booker is designed for:
- **Building Owners/Managers**: Monetize empty weekend office spaces
- **Operators/Renters**: Find perfect spaces for therapy sessions, workshops, IT activities, and events
- **Cleaning Companies**: Streamlined cleaning operations with automated scheduling
- **Administrators**: Platform oversight and management

### Weekend-Only Booking
All bookings are restricted to **Friday 18:00 – Sunday 20:00** to avoid conflicts with regular weekday tenants.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Stripe account (for payments)
- Google Maps API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - Database connection string
# - NextAuth secret and OAuth providers
# - Stripe API keys
# - Google Maps API key

# Set up database
npx prisma db push

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📦 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Email/Password + Google/Apple OAuth)
- **Payments**: Stripe (SEPA-compliant)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand + React Query
- **Notifications**: Sonner (Toast)

## 🏗️ Project Structure

```
weekend-space-booker/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (owner)/           # Owner dashboard & features
│   ├── (operator)/        # Operator/renter features
│   ├── (cleaner)/         # Cleaning company features
│   ├── (admin)/           # Admin dashboard
│   ├── api/               # API routes
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── owner/             # Owner-specific components
│   ├── operator/          # Operator-specific components
│   └── cleaner/           # Cleaner-specific components
├── lib/                   # Utility functions
│   ├── booking/           # Booking & weekend validation
│   ├── payments/          # Payment processing
│   ├── auth/              # Authentication utilities
│   └── notifications/     # Notification system
├── prisma/                # Database schema
└── public/                # Static assets
```

## 🔑 Key Features

### For Building Owners
- Free space listings with photo uploads (10-20 photos)
- Weekend-only calendar management
- Automatic payout every Monday morning
- Booking management dashboard
- Revenue analytics

### For Operators/Renters
- Advanced search and filtering
- Map-based space discovery
- Hourly or full-weekend booking options
- Secure payment processing
- Temporary access codes
- Review and rating system

### For Cleaning Companies
- Automated booking notifications
- Check-in/check-out with photo verification
- Time tracking
- Compensation calculation

### Platform Features
- Weekend-only booking restriction (Fri 18:00 - Sun 20:00)
- 14% platform commission from renters
- Mandatory cleaning fee (10%) and insurance (50%)
- GDPR-compliant data handling
- SEPA Direct Debit support
- Multi-language support (Czech/English)

## 💰 Pricing Model

| Component | Rate | Applied To |
|-----------|------|------------|
| Base Price | Variable | Set by owner |
| Platform Commission | 14% | Renter (from base price) |
| Cleaning Fee | 10% | Renter (added to total) |
| Insurance | 50% | Renter (added to total) |

**Example Booking:**
- Base Price: 5,000 CZK
- Cleaning Fee: 500 CZK (10%)
- Insurance: 2,500 CZK (50%)
- **Total Paid by Renter**: 8,000 CZK

**Owner Receives:**
- Base Price: 5,000 CZK
- Less Commission: -700 CZK (14%)
- Plus Cleaning Revenue Share: +175 CZK (35% of cleaning fee)
- **Total Payout**: 4,475 CZK

## 🔐 Security & Compliance

### GDPR Compliance
- User consent management
- Data export functionality
- Right to be forgotten
- Privacy policy and terms of service

### Payment Security
- PSD2/SCA authentication
- SEPA Direct Debit compliance
- Secure deposit handling (credit vs debit cards)
- Encrypted payment data

### Access Management
- Salto KS API integration for temporary access codes
- Time-based code expiration
- Booking verification

## 📚 API Documentation

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session

#### Listings
- `GET /api/listings` - Browse spaces
- `POST /api/listings` - Create listing (owners)
- `GET /api/listings/[id]` - Get listing details
- `PATCH /api/listings/[id]` - Update listing

#### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `PATCH /api/bookings/[id]` - Update booking status

#### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint
```

## 🚀 Deployment

### Environment Setup
1. Configure all environment variables in production
2. Set up PostgreSQL database
3. Configure Stripe webhooks
4. Set up OAuth redirect URLs

### Deploy to Vercel
```bash
npm run build
vercel --prod
```

### Post-Deployment
- Configure custom domain
- Set up SSL certificate
- Enable monitoring (Sentry/LogRocket)
- Configure backup strategy

## 📋 Roadmap

- [ ] Mobile app (React Native/Flutter)
- [ ] Real-time chat between owners and operators
- [ ] Multi-city expansion beyond Prague
- [ ] Advanced analytics dashboard
- [ ] Integration with accounting software
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Automated pricing recommendations

## 🤝 Contributing

This is a proprietary platform. For inquiries about contributing or partnerships, please contact the development team.

## 📄 License

Copyright © 2026 Weekend Space Booker. All rights reserved.

## 📞 Support

For technical support or business inquiries:
- Email: support@weekendspacebooker.com
- Documentation: [Link to docs]
- Status Page: [Link to status]

## 🙏 Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Icons from Lucide React
- Payments powered by Stripe
- Maps by Google Maps Platform

---

**Note**: This is a demonstration project. Before production deployment:
1. Obtain all required API keys
2. Complete legal review
3. Conduct security audit
4. Implement comprehensive testing
5. Set up monitoring and logging
6. Prepare customer support infrastructure
