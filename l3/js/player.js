var FADE = 0.4;
var END_HOLD = 0.45;
var LANGS = [
  { id: "yue", label: "粵語" },
  { id: "cmn", label: "普通話" },
  { id: "en", label: "English" }
];

var master = null;
var layout = [];
var speed = 1;
var voWait = 0.5;
var voiceLang = null;
var subsOn = true;
var SUB_SIZE_KEY = "phys-player-sub-size";
var SUB_SIZES = { s: "28px", m: "34px", l: "42px" };
var subSize = "m";
var cueBook = { yue: {}, cmn: {}, en: {} };
var scriptCache = {};
var hudBeat = null;
var scrubbing = false;
var activeAudio = null;
var pool = {};
var audioMeta = {
  yue: { ready: false, durations: {}, missing: [] },
  cmn: { ready: false, durations: {}, missing: [] },
  en: { ready: false, durations: {}, missing: [] }
};

var stage;
var sceneStack;
var badge;
var titleEl;
var keywordEl;
var subtitleEl;
var dwellChip;
var scrub;
var clock;
var beatIdEl;
var playBtn;
var pauseBtn;
var statusEl;
var speedSlider;
var speedReadout;
var waitSlider;
var waitReadout;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function fmt(sec) {
  sec = Math.max(0, sec || 0);
  var m = Math.floor(sec / 60);
  var s = Math.floor(sec % 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function formatSpeed(n) {
  var rounded = Math.round(n * 100) / 100;
  return String(rounded) + "x";
}

function audioUrl(lang, id) {
  return "audio/" + lang + "/" + id + ".mp3";
}

function scriptFile(lang) {
  if (lang === "yue") return "script_yue.md";
  if (lang === "cmn") return "script_cmn.md";
  return "script_en.md";
}

function parseTimestamp(raw) {
  var s = String(raw).trim().replace(",", ".");
  var parts = s.split(":");
  if (parts.length === 3) return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
  if (parts.length === 2) return Number(parts[0]) * 60 + Number(parts[1]);
  return Number(s);
}

function parseCues(text) {
  var lines = String(text).replace(/^\uFEFF/, "").replace(/\r/g, "").split("\n");
  var cues = [];
  var i = 0;
  while (i < lines.length) {
    var arrow = lines[i].indexOf("-->");
    if (arrow === -1) {
      i += 1;
      continue;
    }
    var start = parseTimestamp(lines[i].slice(0, arrow));
    var endToken = lines[i].slice(arrow + 3).trim().split(/\s+/)[0];
    var end = parseTimestamp(endToken);
    i += 1;
    var buf = [];
    while (i < lines.length && lines[i].trim() !== "") {
      buf.push(lines[i].trim());
      i += 1;
    }
    if (buf.length && isFinite(start) && isFinite(end)) {
      cues.push({ start: start, end: end, text: buf.join("\n") });
    }
  }
  return cues;
}

function parseScript(md) {
  var map = {};
  var current = null;
  String(md).replace(/\r/g, "").split("\n").forEach(function (line) {
    var match = line.match(/^##\s+(B\d+)/);
    if (match) {
      current = match[1];
      map[current] = [];
      return;
    }
    if (!current) return;
    var text = line.trim();
    if (!text || text.charAt(0) === "#" || text.charAt(0) === ">") return;
    map[current].push(text);
  });
  return map;
}

function subtitleText(beat, lang, local) {
  var cues = (cueBook[lang] && cueBook[lang][beat.id]) || [];
  if (!cues.length) return "";
  var t = Math.max(0, local);
  var i;
  for (i = 0; i < cues.length; i++) {
    if (t >= cues[i].start && t < cues[i].end) return cues[i].text;
  }
  var last = cues[cues.length - 1];
  if (t >= last.start) return last.text;
  return cues[0].text;
}

function seedPack() {
  var cues = window.CH4_CUES || {};
  var durs = window.CH4_AUDIO_DURATIONS || {};
  LANGS.forEach(function (lang) {
    var map = durs[lang.id] || {};
    var missing = [];
    var durations = {};
    CH4_BEATS.forEach(function (beat) {
      var duration = Number(map[beat.id]);
      if (duration > 0) durations[beat.id] = duration;
      else missing.push(beat.id);
      var list = (cues[lang.id] && cues[lang.id][beat.id]) || [];
      cueBook[lang.id][beat.id] = list.slice();
    });
    audioMeta[lang.id] = { ready: missing.length === 0, durations: durations, missing: missing };
    if (audioMeta[lang.id].ready) buildPool(lang.id);
  });
  voiceLang = null;
  LANGS.forEach(function (lang) {
    if (!voiceLang && audioMeta[lang.id].ready) voiceLang = lang.id;
  });
}

function contentDuration(beat) {
  var voiced = 0;
  if (voiceLang && audioMeta[voiceLang] && audioMeta[voiceLang].durations[beat.id]) {
    voiced = audioMeta[voiceLang].durations[beat.id];
  }
  return Math.max(beat.duration_s, voiced || 0);
}

function computeLayout() {
  var items = [];
  var cursor = 0;
  CH4_BEATS.forEach(function (beat, index) {
    var content = contentDuration(beat);
    var gap = index < CH4_BEATS.length - 1 ? voWait : END_HOLD;
    items.push({
      beat: beat,
      index: index,
      start: cursor,
      content: content,
      gap: gap,
      end: cursor + content + gap
    });
    cursor += content + gap;
  });
  return items;
}

function itemAt(t) {
  var found = layout[0];
  for (var i = 0; i < layout.length; i++) {
    if (t + 0.0001 >= layout[i].start) found = layout[i];
  }
  return found;
}

function captureAnchor() {
  if (!master || !layout.length) return { id: "B01", local: 0, playing: false };
  var t = master.time();
  var item = itemAt(t);
  return { id: item.beat.id, local: t - item.start, playing: master.isActive() };
}

function stopAudio() {
  if (activeAudio) activeAudio.pause();
  activeAudio = null;
  Object.keys(pool).forEach(function (lang) {
    Object.keys(pool[lang]).forEach(function (id) {
      pool[lang][id].pause();
    });
  });
}

function buildMaster() {
  layout = computeLayout();
  mountScenes(sceneStack);
  hudBeat = null;
  var tl = gsap.timeline({ paused: true });
  layout.forEach(function (item, i) {
    var scene = document.getElementById("scene-" + item.beat.id);
    tl.set(scene, { zIndex: i + 1 }, item.start);
    if (i === 0) {
      tl.set(scene, { autoAlpha: 1 }, 0);
    } else {
      tl.fromTo(
        scene,
        { autoAlpha: 0, immediateRender: false },
        { autoAlpha: 1, duration: FADE, ease: "power1.inOut" },
        item.start
      );
    }
    addSceneTweens(tl, item.beat, scene, item.start);
    if (i < layout.length - 1) {
      tl.to(scene, { autoAlpha: 0, duration: FADE, ease: "power1.inOut" }, layout[i + 1].start);
    } else {
      tl.to(scene, { autoAlpha: 0, duration: 0.4, ease: "power1.in" }, Math.max(item.start + 0.2, item.end - 0.4));
    }
  });
  tl.set({}, {}, layout[layout.length - 1].end);
  tl.eventCallback("onUpdate", onTick);
  tl.eventCallback("onComplete", onComplete);
  return tl;
}

function rebuild(anchor) {
  var next = anchor || captureAnchor();
  stopAudio();
  if (master) {
    master.kill();
    master = null;
  }
  master = buildMaster();
  master.timeScale(speed);
  var item = layout[0];
  for (var i = 0; i < layout.length; i++) {
    if (layout[i].beat.id === next.id) item = layout[i];
  }
  var span = Math.max(0, item.end - item.start - 0.02);
  var local = clamp(next.local || 0, 0, span);
  master.pause(item.start + local);
  if (next.playing) master.play();
  onTick();
}

function renderHud() {
  if (!master || !layout.length) return;
  var t = master.time();
  var item = itemAt(t);
  var local = t - item.start;
  if (hudBeat !== item.beat.id) {
    hudBeat = item.beat.id;
    badge.textContent = String(item.index + 1).padStart(2, "0");
    titleEl.textContent = item.beat.title;
    keywordEl.textContent = item.beat.keyword;
    gsap.fromTo(keywordEl, { scaleX: 0 }, { scaleX: 1, duration: 0.28, ease: "power2.out", overwrite: "auto" });
    gsap.fromTo(badge, { scale: 0.84 }, { scale: 1, duration: 0.28, ease: "back.out(1.7)", overwrite: "auto" });
  }
  var lang = voiceLang || "yue";
  subtitleEl.textContent = subtitleText(item.beat, lang, local);
  var dur = master.duration() || 1;
  if (!scrubbing) scrub.value = String(Math.round((t / dur) * 1000));
  clock.textContent = fmt(t) + " / " + fmt(dur);
  beatIdEl.textContent = item.beat.id + " · " + (item.index + 1) + "/" + layout.length;
  var showDwell = item.index < layout.length - 1 && local >= item.content - 0.02;
  dwellChip.hidden = !showDwell;
  if (showDwell) dwellChip.textContent = "停頓 " + voWait.toFixed(1) + " 秒";
  var playing = !!(master.isActive() && t < master.duration() - 0.02);
  playBtn.disabled = playing;
  pauseBtn.disabled = !playing;
  playBtn.classList.toggle("primary", !playing);
  pauseBtn.classList.toggle("primary", playing);
}

function parkTime(audio, seconds) {
  if (audio.seeking) return;
  if (Math.abs(audio.currentTime - seconds) <= 0.28) {
    audio.__seekTo = null;
    return;
  }
  if (audio.__seekTo != null && Math.abs(audio.__seekTo - seconds) < 0.35) return;
  audio.__seekTo = seconds;
  try { audio.currentTime = seconds; } catch (err) { audio.__seekTo = null; }
}

function syncAudio() {
  if (!master) return;
  var t = master.time();
  var item = itemAt(t);
  var local = t - item.start;
  var meta = voiceLang ? audioMeta[voiceLang] : null;
  var clip = meta && meta.durations[item.beat.id] ? meta.durations[item.beat.id] : 0;
  var playing = !!(master.isActive() && t < master.duration() - 0.02);
  var inVo = !!(meta && meta.ready && clip && local >= 0 && local < Math.min(clip, item.content) - 0.04);
  var audio = voiceLang && pool[voiceLang] ? pool[voiceLang][item.beat.id] : null;
  Object.keys(pool).forEach(function (lang) {
    Object.keys(pool[lang]).forEach(function (id) {
      var other = pool[lang][id];
      if (other !== audio) other.pause();
    });
  });
  if (!audio || !clip) {
    if (activeAudio) activeAudio.pause();
    activeAudio = null;
    return;
  }
  if (activeAudio && activeAudio !== audio) activeAudio.pause();
  activeAudio = audio;
  var parked = Math.min(Math.max(0, local), Math.max(0, clip - 0.05));
  if (!inVo) {
    audio.pause();
    if (local >= clip) parkTime(audio, Math.max(0, clip - 0.05));
    else parkTime(audio, parked);
    return;
  }
  var dest = Math.min(local, Math.max(0, clip - 0.05));
  audio.playbackRate = speed;
  if (audio.seeking) return;
  if (Math.abs(audio.currentTime - dest) > 0.28) {
    parkTime(audio, dest);
    return;
  }
  audio.__seekTo = null;
  if (!playing) {
    audio.pause();
    return;
  }
  if (audio.paused) {
    if (audio.__arm) return;
    audio.__arm = true;
    var pending = audio.play();
    if (pending && pending.then) {
      pending.then(function () { audio.__arm = false; }, function () {});
    } else {
      audio.__arm = false;
    }
  }
}

function clearAudioArms() {
  Object.keys(pool).forEach(function (lang) {
    Object.keys(pool[lang]).forEach(function (beatId) {
      pool[lang][beatId].__arm = false;
    });
  });
}

function onTick() {
  renderHud();
  syncAudio();
}

function onComplete() {
  if (activeAudio) activeAudio.pause();
  renderHud();
}

function play() {
  if (!master) return;
  if (master.time() >= master.duration() - 0.05) master.time(0);
  master.timeScale(speed);
  clearAudioArms();
  master.play();
  onTick();
}

function pause() {
  if (!master) return;
  master.pause();
  if (activeAudio) activeAudio.pause();
  renderHud();
}

function seekBeat(index) {
  if (!master) return;
  index = clamp(index, 0, layout.length - 1);
  var was = master.isActive();
  master.time(layout[index].start + Math.min(FADE, layout[index].content * 0.5));
  if (!was) master.pause();
  onTick();
}

function prev() {
  var item = itemAt(master.time());
  var local = master.time() - item.start;
  seekBeat(local > 0.8 ? item.index : item.index - 1);
}

function replay() {
  if (!master) return;
  master.pause(0);
  play();
}

function updateSpeedPresets() {
  document.querySelectorAll("[data-speed]").forEach(function (btn) {
    btn.classList.toggle("is-on", Math.abs(Number(btn.dataset.speed) - speed) < 0.011);
  });
}

function updateWaitPresets() {
  document.querySelectorAll("[data-wait]").forEach(function (btn) {
    btn.classList.toggle("is-on", Math.abs(Number(btn.dataset.wait) - voWait) < 0.011);
  });
}

function setSpeed(value) {
  speed = clamp(Number(value), 0.5, 2);
  speedSlider.value = String(speed);
  speedReadout.textContent = formatSpeed(speed);
  if (master) master.timeScale(speed);
  if (activeAudio) activeAudio.playbackRate = speed;
  updateSpeedPresets();
}

function setVoWait(seconds, anchor) {
  voWait = clamp(Number(seconds), 0, 3);
  waitSlider.value = String(voWait);
  waitReadout.textContent = voWait.toFixed(1) + " 秒";
  updateWaitPresets();
  rebuild(anchor || captureAnchor());
}

function updateVoiceButtons() {
  LANGS.forEach(function (lang) {
    var btn = document.querySelector('[data-lang="' + lang.id + '"]');
    var ready = !!(audioMeta[lang.id] && audioMeta[lang.id].ready);
    btn.disabled = !ready;
    btn.classList.toggle("is-on", voiceLang === lang.id);
    btn.setAttribute("aria-pressed", voiceLang === lang.id ? "true" : "false");
    btn.querySelector(".track-state").textContent = ready ? "已就緒" : "無音軌";
  });
}

function writeStatus() {
  var parts = [];
  var any = false;
  LANGS.forEach(function (lang) {
    var meta = audioMeta[lang.id];
    if (meta.ready) {
      any = true;
      parts.push(lang.label + "已就緒");
    } else if (meta.missing.length && meta.missing.length < CH4_BEATS.length) {
      parts.push(lang.label + "未齊（缺 " + meta.missing.slice(0, 4).join("、") + "）");
    }
  });
  if (!any) {
    statusEl.textContent = "未找到 mp3。三個聲線按鈕已停用，動畫會靜音播放。字幕仍跟粵語字幕稿。";
    return;
  }
  var tail = voiceLang ? "正在使用" + ({ yue: "粵語", cmn: "普通話", en: "English" })[voiceLang] + "旁白同字幕。" : "揀一個已就緒聲線先會出聲。";
  statusEl.textContent = parts.join(" · ") + "。" + tail;
}

function setVoice(lang) {
  if (!audioMeta[lang] || !audioMeta[lang].ready) return;
  if (voiceLang === lang) return;
  voiceLang = lang;
  updateVoiceButtons();
  writeStatus();
  rebuild(captureAnchor());
}

function buildPool(lang) {
  pool[lang] = {};
  CH4_BEATS.forEach(function (beat) {
    var audio = new Audio(audioUrl(lang, beat.id));
    audio.preload = "auto";
    pool[lang][beat.id] = audio;
  });
}

function durationsChanged(lang, next) {
  var prev = audioMeta[lang].durations;
  var keys = Object.keys(next);
  if (keys.length !== Object.keys(prev).length) return true;
  var i;
  for (i = 0; i < keys.length; i++) {
    if (Math.abs((prev[keys[i]] || 0) - next[keys[i]]) > 0.05) return true;
  }
  return false;
}

function loadScriptFallback(lang, beatId) {
  var existing = cueBook[lang] && cueBook[lang][beatId];
  if (existing && existing.length) return Promise.resolve();
  var load = scriptCache[lang]
    ? Promise.resolve(scriptCache[lang])
    : fetch(scriptFile(lang)).then(function (res) {
      if (!res.ok) throw new Error("script");
      return res.text();
    }).then(function (text) {
      scriptCache[lang] = parseScript(text);
      return scriptCache[lang];
    });
  return load.then(function (map) {
    var lines = map[beatId] || [];
    if (!lines.length) return;
    var dur = audioMeta[lang].durations[beatId] || lines.length;
    var slice = dur / lines.length;
    cueBook[lang][beatId] = lines.map(function (text, index) {
      return { start: index * slice, end: (index + 1) * slice, text: text };
    });
  }).catch(function () { /* keep the embedded cue if the script file is unreachable */ });
}

function refreshCue(lang, beatId) {
  return fetch("audio/" + lang + "/" + beatId + ".vtt").then(function (res) {
    if (!res.ok) throw new Error("vtt");
    return res.text();
  }).then(function (text) {
    var cues = parseCues(text);
    if (cues.length) cueBook[lang][beatId] = cues;
  }).catch(function () {
    return fetch("audio/" + lang + "/" + beatId + ".srt").then(function (res) {
      if (!res.ok) throw new Error("srt");
      return res.text();
    }).then(function (text) {
      var cues = parseCues(text);
      if (cues.length) cueBook[lang][beatId] = cues;
    }).catch(function () {
      return loadScriptFallback(lang, beatId);
    });
  });
}

function refreshFromFiles() {
  return fetch("audio/manifest.json").then(function (res) {
    if (!res.ok) throw new Error("manifest");
    return res.json();
  }).then(function (rows) {
    var changed = false;
    var byLang = { yue: {}, cmn: {}, en: {} };
    rows.forEach(function (row) {
      if (!byLang[row.lang] || !(row.duration_s > 0)) return;
      byLang[row.lang][row.beat] = row.duration_s;
    });
    LANGS.forEach(function (lang) {
      var map = byLang[lang.id];
      var missing = [];
      CH4_BEATS.forEach(function (beat) {
        if (!map[beat.id]) missing.push(beat.id);
      });
      var ready = missing.length === 0;
      if (durationsChanged(lang.id, map) || audioMeta[lang.id].ready !== ready) {
        audioMeta[lang.id] = { ready: ready, durations: map, missing: missing };
        if (ready && !pool[lang.id]) buildPool(lang.id);
        changed = true;
      }
    });
    if (!voiceLang) {
      LANGS.forEach(function (lang) {
        if (!voiceLang && audioMeta[lang.id].ready) voiceLang = lang.id;
      });
      if (voiceLang) changed = true;
    }
    return Promise.all(LANGS.map(function (lang) {
      return Promise.all(CH4_BEATS.map(function (beat) {
        return refreshCue(lang.id, beat.id);
      }));
    })).then(function () {
      updateVoiceButtons();
      writeStatus();
      if (changed) rebuild(captureAnchor());
      else onTick();
    });
  }).catch(function () {
    updateVoiceButtons();
    writeStatus();
  });
}

function fitStage() {
  var slot = document.getElementById("stageSlot");
  var scaleWrap = document.getElementById("stageScale");
  var scale = Math.min(1, slot.clientWidth / 1280);
  stage.style.transform = "scale(" + scale + ")";
  scaleWrap.style.width = (1280 * scale) + "px";
  scaleWrap.style.height = (720 * scale) + "px";
}


function applySubSize(size) {
  if (!SUB_SIZES[size]) size = "m";
  subSize = size;
  document.documentElement.dataset.subSize = size;
  if (stage) stage.dataset.subSize = size;
  document.documentElement.style.setProperty("--sub-size", SUB_SIZES[size]);
  document.querySelectorAll("[data-sub-size]").forEach(function (btn) {
    if (!btn.classList.contains("ctrl")) return;
    var on = btn.dataset.subSize === size;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  try { localStorage.setItem(SUB_SIZE_KEY, size); } catch (err) { /* ignore */ }
}

function loadSubSize() {
  var saved = null;
  try { saved = localStorage.getItem(SUB_SIZE_KEY); } catch (err) { saved = null; }
  applySubSize(saved || "m");
}

function bind() {
  playBtn.addEventListener("click", play);
  pauseBtn.addEventListener("click", pause);
  document.getElementById("prevBtn").addEventListener("click", prev);
  document.getElementById("nextBtn").addEventListener("click", function () {
    seekBeat(itemAt(master.time()).index + 1);
  });
  document.getElementById("replayBtn").addEventListener("click", replay);
  scrub.addEventListener("pointerdown", function () { scrubbing = true; });
  window.addEventListener("pointerup", function () {
    if (!scrubbing) return;
    scrubbing = false;
    onTick();
  });
  scrub.addEventListener("input", function () {
    if (!master) return;
    var ratio = Number(scrub.value) / 1000;
    master.time(ratio * master.duration());
    onTick();
  });
  document.getElementById("subsBtn").addEventListener("click", function () {
    subsOn = !subsOn;
    stage.classList.toggle("subs-off", !subsOn);
    var btn = document.getElementById("subsBtn");
    btn.setAttribute("aria-pressed", subsOn ? "true" : "false");
    btn.classList.toggle("is-on", subsOn);
    btn.textContent = subsOn ? "字幕開" : "字幕關";
  });
  document.querySelectorAll(".ctrl[data-sub-size]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applySubSize(btn.dataset.subSize);
    });
  });
  document.querySelectorAll("[data-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      setVoice(btn.dataset.lang);
    });
  });
  speedSlider.addEventListener("input", function () {
    setSpeed(speedSlider.value);
  });
  document.querySelectorAll("[data-speed]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setSpeed(btn.dataset.speed);
    });
  });
  var waitTimer = null;
  var waitAnchor = null;
  waitSlider.addEventListener("input", function () {
    if (!waitTimer) waitAnchor = captureAnchor();
    voWait = clamp(Number(waitSlider.value), 0, 3);
    waitReadout.textContent = voWait.toFixed(1) + " 秒";
    updateWaitPresets();
    clearTimeout(waitTimer);
    waitTimer = setTimeout(function () {
      var anchor = waitAnchor;
      waitTimer = null;
      waitAnchor = null;
      setVoWait(waitSlider.value, anchor);
    }, 70);
  });
  document.querySelectorAll("[data-wait]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setVoWait(btn.dataset.wait);
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.target && event.target.closest && event.target.closest("input, button, textarea")) return;
    if (event.code === "Space") {
      event.preventDefault();
      if (master && master.isActive()) pause();
      else play();
    } else if (event.code === "ArrowRight") {
      seekBeat(itemAt(master.time()).index + 1);
    } else if (event.code === "ArrowLeft") {
      prev();
    }
  });
}

