# Skyletic Development Guide

## Build & Run Commands
- `npm run dev`: Start Next.js local development server
- `npm run build`: Production build
- `npm run migrate`: Execute Supabase migrations against configured database
- `npm run lint`: Run ESLint

## Architecture Guidelines
- Multi-tenant architecture using Supabase RLS.
- Database migrations located in `supabase/migrations/`.
- Connectors abstracted behind `SocialConnector`, `WhatsAppBridgeAdapter`, and `AIProvider` interfaces.
- Structured AI outputs must always be validated via Zod schemas.
- Metrics are calculated deterministically using PostgreSQL and TypeScript math, never LLMs.
