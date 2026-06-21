# Showcase build — handover for continuing with the remaining apps

Living notes so a fresh agent conversation can continue exactly on track.
Last updated after DayOS + PartySpark were completed.

## Where things stand

- **Repo:** `instatank/Showcase` · **work branch:** `claude/upbeat-hamilton-0lglsp`
  (develop, commit, and push here; do NOT open a PR unless asked).
- The scaffold is a Next.js 15 + Tailwind site. All app content is data-driven
  from `data/apps.ts`; every detail page renders through one shared template
  (`components/AppDetail.tsx`).

### Apps (order = grid order = column for hover alignment)

| # | slug | name | done? | hover `align` (i % 3) |
|---|------|------|-------|------------------------|
| 0 | `dayos` | DayOS | ✅ real content + 4 screenshots | left |
| 1 | `partyspark` | PartySpark | ✅ real content + 6 screenshots | center |
| 2 | `billbud` | BillBud | ⛔ placeholder | right |
| 3 | `cadence` | Cadence | ⛔ placeholder | left |
| 4 | `mymealmap` | MyMealMap | ⛔ placeholder | center |
| 5 | `tradegenie` | TradeGenie | ⛔ placeholder | right |

**Remaining to build:** BillBud, Cadence, MyMealMap, TradeGenie.

### Open follow-ups (not blocking)
- DayOS and PartySpark **one-liner + itch** are still `⚠️ DRAFT PLACEHOLDER`
  (marked with code comments) — awaiting Ankit's own wording.
- PartySpark **live "Try it" URL** decision is pending. It's currently
  `experienceMode: "screenshots-demo"`. Do NOT invent/hardcode a URL.

## Hard-won environment facts (read these — they cost time to learn)

1. **Chat-attached images do NOT reach the container filesystem.** Only file
   attachments that the user commits to the repo are accessible. The way that
   works: the user commits screenshots to the work branch (loose PNGs, or a ZIP
   per theme). The agent then `git pull`s, unzips, picks, and places them.
   - PartySpark arrived as `partysparkscreenshotsdark.zip` /
     `partysparkscreenshotslight.zip` at the repo root → unzipped to
     `showcase-dark/` and `showcase-light/`, chosen shots copied into
     `public/screenshots/partyspark/`, then the zips were `git rm`'d.
2. **Other repos are NOT reachable from this session.** The GitHub MCP and the
   git proxy are scoped to `instatank/showcase` only. You cannot pull from e.g.
   `instatank/party-spark`. `add_repo`/`list_repos` tools were not available.
   → Screenshots must be delivered into THIS repo/branch.
3. **`localhost:3000` is only reachable inside the container.** The user views
   the site via **Vercel** (auto-deploys from the branch). Never hand the user a
   localhost URL as if they can open it; tell them to refresh/redeploy Vercel.
4. **Verifying visually:** run `npm run dev` (background) and screenshot with the
   bundled Chromium:
   `/opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-prefers-reduced-motion --window-size=1200,3000 --virtual-time-budget=14000 --run-all-compositor-stages-before-draw --default-background-color=FFFFFFFF --screenshot=/tmp/x.png "http://localhost:3000/apps/<slug>"`
   then `Read` the PNG. The `Reveal` fade can still make captures look washed
   out — it's a capture artifact, not a real bug. The dev server sometimes dies
   between turns; just relaunch with `(setsid npm run dev > /tmp/dev.log 2>&1 &)`.
5. No Playwright, no ImageMagick installed. Use the Chromium binary above; to
   preview a hover/expanded state, temporarily force the open classes, screenshot,
   then restore the file.

## Data model (`data/apps.ts`)

Per-app `App` fields to fill (see DayOS/PartySpark as worked examples):
- `slug`, `name`
- `oneLiner` — mark as draft placeholder with a code comment
- `theItch` — mark as draft placeholder with a code comment
- `features` — exactly 3 bullets
- `howItWasBuilt` — stack **+** the build-decision text. Put a `\n\n` between the
  stack paragraph and the build-decision paragraph; `AppDetail` splits on `\n\n`
  into separate `<p>`s.
