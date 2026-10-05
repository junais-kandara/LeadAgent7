# LeadAgent7

> AI-Powered Marketing, Lead & Conversion Intelligence Platform

LeadAgent7 unifies social media (Instagram, Facebook, YouTube), Google Ads, WhatsApp conversations, and booking calendar appointments into an evidence-based intelligence portal.

## Architecture

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui (Vercel)
- **Database & Auth**: Supabase PostgreSQL with strict Row Level Security (RLS) and multi-tenant isolation
- **AI Synthesis**: Groq API behind an `AIProvider` interface with Zod validation
- **Automation / Connectors**: Playwright MCP / Render workers and Baileys WhatsApp bridge adapter
- **Attribution**: Deterministic multi-touch source attribution (Content / Ads → Lead → WhatsApp → Booking → Conversion)

## Repository Structure

```
├── app/                  # Next.js App Router pages
├── components/           # Reusable UI components
├── lib/
│   ├── ai/              # Groq provider & prompt templates
│   ├── analytics/       # Authoritative calculation engine
│   ├── attribution/     # Multi-touch attribution logic
│   ├── auth/            # Auth session & tenant resolution
│   ├── connectors/      # Social & messaging bridge connectors
│   ├── db/              # Supabase clients & database schema types
│   └── validation/      # Zod validation schemas
├── scripts/             # Migration and automation scripts
├── supabase/
│   ├── full_schema.sql  # Complete consolidated database schema
│   └── migrations/      # Versioned migration files
├── tests/               # Tenant isolation & integration tests
└── workers/             # Background job runners (Render)
```

## Setup & Running Migrations

1. Copy `.env.example` to `.env.local` and populate environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Apply database migrations to Supabase:
   - Run `npm run migrate`, or
   - Copy and execute [full_schema.sql](file:///c:/Users/admin/Music/SKYLETIC/supabase/full_schema.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard/project/zpltpcntcrocqgxvaqmi/sql).
