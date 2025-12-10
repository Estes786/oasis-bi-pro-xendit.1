# 🚀 VERCEL QUICK SETUP - V21 FIX

## ⚡ RAPID DEPLOYMENT (5 MENIT)

### STEP 1: Deploy ke Vercel
```
1. Login: https://vercel.com
2. New Project → Import Git Repository
3. GitHub: Estes786/oasis-bi-pro-xendit.1
4. Branch: main
5. Click: Deploy
```

### STEP 2: Add Environment Variables
**Go to: Project Settings → Environment Variables**

**COPY-PASTE INI (ALL ENVIRONMENTS):**
```
XENDIT_SECRET_KEY
xnd_development_fdh9Gj3Ivjb4K90JQ7OVcHRFa0X8x6sFbAASVW01eUyjysMiNSXjPCNENNdU7gy

XENDIT_PUBLIC_KEY
xnd_public_development__fxulNbBHQcDZ7XFvjcYxHXKltKUix4z3L75BL323l3FM3tVkkEVt4Be8i2OfgZECgnfmxPWSIZi_dGSpjYzYsGE2QoP2ApB91c1R7eaMBOTQC

NODE_ENV
development

XENDIT_ENV
test

NEXT_PUBLIC_APP_URL
https://your-project-name.vercel.app
```

**⚠️ CRITICAL: NODE_ENV MUST BE 'development'**

### STEP 3: Redeploy
```
Deployments → Latest → Redeploy
```

### STEP 4: Test
```bash
curl -X POST https://your-project.vercel.app/api/xendit/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "professional",
    "email": "test@example.com",
    "phoneNumber": "08123456789",
    "customerName": "Test User",
    "paymentMethod": "va",
    "bankCode": "BCA"
  }'
```

**Expected:** 200 OK + VA Number ✅

---

## 🔍 CHECK LOGS

**Vercel Dashboard → Deployments → Logs**

**Look for:**
```
🔥🔥 V21: SANDBOX LOCK-IN AKTIF 🔥🔥
✅ Environment Mode: SANDBOX (FORCED)
```

**If you see this:** SUCCESS! ✅

---

## ❌ IF 401 ERROR OCCURS

**1. Verify Environment Variables:**
- Go to Vercel Settings → Environment Variables
- Confirm `NODE_ENV=development` is set
- Confirm all Xendit keys are correct

**2. Check Logs:**
- Look for V21 diagnostic output
- Check if keys are being loaded

**3. If Still 401:**
- Problem: Xendit key restriction for your domain
- Solution: Contact support@xendit.co
- Request: Whitelist Vercel domain for sandbox key

---

## 📚 FULL DOCUMENTATION

- Complete Guide: `V21_VERCEL_DEPLOYMENT_GUIDE.md`
- Full Summary: `V21_DEPLOYMENT_SUMMARY.md`
- GitHub: https://github.com/Estes786/oasis-bi-pro-xendit.1

---

**V21 READY FOR DEPLOYMENT** 🔥
