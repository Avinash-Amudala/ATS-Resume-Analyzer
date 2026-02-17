# Where Everything Is Stored on the VPS

## 🎯 Quick Answer

**Everything your app needs to run is in:**
```
/var/www/ats-app/.next/standalone/
```

This is a self-contained production deployment that includes:
- Node.js runtime and all dependencies
- Compiled Next.js code
- Static files (images, CSS, etc.)
- Environment configuration

---

## 📍 The Complete File Map

### Root Directory: `/var/www/ats-app/`

```
/var/www/ats-app/
│
├── 📄 DOCUMENTATION.md                  ← Complete technical docs (18 KB)
├── 📄 VPS_SETUP_GUIDE.md               ← Detailed VPS operations guide (7.9 KB)
├── 📄 VPS_QUICK_REFERENCE.md           ← Command cheat sheet (4.8 KB)
│
├── 🔑 .env.local                        ← Runtime secrets (NOT in git!)
│                                          Contains: CLERK_SECRET_KEY, DATABASE_URL, etc.
│
├── 🔑 .env                              ← Build-time env (committed to git)
│
├── 📦 package.json                      ← NPM dependencies manifest
│
├── 🚀 start.js                          ← PM2 entry point with polyfills
│
├── 📁 .next/
│   └── 📁 standalone/                   ← ⭐️ PRODUCTION DEPLOYMENT (400 MB)
│       │
│       ├── 🔑 .env.local               ← Must exist! Copy from parent
│       ├── 🔑 .env                     ← For reference
│       ├── 📦 package.json
│       ├── 🚀 start.js                 ← PM2 wrapper (polyfills + startup)
│       ├── 🚀 server.js                ← Next.js server (port 3000)
│       │
│       ├── 📁 .next/                   ← Compiled Next.js code (~100 MB)
│       │   ├── server/
│       │   ├── static/
│       │   └── cache/
│       │
│       ├── 📁 node_modules/            ← Bundled dependencies (~1.5 GB)
│       │   ├── @anthropic-sdk/
│       │   ├── docx/
│       │   ├── mammoth/
│       │   ├── pdf-parse/
│       │   ├── prisma/
│       │   └── ... (900+ packages)
│       │
│       ├── 📁 public/                  ← Static files (~50 MB)
│       │   ├── images/
│       │   ├── fonts/
│       │   ├── favicon.svg
│       │   ├── og-image.svg
│       │   └── robots.txt
│       │
│       └── ✅ [Everything needed to run the app]
│
├── 📁 node_modules/                    ← Local dev dependencies (for reference)
├── 📁 public/                          ← Source static files
├── 📁 prisma/                          ← Database schema
│
└── [Other config files]
```

---

## 🎯 What's Actually Running?

When your app is running on the VPS:

```
PM2 Process
    ↓
start.js (in .next/standalone/)
    ↓
    1. Polyfills DOMMatrix, Path2D, ImageData
    2. Loads .env.local from current directory
    3. Requires('./server.js')
    ↓
server.js (Next.js production server)
    ↓
    Listens on localhost:3000
    ↓
Caddy Reverse Proxy
    ↓
    Maps https://resumeoptimizer.online → localhost:3000
    ↓
Internet → Your App
```

---

## 🔐 The Most Important Files

### 1. `.next/standalone/.env.local` (🚨 CRITICAL)

**Location:** `/var/www/ats-app/.next/standalone/.env.local`

**What it contains:**
```env
# Auth
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

**Why it matters:** Without this file, the app won't start.

### 2. `.next/standalone/start.js`

**Location:** `/var/www/ats-app/.next/standalone/start.js`

**What it does:**
- Polyfills missing browser APIs (required for pdf-parse to work)
- Loads environment variables
- Starts the Next.js server

**Why it matters:** PM2 runs this instead of `server.js` directly.

### 3. `.next/standalone/server.js`

**Location:** `/var/www/ats-app/.next/standalone/server.js`

**What it does:**
- Actual Next.js production server
- Listens on port 3000
- Handles all HTTP requests

---

## 📊 Directory Sizes

| Location | Size | Purpose |
|----------|------|---------|
| `.next/standalone/` | ~400 MB | Complete deployment |
| `.next/standalone/node_modules/` | ~1.5 GB | All dependencies bundled |
| `.next/standalone/.next/` | ~100 MB | Compiled Next.js code |
| `.next/standalone/public/` | ~50 MB | Static files |
| Documentation files | ~30 KB | All `.md` files |

---

## 🚀 How Deployment Works

### Step 1: Build Locally
```bash
# On your machine
npm run build

# Creates: .next/standalone/ directory
# This is a complete, self-contained app
```

### Step 2: Copy to VPS
```bash
# Push the standalone build to VPS
rsync -avz --delete .next/standalone/ \
  root@76.13.124.74:/var/www/ats-app/.next/standalone/
```

### Step 3: Copy Secrets
```bash
# The VPS has .env.local in the parent directory
# Copy it into the standalone directory
cp /var/www/ats-app/.env.local \
   /var/www/ats-app/.next/standalone/.env.local
```

### Step 4: Restart
```bash
pm2 restart ats-resume-analyzer
```

---

## 🔍 Finding Things on the VPS

### The App Code
```
/var/www/ats-app/.next/standalone/.next/
```

### Environment Variables
```
/var/www/ats-app/.next/standalone/.env.local
```

### Logs
```bash
pm2 logs ats-resume-analyzer
```

### Database Schema
```
/var/www/ats-app/prisma/schema.prisma
```

### Documentation
```
/var/www/ats-app/DOCUMENTATION.md
/var/www/ats-app/VPS_SETUP_GUIDE.md
/var/www/ats-app/VPS_QUICK_REFERENCE.md
```

---

## 💾 What's NOT on the VPS

- ❌ Source TypeScript files (`.tsx`, `.ts`)
- ❌ Source Next.js config (`next.config.ts`)
- ❌ Development dependencies
- ❌ Build cache

These aren't needed because the `standalone` build already includes the compiled output.

---

## 🆘 Common Issues

### "App won't start"
Check if `.env.local` exists in `.next/standalone/`:
```bash
ssh root@76.13.124.74 'ls -la /var/www/ats-app/.next/standalone/.env.local'
```

If it doesn't exist:
```bash
ssh root@76.13.124.74 'cp /var/www/ats-app/.env.local /var/www/ats-app/.next/standalone/.env.local'
```

### "502 Bad Gateway"
The app may have crashed. Check logs:
```bash
pm2 logs ats-resume-analyzer --err
```

### "Out of disk space"
Check usage:
```bash
df -h
```

To clean old builds:
```bash
rm -rf /var/www/ats-app/.next.backup/
```

---

## 📈 Deployment Size Breakdown

| Component | Size | Can Remove? |
|-----------|------|------------|
| `node_modules/` | 1.5 GB | ❌ No - app needs these |
| `.next/` compiled code | 100 MB | ❌ No - core app |
| `public/` static files | 50 MB | ⚠️ Only if not used |
| `.env.local` | 2 KB | ❌ No - secrets needed |
| Other configs | 50 MB | ✅ Yes, if not needed |

---

## 🎯 Everything You Need to Know

1. **The app runs from:** `/var/www/ats-app/.next/standalone/`
2. **PM2 starts:** `start.js` (which loads and starts `server.js`)
3. **Secrets are in:** `.env.local` (must be in the standalone directory!)
4. **Documentation is in:** `/var/www/ats-app/*.md` files
5. **To deploy:** Build locally → rsync to VPS → restart PM2

That's it! Your entire production application is in that `.next/standalone/` directory.

---

*Last updated: February 2026*
