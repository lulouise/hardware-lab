/* ===================== roads: how the parts connect, around the brain (chapter 4) =====================
   A chapter with roads:{
     viewBox:"0 0 920 590", hub:"brain",
     families:[{ id, line, en:[name, sub], zh }],                      e.g. Energy, Information wires, Through the air
     kinds:{ kind:{ fam, line, en:[name, what it is], zh, why:{ en, zh } } },
     nodes:{ partId:[x, y] },                                         map positions (a part, or an extra node)
     extra:{ id:{ g, en:[name, sub], zh, dashed? } },                  things that aren't parts of the device (a battery you add)
     zones:[[group, x, y, w, h, name, sub]],                           Sense left, Brain middle, Output right, Power bottom…
     roads:[[from, to, kind, { en, zh }, both?, bend?]],               both = it flows both ways; bend "v" or "h" forces how it curves,
                                                                       or [x, y] bends it through that point (around a part)
     idea:{ title, text, tips:[…], note?, line } }                     the "big idea" card, and the line under the map
   line = the line pattern from the kit's road styles: power (thick), gpio (thin), i2c (dashed), i2s (dotted), spi (thick
   solid), analog (dash-dot), usb (short dashes), radio (dots, magenta), net. A family's line is drawn in its list heading.
   The map is a canvas: fitMap() keeps text the same size on screen, spreads the parts to fill the stage, and if they still don't fit
   it drops the small line, then spreads them past the edge. Drag moves the canvas, the bar above it zooms, and picking from a list
   moves the canvas to what lit up. Positions in `nodes` set the shape of the map, not its size. Zones wrap the parts inside them.
   Rules: the left list picks a road type (only it lights up, dots show which way it flows); tapping a part shows all its
   roads; a tap never closes the card: only "← Back to the big idea" does. */

let ROADS_OVERRIDE = null;                                                   // the story player (stories.js) shows a map from another chapter
const RD = () => ROADS_OVERRIDE || CH().roads;
const famOf = k => RD().families.find(f => f.id === RD().kinds[k].fam);
const famColour = f => f.line === "power" ? "--power" : f.line === "radio" ? "--connect" : "--wire";
const rl = kind => `<svg class="rl" viewBox="0 0 28 8" aria-hidden="true"><line x1="1" y1="4" x2="27" y2="4" data-kind="${RD().kinds[kind].line}"/></svg>`;
const famLine = f => `<svg class="rl" viewBox="0 0 28 8" aria-hidden="true"><line x1="1" y1="4" x2="27" y2="4" data-kind="${f.line}"/></svg>`;
const KN = k => { const x = RD().kinds[k]; return x[LANG] || x.en; };
const FN = f => f[LANG] || f.en;
const roadList = () => RD().roads.map(([a, b, kind, txt, bi, bend], i) => ({ i, a, b, kind, txt, bi:!!bi, bend }));
const nodeName = id => { const x = RD().extra && RD().extra[id]; if (x){ const n = x[LANG] || x.en; return [n[0], n[1]]; } const p = P(id); return [p.lab, p.sub]; };
const nodeGroup = id => { const x = RD().extra && RD().extra[id]; return x ? x.g : PARTS[id].g; };
const isExt = id => !!((RD().extra && RD().extra[id] && RD().extra[id].dashed) || (PARTS[id] && PARTS[id].ext));

const roadsListDef = () => { const R = RD();
  return { kind:"rk", cur:S.node ? "" : S.road || "intro", word:{ en:"Road", zh:"种" },
    items:[{ id:"intro", g:"start", label:tz("The big idea", "核心概念"), st:"--c:var(--ink);--ct:var(--soft)" },
      ...R.families.flatMap(f => Object.keys(R.kinds).filter(k => R.kinds[k].fam === f.id).map(k => ({ id:k, g:f.id, label:KN(k)[0], st:`--c:var(${famColour(f)});--ct:var(--soft)` })))],
    groups:["start", ...R.families.map(f => f.id)],
    ghead:g => g === "start" ? [tz("Start here", "从这里开始"), "", "--c:var(--ink)"] : (f => [FN(f)[0], FN(f)[1], `--c:var(${famColour(f)})`])(R.families.find(f => f.id === g)),
    title:{ en:"Roads", zh:"道路" },
    head:{ en:`${Object.keys(R.kinds).length} road types · ${R.families.length} families`, zh:`${Object.keys(R.kinds).length} 种道路 · ${R.families.length} 类` },
    sub:{ en:"Start with the big idea, then pick a road.", zh:"先看核心概念，再挑一种路看看。" } }; };

