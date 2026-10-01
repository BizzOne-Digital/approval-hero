# Approval Hero

Single-repo vehicle financing website, application funnel, CMS API, and admin portal.

## Tech Stack

- **Web:** Next.js 14, TypeScript, Tailwind, Framer Motion
- **API:** Express, MongoDB, JWT auth, encrypted PII, Twilio SMS OTP
- **Admin:** `/admin` — pages, applications, leads, media, settings

## Project Structure

```
approval-hero/
├── src/                 # Next.js (public site + admin)
├── public/
├── server/              # Express API
│   ├── src/
│   └── uploads/         # Local media (persist in production)
├── deploy/              # nginx example config
├── scripts/             # deploy check, secrets generator
├── docker-compose.yml
├── Dockerfile
├── ecosystem.config.js  # PM2 (VPS)
└── .env                 # All environment variables
```

## Local Development

```bash
cd approval-hero
cp .env.example .env
npm install
npm run seed
npm run create-admin
npm run dev
```

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Website |
| http://localhost:3000/apply | Financing application |
| http://localhost:3000/admin/login | Admin portal |
| http://localhost:5000/api/health | API health check |

Default admin: `admin@approvalhero.ca` / `ChangeMe123!`

---

## Production Deployment

### 1. Generate secrets

```bash
npm run deploy:secrets
```

Copy the output into your production `.env` for `JWT_SECRET` and `ENCRYPTION_KEY`.

### 2. Configure production `.env`

Use `.env.example` as a template. **Required for production:**

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string (from `deploy:secrets`) |
| `ENCRYPTION_KEY` | 32+ char random string (from `deploy:secrets`) |
| `FRONTEND_URL` | `https://yourdomain.com` |
| `COOKIE_SECURE` | `true` |
| `NEXT_PUBLIC_API_URL` | `https://yourdomain.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
| `NEXT_PUBLIC_UPLOADS_URL` | `https://yourdomain.com` |
| `SMTP_*` | Email OTP verification on `/apply` + application notifications |

**Optional:** `INTERNAL_API_URL=http://127.0.0.1:5000` — proxies `/api` through Next.js when only port 3000 is public.

### 3. Pre-deploy check

```bash
npm run deploy:check
```

Set `NODE_ENV=production` in `.env` before running to validate production settings.

### 4. Build

```bash
npm install
npm run build
```

### 5. Choose a hosting method

#### Option A — VPS with PM2 + nginx (recommended)

```bash
# On the server
npm run build
npm run pm2:start
pm2 save
pm2 startup   # follow instructions for boot persistence
```

Use `deploy/nginx.conf.example` as a starting point. It routes:

- `/` → Next.js (`:3000`)
- `/api` and `/uploads` → Express (`:5000`)

Get SSL with [Certbot](https://certbot.eff.org/):

```bash
sudo certbot --nginx -d yourdomain.com
```

#### Option B — Docker Compose

```bash
# Ensure production .env is in place
npm run docker:build
npm run docker:up
```

Exposes the website on port `3000`. The `web` service proxies `/api` to the internal `api` service via `INTERNAL_API_URL`.

#### Option C — Manual start

```bash
npm run build
npm run start
```

Runs API (`:5000`) and web (`:3000`) together via `concurrently`.

---

## Post-Deploy Checklist

- [ ] Change default admin password in admin portal
- [ ] Confirm `https://yourdomain.com/api/health` returns OK
- [ ] Complete a test `/apply` submission (OTP works with Twilio)
- [ ] Confirm application notification email arrives
- [ ] Back up `server/uploads/` regularly (or migrate to S3 later)
- [ ] MongoDB Atlas IP allowlist includes your server IP

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development (API + web) |
| `npm run build` | Production build |
| `npm run start` | Start both processes |
| `npm run deploy:check` | Validate env before deploy |
| `npm run deploy:secrets` | Generate JWT + encryption keys |
| `npm run pm2:start` | Start with PM2 |
| `npm run pm2:reload` | Zero-downtime reload after deploy |
| `npm run docker:up` | Docker Compose production |
| `npm run seed` | Populate CMS database |
| `npm run create-admin` | Create admin user |

## Environment Notes

- **Uploads** persist in `server/uploads/` — include this directory in backups.
- **PII encryption** uses `ENCRYPTION_KEY` — never change it after live applications exist without a migration plan.
- **CORS** uses `FRONTEND_URL` — must match your public site URL exactly.
- Legacy `backend/` and `frontend/` folders can be deleted.
