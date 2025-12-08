# 🚀 OASIS BI PRO - Xendit Edition

> **Business Intelligence SaaS Platform** dengan integrasi pembayaran Xendit

[![Next.js](https://img.shields.io/badge/Next.js-15.5.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Xendit](https://img.shields.io/badge/Xendit-API-orange)](https://xendit.co/)

---

## ✨ Fitur Utama

### 💳 Pembayaran Subscription
- **Virtual Account**: BCA, Mandiri, BNI, BRI, Permata
- **E-Wallet**: OVO, DANA, LinkAja
- **Webhook Otomatis**: X-Callback-Token verification
- **Auto-Activation**: Subscription langsung aktif setelah pembayaran sukses

### 📊 Business Intelligence
- Dashboard interaktif dengan real-time analytics
- Multiple data source connections
- Advanced AI-powered insights
- Custom reporting & visualisasi
- Team collaboration features

### 🔐 Keamanan
- Supabase Authentication (Email/Password, OAuth)
- Row Level Security (RLS) policies
- Xendit webhook token verification
- Encrypted environment variables
- HTTPS-only API communications

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Hooks

### Backend
- **Runtime**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

### Payment Gateway
- **Provider**: Xendit
- **Methods**: Virtual Account, E-Wallet
- **Security**: X-Callback-Token webhook verification
- **Environment**: Test & Production modes

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account (https://supabase.com/)
- Xendit account (https://xendit.co/)

### 1. Clone Repository
```bash
git clone https://github.com/Estes786/oasis-bi-pro-xendit.1.git
cd oasis-bi-pro-xendit.1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your credentials:
# - Xendit Secret Key & Webhook Token
# - Supabase URL & Keys
# - Application URL
```

### 4. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔧 Environment Variables

```bash
# Xendit (Required)
XENDIT_SECRET_KEY=xnd_development_yourSecretKeyHere
XENDIT_WEBHOOK_TOKEN=yourWebhookVerificationTokenHere
XENDIT_ENV=test
XENDIT_BASE_URL=https://api.xendit.co

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel Dashboard
```

### Option 2: Cloudflare Pages
```bash
# Build project
npm run build

# Deploy with Wrangler
wrangler pages deploy .next
```

### Option 3: Self-Hosted
```bash
# Build production bundle
npm run build

# Start server
npm start

# Or use PM2
pm2 start npm --name "oasis-bi-pro" -- start
```

---

## 📡 Xendit Webhook Configuration

1. **Login to Xendit Dashboard**  
   https://dashboard.xendit.co/

2. **Navigate to Webhooks Settings**  
   Settings → Developers → Webhooks

3. **Add Webhook URL**
   ```
   https://your-domain.com/api/xendit/callback
   ```

4. **Copy X-Callback-Token**  
   Copy the generated token and add to `XENDIT_WEBHOOK_TOKEN` environment variable

5. **Test Webhook**  
   Use Xendit's webhook testing tool to verify integration

---

## 🗂️ Project Structure

```
oasis-bi-pro-xendit.1/
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── xendit/
│   │   │   ├── checkout/       # Payment creation endpoint
│   │   │   └── callback/       # Webhook handler
│   │   ├── analytics/
│   │   └── team/
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Main dashboard
│   ├── member/                 # Member area
│   ├── pricing/                # Pricing & plans
│   └── checkout/               # Checkout flow
├── lib/                        # Utility functions
│   ├── xendit.ts               # Xendit API integration
│   ├── supabase-client.ts      # Supabase client
│   └── subscription-service.ts # Subscription logic
├── public/                     # Static assets
├── .env.example                # Environment template
├── .env.local                  # Local configuration (gitignored)
└── package.json                # Dependencies
```

---

## 💰 Subscription Plans

### Starter - Rp 99.000/bulan
- 5 dashboard interaktif
- 10 data source connections
- Basic analytics & reporting
- Email support (24 jam)
- 1 user account

### Professional - Rp 299.000/bulan ⭐ Popular
- 50 dashboard interaktif
- Unlimited data sources
- Advanced AI analytics
- Priority support (12 jam)
- Custom branding
- 5 user accounts
- API access

### Enterprise - Rp 999.000/bulan
- Unlimited dashboards
- Unlimited data sources
- AI-powered insights
- Dedicated support (24/7)
- White-label solution
- Unlimited users
- Full API access
- Custom integrations
- SLA guarantee

---

## 🔄 Migration History

### v2.1.1 - V11 Critical Fix (2025-12-08) 🎉
✅ **XENDIT INTEGRATION FULLY FUNCTIONAL**
- **Root Cause Fixed**: E-Wallet phone format validation
- **Phone Formatter**: Auto-converts 08xxx → +628xxx for Xendit API
- **Enhanced Logging**: Comprehensive error tracking at all layers
- **Frontend Fallback**: Empty state handler for payment methods
- **Test Suite**: Automated validation (`test-v11-checkout.js`)
- **Both Methods Working**: Virtual Account ✅ | E-Wallet ✅
- **Commit**: `03f9631` & `5bddbe0`

**Test Results:**
- ✅ Virtual Account (BCA): VA Number `381659999396851`
- ✅ E-Wallet (OVO): Charge ID `ewc_eab7e9b6-0ba3-4b9f-a08d-5b92f2c4b533`

**Documentation:**
- `AUTONOMOUS_EXECUTION_V11_FINAL_SUCCESS.md` (Full Report)
- `EXECUTIVE_SUMMARY_V11.md` (Executive Summary)
- `QUICK_SUMMARY_V11.md` (Quick Reference)

### v2.1.0 - Xendit Migration (2025-12-05)
✅ **Migrated from Faspay SNAP to Xendit**
- Implemented Xendit Virtual Account & E-Wallet
- Added X-Callback-Token webhook verification
- Updated frontend checkout flow
- Migrated database fields (faspay → xendit)
- Build tested and passed ✅

### v2.0.0 - Faspay SNAP Migration
- Migrated from Duitku to Faspay SNAP
- Implemented VA Dynamic & QRIS
- Added signature verification

### v1.0.0 - Initial Release
- Duitku payment integration
- Basic subscription management

---

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Build Test
```bash
npm run build
```

### E2E Test Payment Flow
1. Go to `/pricing`
2. Select a plan
3. Fill customer information
4. Choose payment method (VA or E-Wallet)
5. Complete payment via Xendit
6. Verify subscription activation in `/member/dashboard`

---

## 📚 Documentation

### Xendit Resources
- **API Docs**: https://docs.xendit.co/
- **Dashboard**: https://dashboard.xendit.co/
- **Webhooks**: https://docs.xendit.co/docs/handling-webhooks
- **Support**: https://help.xendit.co/

### Supabase Resources
- **Docs**: https://supabase.com/docs
- **Dashboard**: https://app.supabase.com/
- **Auth Guide**: https://supabase.com/docs/guides/auth

### Next.js Resources
- **Docs**: https://nextjs.org/docs
- **App Router**: https://nextjs.org/docs/app
- **API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary and confidential.  
**© 2025 OASIS BI PRO. All rights reserved.**

---

## 📞 Support

- **Email**: support@oasis-bi-pro.com
- **Documentation**: https://docs.oasis-bi-pro.com
- **Issues**: https://github.com/Estes786/oasis-bi-pro-xendit.1/issues

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Switch Xendit to production keys (`xnd_production_...`)
- [ ] Update `XENDIT_ENV=production`
- [ ] Configure production webhook URL in Xendit Dashboard
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Verify Supabase production credentials
- [ ] Test all payment flows (VA & E-Wallet)
- [ ] Monitor webhook success rate
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure analytics (Google Analytics, Mixpanel, etc.)
- [ ] Enable SSL/HTTPS
- [ ] Set up CDN for static assets
- [ ] Configure backup strategy

---

**Built with ❤️ using Next.js, Supabase, and Xendit**
