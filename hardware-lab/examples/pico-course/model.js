/* ===================== Raspberry Pi Pico: the numbers model and the 3D model =====================
   Board mm, measured from Raspberry Pi's front photo: x from the left edge (0–21), y from the top edge (0–51).
   Each part: centre x, centre y, width, height, height above the board (approximate). */
const BOARD = { w:21, h:51, t:1 };
const PIN_X = [10.5 - 8.89, 10.5 + 8.89], pinY = i => 1.37 + 2.54 * i;              // 17.78 mm row spacing, 2.54 mm pitch (datasheet)
const LEFT = ["GP0","GP1","GND","GP2","GP3","GP4","GP5","GND","GP6","GP7","GP8","GP9","GND","GP10","GP11","GP12","GP13","GND","GP14","GP15"];
const RIGHT = ["VBUS","VSYS","GND","3V3_EN","3V3","ADC_VREF","GP28","AGND","GP27","GP26","RUN","GP22","GND","GP21","GP20","GP19","GP18","GND","GP17","GP16"];
const pinGroup = n => /^GP2[678]$/.test(n) ? "adcPins" : /^GP/.test(n) ? "gpPins" : /GND/.test(n) ? "gndPins" : "pwrPins";
const LAYOUT = {
  usb:[10.5, 1.4, 7.8, 5.6, 2.6], led:[4.8, 4.8, 1.6, 0.8, 0.5], bootsel:[7.0, 11.6, 3.2, 4.8, 1.2],
  flash:[6.7, 18.9, 2.2, 3.4, 0.6], brain:[10.5, 25.7, 7, 7, 0.9], crystal:[8.1, 34.3, 3.2, 2.5, 0.8],
  regulator:[13.4, 10.6, 2.6, 2.6, 0.8], coil:[16.6, 10.7, 2.5, 2.8, 1.2], diode:[16.6, 6.4, 1.7, 3.8, 1.0]
};
const HELPERS = [[13.3, 8.2, 2.6, 1.2], [13.4, 13.2, 2.6, 1.2], [11.6, 21, 1, 0.5], [12.8, 21, 1, 0.5], [14, 21, 1, 0.5], [15.2, 21, 1, 0.5], [16.4, 21, 1, 0.5],
  [17.6, 25.4, 1, 0.5], [17.6, 26.8, 1, 0.5], [5.4, 23.2, 1, 0.5], [5.4, 27.6, 1, 0.5], [10, 31.6, 1, 0.5], [11.4, 31.6, 1, 0.5], [16.2, 15.6, 1, 0.5],
  [16.8, 17.4, 1.4, 1.2], [5.4, 16.2, 0.5, 1], [10.6, 7.6, 1, 0.5], [10.6, 9.2, 1, 0.5]];
const HOLES = [[4.7, 2.0], [16.3, 2.0], [4.7, 49.0], [16.3, 49.0]], HOLE_R = 1.05;
const DEBUG = [[8.3, "SWDIO"], [10.5, "GND"], [12.7, "SWCLK"]], DEBUG_Y = 50.0;
const TESTPADS = [[10.55, 4.2, "TP1"], [12.6, 1.0, "TP2"], [9.6, 1.0, "TP3"], [7.9, 7.8, "TP4"], [7.9, 10.3, "TP5"], [7.9, 12.7, "TP6"]];   // front-view x

/* ---------- 3D (rest "flat": x right, y toward the top edge, z out of the parts side) ---------- */
const B3 = (x, y) => [-BOARD.w / 2 + x, BOARD.h / 2 - y];        // board mm → 3D
const PCB_REAL = "#2f7d45", CHIP_REAL = "#1b1c1f", GOLD = "#c9a65a", SILK = "#f4f4ee";

