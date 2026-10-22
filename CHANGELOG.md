# Changelog

## 0.3.0 — 2026-10-22

- Replaced the shared title-card scaffold in `l1/js/scenes.js`, `l2/js/scenes.js`, and `l3/js/scenes.js` with one scene per beat (L1 15, L2 14, L3 14).
- Audio, cues, beat timings, and the collapsible fullscreen chrome are unchanged.

## 0.2.0 — 2026-10-22

- Formal `l1/`、`l2/`、`l3/` use the Ch4 ui-collapse chrome: dock collapsed by default, opens downward from the top bar, fullscreen plus `.is-fs-fallback`.
- Fullscreen stage is contain-scaled: `scale = min(slotW/1280, slotH/720)` so the title through the subtitle stay visible.
- Per-level `localStorage` keys `phys-l1-*`, `phys-l2-*`, `phys-l3-*` (subtitle size and dock). Beats, scenes, cues, and TTS audio are unchanged.

## 0.1.0 — 2026-10-22

- Initial monorepo scaffolds: `l1/` 溫度與溫度計, `l2/` 熱、溫度與熱傳遞, `l3/` 比熱容與熱容量.
- Copied Ch4 ICT pure-play shell (HTML/CSS/JS/GSAP); **no** multi-MB audio.
- Stub `audio/manifest.json` (`[]`); empty `audio/{yue,cmn,en}/` for future TTS.
- 5 placeholder beats + title-card scenes + short cue stubs per level.
- Subtitle size UI: 小／中／大 (`--sub-size` 28/34/42px, default 中); enlarged `.sub-bar`; raised `.scene` bottom clearance.
- Notion-embed headers (`.htaccess` / `_headers`).
