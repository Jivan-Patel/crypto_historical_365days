# PR Descriptions

---

## PR #1: README File

# 📄 Added Comprehensive Full-Stack Project README

## Description

This PR introduces a complete and structured README file for the **Crypto Market Analytics — Full Stack Dashboard** project. It provides detailed documentation covering both backend and frontend, making the repository professional and accessible.

## Changes Made

- Added project title, description, and complete tech stack (backend + frontend)
- Documented all features for both backend and frontend
- Included dataset information with 235,000+ records and Google Drive link
- Listed 50+ API endpoints across 15 categories
- Added full project folder structure (backend MVC + frontend feature-based)
- Included installation, environment setup, and run instructions for both backend and frontend

## Purpose

To establish clear and professional documentation for the project, enabling contributors, reviewers, and recruiters to easily understand the full-stack application and set it up.

## Files Added

```bash
README.md
```

## Notes

- This is a documentation-only update
- No changes have been made to application logic or functionality
- README covers both backend and frontend as a full-stack project

---

## PR #2: Backend Folder Structure

# 📁 Added Scalable Backend MVC Structure

## Description

This PR introduces the backend scaffold for the **Crypto Market Analytics** project inside the `backend/` folder. It establishes the MVC layout required for future backend development and installs the core runtime dependencies used by the API layer.

## Changes Made

- Created the backend project structure under `backend/`
- Added MVC-oriented folders for config, models, controllers, routes, and middlewares
- Added empty entry files for the Express application and server bootstrap
- Added the backend package manifest and lockfile
- Installed the core backend dependencies: `express`, `mongoose`, `cors`, `dotenv`, `bcrypt`, and `jsonwebtoken`
- Added `.gitignore` entries for environment files, dependencies, logs, and build artifacts

## Purpose

To prepare a clean and scalable backend foundation before implementing route logic, schemas, middleware behavior, and database integration.

## Files Added/Modified

```bash
backend/
```

## Notes

- This PR focuses on backend structure and setup only
- No business logic has been implemented yet
- The branch follows the project rule of one feature per branch / PR

---

## PR #3: Coin Schema & Database Models

# 🧱 Add Mongoose models for coins and users

## Description

This PR implements the core database schemas used by the backend: a `Coin` model representing the `crypto_historical_365days` collection and a `User` model for authentication.

## Changes Made

- Implemented `src/models/coin.model.js` with field types, validation defaults, timestamps, and indexes (including a compound unique index on `coin_id` + `date`).
- Implemented `src/models/user.model.js` with `username`, `email`, hashed `password`, role management, and a `comparePassword` helper.
- Added sensible defaults and soft-delete flags for safe operations.

## Purpose

To provide accurate, indexed Mongoose schemas that match the existing MongoDB collection and support performant queries and authentication flows.

## Files Added/Modified

```bash
backend/src/models/coin.model.js
backend/src/models/user.model.js
```

## Notes

- Schemas include indexes optimized for common queries (date, symbol, market_cap_rank).
- Passwords are hashed with `bcrypt` and not returned in JSON responses.

---

## PR #4: Database Configuration & Connection

# 🔌 MongoDB connection and environment example

## Description

This PR adds a reusable MongoDB connection module and `.env.example` template so the application can connect to the Atlas cluster securely via environment variables.

## Changes Made

- Added `src/config/db.js` exporting a `connectDB` function that uses `mongoose.connect()` with proper error handling and logging.
- Added `.env.example` with `PORT`, `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV` keys.

## Purpose

To centralize database connection logic and provide clear environment configuration for local and production deployments.

## Files Added

```bash
backend/src/config/db.js
.env.example
```

## Notes

- The `MONGO_URI` uses the provided Atlas connection string in `backendplan.md` by default; sensitive credentials should be set in a local `.env` and not committed.
- The `connectDB` function is safe to call from `src/index.js` or `src/app.js` during startup.

---

## PR #5: Authentication Middleware

# 🔐 Add JWT authentication middleware

## Description

This PR implements the authentication middleware that protects private endpoints by validating JWT tokens from the Authorization header.

## Changes Made

- Implemented `src/middlewares/auth.middleware.js`.
- Extracts bearer token from `Authorization` header.
- Verifies token using `JWT_SECRET`.
- Attaches authenticated user details to `req.user`.
- Returns clear errors for missing token, expired token, invalid token, and missing JWT configuration.