/* the printed white text (silkscreen), drawn on a canvas at 20 px per mm */
function silkTexture(side){
  const k = 20, c = document.createElement("canvas"); c.width = BOARD.w * k; c.height = BOARD.h * k; const g = c.getContext("2d");
  g.fillStyle = SILK; g.strokeStyle = SILK; g.textBaseline = "middle";
  const txt = (s, x, y, size, align = "center", rot = 0) => { g.save(); g.translate(x * k, y * k); g.rotate(rot); g.textAlign = align; g.font = `600 ${size * k}px "IBM Plex Mono", ui-monospace, monospace`; g.fillText(s, 0, 0); g.restore(); };
  if (side === "front"){
    txt("1", 2.9, pinY(0), 1.1); txt("2", 2.9, pinY(1), 1.1); txt("39", 17.6, pinY(1), 1.1);
    txt("LED", 4.8, 6.1, 1.1); txt("USB", 10.5, 5.9, 1.1); txt("BOOTSEL", 4.3, 11.8, 1.0, "center", -Math.PI / 2);
    txt("DEBUG", 11.6, 47.4, 1.1); txt("© 2020", 4.3, 26.5, 1.0, "center", -Math.PI / 2);
    txt("Raspberry Pi Pico", 4.3, 38.6, 1.25, "center", -Math.PI / 2);
    // the raspberry logo, simplified to circles
    [[10.5, 37.6], [9.2, 38.6], [11.8, 38.6], [10.5, 39.8], [9.2, 41], [11.8, 41], [10.5, 42.2]].forEach(([x, y]) => { g.lineWidth = 0.18 * k; g.beginPath(); g.arc(x * k, y * k, 0.62 * k, 0, Math.PI * 2); g.stroke(); });
  } else {                                                                     // as seen from behind: the right-hand pins are on the left
    const nearHole = i => i < 2 || i > 17;                                     // the corner screw holes sit beside these rows
    RIGHT.forEach((n, i) => txt(n, nearHole(i) ? 6.9 : 3.1, pinY(i), 0.95, "left")); LEFT.forEach((n, i) => txt(n, nearHole(i) ? 14.1 : 17.9, pinY(i), 0.95, "right"));
    TESTPADS.forEach(([x, y, n]) => { const bx = BOARD.w - x; g.fillStyle = GOLD; g.fillRect((bx - 0.55) * k, (y - 0.55) * k, 1.1 * k, 1.1 * k); g.fillStyle = SILK; txt(n, bx - 1.2, y + 0.05, 0.8, "right"); });
    DEBUG.forEach(([x, n]) => txt(n, BOARD.w - x, 43.6, 0.85, "center", -Math.PI / 2));
  }
  return canvasTex(c);
}
/* the bare board with its 40 legs, screw holes and helper pads: shared by both chapters */
function buildBoard(root, pcbColor){
  const g = new THREE.Group(); root.add(g);
  const hole = HOLES.map(([x, y]) => [...B3(x, y), HOLE_R]);
  g.add(mesh(slab(BOARD.w, BOARD.h, BOARD.t, 0.6, 0, hole), mat(pcbColor, { roughness:0.7 }), "board", 0, 0, -BOARD.t / 2));
  const gold = mat(GOLD, { metalness:0.75, roughness:0.35 });
  const ring = new THREE.RingGeometry(0.45, 0.85, 20), disk = new THREE.CircleGeometry(0.45, 16);
  const pad = (part, x, y) => {
    const [cx, cy] = B3(x, y);
    for (const z of [1, -1]){ const r = mesh(ring, gold, part, cx, cy, z * (BOARD.t / 2 + 0.02)); if (z < 0) r.rotation.y = Math.PI; g.add(r);
      const d = mesh(disk, mat("#0c120e"), part, cx, cy, z * (BOARD.t / 2 + 0.015)); if (z < 0) d.rotation.y = Math.PI; g.add(d); }
  };
  [0, 1].forEach(side => { for (let i = 0; i < 20; i++){ pad("pins", PIN_X[side], pinY(i));
    const [cx, cy] = B3(side ? BOARD.w : 0, pinY(i)); g.add(mesh(new THREE.BoxGeometry(0.06, 1.3, BOARD.t), gold, "pins", cx + (side ? 0.03 : -0.03), cy, 0)); } });
  DEBUG.forEach(([x]) => pad("debug", x, DEBUG_Y));
  HOLES.forEach(([x, y]) => { const [cx, cy] = B3(x, y); for (const z of [1, -1]){ const r = mesh(new THREE.RingGeometry(HOLE_R, HOLE_R + 0.9, 24), mat("#d8c98e", { roughness:0.5 }), "holes", cx, cy, z * (BOARD.t / 2 + 0.02)); if (z < 0) r.rotation.y = Math.PI; g.add(r); } });
  const front = mesh(new THREE.PlaneGeometry(BOARD.w, BOARD.h), new THREE.MeshBasicMaterial({ map:silkTexture("front"), transparent:true, depthWrite:false }), "board", 0, 0, BOARD.t / 2 + 0.01); g.add(front);
  const back = mesh(new THREE.PlaneGeometry(BOARD.w, BOARD.h), new THREE.MeshBasicMaterial({ map:silkTexture("back"), transparent:true, depthWrite:false }), "names", 0, 0, -BOARD.t / 2 - 0.01); back.rotation.y = Math.PI; g.add(back);
  TESTPADS.forEach(([x, y]) => { const [cx, cy] = B3(x, y); const tp = mesh(new THREE.PlaneGeometry(1.1, 1.1), mat(GOLD, { metalness:0.7, roughness:0.35 }), "testpads", cx, cy, -BOARD.t / 2 - 0.03); tp.rotation.y = Math.PI; g.add(tp); });
  return g;
}
/* the parts on top. real = true: as they really look (chapter 1); false: coloured by job, with names (chapter 2) */
function addParts(group, real){
  const top = BOARD.t / 2, L = LAYOUT, jc = id => css("--" + PARTS[id].g);
  const box = (id, key, color, label, opts = {}) => {
    const [x, y, w, h, d] = L[key], [cx, cy] = B3(x, y);
    const side = mat(color, opts.m || {});
    const face = label ? new THREE.MeshStandardMaterial({ map:textTexture([label], { w:256, h:Math.max(64, Math.round(256 * h / w)), bg:"#" + C(color).getHexString(), fg:opts.fg || "#ffffff", size:opts.size || 44 }), roughness:0.6 }) : side;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, face, side]); m.position.set(cx, cy, top + d / 2); own(m, id); group.add(m); return m;
  };
  const metal = { m:{ metalness:0.8, roughness:0.3 } };
  box("usb", "usb", real ? "#b9bdc3" : jc("usb"), real ? "" : "USB", real ? metal : { size:60 });
  { const [cx, cy] = B3(10.5, -1.35); group.add(mesh(new THREE.BoxGeometry(6.2, 0.2, 1.7), mat("#0b0b0c"), "usb", cx, cy, top + 1.3)); }
  const led = box("led", "led", real ? "#f2efe4" : jc("led"), "");
  box("bootsel", "bootsel", real ? "#cfd2d6" : jc("bootsel"), "", real ? metal : {});
  { const [cx, cy] = B3(7.0, 11.6); const cap = mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.7, 24), mat(real ? "#f4f2ec" : "#ffffff"), "bootsel", cx, cy, top + 1.55); cap.rotation.x = Math.PI / 2; group.add(cap); }
  box("flash", "flash", real ? CHIP_REAL : jc("flash"), real ? "" : "2 MB", { size:40 });
  box("brain", "brain", real ? CHIP_REAL : jc("brain"), "RP2040", { size:40, fg:real ? "#c9c4b8" : "#ffffff" });
  box("crystal", "crystal", real ? "#c7cacf" : jc("crystal"), "12.0", real ? { size:56, fg:"#3a3d42", m:{ metalness:0.8, roughness:0.3 } } : { size:56 });
  box("regulator", "regulator", real ? CHIP_REAL : jc("regulator"), "");
  box("regulator", "coil", real ? "#2b2c2f" : jc("regulator"), "");
  box("diode", "diode", real ? CHIP_REAL : jc("diode"), "");
  HELPERS.forEach(([x, y, w, h]) => { const [cx, cy] = B3(x, y); group.add(mesh(new THREE.BoxGeometry(w, h, 0.45), mat(real ? (w > 2 ? "#b88a4a" : "#3a3a3a") : jc("helpers")), "helpers", cx, cy, top + 0.23)); });
  return led;
}

