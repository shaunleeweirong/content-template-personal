# Daily AI News Infographic

Automated pipeline: **research today's AI news → build 3 infographic variants →
render to PNG → commit**. You pick the variant you like each day.

## What's here
- **`INSTRUCTIONS.md`** — the job spec the daily run follows (research scope, the 3
  variant styles, sizing, delivery). Edit this to change the format for every run.
- **`render.mjs`** — renders infographic HTML → 1080×1350 PNG using the preinstalled
  Chromium. Usage: `node daily-ai-news/render.mjs <file-or-dir>`.
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
# Or drive the render step yourself after editing HTML:
npm i -D playwright   # one-time; Chromium is already on disk
node daily-ai-news/render.mjs daily/2026-07-22
```

## Automation (Claude Routine)
A scheduled Routine spins up a fresh Claude session each morning, runs
`INSTRUCTIONS.md`, and pushes the day's folder to the
`claude/ai-news-infographic-daily-4qd7gu` branch. To change the schedule, edit the
Routine; to change the *output*, edit `INSTRUCTIONS.md`. Pick your favorite variant
each day and share the PNG.

> Content is compiled from public AI-news trackers and may include fast-moving or
> unconfirmed items — verify before any high-stakes use.
