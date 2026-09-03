## Project overview

TaxDibo is a frontend-only dashboard (this repo) for a tax-filing/appointment service. It talks to a separate Spring Boot backend (not in this repo) documented in `API_GUID.md` — read that file for endpoint shapes, auth flow, and error formats before touching any `src/lib/api/*` code.

Core domain: authenticated users register/log in (email+password or Google), book tax-related appointments, and upload documents either standalone or attached to an appointment. Regular `USER` accounts only see their own data; `ADMIN` accounts (role set directly in the DB, no self-service) can see everything and get an extra "Users" nav item.

## Tech stack

- **React 19** + **TypeScript**, built with **Vite 8**
- **react-router-dom v7** for routing (`src/App.tsx`)
- **Tailwind CSS v4** (via `@tailwindcss/vite`) for styling, dark mode via a `.dark` class on `<html>`
- **shadcn/ui** ("base-nova" style, neutral base color) — components live under `@/components/ui` (path-aliased to `./@/components/ui`, note: alias root is `./@`, not `./src`)
- **lucide-react** for icons
- No state management library — auth/session state lives in React Context (`src/context/AuthContext.tsx`) backed by `localStorage`

## Structure

- `src/screens/` — route-level pages (Home, Login, Register, Profile, Appointments, AppointmentDetails, Documents, Users)
- `src/components/` — layout/shared components: `DashboardLayout`, `Sidebar`, `Header`, `AuthLayout`, `ProtectedRoute`, `TaxRequestModal`
- `src/context/AuthContext.tsx` — token/user state, login/register/logout, `isAdmin` (decoded from JWT role claim via `src/lib/jwt.ts`)
- `src/lib/api/` — one file per resource (`auth.ts`, `users.ts`, `appointments.ts`, `documents.ts`), all going through `client.ts`'s `apiRequest`/`apiDownload` helpers and shared `types.ts`
- `@/components/ui/` (top-level `@/` dir, not under `src/`) — shadcn primitives

## Backend integration

- API calls are relative (`/api/...`); Vite dev server proxies `/api` to `http://localhost:8080` (see `vite.config.ts`) since the backend sends no CORS headers.
- JWT stored in `localStorage` (`taxdibo-token`), attached as `Authorization: Bearer <token>` by `apiRequest`.
- On any `401`, `client.ts` clears the session and dispatches a `taxdibo:unauthorized` window event; `AuthContext` listens for it to reset in-memory auth state.
- No refresh-token flow — expired tokens force re-login.

## Current layout state (relevant to the UI Updates instructions above)

- `Sidebar.tsx` already supports collapsed/expanded state (persisted to `localStorage` as `taxdibo-sidebar-collapsed`, toggled from `DashboardLayout.tsx`).
- `DashboardLayout.tsx` already renders a `Header` above a scrollable (`overflow-y-auto`) content area holding the routed page (`Outlet`). Verify this still matches the "fixed top-header, scrollable pages" requirement before assuming it needs rework.
