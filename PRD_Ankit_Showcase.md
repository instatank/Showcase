# PRD — Ankit Anand · Personal AI-Builder Showcase

**Status:** Draft v0.1 · Governing document
**Owner:** Ankit Anand
**Purpose of this doc:** Single source of truth for the site. Readable by Ankit; structured so Claude Code can build from it directly.

## 1. What this is

A personal showcase website that establishes Ankit Anand as a credible AI builder. A story-led site where the narrative (professional poker player → non-technical operator shipping real AI products) is the pitch, and six built apps are the evidence.

This is not an app store. Visitors do not use the apps. Every app is demonstrated through screenshots, device-framed mockups, and short screen-recordings. The "app store" reference is an organizing metaphor for layout (card grid → detail page), not a literal clone.

## 2. Goal & audience

- **Primary job of the site:** Personal brand & credibility in AI.
- **10-second visitor takeaway:** "This person thinks clearly and ships fast — and came from an unexpected place."
- **Primary audience:** People in the AI / founder / operator world — potential collaborators, peers, and anyone evaluating Ankit's capability. Secondary: future clients/partners as the commercial chapter develops.

**Success =** a visitor leaves understanding (a) who Ankit is, (b) that he ships real things, and (c) how he thinks — and has an easy way to reach him.

## 3. Positioning / core narrative

The differentiator is the person, not any single app. Most "look at my apps" sites are a wall of cards with no frame. This one leads with a story:

> Ex-professional poker player. No engineering background. Shipped six real AI products in a few months.

The poker background is the credibility bridge — probabilistic thinking, risk under uncertainty, emotional control, pattern recognition — now pointed at building with AI. The apps prove it; the story frames it.

Story text: See Appendix A. Still being refined with Ankit; lead with evidence, keep commercial ambition as a quiet forward-look, not a promise.

## 4. Scope

**In scope**

- Static, content-driven marketing/portfolio site.
- Story/bio sections.
- App grid + six app detail pages (showcase only).
- A "how I build" section (the AI-builder meta-skill).
- Lightweight contact.

**Out of scope (explicitly)**

- No usable/live apps. No auth. No per-app hosting or databases. No app maintenance.
- No blog/CMS in v1 (can be added later).
- No e-commerce, no payments.

This removes the only expensive part of the original idea and makes the whole thing a fast static site.

## 5. Information architecture

Single-page feel for the main narrative, with dedicated detail pages per app.

1. **Hero** — name, photo, one-line positioning, the hook. Restrained.
2. **The arc** — poker → AI operator. The transferable-skills bridge. ~2–3 short paragraphs (Appendix A).
3. **App grid** — six cards (icon, name, one-liner, status tag). App Store-inspired, not a clone.
4. **App detail pages (×6)** — fixed template (Section 6). Each app obeys the same skeleton.
5. **How I build** — the workflow: AI-assisted / vibe-coding, the discipline (PROJECT_BRIEF/CLAUDE.md), the stack. Shows the meta-skill; for an AI-builder brand this is as persuasive as the outputs.
6. **Contact** — one clear, low-pressure action.

## 6. Per-app content template (the skeleton)

Every app detail page uses the SAME six fields, in the same order, so the six stack as one coherent set rather than six different screenshot dumps. Consistency is what reads as "intentional."

| Field | Spec |
| --- | --- |
| One-liner | What it is, plain language, ~10 words |
| The itch | The personal problem that prompted it (1–2 sentences) |
| What it does | Exactly 3 concrete feature bullets |
| How it was built | The AI stack + one interesting build decision (brand-relevant — shows the meta-skill) |
| Visual set | 1 hero shot + 2–4 supporting + optional short clip |
| Status tag | e.g. "Daily driver" / "Shipped" / "In progress" |

First-pass content for all six is in Appendix B — drafted from what I know, for Ankit to correct. Do not treat as final.

## 7. Visual assets — the make-or-break workstream

Because visitors can't touch the apps, the visuals ARE the product. On a real app store a weak screenshot is survivable (you can download and try). Here there is no fallback — the screenshots, device frames, and 15–20s recordings are the entire experience of each app for a stranger. This is treated as its own workstream, not a footnote.

Requirements:

- Consistent device framing across all six apps (same frame, same shadow/treatment).
- Hero shot per app at high resolution.
- Short screen-recordings (15–20s, no audio needed) for the most visually compelling apps — minimum PartySpark and Cadence.
- Uniform caption rhythm under each visual.
- Assets captured at 2x/retina; optimized (WebP/AVIF) for fast load.

Action for Ankit: this is the real work. Component build is ~1–2 days; capturing clean, consistent visuals for six apps is the larger effort. Plan time for it.

## 8. Design direction

