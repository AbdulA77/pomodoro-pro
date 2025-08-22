# Deployment Guide - Vercel + PostgreSQL

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: Set up with Neon, Supabase, or Railway
3. **Google OAuth**: Production credentials

## Step 1: Set up PostgreSQL Database

### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Settings > Database
5. Copy the connection string

## Step 2: Set up Google OAuth for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new OAuth 2.0 Client ID for production
3. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`

## Step 3: Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_URL`: `https://your-app.vercel.app`
   - `NEXTAUTH_SECRET`: Generated secret
   - `GOOGLE_CLIENT_ID`: Production Google OAuth Client ID
   - `GOOGLE_CLIENT_SECRET`: Production Google OAuth Client Secret

## Step 4: Database Migration

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Push Schema to Production**:
   ```bash
   npx prisma db push
   ```

3. **Seed Database** (optional):
   ```bash
   npm run db:seed
   ```

## Step 5: Verify Deployment

1. Visit your Vercel app URL
2. Test user registration
3. Test Google OAuth
4. Test timer functionality
5. Test task management

## Environment Variables Reference

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-generated-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
```

## Troubleshooting

- **Database Connection**: Ensure SSL is enabled in connection string
- **OAuth Redirect**: Check redirect URIs in Google Cloud Console
- **Build Errors**: Check Vercel build logs
- **Runtime Errors**: Check Vercel function logs
