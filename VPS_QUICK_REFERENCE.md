# VPS Quick Reference Card

## 🎯 Quick Commands

### Access VPS
```bash
ssh root@76.13.124.74
# Password: Avinash@96185
```

### Check Status
```bash
pm2 status                          # All processes
pm2 logs ats-resume-analyzer        # App logs
curl https://resumeoptimizer.online/api/health  # Health check
```

### Deploy Code
```bash
# From your local machine:
npm run build
sshpass -p 'Avinash@96185' rsync -avz --delete .next/standalone/ \
  root@76.13.124.74:/var/www/ats-app/.next/standalone/
ssh root@76.13.124.74 'cp /var/www/ats-app/.env.local /var/www/ats-app/.next/standalone/.env.local'
pm2 restart ats-resume-analyzer
```

### View Docs
```bash
# Comprehensive docs
cat /var/www/ats-app/DOCUMENTATION.md

# VPS setup guide
cat /var/www/ats-app/VPS_SETUP_GUIDE.md
```

---

## 📍 File Locations on VPS

| What | Where |
|------|-------|
| **Running App** | `/var/www/ats-app/.next/standalone/` |
| **Source Repo** | `/var/www/ats-app/` |
| **PM2 Entry** | `.next/standalone/start.js` |
| **Environment** | `.next/standalone/.env.local` |
| **Logs** | `pm2 logs` command |
| **Documentation** | `/var/www/ats-app/*.md` |
| **Static Files** | `.next/standalone/public/` |

---

## ⚙️ Environment Variables Needed

These **MUST** exist in `/var/www/ats-app/.next/standalone/.env.local`:

```
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
GEMINI_API_KEY=AIza...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Optional:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...  # Google Analytics
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...  # Google AdSense
```

---

## 🔧 Common Tasks

### Restart App
```bash
pm2 restart ats-resume-analyzer
```

### Stop App
```bash
pm2 stop ats-resume-analyzer
```

### View Last 50 Lines of Logs
```bash
pm2 logs ats-resume-analyzer --lines 50
```

### View Error Logs Only
```bash
pm2 logs ats-resume-analyzer --err
```

### Check Disk Space
```bash
df -h
```

### List All Files
```bash
ls -lah /var/www/ats-app/
ls -lah /var/www/ats-app/.next/standalone/
```

### Check Database Connection
```bash
psql $DATABASE_URL -c "SELECT 1"
```

---

## 🚀 Deployment Workflow

1. **Develop & Test Locally**
   ```bash
   npm run dev
   npm run build
   ```

2. **Build Production Bundle**
   ```bash
   npm run build
   ```

3. **Deploy to VPS**
   ```bash
   sshpass -p 'Avinash@96185' rsync -avz --delete .next/standalone/ \
     root@76.13.124.74:/var/www/ats-app/.next/standalone/
   ```

4. **Copy Secrets & Restart**
   ```bash
   ssh root@76.13.124.74 'cp /var/www/ats-app/.env.local /var/www/ats-app/.next/standalone/.env.local'
   pm2 restart ats-resume-analyzer
   ```

5. **Verify**
   ```bash
   curl https://resumeoptimizer.online/api/health
   pm2 logs ats-resume-analyzer --lines 20
   ```

---

## 📊 Monitoring

### Real-Time Logs
```bash
sshpass -p 'Avinash@96185' ssh root@76.13.124.74 'pm2 logs ats-resume-analyzer'
```

### Analytics
- **Google Analytics:** https://analytics.google.com
- **Internal API:** `GET /api/admin/analytics` (admin only)

### Health Check
```bash
curl -I https://resumeoptimizer.online/api/health
```

---

## 🔐 Security Headers

All requests return:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| App won't start | Check `pm2 logs`, verify `.env.local` exists in `.next/standalone/` |
| 502 Bad Gateway | Run `pm2 restart ats-resume-analyzer` |
| Database errors | Verify `DATABASE_URL` in `.env.local` |
| Clerk errors | Check `CLERK_SECRET_KEY` in `.env.local` |
| AI errors | Verify `GEMINI_API_KEY` in `.env.local` |
| Out of disk | Run `df -h` and clean old backups |

---

## 📚 Full Documentation

- **DOCUMENTATION.md** - Complete technical reference
- **VPS_SETUP_GUIDE.md** - Detailed VPS setup & structure
- **GitHub** - https://github.com/Avinash-Amudala/ATS-Resume-Analyzer

---

## 📈 Key Metrics

| Metric | Value |
|--------|-------|
| **Deployment Size** | ~400 MB |
| **Node Modules** | ~1.5 GB |
| **App Port** | 3000 |
| **Public Domain** | https://resumeoptimizer.online |
| **VPS IP** | 76.13.124.74 |
| **Process Manager** | PM2 |
| **Reverse Proxy** | Caddy |

---

## 🔑 Credentials

| Service | Details |
|---------|---------|
| **VPS SSH** | root@76.13.124.74, password: Avinash@96185 |
| **Clerk** | Dashboard: https://dashboard.clerk.com |
| **Stripe** | Dashboard: https://dashboard.stripe.com |
| **Database** | Neon: https://console.neon.tech |
| **GitHub** | https://github.com/Avinash-Amudala/ATS-Resume-Analyzer |

---

*Last updated: February 2026*