- **Aesthetic:** Apple-inspired restraint — generous whitespace, strong typographic hierarchy, calm color, content shown inside device frames. Borrow the structure and discipline, not a skin.
- **Avoid:** literal iOS-26 "Liquid Glass" cloning. It's the current reference but is being copied everywhere and will date fast / read as derivative. A subtle nod is fine; a full glass theme is not.
- **Own identity:** the site gets its OWN restrained visual identity (clean, light, lots of whitespace). It must NOT reuse PartySpark's navy/violet — the showcase shouldn't look like one of the apps it showcases.
- **Motion:** minimal and purposeful (subtle reveal on scroll, smooth transitions to detail pages). No gratuitous 3D/animation.
- **Typography:** one clean sans for UI (system / Inter-class), optionally one accent face for the hero. Decide in design pass.
- **Responsive:** mobile-first; must look excellent on a phone (much of the audience will open it on mobile).

## 9. Tech stack

- **Framework:** Next.js (App Router) + Tailwind CSS.
- **Hosting:** Vercel (existing stack; static-friendly, trivial to update as new apps ship).
- **Content:** app data in a single typed config/data file (array of app objects matching Section 6), so adding a 7th app later = one entry + assets. No CMS in v1.
- **Images:** Next/Image, AVIF/WebP, retina assets.
- **Analytics:** lightweight, privacy-friendly (e.g. Vercel Analytics) — optional v1.

Design principle: lean-first, low-friction. Scope tightly, ship, iterate. (Same discipline as Ankit's other projects.)

## 10. Contact / CTA

- Default: email + X + LinkedIn, plus an optional Cal.com booking link.
- Low-pressure. One obvious primary action ("Get in touch"), socials secondary.
- No newsletter capture in v1.
- Confirm: which links/handles to use (Appendix C, pending).

## 11. Build phases

**Phase 0 — Content & assets (Ankit-led, the real work)**

- Finalize story text (Appendix A).
- Correct/complete the six app write-ups (Appendix B).
- Capture all visual assets to the Section 7 spec.

**Phase 1 — Scaffold (Claude Code)**

- Next.js + Tailwind project on Vercel.
- App data config structure (Section 6 schema).
- Routing: home + 6 detail pages.

**Phase 2 — Build core**

- Hero + arc + how-I-build sections.
- App grid component.
- App detail page template (one template, six data-driven instances).

**Phase 3 — Design polish**

- Visual identity, typography, device framing, motion.
- Responsive QA (phone first).

**Phase 4 — Ship**

- Domain, meta/OG tags, performance pass, deploy.

## 12. Open items / decisions pending

- Domain — own one already, or pick? (suggest: ankitanand-style or a builder-flavored handle)
- Final story text (Appendix A) — refine with Ankit.
- Six app write-ups (Appendix B) — Ankit corrects first-pass.
- Visual assets — capture per Section 7.
- Contact handles (Appendix C).
- Cadence details — not previously discussed; needs full first-pass from Ankit.

## Appendix A — Story text (draft, refine)

> I spent years as a professional poker player — a game of incomplete information, risk management, and edge. When AI started moving fast, I saw another game worth learning, and approached it the same way: study the edge, build real reps, manage the downside. With no engineering background, I've used AI tools to design and ship six working products. They began as tools I built for myself. They're how I learned the craft — and they're the proof it works. The next chapter is turning that into something bigger.

Variants/voice to be tuned. Decide: how much poker detail to include; whether to name the location/personal details.

## Appendix B — The six apps (FIRST PASS — Ankit to correct)

These are drafted from prior context. Treat every line as a placeholder to confirm or rewrite. Where I don't have detail, it's marked.

**1. DayOS — Personal time-management, journaling & productivity system**

- The itch: needed one place to run the day — focus, journaling, wins — instead of scattered tools.
- Does: [daily focus tasks] · [journaling] · [wins/tracking] — confirm 3
- Built with: AI-assisted build; [stack]. Build decision: [one interesting choice]
- Status: Daily driver

**2. PartySpark — Social party game app**

- The itch: [confirm]
- Does: [3 bullets — confirm]
- Built with: [stack]. Has a full visual identity (navy/violet + black/gold variant).
- Status: [confirm] · Gets a screen-recording.

**3. BillBud — Bill & expense management**

- The itch: managing household bills/subscriptions in one tight tool.
- Does: [3 bullets — confirm]
- Built with: [stack]
- Status: [confirm]

**4. Cadence — Personalised workout planner**

- The itch: [needs full first-pass from Ankit]
- Does: [3 bullets]
- Built with: [stack]
- Status: [confirm] · Gets a screen-recording.

**5. MyMealMap — Meal planner app**

- The itch: planning meals around a specific nutrition profile.
- Does: [AI-generated plans] · [profiles] · [confirm 3]
- Built with: AI generation engine + audit layer [confirm]
- Status: [confirm]

**6. TradeGenie — Trading journal & trade management**

- The itch: a low-friction journal to log and review trades.
- Does: [3 bullets — confirm]
- Built with: [stack]; PROJECT_BRIEF-governed, lean-first.
- Status: [confirm]

## Appendix C — Contact (pending)

- Email: [ ]
- X: [ ]
- LinkedIn: [ ]
- Cal.com (optional): [ ]
