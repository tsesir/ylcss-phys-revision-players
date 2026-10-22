/* L3 real scenes. One builder per beat. Chrome, cues, and TTS are untouched. */
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

function lightTerms(tl, nodes, at, step) {
  tl.to(nodes, { backgroundColor: "#D6FF3F", duration: 0.28, stagger: step || 0.4, ease: "power2.out" }, at);
}

function pulse(tl, el, at) {
  tl.to(el, { scale: 1.06, duration: 0.26, yoyo: true, repeat: 1, ease: "power1.inOut", transformOrigin: "center center" }, at);
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
      '<div class="hero sticker"><div><p class="eyebrow">YLCSS · S4 Physics</p><h2>第3課｜比熱容與熱容量</h2></div><div class="eyebrow">Specific heat capacity &amp; heat capacity</div></div>' +
      '<div class="icon-row">' +
        '<div class="icon-card sticker sym-c"><b>c</b><small>比熱容</small></div>' +
        '<div class="thermo"><i></i></div>' +
        '<div class="icon-card sticker sym-C"><b>C</b><small>熱容量</small></div>' +
      "</div>" +
    "</div>"
  );
}

function tweensB01(tl, root, start) {
  enter(tl, must(root, ".sym-c"), start + 0.25, { x: -80 }, { x: 0, duration: 0.5, ease: "power3.out" });
  enter(tl, must(root, ".sym-C"), start + 0.25, { x: 80 }, { x: 0, duration: 0.5, ease: "power3.out" });
  pulse(tl, must(root, ".thermo"), start + 1.6);
  tl.to(must(root, ".thermo i"), { height: "46%", duration: 1.2, yoyo: true, repeat: 1, ease: "power1.inOut" }, start + 2.2);
}

function buildB02() {
  return dom(
    '<div>' +
      '<div class="split">' +
        '<div class="panel sticker"><h3>c 比熱容</h3><div class="blk mint">1 kg</div><p>物質本身</p></div>' +
        '<div class="panel sticker"><h3>C 熱容量</h3><div class="blk warm">成件物體</div><p>成件物件</p></div>' +
      "</div>" +
      '<div class="banner sticker link">C = m c</div>' +
    "</div>"
  );
}

function tweensB02(tl, root, start) {
  enter(tl, all(root, ".panel"), start + 0.2, { rotationY: 70 }, { rotationY: 0, stagger: 0.35, duration: 0.5, ease: "power2.out" });
  enter(tl, must(root, ".link"), start + 3.2, { scaleX: 0.2 }, { scaleX: 1, duration: 0.7, ease: "power2.out" });
  pulse(tl, must(root, ".link"), start + 6.4);
}

function buildB03() {
  return dom(
    '<div class="bitmap-layout">' +
      '<div class="side-stack" style="align-items:center"><div class="blk mint">1 kg</div><div class="thermo"><i class="liq"></i></div><p class="eq-live">+1 °C</p></div>' +
      '<div class="formula-board sticker">' +
        '<div class="pkt energy">E</div>' +
        '<div class="banner sticker">使 1 kg 升高 1 °C 所需能量</div>' +
        '<div class="terms"><span class="term">J</span><span class="term">kg⁻¹</span><span class="term">°C⁻¹</span></div>' +
        '<p class="eq-live">c 的單位：J / (kg · °C)</p>' +
      "</div>" +
    "</div>"
  );
}

function tweensB03(tl, root, start) {
  enter(tl, must(root, ".energy"), start + 0.3, { x: -40 }, { x: 80, duration: 1.1, ease: "power1.inOut" });
  tl.to(must(root, ".liq"), { height: "62%", duration: 1.4, ease: "power1.inOut" }, start + 1.2);
  enter(tl, must(root, ".banner"), start + 3.2, { y: 10 }, { y: 0, duration: 0.4 });
  enter(tl, all(root, ".term"), start + 5.4, { y: 12 }, { y: 0, stagger: 0.45, duration: 0.35 });
  enter(tl, all(root, ".eq-live")[1], start + 8.4, { scale: 0.9 }, { scale: 1, duration: 0.4 });
}

