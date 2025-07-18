# 🏢 Benalsam Monorepo

Modern, enterprise-level monorepo for Benalsam ecosystem including web, mobile, and admin applications with comprehensive documentation and deployment guides.

## 🎯 Project Overview

Benalsam is a comprehensive marketplace platform with:
- **Web Application** - React + Vite frontend
- **Mobile Application** - React Native + Expo
- **Admin Panel** - Role-based access control system
- **Shared Types** - TypeScript definitions across all platforms
- **Backend Services** - Node.js + Supabase + PostgreSQL

## 📁 Project Structure

```
benalsam-monorepo/
├── packages/
│   ├── shared-types/     # Shared TypeScript types and utilities
│   ├── web/             # React + Vite web application
│   ├── mobile/          # React Native + Expo mobile application
│   ├── admin-ui/        # React + Material-UI admin panel
│   └── admin-backend/   # Node.js + Express admin API
├── docs/                # Comprehensive documentation
│   ├── vps-migration/   # VPS deployment and migration guides
│   ├── MONOREPO_GUIDE.md
│   ├── QUICK_START.md
│   └── ...              # Additional documentation
├── scripts/             # Build and deployment scripts
├── docker-compose.*.yml # Docker configurations
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- Docker & Docker Compose
- Expo CLI (for mobile development)
- PostgreSQL (for admin backend)

### Installation
```bash
# Clone repository
git clone https://github.com/angache/Benalsam-Monorepo.git
cd Benalsam-Monorepo

# Install all dependencies
npm install

# Build shared types
npm run build:shared

# Start development servers
npm run dev:web      # Start web development server
npm run dev:mobile   # Start mobile development server
npm run dev:admin    # Start admin panel development
```

## 📦 Packages

### `packages/shared-types`
Shared TypeScript types, utilities, and services used across all applications.

**Features:**
- Type definitions (User, Listing, Offer, Category, etc.)
- Supabase client and database helpers
- Common utilities (formatting, validation, etc.)
- API response types and interfaces

### `packages/web`
React + Vite web application with modern UI/UX.

**Tech Stack:**
- React 18 + TypeScript
- Vite + Tailwind CSS
- Supabase + React Query
- Zustand state management
- Responsive design

### `packages/mobile`
React Native + Expo mobile application with native performance.

**Tech Stack:**
- React Native + Expo
- TypeScript + NativeWind
- Supabase + React Query
- Zustand state management
- Native navigation

### `packages/admin-ui`
React + Material-UI admin panel with role-based access control.

**Tech Stack:**
- React 18 + TypeScript
- Material-UI + Vite
- React Query + Zustand
- Role-based authentication
- Responsive admin dashboard

### `packages/admin-backend`
Node.js + Express admin API with comprehensive features.

**Tech Stack:**
- Node.js + Express + TypeScript
- PostgreSQL + Redis
- JWT authentication
- Role-based access control
- File upload handling
- Rate limiting & security

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev:web          # Start web dev server (port 3000)
npm run dev:mobile       # Start mobile dev server
npm run dev:admin        # Start admin panel dev (port 3001)

# Building
npm run build:shared     # Build shared types
npm run build:web        # Build web app
npm run build:mobile     # Build mobile app
npm run build:admin      # Build admin panel
npm run build:all        # Build all packages

# Testing & Quality
npm run test             # Run tests across all packages
npm run type-check       # Type check all packages
npm run clean            # Clean all build artifacts
```

### Docker Development

```bash
# Start all services with Docker
docker-compose -f docker-compose.dev.yml up -d

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

## 📚 Documentation

### Core Guides
- **[Quick Start](./docs/QUICK_START.md)** - Get started in minutes
- **[Monorepo Guide](./docs/MONOREPO_GUIDE.md)** - Understanding the monorepo structure
- **[Shared Types Guide](./docs/SHARED_TYPES_GUIDE.md)** - Working with shared types

### Admin Panel
- **[Admin Panel Deployment](./docs/ADMIN_PANEL_DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[Role-Based Access Control](./docs/ADMIN_ROLE_BASED_ACCESS_CONTROL.md)** - RBAC implementation
- **[Admin RBAC Quick Start](./docs/ADMIN_RBAC_QUICK_START.md)** - Quick RBAC setup

### Deployment & Migration
- **[VPS Migration](./docs/vps-migration/)** - Complete VPS migration guide
- **[Docker Setup](./docs/DOCKER_SETUP_HOWTO.md)** - Docker configuration guide
- **[Elasticsearch Integration](./docs/ELASTICSEARCH_INTEGRATION_STRATEGY.md)** - Search system setup

### API & Architecture
- **[Elasticsearch Implementation](./docs/ELASTICSEARCH_IMPLEMENTATION_GUIDE.md)** - Search implementation
- **[Elasticsearch Usage Examples](./docs/ELASTICSEARCH_USAGE_EXAMPLES.md)** - Search usage patterns
- **[API Architecture](./docs/ELASTICSEARCH_API_ARCHITECTURE.md)** - API design patterns

## 🚀 Deployment

### Web Application
```bash
npm run build:web
# Deploy dist/ folder to your hosting provider
```

### Mobile Application
```bash
npm run build:mobile
# Use Expo EAS Build or build locally
```

### Admin Panel
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Or manual deployment
npm run build:admin
# Deploy to your server
```

### VPS Migration
For complete VPS migration guide, see [docs/vps-migration/](./docs/vps-migration/).

## 🔧 Configuration

### Environment Variables
Each package has its own environment configuration:
- `packages/web/.env` - Web application settings
- `packages/mobile/.env` - Mobile application settings
- `packages/admin-backend/.env.production` - Admin backend settings
- `packages/admin-ui/.env.production` - Admin frontend settings

### Database Setup
- **Supabase** - Main application database
- **PostgreSQL** - Admin panel database
- **Redis** - Caching and sessions

## 📊 Features

### Web & Mobile Applications
- ✅ User authentication and profiles
- ✅ Listing creation and management
- ✅ Category management with attributes
- ✅ Image upload and management
- ✅ Search and filtering
- ✅ Messaging system
- ✅ Offer management
- ✅ Favorites and following
- ✅ Premium features
- ✅ Analytics dashboard

### Admin Panel
- ✅ Role-based access control (RBAC)
- ✅ User management
- ✅ Listing moderation
- ✅ Category management
- ✅ Analytics and reporting
- ✅ System monitoring
- ✅ File management
- ✅ Audit logging

### Shared Infrastructure
- ✅ TypeScript type safety
- ✅ React Query for data fetching
- ✅ Zustand for state management
- ✅ Supabase integration
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make changes in the appropriate package(s)
3. Update shared types if needed
4. Test changes across all platforms
5. Update documentation
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use shared types for consistency
- Test on both web and mobile
- Update documentation for new features
- Follow the existing code style

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the [documentation](./docs/)
2. Review [CHANGELOG.md](./docs/CHANGELOG.md)
3. Create an issue on GitHub

---

**Built with ❤️ by the Benalsam Team**

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Status**: Production Ready ✅ 