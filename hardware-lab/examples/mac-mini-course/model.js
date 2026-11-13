/* ===================== Mac mini (2024, M4): the numbers model and the 3D model =====================
   rest "floor": device frame x right, y forward (+y = the FRONT face, toward you), z up.
   Box: 127 (x) × 127 (y) × 50 (z) mm. Front sockets on +y, back sockets on -y, power button and vent on the bottom (z=0).
   Inside layout is approximate, from teardown photos. */
const BOX = { w:127, d:127, h:50, r:10 };
const HW = BOX.w / 2, HD = BOX.d / 2;
const ALU = "#d9dbdf", ALU_HI = "#e7e9ec", PORT = "#16171a", PCB = "#1f5533", COPPER = "#b16a38", DARK = "#2a2c30";

/* port placements on a face. [x, z, w(x), h(z)] in mm, centred on the face */
const FRONT = { usbc1:[-20, 20, 9, 3.4], usbc2:[-6, 20, 9, 3.4], jack:[16, 20, 0, 0] };   // jack is round
const BACK = { power:[-50, 22, 0, 0], eth:[-32, 20, 12, 10], hdmi:[-13, 20, 15, 6.5], tb1:[7, 20, 9, 3.4], tb2:[22, 20, 9, 3.4], tb3:[37, 20, 9, 3.4] };

/* ---------- build the aluminium box with its ports (chapter 1, real look) ---------- */
function buildBody(root, translucent){
  const alu = translucent
    ? new THREE.MeshStandardMaterial({ color:C(ALU), roughness:0.5, metalness:0.2, transparent:true, opacity:0.12, depthWrite:false })
    : mat(ALU, { roughness:0.45, metalness:0.55 });
  const body = mesh(slab(BOX.w, BOX.d, BOX.h, BOX.r, 2), alu, "body", 0, 0, 0);
  root.add(body);
  if (translucent) return body;                           // chapter 2 shows a see-through shell, no ports

  // a subtle darker top inset (the Apple logo area is left plain)
  root.add(mesh(slab(BOX.w - 10, BOX.d - 10, 0.4, BOX.r - 4), mat(ALU_HI, { roughness:0.4, metalness:0.6 }), "body", 0, 0, BOX.h));

  // FRONT sockets (+y face)
  const faceY = HD;
  const rectPort = (part, cx, cz, w, h, y, ny) => { const m = mesh(boxGeo(w, h, 3), mat(PORT, { metalness:0.3, roughness:0.5 }), part, cx, y - ny * 1.4, cz); root.add(m); return m; };
  rectPort("frontports", FRONT.usbc1[0], FRONT.usbc1[1], FRONT.usbc1[2], FRONT.usbc1[3], faceY, 1);
  rectPort("frontports", FRONT.usbc2[0], FRONT.usbc2[1], FRONT.usbc2[2], FRONT.usbc2[3], faceY, 1);
  root.add(mesh(new THREE.CylinderGeometry(1.9, 1.9, 3, 24), mat(PORT, { metalness:0.3, roughness:0.5 }), "frontports", FRONT.jack[0], faceY - 1.4, FRONT.jack[1]));   // round headphone jack (axis +y)

  // BACK sockets (-y face)
  const backY = -HD;
  root.add(mesh(new THREE.CylinderGeometry(4, 4, 3, 28), mat(PORT, { metalness:0.3, roughness:0.5 }), "backports", BACK.power[0], backY + 1.4, BACK.power[1]));   // round power socket
  rectPort("backports", BACK.eth[0], BACK.eth[1], BACK.eth[2], BACK.eth[3], backY, -1);
  rectPort("backports", BACK.hdmi[0], BACK.hdmi[1], BACK.hdmi[2], BACK.hdmi[3], backY, -1);
  rectPort("backports", BACK.tb1[0], BACK.tb1[1], BACK.tb1[2], BACK.tb1[3], backY, -1);
  rectPort("backports", BACK.tb2[0], BACK.tb2[1], BACK.tb2[2], BACK.tb2[3], backY, -1);
  rectPort("backports", BACK.tb3[0], BACK.tb3[1], BACK.tb3[2], BACK.tb3[3], backY, -1);

  // rear exhaust: a thin dark strip along the back, high up
  for (let i = 0; i < 9; i++) root.add(mesh(boxGeo(9, 3, 2.5), mat(DARK), "vent", -48 + i * 12, backY + 1.2, 40));

  // BOTTOM (z=0): round base vent, inner circle and the power button
  const baseZ = 0.4;
  root.add(mesh(arcGeo(0, 56, 0, 360, 0.8), mat("#c6c8cc", { roughness:0.5, metalness:0.4 }), "vent", 0, 0, -0.4));   // the recessed base rim
  root.add(mesh(arcGeo(30, 52, 0, 360, 0.6), mat(DARK), "vent", 0, 0, -0.5));                                        // the ring of intake holes
  root.add(mesh(arcGeo(0, 30, 0, 360, 0.5), mat("#17181b", { roughness:0.6 }), "vent", 0, 0, -0.5));                 // dark inner disc
  root.add(mesh(new THREE.CylinderGeometry(6, 6, 1.2, 28).rotateX(Math.PI / 2), mat("#3a3d42", { roughness:0.5 }), "powerbtn", 0, -40, -0.7));   // power button, toward the back
  return body;
}

