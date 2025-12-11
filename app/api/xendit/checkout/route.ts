/**
 * 🔥 XENDIT CHECKOUT API PROXY - V25
 * POST /api/xendit/checkout
 * 
 * Purpose: Proxy requests to Supabase Edge Function (xendit-payment-1)
 * Architecture: Next.js → Edge Function → Xendit API
 * This isolates Xendit calls from Next.js production environment
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// CONFIGURATION
// ============================================================================

const EDGE_FUNCTION_URL = 
  process.env.SUPABASE_FUNCTION_URL || 
  'https://cdwzivzaxvdossmwbwkl.supabase.co/functions/v1/xendit-payment-1'

const SUPABASE_ANON_KEY = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'sb_publishable_NRpbZ9WyiPS6lx45tYaImA_Oz2aJVTp'

// ============================================================================
// TYPES
// ============================================================================

interface CheckoutRequest {
  planId: string
  email: string
  phoneNumber: string
  customerName: string
  userId?: string
  paymentMethod?: 'va' | 'ewallet'
  channelCode?: string
  bankCode?: string
  ewalletType?: string
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const requestId = `PROXY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔵 V25 PROXY REQUEST STARTED')
    console.log('   Request ID:', requestId)
    console.log('   Edge Function URL:', EDGE_FUNCTION_URL)
    console.log('   Timestamp:', new Date().toISOString())
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    // Parse request body
    let body: CheckoutRequest
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('❌ V25 PROXY: JSON Parse Error')
      console.error('   Request ID:', requestId)
      console.error('   Error:', parseError instanceof Error ? parseError.message : String(parseError))
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    console.log('📦 Received Request Body:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    const { planId, email, phoneNumber, customerName, paymentMethod = 'va', bankCode, ewalletType } = body
    
    if (!planId || !phoneNumber || !customerName) {
      console.error('❌ V25 PROXY: Validation Error - Missing required fields')
      console.error('   Request ID:', requestId)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: planId, phoneNumber, customerName',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    // Map channelCode based on payment method and bank/ewallet selection
    let channelCode = body.channelCode
    
    if (!channelCode) {
      if (paymentMethod === 'va') {
        // Map bankCode to channelCode for VA
        const bankCodeUpper = (bankCode || 'BCA').toUpperCase()
        channelCode = `${bankCodeUpper}_VIRTUAL_ACCOUNT`
      } else if (paymentMethod === 'ewallet') {
        // Map ewalletType to channelCode
        const ewalletMap: Record<string, string> = {
          'OVO': 'ID_OVO',
          'GOPAY': 'ID_GOPAY',
          'DANA': 'ID_DANA',
          'LINKAJA': 'ID_LINKAJA',
          'SHOPEEPAY': 'ID_SHOPEEPAY'
        }
        channelCode = ewalletMap[(ewalletType || 'OVO').toUpperCase()] || 'ID_OVO'
      }
    }
    
    // Prepare Edge Function request
    const edgeFunctionPayload = {
      planId,
      email: email || `${phoneNumber}@oasis-bi.com`, // Default email if not provided
      phoneNumber,
      customerName,
      paymentMethod,
      channelCode,
    }
    
    console.log('🚀 Forwarding to Edge Function:', edgeFunctionPayload)
    
    // Call Edge Function
    const edgeResponse = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(edgeFunctionPayload),
    })
    
    const edgeResponseData = await edgeResponse.json()
    
    console.log('📥 Edge Function Response:', {
      status: edgeResponse.status,
      statusText: edgeResponse.statusText,
      data: edgeResponseData,
    })
    
    // 🔍 V25.1.3 DEBUG: Log extracted payment data details
    console.log('🔍 V25.1.3 DATA EXTRACTION DEBUG:', {
      hasData: !!edgeResponseData.data,
      dataKeys: edgeResponseData.data ? Object.keys(edgeResponseData.data) : [],
      vaNumber: edgeResponseData.data?.account_number,
      checkoutUrl: edgeResponseData.data?.checkout_url,
      checkoutUrlActions: edgeResponseData.data?.actions,
      fullEdgeData: JSON.stringify(edgeResponseData.data, null, 2)
    })
    
    if (!edgeResponse.ok) {
      console.error('❌ V25 PROXY: Edge Function Error')
      console.error('   Request ID:', requestId)
      console.error('   Status:', edgeResponse.status)
      console.error('   Response:', edgeResponseData)
      
      return NextResponse.json(
        { 
          success: false, 
          error: edgeResponseData.error || 'Edge Function call failed',
          requestId,
          timestamp: new Date().toISOString()
        },
        { status: edgeResponse.status || 500 }
      )
    }
    
    // Format response for frontend compatibility
    // 🔍 V25.1.3: Extract checkout_url/VA details from edgeResponseData.data
    const extractedVANumber = edgeResponseData.data?.account_number;
    const extractedBankCode = edgeResponseData.data?.bank_code;
    const extractedCheckoutUrl = edgeResponseData.data?.checkout_url || 
                                   edgeResponseData.data?.actions?.mobile_deeplink_checkout_url ||
                                   edgeResponseData.data?.actions?.desktop_web_checkout_url;
    
    console.log('🔍 V25.1.3 EXTRACTED VALUES:', {
      paymentMethod,
      extractedVANumber,
      extractedBankCode,
      extractedCheckoutUrl,
      hasActions: !!edgeResponseData.data?.actions,
      actionsKeys: edgeResponseData.data?.actions ? Object.keys(edgeResponseData.data.actions) : []
    });
    
    const responseData = {
      success: true,
      data: {
        paymentMethod,
        reference: edgeResponseData.requestId,
        externalId: edgeResponseData.requestId,
        amount: edgeResponseData.data?.expected_amount || edgeResponseData.data?.charge_amount,
        planName: planId.charAt(0).toUpperCase() + planId.slice(1),
        expiryDate: edgeResponseData.data?.expiration_date,
        
        // VA fields
        ...(paymentMethod === 'va' && {
          vaNumber: extractedVANumber,
          bankCode: extractedBankCode,
          expectedAmount: edgeResponseData.data?.expected_amount,
        }),
        
        // E-Wallet fields
        ...(paymentMethod === 'ewallet' && {
          chargeId: edgeResponseData.data?.id,
          checkoutUrl: extractedCheckoutUrl,
          status: edgeResponseData.data?.status,
        }),
      },
      requestId,
      edgeFunctionRequestId: edgeResponseData.requestId,
      timestamp: new Date().toISOString(),
    }
    
    // 🔍 V25.1.3: Log final response data structure
    console.log('🔍 V25.1.3 FINAL RESPONSE DATA:', {
      hasVANumber: !!responseData.data.vaNumber,
      hasCheckoutUrl: !!responseData.data.checkoutUrl,
      vaNumber: responseData.data.vaNumber,
      checkoutUrl: responseData.data.checkoutUrl,
      fullResponseData: JSON.stringify(responseData, null, 2)
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ V25 PROXY: SUCCESS')
    console.log('   Request ID:', requestId)
    console.log('   Response:', JSON.stringify(responseData, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('💥 V25 PROXY: CRITICAL ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('   Request ID:', requestId)
    console.error('   Error Type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('   Error Message:', error instanceof Error ? error.message : String(error))
    console.error('   Stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal proxy error',
        requestId,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// OPTIONS for CORS
// ============================================================================

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}

// ============================================================================
// GET endpoint for health check
// ============================================================================

export async function GET(request: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📥 V25 PROXY: Health Check')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  return NextResponse.json({
    success: true,
    message: 'V25 Xendit Checkout Proxy - Active',
    edgeFunctionUrl: EDGE_FUNCTION_URL,
    version: 'V25',
    status: 'Active',
    timestamp: new Date().toISOString(),
    architecture: 'Next.js Proxy → Supabase Edge Function → Xendit API',
    supportedMethods: {
      va: ['BCA', 'BNI', 'BRI', 'Mandiri', 'Permata'],
      ewallet: ['OVO', 'GoPay', 'Dana', 'LinkAja', 'ShopeePay']
    }
  })
}
