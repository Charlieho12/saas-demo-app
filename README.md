# Auth SaaS Demo

A complete SaaS demonstration application featuring authentication, Stripe subscriptions, and a YouTube video library. Built with Next.js 15, TypeScript, Tailwind CSS, Prisma, and SQLite.

## 🚀 Quick Start (5-minute setup)

### Prerequisites

- Node.js 18+ installed
- Stripe account (free, test mode only)
- Git

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd auth-saas-demo
npm install
```

### 2. Environment Setup

Create `.env.local` with your configuration:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-nextauth-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Test Mode) - Get from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PRICE_ID="price_your_price_id"

# Admin User (for seeding)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

**⚠️ Important**: 
- **Without Stripe keys**: App runs in development mode with simulated subscriptions
- **With Stripe keys**: Full Stripe integration with real test payments
- **For webhooks**: Use Stripe CLI (see Webhook Setup section below)

### 3. Database Setup

```bash
npx prisma db push
npx prisma generate
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 🎉

## 🔗 Webhook Setup (For Full Stripe Integration)

### Option 1: Stripe CLI (Recommended for Development)

```bash
# Install Stripe CLI
# Windows: choco install stripe-cli
# Mac: brew install stripe/stripe-cli/stripe
# Or download: https://github.com/stripe/stripe-cli/releases

# Login and forward webhooks
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret (starts with whsec_) to your .env.local
```

### Option 2: Development Mode (No Webhooks)

If you don't set up webhooks, the app runs in **development mode**:
- ✅ Simulated subscriptions (no real payments)
- ✅ All features work for testing
- ✅ Shows development mode banner
- ⚠️ No real Stripe integration

## 🧪 Test with Stripe

Use these test credentials in Stripe checkout:
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## 🔑 Admin Access

Default admin account:
- **Email**: admin@example.com
- **Password**: admin123

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth endpoints
│   │   ├── videos/        # Video management
│   │   ├── webhooks/      # Stripe webhooks
│   │   └── create-checkout-session/
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Protected dashboard
│   ├── admin/             # Admin panel
│   └── subscribe/         # Subscription page
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   ├── stripe.ts         # Stripe client
│   ├── server-auth.ts    # Server-side auth utils
│   ├── youtube.ts        # YouTube URL validation
│   └── security.ts       # Security utilities
└── middleware.ts          # Route protection
```

## 🔐 Security Features

### Authentication
- ✅ Email/password authentication with NextAuth.js
- ✅ Secure session management with JWT
- ✅ Password hashing with bcryptjs
- ✅ Route protection middleware

### Authorization
- ✅ Role-based access control (USER/ADMIN)
- ✅ Server-side role verification
- ✅ Subscription-based access control
- ✅ Protected API endpoints

### Stripe Security
- ✅ Webhook signature verification
- ✅ Test mode only implementation
- ✅ Secure customer/subscription management
- ✅ Idempotent webhook handling

### Data Protection
- ✅ Input validation and sanitization
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ Environment variable security
- ✅ Error message sanitization

## 🎯 Features Overview

### Authentication System
- User registration and login
- Secure session persistence
- Role-based authorization (USER/ADMIN)
- Password validation and hashing

### Subscription Management
- Stripe Checkout integration (test mode)
- Subscription status tracking
- Automatic user activation via webhooks
- Payment failure handling

### Protected Dashboard
- Subscription status display
- Access control for premium features
- User-friendly interface

### Admin Panel
- User management and overview
- Subscription status monitoring
- Revenue tracking
- Role-based admin access

### YouTube Video Library
- Add YouTube videos with URL validation
- Duplicate prevention
- Server-side validation
- Embedded video playback
- Video management (add/delete)

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (NextAuth)
- `POST /api/auth/signout` - User logout (NextAuth)

### Subscriptions
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Videos
- `GET /api/videos` - Get user's videos
- `POST /api/videos` - Add new video
- `DELETE /api/videos?id=<id>` - Delete video

## 📊 Database Schema

### User
- ID, email, password (hashed)
- Name, role (USER/ADMIN)
- Timestamps

### Subscription
- User relationship
- Stripe customer/subscription IDs
- Status, billing period
- Timestamps

### Video
- User relationship
- Title, URL, YouTube ID
- Timestamps

### NextAuth Tables
- Account, Session, VerificationToken

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed admin user
```

### Database Commands

```bash
npx prisma studio    # Open Prisma Studio
npx prisma db push   # Push schema changes
npx prisma generate  # Generate Prisma client
npx prisma migrate dev # Create and apply migration
```

## 🚀 Production Deployment

### Environment Variables
Ensure all environment variables are properly set:
- Use strong `NEXTAUTH_SECRET` (32+ characters)
- Use production Stripe keys
- Set `NEXTAUTH_URL` to your domain
- Use production database URL

### Database
- Migrate to PostgreSQL for production
- Set up proper database backups
- Configure connection pooling

### Security Checklist
- [ ] All environment variables set
- [ ] Database properly secured
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Error logging configured
- [ ] Security headers added

## 🐛 Troubleshooting

### Common Issues

**"Stripe key not found"**
- Ensure `.env.local` has proper Stripe keys
- Restart development server after adding env vars

**"Database connection failed"**
- Run `npx prisma db push` to initialize database
- Check DATABASE_URL in `.env.local`

**"Webhook verification failed"**
- Ensure STRIPE_WEBHOOK_SECRET is set
- In production, use Stripe CLI for webhook testing

**"Admin can't access admin panel"**
- Run `npm run db:seed` to create admin user
- Check admin role in database

## 📝 Notes & Decisions

### Architecture Decisions
- **Next.js App Router**: Modern routing with server components
- **SQLite**: Simple local development, easily migrated to PostgreSQL
- **Prisma**: Type-safe database access with great DX
- **NextAuth**: Battle-tested authentication with JWT sessions
- **Tailwind CSS**: Utility-first styling for rapid development

### Security Trade-offs
- JWT sessions for stateless architecture
- Client-side session checks with server-side verification
- Basic rate limiting (consider Redis for production)
- Error sanitization balanced with development debugging

### Development Decisions
- TypeScript for type safety
- Server/client component separation
- API route protection at multiple levels
- Comprehensive input validation

## 🔄 Changelog

### v1.0.0 - Initial Release
- ✅ Complete authentication system
- ✅ Stripe subscription integration
- ✅ YouTube video library
- ✅ Admin panel
- ✅ Security hardening
- ✅ Comprehensive documentation

## 📄 License

This is a demo project for educational purposes. Use the code as a starting point for your own SaaS applications.

## 🤝 Support

For issues or questions:
1. Check this README
2. Review the code comments
3. Test with Stripe test cards
4. Verify environment variables

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
