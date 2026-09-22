# ariX.tools

**Every file tool you need. Perfectly fluid.**

45+ PDF and image tools in one liquid-glass workspace — merge, split, compress, convert, OCR, AI summaries, background removal, and more.

## Features

- **PDF tools** — merge, split, compress, rotate, watermark, sign, redact, crop, page numbers, organize, repair, OCR, AI summarize & translate
- **Image tools** — compress, resize, crop, convert, photo editor, upscale, remove background, watermark, meme generator, blur faces
- **10 free tasks** for anonymous users, then sign in for unlimited use
- **Auth** — email, magic link, Google OAuth
- **Dashboard** — usage stats, recent activity, saved workflows
- **UI** — fluid liquid-glass design, light & dark mode

## Stack

- TanStack Start (React Router + SSR)
- Supabase (auth, Postgres, storage)
- pdf-lib, pdfjs-dist, canvas APIs
- Motion, Tailwind CSS 4, Radix UI

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page — tool grid, categories, drag-to-launch |
| `/tools/$slug` | Generic tool runner |
| `/auth` | Sign in / sign up / magic link / Google |
| `/dashboard` | Usage, recent tools, workflows |

## Develop

```bash
npm install
npm run dev
```

Requires Supabase env vars and the `get_task_count` / `record_task` RPCs.

## License

Private / all rights reserved unless otherwise noted.
<!-- . -->