function buildB04() {
  return dom(
    '<div class="formula-board sticker">' +
      '<p class="eq-live">C = m c</p>' +
      '<div class="terms"><span class="term">m 質量</span><span class="term">c 比熱容</span><span class="term">C 熱容量</span></div>' +
      '<div class="chip-box sticker">單位 J °C⁻¹</div>' +
      '<p>同一物質 · 質量愈大 · C 愈大</p>' +
      '<div class="bar-track"><div class="bar cbar"></div><span class="bar-val">C</span></div>' +
    "</div>"
  );
}

function tweensB04(tl, root, start) {
  lightTerms(tl, all(root, ".term"), start + 0.4, 1.1);
  enter(tl, must(root, ".chip-box"), start + 4.6, { scale: 0.8 }, { scale: 1, duration: 0.4 });
  tl.to(must(root, ".cbar"), { width: "78%", duration: 3.2, ease: "power1.inOut" }, start + 6.4);
}

function buildB05() {
  return dom(
    '<div class="formula-board sticker">' +
      '<p class="eq-live">E = m × c × ΔT</p>' +
      '<div class="terms">' +
        '<span class="term">E 或 Q · J</span><span class="term">m · kg</span>' +
        '<span class="term">c · J kg⁻¹ °C⁻¹</span><span class="term">ΔT · °C 或 K</span>' +
      "</div>" +
      '<div class="banner sticker alt">Q = mcΔT</div>' +
    "</div>"
  );
}

function tweensB05(tl, root, start) {
  enter(tl, must(root, ".eq-live"), start + 0.2, { y: 14 }, { y: 0, duration: 0.4 });
  lightTerms(tl, all(root, ".term"), start + 1.2, 1.3);
  enter(tl, must(root, ".alt"), start + 7.6, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 });
  tl.to(must(root, ".alt"), { autoAlpha: 0.85, duration: 0.4 }, start + 9.4);
}

function buildB06() {
  return dom(
    '<div class="formula-board sticker">' +
      '<p class="eq-live mc">m c</p>' +
      '<p class="eq-live big">E = C ΔT</p>' +
      '<div class="banner sticker">因為 C = m c</div>' +
      '<div class="bar-track"><div class="bar dbar"></div><span class="bar-val">ΔT</span></div>' +
    "</div>"
  );
}

function tweensB06(tl, root, start) {
  enter(tl, must(root, ".mc"), start + 0.15, { scale: 1 }, { scale: 1, duration: 0.3 });
  tl.to(must(root, ".mc"), { autoAlpha: 0, scale: 0.6, duration: 0.45 }, start + 1.2);
  enter(tl, must(root, ".big"), start + 1.7, { scale: 0.7 }, { scale: 1, duration: 0.45, ease: "back.out(1.6)" });
  enter(tl, must(root, ".banner"), start + 3.2, { y: 8 }, { y: 0, duration: 0.3 });
  tl.to(must(root, ".dbar"), { width: "70%", duration: 2.2, ease: "power1.inOut" }, start + 4.2);
}

function buildB07() {
  return dom(
    '<div class="formula-board sticker">' +
      '<div class="banner sticker">鋁塊 · E = mcΔT</div>' +
      '<div class="terms">' +
        '<span class="term">m = 0.30 kg</span>' +
        '<span class="term">c = 900 J kg⁻¹ °C⁻¹</span>' +
        '<span class="term">ΔT = 20.0 °C</span>' +
      "</div>" +
      '<p class="eq-live prod">(0.30)(900)(20.0)</p>' +
      '<div class="banner good ans">E = 5.40×10³ J</div>' +
    "</div>"
  );
}

function tweensB07(tl, root, start) {
  enter(tl, all(root, ".term"), start + 0.3, { y: 16 }, { y: 0, stagger: 1.4, duration: 0.4, ease: "power3.out" });
  enter(tl, must(root, ".prod"), start + 5.6, { x: -12 }, { x: 0, duration: 0.4 });
  enter(tl, must(root, ".ans"), start + 9.2, { scale: 1.2 }, { scale: 1, duration: 0.45, ease: "back.out(1.7)" });
  pulse(tl, must(root, ".ans"), start + 13.4);
}

function buildB08() {
  return dom(
    '<div class="formula-board sticker">' +
      '<div class="pair"><div class="blk hot">電熱器 P</div><div class="pkt"></div><div class="blk mint">mcΔT</div></div>' +
      '<p class="eq-live">E = P t = m c ΔT</p>' +
      '<div class="banner good">無熱損失 → Pt = mcΔT</div>' +
      '<div class="banner bad leak">熱損失 ✗</div>' +
    "</div>"
  );
}

