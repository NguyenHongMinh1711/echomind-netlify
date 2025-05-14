// Simple test script to verify frontend functionality

console.log('Starting frontend test...');

// Test 1: Check if package.json exists
import { existsSync } from 'fs';
if (existsSync('./package.json')) {
  console.log('✅ package.json exists');
} else {
  console.error('❌ package.json not found');
}

// Test 2: Check if src directory exists
if (existsSync('./src')) {
  console.log('✅ src directory exists');
} else {
  console.error('❌ src directory not found');
}

// Test 3: Check if main components exist
const componentsPath = './src/components';
if (existsSync(componentsPath)) {
  console.log('✅ components directory exists');
  
  // Check for key component directories
  const componentDirs = ['auth', 'chat', 'common', 'journal', 'resources', 'user'];
  let foundDirs = 0;
  
  componentDirs.forEach(dir => {
    if (existsSync(`${componentsPath}/${dir}`)) {
      console.log(`  ✅ ${dir} components exist`);
      foundDirs++;
    } else {
      console.log(`  ❓ ${dir} components not found`);
    }
  });
  
  console.log(`Found ${foundDirs}/${componentDirs.length} component directories`);
} else {
  console.error('❌ components directory not found');
}

// Test 4: Check if contexts exist
const contextsPath = './src/contexts';
if (existsSync(contextsPath)) {
  console.log('✅ contexts directory exists');
  
  // Check for key contexts
  const contextFiles = ['AuthContext.tsx', 'SupabaseContext.tsx', 'ThemeContext.tsx'];
  let foundContexts = 0;
  
  contextFiles.forEach(file => {
    if (existsSync(`${contextsPath}/${file}`)) {
      console.log(`  ✅ ${file} exists`);
      foundContexts++;
    } else {
      console.log(`  ❓ ${file} not found`);
    }
  });
  
  console.log(`Found ${foundContexts}/${contextFiles.length} context files`);
} else {
  console.error('❌ contexts directory not found');
}

console.log('Frontend test completed.');
