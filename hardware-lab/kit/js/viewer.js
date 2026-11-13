/* ===================== the 3D viewer: drag to turn, zoom, labels that follow, layers, turn-to-part =====================
   A course gives COURSE.rest (how the device rests) and COURSE.models: { name: build(root, m) }.
   build() adds meshes to root, in the device's own frame (see RESTS), and returns:
     pose:{ yaw, pitch }            the starting turn (radians)
     fit:{ h, w, minK }             how much to show: h = height and w = width in mm that must fit (any size, chip to robot);
                                    minK = smallest px per mm (optional). Leave fit out to fit the model's bounding box.
     anchors:[{ id, p, n, min, only, layer, face }]
                                    label points: p = point, n = which way the label's surface faces (both in the device frame);
                                    the label shows when n faces you by at least min (-1 = always); only = shown only when tapped
                                    (keeps about 10 labels per view); layer = the layer it rides on; face = which way to turn
                                    to show the part, if not n (e.g. brushes under a robot)
     tick(time, dt)                 optional animation (a blinking light); return true while it still moves
     look                           how far to pan the camera up (optional). Leave it out: the view keeps the model centred,
                                    also while its layers spread
     scene:true                     a small scene, not the device: build it upright (x right, y up, z toward you), whatever
                                    COURSE.rest is. See sceneDevice() and companion() in shapes3d.js
     orbit:{ yaw:[a, b], pitch:[c, d] }   limits on dragging (radians), for a scene that only needs to turn a little
   m.layer(name, spread, { inner }) makes a layer group that lifts by `spread` mm along the device's up axis when the
   learner spreads the layers. inner = it sits inside, so picking one of its parts opens the layers. */

/* how the device rests: its frame, the turn presets' names, and how the frame maps to the screen (x right, y up, z toward you) */
const RESTS = {
  stands:{ // stands up like a phone on its edge. Frame: x right, y up, z out of its front
    toView:p => p, rot:null,
    names:{ front:["Front","正面"], back:["Back","背面"], top:["Top","顶部"], bottom:["Bottom","底部"], left:["Left side","左侧"], right:["Right side","右侧"] },
    zoom:{ top:1.8, bottom:1.8, left:1.8, right:1.8 } },
  flat:{   // lies flat like a board on a table, shown like a picture held up. Frame: x right, y toward its top edge, z up (its parts side)
    toView:p => p, rot:null,
    names:{ front:["Front","正面"], back:["Back","背面"], top:["Top edge","顶边"], bottom:["Bottom edge","底边"], left:["Left edge","左边"], right:["Right edge","右边"] },
    zoom:{ top:1.8, bottom:1.8, left:1.8, right:1.8 } },
  floor:{  // sits on the floor like a robot, front toward you. Frame: x right, y forward, z up
    toView:([x, y, z]) => [-x, z, y], rot:[-Math.PI / 2, 0, Math.PI],
    names:{ top:["From above","俯视"], bottom:["Underneath","底部"], front:["Front","正前方"], left:["Side","侧面"], right:["Side","侧面"], back:["Back","后面"] },
    zoom:{} }
};
const REST = () => RESTS[COURSE.rest || "stands"];
const PRESETS = { front:[0, 0], back:[Math.PI, 0], top:[0, Math.PI / 2], bottom:[0, -Math.PI / 2], left:[Math.PI / 2, 0], right:[-Math.PI / 2, 0] };
const presetName = k => k === "angle" ? t("vAngle") : COURSE.ui && COURSE.ui["v_" + k] ? t("v_" + k) : tz(...REST().names[k]);

let renderer = null, viewer = null;
function getRenderer(){
  if (renderer) return renderer;
  try{ renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true }); }catch(_){ renderer = null; return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0x000000, 0);
  return renderer;
}

