# 🔍 V19 Log Verification Checklist

**Quick Reference untuk Testing V19 Environment Lock-in**

---

## ✅ **CRITICAL LOG SIGNATURES TO LOOK FOR**

### **1. Module Load Phase** (saat app start)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 V19 XENDIT CONFIG MODULE LOAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 NODE_ENV at module load: [VALUE]
📦 XENDIT_ENV: [VALUE]
🔑 Secret Key Present: [YES/NO]
🌐 Base URL: [URL]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**PASS Criteria:**
- ✅ NODE_ENV shows correct value (development/production)
- ✅ Secret Key Present: `✅ YES`
- ✅ Secret Key preview starts with `xnd_development_` or `xnd_production_`

**FAIL Criteria:**
- ❌ Secret Key Present: `❌ NO` → Missing env variable
- ❌ Secret Key preview is malformed

---

### **2. Runtime Environment Check** (saat checkout API hit)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 V19 RUNTIME ENVIRONMENT CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Current process.env.NODE_ENV: [VALUE]
📦 Cached XENDIT_CONFIG.nodeEnv: [VALUE]
📦 Environment Match: [✅ CONSISTENT / ❌ MISMATCH]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**PASS Criteria:**
- ✅ Environment Match: `✅ CONSISTENT`
- ✅ Current and Cached values are **identical**

**FAIL Criteria:**
- ❌ Environment Match: `❌ MISMATCH`
- ❌ Current ≠ Cached → **V19 didn't fix the conflict!**

---

### **3. Client Initialization** (saat Xendit client created)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 V19 XENDIT CLIENT INITIALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 NODE_ENV (from config): [VALUE]
📦 NODE_ENV (from process): [VALUE]
📦 XENDIT_ENV: [VALUE]
🔑 Secret Key Type: [✅ SANDBOX / ⚠️ PRODUCTION / ❌ INVALID FORMAT]
🔑 Secret Key Preview: [KEY_PREVIEW]
✅ V19 CLIENT VALIDATION: PASSED
   Final NODE_ENV Used: [VALUE]
   Environment Lock-in: [✅ STABLE / ⚠️ DYNAMIC]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**PASS Criteria:**
- ✅ Both NODE_ENV values are **identical**
- ✅ Secret Key Type: `✅ SANDBOX` (for dev) or `⚠️ PRODUCTION` (for prod)
- ✅ `V19 CLIENT VALIDATION: PASSED`
- ✅ Environment Lock-in: `✅ STABLE`

**FAIL Criteria:**
- ❌ NODE_ENV values **differ** → Still a conflict!
- ❌ Secret Key Type: `❌ INVALID FORMAT` → Wrong key
- ❌ Environment Lock-in: `⚠️ DYNAMIC` → Unstable state

---

### **4. Xendit API Call** (VA/E-Wallet creation)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔵 V19 XENDIT CREATE VIRTUAL ACCOUNT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Request Data: [DATA]
📦 Request ID: [ID]
📤 Xendit API Request Body: [BODY]
📥 Xendit Response: [RESPONSE]
   Status Code: [CODE]
✅ Virtual Account Created Successfully
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**PASS Criteria:**
- ✅ Status Code: `200` or `201`
- ✅ `✅ Virtual Account Created Successfully` appears
- ✅ No error logs follow

**FAIL Criteria:**
- ❌ Status Code: `401` → Auth failure (wrong key)
- ❌ Status Code: `500` → Server error (still persists!)
- ❌ `💥 V19 XENDIT VA CREATION ERROR` appears

---

## 🚨 **RED FLAGS TO WATCH FOR**

### **🔴 FATAL: Environment Still Mismatched**
```
📦 Environment Match: ❌ MISMATCH
```
→ **V19 failed to lock environment**  
→ **Next Step:** Check if ecosystem.config.cjs was actually updated  
→ **Verify:** `NODE_ENV` is NOT in ecosystem config

---

### **🔴 FATAL: Secret Key Missing**
```
🚨 FATAL V19: XENDIT_SECRET_KEY MISSING!
```
→ **V19 detected missing key**  
→ **Next Step:** Verify `.env` file exists and is loaded  
→ **Check:** Environment variable injection in deployment platform

---

### **🔴 FATAL: Invalid Key Format**
```
🚨 FATAL V19: INVALID XENDIT KEY FORMAT!
```
→ **V19 detected malformed key**  
→ **Next Step:** Verify key starts with `xnd_development_` or `xnd_production_`  
→ **Check:** No extra spaces or line breaks in `.env` file

