# Analytics Dashboard

This repository contains a small analytics dashboard (React + Vite) and a lightweight Express server that serves static JSON data from `server/data` for local development.

This README describes setup and development instructions, assumptions I made while implementing UI improvements, and the main libraries used.

## Quick overview
- Client (frontend): `client/` — React + TypeScript + Tailwind + Vite
- Server (backend): `server/server.js` — Express serving JSON files from `server/data`

## Setup instructions

Prerequisites
- Node.js 18+ (or a recent LTS)
- npm, yarn, or pnpm

1. Install server dependencies (none required beyond Node, the server uses built-in modules)

2. Install dependencies

You can install dependencies either per-package or from the repo root.

- Per-package (install client deps only):

```bash
cd client
npm install
# or: pnpm install
```

- From the repo root (recommended for a single command):

```bash
npm install
```

This installs the small root dev dependency (`concurrently`) and any other top-level dev deps. Note: you may still need to run `npm install` inside `client/` if you prefer managing client deps separately.

3. Add .env file as .env.example


4. Start servers

The repository includes a root `start` script that launches both the backend and frontend concurrently. From the repository root run:

```bash
npm start
```

This runs the server and the Vite dev server together (frontend on port 4000 by default, backend on port 8000). You can still run the servers individually if needed:

```bash
# start backend only (from repo root)
node server/server.js

# start frontend only (from client/)
cd client && npm run dev
```

The frontend proxies `/api` requests to the backend (configured in `client/vite.config.ts`). The backend listens by default on port `8000` (override via `SERVER_SIDE_PORT`).

## Project structure (important files)

- `client/src/components/DetailedTable.tsx` — main table UI (virtualized list, filtering, sorting, pagination)
- `client/src/components/FiltersPanel.tsx` — filter controls (search, coverage slider, usage chips)
- `client/src/components/Skeletons.tsx` — loading skeletons for filters and table rows
- `client/src/api/client.ts` — centralized small API client with timeout handling and global error notification wiring
- `client/src/context/snackbar-context.tsx` — SnackbarProvider used to show toast notifications
- `client/src/context/snackbar-service.ts` — small service that registers a global handler so non-React modules (the API client) can trigger snackbars
- `server/server.js` — Express server that reads JSON files from `server/data` and exposes endpoints: `/api/summary`, `/api/coverage-usage`, `/api/coverage-trends`, `/api/apis`

## Assumptions made

- The `server/data` folder contains date-prefixed JSON files in the shape the server expects:
  - Coverage files named `api_coverage_YYYY-MM-DD.json` containing an object keyed by API name with fields like `covered_lines`, `full_size`, and optional `apidoc`.
  - Usage files named `api_usage_YYYY-MM-DD.json` containing an array of usage objects with `api_name`, `usage_count`, and `total_clients`.
- The frontend will run on port `4000` (Vite) and backend on `8000`; Vite proxies `/api` to the backend for local dev.
- Tailwind CSS is used for all styling. I intentionally relied on Tailwind utilities instead of a component library to keep styling consistent and lightweight.

## Libraries used

Frontend
- React 19
- TypeScript
- Vite (dev server + build)
- Tailwind CSS (utility-first styling)
- @tanstack/react-virtual (virtualized scrolling)
- react-router-dom (URL/search params handling)
- recharts (charts)
- styled-components + `@mui/styled-engine-sc` (a compatibility alias was added so MUI's styled engine resolves to styled-components if MUI is used; see notes below)

Dev / build
- TypeScript
- ESLint
- PostCSS / Autoprefixer

Backend
- Express (minimal server for local JSON files)

## Important implementation notes

- Global snackbar: The API client cannot use React hooks directly. To show error notifications from the client, a tiny module `client/src/context/snackbar-service.ts` registers a global handler exported by the `SnackbarProvider`. The API client calls `showGlobalSnackbar(...)` to display errors.

- API client: `client/src/api/client.ts` provides `fetchWithTimeout` and `apiClient.get/post` helpers that throw typed errors (NetworkError, TimeoutError, APIError) and show snackbars for common failure cases.

- Tailwind-first styling: I updated `FiltersPanel`, `DetailedTable`, and `Skeletons` to use Tailwind utility classes for a compact, consistent look (search with clear button, compact filter chips, coverage indicator, usage pills, truncated names, zebra rows, animated expand/collapse).

- MUI / Emotion note: At one point the app triggered an error complaining `@emotion/styled` could not be resolved. Since this repo does not otherwise use MUI components, I added a Vite alias in `client/vite.config.ts` to map `@mui/styled-engine` -> `@mui/styled-engine-sc` and updated `client/package.json` to include `styled-components` and `@mui/styled-engine-sc`. If you prefer to avoid these packages entirely, remove those entries from `client/package.json` and delete the alias in `client/vite.config.ts`. If you plan to use MUI components that expect Emotion, instead reinstall `@emotion/react` and `@emotion/styled`.

## TypeScript / editor notes

- If you see editor/type errors regarding `Set`, `Promise`, or `String.includes`, ensure the TS `lib` option includes `es2015`/`es2019`/`es2022`. The client `tsconfig.app.json` in this project already includes appropriate libs; if your editor still flags errors, try reloading the TS server or your editor.

## Generating large sample data (optional)

To test UI performance with many APIs (for example 5,000 APIs), you can generate sample coverage and usage JSON files and place them in `server/data` named like `api_coverage_2025-11-04.json` and `api_usage_2025-11-04.json`.

Here's a tiny Node script you can run from `server/` to create synthetic files (example only):

```js
// server/scripts/generate-sample.js
const fs = require('fs');
const path = require('path');

const N = 5000;
const date = '2025-11-04';
const coverage = {};
const usage = [];

for (let i = 0; i < N; i++) {
  const name = `api_${i.toString().padStart(5,'0')}`;
  const full = Math.floor(Math.random() * 1000) + 50;
  const covered = Math.floor(full * (Math.random() * 0.9));
  coverage[name] = { full_size: full, covered_lines: covered, apidoc: `Docs for ${name}` };
  usage.push({ api_name: name, usage_count: Math.floor(Math.random() * 1000), total_clients: Math.floor(Math.random() * 50) });
}

fs.writeFileSync(path.join(__dirname, '..', 'data', `api_coverage_${date}.json`), JSON.stringify(coverage, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', `api_usage_${date}.json`), JSON.stringify(usage, null, 2));
console.log('done');
```

Run it with:

```bash
cd server
node scripts/generate-sample.js
```

Note: that script is intentionally simple and synchronous — it is for local testing only.

## Troubleshooting

- If the frontend reports an import error for `@emotion/styled`, either install Emotion packages or follow the instructions above to remove/alias MUI styled engine.
- If requests to `/api` fail in the browser, check the backend is running on port `8000` and that `client/vite.config.ts` proxy settings are correct.

## Next steps / suggestions

- Add E2E visual tests to verify rendering with large datasets (Cypress or Playwright).
- Add a small smoke test script that fetches `/api/apis?date=...` and validates response shape.
- If you want, I can remove the unused `ErrorMessage.tsx` component (snackbars are being used instead) and tidy dependencies.

---

If you'd like I can generate the large sample files for you now, remove the temporary MUI alias and revert to a Tailwind-only setup, or update `tsconfig` to remove editor warnings — tell me which and I'll apply the changes.
npm install -g concurrently
