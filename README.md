# GrowthHub

Personal growth & finance tracker for job-seeking developers.

## Stack

- Next.js 14 (App Router)
- Supabase (auth + database)
- Tailwind CSS + shadcn/ui
- Recharts

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
3. Apply the database schema in Supabase SQL Editor (`supabase-schema.sql`)
4. Run the dev server:
   ```bash
   npm run dev
   ```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Deploy

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable (anon) key |