/* ---------- the parts inside (chapter 2, coloured by job) ---------- */
function addInsideParts(m){
  const jc = id => jobColour(id);
  const board = m.layer("base", 0, { inner:true });
  const cool = m.layer("cool", 34);
  const power = m.layer("power", 70);

  // logic board, low in the box
  board.add(mesh(slab(104, 104, 2.4, 8), mat(translOff(jc("logicboard"))), "logicboard", 0, 0, 6));
  // the M4 chip in the middle, with its on-package memory beside it
  board.add(mesh(boxGeo(26, 26, 3.4), mat(jc("chip")), "chip", 0, 6, 8.4));
  board.add(mesh(boxGeo(11, 22, 3.2), mat(jc("memory")), "memory", -20, 6, 8.3));
  board.add(mesh(boxGeo(11, 22, 3.2), mat(jc("memory")), "memory", 20, 6, 8.3));
  // SSD module toward the front
  board.add(mesh(slab(34, 14, 2.6, 2), mat(jc("ssd")), "ssd", 0, -34, 7.8));
  // speaker toward a front corner
  board.add(mesh(boxGeo(22, 14, 9, 2), mat(jc("speaker")), "speaker", -34, -30, 10));
  // Wi-Fi/Bluetooth antenna strip near the back edge
  board.add(mesh(boxGeo(60, 5, 3), mat(jc("antenna")), "antenna", 0, 44, 8));

  // cooling: a fan disc and a copper heatsink over the chip
  cool.add(mesh(arcGeo(6, 30, 0, 360, 6), mat(translOff(jc("cooling"))), "cooling", 16, 8, 20));
  cool.add(mesh(boxGeo(30, 30, 5), mat(COPPER, { metalness:0.4, roughness:0.5 }), "cooling", -22, 8, 20));

  // power supply across the top
  power.add(mesh(slab(108, 58, 7, 4), mat(translOff(jc("psu"))), "psu", 0, -8, 40));
}
/* mix a job colour with grey, so the structural parts read as surfaces, not bright chips */
function translOff(hex){ const a = C(hex), g = C("#8c9099"); return "#" + a.lerp(g, 0.35).getHexString(); }

COURSE.models = {
  /* chapter 1: the box as it really looks */
  outside(root){
    buildBody(root, false);
    return {
      pose:{ yaw:-0.62, pitch:0.52 }, fit:{ h:150, w:172 },
      anchors:[
        { id:"body", p:[-40, 0, BOX.h], n:[0, 0, 1], min:0.2 },
        { id:"frontports", p:[-6, HD, 20], n:[0, 1, 0], min:0.25 },
        { id:"backports", p:[8, -HD, 20], n:[0, -1, 0], min:0.25 },
        { id:"vent", p:[0, 20, 0], n:[0, 0, -1], min:0.25 },
        { id:"vent", p:[0, -HD, 40], n:[0, -1, 0], min:0.3, only:true },
        { id:"powerbtn", p:[0, -40, -0.7], n:[0, 0, -1], min:0.25 }
      ]
    };
  },
  /* chapter 2: a see-through shell, the parts inside lifted apart */
  layers(root, m){
    const shell = m.layer("shell", 96);
    buildBody(shell, true);
    addInsideParts(m);
    return {
      pose:{ yaw:-0.62, pitch:0.42 }, fit:{ h:176, w:176 }, look:26,
      anchors:[
        { id:"body", p:[-50, 0, BOX.h], n:[0, 0, 1], min:0.2, only:true, layer:"shell" },
        { id:"psu", p:[0, -8, 43.5], n:[0, 0, 1], min:-1, layer:"power" },
        { id:"cooling", p:[-22, 8, 22.5], n:[0, 0, 1], min:-1, layer:"cool" },
        { id:"chip", p:[0, 6, 10], n:[0, 0, 1], min:-1, layer:"base" },
        { id:"memory", p:[20, 6, 9.9], n:[0, 0, 1], min:-1, layer:"base" },
        { id:"ssd", p:[0, -34, 9], n:[0, 0, 1], min:-1, layer:"base" },
        { id:"speaker", p:[-34, -30, 14.5], n:[0, 0, 1], min:-1, layer:"base" },
        { id:"antenna", p:[0, 44, 9.5], n:[0, 0, 1], min:-1, layer:"base" },
        { id:"logicboard", p:[40, -40, 7], n:[0, 0, 1], min:-1, layer:"base" }
      ]
    };
  },
  /* chapter 1, Big picture: the box on a desk, with everything it needs around it */
  scene(root, m){
    sceneDevice(root, COURSE.models.outside, m, { pos:[-130, 0, 30], rot:[-Math.PI / 2, 0, Math.PI], scale:0.7 });
    companion(root, "monitor", "monitor", { pos:[40, 0, -50], size:0.95 });
    companion(root, "keyboard", "keyboard", { pos:[30, 0, 90], size:1.05 });
    companion(root, "mouse", "mouse", { pos:[135, 0, 92], size:1 });
    companion(root, "socket", "powercord", { pos:[-230, 30, -70], size:1 });
    cable(root, "powercord", [[-230, 56, -64], [-214, 14, -40], [-170, 4, -20], [-140, 14, -14]]);
    cable(root, "monitor", [[-105, 14, -14], [-80, 5, -30], [-30, 4, -46], [10, 18, -54]]);
    const A = (id, p, n = [0, 0.5, 1]) => ({ id, p, n, min:-1 });
    return { scene:true, pose:{ yaw:0.1, pitch:0.42 }, orbit:{ yaw:[-0.6, 0.6], pitch:[0.2, 0.85] }, fit:{ h:250, w:640 },
      anchors:[A("body", [-130, 35, 30]), A("monitor", [100, 130, -50]), A("keyboard", [40, 6, 100]), A("mouse", [135, 8, 92]), A("powercord", [-230, 60, -66])] };
  }
};
