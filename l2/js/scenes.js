window.PHYS_SCENE_EYEBROW = "YLCSS · S4 Physics · Phys-L2-Heat";
/* Minimal title-card scenes for Physics placeholder scaffolds. */
function dom(html) {
  var tpl = document.createElement("template");
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

function must(root, sel) {
  var node = root.querySelector(sel);
  if (!node) throw new Error("Missing " + sel + " in " + (root.id || "scene"));
  return node;
}

function all(root, sel) {
  var list = root.querySelectorAll(sel);
  if (!list.length) throw new Error("Missing " + sel + " in " + (root.id || "scene"));
  return list;
}

function enter(tl, target, at, fromVars, toVars) {
  tl.fromTo(
    target,
    Object.assign({ autoAlpha: 0, immediateRender: true }, fromVars || {}),
    Object.assign({ autoAlpha: 1, duration: 0.38, ease: "back.out(1.6)" }, toVars || {}),
    at
  );
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

var PHYS_EYEBROW = window.PHYS_SCENE_EYEBROW || "YLCSS · S4 Physics · 純播放";

function buildTitleCard(beat) {
  return dom(
    "<div>" +
      '<div class="hero sticker">' +
        "<div><p class=\"eyebrow\">" + escapeHtml(PHYS_EYEBROW) + "</p>" +
        "<h2>" + escapeHtml(beat.title) + "</h2></div>" +
        '<div class="eyebrow">' + escapeHtml(beat.keyword || "") + "</div>" +
      "</div>" +
      '<div class="icon-row">' +
        '<div class="icon-card sticker">占位畫面</div>' +
        '<div class="icon-card sticker">稍後填寫</div>' +
        '<div class="icon-card sticker">beats / TTS</div>' +
      "</div>" +
      '<div class="sweep"><div class="sweep-arrow">Physics · scaffold</div></div>' +
    "</div>"
  );
}

function tweensTitleCard(tl, root, start) {
  enter(tl, all(root, ".icon-card"), start + 0.2, { y: 40 }, { y: 0, stagger: 0.1, duration: 0.4, ease: "power3.out" });
  enter(tl, must(root, ".sweep-arrow"), start + 1.0, { x: -200 }, { x: 420, duration: 1.4, ease: "power2.inOut" });
}

var SCENE_BUILDERS = {};
var SCENE_TWEENS = {};

CH4_BEATS.forEach(function (beat) {
  SCENE_BUILDERS[beat.id] = function () { return buildTitleCard(beat); };
  SCENE_TWEENS[beat.id] = tweensTitleCard;
});

function buildScene(beat) {
  var fn = SCENE_BUILDERS[beat.id];
  if (!fn) throw new Error("No scene builder for " + beat.id);
  var node = fn(beat);
  node.classList.add("scene");
  node.id = "scene-" + beat.id;
  node.dataset.beat = beat.id;
  return node;
}

function addSceneTweens(tl, beat, root, start) {
  var fn = SCENE_TWEENS[beat.id];
  if (!fn) throw new Error("No scene tweens for " + beat.id);
  fn(tl, root, start);
}

function mountScenes(stack) {
  stack.innerHTML = "";
  CH4_BEATS.forEach(function (beat) {
    if (!SCENE_BUILDERS[beat.id] || !SCENE_TWEENS[beat.id]) {
      throw new Error("Missing scene " + beat.id);
    }
    stack.appendChild(buildScene(beat));
  });
}
