# FlowForm

Production-style AI-powered Form Builder SaaS built with Turborepo, Next.js, tRPC, Drizzle ORM, PostgreSQL, Zod, and TypeScript.

FlowForm allows creators to build dynamic forms, publish public or unlisted form links, collect responses, manage analytics, and explore community forms through a modern SaaS-style dashboard.

---

# Features

## Authentication & Authorization

- Secure authentication flow
- Protected dashboard routes
- Role-based access control
- Admin-only management actions
- Session-aware navigation and billing access

## Dynamic Form Builder

- Create and manage forms
- Dynamic field creation
- Multiple field types:
  - Text
  - Email
  - Number
  - Select
  - Checkbox
  - Rating
  - Date
- Required/optional validation
- Zod-based schema validation
- Form editing and management
- Form publish/unpublish support
- Form preview support

## Public & Unlisted Forms

### Public Forms
- Visible on Explore page
- Accessible publicly
- Shareable links
- Public response collection

### 
    Unlisted Forms
- Hidden from Explore page
- Accessible only through direct link
- Private sharing workflow

## Explore Page

- Public form discovery
- Dynamic rendering of published forms
- Responsive card-based UI
- Real-time visibility updates
- Public-only filtering

## Response Collection

- Public form submissions without login
- Response storage and management
- Validation before submission
- Submission status handling
- User-friendly error handling

## Analytics Dashboard

- Total submissions
- Response insights
- Form activity tracking
- Analytics cards and dashboards
- Recent submission views

## Admin Dashboard

- Manage all users
- Delete forms globally
- View public/private forms
- Monitor platform activity
- Billing and subscription visibility
- Full admin controls

## Billing & Subscription UI

- SaaS-style pricing page
- Billing dashboard
- Plan selection flow
- Free / Pro / Enterprise plans
- Protected billing routes
- Demo subscription system
- User plan visibility
- Admin subscription overview

## API Documentation

- OpenAPI-compatible APIs
- Scalar API documentation
- Organized endpoint structure
- Developer-friendly API explorer

## UX & Product Polish

- Modern SaaS UI
- Responsive layouts
- Dark mode support
- Loading states
- Error boundaries
- Toast notifications
- Empty states
- Optimistic UI updates
- Professional navigation system

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- Lucide Icons

## Backend

- tRPC
- Node.js
- Drizzle ORM
- PostgreSQL
- Zod

## Monorepo

- Turborepo
- Shared packages architecture

## Deployment

- Vercel (Frontend)
- Railway (Backend)
- Neon PostgreSQL

---

# Monorepo Structure

```bash
apps/
  web/                # Next.js frontend
  api/                # Backend API server

packages/
  db/                 # Drizzle schemas and database config
  ui/                 # Shared UI components
  validators/         # Shared Zod schemas
  types/              # Shared TypeScript types
  api-client/         # Shared API utilities
```

---

# Core Architecture

## Frontend Architecture

- App Router architecture
- Server and client component separation
- Protected route handling
- React Query state management
- Shared component system

## Backend Architecture

- Type-safe tRPC procedures
- Modular router system
- Shared validation layer
- Drizzle schema-based database modeling
- Centralized error handling

## Shared Package System

- Shared Zod validators
- Shared API types
- Shared utility functions
- Shared UI components

---

# Database Design

## Main Tables

- users
- forms
- form_fields
- form_submissions
- subscriptions
- themes

## Features

- Relational schema design
- Cascading deletion support
- Type-safe queries
- Optimized relations
- Validation-driven data layer

---

# Visibility System

FlowForm supports multiple visibility states:

| Visibility | Explore Page | Direct Link Access |
|------------|--------------|--------------------|
| Public | Yes | Yes |
| Unlisted | No | Yes |
| Private | No | No |

---

# Form Lifecycle

```text
Create Form
    ↓
Add Dynamic Fields
    ↓
Configure Validation
    ↓
Preview Form
    ↓
Publish / Unlist
    ↓
Share Link
    ↓
Collect Responses
    ↓
View Analytics
```

---

# Authentication Flow

```text
User Login
    ↓
Protected Dashboard Access
    ↓
Create / Manage Forms
    ↓
Billing & Subscription Access
```

---

# Public Submission Flow

```text
Public Form Access
    ↓
Validation
    ↓
Response Submission
    ↓
Analytics Update
```

---

# Installation

## Clone Repository

```bash
git clone https://github.com/your-username/flowform.git
cd flowform
```

## Install Dependencies

```bash
pnpm install
```

## Setup Environment Variables

Create `.env` files for frontend and backend.

### Web App

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:8000
```

### API Server

```env
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=http://localhost:3000
```

---

# Database Setup

## Push Schema

```bash
pnpm db:push
```

## Run Migrations

```bash
pnpm db:migrate
```

## Seed Demo Data

```bash
pnpm db:seed
```

---

# Running the Project

## Development

```bash
pnpm dev
```

## Production Build

```bash
pnpm build
```

---

# Deployment

## Frontend Deployment

Platform: Vercel

Required Environment Variables:

```env
API_URL=https://your-api-domain.up.railway.app
```

## Backend Deployment

Platform: Railway

Required Environment Variables:

```env
CORS_ORIGIN=https://your-vercel-domain.vercel.app
DATABASE_URL=
JWT_SECRET=
```

---

# API Documentation

API documentation is available through Scalar.

## Docs Route

```text
/docs
```

## OpenAPI Route

```text
/api/openapi
```

Features:
- Interactive API explorer
- Request/response schemas
- Endpoint grouping
- Authentication documentation
- Validation examples

---

# Security Features

- Protected routes
- Role-based authorization
- Centralized error handling
- Input validation using Zod
- Sanitized API responses
- Rate limiting support
- Secure authentication flow
- Proper visibility checks

---

# Error Handling

FlowForm uses centralized error formatting.

Features:
- No raw JSON errors exposed to users
- User-friendly toast notifications
- Safe backend logging
- Request validation handling
- Network failure handling

Example messages:

```text
Invalid credentials
Something went wrong
Network error. Please try again
```

---

# UI Components

FlowForm uses:

- shadcn/ui
- Tailwind CSS
- Field components
- Responsive layouts
- Accessible form controls
- Reusable dashboard components

---

# Demo Credentials

## Admin

```text
Email: admin@flowform.dev
Password: admin123
```

## Demo User

```text
Email: demo@flowform.dev
Password: demo123
```

---

# Demo Features Included

- Seeded forms
- Public templates
- Explore page content
- Sample responses
- Analytics data
- Demo subscriptions
- Billing UI

---

# Future Improvements

- Real Stripe integration
- CSV export
- QR sharing
- Conditional logic
- Multi-page forms
- Form expiry
- Response filtering
- Advanced analytics
- AI-assisted form generation
- Real-time collaboration

---

# Performance Optimizations

- Query caching
- Optimistic UI updates
- Shared package architecture
- Modular routing
- Efficient rendering
- Lazy loading support

---

# Developer Experience

- Fully type-safe APIs
- Shared validators
- Shared types
- Scalable monorepo structure
- Clean folder organization
- Reusable UI system
- Centralized state patterns

---

# Screens Included

- Landing page
- Pricing page
- Explore page
- Dashboard
- Form builder
- Analytics dashboard
- Billing page
- Admin dashboard
- Public form view

---

# Why FlowForm?

FlowForm is designed as a production-style SaaS project showcasing:

- Scalable monorepo architecture
- Type-safe fullstack development
- Modern SaaS UX
- Dynamic schema systems
- Professional deployment setup
- Clean engineering practices

---

# Author

Built by Piyush

---

# License

MIT License

