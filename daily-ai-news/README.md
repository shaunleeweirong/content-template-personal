# Daily AI News Infographic

Automated pipeline: **research today's AI news → build 3 infographic variants →
render to PNG → audit → open a PR**. You pick the variant you like each day.

## What's here
- **`INSTRUCTIONS.md`** — the job spec the daily run follows (research scope, the 3
  variant styles, sizing, the quality gate, delivery). Edit this to change the format
  for every run.
- **`render.mjs`** — renders infographic HTML → 1080×1350 PNG using the preinstalled
  Chromium. Usage: `node daily-ai-news/render.mjs <file-or-dir>`.
- **`audit.mjs`** — the **measured quality gate**. Loads each rendered variant in the
  browser and prints PASS/FAIL on hard numbers: largest empty vertical band
  (`maxGapPx`, fails > 70), body font size (`minBodyPx`, fails < 15), and overflow.
  Exits non-zero if any variant fails, so the daily loop keeps fixing until it's green.
  Usage: `node daily-ai-news/audit.mjs <file-or-dir>` (thresholds are constants at the
  top of the file).
- **`../daily/<YYYY-MM-DD>/`** — each day's output: `research.md` + `v1/v2/v3` HTML +
  matching PNGs. See `daily/2026-07-22/` for the first sample.

## The 3 variants
| File | Style | Best for |
|---|---|---|
| `v1-dark-brief` | Dark, numbered "daily brief" digest | Scannable, text-forward, premium feel |
| `v2-light-cards` | Light 2×3 card grid with category pills | Clean, social-friendly, easy to skim |
| `v3-editorial-hero` | Navy header + KPIs + hero story + board | "Report" look, matches repo house style |

## Run it manually
```bash
# In a Claude session on this repo, just say:
#   "Run daily-ai-news/INSTRUCTIONS.md for today"
# Or drive render + audit yourself after editing HTML:
npm i -D playwright   # one-time; Chromium is already on disk
node daily-ai-news/render.mjs daily/2026-07-22
node daily-ai-news/audit.mjs  daily/2026-07-22   # must print "AUDIT: PASS"
```

## Automation (Claude Routine)
A scheduled Routine spins up a fresh Claude session each morning at **07:00 SGT**,
runs `INSTRUCTIONS.md` (research → build → render → **audit loop** → vision check),
and **opens a fresh PR** (`ai-news-daily/<date>`) with the three PNGs so you preview
and pick a variant in the PR. To change the schedule, edit the Routine; to change the
*output*, edit `INSTRUCTIONS.md`; to change what counts as "good", edit the thresholds
in `audit.mjs`.

> **Note:** the daily run branches off the default branch, so this pipeline
> (`INSTRUCTIONS.md`, `render.mjs`, `audit.mjs`) must stay on the default branch.

> Content is compiled from public AI-news trackers and may include fast-moving or
> unconfirmed items — verify before any high-stakes use.
