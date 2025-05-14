/**
 * Security Audit Script for EchoMind Frontend
 *
 * This script performs a security audit of the EchoMind frontend codebase,
 * checking for common security issues and best practices.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  sourceDirs: ['src'],
  excludeDirs: ['node_modules', 'dist', 'build', 'coverage'],
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
  securityChecks: {
    hardcodedSecrets: {
      patterns: [
        /['"]AIza[0-9A-Za-z\\-_]{35}['"]/g, // Google API keys
        /['"]sk-[0-9A-Za-z]{32,}['"]/g, // OpenAI API keys
        /['"]eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*['"]/g, // JWT tokens
        /['"][0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}['"]/g, // UUIDs
        /['"][0-9a-f]{32,}['"]/g, // API keys, tokens
        /password\s*:\s*['"][^'"]{3,}['"]/gi, // Passwords
        /apiKey\s*:\s*['"][^'"]{3,}['"]/gi, // API keys
        /secret\s*:\s*['"][^'"]{3,}['"]/gi, // Secrets
        /key\s*:\s*['"][^'"]{16,}['"]/gi, // Keys
      ],
      exclude: [
        /import\.meta\.env/,
        /process\.env/,
        /\${[^}]+}/,
        /example/i,
        /placeholder/i,
        /mock/i,
        /test/i,
      ]
    },
    insecureRandomness: {
      patterns: [
        /Math\.random\(\)/g,
      ]
    },
    dangerousJSPatterns: {
      patterns: [
        /eval\s*\(/g,
        /new Function\s*\(/g,
        /document\.write\s*\(/g,
        /innerHTML\s*=/g,
        /dangerouslySetInnerHTML/g,
      ]
    },
    insecureStorageUsage: {
      patterns: [
        /localStorage\.setItem\s*\(\s*['"]token['"]/gi,
        /localStorage\.setItem\s*\(\s*['"]auth['"]/gi,
        /localStorage\.setItem\s*\(\s*['"]password['"]/gi,
        /localStorage\.setItem\s*\(\s*['"]secret['"]/gi,
        /localStorage\.setItem\s*\(\s*['"]key['"]/gi,
        /sessionStorage\.setItem\s*\(\s*['"]token['"]/gi,
        /sessionStorage\.setItem\s*\(\s*['"]auth['"]/gi,
        /sessionStorage\.setItem\s*\(\s*['"]password['"]/gi,
        /sessionStorage\.setItem\s*\(\s*['"]secret['"]/gi,
        /sessionStorage\.setItem\s*\(\s*['"]key['"]/gi,
      ]
    },
    missingInputValidation: {
      patterns: [
        /\.value/g,
        /e\.target\.value/g,
        /\[\s*['"]value['"]\s*\]/g,
      ],
      contextLines: 5,
      validationPatterns: [
        /validate/i,
        /sanitize/i,
        /isValid/i,
        /trim/i,
        /test\s*\(/i,
        /match\s*\(/i,
        /schema/i,
        /yup/i,
        /formik/i,
        /zod/i,
      ]
    }
  }
};

// Results storage
const results = {
  hardcodedSecrets: [],
  insecureRandomness: [],
  dangerousJSPatterns: [],
  insecureStorageUsage: [],
  missingInputValidation: [],
};

// Helper functions
function getAllFiles(dir, extensions, excludeDirs = []) {
  let files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(item)) {
        files = files.concat(getAllFiles(fullPath, extensions, excludeDirs));
      }
    } else if (extensions.includes(path.extname(fullPath))) {
      files.push(fullPath);
    }
  }

  return files;
}

function checkFile(filePath, checks) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Check for hardcoded secrets
  if (checks.hardcodedSecrets) {
    for (const pattern of checks.hardcodedSecrets.patterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Check if matches are excluded
        const filteredMatches = matches.filter(match => {
          return !checks.hardcodedSecrets.exclude.some(excludePattern =>
            excludePattern.test(content.substring(
              Math.max(0, content.indexOf(match) - 50),
              content.indexOf(match) + match.length + 50
            ))
          );
        });

        if (filteredMatches.length > 0) {
          for (const match of filteredMatches) {
            const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
            results.hardcodedSecrets.push({
              file: filePath,
              line: lineNumber,
              match: match.substring(0, 20) + '...',
              context: lines[lineNumber - 1].trim()
            });
          }
        }
      }
    }
  }

  // Check for insecure randomness
  if (checks.insecureRandomness) {
    for (const pattern of checks.insecureRandomness.patterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
          results.insecureRandomness.push({
            file: filePath,
            line: lineNumber,
            match: match,
            context: lines[lineNumber - 1].trim()
          });
        }
      }
    }
  }

  // Check for dangerous JS patterns
  if (checks.dangerousJSPatterns) {
    for (const pattern of checks.dangerousJSPatterns.patterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
          results.dangerousJSPatterns.push({
            file: filePath,
            line: lineNumber,
            match: match,
            context: lines[lineNumber - 1].trim()
          });
        }
      }
    }
  }

  // Check for insecure storage usage
  if (checks.insecureStorageUsage) {
    for (const pattern of checks.insecureStorageUsage.patterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const lineNumber = content.substring(0, content.indexOf(match)).split('\n').length;
          results.insecureStorageUsage.push({
            file: filePath,
            line: lineNumber,
            match: match,
            context: lines[lineNumber - 1].trim()
          });
        }
      }
    }
  }

  // Check for missing input validation
  if (checks.missingInputValidation) {
    for (const pattern of checks.missingInputValidation.patterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const matchIndex = content.indexOf(match);
          const lineNumber = content.substring(0, matchIndex).split('\n').length;

          // Get context around the match
          const contextStart = Math.max(0, lineNumber - checks.missingInputValidation.contextLines - 1);
          const contextEnd = Math.min(lines.length - 1, lineNumber + checks.missingInputValidation.contextLines - 1);
          const contextLines = lines.slice(contextStart, contextEnd + 1);
          const contextContent = contextLines.join('\n');

          // Check if there's validation nearby
          const hasValidation = checks.missingInputValidation.validationPatterns.some(
            validationPattern => validationPattern.test(contextContent)
          );

          if (!hasValidation) {
            results.missingInputValidation.push({
              file: filePath,
              line: lineNumber,
              match: match,
              context: lines[lineNumber - 1].trim()
            });
          }
        }
      }
    }
  }
}

// Main function
function runSecurityAudit() {
  console.log('='.repeat(50));
  console.log('ECHOMIND FRONTEND SECURITY AUDIT');
  console.log('='.repeat(50));
  console.log('\nScanning files...');

  let allFiles = [];
  for (const dir of config.sourceDirs) {
    allFiles = allFiles.concat(
      getAllFiles(dir, config.fileExtensions, config.excludeDirs)
    );
  }

  console.log(`Found ${allFiles.length} files to scan.\n`);

  // Process each file
  for (const file of allFiles) {
    checkFile(file, config.securityChecks);
  }

  // Print results
  console.log('\nSECURITY AUDIT RESULTS:');
  console.log('='.repeat(50));

  let totalIssues = 0;

  // Hardcoded secrets
  if (results.hardcodedSecrets.length > 0) {
    console.log(`\n⚠️ HARDCODED SECRETS: ${results.hardcodedSecrets.length} issues found`);
    for (const issue of results.hardcodedSecrets) {
      console.log(`  - ${issue.file}:${issue.line} - ${issue.match}`);
      console.log(`    Context: ${issue.context}`);
    }
    totalIssues += results.hardcodedSecrets.length;
  } else {
    console.log('\n✅ HARDCODED SECRETS: No issues found');
  }

  // Insecure randomness
  if (results.insecureRandomness.length > 0) {
    console.log(`\n⚠️ INSECURE RANDOMNESS: ${results.insecureRandomness.length} issues found`);
    for (const issue of results.insecureRandomness) {
      console.log(`  - ${issue.file}:${issue.line} - ${issue.match}`);
      console.log(`    Context: ${issue.context}`);
    }
    totalIssues += results.insecureRandomness.length;
  } else {
    console.log('\n✅ INSECURE RANDOMNESS: No issues found');
  }

  // Dangerous JS patterns
  if (results.dangerousJSPatterns.length > 0) {
    console.log(`\n⚠️ DANGEROUS JS PATTERNS: ${results.dangerousJSPatterns.length} issues found`);
    for (const issue of results.dangerousJSPatterns) {
      console.log(`  - ${issue.file}:${issue.line} - ${issue.match}`);
      console.log(`    Context: ${issue.context}`);
    }
    totalIssues += results.dangerousJSPatterns.length;
  } else {
    console.log('\n✅ DANGEROUS JS PATTERNS: No issues found');
  }

  // Insecure storage usage
  if (results.insecureStorageUsage.length > 0) {
    console.log(`\n⚠️ INSECURE STORAGE USAGE: ${results.insecureStorageUsage.length} issues found`);
    for (const issue of results.insecureStorageUsage) {
      console.log(`  - ${issue.file}:${issue.line} - ${issue.match}`);
      console.log(`    Context: ${issue.context}`);
    }
    totalIssues += results.insecureStorageUsage.length;
  } else {
    console.log('\n✅ INSECURE STORAGE USAGE: No issues found');
  }

  // Missing input validation
  if (results.missingInputValidation.length > 0) {
    console.log(`\n⚠️ MISSING INPUT VALIDATION: ${results.missingInputValidation.length} issues found`);
    for (const issue of results.missingInputValidation) {
      console.log(`  - ${issue.file}:${issue.line} - ${issue.match}`);
      console.log(`    Context: ${issue.context}`);
    }
    totalIssues += results.missingInputValidation.length;
  } else {
    console.log('\n✅ MISSING INPUT VALIDATION: No issues found');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (totalIssues === 0) {
    console.log('✅ SECURITY AUDIT PASSED: No issues found');
  } else {
    console.log(`⚠️ SECURITY AUDIT FOUND ${totalIssues} ISSUES`);
  }
  console.log('='.repeat(50));

  return totalIssues === 0;
}

// Run the audit
runSecurityAudit();

export default runSecurityAudit;
