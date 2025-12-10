// V21: EXPLICIT DEVELOPMENT MODE FOR PM2
// Forces NODE_ENV=development explicitly to prevent Vercel override conflicts
// 
// ROOT CAUSE IDENTIFIED:
// - Vercel automatically sets NODE_ENV=production during build
// - Next.js respects Vercel's NODE_ENV=production
// - Xendit API validates environment consistency:
//   * xnd_development_ keys require environment: 'test' or NODE_ENV: 'development'
//   * NODE_ENV=production + xnd_development_ key = 401 INVALID API KEY
//
// V21 FIX:
// - Explicitly set NODE_ENV=development in PM2 for local development
// - lib/xendit.ts forces environment: 'test' regardless of NODE_ENV
// - For Vercel deployment: Set NODE_ENV=development in Vercel environment variables
//
// CRITICAL: V21 enforces sandbox-only keys (xnd_development_)
// Application will CRASH if xnd_production_ key is detected

module.exports = {
  apps: [
    {
      name: 'oasis-bi-xendit',
      script: 'npm',
      args: 'run dev',
      env: {
        // V21 CRITICAL FIX: Explicitly set NODE_ENV to development
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M'
    }
  ]
}
