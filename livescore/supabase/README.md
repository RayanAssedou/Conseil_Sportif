# Supabase Setup

## 1. Run the migration

In your [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor:

- Full setup: run `migrations/001_initial.sql` then `migrations/003_admin_users.sql`
- If only `articles` is missing: run `migrations/002_articles_only.sql`
- If only admin login: run `migrations/003_admin_users.sql` (creates admin/admin770)

Or add `DATABASE_URL` to `.env.local` and use the "Run migration" button in `/admin` (requires ADMIN_SECRET for first run).

## 2. Configure environment variables

In `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL (e.g. https://xxx.supabase.co)
- `SUPABASE_SERVICE_KEY` - From Project Settings → API → service_role key
- `ADMIN_SECRET` - Used for JWT signing and migrate (choose a strong value)

## 3. Admin panel

Visit `/admin` and log in with **admin** / **admin770** (or run migration 003 first). From there you can:

- Edit the hero banner (title, subtitle, background color or image, buttons)
- Edit the Latest News section (title, link)
- Create, edit, and delete articles
- Toggle articles to show in "Latest News" on the homepage
