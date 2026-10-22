/* L2 real scenes. One builder per beat. Chrome, cues, and TTS are untouched. */
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

function pulse(tl, el, at) {
  tl.to(el, { scale: 1.05, duration: 0.26, yoyo: true, repeat: 1, ease: "power1.inOut", transformOrigin: "center center" }, at);
}

function dots(count, color) {
  var html = "";
  for (var i = 0; i < count; i++) {
    var left = 10 + (i * 31) % 78;
    var top = 18 + ((i * 29) % 62);
    html += '<i class="particle" style="left:' + left + "%;top:" + top + "%;background:" + color + '"></i>';
  }
  return html;
}

var SCENE_BUILDERS = {
  B01: buildB01, B02: buildB02, B03: buildB03, B04: buildB04, B05: buildB05,
  B06: buildB06, B07: buildB07, B08: buildB08, B09: buildB09, B10: buildB10,
  B11: buildB11, B12: buildB12, B13: buildB13, B14: buildB14
};

var SCENE_TWEENS = {
  B01: tweensB01, B02: tweensB02, B03: tweensB03, B04: tweensB04, B05: tweensB05,
  B06: tweensB06, B07: tweensB07, B08: tweensB08, B09: tweensB09, B10: tweensB10,
  B11: tweensB11, B12: tweensB12, B13: tweensB13, B14: tweensB14
};

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
  SCENE_TWEENS[beat.id](tl, root, start);
}

function mountScenes(stack) {
  stack.innerHTML = "";
  CH4_BEATS.forEach(function (beat) {
    if (!SCENE_BUILDERS[beat.id] || !SCENE_TWEENS[beat.id]) throw new Error("Missing scene " + beat.id);
    stack.appendChild(buildScene(beat));
  });
}

function buildB01() {
  return dom(
    '<div>' +
      '<div class="hero sticker"><div><p class="eyebrow">YLCSS · S4 Physics</p><h2>第2課｜熱、溫度與熱傳遞</h2></div><div class="eyebrow">Heat · Temperature · Heat transfer</div></div>' +
      '<div class="icon-row">' +
        '<div class="icon-card sticker"><b>溫度</b><small>Temperature</small></div>' +
        '<div class="icon-card sticker"><b>熱</b><small>Heat</small></div>' +
        '<div class="icon-card sticker"><b>傳遞</b><small>Transfer</small></div>' +
      "</div>" +
    "</div>"
  );
}

function tweensB01(tl, root, start) {
  enter(tl, all(root, ".icon-card"), start + 0.2, { y: 40 }, { y: 0, stagger: 0.16, duration: 0.4, ease: "power3.out" });
  pulse(tl, all(root, ".icon-card"), start + 2.6);
}

function buildB02() {
  return dom(
    '<div>' +
      '<div class="split">' +
        '<div class="panel sticker"><h3>熱 Heat</h3><div class="pair"><div class="blk hot">熱</div><div class="pkt flow"></div><div class="blk cold">冷</div></div><p>能量轉移</p></div>' +
        '<div class="panel sticker"><h3>溫度 Temperature</h3><div class="cloud" style="height:160px">' + dots(8, "#E23B3B") + '</div><p>平均動能</p></div>' +
      "</div>" +
      '<div class="stamp-wrap"><div class="stamp">熱 ≠ 溫度</div></div>' +
    "</div>"
  );
}