function tweensB08(tl, root, start) {
  tl.to(must(root, ".pkt"), { x: 90, duration: 1.1, ease: "power1.inOut" }, start + 0.3);
  enter(tl, must(root, ".eq-live"), start + 1.8, { y: 10 }, { y: 0, duration: 0.4 });
  enter(tl, must(root, ".good"), start + 3.6, { scale: 0.9 }, { scale: 1, duration: 0.4 });
  enter(tl, must(root, ".leak"), start + 5.4, { scale: 1.1 }, { scale: 1, duration: 0.3 });
  tl.to(must(root, ".leak"), { autoAlpha: 0.4, duration: 0.35 }, start + 6.2);
}

function buildB09() {
  return dom(
    '<div class="formula-board sticker">' +
      '<div class="terms"><span class="term">P = 50 W</span><span class="term">E = 9.00×10³ J</span></div>' +
      '<p class="eq-live">t = E / P</p>' +
      '<p class="eq-live">t = (9.00×10³) / 50</p>' +
      '<div class="banner good">t = 180 s</div>' +
    "</div>"
  );
}

function tweensB09(tl, root, start) {
  enter(tl, all(root, ".term"), start + 0.25, { y: 12 }, { y: 0, stagger: 0.6, duration: 0.35 });
  enter(tl, all(root, ".eq-live")[0], start + 2.4, { y: 10 }, { y: 0, duration: 0.4 });
  enter(tl, all(root, ".eq-live")[1], start + 5.2, { y: 10 }, { y: 0, duration: 0.4 });
  enter(tl, must(root, ".banner"), start + 8.6, { scale: 1.25 }, { scale: 1, duration: 0.45, ease: "back.out(1.7)" });
  tl.to(must(root, ".banner"), { rotation: 8, duration: 1.4, yoyo: true, repeat: 1, ease: "power1.inOut" }, start + 10.4);
}

function buildB10() {
  return dom(
    '<div class="formula-board sticker">' +
      '<div class="banner sticker">金屬塊 · E = CΔT</div>' +
      '<div class="terms"><span class="term">C = 400 J °C⁻¹</span><span class="term">ΔT = 15.0 °C</span></div>' +
      '<p class="eq-live">(400)(15.0)</p>' +
      '<div class="banner good ans">E = 6.00×10³ J</div>' +
      '<div class="chip-box sticker note">C = m c</div>' +
    "</div>"
  );
}

function tweensB10(tl, root, start) {
  enter(tl, all(root, ".term"), start + 0.4, { x: -16 }, { x: 0, stagger: 1.2, duration: 0.4 });
  enter(tl, must(root, ".eq-live"), start + 4.2, { y: 8 }, { y: 0, duration: 0.35 });
  enter(tl, must(root, ".ans"), start + 7.4, { scale: 1.2 }, { scale: 1, duration: 0.45, ease: "back.out(1.7)" });
  enter(tl, must(root, ".note"), start + 11.2, { y: 10 }, { y: 0, duration: 0.35 });
  pulse(tl, must(root, ".ans"), start + 14.2);
}

function buildB11() {
  return dom(
    '<div>' +
      '<div class="split">' +
        '<div class="panel sticker"><h3>X · c 較細</h3><div class="bar-track"><div class="bar bar-x"></div></div><div class="thermo"><i class="tx"></i></div></div>' +
        '<div class="panel sticker"><h3>Y · c 較大</h3><div class="bar-track"><div class="bar bar-y"></div></div><div class="thermo"><i class="ty"></i></div></div>' +
      "</div>" +
      '<div class="banner sticker">同一 E、同一 m → ΔT = E / (m c) · X 升溫較大</div>' +
    "</div>"
  );
}

function tweensB11(tl, root, start) {
  tl.to(must(root, ".bar-x"), { width: "42%", duration: 1.1, ease: "power1.out" }, start + 0.4);
  tl.to(must(root, ".bar-y"), { width: "78%", duration: 1.1, ease: "power1.out" }, start + 0.4);
  tl.to(must(root, ".tx"), { height: "82%", duration: 2.4, ease: "power1.inOut" }, start + 2.2);
  tl.to(must(root, ".ty"), { height: "48%", duration: 2.4, ease: "power1.inOut" }, start + 2.2);
  enter(tl, must(root, ".banner"), start + 6.2, { y: 12 }, { y: 0, duration: 0.4 });
}

