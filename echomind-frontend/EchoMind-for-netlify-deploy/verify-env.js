/**
 * Environment Variable Verification Script
 *
 * This script verifies that all required environment variables are set
 * and properly formatted. It can be run in different environments to ensure
 * consistent configuration.
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define required environment variables by category
const requiredVariables = {
  supabase: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ],
  api: [
    'VITE_DEFAULT_GEMINI_API_KEY'
  ],
  app: [
    'VITE_APP_NAME',
    'VITE_APP_DESCRIPTION',
    'VITE_APP_VERSION',
    'VITE_APP_ENV'
  ],
  features: [
    'VITE_ENABLE_OFFLINE_MODE',
    'VITE_ENABLE_PUSH_NOTIFICATIONS',
    'VITE_ENABLE_ANALYTICS',
    'VITE_ENABLE_PERFORMANCE_MONITORING',
    'VITE_ENABLE_ERROR_REPORTING'
  ],
  security: [
    'VITE_ALLOWED_ORIGINS',
    'VITE_CSP_MODE'
  ]
};

// Optional variables that should be validated if present
const optionalVariables = {
  analytics: [
    'VITE_GA_MEASUREMENT_ID'
  ],
  notifications: [
    'VITE_VAPID_PUBLIC_KEY'
  ]
};

// Validation rules for specific variables
const validationRules = {
  'VITE_SUPABASE_URL': (value) => {
    return value.startsWith('https://') && value.includes('.supabase.co');
  },
  'VITE_SUPABASE_ANON_KEY': (value) => {
    return value.length > 20;
  },
  'VITE_DEFAULT_GEMINI_API_KEY': (value) => {
    return value.startsWith('AIza');
  },
  'VITE_APP_ENV': (value) => {
    return ['development', 'test', 'production'].includes(value);
  },
  'VITE_ENABLE_OFFLINE_MODE': (value) => {
    return ['true', 'false'].includes(value.toLowerCase());
  },
  'VITE_ENABLE_PUSH_NOTIFICATIONS': (value) => {
    return ['true', 'false'].includes(value.toLowerCase());
  },
  'VITE_ENABLE_ANALYTICS': (value) => {
    return ['true', 'false'].includes(value.toLowerCase());
  },
  'VITE_ENABLE_PERFORMANCE_MONITORING': (value) => {
    return ['true', 'false'].includes(value.toLowerCase());
  },
  'VITE_ENABLE_ERROR_REPORTING': (value) => {
    return ['true', 'false'].includes(value.toLowerCase());
  },
  'VITE_CSP_MODE': (value) => {
    return ['strict', 'moderate', 'relaxed'].includes(value);
  }
};

// Load environment variables
function loadEnvFile(envFile) {
  try {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(envPath));
      return envConfig;
    }
  } catch (error) {
    console.error(`Error loading ${envFile}:`, error.message);
  }
  return {};
}

// Verify environment variables
function verifyEnvironment(env, envName) {
  console.log(`\nVerifying ${envName} environment variables:`);

  let missingVars = [];
  let invalidVars = [];
  let warnings = [];

  // Check required variables
  Object.entries(requiredVariables).forEach(([category, vars]) => {
    console.log(`\n${category.toUpperCase()} VARIABLES:`);

    vars.forEach(varName => {
      const value = env[varName];

      if (!value) {
        console.log(`❌ ${varName}: Missing`);
        missingVars.push(varName);
        return;
      }

      // Check validation rules if they exist
      if (validationRules[varName] && !validationRules[varName](value)) {
        console.log(`⚠️ ${varName}: Invalid format - ${maskValue(varName, value)}`);
        invalidVars.push(varName);
        return;
      }

      console.log(`✅ ${varName}: ${maskValue(varName, value)}`);
    });
  });

  // Check optional variables
  Object.entries(optionalVariables).forEach(([category, vars]) => {
    let categoryPrinted = false;

    vars.forEach(varName => {
      const value = env[varName];

      if (value) {
        if (!categoryPrinted) {
          console.log(`\n${category.toUpperCase()} VARIABLES (Optional):`);
          categoryPrinted = true;
        }

        // Check validation rules if they exist
        if (validationRules[varName] && !validationRules[varName](value)) {
          console.log(`⚠️ ${varName}: Invalid format - ${maskValue(varName, value)}`);
          warnings.push(varName);
          return;
        }

        console.log(`✅ ${varName}: ${maskValue(varName, value)}`);
      }
    });
  });

  // Summary
  console.log('\nVERIFICATION SUMMARY:');
  if (missingVars.length === 0 && invalidVars.length === 0) {
    console.log('✅ All required environment variables are properly configured.');
  } else {
    if (missingVars.length > 0) {
      console.log(`❌ Missing required variables: ${missingVars.join(', ')}`);
    }
    if (invalidVars.length > 0) {
      console.log(`⚠️ Invalid variables: ${invalidVars.join(', ')}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`⚠️ Warnings for optional variables: ${warnings.join(', ')}`);
  }

  return {
    missingVars,
    invalidVars,
    warnings,
    isValid: missingVars.length === 0 && invalidVars.length === 0
  };
}

// Mask sensitive values for display
function maskValue(varName, value) {
  const sensitiveVars = [
    'VITE_SUPABASE_ANON_KEY',
    'VITE_DEFAULT_GEMINI_API_KEY',
    'VITE_GEMINI_API_KEY',
    'VITE_VAPID_PUBLIC_KEY'
  ];

  if (sensitiveVars.includes(varName)) {
    if (value.length <= 8) return '********';
    return `${value.substring(0, 4)}${'*'.repeat(value.length - 8)}${value.substring(value.length - 4)}`;
  }

  return value;
}

// Main function
function main() {
  const envArg = process.argv[2] || '.env';
  const env = loadEnvFile(envArg);

  console.log('='.repeat(50));
  console.log(`ENVIRONMENT VARIABLE VERIFICATION - ${envArg.toUpperCase()}`);
  console.log('='.repeat(50));

  const result = verifyEnvironment(env, envArg);

  console.log('\n' + '='.repeat(50));
  return result.isValid;
}

// Run the script
main();

export { verifyEnvironment, loadEnvFile, main };
