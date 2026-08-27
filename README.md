# Ankit Anand — AI-Builder Showcase

Personal showcase site. Story-led portfolio: ex-poker player shipping real AI
products, with six apps as the evidence. Built per
[`PRD_Ankit_Showcase.md`](./PRD_Ankit_Showcase.md) (the governing document).

**Status:** Phase 1–2 scaffold — structure + placeholder content only. Design
polish and real content/assets come in Phase 3–4. All copy and images are
clearly marked `PLACEHOLDER`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · deployable to Vercel.
Fully static — no CMS, auth, or database.

## Working environment (read before giving instructions)

This repo is built entirely in Claude Code cloud sessions — there is no local checkout, no local terminal, and no local dev environment for the user. **Never hand them `cd` / `git clone` / `npm install` / `./script.sh` steps to run on their machine** — anything that must execute (including the "Run it locally" commands below) runs in the agent's own container, or in the deployed app.

- **Egress is allowlisted.** A host can fail with "Host not in allowlist" — that means blocked, not down. Say so and propose another route.
- **No secrets store here** (Anthropic's own docs say not to put API keys in Claude Code cloud env vars). Secrets live in Vercel's env vars — never ask the user to paste one into chat or a local file.
- **Blocked host or needs real credentials?** Build it as a route in the deployed app and hand over a URL to open — not a script to run.
- **Steps the user performs are browser/dashboard steps** — name the site, the menu, the button.

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3000**.

```bash
npm run build   # production build (also runs type-check + lint)
```

## Structure

```
app/
  layout.tsx              # shell: header + footer + metadata
  page.tsx                # home: Hero → Arc → App Grid → How I Build → Contact
  apps/[slug]/page.tsx    # dynamic detail route (renders all 6 via one template)
components/
  AppDetail.tsx           # the ONE shared detail template (all 6 are identical)
  DeviceFrame.tsx         # reusable phone frame for screenshots
  Visual.tsx              # decides framing; single place to swap in real images
  PlaceholderImage.tsx    # labelled placeholder block (solid fill + path)
  AppCard.tsx, StatusTag.tsx, SectionHeading.tsx, Reveal.tsx, ...
data/
  apps.ts                 # the 6 apps (typed) — all app content lives here
  site.ts                 # hero / arc / how-I-build / contact content
public/images/            # drop real screenshots here (see images/README.md)
```

## How to add real content & images

### (a) Swap in real content — edit these files only

- **`data/apps.ts`** — for each of the six apps replace the `PLACEHOLDER`
  strings: `oneLiner`, `theItch`, `features` (exactly 3), `howItWasBuilt`,
  `statusTag`, and each visual's `alt` / `caption`.
- **`data/site.ts`** — `positioning`, `hook`, the `arc` paragraphs, the
  `howIBuild` points, and the `contact` block (email / X / LinkedIn / optional
  Cal.com).

That's it — both pages and all six detail pages re-render from these two files.

### (b) Drop in real images

1. Add image files at the paths already referenced in `data/apps.ts` /
   `data/site.ts` (e.g. `public/images/dayos/hero.png`). See
   [`public/images/README.md`](./public/images/README.md) for the full list.
2. In **`components/Visual.tsx`**, replace the `<PlaceholderImage … />` line
   with next/image:

   ```tsx
   import Image from "next/image";
   // …
   const inner = (
     <Image src={visual.src} alt={visual.alt} fill className="object-cover" />
   );
   ```

   This is the single change that switches the whole site from placeholders to
   real screenshots. (The hero photo in `components/PlaceholderImage` usages on
   the home page / app cards can be swapped the same way.)
3. For the optional screen-recordings, replace the placeholder clip block in
   `components/AppDetail.tsx` with a `<video>` pointing at `app.clipUrl`.

## Design notes (PRD §8)

Own light identity — warm "paper + ink" neutrals with a single restrained clay
accent. Deliberately **not** PartySpark's navy/violet, and **not** a
Liquid-Glass theme. Mobile-first, minimal motion (subtle scroll reveal that
respects `prefers-reduced-motion`).
