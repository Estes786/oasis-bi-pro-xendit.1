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

// Xendit Configuration
export const XENDIT_CONFIG = {
  secretKey: process.env.XENDIT_SECRET_KEY || '',
  webhookToken: process.env.XENDIT_WEBHOOK_TOKEN || '',
  environment: process.env.XENDIT_ENV || 'test',
  baseUrl: process.env.XENDIT_BASE_URL || 'https://api.xendit.co',
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
 */
export async function createXenditVirtualAccount(data: XenditVARequest) {
  const { baseUrl } = XENDIT_CONFIG
  
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔵 XENDIT CREATE VIRTUAL ACCOUNT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 Request Data:', data)
    
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
    
    const response = await fetch(`${baseUrl}/callback_virtual_accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getXenditAuthHeader(),
      },
      body: JSON.stringify(requestBody),
    })
    
    const result = await response.json()
    
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
    console.error('💥 XENDIT VA CREATION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error(error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
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
 */
export async function createXenditEWallet(data: XenditEWalletRequest) {
  const { baseUrl } = XENDIT_CONFIG
  
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('💳 XENDIT CREATE E-WALLET CHARGE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 Request Data:', data)
    
    const requestBody = {
      reference_id: data.externalId,
      currency: 'IDR',
      amount: data.amount,
      checkout_method: 'ONE_TIME_PAYMENT',
      channel_code: data.ewalletType,
      channel_properties: {
        mobile_number: data.phone,
        success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed`,
      },
    }
    
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
    console.error('💥 XENDIT E-WALLET CREATION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error(error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
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
