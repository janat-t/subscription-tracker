---
name: verifier-browser
description: Verify UI changes in the subscription tracker via Playwright against the preview build
---

# Browser Verifier — Subscription Tracker

Dev server has a pre-existing issue: `__BUNDLED_DEV__ is not defined` from Supabase JS causes blank page in headless browsers. Always verify against the **preview build** instead.

## Setup

```bash
# 1. Build
npm run build

# 2. Start preview server
npm run preview -- --port 5175 &
sleep 4 && curl -s -o /dev/null -w "%{http_code}" http://localhost:5175/
# should print 200
```

## Drive with Playwright

```js
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const BASE = 'http://localhost:5175';

await page.goto(BASE);
await page.waitForSelector('h1', { timeout: 8000 }); // wait past AuthGate null
```

## Notes

- AuthGate renders `null` while Supabase session resolves — always `waitForSelector('h1')` before interacting
- Auth flows (sign-in, sign-up, migration) require real Supabase network access; not testable in sandbox
- Guest mode (localStorage only) is fully testable — all CRUD ops work without auth
