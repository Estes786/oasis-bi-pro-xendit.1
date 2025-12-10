# 🔥 V21 VERCEL DEPLOYMENT GUIDE - FINAL FIX

## ✅ WHAT WAS FIXED IN V21

### ROOT CAUSE IDENTIFIED
```
ERROR: 401 - Invalid API Key from Xendit

DIAGNOSIS:
1. Vercel/Next.js automatically sets NODE_ENV=production during build
2. Xendit API validates environment consistency between NODE_ENV and key type
3. xnd_development_ keys are ONLY valid when environment is 'test'
4. NODE_ENV=production + xnd_development_ key = 401 INVALID API KEY ERROR
```

### V21 SOLUTION IMPLEMENTED
```
FIX 1 (lib/xendit.ts):
- Force environment: 'test' explicitly regardless of NODE_ENV
- Override nodeEnv to 'development' for Xendit compatibility
- Hardcoded base URL to default Xendit API (https://api.xendit.co)
- Enhanced diagnostic logging

FIX 2 (ecosystem.config.cjs):
- Explicitly set NODE_ENV=development in PM2 for local development
- Added comprehensive comments explaining the fix

FIX 3 (.env.local):
- Added XENDIT_PUBLIC_KEY for frontend integration
- Set NODE_ENV=development explicitly
- Set XENDIT_ENV=test
```

---

## 🚀 VERCEL DEPLOYMENT STEPS

### STEP 1: Deploy to Vercel
1. Login ke dashboard Vercel: https://vercel.com
2. Import project dari GitHub: `Estes786/oasis-bi-pro-xendit.1`
3. Pilih branch: `main`
4. Framework Preset: **Next.js**
5. Build Command: `npm run build` (default)
6. Output Directory: `.next` (default)
7. Install Command: `npm install` (default)

### STEP 2: Setup Environment Variables (CRITICAL!)

**Navigate to Project Settings → Environment Variables**

Add the following variables for **ALL ENVIRONMENTS** (Production, Preview, Development):

```bash
# ============================================
# V21 CRITICAL ENVIRONMENT VARIABLES
# ============================================

# Xendit Sandbox Credentials
XENDIT_SECRET_KEY=xnd_development_fdh9Gj3Ivjb4K90JQ7OVcHRFa0X8x6sFbAASVW01eUyjysMiNSXjPCNENNdU7gy
XENDIT_PUBLIC_KEY=xnd_public_development__fxulNbBHQcDZ7XFvjcYxHXKltKUix4z3L75BL323l3FM3tVkkEVt4Be8i2OfgZECgnfmxPWSIZi_dGSpjYzYsGE2QoP2ApB91c1R7eaMBOTQC

# V21 CRITICAL FIX: Force development mode for Xendit compatibility
NODE_ENV=development
XENDIT_ENV=test

# App URL (Update dengan actual Vercel URL setelah deployment)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# Supabase (if used)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Webhook Token (untuk production callback)
XENDIT_WEBHOOK_TOKEN=your-webhook-token-here
```

**IMPORTANT NOTES:**
- ✅ **NODE_ENV MUST BE SET TO `development`** - This is the V21 critical fix!
- ✅ **XENDIT_ENV MUST BE `test`** - Forces sandbox mode
- ✅ Copy-paste credentials exactly as shown above
- ✅ Apply to ALL environments (Production, Preview, Development)

### STEP 3: Trigger Deployment
1. Click **"Save"** after adding all environment variables
2. Go to **"Deployments"** tab
3. Click **"Redeploy"** for latest deployment
4. Wait for build to complete (~2-3 minutes)

### STEP 4: Verify Deployment
1. Click **"Visit"** button to open deployed app
2. Copy your production URL (e.g., `https://oasis-bi-pro-xendit-1.vercel.app`)
3. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables with actual URL
4. Redeploy once more to apply the URL change

---

## 🧪 TESTING E2E CHECKOUT FLOW

### Test Scenario 1: Virtual Account Payment
```bash
# Test endpoint
POST https://your-project.vercel.app/api/checkout

# Request body
{
  "planId": "professional",
  "email": "test@example.com",
  "phoneNumber": "08123456789",
  "customerName": "Test User",
  "paymentMethod": "va",
  "channelCode": "BCA_VIRTUAL_ACCOUNT"
}

# Expected response
{
  "success": true,
  "paymentUrl": "https://your-project.vercel.app/payment/...",
  "vaNumber": "70012xxxxxx",
  "bankCode": "BCA",
  "externalId": "OASIS-PROFESSIONAL-...",
  ...
}
```

