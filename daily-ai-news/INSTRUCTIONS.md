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
   a category tag, one-line detail, source + date), a benchmark-leaders block, an
   "also notable" list, and a Sources list. This is the single source of truth the
   infographics draw from — do not invent facts not in it.

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
   Keep content dense enough to fill the full canvas height (no big empty band).

4. **Render.** `node daily-ai-news/render.mjs daily/<YYYY-MM-DD>` → writes a PNG next
   to each HTML at 1080×1350 (uses the preinstalled Chromium; installs nothing).

5. **Self-check.** Read each PNG back. Confirm: fills the canvas, no clipped text,
   category colors consistent, numbers match `research.md`, disclaimer present.

6. **Deliver.** Commit everything under `daily/<YYYY-MM-DD>/` and push to the branch
   `claude/ai-news-infographic-daily-4qd7gu`. Commit message:
   `Daily AI news infographics — <YYYY-MM-DD>`. Do **not** open a PR unless asked.

## Style guardrails
- One type family (system sans), one palette per variant, consistent accents.
- Hook headline < 10 words; highlight one keyword.
- Bold the concrete noun/number in each line; keep body copy ≤ 2 lines.
- Match the quality bar of `infographic-references/builds/google-bull-vs-bear.html`.
- See `infographic-references/README.md` for the layout catalog + design principles.
