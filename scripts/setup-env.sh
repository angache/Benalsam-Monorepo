#!/bin/bash

# =============================================================================
# BENALSAM ENVIRONMENT SETUP SCRIPT
# =============================================================================
# 
# This script sets up environment configuration for the Benalsam monorepo
# It creates the necessary .env files from templates and validates them
#
# Usage: ./scripts/setup-env.sh [--dev|--prod|--local] [--validate]
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_DIR="$ROOT_DIR"

# Default values
ENVIRONMENT="dev"
VALIDATE=false
FORCE=false

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "\n${CYAN}=============================================================================${NC}"
    echo -e "${CYAN} $1${NC}"
    echo -e "${CYAN}=============================================================================${NC}\n"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

OPTIONS:
    --dev, -d          Setup development environment (default)
    --prod, -p         Setup production environment
    --local, -l        Setup local development environment
    --validate, -v     Validate environment after setup
    --force, -f        Force overwrite existing .env files
    --help, -h         Show this help message

EXAMPLES:
    $0                    # Setup development environment
    $0 --prod --validate # Setup production environment and validate
    $0 --local --force   # Setup local environment, overwrite existing files

EOF
}

# Function to parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dev|-d)
                ENVIRONMENT="dev"
                shift
                ;;
            --prod|-p)
                ENVIRONMENT="prod"
                shift
                ;;
            --local|-l)
                ENVIRONMENT="local"
                shift
                ;;
            --validate|-v)
                VALIDATE=true
                shift
                ;;
            --force|-f)
                FORCE=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
}

# Function to check prerequisites
check_prerequisites() {
    print_header "CHECKING PREREQUISITES"
    
    # Check if we're in the right directory
    if [[ ! -f "$ROOT_DIR/package.json" ]]; then
        print_error "This script must be run from the Benalsam monorepo root directory"
        exit 1
    fi
    
    # Check if required files exist
    local required_files=(
        "env.consolidated.example"
        "env.development.example"
        "env.production.example"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$ENV_DIR/$file" ]]; then
            print_error "Required template file not found: $file"
            exit 1
        fi
    done
    
    print_success "Prerequisites check passed"
}

# Function to backup existing .env files
backup_existing_env() {
    print_header "BACKING UP EXISTING ENVIRONMENT FILES"
    
    local backup_dir="$ENV_DIR/env-backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    local env_files=(
        ".env"
        ".env.local"
        ".env.development"
        ".env.production"
    )
    
    local backed_up=false
    for file in "${env_files[@]}"; do
        if [[ -f "$ENV_DIR/$file" ]]; then
            cp "$ENV_DIR/$file" "$backup_dir/"
            print_info "Backed up: $file"
            backed_up=true
        fi
    done
    
    if [[ "$backed_up" == true ]]; then
        print_success "Environment files backed up to: $backup_dir"
    else
        print_info "No existing environment files to backup"
    fi
}

# Function to setup development environment
setup_dev_environment() {
    print_header "SETTING UP DEVELOPMENT ENVIRONMENT"
    
    # Copy consolidated template to .env
    if [[ "$FORCE" == true ]] || [[ ! -f "$ENV_DIR/.env" ]]; then
        cp "$ENV_DIR/env.consolidated.example" "$ENV_DIR/.env"
        print_success "Created: .env from consolidated template"
    else
        print_warning ".env already exists, skipping (use --force to overwrite)"
    fi
    
    # Copy development template to .env.development
    if [[ "$FORCE" == true ]] || [[ ! -f "$ENV_DIR/.env.development" ]]; then
        cp "$ENV_DIR/env.development.example" "$ENV_DIR/.env.development"
        print_success "Created: .env.development"
    else
        print_warning ".env.development already exists, skipping (use --force to overwrite)"
    fi
    
    # Create .env.local if it doesn't exist
    if [[ ! -f "$ENV_DIR/.env.local" ]]; then
        cat > "$ENV_DIR/.env.local" << EOF
# =============================================================================
# BENALSAM LOCAL DEVELOPMENT OVERRIDES
# =============================================================================
# 
# Add your local-specific environment variables here
# This file is gitignored and won't be committed
#
# =============================================================================

# Local Development Overrides
# NODE_ENV=development
# PORT=3002
# DATABASE_URL=postgresql://username:password@localhost:5432/benalsam_local

# =============================================================================
EOF
        print_success "Created: .env.local template"
    else
        print_info ".env.local already exists"
    fi
}

# Function to setup production environment
setup_prod_environment() {
    print_header "SETTING UP PRODUCTION ENVIRONMENT"
    
    # Copy production template to .env.production
    if [[ "$FORCE" == true ]] || [[ ! -f "$ENV_DIR/.env.production" ]]; then
        cp "$ENV_DIR/env.production.example" "$ENV_DIR/.env.production"
        print_success "Created: .env.production"
    else
        print_warning ".env.production already exists, skipping (use --force to overwrite)"
    fi
    
    print_warning "IMPORTANT: Edit .env.production with your actual production values"
    print_warning "Never commit .env.production to Git"
}

