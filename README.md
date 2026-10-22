# YLCSS S4 Physics · 純播放溫習動畫（占位殼）

粵語為主。三個自包含靜態播放器，從 Ch4 ICT 純播放器骨架複製而來，**尚未填入真實考點內容／TTS**。

| Level | 課題 | 路徑 | ASSIGNMENT hint |
|-------|------|------|-----------------|
| L1 | 溫度與溫度計 | [`l1/`](l1/) | `Phys-L1-Temp` |
| L2 | 熱、溫度與熱傳遞 | [`l2/`](l2/) | `Phys-L2-Heat` |
| L3 | 比熱容與熱容量 | [`l3/`](l3/) | `Phys-L3-SHC` |

## Purpose / 用途

- **zh-HK**：畀學生喺 Notion／GitHub Pages 嵌入「純播放」溫習動畫；而家係空殼（title cards + 占位字幕），方便之後補 beats、畫面同旁白。
- **EN**: Self-contained static player shells for S4 Physics revision. Dock controls (粵／普／英, speed, VO wait, captions, **subtitle size**) already work; content and TTS are placeholders.

## Notion embed URL placeholders

Deploy this monorepo to GitHub Pages (or any static host), then embed:

```
https://<user>.github.io/<repo>/l1/
https://<user>.github.io/<repo>/l2/
https://<user>.github.io/<repo>/l3/
```

Notion: `/embed` block → paste the level URL. Each folder ships `.htaccess` / `_headers` with `frame-ancestors *` for iframe embedding.

## How beats / TTS will be filled later

1. Edit `lN/js/beats.js` — replace the 5 placeholder beats (title, duration_s, keyword, visual notes).
2. Build real scenes in `lN/js/scenes.js` (today every beat is a generic title card).
3. Generate TTS mp3 + VTT per beat under `audio/{yue,cmn,en}/Bxx.mp3` (+ `.vtt`), then rewrite `audio/manifest.json` (array of `{lang, beat, path, vtt, duration_s, ...}`).
4. Refresh `js/cues.js` (`CH4_CUES` + optional `CH4_AUDIO_DURATIONS`) from the VTT/manifest.
5. Until mp3 exist, the player **degrades to silent play** (lang buttons show 無音軌; animation + placeholder captions still run).

Global names `CH4_BEATS` / `CH4_CUES` / `CH4_AUDIO_DURATIONS` are kept so `player.js` stays compatible with the Ch4 pack.

## Subtitle size

Dock row **字幕大小**：小／中／大 → CSS `--sub-size` **28 / 34 / 42 px** (default **中**). Persisted in `localStorage` key `phys-player-sub-size`. Test ids: `sub-size-s` | `sub-size-m` | `sub-size-l`.

## Local preview

```bash
cd /workspace/ylcss-phys-revision-players/l1 && python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

## Controls present

Play / Pause / Prev / Next / Replay · scrub · clock · beat id · 粵／普／英 · 字幕開關 · **字幕大小 小／中／大** · speed 0.5–2x (+ presets) · 旁白停頓 (VO wait) · status line.