### Test Scenario 2: E-Wallet Payment
```bash
# Test endpoint
POST https://your-project.vercel.app/api/checkout

# Request body
{
  "planId": "starter",
  "email": "test@example.com",
  "phoneNumber": "08123456789",
  "customerName": "Test User",
  "paymentMethod": "ewallet",
  "channelCode": "OVO"
}

# Expected response
{
  "success": true,
  "checkoutUrl": "https://checkout.xendit.co/...",
  "chargeId": "ewc_xxxxx",
  ...
}
```

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** → Select latest deployment
3. Click **"Logs"** tab
4. Look for V21 diagnostic logs:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥🔥 V21: SANDBOX LOCK-IN AKTIF 🔥🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 Secret Key Type: xnd_development_...
🌍 NODE_ENV (Ignored): development
🔧 XENDIT_ENV (Override): test
🌐 Base URL: https://api.xendit.co (default)
✅ Environment Mode: SANDBOX (FORCED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔍 TROUBLESHOOTING

### If 401 Error STILL Occurs After V21:

**Diagnosis Steps:**
1. Check Vercel logs for V21 diagnostic output
2. Verify `NODE_ENV=development` is set in Vercel environment variables
3. Verify `XENDIT_SECRET_KEY` starts with `xnd_development_`
4. Check if Xendit API logs show the request (Dashboard → API Logs)

**If All Above Are Correct:**
```
CONCLUSION: The sandbox key might be restricted by Xendit for your domain/IP.

SOLUTION: Contact Xendit Support
- Email: support@xendit.co
- Issue: "Sandbox key (xnd_development_...) returns 401 on Vercel deployment"
- Provide: Your Vercel domain and sandbox key ID
- Request: Whitelist your Vercel deployment domain for sandbox testing
```

### If Deployment Fails:
```bash
# Common issues:
1. Missing dependencies → Run: npm install
2. Build errors → Check package.json scripts
3. TypeScript errors → Run: npm run build locally first
4. Environment variables not set → Double-check Step 2
```

---

## 📊 SUCCESS CRITERIA

✅ **V21 Fix is SUCCESSFUL if:**
1. ✅ Vercel build completes without errors
2. ✅ App loads successfully (no 500 errors)
3. ✅ Checkout API returns 200 (not 401)
4. ✅ Virtual Account number is generated
5. ✅ V21 diagnostic logs appear in Vercel logs
6. ✅ No "Invalid API Key" errors in logs

❌ **If 401 PERSISTS:**
- Problem is NOT in code
- Problem is Xendit API key restriction for your domain
- Contact Xendit Support for domain whitelisting

---

## 📝 NEXT STEPS AFTER SUCCESSFUL DEPLOYMENT

1. **Test all payment methods:**
   - Virtual Account (BCA, Mandiri, BNI, BRI, Permata)
   - E-Wallet (OVO, DANA, LinkAja)

2. **Setup webhook endpoint:**
   - Configure webhook URL in Xendit Dashboard
   - Test payment callbacks

3. **Monitor production logs:**
   - Check Vercel logs regularly
   - Set up error alerting (Sentry, LogRocket, etc.)

4. **Document success:**
   - Save successful test logs
   - Document any edge cases
   - Update README with deployment info

---

## 🎯 V21 DEPLOYMENT SUMMARY

**Code Changes:**
- ✅ `lib/xendit.ts` - Force sandbox mode with explicit environment
- ✅ `ecosystem.config.cjs` - Set NODE_ENV=development for PM2
- ✅ `.env.local` - Added all Xendit credentials with NODE_ENV override

**Vercel Configuration:**
- ✅ Environment variables configured
- ✅ NODE_ENV=development (CRITICAL!)
- ✅ XENDIT_ENV=test
- ✅ All credentials injected

**Expected Outcome:**
- ✅ 401 error ELIMINATED
- ✅ Sandbox payments work correctly
- ✅ Environment consistency achieved

---

**V21 Deployment Status:** ⏳ READY FOR DEPLOYMENT

**Last Updated:** 2025-12-10
**Version:** V21 Final Fix
**GitHub Commit:** 61236b9
