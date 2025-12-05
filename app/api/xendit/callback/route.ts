/**
 * XENDIT PAYMENT CALLBACK HANDLER
 * POST /api/xendit/callback
 * 
 * Purpose: Receive payment notification from Xendit
 * This webhook is called by Xendit when payment status changes
 * 
 * IMPORTANT: This is for OUR subscription billing only
 * 
 * SECURITY: X-Callback-Token header verification (CRITICAL)
 * DATABASE: Automatic Supabase update on successful payment
 * 
 * WEBHOOK TYPES SUPPORTED:
 * 1. Virtual Account Payment (account_number, callback_virtual_account_id)
 * 2. E-Wallet Payment (ewallet_type, charge_id, reference_id)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyXenditWebhook, mapXenditStatusToSubscription, XENDIT_STATUS } from '@/lib/xendit'
import { 
  updateSubscriptionAfterPayment, 
  getUserIdFromTransaction 
} from '@/lib/subscription-service'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // STEP 1: VERIFY X-CALLBACK-TOKEN (CRITICAL SECURITY CHECK)
    const callbackToken = request.headers.get('X-Callback-Token') || request.headers.get('x-callback-token')
    
    if (!callbackToken) {
      console.error('❌ MISSING X-CALLBACK-TOKEN HEADER')
      console.error('Possible security breach attempt - webhook rejected')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing X-Callback-Token header' 
        },
        { status: 401 }
      )
    }
    
    const isValidToken = verifyXenditWebhook(callbackToken)
    
    if (!isValidToken) {
      console.error('❌ INVALID X-CALLBACK-TOKEN')
      console.error('Possible fraud attempt - webhook rejected')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid callback token' 
        },
        { status: 401 }
      )
    }
    
    console.log('✅ Webhook token verified successfully')
    
    // Parse callback data from Xendit
    const body = await request.json()
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔔 XENDIT CALLBACK RECEIVED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 Full Payload:', body)
    console.log('   Timestamp:', new Date().toISOString())

    // STEP 2: DETERMINE CALLBACK TYPE
    // Virtual Account has: external_id, account_number, callback_virtual_account_id
    // E-Wallet has: reference_id, ewallet_type, charge_id
    const isVirtualAccount = body.hasOwnProperty('callback_virtual_account_id') || body.hasOwnProperty('account_number')
    const isEWallet = body.hasOwnProperty('ewallet_type') || body.hasOwnProperty('charge_id')
    
    let externalId: string
    let amount: number
    let paymentStatus: string
    let reference: string
    let paymentType: string
    
    if (isVirtualAccount) {
      // VIRTUAL ACCOUNT CALLBACK
      paymentType = 'Virtual Account'
      externalId = body.external_id
      amount = parseFloat(body.amount || body.expected_amount || '0')
      paymentStatus = body.status || 'PENDING' // Xendit VA status: PENDING, PAID, EXPIRED
      reference = body.callback_virtual_account_id || body.id
      
      console.log('📋 Virtual Account Callback Data:')
      console.log('   External ID:', externalId)
      console.log('   Account Number:', body.account_number)
      console.log('   Bank Code:', body.bank_code)
      console.log('   Amount:', amount, 'IDR')
      console.log('   Status:', paymentStatus)
      console.log('   Reference:', reference)
      
    } else if (isEWallet) {
      // E-WALLET CALLBACK
      paymentType = 'E-Wallet'
      externalId = body.reference_id || body.data?.reference_id
      amount = parseFloat(body.charge_amount || body.data?.charge_amount || '0')
      paymentStatus = body.status || body.data?.status || 'PENDING' // Xendit E-Wallet: PENDING, SUCCEEDED, FAILED
      reference = body.charge_id || body.id || body.data?.id
      
      console.log('📋 E-Wallet Callback Data:')
      console.log('   Reference ID:', externalId)
      console.log('   E-Wallet Type:', body.ewallet_type || body.channel_code)
      console.log('   Amount:', amount, 'IDR')
      console.log('   Status:', paymentStatus)
      console.log('   Charge ID:', reference)
      
    } else {
      console.error('❌ UNKNOWN CALLBACK TYPE')
      console.error('Could not identify callback as VA or E-Wallet')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unknown callback type' 
        },
        { status: 400 }
      )
    }

    // STEP 3: Extract plan ID from external ID
    // Format: OASIS-{PLAN}-{TIMESTAMP}-{RANDOM}
    const planMatch = externalId.match(/OASIS-([A-Z]+)-/i)
    const planId = planMatch ? planMatch[1].toLowerCase() : 'starter'
    
    console.log('📋 Extracted Plan ID:', planId)

    // STEP 4: Get user ID from transaction record
    const userId = await getUserIdFromTransaction(externalId)
    
    if (!userId) {
      console.error('❌ User ID not found for order:', externalId)
      // Still return 200 to avoid Xendit retry loop
      return NextResponse.json({
        success: false,
        error: 'User ID not found',
        message: 'Will process manually'
      })
    }
    
    console.log('👤 User ID:', userId)

    // STEP 5: Map Xendit status to subscription status
    const subscriptionStatus = mapXenditStatusToSubscription(paymentStatus)
    
    console.log('📊 Status Mapping:')
    console.log('   Xendit Status:', paymentStatus)
    console.log('   Subscription Status:', subscriptionStatus)

    // STEP 6: Process payment based on status
    const isSuccess = paymentStatus.toUpperCase() === XENDIT_STATUS.PAID || 
                     paymentStatus.toUpperCase() === XENDIT_STATUS.SUCCEEDED
    
    if (isSuccess) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('💰 PAYMENT SUCCESS - Processing subscription activation')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Update subscription in Supabase
      const result = await updateSubscriptionAfterPayment({
        userId,
        planId,
        merchantOrderId: externalId,
        amount,
        xenditReference: reference,
        status: subscriptionStatus
      })
      
      if (result.success) {
        console.log('✅ Subscription activated successfully!')
        console.log('   - Team ID:', result.teamId)
        console.log('   - Plan:', planId)
        console.log('   - Amount:', amount, 'IDR')
        console.log('   - Reference:', reference)
        console.log('   - Payment Type:', paymentType)
      } else {
        console.error('❌ Subscription activation failed:', result.error)
      }
      
    } else {
      // Handle other statuses (pending, expired, failed)
      console.log(`⏳ Payment ${paymentStatus}:`, externalId)
      
      await updateSubscriptionAfterPayment({
        userId,
        planId,
        merchantOrderId: externalId,
        amount,
        xenditReference: reference,
        status: subscriptionStatus
      })
    }

    const processingTime = Date.now() - startTime
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ CALLBACK PROCESSED SUCCESSFULLY')
    console.log(`⏱️  Processing time: ${processingTime}ms`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // IMPORTANT: Always return 200 to Xendit
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      external_id: externalId,
      status: paymentStatus,
      subscription_status: subscriptionStatus,
      processing_time: `${processingTime}ms`
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('💥 CALLBACK PROCESSING ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error(error)
    console.error(`⏱️  Failed after: ${processingTime}ms`)
    
    // IMPORTANT: Still return 200 to Xendit to avoid retry loops
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal error',
        message: 'Error logged, will investigate manually',
        processing_time: `${processingTime}ms`
      },
      { status: 200 }
    )
  }
}

// GET endpoint for testing callback URL
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Xendit Callback Endpoint',
    status: 'Active',
    timestamp: new Date().toISOString(),
    note: 'This endpoint receives POST requests from Xendit payment gateway',
    security: 'X-Callback-Token header verification required',
    supported_types: ['Virtual Account Payment', 'E-Wallet Payment'],
  })
}