# Function to setup local environment
setup_local_environment() {
    print_header "SETTING UP LOCAL DEVELOPMENT ENVIRONMENT"
    
    # Copy consolidated template to .env
    if [[ "$FORCE" == true ]] || [[ ! -f "$ENV_DIR/.env" ]]; then
        cp "$ENV_DIR/env.consolidated.example" "$ENV_DIR/.env"
        print_success "Created: .env from consolidated template"
    else
        print_warning ".env already exists, skipping (use --force to overwrite)"
    fi
    
    # Create .env.local with local-specific overrides
    if [[ "$FORCE" == true ]] || [[ ! -f "$ENV_DIR/.env.local" ]]; then
        cat > "$ENV_DIR/.env.local" << EOF
# =============================================================================
# BENALSAM LOCAL DEVELOPMENT OVERRIDES
# =============================================================================
# 
# Local-specific environment variables
# This file is gitignored and won't be committed
#
# =============================================================================

# Local Development Settings
NODE_ENV=development
PORT=3002

# Local Database
DATABASE_URL=postgresql://username:password@localhost:5432/benalsam_local

# Local URLs
API_URL=http://localhost:3002/api/v1
VITE_API_URL=http://localhost:3002/api/v1

# Local CORS
CORS_ORIGIN=http://localhost:3003,http://localhost:5173,http://localhost:3000

# Local Services
REDIS_HOST=localhost
REDIS_PORT=6379
ELASTICSEARCH_URL=http://localhost:9200

# Development Features
LOG_LEVEL=debug
ENABLE_DEBUG_MODE=true

# =============================================================================
EOF
        print_success "Created: .env.local with local overrides"
    else
        print_warning ".env.local already exists, skipping (use --force to overwrite)"
    fi
}

# Function to copy environment to packages
copy_env_to_packages() {
    print_header "COPYING ENVIRONMENT TO PACKAGES"
    
    local packages=("admin-backend" "admin-ui" "web" "mobile")
    
    for package in "${packages[@]}"; do
        local package_dir="$ROOT_DIR/packages/$package"
        if [[ -d "$package_dir" ]]; then
            # Copy root .env to package
            if [[ -f "$ENV_DIR/.env" ]]; then
                cp "$ENV_DIR/.env" "$package_dir/.env"
                print_success "Copied .env to packages/$package/"
            fi
            
            # Copy environment-specific files
            if [[ "$ENVIRONMENT" == "dev" ]] && [[ -f "$ENV_DIR/.env.development" ]]; then
                cp "$ENV_DIR/.env.development" "$package_dir/.env.development"
            elif [[ "$ENVIRONMENT" == "prod" ]] && [[ -f "$ENV_DIR/.env.production" ]]; then
                cp "$ENV_DIR/.env.production" "$package_dir/.env.production"
            fi
        fi
    done
    
    print_success "Environment files copied to all packages"
}

# Function to validate environment
validate_environment() {
    print_header "VALIDATING ENVIRONMENT CONFIGURATION"
    
    if [[ -f "$SCRIPT_DIR/validate-env.js" ]]; then
        print_info "Running environment validation..."
        cd "$ROOT_DIR"
        node "$SCRIPT_DIR/validate-env.js"
        
        if [[ $? -eq 0 ]]; then
            print_success "Environment validation passed"
        else
            print_warning "Environment validation found issues - please review"
        fi
    else
        print_warning "Environment validation script not found: scripts/validate-env.js"
    fi
}

# Function to show next steps
show_next_steps() {
    print_header "NEXT STEPS"
    
    case "$ENVIRONMENT" in
        "dev")
            cat << EOF
1. Review and customize .env file for your development setup
2. Edit .env.development if you need development-specific overrides
3. Edit .env.local for your local machine overrides
4. Run: node scripts/validate-env.js to validate configuration
5. Start development: pnpm run dev

EOF
            ;;
        "prod")
            cat << EOF
1. Edit .env.production with your actual production values
2. Set secure JWT secrets and database credentials
3. Configure production monitoring and logging
4. Run: node scripts/validate-env.js to validate configuration
5. Deploy using: docker-compose -f docker-compose.prod.yml up -d

EOF
            ;;
        "local")
            cat << EOF
1. Review .env file for your local setup
2. Edit .env.local with your local machine overrides
3. Configure local database and services
4. Run: node scripts/validate-env.js to validate configuration
5. Start local development: pnpm run dev

EOF
            ;;
    esac
    
    print_info "Environment files are gitignored and won't be committed"
    print_info "Use .env.example files as templates for team members"
}

# Main function
main() {
    print_header "BENALSAM ENVIRONMENT SETUP"
    print_info "Setting up $ENVIRONMENT environment..."
    
    # Parse command line arguments
    parse_args "$@"
    
    # Check prerequisites
    check_prerequisites
    
    # Backup existing files
    backup_existing_env
    
    # Setup environment based on type
    case "$ENVIRONMENT" in
        "dev")
            setup_dev_environment
            ;;
        "prod")
            setup_prod_environment
            ;;
        "local")
            setup_local_environment
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    # Copy to packages
    copy_env_to_packages
    
    # Validate if requested
    if [[ "$VALIDATE" == true ]]; then
        validate_environment
    fi
    
    # Show next steps
    show_next_steps
    
    print_success "Environment setup completed successfully!"
}

# Run main function with all arguments
main "$@"
