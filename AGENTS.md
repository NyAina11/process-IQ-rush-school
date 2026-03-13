# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ProcessIQ is an ERP dashboard for **Rush School** (a French school), managing Commercial, Admissions, RH (HR), and Student portals. The UI and all domain data are in **French** — field names, labels, form options, and API payloads use French terminology throughout.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — production build
- `npm run preview` — preview production build

There are no lint, typecheck, or test scripts configured. There is no test framework set up.

## Environment Variables

Copy `.env.example` to `.env.local`. Required keys:
- `VITE_BASE_API_URL` — base URL for the backend API
- `GEMINI_API_KEY` — exposed to the frontend via `process.env.GEMINI_API_KEY` (Vite define)
- `MONGODB_URI`, `JWT_SECRET`, `AIRTABLE_API_KEY` — backend-only

## Architecture

### Frontend (React + Vite + TypeScript)

**Entry:** `index.tsx` → `App.tsx` which defines all routes with `react-router-dom`. Routes are role-gated via `RequireAuth` (checks `localStorage` for `token` and `userRole`). Roles: `super_admin`, `admission`, `commercial`, `rh`, `eleve`.

**Routing structure (App.tsx):**
- `/` — Landing page (public)
- `/login`, `/register`, `/contact` — public pages
- `/admin/login`, `/admin` — separate admin auth flow (`adminAuthToken`)
- `/commercial/*` — Commercial dashboard, placer, alternance (role: `commercial`)
- `/admission` — Admission view (roles: `admission`, `commercial`)
- `/rh/*` — RH dashboard, fiche, cerfa, pec, ruptures (role: `rh`)
- `/etudiant` — Student view (role: `eleve`)

All page components are lazy-loaded via `React.lazy`.

**State management:** Zustand store (`store/useAppStore.ts`) with `persist` middleware. Manages toast notifications, candidate cache (with staleness check at 5 min), and form draft persistence for student/company forms.

**Styling:** Tailwind CSS v4 via `@tailwindcss/postcss` plugin. Styles in `index.css`.

### API Layer (`services/api.ts`)

This is the most critical and complex file. It contains:

1. **Data mappers** that translate between Airtable field names (French, with accents and spaces like `"Prénom"`, `"NOM de naissance"`, `"Entreprise d'accueil"`) and flat frontend TypeScript types defined in `types.ts`. There are four key mappers:
   - `mapBackendToStudent` — Airtable record → `StudentFormData`-like object
   - `mapBackendToCompany` — Airtable record → `CompanyFormData`-like object
   - `mapStudentToBackend` — frontend form → API payload (includes value normalization for sexe, nationalité, diplôme, formation codes)
   - `mapCompanyToBackend` — handles both structured (nested) and flat (Airtable fields) input formats

2. **CRUD operations** for candidates (`/admission/candidats`, `/admission/candidates/{id}`) and companies (`/admission/entreprise`, `/admission/entreprises/{id}`).

3. **Document generation endpoints** — CERFA, ATRE, convention apprentissage, livret apprentissage, certificat scolarité, compte rendu, fiche renseignement. All are POST to `/admission/candidats/{id}/{doc-type}`.

4. **Document upload** — maps doc types to endpoint slugs (cv→cv, cni→cin, lettre→lettre-motivation, etc.).

5. **Auth** — currently uses **mock login** that determines role from the email string (e.g., email containing "rh" → role "rh"). Registration is also mocked.

6. **`diffObjects` utility** — used for PATCH updates to send only changed fields.

### Backend (`api/` directory — Vercel Serverless + NestJS)

- `api/[...slug].ts` — catch-all Vercel serverless function that bootstraps a cached NestJS app instance. Sets global prefix `/api`, enables CORS, uses `ValidationPipe`.
- `api/health.ts` — simple health check endpoint.
- `api/src/app.module.ts` — NestJS root module with `ConfigModule`, `MongooseModule` (MongoDB), `AuthModule`, `UsersModule`.
- `api/src/auth/` — JWT + Passport authentication (local + JWT strategies).
- `api/src/users/` — User schema and service (Mongoose).

The NestJS backend is minimal (auth/users only). Most business logic (candidates, companies, documents) is handled by the **external API** at the `VITE_BASE_API_URL` (an Airtable-backed service), not by this NestJS backend.

### Custom Hooks (`hooks/`)

- `useApi` — generic async wrapper with loading/error state and toast integration
- `useCandidates` — fetches and merges data from three API sources (candidates, student fiches, companies), normalizes into a unified candidate list with document status flags
- `useCandidateDetails` — CRUD operations for a single candidate within a modal
- `useFilters` — search query and formation filter state
- `usePagination` — generic pagination logic

### Key Patterns

- **`getC()` normalizer** (`hooks/useCandidates.ts`): Extracts candidate fields from multiple possible data shapes (`c.fields`, `c.data`, `c.informations_personnelles`, or flat). Always use `getC(candidate)` to safely access candidate properties.
- **Airtable field name inconsistency**: The backend API returns Airtable records where field names are French with accents, spaces, and apostrophes. Some fields have multiple possible names (e.g., `"Carte Vitale"` vs `"vitale"`, `"Convention Apprentissage"` vs `"Convention"`). The mappers handle these variants.
- **Path alias**: `@/*` maps to the project root (configured in `tsconfig.json` and `vite.config.mts`).
- **Vite proxy**: `/api` requests in dev are proxied to `https://processiqfilegenerator.onrender.com`.

### Deployment

Deployed to **Vercel**. `vercel.json` rewrites `/api/*` to the NestJS serverless handler and all other non-asset routes to `index.html` (SPA fallback). Build output goes to `dist/`.
