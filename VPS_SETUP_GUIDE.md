# VPS Setup & File Structure Guide

**VPS Details:**
- **Host:** Hostinger
- **IP:** 76.13.124.74
- **OS:** AlmaLinux 10
- **Root Password:** `Avinash@96185`
- **Domain:** resumeoptimizer.online (Caddy reverse proxy on port 80/443)

---

## VPS File Structure

```
/var/www/ats-app/                          # Root application directory
├── .env                                   # Build-time env (committed)
├── .env.local                             # Runtime env (secrets, not committed)
├── package.json                           # Node.js dependencies
├── server.js                              # Old server entry (not used anymore)
├── start.js                               # PM2 entry point (polyfills DOMMatrix)
├── DOCUMENTATION.md                       # Complete technical docs (on VPS!)
│
├── .next/                                 # Next.js build output
│   ├── standalone/                        # Production-ready standalone build
│   │   ├── .env                          # Copy of env vars
│   │   ├── .env.local                    # Runtime secrets (MUST EXIST!)
│   │   ├── node_modules/                 # Dependencies bundled
│   │   ├── public/                       # Static files (images, fonts, etc.)
│   │   ├── .next/                        # Compiled Next.js code
│   │   ├── package.json
│   │   ├── server.js                     # Next.js server
│   │   ├── start.js                      # PM2 wrapper with polyfills
│   │   └── start-server.js
│   └── backup/                           # Previous deployment backup
│
├── node_modules/                         # Local dependencies (for development)
├── public/                               # Source static files
├── prisma/                               # Database schema (if needed)
│
└── [Other files from repo...]
```

---

## How Everything Works

### 1. Build Process (Locally)

```bash
# In your local machine (/Users/avinashamudala/Documents/ATS Resume Analyzer/...)
npm run build

# Creates: /path/to/project/.next/standalone/
# This is a self-contained Next.js server that doesn't need node_modules or source code
```

### 2. Deployment (Local → VPS)

```bash
# Copy standalone build to VPS
sshpass -p 'Avinash@96185' rsync -avz --delete .next/standalone/ \
  root@76.13.124.74:/var/www/ats-app/.next/standalone/

# Copy env file to standalone
ssh root@76.13.124.74 'cp /var/www/ats-app/.env.local /var/www/ats-app/.next/standalone/.env.local'

# Restart PM2
ssh root@76.13.124.74 'pm2 restart ats-resume-analyzer'
```

### 3. PM2 Process Management (On VPS)

**Location:** `/var/www/ats-app/.next/standalone/start.js`

**What it does:**
1. Polyfills `DOMMatrix`, `Path2D`, `ImageData` for pdf-parse
2. Loads `.env.local` from current directory
3. Starts Next.js server on port 3000

**PM2 ecosystem config:**
```
ecosystem.config.cjs
  └── apps[0]:
      name: "ats-resume-analyzer"
      script: "start.js" (in .next/standalone/)
      cwd: ".next/standalone"
      instances: 1
      exec_mode: "fork"
      env:
        NODE_ENV: "production"
```

### 4. Reverse Proxy (Caddy)

**Location:** `/etc/caddy/Caddyfile`

```
resumeoptimizer.online {
    reverse_proxy localhost:3000
}
```

Maps:
- https://resumeoptimizer.online → localhost:3000 (PM2)
- Auto-renews SSL certs
- Handles gzip compression

---

## Environment Variables

### `.env.local` (Runtime Secrets)
**Location:** `/var/www/ats-app/.next/standalone/.env.local`

This file is **NOT** in git. Contains:
```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://...@neon.tech/...

# AI
GEMINI_API_KEY=AIza...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Ads (optional)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
```

**⚠️ CRITICAL:** If `.env.local` is missing from `.next/standalone/`, the app will fail with:
- "Missing secretKey" errors from Clerk
- Database connection errors
- AI API failures

### `.env` (Committed)
**Location:** `/var/www/ats-app/.env`

Contains non-secret defaults:
```env
NEXT_PUBLIC_APP_URL=https://resumeoptimizer.online
```

