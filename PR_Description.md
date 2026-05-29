## PR: Bulk Delete with Reporting and Safe Limits

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

or

```json
{ "ids": ["bitcoin-2026-05-01","ethereum-2026-05-01"] }
```

### Example Response

```json
{
  "success": true,
  "data": {
    "requested": 2,
    "matched": 2,
    "modified": 2,
    "notFound": 0
  }
}
```

### Error Handling & Notes

- Returns `400 Bad Request` if the `ids` array is missing, empty, or exceeds the configured safe limit.
- Returns `403 Forbidden` when the caller is not an admin.
- Uses `updateMany` to perform a soft-delete; counts are normalized across Mongoose versions for consistent responses.
