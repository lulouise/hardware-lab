/* ===================== 3D shapes: small helpers a course uses to build its model =====================
   Units are millimetres. Every mesh belongs to one part: mesh(geometry, material, partId, x, y, z).
   Three.js r128 (cdnjs). */
const HAS_THREE = typeof THREE !== "undefined";
const C = v => new THREE.Color(v || "#888");
const deg = d => d * Math.PI / 180, polar = (r, a) => [r * Math.cos(deg(a)), r * Math.sin(deg(a))];
function rrShape(w, h, r, cx = 0, cy = 0){
  const s2 = new THREE.Shape(), x = cx - w / 2, y = cy - h / 2;
  s2.moveTo(x + r, y); s2.lineTo(x + w - r, y); s2.quadraticCurveTo(x + w, y, x + w, y + r); s2.lineTo(x + w, y + h - r); s2.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s2.lineTo(x + r, y + h); s2.quadraticCurveTo(x, y + h, x, y + h - r); s2.lineTo(x, y + r); s2.quadraticCurveTo(x, y, x + r, y); return s2;
}
/* a rounded slab with optional round holes, spanning z 0..depth */
function slab(w, h, depth, r, bevel = 0, circles = []){
  const sh = rrShape(w - bevel * 2, h - bevel * 2, Math.max(0.1, r - bevel));
  circles.forEach(([cx, cy, cr]) => { const p = new THREE.Path(); p.absarc(cx, cy, cr, 0, Math.PI * 2, true); sh.holes.push(p); });
  const geo = new THREE.ExtrudeGeometry(sh, { depth:Math.max(0.01, depth - bevel * 2), bevelEnabled:bevel > 0, bevelThickness:bevel, bevelSize:bevel, bevelSegments:3, curveSegments:16 });
  geo.translate(0, 0, bevel); return geo;
}
/* a ring segment from angle a0 to a1 (degrees), radii r1..r2, spanning z 0..depth; a full circle when a1 - a0 >= 360 */
function arcGeo(r1, r2, a0, a1, depth){
  const sh = new THREE.Shape();
  if (a1 - a0 >= 360){ sh.absarc(0, 0, r2, 0, Math.PI * 2, false); if (r1 > 0){ const h = new THREE.Path(); h.absarc(0, 0, r1, 0, Math.PI * 2, true); sh.holes.push(h); } }
  else { sh.absarc(0, 0, r2, deg(a0), deg(a1), false); sh.absarc(0, 0, r1, deg(a1), deg(a0), true); sh.closePath(); }
  return new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled:false, curveSegments:48 });
}
const discGeo = (r, depth) => arcGeo(0, r, 0, 360, depth);
const cylZ = (r, h, seg = 32) => new THREE.CylinderGeometry(r, r, h, seg).rotateX(Math.PI / 2);   // axis along z
const cylX = (r, h, seg = 32) => new THREE.CylinderGeometry(r, r, h, seg).rotateZ(Math.PI / 2);   // axis along x
const boxGeo = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function mat(color, o = {}){ return new THREE.MeshStandardMaterial(Object.assign({ color:C(color), roughness:0.6, metalness:0.05 }, o)); }
function canvasTex(c){ const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = 4; return tx; }
/* printed text for a face (chip markings, "14.4 V") */
function textTexture(lines, { w = 256, h = 128, bg = null, fg = "#ffffff", size = 34, weight = 600 } = {}){
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d");
  if (bg){ g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `${weight} ${size}px "IBM Plex Mono", ui-monospace, monospace`;
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.25));
  return canvasTex(c);
}
const mats = m => Array.isArray(m.material) ? m.material : [m.material];
/* mark every mesh in obj as belonging to a part, with its own materials (so highlighting one part never touches another) */
function own(obj, part){ obj.traverse(m => { if (m.isMesh){ m.userData.part = part; m.material = Array.isArray(m.material) ? m.material.map(x => x.clone()) : m.material.clone(); m.userData.base = mats(m).map(x => ({ opacity:x.opacity, transparent:x.transparent })); } }); return obj; }
function mesh(geo, material, part, x = 0, y = 0, z = 0){ const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); return own(m, part); }
const jobColour = id => css("--" + PARTS[id].g);                          // a part's job colour, for the "coloured by job" models

/* ---------- a small scene for the Big picture: the device among simple drawings of what it works with ----------
   A scene is built upright: x right, y up (y = 0 is the table), z toward you. Return scene:true from the model.
   sceneDevice(root, build, m, { pos, rot, scale }) puts the course's own device model into the scene (give the real turn it needs).
   companion(kind, part, { pos, rotY, size }) adds a simple drawing, coloured by the part's job. Sizes are drawings, not to scale.
   cable(part, points) draws a cable through [x, y, z] points. */
