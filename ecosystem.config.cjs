// V19: Environment Conflict Resolution
// Removed explicit NODE_ENV to prevent Next.js override warnings
// Next.js will automatically set NODE_ENV based on the command:
// - 'npm run dev' → development
// - 'npm run build' + 'npm start' → production

module.exports = {
  apps: [
    {
      name: 'oasis-bi-xendit',
      script: 'npm',
      args: 'run dev',
      env: {
        // V19: NO explicit NODE_ENV here - let Next.js decide
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M'
    }
  ]
}
