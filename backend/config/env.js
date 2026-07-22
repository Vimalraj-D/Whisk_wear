/**
 * Validates that all required environment variables are present at startup.
 * Fails fast with a clear message instead of crashing mid-request.
 */
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_JWT_SECRET',
  'USER_JWT_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
];

const recommendedVars = [
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'FRONTEND_URL',
];

function validateEnv() {
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error(`\n FATAL: Missing required environment variables:\n   ${missing.join('\n   ')}\n`);
    process.exit(1);
  }

  // Warn about weak admin JWT secret
  const adminSecret = process.env.ADMIN_JWT_SECRET;
  if (adminSecret && adminSecret.length < 32 && /^\d+$/.test(adminSecret)) {
    console.warn(
      '\n WARNING: ADMIN_JWT_SECRET appears to be a short numeric string.\n' +
      '   Generate a strong secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"\n'
    );
  }

  const missingRecommended = recommendedVars.filter(v => !process.env[v]);
  if (missingRecommended.length > 0) {
    console.warn(`\n WARNING: Missing recommended environment variables:\n   ${missingRecommended.join('\n   ')}\n`);
  }
}

module.exports = { validateEnv };
