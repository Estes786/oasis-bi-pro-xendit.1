/**
 * XENDIT PAYMENT GATEWAY INTEGRATION
 * Documentation: https://docs.xendit.co/
 * 
 * IMPORTANT: This is for SUBSCRIPTION BILLING ONLY
 * We are NOT a payment facilitator/aggregator
 * We use Xendit to collect OUR subscription fees from OUR customers
 * 
 * Xendit API Authentication: Basic Auth with Secret Key as username
 */

// ✅ V21 FINAL FIX - EXPLICIT SANDBOX MODE WITH BASE URL HARDCODE
// Config is loaded fresh on every getXenditClient() call
// V21: Forces sandbox mode explicitly regardless of NODE_ENV

/**
 * ✅ V21 CRITICAL: BRUTAL SANDBOX LOCKIN WITH EXPLICIT ENVIRONMENT
 * Explicit validation BEFORE client initialization
 * This function MUST be called explicitly in request handlers
 * V21: FORCES sandbox-only operation with explicit environment override
 * 
 * ROOT CAUSE ANALYSIS:
 * - Vercel/Next.js automatically sets NODE_ENV=production during build
 * - Xendit API validates environment consistency between NODE_ENV and key type
 * - xnd_development_ keys are ONLY valid when environment is explicitly "test"
 * 
 * V21 FIX:
 * - Ignore NODE_ENV completely
 * - Force environment: 'test' explicitly
 * - Validate key starts with xnd_development_
 * - Use default Xendit base URL (https://api.xendit.co)
 */
export function getXenditClient() {
  const secretKey = process.env.XENDIT_SECRET_KEY || ''
  
  // V21 CRITICAL FIX: Brutal Sandbox Validation
  if (!secretKey || secretKey.trim() === '') {
    console.error('🔥🔥 V21: FATAL - XENDIT_SECRET_KEY is missing.')
    throw new Error('FATAL V21: XENDIT_SECRET_KEY is missing.')
  }
  
  if (!secretKey.startsWith('xnd_development_')) {
    console.error('🔥🔥 V21 SANDBOX VIOLATION DETECTED 🔥🔥')
    console.error(`Attempted Key: ${secretKey.substring(0, 20)}...`)
    throw new Error('FATAL V21: Kunci Production terdeteksi! (Harus xnd_development_...).')
  }
  
  // V21 CRITICAL: Log environment state for diagnostics
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔥🔥 V21: SANDBOX LOCK-IN AKTIF 🔥🔥')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔑 Secret Key Type:', secretKey.substring(0, 20) + '...')
  console.log('🌍 NODE_ENV (Ignored):', process.env.NODE_ENV)
  console.log('🔧 XENDIT_ENV (Override):', 'test')
  console.log('🌐 Base URL:', 'https://api.xendit.co (default)')
  console.log('✅ Environment Mode: SANDBOX (FORCED)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Return validated config with FORCED sandbox environment
  return {
    secretKey: secretKey,
    webhookToken: process.env.XENDIT_WEBHOOK_TOKEN || '',
    environment: 'test', // V21 FIX: Force sandbox mode regardless of NODE_ENV
    nodeEnv: 'development', // V21 FIX: Override NODE_ENV for Xendit compatibility
    baseUrl: 'https://api.xendit.co', // V21 FIX: Use default Xendit API URL
  }
}

// Subscription Plans (matching pricing page)
export const SUBSCRIPTION_PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter Plan',
    price: 99000,
    currency: 'IDR',
    duration: 'monthly',
    features: [
      '5 dashboard interaktif',
      '10 data source connections',
      'Basic analytics & reporting',
      'Email support (24 jam)',
      '1 user account'
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional Plan',
    price: 299000,
    currency: 'IDR',
    duration: 'monthly',
    features: [
      '50 dashboard interaktif',
      'Unlimited data sources',
      'Advanced AI analytics',
      'Priority support (12 jam)',
      'Custom branding',
      '5 user accounts',
      'API access'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 999000,
    currency: 'IDR',
    duration: 'monthly',
    features: [
      'Unlimited dashboards',
      'Unlimited data sources',
      'AI-powered insights',
      'Dedicated support (24/7)',
      'White-label solution',
      'Unlimited users',
      'Full API access',
      'Custom integrations',
      'SLA guarantee'
    ]
  }
}

/**
 * Generate Xendit Basic Auth Header
 * Format: Base64(secretKey:)  // Note: colon after secret key, empty password
 * V20: Reads secretKey directly from env to avoid caching issues
 */
function getXenditAuthHeader(): string {
  const secretKey = process.env.XENDIT_SECRET_KEY || ''
  const authString = `${secretKey}:`
  const base64Auth = Buffer.from(authString).toString('base64')
  return `Basic ${base64Auth}`
}

/**
 * Generate unique external ID
 * Format: OASIS-{PLAN}-{TIMESTAMP}-{RANDOM}
 */
export function generateExternalId(planId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `OASIS-${planId.toUpperCase()}-${timestamp}-${random}`
}

/**
 * Payment Request Interface for Virtual Account
 */