### `NEXT_PUBLIC_*` Variables
These are **baked into the build at compile time**. To change them:
1. Update `NEXT_PUBLIC_*` vars locally
2. Run `npm run build`
3. Redeploy `.next/standalone/` to VPS

---

## Key Files on VPS

| File | Location | Purpose |
|------|----------|---------|
| **App Binary** | `.next/standalone/server.js` | Next.js production server |
| **PM2 Entry** | `.next/standalone/start.js` | Polyfills + server start |
| **Documentation** | `/var/www/ats-app/DOCUMENTATION.md` | Technical reference |
| **Environment** | `.next/standalone/.env.local` | Runtime secrets (NOT in git) |
| **Static Files** | `.next/standalone/public/` | Images, fonts, etc. |
| **Compiled Code** | `.next/standalone/.next/` | Next.js build output |
| **Dependencies** | `.next/standalone/node_modules/` | npm packages (bundled) |

---

## Common VPS Operations

### Check Status
```bash
sshpass -p 'Avinash@96185' ssh root@76.13.124.74 'pm2 status'
```

### View Logs
```bash
sshpass -p 'Avinash@96185' ssh root@76.13.124.74 'pm2 logs ats-resume-analyzer --lines 50'
```

### Restart App
```bash
sshpass -p 'Avinash@96185' ssh root@76.13.124.74 'pm2 restart ats-resume-analyzer'
```

### View Running Processes
```bash
sshpass -p 'Avinash@96185' ssh root@76.13.124.74 'ps aux | grep node'
```

### Check Disk Space
```bash
sshpass -p 'Avinash@96185' ssh root@76.13.124.74 'df -h'
```

### SSH Into VPS (Interactive)
```bash
ssh root@76.13.124.74
# Password: Avinash@96185
```

---

## Deployment Checklist

Before deploying, verify:

- [ ] Build succeeds locally: `npm run build`
- [ ] All tests pass: `npm test` (if any)
- [ ] `.env.local` exists on VPS with all secrets
- [ ] Database is online: `psql $DATABASE_URL -c "SELECT 1"`
- [ ] Clerk keys are valid
- [ ] Stripe keys are configured
- [ ] Gemini API key is active

---

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs ats-resume-analyzer --err

# Common causes:
# 1. Missing .env.local in .next/standalone/
# 2. Invalid DATABASE_URL
# 3. Clerk keys not in .env.local
```

### Port 3000 already in use
```bash
# Kill the process
pm2 kill
pm2 restart ats-resume-analyzer
```

### 502 Bad Gateway from Caddy
```bash
# Check if app is running
curl localhost:3000/api/health

# If down, restart
pm2 restart ats-resume-analyzer
```

### Database connection fails
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# If fails, check:
# 1. DATABASE_URL is correct
# 2. Database is online (Neon)
# 3. Network access is allowed
```

---

## File Sizes (Approximate)

| Item | Size |
|------|------|
| `.next/standalone/` (full) | ~400 MB |
| `node_modules/` | ~1.5 GB |
| All source code | ~50 MB |
| **Total deployment** | **~1.9 GB** |

---

## Important Notes

1. **The `.env.local` must exist in `.next/standalone/`** - it won't inherit from parent directories in standalone mode
2. **Build-time secrets** go in `NEXT_PUBLIC_*` - they're visible to users
3. **Runtime secrets** go in `.env.local` - they stay server-side only
4. **node_modules is bundled** - no need to run `npm install` on VPS
5. **Everything is in `/var/www/ats-app/.next/standalone/`** - that's the complete deployment

---

## Next Steps

1. **Ensure DOCUMENTATION.md is on VPS:**
   ```bash
   sshpass -p 'Avinash@96185' scp DOCUMENTATION.md root@76.13.124.74:/var/www/ats-app/
   ```

2. **View docs on VPS:**
   ```bash
   sshpass -p 'Avinash@96185' ssh root@76.13.124.74 'cat /var/www/ats-app/DOCUMENTATION.md | head -50'
   ```

3. **Set up automated backups** (optional):
   ```bash
   # On VPS: add cron job to backup .next/standalone/ daily
   ```

---

*Generated: February 2026*