COURSE.models = {
  /* chapter 1: the board as it really looks */
  outside(root){
    buildBoard(root, PCB_REAL);
    const led = addParts(root, true); led.userData.glow = true;                // the light glows on its own; no tap highlight
    const top = BOARD.t / 2, A = (id, x, y, z, n, min = 0.2) => { const [cx, cy] = B3(x, y); return { id, p:[cx, cy, z], n, min }; };
    return {
      pose:{ yaw:-0.45, pitch:0.5 }, fit:{ h:46, w:26 },
      anchors:[
        A("usb", 10.5, -1.4, top + 1.3, [0, 1, 0], 0.3), A("usb", 13.5, 1.4, top + 2.6, [0, 0, 1], 0.5),
        A("led", 4.8, 4.8, top + 0.5, [0, 0, 1]), A("bootsel", 7.0, 11.6, top + 1.9, [0, 0, 1]),
        A("brain", 12.5, 27.5, top + 0.9, [0, 0, 1]), A("pins", PIN_X[0], pinY(15), top, [0, 0, 1]), A("pins", PIN_X[1], pinY(15), -top, [0, 0, -1]),
        A("pins", 0, pinY(9), 0, [-1, 0, 0], 0.4), A("pins", BOARD.w, pinY(9), 0, [1, 0, 0], 0.4),
        A("debug", 10.5, 51, 0, [0, -1, 0], 0.3), A("debug", 12.7, DEBUG_Y, top, [0, 0, 1], 0.5),
        A("holes", 16.3, 49.0, top, [0, 0, 1]), A("board", 15.5, 42, top, [0, 0, 1]),
        A("names", 3.1, pinY(4), -top, [0, 0, -1]), A("testpads", 7.9, 10.3, -top, [0, 0, -1]), A("board", 10.5, 40, -top, [0, 0, -1])
      ],
      tick(time){ const k = isStill() ? 0.8 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 3)); led.material.forEach(x => { if (x.emissive){ x.emissive.copy(C("#fff3c4")); x.emissiveIntensity = k; } }); }
    };
  },
  /* chapter 2: the parts lift off the board */
  layers(root, m){
    const brd = m.layer("board", 0); buildBoard(brd, PCB_REAL);
    // the metal pads each part is soldered onto (shapes approximate)
    const padMat = mat(GOLD, { metalness:0.7, roughness:0.35 });
    Object.entries(LAYOUT).forEach(([k, [x, y, w, h]]) => { const [cx, cy] = B3(x, y); brd.add(mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.92), padMat, "board", cx, cy, BOARD.t / 2 + 0.03)); });
    HELPERS.forEach(([x, y, w, h]) => { const [cx, cy] = B3(x, y); brd.add(mesh(new THREE.PlaneGeometry(w, h), padMat, "board", cx, cy, BOARD.t / 2 + 0.03)); });
    addParts(m.layer("parts", 12), false);
    const top = BOARD.t / 2;
    const chipA = (id, key, only = false) => { const [x, y, , , d] = LAYOUT[key]; const [cx, cy] = B3(x, y); return { id, p:[cx, cy, top + d], n:[0, 0, 1], min:-1, only, layer:"parts" }; };
    return {
      pose:{ yaw:-0.6, pitch:0.45 }, fit:{ h:50, w:30 },
      anchors:[
        chipA("usb", "usb"), chipA("led", "led"), chipA("bootsel", "bootsel"), chipA("flash", "flash"), chipA("brain", "brain"),
        chipA("crystal", "crystal"), chipA("regulator", "coil"), chipA("diode", "diode"),
        { id:"helpers", p:[...B3(14, 21), top + 0.45], n:[0, 0, 1], min:-1, layer:"parts" },
        { id:"board", p:[...B3(15.5, 44), top], n:[0, 0, 1], min:-1, layer:"board" },
        { id:"pins", p:[...B3(PIN_X[0], pinY(14)), top], n:[0, 0, 1], min:-1, layer:"board" }
      ]
    };
  },
  /* chapter 1, Big picture: the board among the things it works with */
  scene(root, m){
    sceneDevice(root, COURSE.models.outside, m, { pos:[0, 10, 10], rot:[-Math.PI / 2, 0, Math.PI / 2], scale:2 });
    companion(root, "breadboard", "breadboard", { pos:[0, 0, 12], size:1 });
    companion(root, "laptop", "computer", { pos:[0, 0, -130], size:0.8 });
    companion(root, "sensor", "lightSensor", { pos:[-190, 0, 40], size:1.5 });
    companion(root, "motor", "servo", { pos:[190, 0, 30], size:1.3 });
    companion(root, "battery", "battery", { pos:[60, 0, 110], size:0.8 });
    cable(root, "computer", [[-50, 6, -80], [-82, 8, -46], [-72, 12, -10], [-58, 14, 10]]);
    cable(root, "jumpers", [[-165, 6, 40], [-130, 26, 40], [-60, 16, 24]], { r:1.5, color:"#3f67b6" });
    cable(root, "jumpers", [[165, 8, 30], [120, 26, 32], [60, 16, 24]], { r:1.5, color:"#2f8a5b" });
    cable(root, "jumpers", [[60, 26, 94], [52, 22, 62], [30, 16, 30]], { r:1.5, color:"#c9772d" });
    const A = (id, p, n = [0, 1, 0.4]) => ({ id, p, n, min:-1 });
    return { scene:true, pose:{ yaw:0, pitch:0.55 }, orbit:{ yaw:[-0.5, 0.5], pitch:[0.3, 0.95] }, fit:{ h:215, w:400 },
      anchors:[A("computer", [30, 60, -150]), A("brain", [0, 14, 10]), A("lightSensor", [-190, 12, 40]), A("servo", [205, 50, 30]), A("battery", [60, 22, 110]), A("breadboard", [-70, 8, 34])] };
  }
};
