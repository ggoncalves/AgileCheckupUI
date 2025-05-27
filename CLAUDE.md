# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AgileCheckupUI is a Next.js application that provides a user interface for the AgileCheckup service. It follows a multi-tenant architecture where users must select a company/tenant before accessing the main application features.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Project Architecture

### Core Concepts

1. **Multi-Tenant Architecture**
   - The application follows a multi-tenant pattern where users must select a company before accessing features
   - The `TenantContext` manages the currently selected tenant across the application
   - `TenantProtected` components ensure users can only access pages when a tenant is selected

2. **Admin LTE Integration**
   - The UI is built on AdminLTE (Bootstrap-based admin dashboard template)
   - CSS and JS resources are copied to the public folder via a custom script (scripts/copy-scripts.js)

3. **API Integration**
   - API calls are proxied through Next.js to avoid CORS issues
   - The backend API is hosted at AWS API Gateway
   - `apiService.ts` provides a base HTTP client with tenant ID automatically injected

4. **Generic CRUD Operations**
   - `AbstractCRUD` component provides reusable CRUD functionality for any model
   - Implements sorting, filtering, pagination, and inline form editing

### Key Files and Components

- `/src/contexts/TenantContext.tsx` - Context provider for tenant management
- `/src/components/TenantProtected.tsx` - HOC to protect routes that require tenant selection
- `/src/components/common/AbstractCRUD.tsx` - Generic CRUD component used for data management
- `/src/services/apiService.ts` - Base API client with tenant context integration
- `/src/components/layout/AdminLayout.tsx` - Main application layout with AdminLTE components

### Proxying to Backend API

The application proxies API requests to the backend service configured in `next.config.ts`:

```typescript
{
  source: '/api/:path*',
  destination: 'https://5y1fktfbn0.execute-api.us-east-1.amazonaws.com/dev/:path*',
}
```

## Data Flow

1. Users must select a company/tenant on initial access
2. Tenant ID is stored in localStorage and managed by TenantContext
3. API calls automatically include the tenant ID in request parameters
4. Components like AbstractCRUD provide UI for CRUD operations on various entities
5. Admin layouts are used to provide consistent navigation and styling

## Development Guidelines

1. Follow the existing patterns for adding new features:
   - Place components in the appropriate subdirectory in `/src/components/`
   - Add new API service methods in their respective service files
   - Use the AbstractCRUD component for implementing entity management UIs

2. For adding new model/entity types:
   - Define the model interface in the appropriate service file
   - Create a form component for editing the entity
   - Implement the CRUD API interface for the entity
   - Use the AbstractCRUD component with the model and form