function sceneDevice(root, build, m, { pos = [0, 0, 0], rot = [0, 0, 0], scale = 1 } = {}){
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.set(...rot); g.scale.setScalar(scale); root.add(g);
  build(g, m); return g;
}
const COMPANIONS = {
  monitor(g, c, part){ const dark = mat("#22252b", { roughness:0.4 }); g.add(mesh(boxGeo(200, 122, 7), mat(c, { roughness:0.5 }), part, 0, 92, 0)); g.add(mesh(boxGeo(188, 110, 1), dark, part, 0, 92, 4)); g.add(mesh(boxGeo(18, 34, 6), mat(c), part, 0, 20, -2)); g.add(mesh(boxGeo(70, 4, 44), mat(c), part, 0, 2, 0)); },
  keyboard(g, c, part){ g.add(mesh(boxGeo(130, 5, 46), mat(c), part, 0, 2.5, 0)); const key = mat("#fbfaf6"); for (let r = 0; r < 4; r++) for (let i = 0; i < 12; i++) g.add(mesh(boxGeo(8, 2, 8), key, part, -55 + i * 10, 6, -15 + r * 10)); },
  mouse(g, c, part){ const m2 = mesh(new THREE.SphereGeometry(13, 24, 16), mat(c), part, 0, 3, 0); m2.scale.set(0.8, 0.42, 1.2); g.add(m2); },
  laptop(g, c, part){ g.add(mesh(boxGeo(150, 6, 100), mat(c), part, 0, 3, 0)); const lid = new THREE.Group(); lid.position.set(0, 6, -50); lid.rotation.x = -0.22; lid.add(mesh(boxGeo(150, 96, 5), mat(c), part, 0, 48, 0)); lid.add(mesh(boxGeo(138, 84, 1), mat("#22252b", { roughness:0.4 }), part, 0, 48, 3)); g.add(lid); const key = mat("#fbfaf6"); g.add(mesh(boxGeo(130, 1, 50), key, part, 0, 6.5, -14)); },
  socket(g, c, part){ g.add(mesh(boxGeo(52, 52, 6), mat("#f3f0e8"), part, 0, 26, 0)); g.add(mesh(cylZ(16, 3), mat(c), part, 0, 26, 3.5)); g.add(mesh(cylZ(2.5, 2), mat("#22252b"), part, -6, 26, 5)); g.add(mesh(cylZ(2.5, 2), mat("#22252b"), part, 6, 26, 5)); },
  router(g, c, part){ g.add(mesh(boxGeo(90, 18, 60), mat(c), part, 0, 9, 0)); [-30, 30].forEach(x => g.add(mesh(new THREE.CylinderGeometry(2.4, 2.4, 60, 12), mat(c), part, x, 46, -22))); },
  battery(g, c, part){ g.add(mesh(boxGeo(70, 26, 44), mat(c), part, 0, 13, 0)); g.add(mesh(boxGeo(10, 10, 10), mat("#d9d4c6"), part, 0, 31, 0)); },
  sensor(g, c, part){ g.add(mesh(boxGeo(30, 4, 30), mat(c), part, 0, 2, 0)); g.add(mesh(cylZ(8, 8).rotateX(Math.PI / 2), mat("#fbfaf6"), part, 0, 8, 0)); },
  motor(g, c, part){ g.add(mesh(boxGeo(44, 36, 24), mat(c), part, 0, 18, 0)); g.add(mesh(new THREE.CylinderGeometry(6, 6, 10, 20), mat("#fbfaf6"), part, 10, 41, 0)); g.add(mesh(boxGeo(44, 4, 8), mat("#fbfaf6"), part, 22, 47, 0)); },
  breadboard(g, c, part){ g.add(mesh(boxGeo(170, 8, 58), mat("#f4f1e6"), part, 0, 4, 0)); const hole = mat("#8a8678"); for (let r = 0; r < 6; r++) for (let i = 0; i < 24; i++) g.add(mesh(boxGeo(2, 1, 2), hole, part, -76 + i * 6.6, 8.2, -18 + r * 7.2)); },
  box(g, c, part){ g.add(mesh(boxGeo(70, 50, 50), mat(c), part, 0, 25, 0)); }
};
function companion(root, kind, part, { pos = [0, 0, 0], rotY = 0, size = 1 } = {}){
  const g = new THREE.Group(); g.position.set(...pos); g.rotation.y = rotY; g.scale.setScalar(size); root.add(g);
  (COMPANIONS[kind] || COMPANIONS.box)(g, C(jobColour(part)).lerp(C("#ffffff"), 0.45), part); return g;
}
function cable(root, part, points, { r = 2.4, color = "#4b4f57" } = {}){
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  const m2 = mesh(new THREE.TubeGeometry(curve, 48, r, 8, false), mat(color, { roughness:0.7 }), part); root.add(m2); return m2;
}

