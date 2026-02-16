# AI Engine Cost Comparison for ATS Resume Analyzer
## Updated: February 2026

---

## THE MATH: What Happens Per Resume Optimization

Every time a user clicks "Optimize My Resume", your app sends:
- **Input:** ~2,000 tokens (resume text + JD text + system prompt)
- **Output:** ~1,500 tokens (rewritten summary + bullets + skills)
- **Total:** ~3,500 tokens per optimization

---

## COMPLETE PRICE COMPARISON (Per 1M Tokens)

| Provider | Model | Input $/1M | Output $/1M | Cost Per Optimization | Quality (Resume Tasks) |
|----------|-------|-----------|-------------|----------------------|----------------------|
| Google | **Gemini 2.5 Flash** | $0.15 | $0.60 | **$0.0012** | Very Good |
| Google | Gemini 2.0 Flash-Lite | $0.075 | $0.30 | **$0.0006** | Good |
| Google | Gemini 2.5 Pro | $1.25 | $10.00 | **$0.0175** | Excellent |
| OpenAI | GPT-4o-mini | $0.15 | $0.60 | **$0.0012** | Good |
| OpenAI | GPT-4o | $2.50 | $10.00 | **$0.0175** | Excellent |
| Anthropic | Claude Haiku 4.5 | $0.80 | $4.00 | **$0.0076** | Good |
| Anthropic | **Claude Sonnet 4.5** | $3.00 | $15.00 | **$0.0285** | Excellent |
| DeepSeek | DeepSeek-V3 | $0.27 | $1.10 | **$0.0022** | Good |
| DeepSeek | DeepSeek-R1 | $0.55 | $2.19 | **$0.0044** | Very Good |

---

## MY RECOMMENDATION: Tiered Strategy (Spend Almost Nothing)

### Strategy: Use 3 tiers of models for different tasks

**TIER 1 — FREE/Near-Free (For ATS Scoring - runs on EVERY scan)**
Use: NO AI at all. Pure Python/JavaScript rule-based logic.
Cost: $0.00
This handles: Keyword matching, formatting checks, contact parsing, section detection, spam detection.
This is what the free tier uses. No API calls needed.

**TIER 2 — Cheap AI (For basic rewrites - Pro users)**
Use: Gemini 2.5 Flash ($0.0012/optimization)
Cost at 1,000 users doing 10 optimizations each: $12/month
This handles: Summary rewriting, bullet optimization, skills restructuring.

**TIER 3 — Premium AI (For "Deep Optimize" - Pro users, limited)**
Use: Gemini 2.5 Pro OR Claude Sonnet ($0.017-0.028/optimization)
Cost at 200 heavy users doing 5 deep optimizations: $17-28/month
This handles: Full resume rewrite, cover letter generation, JD deep analysis.

### TOTAL MONTHLY AI COST: ~$30-50 (at 1,000 Pro users)
### vs. MONTHLY REVENUE: ~$9,500 (at 500 Pro users x $19)

---

## WINNER: Google Gemini 2.5 Flash

### Why Gemini 2.5 Flash is the best choice for your MVP:

1. **FREE TIER EXISTS**: 1,000 requests/day free on Flash-Lite, 500/day on Flash
   - You can prototype and test without spending a single dollar
   - Your first 100-500 users cost you literally $0 in AI

2. **Insanely cheap at scale**: $0.0012 per resume optimization
   - 10,000 optimizations = $12
   - Compare to Claude Sonnet: 10,000 optimizations = $285

3. **Quality is very good for structured tasks**: Resume rewriting is a structured, template-like task. 
   You're not asking for creative fiction — you're asking "rewrite this bullet to include these keywords."
   Gemini Flash handles this extremely well.

4. **Fast**: Flash models are optimized for speed — users get results in 2-3 seconds, not 8-10.

5. **Simple API**: Google AI Studio gives you an API key in 30 seconds. No billing setup needed for free tier.

---

## HOW TO GET GEMINI API KEY (Free, 2 minutes)

1. Go to: https://aistudio.google.com
2. Sign in with your Google account
3. Click "Get API Key" in left sidebar
4. Click "Create API Key"
5. Copy and save your key
6. That's it. No credit card needed. No billing setup.

Free tier limits:
- Gemini 2.5 Flash: 500 requests/day, 15 requests/minute
- Gemini 2.5 Flash-Lite: 1,000 requests/day, 30 requests/minute
- Gemini 2.5 Pro: 50 requests/day, 2 requests/minute

For your MVP with <500 users, the FREE TIER is enough. You won't pay anything.

---

## COST PROJECTION: First 6 Months

| Month | Users | Pro Users (5%) | AI Calls | AI Cost | Revenue | Profit |
|-------|-------|---------------|----------|---------|---------|--------|
| 1 | 50 | 3 | 200 | $0 (free tier) | $57 | $57 |
| 2 | 200 | 10 | 800 | $0 (free tier) | $190 | $190 |
| 3 | 500 | 25 | 2,000 | $2.40 | $475 | $473 |
| 4 | 1,000 | 50 | 5,000 | $6.00 | $950 | $944 |
| 5 | 2,000 | 100 | 12,000 | $14.40 | $1,900 | $1,886 |
| 6 | 5,000 | 250 | 30,000 | $36.00 | $4,750 | $4,714 |

Note: Months 1-2 are completely FREE using Gemini's free tier.

---

## BACKUP PLAN: If Gemini Quality Isn't Good Enough

If you find Gemini Flash isn't producing good enough rewrites (test this yourself), here's your escalation path:

**Option A:** Upgrade to Gemini 2.5 Pro for the rewrite step only ($0.017/call)
**Option B:** Switch to Claude Haiku 4.5 ($0.0076/call) — better quality, still cheap  
**Option C:** Use OpenAI GPT-4o-mini ($0.0012/call) — same price as Gemini Flash
**Option D:** Use DeepSeek-V3 ($0.0022/call) — very cheap, decent quality, but servers are in China (privacy concern for US users)

You can always swap providers later. The API call is just a POST request — changing from Gemini to Claude takes 30 minutes of code changes.

---

## WHAT TO DO RIGHT NOW

1. Go to https://aistudio.google.com
2. Get your free Gemini API key
3. That's it. Total investment: $0

When you outgrow the free tier (>500 requests/day), enable billing. 
Your first real bill will be ~$5-15/month at 1,000+ users.

---

## COMPARISON: What Competitors Pay

- Jobscan (valued at $100M+): Uses custom ML models + OpenAI. Estimated $50K+/month AI costs.
- Resume Worded: Uses GPT-4o. Estimated $5-15K/month at their scale.
- You (at launch): $0/month using Gemini free tier.

This is the advantage of starting now — the AI costs have dropped 90% in the last 12 months.
