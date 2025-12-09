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

// ✅ V18 ENVIRONMENT KEY SAFETY LOCK - ISOLATED CLIENT INITIALIZATION
// Load Xendit configuration WITHOUT throwing errors at module level
function loadXenditConfig() {
  const secretKey = process.env.XENDIT_SECRET_KEY || ''
  const webhookToken = process.env.XENDIT_WEBHOOK_TOKEN || ''
  const environment = process.env.XENDIT_ENV || 'test'
  const nodeEnv = process.env.NODE_ENV || 'development'
  const baseUrl = process.env.XENDIT_BASE_URL || 'https://api.xendit.co'
  
  return {
    secretKey,
    webhookToken,
    environment,
    nodeEnv,
    baseUrl,
  }
}

// Xendit Configuration (lightweight, no validation at module level)
export const XENDIT_CONFIG = loadXenditConfig()

/**
 * ✅ V18 CRITICAL: XENDIT CLIENT FACTORY FUNCTION
 * Explicit validation BEFORE client initialization
 * This function MUST be called explicitly in request handlers
 * This allows V17's try/catch to properly capture errors
 */
export function getXenditClient() {
  const { secretKey, nodeEnv, environment } = XENDIT_CONFIG
  
  // V18 PHASE 2: FATAL ERROR if key is missing or empty
  if (!secretKey || secretKey.trim() === '') {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('🚨 FATAL V18: XENDIT_SECRET_KEY MISSING!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('   XENDIT_SECRET_KEY is not set in environment variables!')
    console.error('   ')
    console.error('   📋 REQUIRED ACTION:')
    console.error('   1. Check your .env file exists')
    console.error('   2. Verify XENDIT_SECRET_KEY is set correctly:')
    console.error('      XENDIT_SECRET_KEY=xnd_development_YOUR_KEY_HERE')
    console.error('   3. Restart your application after adding the key')
    console.error('   ')
    console.error('   🔍 Current Environment:')
    console.error('      NODE_ENV:', nodeEnv)
    console.error('      XENDIT_ENV:', environment)
    console.error('      Secret Key:', secretKey ? `[SET BUT EMPTY]` : '[NOT SET]')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    throw new Error('FATAL V18: XENDIT_SECRET_KEY missing or empty. Check .env file!')
  }
  
  // V18: Validate key format and environment matching
  const isSandboxKey = secretKey.startsWith('xnd_development_')
  const isProductionKey = secretKey.startsWith('xnd_production_')
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔐 V18 XENDIT CLIENT INITIALIZATION')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📦 NODE_ENV:', nodeEnv)
  console.log('📦 XENDIT_ENV:', environment)
  console.log('🔑 Secret Key Type:', isSandboxKey ? '✅ SANDBOX (xnd_development_)' : isProductionKey ? '⚠️ PRODUCTION (xnd_production_)' : '❌ INVALID FORMAT')
  
  // V18: Validate key format
  if (!isSandboxKey && !isProductionKey) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('🚨 FATAL V18: INVALID XENDIT KEY FORMAT!')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('   The XENDIT_SECRET_KEY does not match expected format.')
    console.error('   ')
    console.error('   Expected formats:')
    console.error('   - Sandbox: xnd_development_XXXXX...')
    console.error('   - Production: xnd_production_XXXXX...')
    console.error('   ')
    console.error('   Current key starts with:', secretKey.substring(0, 20) + '...')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    throw new Error('FATAL V18: XENDIT_SECRET_KEY has invalid format. Must start with xnd_development_ or xnd_production_')
  }
  
  // V18 SAFETY: Warn if using production key in non-production environment
  if (isProductionKey && nodeEnv !== 'production') {
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.warn('⚠️⚠️⚠️ WARNING: PRODUCTION KEY IN NON-PRODUCTION ENVIRONMENT ⚠️⚠️⚠️')
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.warn('   Current NODE_ENV:', nodeEnv)
    console.warn('   Secret Key Type: PRODUCTION')
    console.warn('   ACTION REQUIRED: Use sandbox key (xnd_development_) for testing')
    console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
  
  // V18 ENFORCEMENT: Block production key in development
  if (isProductionKey && (nodeEnv === 'development' || environment === 'test')) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('🚫 FATAL V18: PRODUCTION KEY BLOCKED IN DEVELOPMENT MODE')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('   Using production Xendit keys in development is DANGEROUS!')
    console.error('   This could lead to REAL charges on REAL customer accounts.')
    console.error('   ')
    console.error('   Please set XENDIT_SECRET_KEY to a sandbox key:')
    console.error('   XENDIT_SECRET_KEY=xnd_development_YOUR_SANDBOX_KEY')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    throw new Error('FATAL V18: PRODUCTION KEY NOT ALLOWED IN DEVELOPMENT - Use sandbox key (xnd_development_)')
  }
  
  console.log('✅ V18 CLIENT VALIDATION: PASSED')
  console.log('   Secret Key Preview:', secretKey.substring(0, 25) + '...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Return validated config (not a client object, just config)
  return XENDIT_CONFIG
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
 */
function getXenditAuthHeader(): string {
  const authString = `${XENDIT_CONFIG.secretKey}:`
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
 * ✅ V18: Now calls getXenditClient() for explicit validation
 */
export async function createXenditVirtualAccount(data: XenditVARequest) {
  // V18: Generate request ID for tracking
  const requestId = `VA-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  try {
    // V18 PHASE 3: Validate Xendit client before proceeding
    const config = getXenditClient()
    const { baseUrl } = config
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔵 V18 XENDIT CREATE VIRTUAL ACCOUNT')
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
    console.error('💥 V18 XENDIT VA CREATION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('   Request ID:', requestId)
    console.error('🐞 Error Type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('🐞 Error Message:', error instanceof Error ? error.message : String(error))
    console.error('🐞 Error Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('📦 Xendit Config Status:')
    console.error('   Secret Key:', XENDIT_CONFIG.secretKey ? `✅ Set (${XENDIT_CONFIG.secretKey.substring(0, 20)}...)` : '❌ Missing')
    console.error('   Base URL:', XENDIT_CONFIG.baseUrl)
    console.error('   Environment:', XENDIT_CONFIG.environment)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // V18: Re-throw error to allow V17 handler to catch it properly
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
 * ✅ V18: Now calls getXenditClient() for explicit validation
 */
export async function createXenditEWallet(data: XenditEWalletRequest) {
  // V18: Generate request ID for tracking
  const requestId = `EW-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  try {
    // V18 PHASE 3: Validate Xendit client before proceeding
    const config = getXenditClient()
    const { baseUrl } = config
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💳 V18 XENDIT CREATE E-WALLET CHARGE')
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
    console.error('💥 V18 XENDIT E-WALLET CREATION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('   Request ID:', requestId)
    console.error('🐞 Error Type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('🐞 Error Message:', error instanceof Error ? error.message : String(error))
    console.error('🐞 Error Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('📦 Xendit Config Status:')
    console.error('   Secret Key:', XENDIT_CONFIG.secretKey ? `✅ Set (${XENDIT_CONFIG.secretKey.substring(0, 20)}...)` : '❌ Missing')
    console.error('   Base URL:', XENDIT_CONFIG.baseUrl)
    console.error('   Environment:', XENDIT_CONFIG.environment)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // V18: Re-throw error to allow V17 handler to catch it properly
    throw error
  }
}

/**
 * Verify Xendit Webhook Callback Token
 * Security: Check X-Callback-Token header against stored webhook token
 * Docs: https://docs.xendit.co/docs/handling-webhooks
 */
export function verifyXenditWebhook(callbackToken: string): boolean {
  const expectedToken = XENDIT_CONFIG.webhookToken
  
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
