## Inversion

Next.js 14+ (App Router), TypeScript, Tailwind v4, shadcn/ui, Prisma, NextAuth.

### Setup

1) Copy environment template and fill values:
```bash
cp .env.example .env.local
```

Required env vars:
- `DATABASE_URL` (PostgreSQL)
- `AUTH_SECRET` (use `openssl rand -base64 32`)
- `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- `AUTH_LINKEDIN_ID`, `AUTH_LINKEDIN_SECRET`

2) Install deps:
```bash
npm install
```

3) Generate Prisma client and sync schema:
```bash
npm run prisma:generate
npm run db:push
```

4) Start dev server:
```bash
npm run dev
```

App runs at http://localhost:3000. All main routes are protected; use `/signin` to login via GitHub, Google, or LinkedIn.

### Observability
- Sentry enabled; set `NEXT_PUBLIC_SENTRY_DSN` (and/or `SENTRY_DSN`) to capture errors and traces.

### PDF Conversion (AWS Lambda)
- UI: `src/app/ai-tools/pdf/page.tsx` — raw text box (Markdown or LaTeX) → downloads PDF
- API: `POST /api/pdf` — proxies to AWS Lambda and streams back the PDF
- Configure environment variables:
  - `LAMBDA_PDF_URL` — your AWS Lambda HTTPS endpoint URL
  - `LAMBDA_PDF_API_KEY` — optional API key header `x-api-key`

### Deployment
- Frontend: Vercel (Next.js App Router)
- Database: Supabase (Postgres) or AWS RDS Postgres
- Set environment on Vercel: `DATABASE_URL`, NextAuth provider keys, `AUTH_SECRET`, `OPENAI_API_KEY`, Sentry DSN
- Run `npm run prisma:generate` then `npm run db:migrate` after attaching database

### Scripts
- `npm run db:push` – Apply Prisma schema to DB
- `npm run db:migrate` – Create dev migration
- `npm run db:studio` – Open Prisma Studio
- `npm run prisma:generate` – Generate Prisma client
