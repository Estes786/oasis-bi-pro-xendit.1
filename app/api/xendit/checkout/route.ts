/**
 * XENDIT CHECKOUT API ROUTE
 * POST /api/xendit/checkout
 * 
 * Purpose: Create payment request (VA or E-Wallet) for SUBSCRIPTION BILLING ONLY
 * This is NOT for processing third-party payments
 * We are collecting OUR subscription fees from OUR customers
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  createXenditVirtualAccount,
  createXenditEWallet,
  generateExternalId,
  SUBSCRIPTION_PLANS,
  type XenditVARequest,
  type XenditEWalletRequest
} from '@/lib/xendit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { planId, email, phoneNumber, customerName, userId, paymentMethod = 'va', bankCode = 'BCA', ewalletType } = body
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🛒 XENDIT CHECKOUT REQUEST RECEIVED - V10 DEBUG')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 Full Request Body:', JSON.stringify(body, null, 2))
    console.log('📦 Parsed Data:', { planId, email, phoneNumber, customerName, userId, paymentMethod, bankCode, ewalletType })
    
    if (!planId || !phoneNumber || !customerName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: planId, phoneNumber, customerName' 
        },
        { status: 400 }
      )
    }

    // Validate plan exists
    if (!SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid plan ID: ${planId}` 
        },
        { status: 400 }
      )
    }

    const plan = SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
    console.log('✅ Plan validated:', plan.name, '-', plan.price, 'IDR')
    
    // Generate unique external ID
    const externalId = generateExternalId(planId)
    console.log('🔑 Generated External ID:', externalId)
    
    console.log('📤 Calling Xendit API...')
    console.log('💳 Payment Method:', paymentMethod)
    
    // Call Xendit API based on payment method
    let result: any
    
    if (paymentMethod === 'ewallet') {
      // Create E-Wallet charge
      const ewalletType = body.ewalletType || 'OVO' // Default to OVO if not specified
      
      const ewalletRequest: XenditEWalletRequest = {
        externalId,
        amount: plan.price,
        phone: phoneNumber,
        ewalletType,
        planId: planId as keyof typeof SUBSCRIPTION_PLANS,
        userId: userId || undefined,
      }
      
      result = await createXenditEWallet(ewalletRequest)
      
      if (!result.success) {
        console.error('❌ Xendit E-Wallet API call failed:', result.error)
        return NextResponse.json(
          { 
            success: false, 
            error: result.error 
          },
          { status: 500 }
        )
      }
      
      console.log('✅ E-Wallet Charge Created')
      console.log('✅ Charge ID:', result.chargeId)
      console.log('✅ Checkout URL:', result.checkoutUrl)
      
    } else {
      // Default: Create Virtual Account
      const vaRequest: XenditVARequest = {
        externalId,
        bankCode: bankCode.toUpperCase(),
        name: customerName,
        email,
        expectedAmount: plan.price,
        planId: planId as keyof typeof SUBSCRIPTION_PLANS,
        userId: userId || undefined,
      }
      
      result = await createXenditVirtualAccount(vaRequest)
      
      if (!result.success) {
        console.error('❌ Xendit VA API call failed:', result.error)
        return NextResponse.json(
          { 
            success: false, 
            error: result.error 
          },
          { status: 500 }
        )
      }

      console.log('✅ VA Number generated:', result.vaNumber)
      console.log('✅ Bank Code:', result.bankCode)
      console.log('✅ Expected Amount:', result.expectedAmount)
    }
    
    // Create pending transaction in database (if userId provided)
    if (userId) {
      try {
        console.log('🔄 Attempting to create pending transaction...')
        
        // Verify Supabase environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        
        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('❌ CRITICAL: Missing Supabase credentials!')
          console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
          console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')
          throw new Error('Missing Supabase environment variables')
        }
        
        console.log('✅ Supabase credentials verified')
        
        const { createPendingTransaction } = await import('@/lib/subscription-service')
        await createPendingTransaction({
          userId,
          merchantOrderId: externalId,
          amount: plan.price,
          planId
        })
        console.log('✅ Pending transaction created in database')
      } catch (dbError) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('⚠️ DATABASE ERROR (NON-BLOCKING)')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('   Error:', dbError)
        console.error('   Context: Failed to create pending transaction')
        console.error('   Impact: Payment will proceed, but transaction not logged')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        // Don't fail the checkout - just log the error
      }
    }
    
    // Return payment info based on method
    const responseData: any = {
      paymentMethod,
      reference: result.externalId || externalId,
      externalId,
      amount: plan.price,
      planName: plan.name,
      expiryDate: result.expiryDate,
    }
    
    if (paymentMethod === 'ewallet') {
      responseData.chargeId = result.chargeId
      responseData.checkoutUrl = result.checkoutUrl
      responseData.status = result.status
    } else {
      responseData.vaNumber = result.vaNumber
      responseData.bankCode = result.bankCode
      responseData.expectedAmount = result.expectedAmount
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ XENDIT CHECKOUT COMPLETED SUCCESSFULLY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 RESPONSE DATA BEING SENT TO FRONTEND:')
    console.log(JSON.stringify(responseData, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json({
      success: true,
      data: responseData
    })

  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('💥 CHECKOUT ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error(error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS
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

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Xendit Checkout Endpoint',
    status: 'Active',
    timestamp: new Date().toISOString(),
    note: 'This endpoint creates Xendit payment requests for subscription billing',
    methods: ['Virtual Account (BCA, Mandiri, BNI, BRI, Permata)', 'E-Wallet (OVO, DANA, LinkAja)'],
  })
}
