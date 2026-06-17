# ADR 0001 — localStorage as write-through cache for subscriptions

**Status:** Accepted  
**Date:** 2026-06-17

## Context

Subscription mutations (add, edit, delete) previously wrote directly to Supabase on every user action. This caused two problems:

1. The UI had to navigate away before the DB write completed, meaning the Dashboard re-fetch could miss the new data (silent rollback to the user).
2. Any network hiccup during a mutation lost the change entirely.

## Decision

Use localStorage as a write-through cache for the `subscriptions` array:

- **Reads on load:** show localStorage data instantly; DB fetch runs in background and overwrites on arrival (DB is authoritative).
- **Mutations:** write to localStorage first (synchronous, instant), then fire a background DB write.
- **Sync to DB:** on every mutation (background), on window blur, and via a manual sync button in the Dashboard header.
- **Sync operation:** delete all DB rows for the user, then insert all from localStorage. Simple and guarantees DB matches localStorage exactly.
- **Conflict resolution:** last sync wins. Two simultaneous devices can clobber each other, but this is a personal single-user tracker — concurrent multi-device edits are not a supported use case.

## Alternatives considered

- **Direct DB writes (previous approach):** blocking, visible lag, navigate-before-write bug.
- **Delta sync / retry queue:** tracks individual failed operations and replays them. Correct under concurrent edits but significantly more complex for no practical benefit here.
- **Timer-based sync:** adds latency and requires dirty tracking. Dropped in favour of mutation-triggered background writes.

## Consequences

- Subscriptions always survive a page close (localStorage). DB may lag by one blur cycle at most.
- `storage.ts` owns both localStorage and Supabase layers. No other file touches `localStorage` for subscriptions.
- A `lastSyncedAt` timestamp is stored in localStorage and surfaced in the Dashboard header ("Synced X ago").
