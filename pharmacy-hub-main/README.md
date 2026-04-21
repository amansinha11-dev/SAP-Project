
# Pharmacy Hub Frontend

This is the frontend for the Pharmacy Billing and Inventory app.

## Data mode

The app now runs in Supabase-only mode.

All medicines, customers, bills, and staff data are read/written directly via Supabase.

Do not use raw PostgreSQL credentials in frontend code. Browser apps must use:

1. VITE_SUPABASE_URL
2. VITE_SUPABASE_ANON_KEY

## Local development

1. Install dependencies:
	npm install
2. Start dev server:
	npm run dev

## Enable Supabase

1. Copy [.env.example](.env.example) to .env
2. Set these values in .env:
	VITE_SUPABASE_URL=https://your-project-ref.supabase.co
	VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
3. In Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql)
4. Restart the frontend server

## Build

Run:

npm run build

## Netlify

Use these settings:

1. Base directory: pharmacy-hub-main
2. Build command: npm run build
3. Publish directory: dist

Also set environment variables in Netlify site settings when using Supabase.