function tweensB02(tl, root, start) {
  enter(tl, all(root, ".panel"), start + 0.15, { y: 20 }, { y: 0, stagger: 0.15, duration: 0.4 });
  enter(tl, must(root, ".stamp"), start + 1.5, { scale: 1.6 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
  tl.to(must(root, ".flow"), { x: 40, duration: 0.8, yoyo: true, repeat: 4, ease: "power1.inOut" }, start + 2.4);
  all(root, ".particle").forEach(function (dot, i) {
    tl.to(dot, { x: (i % 2 ? 16 : -16), y: (i % 2 ? -12 : 12), duration: 0.35, yoyo: true, repeat: 8, ease: "sine.inOut" }, start + 3.2);
  });
}

function buildB03() {
  return dom(
    '<div class="bitmap-layout">' +
      '<div class="cloud sticker">' + dots(7, "#E23B3B") +
        '<svg viewBox="0 0 280 80" width="280" height="70" aria-hidden="true" style="position:absolute;left:20px;bottom:16px"><path class="spring" d="M10 40 H40 L55 16 L80 64 L105 16 L130 64 L155 40 H250" fill="none" stroke="#141414" stroke-width="4"/></svg>' +
      "</div>" +
      '<div class="side-stack">' +
        '<div class="chip-box sticker ke">粒子 KE</div>' +
        '<div class="chip-box sticker pe">粒子 PE</div>' +
        '<div class="banner sticker sum">內能 = KE + PE</div>' +
        '<div class="banner bad macro">✗ 唔係宏觀動能／重力勢能</div>' +
      "</div>" +
    "</div>"
  );
}

function tweensB03(tl, root, start) {
  all(root, ".particle").forEach(function (dot, i) {
    tl.to(dot, { y: (i % 2 ? -18 : 18), duration: 0.28, yoyo: true, repeat: 14, ease: "sine.inOut" }, start + 0.3);
  });
  enter(tl, must(root, ".ke"), start + 1.2, { x: 20 }, { x: 0, duration: 0.35 });
  enter(tl, must(root, ".pe"), start + 3.2, { x: 20 }, { x: 0, duration: 0.35 });
  enter(tl, must(root, ".sum"), start + 5.4, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: "back.out(1.6)" });
  enter(tl, must(root, ".macro"), start + 8.2, { y: 12 }, { y: 0, duration: 0.4 });
}

function buildB04() {
  return dom(
    '<div class="fmt-row">' +
      '<article class="fmt-card sticker"><h3>傳導</h3><p>Conduction</p><div class="blk" style="background:#d9d3c7">鐵棒</div></article>' +
      '<article class="fmt-card sticker"><h3>對流</h3><p>Convection</p><div class="blk warm">水鍋</div></article>' +
      '<article class="fmt-card sticker"><h3>輻射</h3><p>Radiation</p><div class="blk hot">太陽</div></article>' +
    "</div>"
  );
}

function tweensB04(tl, root, start) {
  enter(tl, all(root, ".fmt-card"), start + 0.12, { rotationY: 80 }, { rotationY: 0, stagger: 0.28, duration: 0.4, ease: "power2.out" });
  pulse(tl, all(root, ".blk"), start + 2.5);
}

function buildB05() {
  return dom(
    '<div>' +
      '<div class="rod-stage sticker">' +
        '<div class="blk hot rod-end left">火</div>' +
        '<div class="rod"></div>' +
        '<div class="pkt spark"></div>' +
        '<div class="blk rod-end right hand">手</div>' +
      "</div>" +
      '<div class="banner sticker">傳導 · 固體 · 金屬是良導體</div>' +
    "</div>"
  );
}

function tweensB05(tl, root, start) {
  enter(tl, must(root, ".rod"), start + 0.15, { scaleX: 0.2 }, { scaleX: 1, duration: 0.6, transformOrigin: "left center" });
  tl.to(must(root, ".spark"), { left: "78%", duration: 3.4, ease: "none", repeat: 1 }, start + 1.0);
  tl.to(must(root, ".hand"), { backgroundColor: "#E23B3B", color: "#fff", duration: 0.4 }, start + 4.2);
  enter(tl, must(root, ".banner"), start + 6.2, { y: 12 }, { y: 0, duration: 0.35 });
  pulse(tl, must(root, ".hand"), start + 8.4);
}

function buildB06() {
  return dom(
    '<div class="split">' +
      '<div class="panel sticker"><h3>導體 Conductor</h3><div class="chip-box sticker">金屬匙</div><div class="chip-box sticker">銅棒</div><p>熱流快</p></div>' +
      '<div class="panel sticker"><h3>絕緣體 Insulator</h3><div class="chip-box sticker">木</div><div class="chip-box sticker">塑膠 · 空氣</div><p>熱流慢 · 有屏蔽</p></div>' +
    "</div>"
  );
}

function tweensB06(tl, root, start) {
  enter(tl, all(root, ".panel"), start + 0.15, { y: 16 }, { y: 0, stagger: 0.15, duration: 0.4 });
  tl.to(must(root, ".panel:first-child"), { backgroundColor: "#FFE14A", duration: 0.8 }, start + 1.6);
  tl.to(all(root, ".panel:last-child .chip-box"), { backgroundColor: "#B9D6FF", duration: 0.6, stagger: 0.2 }, start + 3.2);
}

function buildB07() {
  return dom(
    '<div class="formula-board sticker">' +
      '<div class="pair"><div class="blk warm">熱湯</div><div class="blk" style="background:#d9d3c7">金屬匙</div></div>' +
      '<div class="banner bad wrong">對流？</div>' +
      '<div class="banner good right">傳導！固體匙羹靠傳導變熱</div>' +
    "</div>"
  );
}

function tweensB07(tl, root, start) {
  enter(tl, all(root, ".blk"), start + 0.1, { y: 16 }, { y: 0, stagger: 0.12, duration: 0.3 });
  enter(tl, must(root, ".wrong"), start + 0.9, { scale: 0.8 }, { scale: 1, duration: 0.3 });
  tl.to(must(root, ".wrong"), { autoAlpha: 0.35, duration: 0.25 }, start + 2.2);
  enter(tl, must(root, ".right"), start + 2.6, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: "back.out(1.8)" });
}