function buildB12() {
  return dom(
    '<div class="formula-board sticker">' +
      '<p class="eq-live">η = (m c ΔT) / (P t) × 100%</p>' +
      '<div class="bar-track"><div class="bar useful" style="background:#7DDE8A"></div><span class="bar-val">有用 mcΔT</span></div>' +
      '<div class="bar-track"><div class="bar input" style="background:#d9d3c7;width:100%"></div><span class="bar-val">輸入 Pt</span></div>' +
      '<div class="banner sticker">熱效率 = 有用 / 輸入 × 100% · 其餘是熱損失</div>' +
    "</div>"
  );
}

function tweensB12(tl, root, start) {
  enter(tl, must(root, ".eq-live"), start + 0.2, { y: 10 }, { y: 0, duration: 0.4 });
  tl.to(must(root, ".useful"), { width: "62%", duration: 2.2, ease: "power1.out" }, start + 1.6);
  enter(tl, must(root, ".banner"), start + 5.2, { y: 10 }, { y: 0, duration: 0.4 });
  pulse(tl, must(root, ".eq-live"), start + 8.6);
}

function buildB13() {
  return dom(
    '<div class="fmt-row">' +
      '<article class="fmt-card sticker"><h3>1</h3><p class="bad">c = C</p><p class="good">c ≠ C · 單位不同</p></article>' +
      '<article class="fmt-card sticker"><h3>2</h3><p class="bad">唔寫單位都得</p><p class="good">單位要寫清</p></article>' +
      '<article class="fmt-card sticker"><h3>3</h3><p class="bad">ΔT 只寫終溫或初溫</p><p class="good">ΔT = 終溫 − 初溫</p></article>' +
      '<article class="fmt-card sticker"><h3>4</h3><p class="bad">η 分子分母倒轉</p><p class="good">分子有用 · 分母輸入</p></article>' +
    "</div>"
  );
}

function tweensB13(tl, root, start) {
  var cards = all(root, ".fmt-card");
  enter(tl, cards, start + 0.15, { y: 20 }, { y: 0, stagger: 0.18, duration: 0.35 });
  cards.forEach(function (card, i) {
    var at = start + 1.6 + i * 3.6;
    tl.to(card.querySelector(".bad"), { backgroundColor: "#E23B3B", color: "#fff", duration: 0.3 }, at);
    enter(tl, card.querySelector(".good"), at + 1.2, { y: 8 }, { y: 0, duration: 0.3 });
    tl.to(card.querySelector(".good"), { backgroundColor: "#D6FF3F", duration: 0.25 }, at + 1.4);
  });
}

function buildB14() {
  return dom(
    '<div>' +
      '<div class="recap-row">' +
        '<article class="recap-panel sticker"><h3>c 與 C</h3><p>c：J kg⁻¹ °C⁻¹</p><p>C：J °C⁻¹</p><p>C = m c</p></article>' +
        '<article class="recap-panel sticker"><h3>能量公式</h3><p>E = mcΔT</p><p>E = CΔT</p></article>' +
        '<article class="recap-panel sticker"><h3>電熱 · 效率</h3><p>理想：Pt = mcΔT</p><p>η = 有用 / 輸入</p></article>' +
        '<article class="recap-panel sticker"><h3>ΔT</h3><p>ΔT = E / (m c)</p><p>c 愈細 · 升溫愈大</p></article>' +
      "</div>" +
      '<div class="stamp-wrap"><div class="stamp" style="color:#141414;border-color:#141414;background:#D6FF3F">純複習 · 記住單位同 ΔT</div></div>' +
    "</div>"
  );
}

function tweensB14(tl, root, start) {
  enter(tl, all(root, ".recap-panel"), start + 0.2, { y: 30 }, { y: 0, stagger: 1.5, duration: 0.45, ease: "power3.out" });
  enter(tl, must(root, ".stamp"), start + 8.2, { scale: 1.15 }, { scale: 1, duration: 0.4, ease: "back.out(1.6)" });
  pulse(tl, must(root, ".stamp"), start + 12.2);
}
