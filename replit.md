# Replit.md

## Overview
This is a rural empowerment platform that connects sponsors with villagers from rural Kenya, enabling them to transition to sustainable livelihoods in Nairobi through clean mobility and digital platforms. The system facilitates sponsorships for NTSA training, housing, and bike deployment, with real-time progress tracking and messaging capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Kenyan color palette (red, green, gold, trust blue)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **Real-time Communication**: WebSocket integration for messaging

### Data Architecture
- **Database**: PostgreSQL with Neon serverless connection
- **Schema**: Modular design with separate tables for users, villagers, sponsorships, messages, progress updates, and sessions
- **Validation**: Zod schemas for runtime type checking and API validation
- **Migrations**: Drizzle Kit for database migrations

### Authentication & Authorization
- **Provider**: Replit's OpenID Connect authentication
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Role-based Access**: Three user roles (sponsor, villager, admin) with route-level protection
- **Security**: HTTP-only cookies, CSRF protection, secure session management

### Payment Processing
- **Provider**: Stripe integration for sponsorship payments
- **Components**: React Stripe.js for payment forms and checkout flows
- **Webhooks**: Payment status tracking and updates
- **Security**: Server-side payment intent creation and confirmation

### Real-time Features
- **Messaging**: WebSocket-based real-time chat between sponsors and villagers
- **Progress Updates**: Live notifications for sponsorship milestones
- **Status Tracking**: Real-time funding progress and phase transitions

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Auth**: Authentication and user management service
- **Stripe**: Payment processing and subscription management

### Development Tools
- **Vite**: Build tool and development server with hot module replacement
- **Drizzle Kit**: Database migration and schema management
- **TypeScript**: Type checking and compilation

### UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, forms, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography

### Third-party Integrations
- **Google Fonts**: Custom typography (Inter, Playfair Display)
- **Unsplash**: Placeholder images for user profiles and content
- **Date-fns**: Date manipulation and formatting utilities