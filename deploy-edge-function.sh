#!/bin/bash

# 🚀 QUICK EDGE FUNCTION DEPLOYMENT SCRIPT
# Version: V25.1.4
# Purpose: Deploy xendit-payment-1 Edge Function to Supabase

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 SUPABASE EDGE FUNCTION DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Configuration
PROJECT_REF="cdwzivzaxvdossmwbwkl"
FUNCTION_NAME="xendit-payment-1"
SUPABASE_TOKEN="sbp_046e6ce52a5240498c93d6743697e8b5b7279b14"

echo "📋 Configuration:"
echo "   Project Ref: $PROJECT_REF"
echo "   Function: $FUNCTION_NAME"
echo "   Token: ${SUPABASE_TOKEN:0:15}***"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "📦 Installing Supabase CLI..."
    
    # Try npm install
    if command -v npm &> /dev/null; then
        npm install -g supabase
    else
        echo "❌ npm not found. Please install Node.js and npm first."
        echo ""
        echo "Alternative: Install Supabase CLI manually:"
        echo "   macOS: brew install supabase/tap/supabase"
        echo "   Linux: curl -fsSL https://cli.supabase.com/install.sh | sh"
        echo "   Windows: scoop bucket add supabase https://github.com/supabase/scoop-bucket.git"
        echo "            scoop install supabase"
        exit 1
    fi
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Login to Supabase
echo "🔐 Logging in to Supabase..."
echo "$SUPABASE_TOKEN" | supabase login --no-browser

if [ $? -ne 0 ]; then
    echo "❌ Login failed!"
    echo ""
    echo "Please login manually:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Login successful"
echo ""

# Link project
echo "🔗 Linking to project $PROJECT_REF..."
supabase link --project-ref "$PROJECT_REF"

if [ $? -ne 0 ]; then
    echo "❌ Project link failed!"
    exit 1
fi

echo "✅ Project linked"
echo ""

# Deploy Edge Function
echo "🚀 Deploying Edge Function: $FUNCTION_NAME..."
echo ""
supabase functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_REF"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Manual deployment options:"
    echo "1. Via Supabase Dashboard:"
    echo "   https://app.supabase.com/project/$PROJECT_REF/functions"
    echo ""
    echo "2. Via CLI with debug:"
    echo "   supabase functions deploy $FUNCTION_NAME --project-ref $PROJECT_REF --debug"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify deployment
echo "🧪 Verifying deployment..."
echo ""
echo "Testing Edge Function..."

TEST_RESPONSE=$(curl -s -X POST \
  "https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkd3ppdnpheHZkb3NzbXdid2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMjA4NjAsImV4cCI6MjA4MDY5Njg2MH0.u4yPiDxrB9r1u-9kqA3Zno5Eyum-rHFv8C6AmP3cJ2Y" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "starter",
    "email": "test@example.com",
    "phoneNumber": "081234567890",
    "customerName": "Test Deploy Verification",
    "paymentMethod": "va",
    "channelCode": "BCA_VIRTUAL_ACCOUNT"
  }')

echo "📥 Response:"
echo "$TEST_RESPONSE" | jq '.' 2>/dev/null || echo "$TEST_RESPONSE"
echo ""

# Check if response contains success or error
if echo "$TEST_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Verification PASSED: Edge Function is working!"
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE AND VERIFIED!"
    echo ""
    echo "Next steps:"
    echo "1. Test checkout flow in your app"
    echo "2. Check frontend receives VA number"
    echo "3. Monitor Supabase logs for any issues"
    echo ""
    echo "Supabase Logs: https://app.supabase.com/project/$PROJECT_REF/functions/$FUNCTION_NAME/logs"
elif echo "$TEST_RESPONSE" | grep -q 'EXPECTED_AMOUNT_REQUIRED_ERROR'; then
    echo "❌ Verification FAILED: Still getting old error!"
    echo ""
    echo "Possible issues:"
    echo "1. Deployment didn't update the function"
    echo "2. Cache issue - wait 1-2 minutes and try again"
    echo "3. Need to force refresh deployment"
    echo ""
    echo "Try:"
    echo "   supabase functions deploy $FUNCTION_NAME --project-ref $PROJECT_REF --no-verify-jwt"
else
    echo "⚠️ Verification inconclusive - manual check recommended"
    echo ""
    echo "Check logs:"
    echo "   supabase functions logs $FUNCTION_NAME --project-ref $PROJECT_REF"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
