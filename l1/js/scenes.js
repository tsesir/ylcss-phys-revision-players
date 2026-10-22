/* L1 real scenes. One builder per beat. Chrome, cues, and TTS are untouched. */
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

function drawPath(tl, path, at, dur) {
  var len = path.getTotalLength();
  if (!len) return 0;
  path.style.strokeDasharray = String(len);
  path.style.strokeDashoffset = String(len);
  tl.to(path, { strokeDashoffset: 0, duration: dur, ease: "power2.inOut" }, at);
  return len;
}

function lightTerms(tl, nodes, at, step) {
  tl.to(nodes, {
    backgroundColor: "#D6FF3F",
    duration: 0.28,
    stagger: step || 0.35,
    ease: "power2.out"
  }, at);
}

function pulse(tl, el, at) {
  tl.to(el, { scale: 1.05, duration: 0.28, yoyo: true, repeat: 1, ease: "power1.inOut", transformOrigin: "center center" }, at);
}

function dots(count, color) {
  var html = "";
  for (var i = 0; i < count; i++) {
    var left = 8 + (i * 37) % 84;
    var top = 12 + ((i * 23) % 70);
    html += '<i class="particle" style="left:' + left + "%;top:" + top + "%;background:" + color + '"></i>';
  }
  return html;
}

function ticks(n) {
  var html = "";
  for (var i = 0; i < n; i++) html += "<i></i>";
  return html;
}

var SCENE_BUILDERS = {
  B01: buildB01,
  B02: buildB02,
  B03: buildB03,
  B04: buildB04,
  B05: buildB05,
  B06: buildB06,
  B07: buildB07,
  B08: buildB08,
  B09: buildB09,
  B10: buildB10,
  B11: buildB11,
  B12: buildB12,
  B13: buildB13,
  B14: buildB14,
  B15: buildB15
};

