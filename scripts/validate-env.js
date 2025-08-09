#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * 
 * This script validates environment configuration files and detects:
 * - Missing required variables
 * - Variable conflicts between packages
 * - Security issues
 * - Inconsistent naming
 * 
 * Usage: node scripts/validate-env.js [--fix] [--strict]
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  rootDir: path.resolve(__dirname, '..'),
  packages: ['admin-backend', 'admin-ui', 'web', 'mobile', 'shared-types'],
  requiredVars: [
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ],
  securityVars: [
    'JWT_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ],
  defaultValues: [
    'your-super-secret-jwt-key-change-in-production',
    'your-jwt-secret-here',
    'your-service-role-key-here',
    'your-anon-key-here',
    'your-database-url-here'
  ]
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class EnvironmentValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.fixes = [];
    this.envFiles = new Map();
    this.variableMap = new Map();
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logHeader(title) {
    this.log(`\n${'='.repeat(60)}`, 'cyan');
    this.log(` ${title}`, 'cyan');
    this.log(`${'='.repeat(60)}`, 'cyan');
  }

  logIssue(issue, type = 'error') {
    const icon = type === 'error' ? '❌' : '⚠️';
    const color = type === 'error' ? 'red' : 'yellow';
    this.log(`${icon} ${issue}`, color);
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  // Scan all environment files
  scanEnvironmentFiles() {
    this.logHeader('SCANNING ENVIRONMENT FILES');
    
    // Root level files
    const rootFiles = [
      '.env',
      '.env.example',
      '.env.development',
      '.env.production',
      '.env.local'
    ];

    rootFiles.forEach(file => {
      const filePath = path.join(CONFIG.rootDir, file);
      if (fs.existsSync(filePath)) {
        this.envFiles.set(file, this.parseEnvFile(filePath));
        this.logInfo(`Found: ${file}`);
      }
    });

    // Package level files
    CONFIG.packages.forEach(pkg => {
      const pkgDir = path.join(CONFIG.rootDir, 'packages', pkg);
      if (fs.existsSync(pkgDir)) {
        const pkgFiles = [
          '.env',
          '.env.example',
          '.env.local',
          '.env.production'
        ];

        pkgFiles.forEach(file => {
          const filePath = path.join(pkgDir, file);
          if (fs.existsSync(filePath)) {
            const key = `${pkg}/${file}`;
            this.envFiles.set(key, this.parseEnvFile(filePath));
            this.logInfo(`Found: ${key}`);
          }
        });
      }
    });

    this.logSuccess(`Scanned ${this.envFiles.size} environment files`);
  }

  // Parse environment file
  parseEnvFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const variables = new Map();
      
      content.split('\n').forEach((line, index) => {
        line = line.trim();
        
        // Skip comments and empty lines
        if (line.startsWith('#') || line === '') return;
        
        // Parse variable
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const [, key, value] = match;
          variables.set(key.trim(), {
            value: value.trim(),
            line: index + 1,
            file: filePath
          });
        }
      });

      return variables;
    } catch (error) {
      this.logIssue(`Error parsing ${filePath}: ${error.message}`);
      return new Map();
    }
  }

  // Validate required variables
  validateRequiredVariables() {
    this.logHeader('VALIDATING REQUIRED VARIABLES');
    
    CONFIG.requiredVars.forEach(varName => {
      let found = false;
      let foundIn = [];

      this.envFiles.forEach((variables, fileName) => {
        if (variables.has(varName)) {
          found = true;
          foundIn.push(fileName);
        }
      });

      if (!found) {
        this.issues.push(`Missing required variable: ${varName}`);
        this.logIssue(`Missing required variable: ${varName}`);
      } else if (foundIn.length > 1) {
        this.warnings.push(`Variable ${varName} defined in multiple files: ${foundIn.join(', ')}`);
        this.logIssue(`Variable ${varName} defined in multiple files: ${foundIn.join(', ')}`, 'warning');
      } else {
        this.logSuccess(`Required variable ${varName} found in ${foundIn[0]}`);
      }
    });
  }

  // Check for security issues
  validateSecurity() {
    this.logHeader('VALIDATING SECURITY');
    
    this.envFiles.forEach((variables, fileName) => {
      variables.forEach((varData, varName) => {
        // Check for default/placeholder values
        if (CONFIG.defaultValues.includes(varData.value)) {
          this.issues.push(`Security issue in ${fileName}: ${varName} has default value`);
          this.logIssue(`Security issue in ${fileName}: ${varName} has default value`);
        }

        // Check for weak JWT secrets
        if (varName === 'JWT_SECRET' && varData.value.length < 32) {
          this.issues.push(`Weak JWT secret in ${fileName}: length < 32 characters`);
          this.logIssue(`Weak JWT secret in ${fileName}: length < 32 characters`);
        }

        // Check for exposed credentials
        if (CONFIG.securityVars.includes(varName) && varData.value.includes('your-')) {
          this.issues.push(`Exposed credential in ${fileName}: ${varName} has placeholder value`);
          this.logIssue(`Exposed credential in ${fileName}: ${varName} has placeholder value`);
        }
      });
    });
  }

  // Check for variable conflicts
  validateVariableConflicts() {
    this.logHeader('CHECKING VARIABLE CONFLICTS');
    
    const allVariables = new Map();
    
    this.envFiles.forEach((variables, fileName) => {
      variables.forEach((varData, varName) => {
        if (!allVariables.has(varName)) {
          allVariables.set(varName, []);
        }
        allVariables.get(varName).push({
          fileName,
          value: varData.value,
          line: varData.line
        });
      });
    });

    // Check for conflicts
    allVariables.forEach((occurrences, varName) => {
      if (occurrences.length > 1) {
        const values = [...new Set(occurrences.map(o => o.value))];
        if (values.length > 1) {
          this.issues.push(`Variable conflict: ${varName} has different values in multiple files`);
          this.logIssue(`Variable conflict: ${varName} has different values in multiple files`);
          
          occurrences.forEach(occ => {
            this.logInfo(`  ${occ.fileName}:${occ.line} = ${occ.value}`);
          });
        }
      }
    });
  }

  // Check for naming inconsistencies
  validateNamingConsistency() {
    this.logHeader('CHECKING NAMING CONSISTENCY');
    
    const namingPatterns = {
      'SUPABASE_URL': ['EXPO_PUBLIC_SUPABASE_URL'],
      'API_URL': ['VITE_API_URL'],
      'DATABASE_URL': ['DB_URL', 'POSTGRES_URL'],
      'REDIS_URL': ['REDIS_HOST', 'REDIS_PORT'],
      'ELASTICSEARCH_URL': ['ES_URL', 'SEARCH_URL']
    };

    Object.entries(namingPatterns).forEach(([standard, alternatives]) => {
      const found = [];
      
      this.envFiles.forEach((variables, fileName) => {
        [...alternatives, standard].forEach(varName => {
          if (variables.has(varName)) {
            found.push({ fileName, varName, value: variables.get(varName).value });
          }
        });
      });

      if (found.length > 1) {
        this.warnings.push(`Naming inconsistency: ${standard} and alternatives found`);
        this.logIssue(`Naming inconsistency: ${standard} and alternatives found`, 'warning');
        
        found.forEach(f => {
          this.logInfo(`  ${f.fileName}: ${f.varName} = ${f.value}`);
        });
      }
    });
  }

  // Generate summary report
  generateReport() {
    this.logHeader('VALIDATION SUMMARY');
    
    const totalIssues = this.issues.length;
    const totalWarnings = this.warnings.length;
    
    if (totalIssues === 0 && totalWarnings === 0) {
      this.logSuccess('🎉 All environment configurations are valid!');
      return;
    }

    if (totalIssues > 0) {
      this.log(`\n❌ ${totalIssues} critical issues found:`, 'red');
      this.issues.forEach(issue => {
        this.log(`  • ${issue}`, 'red');
      });
    }

    if (totalWarnings > 0) {
      this.log(`\n⚠️  ${totalWarnings} warnings found:`, 'yellow');
      this.warnings.forEach(warning => {
        this.log(`  • ${warning}`, 'yellow');
      });
    }

    this.log(`\n📊 Total: ${totalIssues + totalWarnings} issues found`);
  }

  // Generate recommendations
  generateRecommendations() {
    if (this.issues.length === 0 && this.warnings.length === 0) return;

    this.logHeader('RECOMMENDATIONS');
    
    if (this.issues.length > 0) {
      this.log('\n🔴 Critical Actions Required:', 'red');
      this.log('  1. Fix all missing required variables');
      this.log('  2. Resolve security issues (default values, weak secrets)');
      this.log('  3. Fix variable conflicts between files');
    }

    if (this.warnings.length > 0) {
      this.log('\n🟡 Recommended Actions:', 'yellow');
      this.log('  1. Standardize variable naming across packages');
      this.log('  2. Consolidate duplicate variable definitions');
      this.log('  3. Review environment file organization');
    }

    this.log('\n📚 Documentation:');
    this.log('  - Use env.consolidated.example as single source of truth');
    this.log('  - Use .env.development for development overrides');
    this.log('  - Use .env.production for production overrides');
    this.log('  - Use .env.local for local-specific overrides');
  }

  // Main validation method
  validate() {
    this.logHeader('BENALSAM ENVIRONMENT VALIDATION');
    this.log(`Starting validation at: ${new Date().toISOString()}\n`);

    this.scanEnvironmentFiles();
    this.validateRequiredVariables();
    this.validateSecurity();
    this.validateVariableConflicts();
    this.validateNamingConsistency();
    
    this.generateReport();
    this.generateRecommendations();

    return {
      issues: this.issues,
      warnings: this.warnings,
      isValid: this.issues.length === 0
    };
  }
}

// CLI handling
if (require.main === module) {
  const validator = new EnvironmentValidator();
  const result = validator.validate();
  
  // Exit with error code if issues found
  process.exit(result.isValid ? 0 : 1);
}

module.exports = EnvironmentValidator;
