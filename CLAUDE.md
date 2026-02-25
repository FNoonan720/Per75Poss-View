# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

This is a vanilla JS Manifest V3 Chrome extension — no build step, no bundler, no package manager.

**Loading the extension:**
1. Go to `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and select this directory

**Reloading after changes:** Click the refresh icon on the extension card at `chrome://extensions`, then hard-reload the nba.com tab (Ctrl+Shift+R). Changes to `background/service-worker.js` require clicking "Update" on the extensions page.

**Testing manually:** Navigate to `https://www.nba.com/stats/players/traditional`, wait for the table to load, then select "Per 75 Poss" from the Per Mode dropdown.

**`load_unpacked.js`** at the repo root is a Playwright snippet template for loading the extension in a persistent browser context — it is not a runnable test file.

## Architecture

The extension uses a two-world content script pattern to work around nba.com's CSP:

```
page-intercept.js  (MAIN world)     — patches window.fetch, fires CustomEvents
api-interceptor.js (isolated world) — listens for CustomEvents, stores params
main.js            (isolated world) — orchestrator; on "Per 75 Poss" selected,
                                      sends FETCH_STATS messages to service worker
service-worker.js  (background)     — proxies stats.nba.com API calls (CORS bypass),
                                      5-min in-memory cache, 3 retries w/ backoff
dom-injector.js    (isolated world) — injects dropdown option, updates table cells
stats-calculator.js(isolated world) — isScalable() + calculatePer75()
shared/constants.js(isolated world) — Per75 namespace, non-scalable column sets
```

**Data flow for a Per 75 request:**
1. `page-intercept.js` captures the nba.com page's own `leaguedashplayerstats` fetch params via a patched `window.fetch`, dispatches `per75-params-intercepted` CustomEvent
2. `api-interceptor.js` receives params and stores them on `Per75.interceptor.currentParams`. If no fetch has been intercepted yet (e.g., user selects Per 75 immediately on load), it falls back to `_parseParamsFromPage()`, which reads the URL path and query string
3. User selects "Per 75 Poss" → `main.js._onPer75Selected()` fires
4. `main.js` sends `FETCH_STATS` messages to the service worker: one for totals, one for advanced totals (to get possession counts). When the current page is already `MeasureType=Advanced`, the same fetch is reused for both, so only one API call is made
5. `stats-calculator.js.calculatePer75()` divides each scalable stat by player possessions, multiplies by 75
6. `dom-injector.js.updateTable()` matches rows by player name and overwrites scalable cells

**SPA navigation** is handled by a `MutationObserver` on `document.body` in `main.js` watching for URL changes. On navigation, state resets and the dropdown option re-injects.

## Key Constraints

- **CSP**: nba.com blocks inline scripts — fetch interception must use `world: "MAIN"` in manifest, not injected `<script>` tags
- **Table selector**: `table.Crom_table__p1iZz` — `querySelector('table')` hits a DatePicker calendar first
- **Player name cell**: `.Crom_primary__EajZu` (hashed, may change) with fallback to `a[href*="/stats/player/"]`
- **Per Mode dropdown**: `_findPerModeDropdown()` first queries `select.DropDown_select__4pIg9`, then all `select` elements; identified definitively by options containing both "Per Game" and "Totals"
- **Header case**: DOM headers are mixed case ("Player", "Pts") — `dom-injector.js` uppercases them before mapping to API column names via `DISPLAY_TO_API`
- **Non-scalable columns**: percentages, ratings, rankings, GP/W/L/MIN/AGE, DD2/TD3 — defined in `shared/constants.js`; do not scale these
- **Player matching**: rows are matched by player name string (not ID) because the DOM doesn't expose player IDs directly
- **Service worker cache**: stored in-memory; resets when Chrome suspends the service worker (typically after ~30s of inactivity), so the 5-min TTL is an upper bound within an active session

## All Content Scripts Share the `Per75` Namespace

`shared/constants.js` initializes `window.Per75 = {}`. Each subsequent file attaches to it (`Per75.calculator`, `Per75.dom`, etc.). Script load order in `manifest.json` matters — `constants.js` must be first.

## Maintenance Points

- **`DISPLAY_TO_API` map** (inline in `dom-injector.js:updateTable()`): maps uppercased DOM header labels to API column names. Must be updated when NBA.com adds new column headers or when supporting new stat pages
- **`measureTypeMap`** (in `api-interceptor.js:_parseParamsFromPage()`): maps URL path segments to API `MeasureType` values. Must be updated to support new stat page types (e.g., `four-factors`, `defense`)
- **Hashed CSS class names** (`Crom_table__p1iZz`, `Crom_primary__EajZu`, `DropDown_select__4pIg9`): these are Next.js-generated and may change on nba.com deploys; fallback selectors or option-content checks are the more durable identification strategy