function expose() {
  window.getMasterTimeline = function () { return master; };
  Object.defineProperty(window, "DURATION", {
    configurable: true,
    enumerable: true,
    get: function () { return master ? master.duration() : 0; }
  });
  window.CH4Player = {
    play: play,
    pause: pause,
    next: function () { seekBeat(itemAt(master.time()).index + 1); },
    prev: prev,
    replay: replay,
    seek: function (sec) {
      if (!master) return;
      var was = master.isActive();
      master.time(clamp(sec, 0, master.duration()));
      if (!was) master.pause();
      onTick();
    },
    setSpeed: setSpeed,
    setVoWait: setVoWait,
    setVoice: setVoice,
    setSubSize: applySubSize,
    getLayout: function () { return layout; },
    getVoiceState: function () { return audioMeta; }
  };
}

function cacheDom() {
  stage = document.getElementById("stage");
  sceneStack = document.getElementById("sceneStack");
  badge = document.getElementById("beatBadge");
  titleEl = document.getElementById("beatTitle");
  keywordEl = document.getElementById("beatKeyword");
  subtitleEl = document.getElementById("subtitle");
  dwellChip = document.getElementById("dwellChip");
  scrub = document.getElementById("scrub");
  clock = document.getElementById("clock");
  beatIdEl = document.getElementById("beatId");
  playBtn = document.getElementById("playBtn");
  pauseBtn = document.getElementById("pauseBtn");
  statusEl = document.getElementById("status");
  speedSlider = document.getElementById("speedSlider");
  speedReadout = document.getElementById("speedReadout");
  waitSlider = document.getElementById("waitSlider");
  waitReadout = document.getElementById("waitReadout");
}

function init() {
  cacheDom();
  if (!window.gsap) {
    statusEl.textContent = "GSAP 未載入。請確認 vendor/gsap.min.js，或改用 README 內的 CDN。";
    return;
  }
  bind();
  loadSubSize();
  expose();
  seedPack();
  try {
    rebuild({ id: "B01", local: 0, playing: false });
  } catch (err) {
    statusEl.textContent = "畫面未能起動：" + err.message;
    return;
  }
  fitStage();
  window.addEventListener("resize", fitStage);
  updateVoiceButtons();
  writeStatus();
  refreshFromFiles();
}

init();
