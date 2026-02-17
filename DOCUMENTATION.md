# ATS Resume Analyzer - Complete Technical Documentation

**Live URL:** https://resumeoptimizer.online
**Repository:** https://github.com/Avinash-Amudala/ATS-Resume-Analyzer
**VPS:** 76.13.124.74 (AlmaLinux 10, Hostinger)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Authentication (Clerk)](#authentication-clerk)
8. [Payments (Stripe)](#payments-stripe)
9. [AI Providers](#ai-providers)
10. [ATS Scoring Engine](#ats-scoring-engine)
11. [Freemium Model](#freemium-model)
12. [SEO Configuration](#seo-configuration)
13. [Deployment Guide](#deployment-guide)
14. [Common Operations](#common-operations)
15. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
User -> Caddy (SSL/Reverse Proxy) -> Next.js Standalone (PM2) -> Supabase PostgreSQL
                                                                -> Gemini/Groq/Kimi AI
                                                                -> Stripe Payments
                                                                -> Clerk Auth
```

- **Frontend:** Next.js 16 App Router with React Server Components
- **Backend:** Next.js API Routes (serverless-style, running in Node.js)
- **Database:** PostgreSQL via Supabase (Prisma ORM)
- **Auth:** Clerk (handles sign-up, sign-in, session management)
- **Payments:** Stripe (checkout sessions, webhooks)
- **AI:** Gemini 2.0 Flash (primary), Groq Llama 3.3 (fallback), Kimi (fallback)
- **Hosting:** VPS with Caddy reverse proxy + PM2 process manager

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.1.6 |
| Language | TypeScript | 5.x |
| Build | Turbopack | Built-in |
| UI | Tailwind CSS + shadcn/ui | 4.x |
| ORM | Prisma | 6.19.x |
| Database | PostgreSQL (Supabase) | 15.x |
| Auth | Clerk | @clerk/nextjs |
| Payments | Stripe | stripe@18.x |
| AI (Primary) | Google Gemini | @google/generative-ai |
| AI (Fallback) | Groq (Llama 3.3) | REST API |
| AI (Fallback) | Kimi/Moonshot | REST API |
| PDF Parsing | pdf-parse | v2 |
| DOCX Generation | docx | 9.x |
| Process Manager | PM2 | Latest |
| Reverse Proxy | Caddy | Latest |
| Icons | Lucide React | Latest |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page (marketing)
│   ├── layout.tsx                # Root layout (SEO, metadata, providers)
│   ├── globals.css               # Global styles (Tailwind)
│   ├── robots.ts                 # robots.txt generation
│   ├── sitemap.ts                # XML sitemap generation
│   ├── analyze/
│   │   ├── page.tsx              # Upload + scan form
│   │   └── [scanId]/page.tsx     # Scan results page (score, keywords, usage)
│   ├── optimize/
│   │   └── [scanId]/page.tsx     # AI optimization page
│   ├── templates/page.tsx        # Resume templates gallery
│   ├── pricing/page.tsx          # Pricing plans page
│   ├── dashboard/
│   │   ├── page.tsx              # User dashboard
│   │   └── settings/page.tsx     # Account settings
│   ├── cover-letter/page.tsx     # Cover letter generator
│   ├── sign-in/[[...sign-in]]/   # Clerk sign-in
│   ├── sign-up/[[...sign-up]]/   # Clerk sign-up
│   └── api/                      # API Routes
│       ├── scan/route.ts         # POST: ATS scan, GET: fetch scans
│       ├── optimize/route.ts     # POST: AI resume optimization
│       ├── download/[id]/route.ts# GET: download DOCX/PDF
│       ├── subscription/route.ts # GET: usage info, POST: checkout/portal
│       ├── templates/route.ts    # GET: list templates
│       ├── ats/detect/route.ts   # POST: detect company ATS
│       ├── ats/companies/route.ts# GET: list ATS companies
│       ├── cover-letter/route.ts # POST: generate cover letter
│       ├── resumes/              # CRUD for resumes
│       ├── webhooks/stripe/      # Stripe webhook handler
│       ├── health/route.ts       # Health check endpoint
│       └── indexnow/route.ts     # IndexNow ping endpoint
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Navigation header with logo
│   │   ├── Footer.tsx            # Site footer
│   │   └── AuthProvider.tsx      # Clerk provider wrapper
│   ├── ui/                       # shadcn/ui components
│   └── ads/AdBanner.tsx          # Ad placeholder component
├── lib/
│   ├── ai/
│   │   ├── provider.ts           # AI provider abstraction (fallback chain)
│   │   ├── gemini.ts             # Google Gemini integration
│   │   ├── groq.ts               # Groq (Llama) integration
│   │   ├── kimi.ts               # Kimi/Moonshot integration
│   │   └── prompts.ts            # AI prompt templates
│   ├── scoring/
│   │   ├── index.ts              # Main scoring orchestrator
│   │   ├── keyword-matching.ts   # TF-IDF + bigram keyword matching
│   │   ├── keyword-density.ts    # Keyword density analysis
│   │   ├── invisible-chars.ts    # Hidden character detection
│   │   ├── special-chars.ts      # Special character audit
│   │   ├── section-headers.ts    # Section header recognition
│   │   ├── contact-info.ts       # Contact info validation
│   │   ├── date-consistency.ts   # Date format consistency
│   │   ├── quantified-achievements.ts # Metrics detection
│   │   ├── summary-alignment.ts  # Summary-JD alignment
│   │   └── file-format.ts        # File format validation
│   ├── resume/
│   │   ├── parser.ts             # PDF/DOCX text extraction
│   │   ├── structured.ts         # Structured resume parsing
│   │   └── generator.ts          # DOCX file generation
│   ├── auth.ts                   # Auth helpers (getOrCreateUser, usage tracking)
│   ├── db.ts                     # Prisma client singleton
│   ├── stripe.ts                 # Stripe configuration
│   ├── utils.ts                  # Utility functions
│   └── rate-limit.ts             # Rate limiting
├── middleware.ts                  # Clerk auth middleware (route protection)
└── types/index.ts                # TypeScript type definitions

prisma/
├── schema.prisma                 # Database schema
└── seed.ts                       # Database seeder (companies, templates)

public/
├── logo.svg                      # Company logo
├── logo-dark.svg                 # Dark mode logo
├── favicon.svg                   # Favicon
├── og-image.svg                  # Open Graph image
├── googlef43d6f7b75cffa0e.html   # Google Search Console verification
├── BingSiteAuth.xml              # Bing Webmaster verification
└── resumeoptimizeronline2024key.txt # IndexNow API key
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI Providers
GEMINI_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...       # Get free at https://console.groq.com/keys
KIMI_API_KEY=sk-kimi-...
KIMI_BASE_URL=https://api.moonshot.cn/v1

# Stripe (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

# App
NEXT_PUBLIC_APP_URL=https://resumeoptimizer.online

# SEO Verification
GOOGLE_SITE_VERIFICATION=xxx
BING_SITE_VERIFICATION=xxx

# IndexNow
INDEXNOW_API_KEY=resumeoptimizeronline2024key
```

Also create `.env` for Prisma CLI (Prisma reads `.env` not `.env.local`):
```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
```

**Important:** If your password contains `@`, URL-encode it as `%40`.

---

## Database Schema

### Models

| Model | Purpose |
|-------|---------|
| **User** | Auth, plan (free/pro/lifetime), daily usage counters |
| **Resume** | Stored resumes (raw text, parsed JSON, optimized JSON) |
| **Scan** | ATS scan results (score, breakdown, keywords, company) |
| **Optimization** | AI optimization history (model, tokens, cost) |
| **AtsCompany** | 50+ companies with their ATS systems |
| **AtsSystem** | 8 ATS systems with parsing rules and tips |
| **Template** | 8 resume templates (2 free, 6 Pro) |
| **Payment** | Stripe payment records |

### Key Fields

**User daily counters:**
- `scansToday` - resets daily via `scansResetAt`
- `downloadsToday` - tracks daily download usage
- `optimizesToday` - tracks daily AI optimization usage

**Scan ATS detection:**
- `jdCompany` - auto-detected company name from job description
- `detectedAts` - the ATS system that company uses

---

## API Endpoints

### Public (no auth required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Landing page |
| GET | `/pricing` | Pricing page |
| GET | `/templates` | Templates gallery |
| GET | `/analyze` | Upload form |
| GET | `/api/health` | Health check |
| GET | `/api/templates` | List templates |
| POST | `/api/ats/detect` | Detect company ATS |
| GET | `/api/indexnow` | IndexNow verification |

### Protected (auth required)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/scan` | Run ATS scan (3 free/day) |
| GET | `/api/scan?id=X` | Get scan results |
| POST | `/api/optimize` | AI optimize resume (3 free/day) |
| GET | `/api/download/[id]?format=docx` | Download resume (3 free/day) |
| GET | `/api/subscription` | Get plan + usage counters |
| POST | `/api/subscription` | Checkout or manage portal |
| POST | `/api/cover-letter` | Generate cover letter |
| POST | `/api/resumes/upload` | Upload resume |
| GET | `/api/resumes` | List user resumes |

### Webhook
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/webhooks/stripe` | Stripe payment webhook |

---

## Authentication (Clerk)

**Dashboard:** https://dashboard.clerk.com

### Setup
1. Create a Clerk application
2. Set Sign-in URL: `/sign-in`
3. Set Sign-up URL: `/sign-up`
4. Set After Sign-in URL: `/dashboard`
5. Set After Sign-up URL: `/dashboard`
6. Copy Publishable Key and Secret Key to `.env.local`

### Route Protection (middleware.ts)
- **Public routes:** `/`, `/pricing`, `/analyze`, `/templates`, `/cover-letter`, `/sign-in`, `/sign-up`, `/api/health`, `/api/webhooks/*`, `/api/ats/*`, `/api/templates`
- **Protected routes:** `/dashboard/*`, `/optimize/*`, `/api/scan`, `/api/optimize`, `/api/download/*`, `/api/subscription`, `/api/resumes/*`, `/api/cover-letter`

### AuthProvider
The `AuthProvider` component wraps `ClerkProvider` with a structurally valid fallback key for build time when real keys aren't available.

---

## Payments (Stripe)

**Dashboard:** https://dashboard.stripe.com

### Pricing
| Plan | Price | Price ID |
|------|-------|----------|
| Pro Monthly | $15/month | `price_1SwrLWFHAXNJnqg3xHyNHzNz` |
| Pro Yearly | $149/year | `price_1SwrNFFHAXNJnqg3VswWQXAg` |

### Flow
1. User clicks "Upgrade" on pricing page
2. Frontend calls `POST /api/subscription` with `{ action: "checkout", plan: "pro-monthly" }`
3. Backend creates Stripe Checkout Session
4. User redirected to Stripe for payment
5. Stripe webhook (`POST /api/webhooks/stripe`) fires on success
6. Webhook updates `user.plan` to "pro" in database

### Webhook Events Handled
- `checkout.session.completed` - Upgrade user to Pro
- `customer.subscription.deleted` - Downgrade user to Free

---

## AI Providers

### Provider Chain (fallback order)
1. **Gemini 2.0 Flash** (primary) - Google, fast and cheap
   - Retry logic: 3 attempts with exponential backoff (5s, 10s, 20s)
   - Model fallbacks: `gemini-2.0-flash` -> `gemini-1.5-flash` -> `gemini-1.5-flash-8b`
2. **Groq** (fallback) - Llama 3.3 70B, free tier available
3. **Kimi** (fallback) - Moonshot AI

### How It Works
- `callAI()` in `src/lib/ai/provider.ts` tries each provider in order
- If primary fails (rate limit, error), automatically tries next provider
- Each provider handles its own retry and model selection

### Getting API Keys
- **Gemini:** https://aistudio.google.com/apikey (free tier: 15 RPM)
- **Groq:** https://console.groq.com/keys (free tier: 30 RPM)
- **Kimi:** https://platform.moonshot.cn (requires Chinese phone number)

---

## ATS Scoring Engine

Located in `src/lib/scoring/`. Runs 10 checks, each scoring 0-100:

| # | Check | Weight | File |
|---|-------|--------|------|
| 1 | Invisible Characters | 10% | `invisible-chars.ts` |
| 2 | Keyword Matching | 15% | `keyword-matching.ts` |
| 3 | Section Headers | 10% | `section-headers.ts` |
| 4 | Quantified Achievements | 10% | `quantified-achievements.ts` |
| 5 | Special Characters | 10% | `special-chars.ts` |
| 6 | Date Consistency | 10% | `date-consistency.ts` |
| 7 | Contact Info | 10% | `contact-info.ts` |
| 8 | File Format | 5% | `file-format.ts` |
| 9 | Summary Alignment | 10% | `summary-alignment.ts` |
| 10 | Keyword Density | 10% | `keyword-density.ts` |

### Keyword Matching Algorithm
Uses TF-IDF (Term Frequency-Inverse Document Frequency) with bigram support:
1. Extract all keywords from job description
2. Calculate TF-IDF scores for each keyword
3. Check which keywords appear in the resume
4. Generate missing keywords list sorted by importance

### Company ATS Detection
When a scan runs, the system:
1. Searches `AtsCompany` table for company name matches in the JD text
2. If found, retrieves the company's ATS system (e.g., Greenhouse)
3. Fetches ATS-specific tips from `AtsSystem` table
4. Returns detection info in scan response + saves to `Scan.jdCompany` and `Scan.detectedAts`

---

## Freemium Model

### Free Users (3/day each)
| Action | Limit | Counter Field | Increment Function |
|--------|-------|---------------|-------------------|
| Scans | 3/day | `user.scansToday` | `incrementScanCount()` |
| Downloads | 3/day | `user.downloadsToday` | `incrementDownloadCount()` |
| AI Optimizations | 3/day | `user.optimizesToday` | `incrementOptimizeCount()` |

### Daily Reset
Counters reset when `new Date() > user.scansResetAt`. Reset sets all counters to 0 and `scansResetAt` to now + 24 hours.

### Pro Users
All limits are removed (unlimited usage).

### Frontend Behavior
- Usage counters displayed on results page: "X/3 Scans | X/3 Downloads | X/3 Optimizations"
- When limit reached: buttons change to "Upgrade to Pro" and redirect to `/pricing`
- Download errors handled gracefully (no raw JSON shown to user)

---

## SEO Configuration

### Google Search Console
- Verification file: `public/googlef43d6f7b75cffa0e.html`
- Meta tag: `q94gUpoEiy-PjV3RmRuv8bd0bygI3P3t1pq1d83NQps`

### Bing Webmaster Tools
- Verification file: `public/BingSiteAuth.xml`
- Meta tag: `E167200E6F532FE5A315DC405CF9F7CD`

### Sitemap
Auto-generated at `/sitemap.xml` via `src/app/sitemap.ts`. Includes 7 pages.

### IndexNow
- API key file: `public/resumeoptimizeronline2024key.txt`
- Ping endpoint: `GET /api/indexnow?url=https://resumeoptimizer.online/PAGE`
- Pings Bing and Yandex IndexNow APIs

### Structured Data (JSON-LD)
In `src/app/layout.tsx`:
- `SoftwareApplication` schema (name, pricing, rating)
- `Organization` schema (name, URL, logo)

### Open Graph & Twitter Cards
Full Open Graph tags with title, description, image, URL, type, siteName.
Twitter card with large image summary.

---

## Deployment Guide

### Prerequisites on VPS
- Node.js 20+
- PM2 (`npm install -g pm2`)
- Caddy web server

### Build & Deploy Steps

```bash
# 1. Build locally
npm run build

# 2. Create deployment package
tar czf /tmp/ats-deploy.tar.gz .next/standalone .next/static public

# 3. Upload to VPS
scp /tmp/ats-deploy.tar.gz root@76.13.124.74:/tmp/

# 4. SSH into VPS and deploy
ssh root@76.13.124.74
cd /var/www/ats-app
pm2 stop ats-resume-analyzer
tar xzf /tmp/ats-deploy.tar.gz -C /var/www/ats-app

# 5. Set up standalone structure
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
cp .env.local .next/standalone/.env.local
cp .env .next/standalone/.env

# 6. Restart
pm2 start ecosystem.config.cjs
pm2 save
```

### PM2 Configuration (`ecosystem.config.cjs`)
```javascript
module.exports = {
  apps: [{
    name: 'ats-resume-analyzer',
    cwd: '/var/www/ats-app/.next/standalone',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    max_memory_restart: '500M',
    error_file: '/var/log/ats-app-error.log',
    out_file: '/var/log/ats-app-out.log',
  }]
};
```

### Caddy Configuration (`/etc/caddy/Caddyfile`)
```
resumeoptimizer.online {
    reverse_proxy localhost:3000
    encode gzip
    header {
        X-Frame-Options DENY
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
    }
}
```

### Prisma on VPS
The schema uses `binaryTargets = ["native", "rhel-openssl-3.0.x"]` to support both Mac (dev) and AlmaLinux (production).

---

## Common Operations

### Push schema changes to database
```bash
npx prisma db push
```

### Re-seed the database
```bash
npx prisma db seed
```

### Check VPS logs
```bash
ssh root@76.13.124.74
pm2 logs ats-resume-analyzer --lines 50
```

### Restart the app on VPS
```bash
ssh root@76.13.124.74
pm2 restart ats-resume-analyzer
```

### Ping search engines after changes
```bash
curl "https://resumeoptimizer.online/api/indexnow?url=https://resumeoptimizer.online"
```

### Check site health
```bash
curl https://resumeoptimizer.online/api/health
```

---

## Troubleshooting

### "Missing secretKey" error
The `.env.local` is not in the right directory. For standalone deployment, it must be at `.next/standalone/.env.local`.

### CSS/styles not loading
Static files missing from standalone. Run:
```bash
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

### "All AI providers failed"
1. Check Gemini API quota at https://aistudio.google.com/apikey
2. Get a free Groq API key at https://console.groq.com/keys
3. Add `GROQ_API_KEY=gsk_...` to `.env.local`

### Prisma binary target mismatch
If you see "PrismaClientInitializationError", add the correct binary target:
```prisma
binaryTargets = ["native", "rhel-openssl-3.0.x"]
```
Then rebuild and redeploy.

### Clerk redirect loop
Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` match the same Clerk instance.

### Database connection errors
Ensure password is URL-encoded in connection string (`@` becomes `%40`).

---

## Costs Overview

| Service | Free Tier | Paid |
|---------|-----------|------|
| Supabase DB | 500MB, 50K rows | $25/month |
| Clerk Auth | 10K monthly active users | $25/month |
| Gemini AI | 15 RPM, 1M tokens/day | Pay-per-use |
| Groq AI | 30 RPM, 6K tokens/min | Pay-per-use |
| Stripe | 2.9% + 30c per transaction | - |
| VPS (Hostinger) | - | ~$10/month |
| Domain | - | ~$10/year |

**Total estimated monthly cost at launch: $10-20/month** (VPS only, everything else on free tiers)
