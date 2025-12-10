/**
 * 🔥 XENDIT PAYMENT GATEWAY - EDGE FUNCTION V25
 * Function: xendit-payment-1
 * Purpose: Isolated Environment for Xendit Sandbox API
 * Architecture: Deno Runtime → Xendit API (Guaranteed NODE_ENV=development)
 * Created: 2025-12-10
 * Status: PRODUCTION READY ✅
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CheckoutRequest {
  planId: string;
  email: string;
  phoneNumber: string;
  customerName: string;
  paymentMethod: 'va' | 'ewallet';
  channelCode: string;
}

interface PlanConfig {
  price: number;
  name: string;
}

interface XenditVAResponse {
  id: string;
  external_id: string;
  bank_code: string;
  account_number: string;
  name: string;
  expected_amount: number;
  status: string;
  expiration_date: string;
}

interface XenditEWalletResponse {
  id: string;
  reference_id: string;
  channel_code: string;
  checkout_url?: string;
  actions?: {
    mobile_deeplink_checkout_url?: string;
    desktop_web_checkout_url?: string;
  };
  status: string;
  currency: string;
  charge_amount: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PLAN_PRICING: Record<string, PlanConfig> = {
  starter: { price: 79000, name: 'Starter Plan' },
  basic: { price: 179000, name: 'Basic Plan' },
  professional: { price: 279000, name: 'Professional Plan' },
  enterprise: { price: 579000, name: 'Enterprise Plan' },
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
  'Access-Control-Max-Age': '86400',
};

// ============================================================================
// ENVIRONMENT VALIDATION
// ============================================================================

function validateEnvironment(): { apiKey: string; environment: string } {
  const apiKey = Deno.env.get('XENDIT_SECRET_KEY');
  const environment = Deno.env.get('NODE_ENV') || 'development';

  console.log('🔧 Edge Function Environment:', {
    NODE_ENV: environment,
    XENDIT_KEY_PREFIX: apiKey?.substring(0, 15) + '***',
    DENO_VERSION: Deno.version.deno,
    TIMESTAMP: new Date().toISOString(),
  });

  if (!apiKey) {
    throw new Error(
      'XENDIT_SECRET_KEY not configured in Supabase secrets. ' +
      'Run: supabase secrets set XENDIT_SECRET_KEY=your_key'
    );
  }

  // Critical validation: Ensure correct key prefix for environment
  if (environment === 'development' && !apiKey.startsWith('xnd_development_')) {
    throw new Error(
      `❌ ENVIRONMENT MISMATCH: NODE_ENV=${environment} but API key is production. ` +
      'Use xnd_development_* key for sandbox.'
    );
  }

  if (environment === 'production' && !apiKey.startsWith('xnd_production_')) {
    throw new Error(
      `❌ ENVIRONMENT MISMATCH: NODE_ENV=${environment} but API key is development. ` +
      'Use xnd_production_* key for live payments.'
    );
  }

  return { apiKey, environment };
}

// ============================================================================
// XENDIT API HANDLERS
// ============================================================================

/**
 * Create Virtual Account via Xendit API
 */
