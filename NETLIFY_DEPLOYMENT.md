# Netlify Environment Variables Setup

## Required Environment Variables for Production

Set these in your Netlify dashboard (Site settings → Environment variables):

```bash
# Database Connection
DATABASE_URL=postgresql://neondb_owner:npg_Kp73NbwYsMzt@ep-green-bonus-a1siwe4b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# NextAuth Configuration (CRITICAL - must match your domain)
NEXTAUTH_URL=https://saas-demo-app.netlify.app
NEXTAUTH_SECRET=cf6cc5f3e89a2b2e2b9b98ffccd8db24c336aebf1ff9e58fd466661af756819f7a31c31a13ab660ca485cec4515e16f2c69d41e5138097aca9e0249a604c6924

# Admin User (for seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Stripe (Optional - for real payments, otherwise dev mode is used)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_price_id
```

## Common Issues and Solutions

### 1. NEXTAUTH_URL Mismatch
- Make sure NEXTAUTH_URL exactly matches your deployed URL
- No trailing slash: `https://saas-demo-app.netlify.app` (correct)
- Not: `https://saas-demo-app.netlify.app/` (incorrect)

### 2. NEXTAUTH_SECRET Missing
- Must be a long, random string for production
- Use the generated secret above

### 3. Database Connection
- Ensure DATABASE_URL is exactly as provided
- Check that Neon database is not paused

### 4. Build Issues
- If build fails, check Netlify build logs
- May need to run `npx prisma generate` during build

## Testing After Deployment

1. Try creating a new account
2. Try signing in with admin credentials:
   - Email: admin@example.com
   - Password: admin123
3. Check browser console (F12) for any errors
4. Check Netlify function logs for server-side errors

## Debugging Steps

If auth still doesn't work:

1. Check Netlify function logs (Site overview → Functions → View logs)
2. Verify all environment variables are set correctly
3. Ensure database has the admin user seeded
4. Check that the site builds without errors