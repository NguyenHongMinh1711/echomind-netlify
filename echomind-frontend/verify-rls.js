/**
 * Supabase Row Level Security (RLS) Verification Script
 *
 * This script verifies that all tables in the Supabase database have
 * appropriate Row Level Security policies configured.
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configuration
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  supabaseKey: process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY,
  expectedTables: [
    'users',
    'journals',
    'chat_sessions',
    'chat_messages',
    'podcasts',
    'stories',
    'daily_prompts'
  ],
  expectedPolicies: {
    users: [
      { name: 'Users can view their own profile', operation: 'SELECT' },
      { name: 'Users can update their own profile', operation: 'UPDATE' }
    ],
    journals: [
      { name: 'Users can view their own journals', operation: 'SELECT' },
      { name: 'Users can insert their own journals', operation: 'INSERT' },
      { name: 'Users can update their own journals', operation: 'UPDATE' },
      { name: 'Users can delete their own journals', operation: 'DELETE' }
    ],
    chat_sessions: [
      { name: 'Users can view their own chat sessions', operation: 'SELECT' },
      { name: 'Users can insert their own chat sessions', operation: 'INSERT' },
      { name: 'Users can update their own chat sessions', operation: 'UPDATE' },
      { name: 'Users can delete their own chat sessions', operation: 'DELETE' }
    ],
    chat_messages: [
      { name: 'Users can view messages in their chat sessions', operation: 'SELECT' },
      { name: 'Users can insert messages in their chat sessions', operation: 'INSERT' }
    ],
    podcasts: [
      { name: 'Podcasts are publicly viewable', operation: 'SELECT' }
    ],
    stories: [
      { name: 'Stories are publicly viewable', operation: 'SELECT' }
    ],
    daily_prompts: [
      { name: 'Daily prompts are publicly viewable', operation: 'SELECT' }
    ]
  }
};

// Initialize Supabase client
function initSupabase() {
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('Error: Supabase URL or service key not found in environment variables.');
    console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY are set.');
    process.exit(1);
  }

  return createClient(config.supabaseUrl, config.supabaseKey);
}

// Get all tables in the database
async function getTables(supabase) {
  const { data, error } = await supabase
    .from('pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');

  if (error) {
    console.error('Error fetching tables:', error.message);
    return [];
  }

  return data.map(row => row.tablename);
}

// Get RLS status for a table
async function getRlsStatus(supabase, table) {
  const { data, error } = await supabase
    .from('pg_class')
    .select('relrowsecurity')
    .eq('relname', table)
    .single();

  if (error) {
    console.error(`Error checking RLS status for table ${table}:`, error.message);
    return false;
  }

  return data.relrowsecurity;
}

// Get policies for a table
async function getPolicies(supabase, table) {
  const { data, error } = await supabase
    .from('pg_policies')
    .select('policyname, cmd')
    .eq('tablename', table)
    .eq('schemaname', 'public');

  if (error) {
    console.error(`Error fetching policies for table ${table}:`, error.message);
    return [];
  }

  // Map PostgreSQL command codes to operations
  const cmdMap = {
    'r': 'SELECT',
    'a': 'INSERT',
    'w': 'UPDATE',
    'd': 'DELETE',
    '*': 'ALL'
  };

  return data.map(row => ({
    name: row.policyname,
    operation: cmdMap[row.cmd] || row.cmd
  }));
}

// Verify RLS for all tables
async function verifyRls() {
  console.log('='.repeat(50));
  console.log('SUPABASE ROW LEVEL SECURITY VERIFICATION');
  console.log('='.repeat(50));

  const supabase = initSupabase();

  // Get all tables
  const tables = await getTables(supabase);
  console.log(`\nFound ${tables.length} tables in the database.`);

  // Check if expected tables exist
  const missingTables = config.expectedTables.filter(table => !tables.includes(table));
  if (missingTables.length > 0) {
    console.log(`\n⚠️ Missing tables: ${missingTables.join(', ')}`);
  }

  // Check RLS for each table
  let allTablesSecure = true;
  let allPoliciesCorrect = true;

  for (const table of config.expectedTables) {
    if (!tables.includes(table)) {
      continue;
    }

    console.log(`\nChecking table: ${table}`);

    // Check if RLS is enabled
    const rlsEnabled = await getRlsStatus(supabase, table);
    if (rlsEnabled) {
      console.log(`✅ RLS is enabled for table ${table}`);
    } else {
      console.log(`❌ RLS is NOT enabled for table ${table}`);
      allTablesSecure = false;
      continue;
    }

    // Get policies for the table
    const policies = await getPolicies(supabase, table);
    console.log(`Found ${policies.length} policies for table ${table}:`);

    for (const policy of policies) {
      console.log(`  - ${policy.name} (${policy.operation})`);
    }

    // Check if expected policies exist
    const expectedPolicies = config.expectedPolicies[table] || [];
    const missingPolicies = [];

    for (const expected of expectedPolicies) {
      const found = policies.some(p =>
        p.name === expected.name &&
        (p.operation === expected.operation || p.operation === 'ALL')
      );

      if (!found) {
        missingPolicies.push(expected);
      }
    }

    if (missingPolicies.length > 0) {
      console.log(`❌ Missing policies for table ${table}:`);
      for (const missing of missingPolicies) {
        console.log(`  - ${missing.name} (${missing.operation})`);
      }
      allPoliciesCorrect = false;
    } else if (expectedPolicies.length > 0) {
      console.log(`✅ All expected policies found for table ${table}`);
    } else {
      console.log(`⚠️ No expected policies defined for table ${table}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allTablesSecure && allPoliciesCorrect) {
    console.log('✅ ROW LEVEL SECURITY VERIFICATION PASSED');
    console.log('All tables have RLS enabled and all expected policies are in place.');
  } else {
    console.log('❌ ROW LEVEL SECURITY VERIFICATION FAILED');
    if (!allTablesSecure) {
      console.log('Some tables do not have RLS enabled.');
    }
    if (!allPoliciesCorrect) {
      console.log('Some tables are missing expected policies.');
    }
  }
  console.log('='.repeat(50));

  return allTablesSecure && allPoliciesCorrect;
}

// Run the verification
verifyRls().catch(error => {
  console.error('Error running RLS verification:', error);
  process.exit(1);
});

export default verifyRls;
