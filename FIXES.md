# Corsair Bug Fixes Log (Gravitas Verification)

A comprehensive log of all bug fixes resolved in [`corsairdev/corsair`](https://github.com/corsairdev/corsair), synced into [`mananjain04/corsair-fixes`](https://github.com/mananjain04/corsair-fixes).

---

## Quick Summary Table

| # | Issue | Package | Problem | Solution | Test File | Commit |
|---|---|---|---|---|---|---|
| **1** | [#1873](https://github.com/corsairdev/corsair/issues/1873) | `agentql` | Key order in query params caused different SHA-256 cache keys for identical queries | Sorted object keys recursively before hashing | `packages/agentql/endpoints/cache-keys.test.ts` | [`1a5e5d21`](https://github.com/mananjain04/corsair-fixes/commit/1a5e5d21) |
| **2** | [#1871](https://github.com/corsairdev/corsair/issues/1871) | `googlemaps` | `departure_time` in milliseconds was multiplied by 1000 into year 55840 | Detect millisecond timestamps (`num >= 1e11`) and divide by 1000 | `packages/googlemaps/api.test.ts` | [`6b85a62f`](https://github.com/mananjain04/corsair-fixes/commit/6b85a62f) |
| **3** | [#1870](https://github.com/corsairdev/corsair/issues/1870) | `figma` | Deleting comments marked `resolved_at` in DB instead of deleting local row | Call `ctx.db.comments.deleteByEntityId(input.comment_id)` | `packages/figma/endpoints/comments.test.ts` | [`980075fd`](https://github.com/mananjain04/corsair-fixes/commit/980075fd) |
| **4** | [#1869](https://github.com/corsairdev/corsair/issues/1869) | `trello` | `cards.delete` & `boards.delete` left deleted rows in local database | Added `deleteByEntityId` calls for both cards and boards | `packages/trello/endpoints/delete.test.ts` | [`e104dc2c`](https://github.com/mananjain04/corsair-fixes/commit/e104dc2c) |
| **5** | [#1844](https://github.com/corsairdev/corsair/issues/1844) | `typeform` | `deleteWebhookConfig` passed internal DB row UUID instead of `entity_id` | Changed lookup to `webhookEntityId = existing[0]?.entity_id` | `packages/typeform/endpoints/webhooks-config.test.ts` | [`1da0e7f3`](https://github.com/mananjain04/corsair-fixes/commit/1da0e7f3) |
| **6** | [#1840](https://github.com/corsairdev/corsair/issues/1840) | `todoist` | `tasks.move` hit update endpoint `tasks/{id}` instead of move endpoint | Changed endpoint to `tasks/${input.id}/move` | `packages/todoist/endpoints/tasks.test.ts` | [`7619baf5`](https://github.com/mananjain04/corsair-fixes/commit/7619baf5) |
| **7** | [#1839](https://github.com/corsairdev/corsair/issues/1839) | `reddit` | `getComments` crashed with `ZodError` when post listing had no `t3` child (e.g. deleted post) | Only parse when `postRaw` exists, return `null` otherwise and make `post` nullable in schema | `packages/reddit/endpoints/posts.test.ts` | [`89088fcd`](https://github.com/mananjain04/corsair-fixes/commit/89088fcd) |
| **8** | [#1838](https://github.com/corsairdev/corsair/issues/1838) | `spotify` | `tracks.search`, `playlists.search`, `artists.search` omitted required `type` parameter | Defaulted `type` to `'track'`, `'playlist'`, `'artist'` per endpoint | `packages/spotify/endpoints/search.test.ts` | [`c0e5667e`](https://github.com/mananjain04/corsair-fixes/commit/c0e5667e) |
| **9** | [#1837](https://github.com/corsairdev/corsair/issues/1837) | `spotify` | `makeSpotifyRequest` dropped body on `DELETE`, breaking `playlists.removeItem` | Forward body on `DELETE` and omit `playlist_id` from body | `packages/spotify/endpoints/remove-item.test.ts` | [`263986ae`](https://github.com/mananjain04/corsair-fixes/commit/263986ae) |
| **10** | [#1836](https://github.com/corsairdev/corsair/issues/1836) | `spotify` | `playlists.getUserPlaylists` called non-existent `users/me/playlists` when `user_id` omitted | Route to `me/playlists` when `user_id` is omitted or `'me'` | `packages/spotify/endpoints/user-playlists.test.ts` | [`aacc6c34`](https://github.com/mananjain04/corsair-fixes/commit/aacc6c34) |

---

## Detailed Breakdown

### 1. AgentQL - Deterministic Cache Key (#1873)
- **Files Modified:** `packages/agentql/endpoints/cache-keys.ts`
- **Root Cause:** When generating SHA-256 hash keys for caching query responses, `JSON.stringify(params)` was called directly. Because JavaScript object key iteration depends on insertion order, `{ a: 1, b: 2 }` and `{ b: 2, a: 1 }` produced different hashes for the exact same query, causing cache misses.
- **Fix:** Added `sortObjectKeys` helper to recursively sort all object keys before serialization.
- **Unit Test:** `packages/agentql/endpoints/cache-keys.test.ts` verifies identical hash for different key orders.

### 2. Google Maps - Millisecond Departure Time (#1871)
- **Files Modified:** `packages/googlemaps/endpoints/routes.ts`
- **Root Cause:** The handler checked if `typeof departure_time === 'number'` and multiplied by 1000 assuming input was always in seconds. When callers passed a millisecond timestamp (standard JS `Date.now()`), it was multiplied into the year 55840.
- **Fix:** Added a check `num >= 1e11` to identify millisecond timestamps and divide by 1000 into seconds (which Google Maps API expects).
- **Unit Test:** `packages/googlemaps/api.test.ts` checks milliseconds vs seconds normalization.

### 3. Figma - Comment Deletion (#1870)
- **Files Modified:** `packages/figma/endpoints/comments.ts`
- **Root Cause:** When deleting a Figma comment, the code was calling `ctx.db.comments.upsertByEntityId` setting `resolved_at`, leaving the deleted row in the local store.
- **Fix:** Switched to calling `ctx.db.comments.deleteByEntityId(input.comment_id)`.
- **Unit Test:** `packages/figma/endpoints/comments.test.ts` verifies `deleteByEntityId` is called.

### 4. Trello - Card & Board Deletion (#1869)
- **Files Modified:** `packages/trello/endpoints/cards.ts`, `packages/trello/endpoints/boards.ts`
- **Root Cause:** In Trello, `cards.delete` and `boards.delete` executed remote DELETE requests, but did not clean up local database records.
- **Fix:** Added `await ctx.db.cards.deleteByEntityId(input.cardId)` and `await ctx.db.boards.deleteByEntityId(input.boardId)`.
- **Unit Test:** `packages/trello/endpoints/delete.test.ts`.

### 5. Typeform - Webhook Config Deletion by Entity ID (#1844)
- **Files Modified:** `packages/typeform/endpoints/webhooks-config.ts`
- **Root Cause:** In `deleteWebhookConfig`, `ctx.db.webhookConfigs.search` was called, but line 105 passed `existing[0]?.id` (the internal database primary key UUID) to `deleteByEntityId`, which requires the business `entity_id`.
- **Fix:** Changed to `webhookEntityId = existing[0]?.entity_id`.
- **Unit Test:** `packages/typeform/endpoints/webhooks-config.test.ts`.

### 6. Todoist - Route Tasks Move to Correct Endpoint (#1840)
- **Files Modified:** `packages/todoist/endpoints/tasks.ts`
- **Root Cause:** `tasks.move` was sending `POST tasks/${input.id}`, which is the task update route in Todoist REST API v2, instead of the move endpoint.
- **Fix:** Changed the path to `tasks/${input.id}/move`.
- **Unit Test:** `packages/todoist/endpoints/tasks.test.ts`.

### 7. Reddit - Handle Posts without t3 Child in getComments (#1839)
- **Files Modified:** `packages/reddit/endpoints/posts.ts`, `packages/reddit/endpoints/types.ts`
- **Root Cause:** In `posts.getComments`, `PostDataSchema.parse(postRaw?.data ?? {})` was called unconditionally. When a post was deleted or removed, `postRaw` was undefined, so parsing `{}` threw a `ZodError` (missing required fields) crashing the entire request.
- **Fix:** Changed to `const post = postRaw ? PostDataSchema.parse(postRaw.data) : null;` and made `post: PostDataSchema.nullable()` in `GetPostCommentsResponseSchema`.
- **Unit Test:** `packages/reddit/endpoints/posts.test.ts`.

### 8. Spotify - Inject Required Type Parameter in Search (#1838)
- **Files Modified:** `packages/spotify/endpoints/tracks.ts`, `packages/spotify/endpoints/playlists.ts`, `packages/spotify/endpoints/artists.ts`
- **Root Cause:** Spotify's `/v1/search` endpoint strictly requires a `type` query parameter. The handlers spread `...input`, but when `type` was omitted in the input, Spotify responded with 400 Bad Request.
- **Fix:** Added default `type` fallback per endpoint (`type: input.type || 'track'`, `'playlist'`, `'artist'`), identical to `albums.ts`.
- **Unit Test:** `packages/spotify/endpoints/search.test.ts`.

### 9. Spotify - Forward Body on DELETE Requests (#1837)
- **Files Modified:** `packages/spotify/client.ts`, `packages/spotify/endpoints/playlists.ts`
- **Root Cause:** `makeSpotifyRequest` dropped the body for any method other than POST/PUT/PATCH. Spotify's `DELETE /playlists/{id}/tracks` requires a body with the `tracks` array. Furthermore, `playlists.removeItem` passed the entire `input` including `playlist_id` into the body.
- **Fix:** Added `method === 'DELETE'` to the allowed body methods in `client.ts`, and destructured `const { playlist_id, ...body } = input;` in `removeItem`.
- **Unit Test:** `packages/spotify/endpoints/remove-item.test.ts`.

### 10. Spotify - Use me/playlists When user_id is Omitted (#1836)
- **Files Modified:** `packages/spotify/endpoints/playlists.ts`
- **Root Cause:** `playlists.getUserPlaylists` defaulted `userId` to `'me'` and called `users/me/playlists`, which does not exist in Spotify API and returned 404.
- **Fix:** When `user_id` is omitted or `'me'`, route to `me/playlists`; otherwise call `users/${user_id}/playlists`.
- **Unit Test:** `packages/spotify/endpoints/user-playlists.test.ts`.
