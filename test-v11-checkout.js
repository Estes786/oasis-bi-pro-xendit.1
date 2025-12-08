/**
 * V11 CHECKOUT TEST - COMPREHENSIVE LOGGING
 * Test checkout flow and capture detailed error logs
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testCheckoutFlow() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 V11 CHECKOUT FLOW TEST - STARTING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    // Test 1: Check API health
    console.log('\n📍 Test 1: API Health Check');
    const healthResponse = await axios.get(`${API_BASE}/api/xendit/checkout`);
    console.log('✅ API Health:', healthResponse.data);
    
    // Test 2: Create Virtual Account payment
    console.log('\n📍 Test 2: Create VA Payment (BCA)');
    const vaPayload = {
      planId: 'professional',
      email: 'test@example.com',
      phoneNumber: '08123456789',
      customerName: 'Test User V11',
      paymentMethod: 'va',
      bankCode: 'BCA'
    };
    
    console.log('📤 VA Request Payload:', vaPayload);
    
    try {
      const vaResponse = await axios.post(`${API_BASE}/api/xendit/checkout`, vaPayload);
      console.log('✅ VA Payment Created Successfully!');
      console.log('📦 Response Data:', JSON.stringify(vaResponse.data, null, 2));
      
      if (vaResponse.data.success && vaResponse.data.data.vaNumber) {
        console.log('\n🎉 VA NUMBER RECEIVED:', vaResponse.data.data.vaNumber);
        console.log('   Bank:', vaResponse.data.data.bankCode);
        console.log('   Amount:', vaResponse.data.data.amount);
        console.log('   Expiry:', vaResponse.data.data.expiryDate);
      }
    } catch (vaError) {
      console.error('\n❌ VA PAYMENT CREATION FAILED!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🐛 Error Type:', vaError.constructor.name);
      console.error('🐛 Error Message:', vaError.message);
      console.error('🐛 HTTP Status:', vaError.response?.status);
      console.error('🐛 Response Data:', JSON.stringify(vaError.response?.data, null, 2));
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    // Test 3: Create E-Wallet payment
    console.log('\n📍 Test 3: Create E-Wallet Payment (OVO)');
    const ewalletPayload = {
      planId: 'starter',
      email: 'test@example.com',
      phoneNumber: '08123456789',
      customerName: 'Test User V11',
      paymentMethod: 'ewallet',
      ewalletType: 'OVO'
    };
    
    console.log('📤 E-Wallet Request Payload:', ewalletPayload);
    
    try {
      const ewalletResponse = await axios.post(`${API_BASE}/api/xendit/checkout`, ewalletPayload);
      console.log('✅ E-Wallet Payment Created Successfully!');
      console.log('📦 Response Data:', JSON.stringify(ewalletResponse.data, null, 2));
      
      if (ewalletResponse.data.success && ewalletResponse.data.data.checkoutUrl) {
        console.log('\n🎉 CHECKOUT URL RECEIVED:', ewalletResponse.data.data.checkoutUrl);
        console.log('   Charge ID:', ewalletResponse.data.data.chargeId);
        console.log('   Amount:', ewalletResponse.data.data.amount);
      }
    } catch (ewalletError) {
      console.error('\n❌ E-WALLET PAYMENT CREATION FAILED!');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🐛 Error Type:', ewalletError.constructor.name);
      console.error('🐛 Error Message:', ewalletError.message);
      console.error('🐛 HTTP Status:', ewalletError.response?.status);
      console.error('🐛 Response Data:', JSON.stringify(ewalletError.response?.data, null, 2));
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ V11 CHECKOUT FLOW TEST - COMPLETED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('\n💥 TEST SUITE ERROR:');
    console.error(error.message);
    console.error(error.stack);
  }
}

// Run test
testCheckoutFlow();