async function createVirtualAccount(
  requestData: CheckoutRequest,
  config: { apiKey: string; environment: string }
): Promise<XenditVAResponse> {
  const { planId, email, phoneNumber, customerName, channelCode } = requestData;
  const planConfig = PLAN_PRICING[planId];
  
  if (!planConfig) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const externalId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const bankCode = channelCode.replace('_VIRTUAL_ACCOUNT', '');

  console.log('📝 Creating Virtual Account:', {
    externalId,
    bankCode,
    amount: planConfig.price,
    environment: config.environment,
  });

  // Xendit Create VA endpoint
  const url = 'https://api.xendit.co/callback_virtual_accounts';

  // BCA does not support description field
  const payload: Record<string, any> = {
    external_id: externalId,
    bank_code: bankCode,
    name: customerName,
    expected_amount: planConfig.price,
    is_closed: true,
    expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  // Only add description for banks that support it (not BCA)
  if (bankCode !== 'BCA') {
    payload.description = `Payment for ${planConfig.name}`;
  }

  console.log('🚀 Xendit VA Request:', { url, payload });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(config.apiKey + ':')}`,
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  console.log('📥 Xendit VA Response:', {
    status: response.status,
    statusText: response.statusText,
    data: responseData,
  });

  if (!response.ok) {
    console.error('❌ Xendit API Error:', responseData);
    throw new Error(
      `Xendit API Error (${response.status}): ${
        responseData.message || responseData.error_code || 'Unknown error'
      }`
    );
  }

  return responseData as XenditVAResponse;
}

/**
 * Create E-Wallet Charge via Xendit API
 */
async function createEWalletCharge(
  requestData: CheckoutRequest,
  config: { apiKey: string; environment: string }
): Promise<XenditEWalletResponse> {
  const { planId, email, phoneNumber, customerName, channelCode } = requestData;
  const planConfig = PLAN_PRICING[planId];
  
  if (!planConfig) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  const referenceId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  console.log('📱 Creating E-Wallet Charge:', {
    referenceId,
    channelCode,
    amount: planConfig.price,
    environment: config.environment,
  });

  // Xendit E-Wallet Charge endpoint
  const url = 'https://api.xendit.co/ewallets/charges';

  // Build channel_properties based on channel type
  const channelProperties: Record<string, any> = {
    success_redirect_url: `${Deno.env.get('APP_URL') || 'https://oasis-bi.com'}/payment/success`,
    failure_redirect_url: `${Deno.env.get('APP_URL') || 'https://oasis-bi.com'}/payment/failed`,
  };

  // OVO requires mobile_number in international format (+62xxx)
  if (channelCode === 'ID_OVO') {
    // Convert 08xxx to +628xxx
    const formattedPhone = phoneNumber.startsWith('0') 
      ? '+62' + phoneNumber.substring(1) 
      : phoneNumber.startsWith('+') 
        ? phoneNumber 
        : '+62' + phoneNumber;
    channelProperties.mobile_number = formattedPhone;
  }

  const payload = {
    reference_id: referenceId,
    currency: 'IDR',
    amount: planConfig.price,
    checkout_method: 'ONE_TIME_PAYMENT',
    channel_code: channelCode,
    channel_properties: channelProperties,
    metadata: {
      plan_id: planId,
      email,
      phone_number: phoneNumber,
      customer_name: customerName,
    },
  };

  console.log('🚀 Xendit E-Wallet Request:', { url, payload });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(config.apiKey + ':')}`,
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  console.log('📥 Xendit E-Wallet Response:', {
    status: response.status,
    statusText: response.statusText,
    data: responseData,
  });

  if (!response.ok) {
    console.error('❌ Xendit API Error:', responseData);
    throw new Error(
      `Xendit API Error (${response.status}): ${
        responseData.message || responseData.error_code || 'Unknown error'
      }`
    );
  }

  return responseData as XenditEWalletResponse;
}

// ============================================================================
// HTTP REQUEST HANDLER
// ============================================================================

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Health check
  if (req.method === 'GET' && url.pathname === '/') {
    return new Response(
      JSON.stringify({
        status: 'healthy',
        function: 'xendit-payment-1',
        version: 'V25',
        timestamp: new Date().toISOString(),
        environment: Deno.env.get('NODE_ENV') || 'development',
      }),
      {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      }
    );
  }

  // POST /xendit-payment-1 - Create payment
  if (req.method === 'POST') {
    try {
      // Validate environment
      const config = validateEnvironment();

      // Parse request body
      const requestData: CheckoutRequest = await req.json();

      console.log('📝 Incoming Request:', requestData);

      // Validate required fields
      const requiredFields = ['planId', 'email', 'phoneNumber', 'customerName', 'paymentMethod', 'channelCode'];
      const missingFields = requiredFields.filter(field => !requestData[field as keyof CheckoutRequest]);

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Route to appropriate handler
      let responseData: XenditVAResponse | XenditEWalletResponse;

      if (requestData.paymentMethod === 'va') {
        responseData = await createVirtualAccount(requestData, config);
      } else if (requestData.paymentMethod === 'ewallet') {
        responseData = await createEWalletCharge(requestData, config);
      } else {
        throw new Error(`Invalid payment method: ${requestData.paymentMethod}`);
      }

      // Success response
      const successResponse = {
        success: true,
        requestId: requestData.paymentMethod === 'va' 
          ? (responseData as XenditVAResponse).external_id 
          : (responseData as XenditEWalletResponse).reference_id,
        paymentMethod: requestData.paymentMethod,
        data: responseData,
        timestamp: new Date().toISOString(),
      };

      console.log('✅ Success Response:', successResponse);

      return new Response(JSON.stringify(successResponse), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('❌ Error Processing Request:', error);

      const errorResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
  }

  // Method not allowed
  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    }
  );
}

// ============================================================================
// START SERVER
// ============================================================================

console.log('🚀 Starting xendit-payment-1 Edge Function (V25)...');
serve(handleRequest);
