// ✅ V14-DEBUG-PANEL-2025-12-09
// CRITICAL DEBUG COMPONENT: Raw API Response Inspector
// Purpose: Display RAW network response from /api/xendit/checkout to prove point of failure
// This component will show: Loading state, Error messages, and RAW JSON response

import React from 'react';
import { AlertCircle, CheckCircle, Loader2, Code } from 'lucide-react';

interface DebugPanelProps {
  title?: string;
  loading?: boolean;
  error?: string | null;
  data?: any;
  rawResponse?: any;
  showRaw?: boolean;
}

export default function DebugPanel({
  title = "🔍 V14 Debug Panel - API Response Inspector",
  loading = false,
  error = null,
  data = null,
  rawResponse = null,
  showRaw = true,
}: DebugPanelProps) {
  const timestamp = new Date().toISOString();

  return (
    <div className="mt-8 border-4 border-yellow-500 bg-yellow-50 rounded-lg p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-yellow-900 flex items-center">
          <Code className="w-6 h-6 mr-2" />
          {title}
        </h3>
        <span className="text-xs text-yellow-700 font-mono">{timestamp}</span>
      </div>

      {/* Status Indicators */}
      <div className="space-y-3 mb-4">
        {/* Loading State */}
        <div className={`flex items-center p-3 rounded-lg ${loading ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 border border-gray-300'}`}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
              <span className="font-semibold text-blue-900">🔄 LOADING: API Request in Progress...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Loading: Complete</span>
            </>
          )}
        </div>

        {/* Error State */}
        <div className={`flex items-center p-3 rounded-lg ${error ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-100 border border-gray-300'}`}>
          {error ? (
            <>
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              <div className="flex-1">
                <span className="font-semibold text-red-900 block">❌ ERROR DETECTED:</span>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Error: None</span>
            </>
          )}
        </div>

        {/* Data State */}
        <div className={`flex items-center p-3 rounded-lg ${data ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border border-gray-300'}`}>
          {data ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              <span className="font-semibold text-green-900">✅ DATA RECEIVED: API returned data successfully</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-gray-700">Data: Not Available</span>
            </>
          )}
        </div>
      </div>

      {/* Raw Response Display */}
      {showRaw && (
        <div className="space-y-3">
          {/* Data Object */}
          {data && (
            <div>
              <h4 className="font-bold text-yellow-900 mb-2 flex items-center">
                📦 Parsed Data Object:
              </h4>
              <pre className="bg-white border-2 border-green-400 rounded p-4 overflow-auto max-h-96 text-xs font-mono">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}

          {/* Raw Response */}
          {rawResponse && (
            <div>
              <h4 className="font-bold text-yellow-900 mb-2 flex items-center">
                🔍 Raw API Response:
              </h4>
              <pre className="bg-white border-2 border-yellow-400 rounded p-4 overflow-auto max-h-96 text-xs font-mono">
                {JSON.stringify(rawResponse, null, 2)}
              </pre>
            </div>
          )}

          {/* No Data Message */}
          {!data && !rawResponse && !loading && !error && (
            <div className="bg-gray-100 border-2 border-gray-400 rounded p-4 text-center">
              <p className="text-gray-600 font-semibold">⚠️ No API call has been made yet</p>
              <p className="text-gray-500 text-sm mt-1">Debug panel waiting for API request...</p>
            </div>
          )}
        </div>
      )}

      {/* Diagnostic Info */}
      <div className="mt-4 pt-4 border-t-2 border-yellow-400">
        <p className="text-xs text-yellow-800 font-mono">
          <strong>Debug Mode:</strong> Active | 
          <strong> Loading:</strong> {loading ? 'true' : 'false'} | 
          <strong> Has Error:</strong> {error ? 'true' : 'false'} | 
          <strong> Has Data:</strong> {data ? 'true' : 'false'}
        </p>
      </div>
    </div>
  );
}
