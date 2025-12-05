#!/usr/bin/env node

/**
 * Environment Setup Checker
 * Run: node check-env.js
 */

console.log('🔍 Checking Backend Environment Configuration...\n');

const requiredVars = [
  'PORT',
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
];

const optionalVars = [
  'OLLAMA_BASE_URL',
  'OLLAMA_MODEL',
  'EVYNTE_API_URL',
  'EVYNTE_API_KEY',
  'FRONTEND_URL',
  'AI_CONFIDENCE_THRESHOLD',
  'MAX_VECTOR_RESULTS',
];

let hasErrors = false;
let hasWarnings = false;

console.log('✅ Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your_') || value.includes('xxxxx')) {
    console.log(`  ❌ ${varName}: NOT SET or using placeholder`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const maskedValue = value.length > 20 
      ? value.substring(0, 10) + '...' + value.substring(value.length - 4)
      : value.substring(0, 5) + '...';
    console.log(`  ✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n⚠️  Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your_')) {
    console.log(`  ⚠️  ${varName}: NOT SET`);
    hasWarnings = true;
  } else {
    const maskedValue = value.length > 20 
      ? value.substring(0, 10) + '...'
      : value;
    console.log(`  ✅ ${varName}: ${maskedValue}`);
  }
});

console.log('\n📊 Summary:');
if (hasErrors) {
  console.log('  ❌ ERRORS: Required environment variables are missing!');
  console.log('  → Please update backend/.env with your actual API keys');
  console.log('  → See backend/.env.example for reference\n');
  process.exit(1);
} else {
  console.log('  ✅ All required variables are set!');
}

if (hasWarnings) {
  console.log('  ⚠️  WARNINGS: Some optional variables are not configured');
  console.log('  → For full AI features, configure Ollama and Evynte API');
}

console.log('\n🎉 Configuration check complete!\n');
