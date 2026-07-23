# Daily AI News Infographic — Job Spec

This is the recipe the daily automation follows. It's written to be run by a fresh
Claude session (via a Claude Routine) or by you manually. Follow it top to bottom.

## Goal
Research the last ~24–48h of AI news and produce **3 infographic variants** (distinct
styles) so the reader can pick one. Output as self-contained HTML + rendered PNG,
sized **1080 × 1350** (portrait, 4:5 — good for LinkedIn/Instagram/X).

## Scope (what counts as news)
Rank by significance across these buckets, then keep the **top 6**:
1. **Model** — frontier launches, version bumps, benchmark shifts (Claude, GPT,
   Gemini, Llama, Grok, DeepSeek, Qwen, Kimi, Mistral, etc.)
2. **Product** — new AI products, agent tooling, API/pricing changes, big features.
3. **Business** — funding, valuations, M&A, partnerships, major infra spend.
4. **Policy / Safety** — regulation, lawsuits, safety incidents, gov action.

Prefer concrete specifics (model names, benchmark %, $ amounts, dates) over vibes.
Always keep a **benchmark leaders** strip (coding / science / computer-use).

## Steps

1. **Research.** Run several `WebSearch` queries for the current date, e.g.:
   - `AI model release <Month> <Year>`
   - `AI news today <today's date> biggest stories`
   - `AI funding acquisition <Month> <Year> billion`
   - `frontier LLM benchmark <Month> <Year>`
   Fetch 1–2 roundup pages with `WebFetch` to confirm specifics. Cross-check any
   number that appears in only one source; mark unconfirmed items **"Unconfirmed."**

2. **Digest.** Write `daily/<YYYY-MM-DD>/research.md`: top 6 ranked stories (each with
   a category tag, one-line detail, a one-line **"why it matters"**, and source + date),
   a benchmark-leaders block, an "also notable" list, and a Sources list. This is the
   single source of truth the infographics draw from — do not invent facts not in it.

3. **Build 3 variants** into `daily/<YYYY-MM-DD>/`, each a self-contained HTML file
   (inline CSS, no external assets, no network), `.canvas` = `1080×1350`:
   - `v1-dark-brief.html` — dark, numbered "daily brief" digest list.
   - `v2-light-cards.html` — light 2×3 card grid with colored category pills.
   - `v3-editorial-hero.html` — navy header + KPI row + "story of the day" hero +
     benchmark board + "also today" list (house style, matches the repo's
     `infographic-references/builds/google-bull-vs-bear.html`).
   Category color map: Model = green, Product = indigo, Business = blue,
   Policy = amber, Safety = red. Always include the footer disclaimer:
   *"Compiled from AI-news trackers · verify before high-stakes use."*
   **Fill the canvas with content, not flex gaps.** Body copy must be **≥16px**
   (headers larger). Use these density levers so nothing looks sparse:
   - Give every story a **"Why it matters"** line (from the digest) — v2 pins it to
     each card's bottom; v3 puts it under the hero.
   - v2 & v3 carry a **4-KPI strip** in the header; v3's hero has a **3-chip** row.
   - v3's "also today" list carries **~10 items across 5 rows** to fill the lower third.
   Never lean on `justify-content: space-between` to absorb a big slug of empty space.

4. **Render + audit.** `npm i -D playwright` (once), then:
   - `node daily-ai-news/render.mjs daily/<YYYY-MM-DD>` → PNG per HTML at 1080×1350.
     The renderer points Playwright at the preinstalled Chromium; do NOT run
     `playwright install`.
   - `node daily-ai-news/audit.mjs daily/<YYYY-MM-DD>` → measures each variant and
     prints PASS/FAIL with `maxGapPx` / `minBodyPx` / `overflow`.

5. **Quality gate — iterate until it PASSES (do not stop early).** This is a loop:
   a. **Measured pass (automated).** Run `audit.mjs`. It fails on any of: largest empty
      vertical band **> 70px**, body font **< 15px**, or content **overflowing** the
      canvas. If it fails, the report tells you the gap size and its y-position — edit
      the HTML (add density per step 3, or tighten spacing), **re-render, re-audit**.
      Repeat until `AUDIT: PASS` for all three variants.
   b. **Vision pass (subjective).** Only once the audit is green, read each PNG back and
      confirm: key noun/number **bold**; body ≤ 2 lines; no orphan words; numbers match
      `research.md`; "Unconfirmed" labelled; one palette; category colors consistent
      (Model = green, Product = indigo, Business = blue, Policy = amber, Safety = red);
      footer disclaimer present. Fix + return to (a) if a change was needed.
   Only proceed to deliver once **both** passes are clean for every variant.

6. **Deliver as a PR (one per day).** `git fetch` the default branch; create a new
   branch `ai-news-daily/<YYYY-MM-DD>` off it. Commit everything under
   `daily/<YYYY-MM-DD>/` (message `Daily AI news infographics — <YYYY-MM-DD>`), push,
   and **open a PR** to the default branch with the three PNGs in the body so the
   reader previews and picks a variant. (This pipeline — `INSTRUCTIONS.md`,
   `render.mjs`, `audit.mjs` — must live on the default branch for the daily run to
   find it.)

## Style guardrails
- One type family (system sans), one palette per variant, consistent accents.
- Hook headline < 10 words; highlight one keyword.
- Bold the concrete noun/number in each line; keep body copy ≤ 2 lines.
- Match the quality bar of `infographic-references/builds/google-bull-vs-bear.html`.
- See `infographic-references/README.md` for the layout catalog + design principles.
