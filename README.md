# YLCSS S4 Physics · 純播放溫習動畫

粵語為主。三個自包含靜態播放器，beats、畫面同 TTS 已在各級資料夾；今次只換控制列 chrome（對齊 Ch4 ui-collapse）。

| Level | 課題 | 路徑 | ASSIGNMENT hint |
|-------|------|------|-----------------|
| L1 | 溫度與溫度計 | [`l1/`](l1/) | `Phys-L1-Temp` |
| L2 | 熱、溫度與熱傳遞 | [`l2/`](l2/) | `Phys-L2-Heat` |
| L3 | 比熱容與熱容量 | [`l3/`](l3/) | `Phys-L3-SHC` |

## Purpose / 用途

- **zh-HK**：畀學生喺 Notion／GitHub Pages 嵌入「純播放」溫習動畫。正式網址係 `/l1/`、`/l2/`、`/l3/`。
- **EN**: Self-contained static players for S4 Physics revision. Each level keeps its own beats, scenes, cues, and TTS. Controls: 粵／普／英, speed, VO wait, captions, subtitle size, collapsible dock, fullscreen.

## Notion embed URL placeholders

Deploy this monorepo to GitHub Pages (or any static host), then embed:

```
https://<user>.github.io/<repo>/l1/
https://<user>.github.io/<repo>/l2/
https://<user>.github.io/<repo>/l3/
```

Notion: `/embed` block → paste the level URL. Each folder ships `.htaccess` / `_headers` with `frame-ancestors *` for iframe embedding.

## How beats / TTS are wired

1. `lN/js/beats.js` — beat titles, durations, keywords.
2. `lN/js/scenes.js` — scene graphics.
3. TTS mp3 + VTT per beat under `audio/{yue,cmn,en}/Bxx.mp3` (+ `.vtt`), listed in `audio/manifest.json`.
4. `js/cues.js` (`CH4_CUES` + optional `CH4_AUDIO_DURATIONS`).
5. If mp3 are missing, the player **degrades to silent play** (lang buttons show 無音軌; animation and captions still run).

Global names `CH4_BEATS` / `CH4_CUES` / `CH4_AUDIO_DURATIONS` are kept so `player.js` stays compatible with the Ch4 pack.

## Subtitle size

Dock row **字幕大小**：小／中／大 → CSS `--sub-size` **28 / 34 / 42 px** (default **中**). Test ids: `sub-size-s` | `sub-size-m` | `sub-size-l`.

## Chrome（對齊 Ch4 ui-collapse）

正式路徑 `l1/`、`l2/`、`l3/` 的控制列預設收合，由頂部向下展開、向上收合。全螢幕優先用 Fullscreen API；iOS／沒有 `allow="fullscreen"` 的 iframe 會加上 `.is-fs-fallback` 填滿視窗。全螢幕舞台用 contain：`scale = min(slotW/1280, slotH/720)`，標題到字幕整幅可見。

`localStorage` 以課題分開，不會寫入 Ch4 的鍵，三級之間也不會互相覆蓋：

| Level | 字幕大小 | 控制列 |
|-------|----------|--------|
| L1 | `phys-l1-sub-size` | `phys-l1-dock` |
| L2 | `phys-l2-sub-size` | `phys-l2-dock` |
| L3 | `phys-l3-sub-size` | `phys-l3-dock` |

## Local preview

```bash
cd /workspace/ylcss-phys-revision-players/l1 && python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

## Controls present

展開／收合控制 · 全螢幕 · Play / Pause / Prev / Next / Replay · scrub · clock · beat id · 粵／普／英 · 字幕開關 · **字幕大小 小／中／大** · speed 0.5–2x (+ presets) · 旁白停頓 (VO wait) · status line. 純播放，沒有測驗。