- `statusTag` — one of the `StatusTag` union. Add a new union member (and a color
  in `components/StatusTag.tsx`) if the content needs one (we added
  `"Shipped · actively maintained"`).
- `experienceMode` — `"screenshots"` | `"screenshots-demo"` | `"live-demo"`.
  `live-demo` needs `liveUrl` and renders an "Open live demo" button; the others
  render a quiet badge ("Screenshots only" / "Screenshots / demo").
- `heroImage` + `supportingImages[]`, each a `Visual`:
  `{ src, alt, caption, aspect: "phone", real? }`.
  - `src` = `/screenshots/<slug>/<file>.png`.
  - Set **`real: true`** once the PNG exists at `src` → renders the real image
    via `next/image`. Without `real`, a labelled placeholder renders (graceful;
    used when a shot is missing).
  - Captions should match the ACTUAL chosen screen. If the content file's caption
    describes UI that isn't in the shot, rewrite it in the same voice (we did this
    for PartySpark's Roast Me and Taboo).

## How the components fit (don't re-derive)

- `components/AppCard.tsx` — homepage grid cell. When `heroImage.real`, it shows
  a row of 3 mini phones (hero + first 2 supporting) and, on hover/focus, a
  **fan-out preview**: the 3 shots zoom into a large frosted-glass panel that
  floats above neighbours. **Column-aware**: takes `align="left|center|right"`;
  `app/page.tsx` passes it from `i % 3` (left col spreads right, right col
  spreads left, center symmetric). Placeholder apps show the labelled box.
- `components/Visual.tsx` — the single place that renders a screenshot. Phone
  shots get wrapped in `DeviceFrame`; `real` → `next/image`, else
  `PlaceholderImage`.
- `components/DeviceFrame.tsx` — shared phone frame, `max-w-[300px]` (detail page
  only). (We tried 225px to shrink and reverted — keep 300px.)
- `components/ZoomableVisual.tsx` — client wrapper used on the detail page only.
  Clicking a **real** screenshot opens a full-screen lightbox (Esc / backdrop /
  ✕ to close). Placeholder visuals stay static.
- `components/AppDetail.tsx` — shared template: header (name, status, one-liner,
  experience badge/button), itch, 3 features, "How it was built" (splits on
  `\n\n`), then the "Visual set" grid (`lg:grid-cols-3`, so 6 supporting = a
  clean 2×3). Hero + each supporting visual are wrapped in `ZoomableVisual`.
- `components/Reveal.tsx` — scroll-in fade. Uses `transform: none` once shown
  (NOT `translateY(0)`) so it doesn't form a stacking context — required so the
  AppCard hover panel can rise above sibling cards. Don't reintroduce a transform.

## Per-app workflow (repeat for each remaining app)

1. Read the app's `*_Showcase_Content.md` (user attaches it / commits it).
2. Get its screenshots into the repo (user commits PNGs or a ZIP to the branch);
   `git pull`, unzip if needed, inspect, pick a set, **mix light/dark**, copy into
   `public/screenshots/<slug>/` with clear names. Remove any source ZIPs after.
3. Update the app's entry in `data/apps.ts` (all fields above), set `real: true`
   on the visuals that now exist, captions matching the real screens.
4. Keep every OTHER app as a placeholder.
5. `npx tsc --noEmit`, run dev, screenshot the detail page (and the homepage card),
   `Read` to verify.
6. Commit + push to `claude/upbeat-hamilton-0lglsp` (no PR unless asked).
   Commit trailers used in this project:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
   `Claude-Session: <session url>`
   Do not put any model identifier in commit messages/code/artifacts.

## Conventions / preferences observed

- One app at a time ("single-app build") so the page can be reviewed with real
  content before moving on.
- Mix light and dark screenshots across a set; alternate themes across grid rows.
- Avoid sensitive screens (PIN/auth, private personal data, explicit decks).
- The showcase deliberately does NOT reuse each app's own brand identity (PRD §8).
- Be honest about what's verified vs. not; the captures can look faded (artifact).