var SCENE_TWEENS = {
  B01: tweensB01,
  B02: tweensB02,
  B03: tweensB03,
  B04: tweensB04,
  B05: tweensB05,
  B06: tweensB06,
  B07: tweensB07,
  B08: tweensB08,
  B09: tweensB09,
  B10: tweensB10,
  B11: tweensB11,
  B12: tweensB12,
  B13: tweensB13,
  B14: tweensB14,
  B15: tweensB15
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

function thermoSvg() {
  return '<svg viewBox="0 0 86 72" aria-hidden="true"><rect x="36" y="6" width="14" height="40" rx="7" fill="#fff" stroke="#141414" stroke-width="3"/><rect x="39" y="28" width="8" height="16" fill="#E23B3B"/><circle cx="43" cy="54" r="12" fill="#E23B3B" stroke="#141414" stroke-width="3"/></svg>';
}

function buildB01() {
  return dom(
    '<div>' +
      '<div class="hero sticker">' +
        '<div><p class="eyebrow">YLCSS · S4 Physics · Book 1</p><h2>第1課｜溫度與溫度計</h2></div>' +
        '<div class="eyebrow">Temperature &amp; thermometers</div>' +
      "</div>" +
      '<div class="icon-row">' +
        '<div class="icon-card sticker">' + thermoSvg() + "溫度計</div>" +
        '<div class="icon-card sticker"><b>0 °C</b><small>冰點</small></div>' +
        '<div class="icon-card sticker"><b>100 °C</b><small>汽點</small></div>' +
      "</div>" +
      '<div class="sweep"><div class="sweep-arrow">溫度 Temperature</div></div>' +
    "</div>"
  );
}

function tweensB01(tl, root, start) {
  enter(tl, all(root, ".icon-card"), start + 0.25, { y: 36 }, { y: 0, stagger: 0.12, duration: 0.4, ease: "power3.out" });
  enter(tl, must(root, ".sweep-arrow"), start + 1.2, { x: -220 }, { x: 280, duration: 1.3, ease: "power2.inOut" });
  pulse(tl, must(root, ".hero"), start + 3.1);
}

function buildB02() {
  var pairs = [
    ["溫度", "Temperature"],
    ["攝氏溫標", "Celsius scale"],
    ["固定點", "Fixed point"],
    ["冰點", "Ice point"],
    ["汽點", "Steam point"],
    ["液體玻璃溫度計", "Liquid-in-glass"],
    ["測溫物質", "Thermometric substance"],
    ["線性關係", "Linear relation"],
    ["熱平衡", "Thermal equilibrium"]
  ];
  var cards = pairs.map(function (pair) {
    return '<div class="chip-box sticker"><b>' + pair[0] + "</b><small>" + pair[1] + "</small></div>";
  }).join("");
  return dom('<div><div class="term-grid">' + cards + "</div></div>");
}

function tweensB02(tl, root, start) {
  enter(tl, all(root, ".chip-box"), start + 0.15, { y: 28, scale: 0.92 }, { y: 0, scale: 1, stagger: 0.55, duration: 0.36, ease: "power3.out" });
  tl.to(all(root, ".chip-box"), { y: -6, duration: 0.18, yoyo: true, repeat: 1, stagger: 0.05 }, start + 8.4);
}

function buildB03() {
  return dom(
    '<div>' +
      '<div class="split">' +
        '<div class="panel sticker"><h3>溫度 Temperature</h3><div class="fmt-ico">' + thermoSvg() + "</div><p>冷熱程度</p></div>" +
        '<div class="panel sticker"><h3>熱 Heat</h3><div class="pair"><div class="blk hot">熱</div><div class="pkt"></div><div class="blk cold">冷</div></div><p>能量轉移</p></div>' +
      "</div>" +
      '<div class="stamp-wrap"><div class="stamp">唔好混淆 · Don\'t mix up</div></div>' +
    "</div>"
  );
}

function tweensB03(tl, root, start) {
  enter(tl, all(root, ".panel"), start + 0.15, { y: 24 }, { y: 0, stagger: 0.16, duration: 0.4, ease: "power3.out" });
  tl.to(must(root, ".pkt"), { x: 36, duration: 0.7, yoyo: true, repeat: 3, ease: "power1.inOut" }, start + 1.2);
  enter(tl, must(root, ".stamp"), start + 4.2, { scale: 1.4, rotation: -8 }, { scale: 1, rotation: -3, duration: 0.45, ease: "back.out(1.7)" });
}

function buildB04() {
  return dom(
    '<div class="bitmap-layout">' +
      '<div class="cloud sticker">' + dots(10, "#B9D6FF") + "</div>" +
      '<div class="side-stack">' +
        '<p class="eq-live">平均動能 Average KE</p>' +
        '<div class="meter" style="width:72px;height:210px"><i class="ke-fill"></i></div>' +
        '<div class="banner sticker">溫度反映冷熱程度</div>' +
      "</div>" +
    "</div>"
  );
}

function tweensB04(tl, root, start) {
  var parts = all(root, ".particle");
  parts.forEach(function (dot, i) {
    tl.to(dot, { x: (i % 2 ? 10 : -10), y: 8, duration: 1.15, yoyo: true, repeat: 1, ease: "sine.inOut" }, start + 0.2);
    tl.to(dot, {
      backgroundColor: "#E23B3B",
      x: (i % 2 ? 46 : -46),
      y: (i % 3 - 1) * 28,
      duration: 0.32,
      yoyo: true,
      repeat: 8,
      ease: "sine.inOut"
    }, start + 3.4);
  });
  tl.to(must(root, ".ke-fill"), { height: "86%", duration: 4.6, ease: "power1.inOut" }, start + 3.4);
  enter(tl, must(root, ".banner"), start + 8.2, { y: 12 }, { y: 0, duration: 0.35 });
}

function buildB05() {
  return dom(
    '<div>' +
      '<div class="pair" style="margin-top:28px">' +
        '<div class="blk hot body-hot">熱端</div>' +
        '<div class="pkt e1"></div><div class="pkt e2"></div><div class="pkt e3"></div>' +
        '<div class="blk cold body-cold">冷端</div>' +
      "</div>" +
      '<div class="banner sticker" style="margin-top:28px">熱是能量轉移 · 唔係「含有幾多溫度」</div>' +
    "</div>"
  );
}

function tweensB05(tl, root, start) {
  enter(tl, all(root, ".blk"), start + 0.15, { scale: 0.8 }, { scale: 1, stagger: 0.12, duration: 0.35 });
  ["e1", "e2", "e3"].forEach(function (name, i) {
    tl.to(must(root, "." + name), { x: 150, duration: 1.1, ease: "power1.inOut" }, start + 0.8 + i * 0.35);
  });
  tl.to(must(root, ".body-hot"), { backgroundColor: "#FFE14A", color: "#141414", duration: 1.2 }, start + 3.6);
  tl.to(must(root, ".body-cold"), { backgroundColor: "#FFE14A", duration: 1.2 }, start + 3.6);
  enter(tl, must(root, ".banner"), start + 5.2, { y: 16 }, { y: 0, duration: 0.4 });
}

function buildB06() {
  return dom(
    '<div>' +
      '<div class="banner sticker">攝氏溫標 · 兩個固定點</div>' +
      '<div class="scale-track"><div class="pin" style="left:4%"><b>固定點 0</b></div><div class="pin" style="left:96%"><b>固定點 100</b></div></div>' +
      '<div class="stamp-wrap"><div class="stamp" style="color:#141414;border-color:#141414;background:#D6FF3F">標準大氣壓</div></div>' +
    "</div>"
  );
}

function tweensB06(tl, root, start) {
  enter(tl, must(root, ".scale-track"), start + 0.2, { scaleX: 0.2 }, { scaleX: 1, duration: 0.9, ease: "power2.out", transformOrigin: "left center" });
  enter(tl, all(root, ".pin"), start + 1.4, { y: -50 }, { y: 0, stagger: 0.25, duration: 0.45, ease: "bounce.out" });
  enter(tl, must(root, ".stamp"), start + 3.6, { scale: 1.3 }, { scale: 1, duration: 0.4, ease: "back.out(1.6)" });
}

function buildB07() {
  return dom(
    '<div class="split">' +
      '<div class="panel sticker"><h3>冰點 ice point</h3><div class="blk cold" style="margin:18px auto">冰 + 純水</div><p class="eq-live">0 °C</p></div>' +
      '<div class="panel sticker"><h3>汽點 steam point</h3><div class="blk hot" style="margin:18px auto">純水沸騰</div><p class="eq-live">100 °C</p></div>' +
    "</div>"
  );
}

function tweensB07(tl, root, start) {
  enter(tl, all(root, ".panel"), start + 0.1, { x: -30 }, { x: 0, stagger: 0.2, duration: 0.45, ease: "power3.out" });
  enter(tl, all(root, ".eq-live"), start + 1.6, { scale: 0.6 }, { scale: 1, stagger: 0.8, duration: 0.4, ease: "back.out(1.7)" });
  pulse(tl, all(root, ".blk")[0], start + 4.4);
  pulse(tl, all(root, ".blk")[1], start + 6.2);
}

function buildB08() {
  return dom(
    '<div class="bitmap-layout">' +
      '<div class="side-stack" style="align-items:center"><div class="thermo"><i class="liq"></i></div><p class="eq-live">液柱</p></div>' +
      '<div class="side-stack">' +
        '<div class="chip-box sticker">水銀<small>測溫物質 thermometric substance</small></div>' +
        '<div class="chip-box sticker">酒精<small>測溫物質 thermometric substance</small></div>' +
        '<div class="banner sticker">受熱體積膨脹 · 液柱上升</div>' +
      "</div>" +
    "</div>"
  );
}

function tweensB08(tl, root, start) {
  enter(tl, all(root, ".chip-box"), start + 0.3, { x: 24 }, { x: 0, stagger: 0.35, duration: 0.4 });
  tl.to(must(root, ".liq"), { height: "78%", duration: 3.2, ease: "power1.inOut" }, start + 2.2);
  enter(tl, must(root, ".banner"), start + 6.2, { y: 12 }, { y: 0, duration: 0.35 });
}

function buildB09() {
  return dom(
    '<div>' +
      '<svg class="chart" viewBox="0 0 1040 250" aria-hidden="true">' +
        '<line x1="80" y1="20" x2="80" y2="210" stroke="#141414" stroke-width="4"/>' +
        '<line x1="80" y1="210" x2="1000" y2="210" stroke="#141414" stroke-width="4"/>' +
        '<text x="24" y="36" font-size="28" font-weight="800" fill="#141414">θ</text>' +
        '<text x="960" y="242" font-size="28" font-weight="800" fill="#141414">L</text>' +
        '<path class="fit-line" d="M80 210 L980 36" fill="none" stroke="#141414" stroke-width="6"/>' +
        '<circle cx="80" cy="210" r="11" fill="#B9D6FF" stroke="#141414" stroke-width="3"/>' +
        '<circle cx="980" cy="36" r="11" fill="#E23B3B" stroke="#141414" stroke-width="3"/>' +
        '<text x="96" y="206" font-size="24" font-weight="800" fill="#141414">L₀ , 0 °C</text>' +
        '<text x="760" y="28" font-size="24" font-weight="800" fill="#141414">L₁₀₀ , 100 °C</text>' +
      "</svg>" +
      '<div class="tick-row">' + ticks(100) + "</div>" +
      '<div class="banner sticker">假設線性關係 · 冰點至汽點均分 100 等份</div>' +
    "</div>"
  );
}

function tweensB09(tl, root, start) {
  drawPath(tl, must(root, ".fit-line"), start + 0.3, 1.3);
  enter(tl, all(root, ".tick-row i"), start + 1.8, { scaleY: 0.2 }, { scaleY: 1, stagger: 0.012, duration: 0.2, ease: "power1.out" });
  enter(tl, must(root, ".banner"), start + 6.4, { y: 14 }, { y: 0, duration: 0.4 });
}

function buildB10() {
  return dom(
    '<div class="formula-board sticker">' +
      '<p class="eq-live">θ = ( L − L₀ ) / ( L₁₀₀ − L₀ ) × 100</p>' +
      '<div class="terms">' +
        '<span class="term">θ theta</span><span class="term">=</span>' +
        '<span class="term">L 待測</span><span class="term">−</span><span class="term">L₀ 冰點長度</span>' +
        '<span class="term">/</span><span class="term">L₁₀₀ 汽點長度</span><span class="term">−</span><span class="term">L₀</span>' +
        '<span class="term">×</span><span class="term">100</span><span class="term">°C</span>' +
      "</div>" +
      '<div class="banner sticker">未刻度溫度計 · 線性假設 · 單位 °C</div>' +
    "</div>"
  );
}

function tweensB10(tl, root, start) {
  enter(tl, must(root, ".eq-live"), start + 0.2, { y: 16 }, { y: 0, duration: 0.45 });
  lightTerms(tl, all(root, ".term"), start + 1.4, 0.85);
  enter(tl, must(root, ".banner"), start + 13.5, { y: 12 }, { y: 0, duration: 0.4 });
}

function buildB11() {
  return dom(
    '<div class="formula-board sticker">' +
      '<p class="eq-live">L = L₀ + (θ / 100) ( L₁₀₀ − L₀ )</p>' +
      '<div class="pair">' +
        '<div class="chip-box sticker">θ</div>' +
        '<div class="chip-box sticker loop">↔</div>' +
        '<div class="chip-box sticker">L</div>' +
      "</div>" +
      '<div class="banner sticker">已知溫度 · 反求液柱長度</div>' +
    "</div>"
  );
}

function tweensB11(tl, root, start) {
  enter(tl, must(root, ".eq-live"), start + 0.2, { rotationX: 70 }, { rotationX: 0, duration: 0.6, ease: "power2.out" });
  enter(tl, all(root, ".chip-box"), start + 1.3, { scale: 0.7 }, { scale: 1, stagger: 0.2, duration: 0.35 });
  tl.to(must(root, ".loop"), { rotation: 180, duration: 1.2, ease: "power1.inOut", transformOrigin: "center" }, start + 2.4);
  tl.to(must(root, ".loop"), { rotation: 360, duration: 1.2, ease: "power1.inOut" }, start + 3.8);
  enter(tl, must(root, ".banner"), start + 5.4, { y: 10 }, { y: 0, duration: 0.35 });
}

function buildB12() {
  return dom(
    '<div class="formula-board sticker">' +
      '<div class="terms">' +
        '<span class="term">L₀ = 2.0 cm</span>' +
        '<span class="term">L₁₀₀ = 22.0 cm</span>' +
        '<span class="term">L = 12.0 cm</span>' +
      "</div>" +
      '<div class="thermo" style="height:160px"><i class="mark-l" style="height:18%"></i></div>' +
      '<div class="stamp-wrap"><div class="stamp" style="color:#141414;border-color:#141414;background:#D6FF3F">教學示範 DEMO · 純播放</div></div>' +
    "</div>"
  );
}

function tweensB12(tl, root, start) {
  enter(tl, all(root, ".term"), start + 0.25, { y: 20 }, { y: 0, stagger: 1.1, duration: 0.4, ease: "power3.out" });
  tl.to(must(root, ".mark-l"), { height: "55%", duration: 1.6, ease: "power1.inOut" }, start + 4.2);
  enter(tl, must(root, ".stamp"), start + 7.4, { scale: 1.2 }, { scale: 1, duration: 0.4, ease: "back.out(1.6)" });
}

function buildB13() {
  return dom(
    '<div class="formula-board sticker">' +
      '<p class="eq-live step-a">(12.0 − 2.0) / (22.0 − 2.0) × 100</p>' +
      '<p class="eq-live step-b">10.0 / 20.0 × 100</p>' +
      '<p class="eq-live step-c">50.0</p>' +
      '<div class="banner sticker ans">θ = 50.0 °C</div>' +
      '<p class="eyebrow">記得寫單位 °C</p>' +
    "</div>"
  );
}

function tweensB13(tl, root, start) {
  enter(tl, must(root, ".step-a"), start + 0.3, { x: -20 }, { x: 0, duration: 0.45 });
  enter(tl, must(root, ".step-b"), start + 4.2, { x: -20 }, { x: 0, duration: 0.45 });
  enter(tl, must(root, ".step-c"), start + 8.4, { scale: 0.8 }, { scale: 1, duration: 0.4 });
  enter(tl, must(root, ".ans"), start + 11.2, { scale: 1.25 }, { scale: 1, duration: 0.45, ease: "back.out(1.7)" });
  pulse(tl, must(root, ".ans"), start + 14.2);
}

function buildB14() {
  return dom(
    '<div class="fmt-row">' +
      '<article class="fmt-card sticker"><h3>1</h3><p class="bad">唔係隻隻溫度計都天然線性</p><p class="good">要靠固定點校準</p></article>' +
      '<article class="fmt-card sticker"><h3>2</h3><p class="bad">讀數 ≠ 熱／內能絕對值</p><p class="good">溫度計讀的是溫度</p></article>' +
      '<article class="fmt-card sticker"><h3>3</h3><p class="bad">唔好用體溫／室溫當固定點</p><p class="good">固定點是 0 °C 同 100 °C</p></article>' +
    "</div>"
  );
}

function tweensB14(tl, root, start) {
  var cards = all(root, ".fmt-card");
  enter(tl, cards, start + 0.2, { rotationY: 80 }, { rotationY: 0, stagger: 0.3, duration: 0.45, ease: "power2.out" });
  cards.forEach(function (card, i) {
    var at = start + 2.2 + i * 4.2;
    tl.to(card.querySelector(".bad"), { backgroundColor: "#E23B3B", color: "#fff", duration: 0.35 }, at);
    enter(tl, card.querySelector(".good"), at + 1.3, { y: 10 }, { y: 0, duration: 0.35 });
    tl.to(card.querySelector(".good"), { backgroundColor: "#D6FF3F", duration: 0.3 }, at + 1.5);
  });
}

function buildB15() {
  return dom(
    '<div>' +
      '<div class="recap-row">' +
        '<article class="recap-panel sticker"><h3>溫度 · 熱</h3><p>溫度 ↔ 平均動能</p><p>熱＝溫度差的能量轉移</p></article>' +
        '<article class="recap-panel sticker"><h3>固定點</h3><p>冰點 0 °C</p><p>汽點 100 °C</p></article>' +
        '<article class="recap-panel sticker"><h3>線性公式</h3><p>θ = (L−L₀)/(L₁₀₀−L₀)×100</p></article>' +
        '<article class="recap-panel sticker"><h3>示範</h3><p>θ = 50.0 °C</p></article>' +
      "</div>" +
      '<div class="stamp-wrap"><div class="stamp" style="color:#141414;border-color:#141414;background:#D6FF3F">純複習 · 記住公式同固定點</div></div>' +
    "</div>"
  );
}

function tweensB15(tl, root, start) {
  enter(tl, all(root, ".recap-panel"), start + 0.2, { y: 40 }, { y: 0, stagger: 1.6, duration: 0.45, ease: "power3.out" });
  enter(tl, must(root, ".stamp"), start + 8.6, { scale: 1.2 }, { scale: 1, duration: 0.45, ease: "back.out(1.6)" });
  pulse(tl, must(root, ".stamp"), start + 12.4);
}