function createViewer(host, kind){
  const r = getRenderer();
  if (!r){ host.innerHTML = `<div class="v3-fallback">${esc(t("noGL"))}</div>`; return null; }
  const canvasHost = host.querySelector(".v3-canvas"), lines = host.querySelector(".v3-lines"), labelsEl = host.querySelector(".v3-labels");
  canvasHost.appendChild(r.domElement);
  const canvas = r.domElement;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(22, 1, 1, 4000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6f6a62, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 0.7); key.position.set(40, 70, 110); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.35); fill.position.set(-80, -30, 50); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.45); rim.position.set(0, 40, -120); scene.add(rim);
  const model = new THREE.Group(); scene.add(model);
  const rest = REST(), device = new THREE.Group(); if (rest.rot) device.rotation.set(...rest.rot); model.add(device);
  const layers = {};
  const m = { rest:COURSE.rest, layer(name, spread, o = {}){ const g = new THREE.Group(); device.add(g); layers[name] = { group:g, spread, inner:!!o.inner }; return g; } };
  const built = COURSE.models[kind](device, m);
  if (built.scene) device.rotation.set(0, 0, 0);
  const toView = built.scene ? (p => p) : rest.toView;
  const hasLayers = Object.keys(layers).length > 0;
  let spreadNow = 0;
  const lift = () => { for (const L of Object.values(layers)) L.group.position.z = L.spread * spreadNow; };
  const anchors = built.anchors.map(a => Object.assign({}, a, { p:toView(a.p), n:toView(a.n), f:toView(a.face || a.n) }));
  const fit = built.fit || (() => { const b = new THREE.Box3().setFromObject(device), s = new THREE.Vector3(); b.getSize(s); const h = 0.88 * Math.max(s.x, s.y, s.z); return { h, w:Math.max(0.9 * Math.max(s.x, s.z), 0.5 * h) }; })();
  const saved = S.pose[kind] || built.pose;
  const st = { yaw:saved.yaw, pitch:saved.pitch, ty:saved.yaw, tp:saved.pitch, speed:6, zoom:saved.zoom || 1, tz:saved.zoom || 1, uz:saved.uz || 1, uzv:saved.uz || 1 };
  const ZMIN = 0.6, ZMAX = 3, setZoom = v => { st.uz = clamp(v, ZMIN, ZMAX); kick(); };
  const pickables = []; model.traverse(o => { if (o.isMesh) pickables.push(o); });
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0), qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  const applyPose = () => { qa.setFromAxisAngle(X, st.pitch); qb.setFromAxisAngle(Y, st.yaw); model.quaternion.copy(qa).multiply(qb); };
  anchors.forEach((a, i) => {
    const b = document.createElement("button"); b.className = "l3"; b.type = "button"; b.dataset.part = a.id; b.hidden = true;
    b.style.cssText = col(PARTS[a.id].g); b.classList.toggle("ext", !!PARTS[a.id].ext);
    labelsEl.appendChild(b); a.el = b; a.key = i;
  });
  function writeLabels(){ anchors.forEach(a => { const p = P(a.id); a.el.innerHTML = `<b>${esc(p.lab)}</b><span>${esc(p.sub)}</span>`; a.el.setAttribute("aria-label", p.lab); a.w = 0; }); }
  writeLabels();

  /* ---------- pointer: drag to turn, pinch or wheel to zoom, tap to pick ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null, moved = 0;
  const pick = (cx, cy) => { const b = canvas.getBoundingClientRect(); ndc.set((cx - b.left) / b.width * 2 - 1, -(cy - b.top) / b.height * 2 + 1); ray.setFromCamera(ndc, camera);
    for (const h of ray.intersectObjects(pickables, false)){ const o = h.object; if (o.userData.hidden || o.userData.base[0].opacity < 0.3) continue; return o.userData.part; } return null; };
  const pts = new Map(); let pinch = 0;
  const gap = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
  const onDown = e => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pts.size === 2){ pinch = gap(); down = null; moved = 99; return; }
    down = { x:e.clientX, y:e.clientY }; moved = 0; st.speed = 18; canvas.classList.add("drag"); };
  const onWheel = e => { e.preventDefault(); setZoom(st.uz * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0016))); };
  const onMove = e => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pts.size === 2 && pinch){ const d = gap(); setZoom(st.uz * d / pinch); pinch = d; return; }
    if (down){ const dx = e.clientX - down.x, dy = e.clientY - down.y; down = { x:e.clientX, y:e.clientY }; moved += Math.abs(dx) + Math.abs(dy);
      st.ty += dx * 0.0095; st.tp = Math.max(-1.55, Math.min(1.55, st.tp + dy * 0.0095));
      if (built.orbit){ const o = built.orbit; if (o.yaw) st.ty = clamp(st.ty, o.yaw[0], o.yaw[1]); if (o.pitch) st.tp = clamp(st.tp, o.pitch[0], o.pitch[1]); }
      if (st.tz !== 1 && Math.abs(st.tp) < 1.1) st.tz = 1; kick(); return; }
    if (e.pointerType === "mouse"){ const id = pick(e.clientX, e.clientY); if (id !== S.hover){ S.hover = id; canvas.classList.toggle("point", !!id); kick(); } }
  };
  const onUp = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (!down) return; down = null; canvas.classList.remove("drag"); if (moved < 6){ const id = pick(e.clientX, e.clientY); if (id) select(id, true); } };
  const onLeave = () => { if (S.hover){ S.hover = null; kick(); } };
  canvas.addEventListener("pointerdown", onDown); canvas.addEventListener("pointermove", onMove); canvas.addEventListener("pointerup", onUp); canvas.addEventListener("pointercancel", onUp); canvas.addEventListener("pointerleave", onLeave); canvas.addEventListener("wheel", onWheel, { passive:false });

  /* ---------- size: fit any device, from a chip to a robot, by both height and width ---------- */
  let W = 1, H = 1;
  const resize = () => { const b = host.getBoundingClientRect(); W = Math.max(1, b.width); H = Math.max(1, b.height); r.setSize(W, H, false); camera.aspect = W / H; kick(); };
  let lookY = built.look || 0;   // the camera follows the model's middle, so a spread (top-heavy) model stays centred; labels pan with it
  const centre = new THREE.Box3(), follow = k => { if (built.look !== undefined) return; centre.setFromObject(model); lookY += ((centre.min.y + centre.max.y) / 2 - lookY) * k; };
  const placeCamera = () => { const k = st.zoom * st.uzv * Math.max(fit.minK || 0, Math.min(H * 0.8 / fit.h, (W - (W < 560 ? 220 : 330)) / (fit.w * 0.62)));
    camera.position.set(0, lookY, H / (2 * k * Math.tan(camera.fov * Math.PI / 360))); camera.lookAt(0, lookY, 0); camera.updateProjectionMatrix(); };
  const ro = new ResizeObserver(resize); ro.observe(host);

  /* ---------- colour filter and highlight: other colours' parts are hidden (a faint ghost, not tappable) ---------- */
  const outlines = [];
  function marks(){
    const keep = COURSE.filterKeep || [];
    pickables.forEach(o => {
      const id = o.userData.part, g = PARTS[id].g;
      const dim = S.filter && g !== S.filter, on = S.selected === id || S.hover === id;
      /* the spotlight: the chosen part glows and everything else fades, so the eye goes straight to it (and it shows through what covers it) */
      const fade = !dim && S.selected && S.selected !== id, ghost = hasLayers ? 0.16 : 0.4;
      o.userData.hidden = !!dim;
      mats(o).forEach((mt, i) => {
        const base = o.userData.base[i], thin = dim || fade;
        mt.transparent = thin || base.transparent; mt.opacity = dim ? (keep.includes(id) ? 0.28 : 0.1) : fade ? Math.min(base.opacity, ghost) : base.opacity; mt.depthWrite = !thin && !base.transparent;
        if (mt.emissive && !o.userData.glow){ mt.emissive.copy(on ? C(css("--" + g)) : C("#000000")); mt.emissiveIntensity = S.selected === id ? 0.6 : 0.25; }
        mt.needsUpdate = true;
      });
    });
    /* a crisp outline in the part's colour, drawn over everything, so even a small part can't be missed */
    outlines.forEach(l => { l.parent.remove(l); l.geometry.dispose(); l.material.dispose(); }); outlines.length = 0;
    if (S.selected) pickables.filter(o => o.userData.part === S.selected).slice(0, 40).forEach(o => {
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 35), new THREE.LineBasicMaterial({ color:C(css("--" + PARTS[S.selected].g)), depthTest:false, transparent:true }));
      l.renderOrder = 10; o.add(l); outlines.push(l); });
    anchors.forEach(a => a.el.classList.toggle("on", a.id === S.selected));
    kick();
  }

  /* ---------- labels: one per part (the best-facing anchor), stacked in a column on each side, leader lines to the part ---------- */
  const v = new THREE.Vector3(), n = new THREE.Vector3(), camDir = new THREE.Vector3(), bbox = new THREE.Box3(), corner = new THREE.Vector3(), up = new THREE.Vector3();
  const layerLift = a => a.layer && layers[a.layer] ? layers[a.layer].spread * spreadNow : 0;
  function layout(){
    model.updateMatrixWorld(true);
    bbox.setFromObject(model);
    let minX = Infinity, maxX = -Infinity;
    for (let i = 0; i < 8; i++){ corner.set(i & 1 ? bbox.max.x : bbox.min.x, i & 2 ? bbox.max.y : bbox.min.y, i & 4 ? bbox.max.z : bbox.min.z).project(camera);
      const sx = (corner.x + 1) / 2 * W; minX = Math.min(minX, sx); maxX = Math.max(maxX, sx); }
    const cx = (minX + maxX) / 2;
    const best = {};
    anchors.forEach(a => {
      a.vis = false;
      if (a.only && S.selected !== a.id && S.hover !== a.id) return;
      if (S.filter && PARTS[a.id].g !== S.filter) return;
      v.set(...a.p); const d = layerLift(a); if (d){ up.set(...rest.toView([0, 0, d])); v.add(up); }
      v.applyMatrix4(model.matrixWorld);
      n.set(...a.n).applyQuaternion(model.quaternion);
      camDir.copy(camera.position).sub(v).normalize();
      const facing = n.dot(camDir);
      if (facing < (a.min ?? 0.2)) return;
      const pr = v.clone().project(camera);
      a.sx = (pr.x + 1) / 2 * W; a.sy = (1 - pr.y) / 2 * H; a.facing = facing;
      const prev = best[a.id];
      if (!prev || (!a.only && prev.only) || (prev.only === a.only && facing > prev.facing)) best[a.id] = a;
    });
    Object.values(best).forEach(a => { a.vis = true; });
    const narrow = W < 560;
    const leftCol = Math.max(8, minX - (narrow ? 12 : 30)), rightCol = Math.min(W - 8, maxX + (narrow ? 12 : 30));
    const sides = { l:[], r:[] };
    anchors.forEach(a => { if (a.el.hidden === a.vis) a.el.hidden = !a.vis; if (a.vis) ((built.sideByX !== false ? a.p[0] < 0 === Math.cos(st.yaw) > 0 : a.sx < cx) ? sides.l : sides.r).push(a); });
    let paths = "";
    for (const [side, list] of Object.entries(sides)){
      list.sort((p, q) => p.sy - q.sy);
      let y = -Infinity;
      list.forEach(a => { if (!a.w){ a.w = a.el.offsetWidth; a.h = a.el.offsetHeight || 34; } a.ly = Math.max(a.sy, y + a.h + 6); y = a.ly; });
      const over = y + 20 - H; if (over > 0) list.forEach(a => { a.ly -= over; });
      list.forEach(a => {
        const colX = side === "l" ? leftCol : rightCol;
        const lx = side === "l" ? Math.max(4, colX - a.w) : Math.min(W - a.w - 4, colX);
        a.el.classList.toggle("left", side === "l"); a.el.classList.toggle("right", side === "r");
        a.el.style.transform = `translate(${lx.toFixed(1)}px, ${(a.ly - a.h / 2).toFixed(1)}px)`;
        const ex = side === "l" ? lx + a.w : lx;
        const c = `var(--${PARTS[a.id].g})`;
        paths += `<path d="M${a.sx.toFixed(1)} ${a.sy.toFixed(1)}L${(ex + (side === "l" ? 10 : -10)).toFixed(1)} ${a.ly.toFixed(1)}L${ex.toFixed(1)} ${a.ly.toFixed(1)}" style="stroke:${c}"/><circle class="e" cx="${a.sx.toFixed(1)}" cy="${a.sy.toFixed(1)}" r="3.4" style="fill:var(--card);stroke:${c}"/>`;
      });
    }
    lines.innerHTML = paths;
  }

  /* ---------- the loop (in ?still mode: one synchronous frame per change, no loop) ---------- */
  let frame = 0, last = 0, alive = true, inTick = false;
  function tick(now){
    frame = 0; if (!alive) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60; last = now;
    const jump = isStill(), k = jump ? 1 : Math.min(1, dt * st.speed);
    st.yaw += (st.ty - st.yaw) * k; st.pitch += (st.tp - st.pitch) * k; st.zoom += (st.tz - st.zoom) * (jump ? 1 : Math.min(1, dt * 5)); st.uzv += (st.uz - st.uzv) * (jump ? 1 : Math.min(1, dt * 8));
    const moving = Math.abs(st.ty - st.yaw) > 1e-4 || Math.abs(st.tp - st.pitch) > 1e-4;
    if (!moving){ st.yaw = st.ty; st.pitch = st.tp; st.speed = 6; }
    applyPose();
    S.pose[kind] = { yaw:st.ty, pitch:st.tp, zoom:st.tz, uz:st.uz };
    if (hasLayers){ const target = S.spread / 100; spreadNow += (target - spreadNow) * (jump ? 1 : Math.min(1, dt * 8)); lift(); }
    model.updateMatrixWorld(true); follow(jump ? 1 : Math.min(1, dt * 8)); placeCamera();
    if (built.tick) built.tick(now / 1000, dt);
    r.render(scene, camera);
    layout();
    if (!KIT.still) frame = requestAnimationFrame(tick);
  }
  function kick(){
    if (!alive) return;
    if (KIT.still){ if (!inTick){ inTick = true; last = 0; tick(performance.now()); inTick = false; } return; }
    if (!frame){ last = 0; frame = requestAnimationFrame(tick); }
  }
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener("visibilitychange", onVis);
  resize(); marks();
  const turnTo = (yw, pt) => { const twoPi = Math.PI * 2; st.ty += ((yw - st.ty) % twoPi + twoPi * 1.5) % twoPi - Math.PI; st.tp = pt; };
  return {
    kind, hasLayers,
    preset(name){ const [yw, pt] = name === "angle" ? [built.pose.yaw, built.pose.pitch] : PRESETS[name];
      turnTo(yw, pt); st.speed = 5; st.tz = rest.zoom[name] || 1; kick(); },
    zoom(dir){ setZoom(dir === "reset" ? 1 : st.uz * (dir > 0 ? 1.25 : 0.8)); return st.uz; },
    marks, relabel(){ writeLabels(); kick(); },
    /* make the part visible: open the layers if it sits inside, then, if it is mostly covered or facing away, turn to the nearest
       view where it can be seen. Each view is really tested: rays from the camera to points on the part. Returns true if the layers opened */
    focus(id){
      const list = anchors.filter(a => a.id === id); if (!list.length) return false;
      let open = false;
      if (hasLayers && S.spread < 40 && list.some(a => layers[a.layer] && layers[a.layer].inner)){ S.spread = 70; open = true; }
      const mine = pickables.filter(o => o.userData.part === id).slice(0, 6), others = pickables.filter(o => o.userData.part !== id && !o.userData.hidden && o.userData.base[0].opacity >= 0.3);
      const keep = { yaw:st.yaw, pitch:st.pitch, spread:spreadNow };
      if (hasLayers){ spreadNow = S.spread / 100; lift(); }
      const q = new THREE.Vector3(), dir = new THREE.Vector3(), corners = [[0, 0, 0], [-.7, -.7, 1], [.7, -.7, 1], [-.7, .7, 1], [.7, .7, 1], [-.7, -.7, -1], [.7, .7, -1]];
      const seen = (yw, pt) => {
        st.yaw = yw; st.pitch = pt; applyPose(); model.updateMatrixWorld(true);
        let hit = 0, all = 0;
        mine.forEach(o => { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox, c = b.getCenter(new THREE.Vector3()), h = b.getSize(new THREE.Vector3()).multiplyScalar(0.5);
          corners.forEach(([i, j, k]) => { q.set(c.x + i * h.x, c.y + j * h.y, c.z + k * h.z).applyMatrix4(o.matrixWorld); dir.copy(q).sub(camera.position); const d = dir.length(); ray.set(camera.position, dir.normalize()); all++;
            const first = ray.intersectObjects(others, false)[0]; if (!first || first.distance > d - 0.5) hit++; }); });
        const f = list.reduce((m, a) => Math.max(m, n.set(...a.f).applyQuaternion(model.quaternion).z), -1);
        return { vis:all ? hit / all : 0, f };
      };
      const now = seen(st.ty, st.tp);
      let best = null;
      if (now.vis < 0.75 || now.f < 0.1){
        const dist = (yw, pt) => Math.abs(Math.atan2(Math.sin(yw - st.ty), Math.cos(yw - st.ty))) + Math.abs(pt - st.tp), pitches = hasLayers ? [0.12, 0.3, 0.5, 0.75] : [0.15, 0.5, 0.95, -0.4, -0.95, 1.4, -1.4];
        for (let i = 0; i < 12; i++) for (const pt of pitches){ const yw = st.ty + i * Math.PI / 6, r = seen(yw, pt), score = r.vis + 0.35 * r.f - 0.08 * dist(yw, pt); if (r.vis > now.vis && (!best || score > best.score)) best = { yw, pt, score }; }
      }
      st.yaw = keep.yaw; st.pitch = keep.pitch; applyPose(); if (hasLayers){ spreadNow = keep.spread; lift(); }
      if (best){ turnTo(best.yw, best.pt); st.tz = 1; st.speed = 5; }
      kick(); return open;
    },
    destroy(){ alive = false; if (frame) cancelAnimationFrame(frame); ro.disconnect(); document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown); canvas.removeEventListener("pointermove", onMove); canvas.removeEventListener("pointerup", onUp); canvas.removeEventListener("pointercancel", onUp); canvas.removeEventListener("pointerleave", onLeave); canvas.removeEventListener("wheel", onWheel);
      scene.traverse(o => { if (o.isMesh){ o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(x => { if (x.map) x.map.dispose(); x.dispose(); }); } });
      canvas.remove(); }
  };
}
function mountViewer(kind){
  if (viewer){ viewer.destroy(); viewer = null; }
  const host = document.querySelector(".v3");
  if (!host) return;
  if (!HAS_THREE){ host.innerHTML = `<div class="v3-fallback">${esc(t("noGL"))}</div>`; return; }
  viewer = createViewer(host, kind);
}