## Purpose

To establish a reusable security layer for protected APIs and keep authentication checks centralized in middleware.

## Files Added/Modified

```bash
backend/src/middlewares/auth.middleware.js
```

## Notes

- Middleware returns `401 Unauthorized` for invalid authentication states.
- Middleware returns `500` if `JWT_SECRET` is missing from environment configuration.

---

## PR #5.2: Authentication Core (follow-up)

# 🔐 Auth Core: Register, Login, Profile + Server Bootstrap

## Description

This follow-up PR implements the authentication endpoints and minimal server wiring to enable local testing of auth flows. It builds on the authentication middleware added in PR #5 and provides the register/login/profile routes, JWT issuance, and a small Express bootstrap for quick verification.

## Changes Made

- Implemented `register`, `login`, and `profile` handlers in `backend/src/controllers/auth.controller.js`.
- Added auth routing in `backend/src/routes/auth.routes.js` (`POST /auth/register`, `POST /auth/login`, `GET /auth/profile`).
- Created a minimal Express app in `backend/src/app.js` that mounts the auth routes, provides a health endpoint, and a 404 handler.
- Added a server bootstrap `backend/src/index.js` to load environment, connect to MongoDB via `connectDB()`, and start the server.
- Added a `start` script to `backend/package.json` (runs `node src/index.js`) — note: if the package.json was reverted, ensure `start` is added before running.

## Purpose

To provide a runnable auth implementation so reviewers can exercise registration, login (JWT issuance), and protected profile retrieval; this verifies middleware, model hashing, and token flows end-to-end.

## Files Added/Modified

```bash
backend/src/controllers/auth.controller.js
backend/src/routes/auth.routes.js
backend/src/app.js
backend/src/index.js
backend/package.json (start script)
```

## Endpoints Implemented

- `POST /auth/register` — register a new user and return a JWT
- `POST /auth/login` — authenticate and receive a JWT
- `GET /auth/profile` — protected endpoint that returns user info extracted from JWT

## Environment

Requires `MONGO_URI` and `JWT_SECRET` in `.env` (use `.env.example` as template).

## How to run / test

```bash
cd crypto_historical_365days/backend
npm install
# create .env with MONGO_URI and JWT_SECRET
npm start
```

Example requests:

```bash
# register
curl -X POST http://localhost:5000/auth/register -H "Content-Type: application/json" \
	-d '{"username":"alice","email":"alice@example.com","password":"P@ssw0rd"}'

# login
curl -X POST http://localhost:5000/auth/login -H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"P@ssw0rd"}'

# profile (replace <token> with received JWT)
curl http://localhost:5000/auth/profile -H "Authorization: Bearer <token>"
```

## Notes / Next Steps (PR 5.3 suggestions)

- Add request validation (Joi/Yup) and stronger password policy.
- Implement and integrate `error.middleware.js` and `logger.middleware.js` into `app.js`.
- Add rate limiting and unit/integration tests; export a Postman collection for documentation.

---

## PR #6: Core Read Routes

# 📥 Coin Read Endpoints (list, single, exists)

## Description

This PR implements core read-only API endpoints for the `coins` resource, providing paginated listing, single-record retrieval by `coin_id`, and existence checks. These endpoints enable clients to browse and fetch historical crypto records from the existing MongoDB collection.

## Changes Made

- Added `getAllCoins`, `getCoinById`, and `exists` handlers in `backend/src/controllers/coin.controller.js`.
- Added route mappings in `backend/src/routes/coin.routes.js` (`GET /coins`, `GET /coins/:id`, `GET /coins/exists/:id`).
- Mounted `/coins` in the Express app (`backend/src/app.js`).

## Purpose

To provide essential read operations for the API surface so frontend and integration tests can query dataset records with pagination and basic filters.

## Files Added/Modified

```bash
backend/src/controllers/coin.controller.js
backend/src/routes/coin.routes.js
backend/src/app.js
```

## Endpoints Implemented

- `GET /coins` — paginated listing with optional `search`, `symbol`, and `month` query params
- `GET /coins/:id` — fetch a single coin record by `coin_id`
- `GET /coins/exists/:id` — boolean existence check for a `coin_id`

## Notes / Next Steps

- Add advanced filtering, sorting, and field allowlists for `/coins`.
- Add integration tests and caching for high-traffic endpoints.
- Implement rate limiting and response compression for production readiness.

