# Vercel fix — hero only + 404 pages

The site now includes **built-in API routes** on Vercel. You do **not** need Render for basic pages.

## Do this on Vercel (2 minutes)

### 1. Environment Variables

Go to **Vercel → Project → Settings → Environment Variables**

**Add (required):**

| Name | Value |
|------|--------|
| `MONGO_URI` | Your MongoDB Atlas connection string (same as local `.env`) |

**Optional (recommended):**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://approval-hero-nb2m.vercel.app` |

**Remove or fix if present:**

| Name | Problem |
|------|---------|
| `NEXT_PUBLIC_API_URL` | If set to `http://localhost:5000/api` → **DELETE IT** |
| | Or set to: `https://approval-hero-nb2m.vercel.app/api` |

### 2. MongoDB Atlas

1. [cloud.mongodb.com](https://cloud.mongodb.com) → your cluster
2. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)
3. Confirm database `approval_hero` has data (run `npm run seed` locally if empty)

### 3. Redeploy

Vercel → **Deployments** → latest → **⋯** → **Redeploy**

### 4. Test

| URL | Should show |
|-----|-------------|
| `https://approval-hero-nb2m.vercel.app/api/health` | `{"success":true,...}` |
| `https://approval-hero-nb2m.vercel.app/api/public/pages/home` | JSON with sections |
| `https://approval-hero-nb2m.vercel.app` | Full home page |
| `https://approval-hero-nb2m.vercel.app/about` | About page |

---

## Admin & /apply on Vercel

Public pages work with `MONGO_URI` only.

For **admin login** and **/apply** (forms, OTP), you still need either:

- Deploy Express API to Render **and** set `NEXT_PUBLIC_API_URL` to that URL, **or**
- Add more env vars on Vercel: `JWT_SECRET`, `ENCRYPTION_KEY`, `SMTP_*`, etc. (future)

For now, fix the public site with `MONGO_URI` + redeploy.
