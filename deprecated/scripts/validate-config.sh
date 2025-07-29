#!/bin/bash

# 🔧 Environment Configuration Validation Script
# Bu script environment variable'ları kontrol eder

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env file exists
check_env_file() {
    log_info "Checking .env file..."
    
    if [ -f ".env" ]; then
        log_success ".env file exists"
        return 0
    else
        log_error ".env file not found"
        return 1
    fi
}

# Validate required environment variables
validate_required_vars() {
    log_info "Validating required environment variables..."
    
    local required_vars=(
        "NODE_ENV"
        "PORT"
        "REDIS_HOST"
        "ELASTICSEARCH_URL"
        "SUPABASE_URL"
        "SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "JWT_SECRET"
        "CORS_ORIGIN"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_success "All required environment variables are set"
    else
        log_error "Missing environment variables: ${missing_vars[*]}"
        return 1
    fi
}

# Validate CORS origins
validate_cors_origins() {
    log_info "Validating CORS origins..."
    
    if [ -z "$CORS_ORIGIN" ]; then
        log_error "CORS_ORIGIN is not set"
        return 1
    fi
    
    # Check for required origins
    local required_origins=(
        "localhost:3003"
        "localhost:5173"
        "209.227.228.96:3003"
        "209.227.228.96:5173"
        "benalsam.com:3003"
        "benalsam.com:5173"
    )
    
    local missing_origins=()
    
    for origin in "${required_origins[@]}"; do
        if [[ "$CORS_ORIGIN" != *"$origin"* ]]; then
            missing_origins+=("$origin")
        fi
    done
    
    if [ ${#missing_origins[@]} -eq 0 ]; then
        log_success "All required CORS origins are configured"
    else
        log_warning "Missing CORS origins: ${missing_origins[*]}"
    fi
}

# Validate API URLs
validate_api_urls() {
    log_info "Validating API URLs..."
    
    # Check VITE_API_URL
    if [ -n "$VITE_API_URL" ]; then
        if [[ "$VITE_API_URL" == *"localhost"* ]]; then
            log_success "VITE_API_URL is configured for local development"
        elif [[ "$VITE_API_URL" == *"209.227.228.96"* ]]; then
            log_success "VITE_API_URL is configured for VPS"
        else
            log_warning "VITE_API_URL has unexpected value: $VITE_API_URL"
        fi
    else
        log_warning "VITE_API_URL is not set"
    fi
    
    # Check VITE_ELASTICSEARCH_URL
    if [ -n "$VITE_ELASTICSEARCH_URL" ]; then
        if [[ "$VITE_ELASTICSEARCH_URL" == *"209.227.228.96"* ]]; then
            log_success "VITE_ELASTICSEARCH_URL is configured for VPS"
        else
            log_warning "VITE_ELASTICSEARCH_URL has unexpected value: $VITE_ELASTICSEARCH_URL"
        fi
    else
        log_warning "VITE_ELASTICSEARCH_URL is not set"
    fi
}

# Validate JWT configuration
validate_jwt_config() {
    log_info "Validating JWT configuration..."
    
    if [ -n "$JWT_SECRET" ]; then
        if [ ${#JWT_SECRET} -ge 64 ]; then
            log_success "JWT_SECRET is properly configured (length: ${#JWT_SECRET})"
        else
            log_warning "JWT_SECRET might be too short (length: ${#JWT_SECRET})"
        fi
    else
        log_error "JWT_SECRET is not set"
        return 1
    fi
    
    if [ -n "$JWT_EXPIRES_IN" ]; then
        log_success "JWT_EXPIRES_IN is set to: $JWT_EXPIRES_IN"
    else
        log_warning "JWT_EXPIRES_IN is not set (using default)"
    fi
}

# Validate Supabase configuration
validate_supabase_config() {
    log_info "Validating Supabase configuration..."
    
    if [ -n "$SUPABASE_URL" ] && [[ "$SUPABASE_URL" == *"supabase.co"* ]]; then
        log_success "SUPABASE_URL is properly configured"
    else
        log_error "SUPABASE_URL is not properly configured"
        return 1
    fi
    
    if [ -n "$SUPABASE_ANON_KEY" ] && [[ "$SUPABASE_ANON_KEY" == eyJ* ]]; then
        log_success "SUPABASE_ANON_KEY is properly configured"
    else
        log_error "SUPABASE_ANON_KEY is not properly configured"
        return 1
    fi
    
    if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && [[ "$SUPABASE_SERVICE_ROLE_KEY" == eyJ* ]]; then
        log_success "SUPABASE_SERVICE_ROLE_KEY is properly configured"
    else
        log_error "SUPABASE_SERVICE_ROLE_KEY is not properly configured"
        return 1
    fi
}

# Main validation function
main() {
    echo "🔧 Environment Configuration Validation"
    echo "======================================"
    echo ""
    
    local exit_code=0
    
    # Load environment variables
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Run validations
    check_env_file || exit_code=1
    validate_required_vars || exit_code=1
    validate_cors_origins || exit_code=1
    validate_api_urls || exit_code=1
    validate_jwt_config || exit_code=1
    validate_supabase_config || exit_code=1
    
    echo ""
    echo "======================================"
    
    if [ $exit_code -eq 0 ]; then
        log_success "All validations passed! 🎉"
    else
        log_error "Some validations failed! ⚠️"
    fi
    
    exit $exit_code
}

# Run main function
main "$@" 