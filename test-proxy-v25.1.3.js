/**
 * 🧪 V25.1.3 PROXY TEST SCRIPT
 * Test Next.js Proxy response data extraction
 */

const axios = require('axios');

const EDGE_FUNCTION_URL = 'https://cdwzivzaxvdossmwbwkl.supabase.co/functions/v1/xendit-payment-1';
const SUPABASE_ANON_KEY = 'sb_publishable_NRpbZ9WyiPS6lx45tYaImA_Oz2aJVTp';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 V25.1.3 TEST: Direct Edge Function Call');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test Case 1: Virtual Account
async function testVirtualAccount() {
  console.log('📝 TEST 1: Virtual Account (BCA)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const payload = {
    planId: 'starter',
    email: 'test-va@example.com',
    phoneNumber: '081234567890',
    customerName: 'Test User V25.1.3',
    paymentMethod: 'va',
    channelCode: 'BCA_VIRTUAL_ACCOUNT'
  };
  
  console.log('📤 Request Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await axios.post(EDGE_FUNCTION_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      timeout: 15000,
    });
    
    console.log('\n📥 Edge Function Response:');
    console.log('Status:', response.status, response.statusText);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    // Check if response contains payment data
    if (response.data.success && response.data.data) {
      console.log('\n✅ SUCCESS: Edge Function returned payment data');
      console.log('📦 Payment Data Structure:');
      console.log('   - Has account_number:', !!response.data.data.account_number);
      console.log('   - Has bank_code:', !!response.data.data.bank_code);
      console.log('   - Has expected_amount:', !!response.data.data.expected_amount);
      console.log('   - Account Number:', response.data.data.account_number);
      console.log('   - Bank Code:', response.data.data.bank_code);
      console.log('   - Amount:', response.data.data.expected_amount);
      
      return { success: true, data: response.data };
    } else {
      console.log('\n❌ FAILED: Edge Function response missing payment data');
      console.log('Response structure:', Object.keys(response.data));
      return { success: false, error: 'Missing payment data', data: response.data };
    }
  } catch (error) {
    console.error('\n💥 ERROR calling Edge Function:');
    console.error('Error message:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    return { success: false, error: error.message };
  }
}

// Test Case 2: E-Wallet
async function testEWallet() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 TEST 2: E-Wallet (OVO)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const payload = {
    planId: 'basic',
    email: 'test-ovo@example.com',
    phoneNumber: '081234567890',
    customerName: 'Test User V25.1.3 OVO',
    paymentMethod: 'ewallet',
    channelCode: 'ID_OVO'
  };
  
  console.log('📤 Request Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await axios.post(EDGE_FUNCTION_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      timeout: 15000,
    });
    
    console.log('\n📥 Edge Function Response:');
    console.log('Status:', response.status, response.statusText);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    // Check if response contains payment data
    if (response.data.success && response.data.data) {
      const hasCheckoutUrl = !!(response.data.data.checkout_url || 
                                 response.data.data.actions?.mobile_deeplink_checkout_url ||
                                 response.data.data.actions?.desktop_web_checkout_url);
      
      console.log('\n✅ SUCCESS: Edge Function returned payment data');
      console.log('📦 Payment Data Structure:');
      console.log('   - Has checkout_url:', !!response.data.data.checkout_url);
      console.log('   - Has actions:', !!response.data.data.actions);
      console.log('   - Has charge_amount:', !!response.data.data.charge_amount);
      console.log('   - Checkout URL:', response.data.data.checkout_url || 
                                        response.data.data.actions?.mobile_deeplink_checkout_url ||
                                        response.data.data.actions?.desktop_web_checkout_url);
      console.log('   - Amount:', response.data.data.charge_amount);
      
      if (!hasCheckoutUrl) {
        console.log('\n⚠️ WARNING: No checkout URL found in response!');
        return { success: false, error: 'Missing checkout URL', data: response.data };
      }
      
      return { success: true, data: response.data };
    } else {
      console.log('\n❌ FAILED: Edge Function response missing payment data');
      console.log('Response structure:', Object.keys(response.data));
      return { success: false, error: 'Missing payment data', data: response.data };
    }
  } catch (error) {
    console.error('\n💥 ERROR calling Edge Function:');
    console.error('Error message:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);
    return { success: false, error: error.message };
  }
}

// Run tests
(async () => {
  try {
    const vaResult = await testVirtualAccount();
    const ewalletResult = await testEWallet();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Virtual Account Test:', vaResult.success ? '✅ PASS' : '❌ FAIL');
    console.log('E-Wallet Test:', ewalletResult.success ? '✅ PASS' : '❌ FAIL');
    
    if (vaResult.success && ewalletResult.success) {
      console.log('\n🎉 ALL TESTS PASSED! Edge Function is working correctly.');
      console.log('✅ Next.js Proxy should be able to extract payment data successfully.');
      process.exit(0);
    } else {
      console.log('\n❌ SOME TESTS FAILED. Edge Function needs debugging.');
      console.log('Issue: Edge Function is not returning complete payment data from Xendit API.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error);
    process.exit(1);
  }
})();
