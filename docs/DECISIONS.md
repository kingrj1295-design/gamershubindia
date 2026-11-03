# Decisions and plan updates

1. Frontend: React + Vite. Before Phase 2 we decide on SEO (prerendering or SSR) for game pages.
2. Database/Auth/Storage: Supabase. Google login via Supabase Auth. Frontend sends the Supabase access token to FastAPI; FastAPI verifies the token signature on every request and never trusts the frontend.
3. Modular code: pages, components, data and (later) services are separate folders.
4. Database change: `pc_specs` (1 per user) becomes `pc_configs` (many per user): id, user_id, name, cpu, gpu, ram_gb, storage, os, is_primary, is_public (default false).
5. Game data: no critical dependency on unofficial Steam endpoints. Sources chosen in Phase 2; missing data is shown as "Not available". Admin can enter requirements manually.
6. Secrets: only in `.env` and hosting dashboards. `.gitignore` blocks `.env`. The Supabase anon key is public by design; the service-role key must never go in the frontend or GitHub.
7. Demo data is always tagged "Demo data" in the UI.

## Feature tracker
Done in Phase 1 (pending your test): navbar, footer, Home, About Us, Products, responsive layout.
Not built: Game Library, PC checker, login, profiles, community, news, admin, Help.
