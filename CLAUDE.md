# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
```

## Environment

Create a `.env.local` at the project root with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
The values are in `src/app/Supabase.txt` (do not commit that file).

## Architecture

**Next.js 16 App Router** with Tailwind CSS v4 and Supabase for auth + database.

### Route structure
- `/` — Landing page (`src/app/page.tsx`)
- `/login`, `/signup` — Auth pages, redirect to `/app` on success
- `/app` — Main Pomodoro timer (protected, redirects to `/login` if unauthenticated)
- `/vision-board` — Vision board (protected)
- `/resources` — Static resource links page (protected)
- `/habit-tracker`, `/history` — Additional protected pages

### Auth pattern
Every protected page does a `supabase.auth.getUser()` check inside a `useEffect`, sets `checkingAuth` state, and calls `router.replace("/login")` if no user. There is no middleware — auth is purely client-side.

### Supabase tables used
- `sessions` — Pomodoro session logs (`user_id`, `mode`, `duration_seconds`, `completed_at`, `session_name`, `feedback`)
- `vision_board_items` — Vision board images (`user_id`, `image_url`, `title`, `created_at`)

### Component model
All overlays (`src/components/`) are modal panels that receive state and callbacks as props from the parent `/app` page. The parent owns all state; overlays are pure UI. `BackgroundLayer` is the one exception — it reads `localStorage` directly and manages the YouTube IFrame API player.

### Background system
`BackgroundLayer` listens to `localStorage` for `backgroundType` (video/image), `videoId`, and `imageUrl`. The `/app` page writes to `localStorage` when the user changes settings; `BackgroundLayer` picks up the initial values on mount only (no cross-component event bus). Changes take effect on next mount unless the same keys are updated in both places.

### Image uploads
Images are converted to base64 via `FileReader` and stored in Supabase DB (`vision_board_items.image_url`) or `localStorage` (background). Large files will exceed Supabase row size limits — prefer URL-based images for production use.