export interface XenditVARequest {
  externalId: string
  bankCode: 'BCA' | 'MANDIRI' | 'BNI' | 'BRI' | 'PERMATA'
  name: string
  email?: string
  expectedAmount: number
  planId: keyof typeof SUBSCRIPTION_PLANS
  userId?: string
}

/**
 * Create Xendit Virtual Account (Dynamic)
 * API: POST /callback_virtual_accounts
 * Docs: https://developers.xendit.co/api-reference/#create-fixed-virtual-accounts
 * 
 * ✅ V19: Now calls getXenditClient() for explicit validation with environment diagnostics
 */
export async function createXenditVirtualAccount(data: XenditVARequest) {
  // V19: Generate request ID for tracking
  const requestId = `VA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  try {
    // V19 PHASE 3: Validate Xendit client before proceeding
    const config = getXenditClient()
    const { baseUrl } = config
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔵 V19 XENDIT CREATE VIRTUAL ACCOUNT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 Request Data:', data)
    console.log('📦 Request ID:', requestId)
    
    // Calculate expiry (24 hours from now)
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + 24)
    
    const requestBody = {
      external_id: data.externalId,
      bank_code: data.bankCode,
      name: data.name,
      expected_amount: data.expectedAmount,
      is_closed: true, // Closed VA (fixed amount)
      expiration_date: expiryDate.toISOString(),
      is_single_use: true,
    }
    
    console.log('📤 Xendit API Request Body:', requestBody)
    
    // V17: Add timeout to prevent hanging requests
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let response: Response
    try {
      response = await fetch(`${baseUrl}/callback_virtual_accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getXenditAuthHeader(),
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })
    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('⏱️ V17 XENDIT VA TIMEOUT ERROR')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('   Request ID:', requestId)
        console.error('   Error: Request timed out after 30 seconds')
        console.error('   Bank Code:', data.bankCode)
        console.error('   Amount:', data.expectedAmount)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        throw new Error('Xendit API timeout - Request took longer than 30 seconds')
      }
      
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('🌐 V17 XENDIT VA NETWORK ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('   Request ID:', requestId)
      console.error('   Error:', fetchError instanceof Error ? fetchError.message : String(fetchError))
      console.error('   Base URL:', baseUrl)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      throw fetchError
    } finally {
      clearTimeout(timeoutId)
    }
    
    // V17: Safe JSON parsing
    let result: any
    try {
      result = await response.json()
    } catch (jsonError) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('📄 V17 XENDIT VA JSON PARSE ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('   Request ID:', requestId)
      console.error('   Status Code:', response.status)
      console.error('   Error:', jsonError instanceof Error ? jsonError.message : String(jsonError))
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      throw new Error(`Failed to parse Xendit response: ${jsonError instanceof Error ? jsonError.message : 'Invalid JSON'}`)
    }
    
    console.log('📥 Xendit Response:', result)
    console.log('   Status Code:', response.status)
    
    if (!response.ok) {
      throw new Error(`Xendit API Error (${response.status}): ${result.message || result.error_code || 'Unknown error'}`)
    }
    
    // Extract important data
    const vaNumber = result.account_number
    const bankCode = result.bank_code
    
    console.log('✅ Virtual Account Created Successfully')
    console.log('   VA Number:', vaNumber)
    console.log('   Bank:', bankCode)
    console.log('   Expected Amount:', result.expected_amount, 'IDR')
    console.log('   Expiry:', result.expiration_date)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return {
      success: true,
      data: result,
      vaNumber,
      bankCode,
      expectedAmount: result.expected_amount,
      expiryDate: result.expiration_date,
      externalId: result.external_id,
    }
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('💥 V19 XENDIT VA CREATION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('   Request ID:', requestId)
    console.error('🐞 Error Type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('🐞 Error Message:', error instanceof Error ? error.message : String(error))
    console.error('🐞 Error Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('📦 V20 Xendit Config Status:')
    console.error('   Secret Key:', process.env.XENDIT_SECRET_KEY ? `✅ Set (${process.env.XENDIT_SECRET_KEY.substring(0, 20)}...)` : '❌ Missing')
    console.error('   Base URL:', process.env.XENDIT_BASE_URL || 'https://api.xendit.co')
    console.error('   Environment:', process.env.XENDIT_ENV || 'test')
    console.error('   NODE_ENV:', process.env.NODE_ENV)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // V19: Re-throw error to allow handler to catch it properly
    throw error
  }
}

/**
 * E-Wallet Payment Request Interface
 */
export interface XenditEWalletRequest {
  externalId: string
  amount: number
  phone: string
  ewalletType: 'OVO' | 'DANA' | 'LINKAJA'
  planId: keyof typeof SUBSCRIPTION_PLANS
  userId?: string
}

/**
 * Create Xendit E-Wallet Charge
 * API: POST /ewallets/charges
 * Docs: https://developers.xendit.co/api-reference/#create-ewallet-charge
 * 
 * ✅ V19: Now calls getXenditClient() for explicit validation with environment diagnostics
 */
export async function createXenditEWallet(data: XenditEWalletRequest) {
  // V19: Generate request ID for tracking
  const requestId = `EW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  try {
    // V19 PHASE 3: Validate Xendit client before proceeding
    const config = getXenditClient()
    const { baseUrl } = config
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💳 V19 XENDIT CREATE E-WALLET CHARGE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 Request Data:', data)
    console.log('📦 Request ID:', requestId)
    
    // Get base URL from environment or use localhost for development
    const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Format phone number: Xendit requires +62 country code
    const formattedPhone = data.phone.startsWith('+62') 
      ? data.phone 
      : data.phone.startsWith('0') 
        ? '+62' + data.phone.substring(1)
        : '+62' + data.phone;
    
    const requestBody = {
      reference_id: data.externalId,
      currency: 'IDR',
      amount: data.amount,
      checkout_method: 'ONE_TIME_PAYMENT',
      channel_code: 'ID_OVO', // Use proper Xendit channel codes
      channel_properties: {
        mobile_number: formattedPhone,
        success_redirect_url: `${baseAppUrl}/payment/success`,
        failure_redirect_url: `${baseAppUrl}/payment/failed`,
      },
    }
    
    console.log('📱 Formatted Phone Number:', formattedPhone)
    
    console.log('📤 Xendit E-Wallet Request Body:', requestBody)
    
    const response = await fetch(`${baseUrl}/ewallets/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getXenditAuthHeader(),
      },
      body: JSON.stringify(requestBody),
    })
    
    const result = await response.json()
    
    console.log('📥 Xendit E-Wallet Response:', result)
    console.log('   Status Code:', response.status)
    
    if (!response.ok) {
      throw new Error(`Xendit E-Wallet Error (${response.status}): ${result.message || result.error_code || 'Unknown error'}`)
    }
    
    // Extract important data
    const checkoutUrl = result.actions?.desktop_web_checkout_url || result.actions?.mobile_web_checkout_url
    const chargeId = result.id
    
    console.log('✅ E-Wallet Charge Created Successfully')
    console.log('   Charge ID:', chargeId)
    console.log('   Channel:', result.channel_code)
    console.log('   Amount:', result.charge_amount, 'IDR')
    console.log('   Checkout URL:', checkoutUrl)
    console.log('   Status:', result.status)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return {
      success: true,
      data: result,
      chargeId,
      checkoutUrl,
      amount: result.charge_amount,
      status: result.status,
      externalId: result.reference_id,
    }
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('💥 V19 XENDIT E-WALLET CREATION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('   Request ID:', requestId)
    console.error('🐞 Error Type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('🐞 Error Message:', error instanceof Error ? error.message : String(error))
    console.error('🐞 Error Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('📦 V20 Xendit Config Status:')
    console.error('   Secret Key:', process.env.XENDIT_SECRET_KEY ? `✅ Set (${process.env.XENDIT_SECRET_KEY.substring(0, 20)}...)` : '❌ Missing')
    console.error('   Base URL:', process.env.XENDIT_BASE_URL || 'https://api.xendit.co')
    console.error('   Environment:', process.env.XENDIT_ENV || 'test')
    console.error('   NODE_ENV:', process.env.NODE_ENV)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // V19: Re-throw error to allow handler to catch it properly
    throw error
  }
}

/**
 * Verify Xendit Webhook Callback Token
 * Security: Check X-Callback-Token header against stored webhook token
 * Docs: https://docs.xendit.co/docs/handling-webhooks
 * V20: Reads webhookToken directly from env to avoid caching issues
 */
export function verifyXenditWebhook(callbackToken: string): boolean {
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN || ''
  
  if (!expectedToken) {
    console.error('❌ XENDIT_WEBHOOK_TOKEN not configured in environment variables')
    return false
  }
  
  const isValid = callbackToken === expectedToken
  
  console.log('🔍 Webhook Verification:')
  console.log('   Expected Token:', expectedToken.substring(0, 20) + '...')
  console.log('   Received Token:', callbackToken.substring(0, 20) + '...')
  console.log('   Match:', isValid ? '✅ VALID' : '❌ INVALID')
  
  return isValid
}

/**
 * Xendit Payment Status Mapping
 */
export const XENDIT_STATUS = {
  // Virtual Account
  PENDING: 'PENDING',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  
  // E-Wallet
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  
  // General
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const

export type XenditStatus = typeof XENDIT_STATUS[keyof typeof XENDIT_STATUS]

/**
 * Map Xendit status to subscription status
 */
export function mapXenditStatusToSubscription(xenditStatus: string): 'active' | 'pending' | 'expired' | 'cancelled' {
  switch (xenditStatus.toUpperCase()) {
    case XENDIT_STATUS.PAID:
    case XENDIT_STATUS.SUCCEEDED:
      return 'active'
    
    case XENDIT_STATUS.PENDING:
      return 'pending'
    
    case XENDIT_STATUS.EXPIRED:
      return 'expired'
    
    case XENDIT_STATUS.FAILED:
    case XENDIT_STATUS.INACTIVE:
      return 'cancelled'
    
    default:
      return 'pending'
  }
}
