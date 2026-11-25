# Thompson’s Design Work

The studio website and its private dashboard ("Studio OS"): a [TanStack Start](https://tanstack.com/start) app
(React 19, plain JavaScript) that runs on Vercel with its own Postgres database. No outside app platform is involved.

## What is where

| Part | Where |
| --- | --- |
| Public site: home, services, portfolio, about, FAQ, contact | `src/routes/_site/*` |
| Dashboard at `/admin`: inbox, customers, projects, portfolio, services, testimonials, FAQs, website editor, analytics, settings, account | `src/routes/_authed/admin/*` |
| Access-code sign-in for the dashboard | `src/components/admin/AdminGate.jsx`, `src/lib/AdminContext.jsx` |
| Server logic (every dashboard read/write is checked here) | `src/lib/admin.server.js`, `src/lib/admin-security.server.js` |
| Public data + contact form | `src/lib/public-fns.js` |
| Database | `src/lib/db.server.js` (one `records` table, created automatically), `src/lib/entities.server.js` |
| Uploads and email | `src/lib/integrations.server.js` (Vercel Blob, Resend) |
| Built-in starter text and images | `src/lib/site-defaults.js`, `public/media/` |

## Deploy on Vercel

1. Import the GitHub repo into Vercel. Framework preset is detected automatically (build: `npm run build`).
2. **Storage → Neon → Create** and connect it to the project. This adds `DATABASE_URL`.
3. **Storage → Blob → Create** (access: Public) and connect it. This adds `BLOB_READ_WRITE_TOKEN`.
4. **Settings → Environment Variables:** add `ADMIN_SETUP_KEY` (a long private phrase). Optional: `RESEND_API_KEY` and `EMAIL_FROM`.
5. Redeploy, open `/admin`, enter the setup key and choose your access code. That makes you the owner and copies the
   starter services, FAQs and portfolio pieces into the database so you can edit them.

See `.env.example` for every variable.

## Dashboard access

- One owner access code, stored as a salted PBKDF2 hash. Sessions last 8 hours.
- 5 wrong codes in 10 minutes locks that device out for 15 minutes.
- Lost code: on the sign-in screen choose **Lost your access code?** and enter the `ADMIN_SETUP_KEY`. That sets a new
  code and signs out every session. Wrong setup keys count toward the same lockout.
- Change the code any time under **Account & Security**.

## Run locally

```bash
npm install
DATABASE_URL=postgres://user@localhost:5432/db ADMIN_SETUP_KEY=some-long-phrase npm run dev
```

Any Postgres works locally (it uses the standard `pg` driver); Neon URLs use Neon's serverless driver.
`npm run build && npm start` runs the production build on port 3000.