let MAP_POS = null, MAP_T = null;                                            // where fitMap() put the parts, and how it moved a point
function roadPath(r, all){
  const N = MAP_POS || RD().nodes, [x1, y1] = N[r.a], [x2, y2] = N[r.b];
  if (Array.isArray(r.bend)){ const [bx, by] = MAP_T ? MAP_T(...r.bend) : r.bend; return `M${x1} ${y1}Q${bx} ${by} ${x2} ${y2}`; }
  const twins = all.filter(o => (o.a === r.a && o.b === r.b) || (o.a === r.b && o.b === r.a));
  const idx = twins.indexOf(r), off = twins.length > 1 ? (idx - (twins.length - 1) / 2) * 22 : 0;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len * off, ny = dx / len * off;
  const horiz = r.bend ? r.bend === "h" : Math.abs(dx) > Math.abs(dy);
  const c1 = horiz ? [x1 + dx * 0.5 + nx, y1 + ny] : [x1 + nx, y1 + dy * 0.5 + ny], c2 = horiz ? [x1 + dx * 0.5 + nx, y2 + ny] : [x2 + nx, y1 + dy * 0.5 + ny];
  return `M${x1 + nx} ${y1 + ny}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x2 + nx} ${y2 + ny}`;
}
function roadsMapHTML(){
  MAP_POS = MAP_T = null;
  const R = RD(), all = roadList(), hub = R.hub || "brain";
  const zones = (R.zones || []).map(([g, x, y, w, h, n, d]) => `<g style="${col(g)}" data-zone="${esc(JSON.stringify([x, y, w, h]))}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" class="zone"/><text x="${x + 4}" y="${y - 7}" class="zlab">${esc(L(n))}${L(d) ? `<tspan class="zsub"> · ${esc(L(d))}</tspan>` : ""}</text></g>`).join("");
  const hubLab = R.nodes[hub] ? `<text x="${R.nodes[hub][0]}" y="${R.nodes[hub][1] - 50}" text-anchor="middle" class="zlab hublab" data-hublabel style="${col("think")}">${esc(tz("Brain", "大脑"))}<tspan class="zsub"> · ${esc(tz("decides", "做决定"))}</tspan></text>` : "";
  const roads = all.map(r => `<path class="road" data-road="${r.i}" data-kind="${R.kinds[r.kind].line}" d="${roadPath(r, all)}"/>`).join("");
  const nodes = Object.entries(R.nodes).map(([id, [x, y]]) => {
    const [n1, n2] = nodeName(id), g = nodeGroup(id), big = id === hub, w = big ? 200 : Math.max(150, textW(n1, 8.6, 15.5) + 44, textW(n2, 6.6, 12.8) + 44), h = big ? 74 : 50;
    const dashed = isExt(id);
    return `<g class="node${big ? " big" : ""}" data-node="${id}" tabindex="0" role="button" aria-label="${esc(n1)}" style="${col(g)}" transform="translate(${x - w / 2} ${y - h / 2})">
      <rect width="${w}" height="${h}" rx="${big ? 16 : 12}" class="nbox"${dashed ? ` style="stroke-dasharray:5 4"` : ""}/><circle cx="16" cy="${h / 2}" r="6" class="ndot"/>
      <text x="30" y="${big ? 32 : 22}" class="nt">${esc(n1)}</text><text x="30" y="${big ? 54 : 39}" class="ns">${esc(n2)}</text></g>`;
  }).join("");
  return `<svg class="fig map" viewBox="${R.viewBox || "0 0 920 590"}" role="img" aria-label="${esc(tz("Road map: how every part connects to the brain", "道路图：每个部件怎样连到大脑"))}">
    <g class="zones" aria-hidden="true">${zones}</g><g data-roads>${roads}</g><g data-mdots></g>${nodes}${hubLab}</svg>`;
}
/* the same text size on screen as every other figure: see the note at the top */
/* map text on screen: 13 px, 11 px on a phone (like the rest of a phone's figure text). MAP_READ is the furthest a list pick or story
   step zooms out: the text stays over 10 px (8 px on a phone, the smallest any figure allows) */