---

## PR #7: Core Write Routes

# ✍️ Coin Write Endpoints (create, replace, patch)

## Description

This PR adds authenticated write operations for the `coins` resource, enabling record creation, full replacement, and partial updates against the existing MongoDB collection.

## Changes Made

- Added `createCoin`, `updateCoin`, and `patchCoin` handlers in `backend/src/controllers/coin.controller.js`.
- Added authenticated write routes in `backend/src/routes/coin.routes.js` (`POST /coins`, `PUT /coins/:id`, `PATCH /coins/:id`).
- Reused JWT protection via `backend/src/middlewares/auth.middleware.js`.

## Purpose

To provide the core write layer needed for admin or authenticated client workflows that manage coin records alongside the existing read endpoints.

## Files Added/Modified

```bash
backend/src/controllers/coin.controller.js
backend/src/routes/coin.routes.js
```

## Endpoints Implemented

- `POST /coins` — create a new coin record
- `PUT /coins/:id` — replace an existing coin record
- `PATCH /coins/:id` — partially update an existing coin record

## How to test

#... (truncated for brevity in this file)

---

## PR #9: Bulk Delete with Reporting and Safe Limits

### Overview

This PR adds a robust, admin-only bulk delete endpoint for the `coins` resource. The endpoint performs safe soft-deletes (sets `deleted: true`) across many records while providing detailed per-request metrics and clear error responses to help clients retry or reconcile partial results.

### Why this matters

- Enables efficient cleanup or archival workflows for large sets of historical coin records without permanently removing data.
- Provides actionable feedback to clients (matched vs modified counts) so they can identify which ids were not present or already deleted.
- Enforces operational limits and admin-only access to prevent accidental large-scale data changes.

### Changes Made

- Added `DELETE /coins/bulk-delete` — accepts either a JSON array of `coin_id` strings or an object `{ ids: [...] }`.
- Implemented server-side safeguards: input validation, a maximum batch size to avoid resource exhaustion, and admin role enforcement.
- Returns a consistent confirmation payload containing `requested`, `matched`, `modified`, and `notFound` counts.

### Example Request

Request body (either form is accepted):

```json
["bitcoin-2026-05-01","ethereum-2026-05-01"]
```

---

## PR #21: Coin Comparison Pack

# 🔎 Coin Comparison Pack — Side-by-side metrics and ranking

## Description

This PR adds two public endpoints to compare multiple coins side-by-side using the latest available snapshot within an optional date range. The endpoints return raw values, normalized scores (relative to the maximum in the comparison set), and simple rankings for key fields.

## Endpoints

- `GET /coins/compare/:coin1/:coin2` — compare two coins
- `GET /coins/compare/:coin1/:coin2/:coin3` — compare three coins

Both endpoints accept optional query params `start` and `end` (ISO dates) to restrict the latest snapshot selection to a date window.

## Changes Made

- Added `compareTwoCoins` and `compareThreeCoins` handlers in `backend/src/controllers/coin.controller.js`.
- Added helper functions `getLatestSnapshot` and `buildComparison` for snapshot loading, normalization, and ranking.
- Wired routes in `backend/src/routes/coin.routes.js`.

## Files Modified

```bash
backend/src/controllers/coin.controller.js
backend/src/routes/coin.routes.js
```

## Example Response (abridged)

```json
{
  "success": true,
  "data": [
    {
      "coin_id": "bitcoin",
      "timestamp": "2026-05-29T23:59:00.000Z",
      "values": {
        "price": { "raw": 60000, "normalized": 1, "rank": 1 },
        "market_cap": { "raw": 1200000000000, "normalized": 1, "rank": 1 },
        "volume": { "raw": 3000000000, "normalized": 0.5, "rank": 1 }
      }
    },
    {
      "coin_id": "ethereum",
      "timestamp": "2026-05-29T23:58:00.000Z",
      "values": {
        "price": { "raw": 3200, "normalized": 0.053, "rank": 2 },
        "market_cap": { "raw": 380000000000, "normalized": 0.316, "rank": 2 },
        "volume": { "raw": 1500000000, "normalized": 0.25, "rank": 2 }
      }
    }
  ]
}
```

## Branch & Commit

- Branch: `coin-comparison-pack`
- Commit message: `feat(coins): add comparison endpoints (compare 2/3 coins)`

---
