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

## Application (`/apply`) on Vercel

The apply form now uses **built-in API routes** on Vercel (same as CMS pages).

**Required on Vercel:**

| Name | Value |
|------|--------|
| `MONGO_URI` | Your MongoDB Atlas connection string |

**Recommended for email verification (OTP) and submission notifications:**

| Name | Value |
|------|--------|
| `ENCRYPTION_KEY` | Random 32+ char string (`npm run deploy:secrets`) |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email |
| `SMTP_PASS` | App password |
| `SMTP_FROM` | `Approval Hero <noreply@approvalhero.ca>` |
| `NOTIFICATION_EMAIL` | Where new applications are sent |

Without SMTP, the form loads and saves steps, but **email verification will fail** in production until SMTP is configured.

**Test after deploy:**

| URL | Should show |
|-----|-------------|
| `https://approval-hero-nb2m.vercel.app/apply` | Application wizard (step 1) |
| `POST .../api/public/applications/start` | `{ success: true, data: { token } }` |

---

## Admin on Vercel

Admin login still needs `JWT_SECRET` and related vars, or a separate Express host.