function buildB08() {
  return dom(
    '<div class="bitmap-layout">' +
      '<div class="cloud sticker" style="background:#fff">' +
        '<div class="pkt rise" style="left:28%;top:70%"></div>' +
        '<div class="pkt sink" style="left:68%;top:22%;background:#B9D6FF"></div>' +
      "</div>" +
      '<div class="side-stack">' +
        '<div class="banner sticker">對流 Convection</div>' +
        '<div class="chip-box sticker">熱流體上升 · 密度↓</div>' +
        '<div class="chip-box sticker">冷流體下沉</div>' +
        '<div class="banner sticker">液體／氣體＝流體</div>' +
      "</div>" +
    "</div>"
  );
}

function tweensB08(tl, root, start) {
  tl.to(must(root, ".rise"), { top: "18%", backgroundColor: "#E23B3B", duration: 1.3, ease: "power1.inOut", yoyo: true, repeat: 3 }, start + 0.4);
  tl.to(must(root, ".sink"), { top: "70%", duration: 1.3, ease: "power1.inOut", yoyo: true, repeat: 3 }, start + 0.4);
  enter(tl, all(root, ".chip-box"), start + 2.2, { x: 16 }, { x: 0, stagger: 0.4, duration: 0.35 });
  enter(tl, all(root, ".side-stack .banner")[1], start + 6.4, { y: 10 }, { y: 0, duration: 0.35 });
}

function buildB09() {
  return dom(
    '<div class="dark-stage sticker">' +
      '<div class="pair">' +
        '<div class="blk hot">太陽</div>' +
        '<svg viewBox="0 0 420 80" width="420" height="80" aria-hidden="true"><path class="ray" d="M10 40 H400" fill="none" stroke="#D6FF3F" stroke-width="6" stroke-dasharray="16 12"/></svg>' +
        '<div class="blk cold earth">地球</div>' +
      "</div>" +
      '<div class="banner" style="background:#D6FF3F;color:#141414;margin-top:24px">無需介質 · 真空都得</div>' +
    "</div>"
  );
}

function tweensB09(tl, root, start) {
  enter(tl, all(root, ".blk"), start + 0.2, { scale: 0.7 }, { scale: 1, stagger: 0.2, duration: 0.4 });
  tl.to(must(root, ".ray"), { strokeDashoffset: -280, duration: 2.4, ease: "none", repeat: 1 }, start + 1.1);
  tl.to(must(root, ".earth"), { backgroundColor: "#FFE14A", duration: 1.2 }, start + 3.6);
  enter(tl, must(root, ".banner"), start + 5.6, { y: 12 }, { y: 0, duration: 0.4 });
}

function buildB10() {
  return dom(
    '<div class="bitmap-layout">' +
      '<svg class="chart" viewBox="0 0 360 320" aria-hidden="true">' +
        '<path d="M130 30 H230 V90 H300 V250 Q300 300 180 300 Q60 300 60 250 V90 H130 Z" fill="#fff" stroke="#141414" stroke-width="4"/>' +
        '<path class="inner" d="M150 48 H210 V100 H250 V240 Q250 270 180 270 Q110 270 110 240 V100 H150 Z" fill="none" stroke="#8a8a8a" stroke-width="6"/>' +
        '<path class="ray" d="M160 140 H210 M150 180 H230" fill="none" stroke="#E23B3B" stroke-width="3"/>' +
      "</svg>" +
      '<div class="side-stack">' +
        '<div class="banner sticker vac">真空夾層</div>' +
        '<p>傳導同對流都减弱</p>' +
        '<div class="banner sticker silver">內壁外壁鍍銀</div>' +
        '<p>減少輻射吸收／發射</p>' +
      "</div>" +
    "</div>"
  );
}

function tweensB10(tl, root, start) {
  enter(tl, must(root, "svg"), start + 0.15, { scale: 0.9 }, { scale: 1, duration: 0.45 });
  enter(tl, must(root, ".vac"), start + 1.4, { x: 16 }, { x: 0, duration: 0.4 });
  tl.to(must(root, ".inner"), { stroke: "#D6FF3F", duration: 0.6 }, start + 3.2);
  enter(tl, must(root, ".silver"), start + 5.2, { x: 16 }, { x: 0, duration: 0.4 });
  tl.to(must(root, ".ray"), { autoAlpha: 0.25, duration: 0.6, yoyo: true, repeat: 3 }, start + 6.4);
}