---

### **🔴 FATAL: Production Key in Development**
```
🚫 FATAL V19: PRODUCTION KEY BLOCKED IN DEVELOPMENT MODE
```
→ **V19 safety lock activated**  
→ **Next Step:** Use sandbox key (`xnd_development_`) for testing  
→ **Critical:** Production keys can cause **real charges**!

---

### **🔴 WARNING: Old NODE_ENV Override Message Still Appears**
```
Warning: NODE_ENV was incorrectly set to "development", this value is being overridden to "production"
```
→ **V19 fix NOT applied yet!**  
→ **Next Step:** Verify deployment actually pulled V19 code  
→ **Check:** `git log` shows commit `53d9afa` is deployed

---

## 📊 **V19 SUCCESS vs FAILURE Matrix**

| Scenario | Module Load | Runtime Check | Client Init | API Call | Status |
|----------|-------------|---------------|-------------|----------|--------|
| **✅ V19 SUCCESS** | Key present | ✅ CONSISTENT | ✅ STABLE | 200 OK | **FIXED** |
| **❌ Still Broken #1** | Key present | ❌ MISMATCH | ⚠️ DYNAMIC | 500 Error | **ENV CONFLICT** |
| **❌ Still Broken #2** | Key present | ✅ CONSISTENT | ✅ STABLE | 401 Unauthorized | **WRONG KEY** |
| **❌ Still Broken #3** | Key present | ✅ CONSISTENT | ✅ STABLE | 500 Error | **OTHER ISSUE** |
| **❌ Config Error** | ❌ Key missing | N/A | N/A | N/A | **ENV NOT LOADED** |

---

## 🎯 **Quick Command Reference**

### **For PM2 Deployments:**
```bash
# View V19-specific logs:
pm2 logs oasis-bi-xendit --lines 200 | grep "V19"

# View all logs (for context):
pm2 logs oasis-bi-xendit --nostream

# Restart app to see module load logs:
pm2 restart oasis-bi-xendit
```

### **For Next.js/Vercel Deployments:**
```bash
# Check deployment logs:
vercel logs --follow

# Filter for V19 signatures:
vercel logs | grep "V19"
```

### **For Docker Deployments:**
```bash
# Follow container logs:
docker logs -f oasis-bi-xendit | grep "V19"

# Get last 200 lines:
docker logs --tail 200 oasis-bi-xendit
```

### **For Traditional Node Deployments:**
```bash
# Follow application logs:
tail -f /var/log/oasis-bi-xendit/app.log | grep "V19"

# Search recent logs:
grep "V19" /var/log/oasis-bi-xendit/app.log | tail -50
```

---

## 📋 **Copy-Paste Testing Checklist**

Test checkout flow and paste log output untuk setiap phase:

```
[ ] 1. Module Load Phase - Paste log output here:


[ ] 2. Runtime Environment Check - Paste log output here:


[ ] 3. Client Initialization - Paste log output here:


[ ] 4. Xendit API Call - Paste log output here:


[ ] 5. Final Result (Success/Error) - Paste log output here:


```

---

## 🚀 **Expected V19 Happy Path**

If V19 works correctly, you should see this **exact sequence**:

1. ✅ Module load shows key present
2. ✅ Runtime check shows `CONSISTENT`
3. ✅ Client init shows `STABLE`
4. ✅ API call returns `200 OK`
5. ✅ Success message appears
6. ❌ NO warning about NODE_ENV override

**Full happy path log signature:**
```
🔧 V19 XENDIT CONFIG MODULE LOAD → ✅ Key Present
🔍 V19 RUNTIME ENVIRONMENT CHECK → ✅ CONSISTENT
🔐 V19 XENDIT CLIENT INITIALIZATION → ✅ STABLE
🔵 V19 XENDIT CREATE VIRTUAL ACCOUNT → ✅ 200 OK
```

---

## 🔄 **If V19 Fails**

V19 diagnostic logs will show **exactly where** the failure occurs:

1. **Failure at Module Load** → Environment variable not loaded
2. **Failure at Runtime Check** → NODE_ENV still conflicting
3. **Failure at Client Init** → Key validation failed
4. **Failure at API Call** → Xendit server-side issue or network problem

Each failure point provides **targeted fix** for V20.

---

**Last Updated:** 2025-12-09  
**Version:** V19.0.0  
**Status:** ⏳ Awaiting Production Log Verification
