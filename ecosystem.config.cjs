// V20: BRUTAL ENVIRONMENT PURGE
// Completely removed NODE_ENV to eliminate all conflicts
// Next.js will automatically set NODE_ENV based on the command:
// - 'npm run dev' → development (allows xnd_development_ keys)
// - 'npm run build' + 'npm start' → production (would block xnd_development_ keys)
//
// CRITICAL: V20 enforces sandbox-only keys (xnd_development_)
// Application will CRASH if xnd_production_ key is detected

module.exports = {
  apps: [
    {
      name: 'oasis-bi-xendit',
      script: 'npm',
      args: 'run dev',
      env: {
        // V20 CRITICAL: ZERO environment overrides - pure Next.js control
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M'
    }
  ]
}
