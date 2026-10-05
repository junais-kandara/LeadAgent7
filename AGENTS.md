# Skyletic - Agent System Guidelines

## Project Overview
Skyletic is a multi-tenant SaaS platform that connects Instagram, Facebook, YouTube, Google Ads, WhatsApp, and a booking calendar into an AI-powered intelligence portal.

## Core Rules & Invariants
1. **Multi-tenant Isolation**: Every tenant-owned table has `organization_id` and strict Row Level Security (RLS). Never trust client-supplied `organization_id`. Derive tenant identity from `auth.uid()`.
2. **Separation of Computing vs AI**: Authoritative calculations (CTR, CPC, CPL, CPA, conversion rates, rankings) are calculated strictly in SQL/TypeScript. Groq LLM provides explanations, recommendations, and intent classification based on verified evidence packets.
3. **Connector Boundaries**: Connectors (Instagram, Facebook, YouTube, Google Ads, WhatsApp) must implement modular interfaces. Browser automation (Playwright) is an interchangeable acquisition method, not core business logic.
4. **Idempotent Sync Jobs**: Ingestion jobs must use external IDs and upserts to prevent duplicates.
5. **No Invented Facts**: All AI insights must store the evidence packet, model name, and prompt version.
6. **Database Changes**: Every schema change must be a tracked migration in `supabase/migrations/`.
7. **Secrets Isolation**: Secrets (Supabase Service Role, Groq Key, WhatsApp tokens, Google tokens) are server-side only.

## Key Stack
- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui on Vercel
- **Database/Auth**: Supabase PostgreSQL + Supabase Auth + RLS
- **Workers**: Render for background jobs and connector orchestration
- **Browser Automation**: Playwright MCP / Playwright on Render
- **AI**: Groq API behind an AI provider interface with Zod validation
- **WhatsApp**: Baileys bridge adapter