function buildB11() {
  return dom(
    '<div class="formula-board sticker">' +
      '<div class="pair"><div class="blk">塞子</div><div class="blk mint">細頸</div></div>' +
      '<div class="terms">' +
        '<span class="term">真空</span><span class="term">鍍銀</span><span class="term">塞子</span><span class="term">細頸</span>' +
      "</div>" +
      '<div class="banner sticker">開口熱流縮小</div>' +
    "</div>"
  );
}

function tweensB11(tl, root, start) {
  enter(tl, all(root, ".blk"), start + 0.15, { y: -16 }, { y: 0, stagger: 0.15, duration: 0.35 });
  enter(tl, all(root, ".term"), start + 1.4, { scale: 0.7 }, { scale: 1, stagger: 0.45, duration: 0.3, ease: "back.out(1.6)" });
  tl.to(all(root, ".term"), { backgroundColor: "#D6FF3F", duration: 0.25, stagger: 0.15 }, start + 4.2);
  enter(tl, must(root, ".banner"), start + 5.6, { y: 10 }, { y: 0, duration: 0.3 });
}

function buildB12() {
  return dom(
    '<div>' +
      '<div class="pair" style="margin-top:20px"><div class="blk hot hot-body">熱</div><div class="pkt"></div><div class="blk cold cold-body">冷</div></div>' +
      '<div class="banner sticker net">淨熱轉移 →</div>' +
      '<div class="stamp-wrap"><div class="stamp" style="color:#141414;border-color:#141414;background:#D6FF3F">熱平衡</div></div>' +
    "</div>"
  );
}

function tweensB12(tl, root, start) {
  tl.to(must(root, ".pkt"), { x: 120, duration: 1.4, ease: "power1.inOut" }, start + 0.4);
  tl.to(must(root, ".hot-body"), { backgroundColor: "#FFE14A", color: "#141414", duration: 1.1 }, start + 2.0);
  tl.to(must(root, ".cold-body"), { backgroundColor: "#FFE14A", duration: 1.1 }, start + 2.0);
  tl.to(must(root, ".net"), { autoAlpha: 0.3, duration: 0.4 }, start + 3.6);
  enter(tl, must(root, ".stamp"), start + 4.2, { scale: 1.4 }, { scale: 1, duration: 0.4, ease: "back.out(1.7)" });
}

function buildB13() {
  return dom(
    '<div class="fmt-row">' +
      '<article class="fmt-card sticker"><h3>1</h3><p class="bad">熱就係溫度</p><p class="good">熱 ≠ 溫度</p></article>' +
      '<article class="fmt-card sticker"><h3>2</h3><p class="bad">輻射一定要介質</p><p class="good">輻射無需介質</p></article>' +
      '<article class="fmt-card sticker"><h3>3</h3><p class="bad">匙羹靠對流</p><p class="good">固體匙羹＝傳導</p></article>' +
      '<article class="fmt-card sticker"><h3>4</h3><p class="bad">內能＝重力勢能</p><p class="good">內能＝粒子 KE + PE</p></article>' +
    "</div>"
  );
}

function tweensB13(tl, root, start) {
  var cards = all(root, ".fmt-card");
  enter(tl, cards, start + 0.15, { y: 24 }, { y: 0, stagger: 0.2, duration: 0.35 });
  cards.forEach(function (card, i) {
    var at = start + 1.8 + i * 3.4;
    tl.to(card.querySelector(".bad"), { backgroundColor: "#E23B3B", color: "#fff", duration: 0.3 }, at);
    enter(tl, card.querySelector(".good"), at + 1.1, { y: 8 }, { y: 0, duration: 0.3 });
    tl.to(card.querySelector(".good"), { backgroundColor: "#D6FF3F", duration: 0.25 }, at + 1.3);
  });
}

function buildB14() {
  return dom(
    '<div>' +
      '<div class="recap-row">' +
        '<article class="recap-panel sticker"><h3>熱 ≠ 溫度</h3><p>內能 = 粒子 KE + PE</p></article>' +
        '<article class="recap-panel sticker"><h3>三種傳遞</h3><p>傳導 · 對流 · 輻射</p></article>' +
        '<article class="recap-panel sticker"><h3>真空瓶</h3><p>真空 · 鍍銀 · 塞子 · 細頸</p></article>' +
      "</div>" +
      '<div class="stamp-wrap"><div class="stamp" style="color:#141414;border-color:#141414;background:#D6FF3F">純複習 · 第2課</div></div>' +
    "</div>"
  );
}

function tweensB14(tl, root, start) {
  enter(tl, all(root, ".recap-panel"), start + 0.2, { y: 36 }, { y: 0, stagger: 2.2, duration: 0.5, ease: "power3.out" });
  enter(tl, must(root, ".stamp"), start + 8.4, { scale: 1.2 }, { scale: 1, duration: 0.45, ease: "back.out(1.6)" });
  pulse(tl, must(root, ".stamp"), start + 12.6);
}