const PHONE = () => innerWidth < 620, MAP_TEXT = () => PHONE() ? 11 : 13, MAP_MIN = 0.35, MAP_MAX = 2.5, MAP_READ = () => (PHONE() ? 8.4 : 10.4) / MAP_TEXT();
function fitMap(svg = $(".map")){
  if (!svg) return;
  const wrap = svg.parentElement, W = wrap.clientWidth; if (W < 50) return;
  const R = RD(), hubId = R.hub || "brain", narrow = !svg.closest(".app");
  const nodes = [...svg.querySelectorAll("[data-node]")], ids = nodes.map(n => n.dataset.node), src = ids.map(id => R.nodes[id]);
  const zones = [...svg.querySelectorAll(".zones [data-zone]")].map(z => ({ el:z, rect:z.querySelector("rect"), text:z.querySelector("text"), src:JSON.parse(z.dataset.zone) }));
  const hubLab = svg.querySelector("[data-hublabel]");
  svg.style.setProperty("--mk", MAP_TEXT() / 15); svg.style.setProperty("--zk", MAP_TEXT() / 12.5);   // zone and hub labels: the same size as the parts' names
  const hubW = hubLab ? hubLab.getComputedTextLength() : 0;
  /* each part's box, with or without its small line */
  const shape = compact => { svg.classList.toggle("compact", compact); zones.forEach(z => { z.w = z.text.getComputedTextLength(); });
    return nodes.map(n => { const big = n.dataset.node === hubId, nt = n.querySelector(".nt"), ns = n.querySelector(".ns"), long = ns.getComputedTextLength() > 200; ns.style.display = long ? "none" : "";
      const sub = !compact && !long && ns.textContent, tw = Math.max(nt.getComputedTextLength(), sub ? ns.getComputedTextLength() : 0), pad = compact ? 9 : 12, w = tw + pad * 2 + 14, h = sub ? (big ? 54 : 44) : (big ? 36 : 30);
      const r = n.querySelector(".nbox"); r.setAttribute("width", w); r.setAttribute("height", h);
      const dot = n.querySelector(".ndot"); dot.setAttribute("cx", pad + 2); dot.setAttribute("cy", h / 2); dot.setAttribute("r", 4.5);
      const tx = pad + 13; nt.setAttribute("x", tx); ns.setAttribute("x", tx); nt.setAttribute("y", sub ? h * 0.44 : h / 2 + 4.8); ns.setAttribute("y", h * 0.8);
      return { w, h }; }); };
  const x0 = Math.min(...src.map(p => p[0])), x1 = Math.max(...src.map(p => p[0])), y0 = Math.min(...src.map(p => p[1])), y1 = Math.max(...src.map(p => p[1]));
  /* where everything lands when the parts are spread by kx across and ky down */
  let H = narrow ? Math.round(Math.max(340, W * 1.05)) : wrap.clientHeight;
  const layout = (sizes, kx, ky = kx) => {
    const edge = (val, key) => Math.max(...sizes.filter((_, i) => src[i][key] === val).map(b => key ? b.h : b.w)) / 2;
    let sx = Math.max(0.2, (W - 52 - edge(x0, 0) - edge(x1, 0)) / (x1 - x0 || 1)), sy = Math.max(0.2, (H - 76 - edge(y0, 1) - edge(y1, 1)) / (y1 - y0 || 1));
    sx = Math.min(sx, sy * 2.4); sy = Math.min(sy, sx * 2.2); sx *= kx; sy *= ky;
    const T = (x, y) => [(x - x0) * sx, (y - y0) * sy], pos = {}, boxes = ids.map((id, i) => { const [x, y] = T(...src[i]), { w, h } = sizes[i]; pos[id] = [x, y]; return { id, x:x - w / 2, y:y - h / 2, w, h }; });
    const zs = zones.map(z => { const [zx, zy, zw, zh] = z.src, inside = boxes.filter((b, i) => src[i][0] > zx && src[i][0] < zx + zw && src[i][1] > zy && src[i][1] < zy + zh);
      if (!inside.length){ const [a, b] = T(zx, zy), [c, d] = T(zx + zw, zy + zh); return { x:a, y:b, w:c - a, h:d - b, lab:{ x:a + 4, y:b - 20, w:z.w, h:16 } }; }
      const a = Math.min(...inside.map(b => b.x)) - 12, b = Math.min(...inside.map(q => q.y)) - 12, c = Math.max(...inside.map(q => q.x + q.w)) + 12, d = Math.max(...inside.map(q => q.y + q.h)) + 12;
      /* a zone around the hub puts its name under it: above, it would sit on the hub's own label */
      const low = inside.some(q => q.id === hubId);
      return { x:a, y:b, w:c - a, h:d - b, lab:{ x:a + 4, y:low ? d + 4 : b - 20, w:z.w, h:16 } }; });
    const hb = boxes.find(b => b.id === hubId), hl = hb && hubLab ? { x:hb.x + hb.w / 2 - hubW / 2, y:hb.y - 21, w:hubW, h:16 } : null;
    return { T, pos, boxes, zs, hl };
  };
  const hit = (a, b, gx, gy) => a.x < b.x + b.w + gx && b.x < a.x + a.w + gx && a.y < b.y + b.h + gy && b.y < a.y + a.h + gy;
  const clash = L => { const labs = [...L.zs.map(z => z.lab), ...(L.hl ? [L.hl] : [])];
    return L.boxes.some((p, i) => L.boxes.some((q, j) => j > i && hit(p, q, 12, 10)) || labs.some(l => hit(p, l, 3, 2))) || labs.some((p, i) => labs.some((q, j) => j > i && hit(p, q, 6, 2))); };
  let L = layout(shape(false), 1);
  /* still crowded: spread down only, then across only, then both, a little more each time (one direction keeps the map from growing past the stage both ways) */
  if (clash(L)){ const sizes = shape(true); spread: for (let s = 1; s < 4; s *= 1.06){ for (const [kx, ky] of [[1, s], [s, 1], [s, s]]){ L = layout(sizes, kx, ky); if (!clash(L)) break spread; } } }
  /* draw it */
  MAP_POS = L.pos; MAP_T = L.T;
  L.boxes.forEach((b, i) => nodes[i].setAttribute("transform", `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`));
  const all = roadList(); svg.querySelectorAll("[data-road]").forEach(p => p.setAttribute("d", roadPath(all[+p.dataset.road], all)));
  zones.forEach((z, i) => { const q = L.zs[i]; z.rect.setAttribute("x", q.x); z.rect.setAttribute("y", q.y); z.rect.setAttribute("width", q.w); z.rect.setAttribute("height", q.h); z.text.setAttribute("x", q.lab.x); z.text.setAttribute("y", q.lab.y + 13); });
  if (hubLab && L.hl){ hubLab.setAttribute("x", L.hl.x + L.hl.w / 2); hubLab.setAttribute("y", L.hl.y + 13); }
  /* the canvas: what is on it, and the starting view */
  const ex = [...L.boxes, ...L.zs, ...L.zs.map(z => z.lab), ...(L.hl ? [L.hl] : [])], c = { x:Math.min(...ex.map(b => b.x)) - 14, y:Math.min(...ex.map(b => b.y)) - 10, r:Math.max(...ex.map(b => b.x + b.w)) + 14, b:Math.max(...ex.map(b => b.y + b.h)) + 14 };
  if (narrow){ H = Math.round(c.b - c.y); wrap.style.height = H + "px"; }
  const hb = L.boxes.find(b => b.id === hubId);
  svg._map = { W, H, c, boxes:L.boxes, hub:hb ? [hb.x + hb.w / 2, hb.y + hb.h / 2] : [(c.x + c.r) / 2, (c.y + c.b) / 2], gen:(svg._map ? svg._map.gen : 0) + 1 };
  mapHome(svg);
}
/* the view of the canvas: x, y = its top left corner, z = zoom (1 = text at its normal size) */
function mapSet(svg, v){
  const m = svg._map, z = clamp(v.z, MAP_MIN, MAP_MAX), vw = m.W / z, vh = m.H / z, cw = m.c.r - m.c.x, ch = m.c.b - m.c.y;
  const fx = cw <= vw ? (m.c.x + m.c.r - vw) / 2 : clamp(v.x, m.c.x, m.c.r - vw), fy = ch <= vh ? (m.c.y + m.c.b - vh) / 2 : clamp(v.y, m.c.y, m.c.b - vh);
  svg._v = { x:fx, y:fy, z }; svg.setAttribute("viewBox", `${fx.toFixed(1)} ${fy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
  const wrap = svg.parentElement; wrap.classList.toggle("zoomed", z > 1.01);
  const bar = wrap.parentElement.querySelector(".mapbar"); if (bar){ bar.querySelector("[data-mapz='one']").textContent = `${Math.round(z * 100)}%`; const a = mapAll(m); bar.querySelector("[data-mapz='all']").disabled = a >= 1 && Math.abs(z - 1) < 0.01; bar.classList.toggle("big", a < 1); }
}
const mapAll = m => Math.min(1, m.W / (m.c.r - m.c.x), m.H / (m.c.b - m.c.y));   // the zoom that shows everything
const mapHome = svg => { const m = svg._map; mapSet(svg, { x:m.hub[0] - m.W / 2, y:m.hub[1] - m.H / 2, z:1 }); };
function mapGlide(svg, to){
  const from = svg._v; cancelAnimationFrame(svg._glide);
  if (KIT.still || reduced.matches) return mapSet(svg, to);
  const t0 = performance.now(), go = t => { const k = clamp((t - t0) / 320, 0, 1), e = k * (2 - k); mapSet(svg, { x:lerp(from.x, to.x, e), y:lerp(from.y, to.y, e), z:lerp(from.z, to.z, e) }); if (k < 1) svg._glide = requestAnimationFrame(go); };
  svg._glide = requestAnimationFrame(go);
}
/* a list or a step lit these parts: move the canvas if any of them is out of sight */
function mapShow(ids){
  const svg = $(".map"); if (!svg || !svg._v || !ids.length) return;
  const m = svg._map, v = svg._v, bs = m.boxes.filter(b => ids.includes(b.id)); if (!bs.length) return;
  const a = Math.min(...bs.map(b => b.x)) - 20, c = Math.min(...bs.map(b => b.y)) - 34, r = Math.max(...bs.map(b => b.x + b.w)) + 20, d = Math.max(...bs.map(b => b.y + b.h)) + 20, vw = m.W / v.z, vh = m.H / v.z;
  if (a >= v.x && c >= v.y && r <= v.x + vw && d <= v.y + vh) return;
  const z = Math.max(Math.min(v.z, m.W / (r - a), m.H / (d - c)), Math.min(v.z, MAP_READ()));   // never so far out that the text can't be read
  mapGlide(svg, { x:(a + r) / 2 - m.W / z / 2, y:(c + d) / 2 - m.H / z / 2, z });
}
function mapZoomAt(svg, z, px, py){ const v = svg._v, m = svg._map, n = clamp(z, MAP_MIN, MAP_MAX), wx = v.x + px / v.z, wy = v.y + py / v.z; mapSet(svg, { x:wx - px / n, y:wy - py / n, z:n }); }
/* drag moves the canvas; pinch, ctrl + wheel and the bar zoom it. On a phone a plain vertical swipe still scrolls the page. */
function mapCanvas(svg){
  const wrap = svg.parentElement, pts = new Map(); let st = null, dragged = false, pinch = null;
  const rel = e => { const r = wrap.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  wrap.addEventListener("pointerdown", e => { if (e.button) return; cancelAnimationFrame(svg._glide); pts.set(e.pointerId, rel(e)); dragged = false;
    if (pts.size === 1) st = { p:rel(e), v:{ ...svg._v }, id:e.pointerId };
    if (pts.size === 2){ const [a, b] = [...pts.values()]; pinch = { d:Math.hypot(a[0] - b[0], a[1] - b[1]), z:svg._v.z }; } });
  wrap.addEventListener("pointermove", e => { if (!pts.has(e.pointerId) || !st) return; pts.set(e.pointerId, rel(e));
    if (pinch && pts.size === 2){ const [a, b] = [...pts.values()]; dragged = true; return mapZoomAt(svg, pinch.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
    const [x, y] = rel(e), dx = x - st.p[0], dy = y - st.p[1];
    if (!dragged && Math.hypot(dx, dy) < 5) return;
    if (!dragged){ dragged = true; wrap.classList.add("dragging"); try { wrap.setPointerCapture(e.pointerId); } catch (_){} }
    mapSet(svg, { x:st.v.x - dx / st.v.z, y:st.v.y - dy / st.v.z, z:st.v.z }); });
  const end = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size){ st = null; wrap.classList.remove("dragging"); } };
  wrap.addEventListener("pointerup", end); wrap.addEventListener("pointercancel", end);
  wrap.addEventListener("click", e => { if (dragged){ e.stopPropagation(); e.preventDefault(); dragged = false; } }, true);
  wrap.addEventListener("wheel", e => { const app = !!svg.closest(".app");
    if (e.ctrlKey || e.metaKey){ e.preventDefault(); const [x, y] = rel(e); return mapZoomAt(svg, svg._v.z * Math.exp(-e.deltaY * 0.01), x, y); }
    if (!app) return; e.preventDefault(); const v = svg._v; mapSet(svg, { x:v.x + e.deltaX / v.z, y:v.y + e.deltaY / v.z, z:v.z }); }, { passive:false });
  const bar = wrap.parentElement.querySelector(".mapbar");
  if (bar) bar.addEventListener("click", e => { const b = e.target.closest("[data-mapz]"); if (!b) return; const k = b.dataset.mapz, m = svg._map, v = svg._v;
    if (k === "in" || k === "out") return mapGlide(svg, (z => ({ x:v.x + m.W / v.z / 2 - m.W / z / 2, y:v.y + m.H / v.z / 2 - m.H / z / 2, z }))(clamp(v.z * (k === "in" ? 1.3 : 1 / 1.3), MAP_MIN, MAP_MAX)));
    if (k === "one") return mapGlide(svg, { x:m.hub[0] - m.W / 2, y:m.hub[1] - m.H / 2, z:1 });
    const z = mapAll(m); mapGlide(svg, { x:(m.c.x + m.c.r - m.W / z) / 2, y:(m.c.y + m.c.b - m.H / z) / 2, z }); });
}
const mapBarHTML = () => `<div class="mapbar"><span class="maphint">${esc(tz("Drag the map to move it", "按住地图拖动"))}</span><div class="mapz" role="group" aria-label="${esc(tz("Zoom the map", "缩放地图"))}"><button data-mapz="out" aria-label="${esc(tz("Zoom out", "缩小"))}">−</button><button data-mapz="one" title="${esc(tz("Back to normal size", "回到正常大小"))}">100%</button><button data-mapz="in" aria-label="${esc(tz("Zoom in", "放大"))}">+</button><button data-mapz="all">${esc(tz("See it all", "看全图"))}</button></div></div>`;
let mapWatch = null;
/* after = what to do once the map is (re)fitted: bring what is lit back into view, since fitting starts from the hub again */
function watchMap(after = () => {}){ if (mapWatch) mapWatch.disconnect(); const svg = $(".map"); if (!svg) return; fitMap(svg); mapCanvas(svg); after(); let w = svg.parentElement.clientWidth, h = svg.parentElement.clientHeight; mapWatch = new ResizeObserver((_, obs) => { if (!svg.isConnected){ obs.disconnect(); return; } const wrap = svg.parentElement, a = wrap.clientWidth, b = wrap.clientHeight; if (Math.abs(a - w) > 2 || (svg.closest(".app") && Math.abs(b - h) > 2)){ w = a; h = b; fitMap(svg); after(); } }); mapWatch.observe(svg.parentElement); }
const backToIdea = () => `<button class="backlink" data-back>${esc(tz("← Back to the big idea", "← 回到核心概念"))}</button>`;
function roadsCard(){
  const R = RD(), all = roadList();
  if (S.node){
    const id = S.node, [n1, n2] = nodeName(id), g = nodeGroup(id), mine = all.filter(r => r.a === id || r.b === id);
    const does = PARTS[id] ? P(id).does : "";
    return `${backToIdea()}<span class="tag" style="${col(g)}"><i></i>${esc(G(g)[0])} · ${esc(G(g)[1])}</span><h3>${esc(n1)}</h3><p class="real">${esc(n2)}</p>${does ? `<p>${esc(does)}</p>` : ""}${isExt(id) ? `<p class="seealso">${esc(t("extPart"))}</p>` : ""}
      <!--DET--><section class="detsec"><h4 class="sechead">${esc(tz(`Its roads · ${mine.length}`, `它的道路 · ${mine.length} 条`))}</h4><ul class="roadlist">${mine.map(r => { const other = r.a === id ? r.b : r.a, arrow = r.bi ? "↔" : r.a === id ? "→" : "←";
        return `<li>${rl(r.kind)}<span><b>${arrow} ${esc(nodeName(other)[0])}</b> · ${esc(KN(r.kind)[0])}<br>${esc(L(r.txt))}</span></li>`; }).join("")}</ul></section>`;
  }
  if (S.road){
    const k = KN(S.road), mine = all.filter(r => r.kind === S.road), f = famOf(S.road);
    return `${backToIdea()}<span class="tag" style="--c:var(${famColour(f)});--ct:var(--soft)"><i></i>${esc(FN(f)[0])}</span>
      <h3 class="rk-h">${rl(S.road)}${esc(k[0])}</h3><p>${esc(k[1])}</p>
      <p class="why"><b>${esc(tz("Why this road", "为什么要用这种路"))}</b>${esc(L(R.kinds[S.road].why))}</p>
      <!--DET--><section class="detsec"><h4 class="sechead">${esc(tz(`What it connects · ${mine.length}`, `它连着哪些部件 · ${mine.length} 条`))}</h4><ul class="roadlist">${mine.map(r => `<li>${rl(r.kind)}<span><b>${esc(nodeName(r.a)[0])} ${r.bi ? "↔" : "→"} ${esc(nodeName(r.b)[0])}</b><br>${esc(L(r.txt))}</span></li>`).join("")}</ul></section>`;
  }
  const I = R.idea, count = f => all.filter(r => R.kinds[r.kind].fam === f.id).length, nk = f => Object.keys(R.kinds).filter(k => R.kinds[k].fam === f.id).length;
  return `<p class="kicker">${esc(tz("The big idea", "核心概念"))}</p><h3>${esc(L(I.title))}</h3>
    <p>${esc(L(I.text))}</p>
    ${tryList(I.tips || [])}
    <!--DET--><section class="detsec"><h4 class="sechead">${esc(tz(`${R.families.length} families of road`, `${R.families.length} 类道路`))}</h4><ul class="famlist">${R.families.map(f => `<li>${famLine(f)}<span><b>${esc(FN(f)[0])}</b> ${esc(FN(f)[1])}<em>${esc(tz(`${nk(f)} type${nk(f) > 1 ? "s" : ""} · ${count(f)} roads`, `${nk(f)} 种 · ${count(f)} 条`))}</em></span></li>`).join("")}</ul>${I.note ? `<p class="seealso">${esc(L(I.note))}</p>` : ""}</section>`;
}
function paintRoads(){
  const svg = $(".map"); if (!svg) return;
  const all = roadList(), active = new Set();
  all.forEach(r => { let on = true; if (S.road) on = r.kind === S.road; if (S.node) on = on && (r.a === S.node || r.b === S.node); if (on) active.add(r.i); });
  svg.querySelectorAll("[data-road]").forEach(p => p.classList.toggle("off", !active.has(+p.dataset.road)));
  const live = new Set(); all.forEach(r => { if (active.has(r.i)){ live.add(r.a); live.add(r.b); } });
  svg.querySelectorAll("[data-node]").forEach(n => { n.classList.toggle("off", !live.has(n.dataset.node) && !!(S.node || S.road)); n.classList.toggle("on", n.dataset.node === S.node); });
  svg.classList.toggle("fam", !S.road && !S.node);
  svg._active = active;
  repaintList(roadsListDef());
  fillPanel(roadsCard());
}
/* dots travel along the lit roads, showing which way each one flows */
function roadsAnimator(always = false){
  const svg = $(".map"), layer = svg.querySelector("[data-mdots]"), R = RD();
  const items = roadList().map(r => { const p = svg.querySelector(`[data-road="${r.i}"]`), len = p.getTotalLength(), n = Math.max(2, Math.round(len / 120)), line = R.kinds[r.kind].line;
    return { r, p, len, line, dots:Array.from({ length:n }, (_, j) => ({ el:E("circle", { r:line === "power" ? 5.5 : 4.6, class:"mdot", cx:-20, cy:-20, style:`fill:var(${famColour(famOf(r.kind))});opacity:0` }, layer), j, back:r.bi && j % 2 === 1 })) }; });
  let clock = 0;
  return { tick(dt){
    clock += reduced.matches ? 0 : dt;
    const active = svg._active || new Set();
    items.forEach(it => {
      const on = active.has(it.r.i) && (always || !!(S.node || S.road)), speed = it.line === "spi" || it.line === "i2s" ? 0.34 : it.line === "power" ? 0.16 : 0.22;
      it.dots.forEach(d => {
        if (!on){ d.el.style.opacity = 0; return; }
        if (it.gen !== (svg._map && svg._map.gen)){ it.gen = svg._map && svg._map.gen; it.len = it.p.getTotalLength(); }
        let u = (clock * speed * (300 / it.len) + d.j / it.dots.length) % 1; if (d.back) u = 1 - u;
        const pt = it.p.getPointAtLength(u * it.len); d.el.setAttribute("cx", pt.x.toFixed(1)); d.el.setAttribute("cy", pt.y.toFixed(1)); d.el.style.opacity = 1;
      });
    });
  } };
}
function renderRoads(el, c){
  if (S.road && !c.roads.kinds[S.road]) S.road = null;
  el.innerHTML = frame({ list:roadsListDef(), parts:false, idea:c.roads.idea.line,
    body:`${mapBarHTML()}<div class="mapwrap">${roadsMapHTML()}</div>`,
    nav:(c.nav || []).map(navBtn).join("") });
  paintRoads();
  demo = roadsAnimator(); watchMap(() => { if (S.road) mapShow(roadList().filter(r => r.kind === S.road).flatMap(r => [r.a, r.b])); }); runDemo();
}
const pickRoad = id => { S.road = id === "intro" ? null : id; S.node = null; paintRoads(); if (S.road) mapShow(roadList().filter(r => r.kind === S.road).flatMap(r => [r.a, r.b])); };
const pickNode = id => { S.node = id; S.road = null; paintRoads(); };            // tapping the same part again keeps its card
