# short.ly web

Next.js 14 + Tailwind + shadcn-style UI for the [short.ly](../) URL shortener API.

## Local development

```bash
cd web
cp .env.example .env.local
# edit NEXT_PUBLIC_API_URL if your API runs somewhere other than localhost:8000
npm install
npm run dev
# open http://localhost:3000
```

The frontend talks to the FastAPI backend over fetch. Make sure the backend is running and `cors_origins` includes the frontend origin.

## Pages

| Path | Notes |
|------|-------|
| `/` | Anonymous shorten + landing page |
| `/login`, `/register` | Auth |
| `/dashboard` | Authenticated link list, create + delete |
| `/links/[code]` | Stats (charts), QR code, edit/disable/delete |
| `/unlock/[code]` | Password unlock UI for protected links |
| `/<anything-else>` | Forwarded to the backend redirect via `next.config.mjs` rewrite |

## Deploy to Vercel

The repo includes a Vercel-ready Next.js config. To deploy:

1. Import the repo on https://vercel.com/new — set the **Root Directory** to `web`.
2. Add an environment variable: `NEXT_PUBLIC_API_URL=https://api.your-domain.com` (your backend URL).
3. Add your custom domain in Project Settings → Domains.

Any unmatched single-segment path (e.g. `your-domain.com/abc123`) is rewritten to the backend so visitors see a clean redirect.
