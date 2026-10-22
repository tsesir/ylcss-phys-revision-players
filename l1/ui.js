/*
 * Physics pure-play chrome for the formal level page.
 * Adapted from Ch4 ui-collapse (b45b0e0). Storage prefix is html[data-store]
 * (phys-l1 / phys-l2 / phys-l3) so keys never collide with Ch4 or each other.
 *
 * Fullscreen: prefers Element.requestFullscreen (plus webkit prefix) on #playerShell.
 * If the call is missing or rejects — typical on iOS/Safari for a non-video element,
 * and inside an iframe without allow="fullscreen" — add .is-fs-fallback so the shell
 * fills the visual viewport, and show a short status hint. Leave with the same
 * button or Escape. Native fullscreen still leaves with Escape or the button.
 *
 * While maximized, the 1280×720 stage is uniformly contain-scaled
 * (scale = min(slotW/1280, slotH/720), may exceed 1) so the whole scene,
 * including the subtitle, stays inside the area under the top bar.
 * Nothing is crop-zoomed. The dock stays anchored at the top.
 */
(function () {
  var shell = document.getElementById("playerShell");
  var dock = document.getElementById("controlDock");
  var toggle = document.getElementById("panelToggle");
  var fsBtn = document.getElementById("fsBtn");
  var hint = document.getElementById("fsHint");
  var STORE_PREFIX = document.documentElement.getAttribute("data-store") || "phys";
  var DOCK_KEY = STORE_PREFIX + "-dock";
  var hintTimer = null;

  if (!shell || !dock || !toggle || !fsBtn) return;

  function nativeFsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function isFallback() {
    return shell.classList.contains("is-fs-fallback");
  }

  function isMaximized() {
    return nativeFsElement() === shell || isFallback();
  }

  function persistDock(open) {
    try {
      localStorage.setItem(DOCK_KEY, open ? "open" : "collapsed");
    } catch (err) {}
  }

  function applyDock(open, persist) {
    document.documentElement.classList.toggle("dock-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    dock.setAttribute("aria-hidden", open ? "false" : "true");
    if (open) dock.removeAttribute("inert");
    else dock.setAttribute("inert", "");
    if (persist) persistDock(open);
    refit();
  }

  function stageNodes() {
    return {
      slot: document.getElementById("stageSlot"),
      scaleWrap: document.getElementById("stageScale"),
      stage: document.getElementById("stage"),
      bar: document.getElementById("chromeBar")
    };
  }

  function clearFitInline() {
    var nodes = stageNodes();
    var slot = nodes.slot;
    var scaleWrap = nodes.scaleWrap;
    var stage = nodes.stage;
    if (slot) {
      slot.style.position = "";
      slot.style.top = "";
      slot.style.right = "";
      slot.style.bottom = "";
      slot.style.left = "";
      slot.style.width = "";
      slot.style.height = "";
      slot.style.maxWidth = "";
      slot.style.margin = "";
      slot.style.overflow = "";
      slot.style.zIndex = "";
    }
    if (stage) {
      stage.style.left = "";
      stage.style.top = "";
      stage.style.removeProperty("--fs-sub-inset");
    }
    if (scaleWrap) {
      scaleWrap.style.overflow = "";
      scaleWrap.style.margin = "";
    }
    shell.style.removeProperty("--fs-dock-h");
    shell.style.removeProperty("--fs-scale");
  }

  function fitContainedWidth() {
    var nodes = stageNodes();
    if (!nodes.slot || !nodes.scaleWrap || !nodes.stage) return;
    var scale = Math.min(1, nodes.slot.clientWidth / 1280);
    if (!(scale > 0)) scale = 1;
    nodes.stage.style.transformOrigin = "top left";
    nodes.stage.style.transform = "scale(" + scale + ")";
    nodes.scaleWrap.style.width = (1280 * scale) + "px";
    nodes.scaleWrap.style.height = (720 * scale) + "px";
  }

  function restoreNormalFit() {
    clearFitInline();
    fitContainedWidth();
  }

  var fitting = false;

  function fitMaximized() {
    if (fitting) return false;
    fitting = true;
    try {
      clearFitInline();
      var nodes = stageNodes();
      var slot = nodes.slot;
      var scaleWrap = nodes.scaleWrap;
      var stage = nodes.stage;
      if (!slot || !scaleWrap || !stage) return false;
      var availW = slot.clientWidth;
      var availH = slot.clientHeight;
      if (!(availW > 8) || !(availH > 8)) return false;
      var scale = Math.min(availW / 1280, availH / 720);
      if (!(scale > 0) || !isFinite(scale)) return false;

      var visualW = 1280 * scale;
      var offsetX = (availW - visualW) / 2;
      stage.style.transformOrigin = "top left";
      stage.style.transform = "scale(" + scale + ")";
      stage.style.left = offsetX + "px";
      stage.style.top = "0px";
      stage.style.removeProperty("--fs-sub-inset");
      scaleWrap.style.width = availW + "px";
      scaleWrap.style.height = availH + "px";
      scaleWrap.style.margin = "0";
      scaleWrap.style.overflow = "hidden";
      shell.style.setProperty("--fs-scale", String(scale));
      return true;
    } finally {
      fitting = false;
    }
  }

  function refit() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        window.dispatchEvent(new Event("resize"));
      });
    });
  }

  window.addEventListener("resize", function () {
    if (isMaximized()) fitMaximized();
    else restoreNormalFit();
  });

  function showHint(text) {
    if (!hint) return;
    hint.hidden = false;
    hint.textContent = text;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () {
      hint.hidden = true;
    }, 4500);
  }

  function syncFsUi() {
    var on = isMaximized();
    fsBtn.setAttribute("aria-pressed", on ? "true" : "false");
    fsBtn.textContent = on ? "離開全螢幕" : "全螢幕";
  }

  function startFallback() {
    shell.classList.add("is-fs-fallback");
    document.documentElement.classList.add("fs-lock");
    syncFsUi();
    refit();
    showHint("此瀏覽器未能使用系統全螢幕，已改為填滿畫面。");
  }

  function stopFallback() {
    shell.classList.remove("is-fs-fallback");
    document.documentElement.classList.remove("fs-lock");
    if (hint) hint.hidden = true;
  }

  function requestFs(el) {
    var fn = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!fn) return Promise.reject(new Error("no-fullscreen-api"));
    try {
      var result = fn.call(el);
      if (result && typeof result.then === "function") return result;
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function exitNative() {
    var active = nativeFsElement();
    if (!active) return Promise.resolve();
    var fn = document.exitFullscreen || document.webkitExitFullscreen;
    if (!fn) return Promise.resolve();
    try {
      var result = fn.call(document);
      if (result && typeof result.then === "function") return result;
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function enterFullscreen() {
    requestFs(shell).then(function () {
      if (nativeFsElement() === shell) {
        syncFsUi();
        refit();
        return;
      }
      startFallback();
    }).catch(function () {
      startFallback();
    });
  }

  function leaveFullscreen() {
    var pending = exitNative();
    stopFallback();
    syncFsUi();
    restoreNormalFit();
    refit();
    if (pending && typeof pending.catch === "function") pending.catch(function () {});
  }

  toggle.addEventListener("click", function () {
    applyDock(!document.documentElement.classList.contains("dock-open"), true);
  });

  fsBtn.addEventListener("click", function () {
    if (isMaximized()) leaveFullscreen();
    else enterFullscreen();
  });

  document.addEventListener("fullscreenchange", function () {
    syncFsUi();
    refit();
  });
  document.addEventListener("webkitfullscreenchange", function () {
    syncFsUi();
    refit();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !isFallback()) return;
    stopFallback();
    syncFsUi();
    refit();
  });

  if (hint) {
    hint.addEventListener("click", function () {
      hint.hidden = true;
    });
  }

  var stageSlotEl = document.getElementById("stageSlot");
  if (window.ResizeObserver && stageSlotEl) {
    var seenW = 0;
    var seenH = 0;
    var slotObserver = new ResizeObserver(function () {
      if (!isMaximized()) return;
      var w = stageSlotEl.clientWidth;
      var h = stageSlotEl.clientHeight;
      if (w === seenW && h === seenH) return;
      if (!fitMaximized()) return;
      seenW = stageSlotEl.clientWidth;
      seenH = stageSlotEl.clientHeight;
    });
    slotObserver.observe(stageSlotEl);
  }

  applyDock(document.documentElement.classList.contains("dock-open"), false);
  syncFsUi();
})();
