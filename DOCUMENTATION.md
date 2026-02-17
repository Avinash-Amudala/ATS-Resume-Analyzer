# ATS Resume Analyzer - Complete Technical Documentation

**Live URL:** https://resumeoptimizer.online
**Repository:** https://github.com/Avinash-Amudala/ATS-Resume-Analyzer
**VPS:** 76.13.124.74 (AlmaLinux 10, Hostinger)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Features](#features)
5. [API Endpoints](#api-endpoints)
6. [Database Schema](#database-schema)
7. [ATS Scoring Engine](#ats-scoring-engine)
8. [AI Integration](#ai-integration)
9. [DOCX Resume Generator](#docx-resume-generator)
10. [Authentication & Security](#authentication--security)
11. [Stripe Billing & Promo Codes](#stripe-billing--promo-codes)
12. [ATS Company Database](#ats-company-database)
13. [Analytics](#analytics)
14. [Deployment](#deployment)
15. [Environment Variables](#environment-variables)
16. [Admin Guide](#admin-guide)

---

## Architecture Overview

```
User uploads resume + JD
    |
    v
[Next.js App Router] --> [Clerk Auth] --> [API Routes]
    |                                          |
    v                                          v
[PDF/DOCX Parser] --> [ATS Scoring Engine] --> [Prisma/PostgreSQL]
    |                       |
    v                       v
[Structured Resume] --> [AI Optimization (Gemini 2.5 Flash)]
    |                       |
    v                       v
[DOCX Generator] <---- [Merged Resume Data]
    |
    v
[Download with ATS Score 90+]
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| Auth | Clerk (publishable + secret key) |
| Database | PostgreSQL (Neon) + Prisma ORM |
| AI | Google Gemini 2.5 Flash (paid tier) |
| Payments | Stripe (subscriptions + promo codes) |
| PDF Parsing | pdf-parse v2 (pdfjs-dist) |
| DOCX Parsing | mammoth |
| DOCX Generation | docx (with ExternalHyperlink support) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Hosting | Hostinger VPS (AlmaLinux 10) |
| Process Manager | PM2 |
| Reverse Proxy | Caddy (auto-HTTPS) |
| Analytics | Google Analytics 4 + Custom Admin API |
| Ads | Google AdSense |

## Project Structure

```
src/
  app/
    page.tsx                     # Landing page
    layout.tsx                   # Root layout (GA, AdSense, JSON-LD)
    analyze/
      page.tsx                   # Upload resume + JD (with optional company input)
      [scanId]/page.tsx          # ATS score results page
    optimize/
      [scanId]/page.tsx          # 3-step: AI Optimize -> Choose Template -> Download
    templates/page.tsx           # Template gallery with visual previews
    pricing/page.tsx             # Plans with promo code support
    cover-letter/page.tsx        # Pro-only cover letter generator
    dashboard/page.tsx           # User dashboard
    api/
      scan/route.ts              # POST: scan resume, GET: list scans
      optimize/route.ts          # POST: AI optimization + re-scoring
      download/[id]/route.ts     # GET: generate DOCX with template
      subscription/route.ts      # GET: usage info, POST: checkout/portal
      cover-letter/route.ts      # POST: AI cover letter (Pro only)
      templates/route.ts         # GET: list templates
      ats/
        companies/route.ts       # GET: search companies
        detect/route.ts          # POST: detect ATS from JD
      admin/
        coupons/route.ts         # GET/POST/DELETE: Stripe promo codes
        analytics/route.ts       # GET: comprehensive analytics
      webhooks/stripe/route.ts   # Stripe webhook handler
      health/route.ts            # Health check
  lib/
    ai/
      gemini.ts                  # Gemini API client (2.5 Flash primary)
      provider.ts                # AI provider abstraction + cost estimation
      prompts.ts                 # System prompts for optimization & cover letters
    resume/
      parser.ts                  # PDF/DOCX text extraction (with DOMMatrix polyfill)
      structured.ts              # Text -> StructuredResume parsing
      generator.ts               # StructuredResume -> DOCX generation
    scoring/
      index.ts                   # Orchestrates all 10 ATS checks
      contact-info.ts            # Email, phone, LinkedIn, GitHub, portfolio, location
      keyword-matching.ts        # JD keyword extraction + resume matching
      keyword-density.ts         # Keyword frequency analysis
      section-headers.ts         # Standard section header detection
      invisible-chars.ts         # Hidden/invisible character detection
      special-chars.ts           # Special character check
      quantified-achievements.ts # Metrics/numbers in bullets
      summary-alignment.ts       # Summary vs JD alignment
      file-format.ts             # File format validation
      date-consistency.ts        # Date format consistency
    auth.ts                      # User management + freemium limits
    db.ts                        # Prisma client singleton
    stripe.ts                    # Stripe client + checkout session creation
    utils.ts                     # Utility functions (isPro, etc.)
  types/index.ts                 # All TypeScript interfaces
  middleware.ts                  # Clerk auth middleware + route protection
  components/
    layout/
      Header.tsx                 # Navigation header
      Footer.tsx                 # Footer
      AuthProvider.tsx            # Clerk provider wrapper
    ui/                          # shadcn/ui components
```

## Features

### Free Tier (3 per day)
- Resume upload (PDF/DOCX)
- ATS compatibility score (10 checks)
- Missing keyword detection
- Company ATS detection
- 2 resume templates (Classic Clean, New Grad)
- 3 scans, 3 downloads, 3 optimizations per day

### Pro Tier ($15/month or $149/year)
- Unlimited scans, downloads, optimizations
- AI-powered resume rewriting (Gemini 2.5 Flash)
- 8 FAANG resume templates
- Cover letter generator
- Ad-free experience
- Priority support

### Lifetime ($299 one-time)
- Everything in Pro, forever

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/templates` | List resume templates |
| GET | `/api/ats/companies?q=` | Search ATS companies |
| POST | `/api/ats/detect` | Detect ATS from JD text |

### Protected (requires auth)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/scan` | Upload resume + JD, run ATS scoring |
| GET | `/api/scan` | List user's scans |
| POST | `/api/optimize` | AI optimize resume + re-score |
| GET | `/api/download/:id` | Download DOCX (with templateId param) |
| GET | `/api/subscription` | Get usage/plan info |
| POST | `/api/subscription` | Checkout or portal session |
| POST | `/api/cover-letter` | Generate cover letter (Pro only) |
| GET | `/api/resumes` | List user's resumes |

### Admin (requires admin email)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/analytics` | Full analytics dashboard data |
| GET | `/api/admin/coupons` | List all Stripe coupons |
| POST | `/api/admin/coupons` | Create coupon + promo code |
| DELETE | `/api/admin/coupons?id=` | Delete a coupon |

## Database Schema

**7 Models (PostgreSQL via Prisma):**

- **User**: id, clerkId, email, name, plan (free/pro/lifetime), stripeCustomerId, daily usage counters
- **Resume**: id, userId, name, rawText, parsedJson, optimizedJson, version
- **Scan**: id, userId, resumeId, jdText, jdCompany, scoreTotal, scoreBreakdown, missingKeywords, detectedAts, atsTips
- **Optimization**: id, scanId, aiModelUsed, promptTokens, completionTokens, costUsd, originalSections, optimizedSections
- **AtsCompany**: id, companyName, companyDomain, atsSystem, acceptsPdf, acceptsDocx, verified
- **AtsSystem**: id (unique name), parsingType (semantic/keyword/hybrid), rules, tips
- **Template**: id, name, description, tier (free/pro), styleConfig (JSON), sectionOrder
- **Payment**: id, userId, stripePaymentId, amount, currency, status

## ATS Scoring Engine

The scoring engine runs **10 independent checks**, each scoring 0-100:

1. **Invisible Characters** - Detects hidden Unicode chars that break ATS parsing
2. **Contact Information** - Checks for email, phone, LinkedIn, GitHub/portfolio, location
3. **Section Headers** - Validates standard section headers (Experience, Education, Skills, etc.)
4. **Keyword Matching** - Extracts keywords from JD and checks resume coverage
5. **Keyword Density** - Ensures proper keyword frequency (not stuffed, not missing)
6. **Special Characters** - Flags problematic special chars (smart quotes, em dashes, etc.)
7. **Quantified Achievements** - Looks for metrics/numbers in bullet points
8. **Summary Alignment** - Checks if professional summary aligns with JD keywords
9. **File Format** - Validates file type and structure
10. **Date Consistency** - Checks for consistent date formatting

**Final score = average of all 10 checks (0-100)**

After AI optimization, the resume is **re-scored** against the same JD to show the improved score.

## AI Integration

### Model: Gemini 2.5 Flash (paid tier)

**Fallback chain:** `gemini-2.5-flash` -> `gemini-2.0-flash` -> `gemini-2.0-flash-lite`

**API Key:** Stored in `GEMINI_API_KEY` environment variable (paid tier, no quota limits)

**Optimization flow:**
1. Extract missing keywords from scan results
2. Build optimization prompt with resume text + JD + missing keywords
3. AI rewrites summary, experience bullets, and skills to naturally integrate keywords
4. Response is `OptimizationResult` format (bulletsRewritten, categoriesRewritten)
5. Merged into original `StructuredResume` for DOCX generation
6. Re-scored against original JD to compute new ATS score

**Cost estimation:** ~$0.0002 per optimization (prompt: $0.15/M tokens, completion: $0.60/M tokens)

## DOCX Resume Generator

The generator creates professional ATS-optimized DOCX files with:

- **Compact layout** with tighter margins (0.375" top/bottom, 0.5" sides)
- **Hyperlinked contact info** (email mailto:, LinkedIn URL, GitHub/portfolio URL)
- **Tab-aligned dates** (company name left, dates right-aligned)
- **Proper bullet formatting** with 0.25" indent
- **Section dividers** with colored bottom borders
- **No page markers** ("-- 1 of 2 --" etc.)
- **Template support** via `TemplateStyleConfig` (font, colors, spacing, section order)

## Authentication & Security

### Clerk Authentication
- Publishable key baked into build (Next.js standalone mode)
- Secret key read from `.env.local` at runtime
- Middleware protects all `/api/` routes except public ones
- Admin routes additionally check email against `ADMIN_EMAIL`

### Security Headers (via next.config.ts)
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### Rate Limiting
- Free users: 3 scans, 3 downloads, 3 optimizations per day
- Counters reset daily (tracked per user in DB)
- Pro/Lifetime users: unlimited

### File Validation
- Max file size: 5MB
- Supported formats: PDF, DOCX, TXT, RTF
- Magic byte validation for PDF/DOCX
- Image-only PDF detection

## Stripe Billing & Promo Codes

### Plans
| Plan | Price | Stripe Price ID |
|------|-------|-----------------|
| Pro Monthly | $15/mo | `STRIPE_PRICE_MONTHLY` env var |
| Pro Annual | $149/yr | `STRIPE_PRICE_YEARLY` env var |
| Lifetime | $299 | Not yet configured |

### Creating Promo Codes (Admin)

**Via API:**
```bash
# Create a 20% off coupon with code "LAUNCH20"
curl -X POST https://resumeoptimizer.online/api/admin/coupons \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-clerk-session-cookie>" \
  -d '{
    "name": "Launch Discount",
    "percentOff": 20,
    "duration": "once",
    "code": "LAUNCH20",
    "maxRedemptions": 100
  }'

# Create a $5 off coupon
curl -X POST https://resumeoptimizer.online/api/admin/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Five Dollar Off",
    "amountOff": 500,
    "duration": "once",
    "code": "SAVE5"
  }'

# List all coupons
curl https://resumeoptimizer.online/api/admin/coupons

# Delete a coupon
curl -X DELETE "https://resumeoptimizer.online/api/admin/coupons?id=coupon_xyz"
```

**Coupon Parameters:**
- `name`: Display name for the coupon
- `percentOff`: Percentage discount (e.g., 20 for 20%)
- `amountOff`: Fixed amount in cents (e.g., 500 for $5.00)
- `duration`: `"once"` | `"repeating"` | `"forever"`
- `durationInMonths`: Required if duration is "repeating"
- `code`: The promo code users enter (auto-uppercased)
- `maxRedemptions`: Max number of times the code can be used

**How users apply promo codes:**
1. On the pricing page, click "Have a promo code?"
2. Enter the code (e.g., LAUNCH20)
3. Click any plan's checkout button
4. The discount is automatically applied at Stripe checkout
5. If no promo code entered, Stripe checkout page allows entering one

## ATS Company Database

**13 ATS Systems:** Greenhouse, Lever, Workday, Taleo, iCIMS, SuccessFactors, Ashby, BambooHR, SmartRecruiters, Jobvite, JazzHR, Breezy HR, Recruitee

**98 Companies** across 14 industries:
- Big Tech (Google, Meta, Amazon, Apple, Microsoft, Netflix)
- Tech Enterprise (Salesforce, Adobe, Oracle, IBM, NVIDIA, etc.)
- Tech Consumer (Uber, Airbnb, Stripe, Spotify, etc.)
- AI/ML Startups (Anthropic, OpenAI, Scale AI, Cohere, Hugging Face)
- Tech Startups (Vercel, Notion, Figma, Linear, etc.)
- Fintech (Coinbase, Robinhood, Plaid, Ramp, etc.)
- Finance (JPMorgan, Goldman Sachs, Morgan Stanley, Citadel, etc.)
- Consulting (McKinsey, BCG, Bain, Deloitte, etc.)
- Healthcare (UnitedHealth, CVS, Pfizer, J&J, Moderna)
- Retail (Walmart, Target, Costco, Nike)
- Aerospace (Tesla, SpaceX, Lockheed Martin, Boeing)
- Media (Disney, Warner Bros.)
- Telecom (Verizon, AT&T)

**Auto-learning:** When a user enters a company name not in our database, it's automatically added with `atsSystem: "Unknown"` for future enrichment.

## Analytics

### Google Analytics 4
- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in `.env.local`
- Tracks page views, user flows, geography, device info
- Access at: https://analytics.google.com

### Admin Analytics API
Access comprehensive internal analytics at:
```
GET https://resumeoptimizer.online/api/admin/analytics
```

Returns:
- **Overview:** Total users, pro users, scans, optimizations, conversion rate
- **Activity:** Today/this week/this month scan counts
- **AI Usage:** Total cost, tokens used, avg cost per optimization
- **Score Distribution:** How many resumes score 90+, 70-89, 50-69, <50
- **Top Companies:** Most frequently detected companies
- **ATS System Distribution:** Which ATS systems are most common
- **Recent Scans:** Last 20 scans with user info and scores

## Deployment

### Build & Deploy
```bash
# Build locally
npm run build

# Copy static files into standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cp start.js .next/standalone/

# Deploy to VPS
sshpass -p 'PASSWORD' rsync -avz --delete .next/standalone/ root@76.13.124.74:/var/www/ats-app/.next/standalone/

# Copy env file to standalone directory
ssh root@76.13.124.74 'cp /var/www/ats-app/.env.local /var/www/ats-app/.next/standalone/.env.local'

# Restart PM2
ssh root@76.13.124.74 'pm2 restart ats-resume-analyzer'
```

### PM2 Configuration
PM2 runs `start.js` (not `server.js` directly) which polyfills DOMMatrix, Path2D, and ImageData before loading the Next.js server.

### Caddy Configuration (reverse proxy)
```
resumeoptimizer.online {
    reverse_proxy localhost:3000
}
```

### Database Seeding
```bash
npx tsx prisma/seed.ts
# Seeds: 13 ATS systems, 98 companies, 8 templates
```

## Environment Variables

### Required
```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://...

# AI
GEMINI_API_KEY=AIza...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Optional
```env
# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Ads
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...

# App
NEXT_PUBLIC_APP_URL=https://resumeoptimizer.online
```

### Important Notes
- `NEXT_PUBLIC_*` vars are **baked at build time** in standalone mode
- Server-side vars (CLERK_SECRET_KEY, DATABASE_URL, etc.) are read from `.env.local` at runtime
- The `.env.local` must exist in the standalone directory on VPS

## Admin Guide

### Accessing Analytics
1. **Google Analytics:** https://analytics.google.com (sign in with your Google account)
2. **Internal Analytics:** `GET /api/admin/analytics` (must be signed in with admin email)

### Creating Promo Codes
See [Stripe Billing & Promo Codes](#stripe-billing--promo-codes) section above.

### Managing Users
Users are managed through:
1. **Clerk Dashboard:** https://dashboard.clerk.com
2. **Stripe Dashboard:** https://dashboard.stripe.com (for subscription management)
3. **Database:** Direct via Prisma Studio (`npx prisma studio`)

### Monitoring
- **PM2 Logs:** `pm2 logs ats-resume-analyzer`
- **Health Check:** `curl https://resumeoptimizer.online/api/health`
- **Error Logs:** `pm2 logs ats-resume-analyzer --err --lines 50`

### Common Operations
```bash
# SSH into VPS
ssh root@76.13.124.74

# View logs
pm2 logs ats-resume-analyzer --lines 50

# Restart app
pm2 restart ats-resume-analyzer

# Check database
npx prisma studio

# Re-seed database
npx tsx prisma/seed.ts
```

---

*Last updated: February 2026*
