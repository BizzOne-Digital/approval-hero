# Vercel + API deployment fix

## Problem

If you only deployed to **Vercel**, the site shell loads but:

- **Home** shows only the hero (CMS sections come from the API)
- **About, Services, etc.** show **404** (page data is fetched from MongoDB via the Express API)

Vercel hosts **Next.js only**. The API (`server/`) must run separately.

---

## Fix in 3 steps

### Step 1 — Deploy the API (Render example)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect repo
3. Settings:
   - **Root Directory:** `approval-hero` (if repo root is parent folder)
   - **Build Command:** `npm install && npm run build:api`
   - **Start Command:** `node server/dist/server.js`
4. Environment variables (copy from your `.env`, but production values):

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your MongoDB Atlas URI |
| `JWT_SECRET` | run `npm run deploy:secrets` locally |
| `ENCRYPTION_KEY` | from `deploy:secrets` |
| `FRONTEND_URL` | `https://YOUR-VERCEL-URL.vercel.app` |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAME_SITE` | `none` |
| `SMTP_*` | your email settings |

5. Deploy → copy your API URL, e.g. `https://approval-hero-api.onrender.com`

6. Test: open `https://approval-hero-api.onrender.com/api/health`  
   Should return: `{"success":true,"message":"Approval Hero API is running"}`

7. **MongoDB Atlas** → Network Access → allow `0.0.0.0/0` (or Render IPs)

8. Run seed once on Render shell (or locally pointing to Atlas):
   ```bash
   npm run seed
   ```

---

### Step 2 — Vercel environment variables

Vercel → Project → **Settings** → **Environment Variables**:

| Name | Example |
|------|---------|
| `NEXT_PUBLIC_API_URL` | `https://approval-hero-api.onrender.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.vercel.app` |
| `NEXT_PUBLIC_UPLOADS_URL` | `https://approval-hero-api.onrender.com` |

Optional (SSR fallback, same as API URL without `/api`):

| `API_URL` | `https://approval-hero-api.onrender.com` |

**Redeploy** after saving (Deployments → ⋮ → Redeploy).

---

### Step 3 — Vercel project settings

- **Root Directory:** `approval-hero` (if not already)
- **Framework:** Next.js
- **Build Command:** `npm run build` or default `next build`

---

## Quick test after fix

| URL | Expected |
|-----|----------|
| `https://api-host/api/health` | JSON success |
| `https://api-host/api/public/pages/home` | JSON with page sections |
| `https://vercel-site.vercel.app` | Full home page with sections |
| `https://vercel-site.vercel.app/about` | About page (not 404) |

---

## Still 404?

1. `NEXT_PUBLIC_API_URL` still points to `localhost` → fix on Vercel and redeploy
2. API `FRONTEND_URL` does not match Vercel URL exactly → CORS blocks requests
3. MongoDB not seeded → pages exist in code but not in database → run `npm run seed`
4. Wrong Vercel root folder → build deploys empty/wrong app
