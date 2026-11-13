/* ===================== stations: one hands-on station per part (chapter 3) =====================
   A chapter with stations:[{ id, g, parts:[partId…], demo:"type", setup:{…}, idea, en:{ t, lead, watch:[…] }, zh:{…} }]
   - g: the job colour; the list groups stations by job
   - demo + setup: a demo type from demos.js and its numbers (from the fact sheet)
   - t: the station's name, real part first ("Storage chip and working memory"); lead: starts with the real part and where it
     sits, then the comparison that helps; watch: what to notice (a numbered list); general: is it the same on other boards?
   - idea: the one line under the demo
   - deep:"id": the station belongs to a deep dive, listed together under chapter.deep[id] = { g, en:[title, sub], zh }. The part
     that matters most gets one: a chipmap station that unfolds it, then one station per block (see references/chapters.md)
   COURSE.where(partIds) → { viewBox, svg } (optional) draws the device with those parts; the frame lights them up beside the demo,
   so the learner always sees which real part the station is about.
   The demo draws on the stage; its own controls sit in a "Try it" tray above the figure.
   A chapter with steps:[…] instead (chapter 6, a project) uses the same frame, but the list is in order (Step 1 of 7), not grouped
   by colour. A step may add need:[…] (what you'd buy, approximate) and note (what the page simulates). */

let demo = null, demoFrame = 0, demoLast = 0;
/* in ?still mode (a hidden test browser) the loop runs on a timer, because requestAnimationFrame is paused there */
const nextFrame = cb => KIT.still ? setTimeout(() => cb(performance.now()), 16) : requestAnimationFrame(cb);
function runDemo(){
  if (demoFrame || !demo || !demo.tick) return;
  demoLast = 0;
  const loop = now => {
    if (!demo || !demo.tick){ demoFrame = 0; return; }
    const dt = demoLast ? Math.min(KIT.still ? 1 : 0.05, (now - demoLast) / 1000) : 1 / 60; demoLast = now;   // a hidden test browser slows timers to 1 a second
    demo.tick(dt, now / 1000);
    demoFrame = nextFrame(loop);
  };
  demoFrame = nextFrame(loop);
}
function stopDemo(){ if (demo && demo.destroy) demo.destroy(); demo = null; if (demoFrame){ cancelAnimationFrame(demoFrame); clearTimeout(demoFrame); } demoFrame = 0; }

const STATIONS = c => c.stations || c.steps;
const STATION = c => { c = c || CH(); const id = S.station[c.id], list = STATIONS(c); return list.find(s => s.id === id) || list[0]; };
const SL = s => Object.assign({}, s, s.en, LANG === "zh" ? s.zh : {});
const stationGroup = s => s.deep || s.g;
const stationGroups = c => [...Object.keys(c.deep || {}), ...PART_GROUPS].filter(g => c.stations.some(s => stationGroup(s) === g));
const stationList = c => c.steps ? { kind:"station", cur:STATION(c).id, word:{ en:"Step", zh:"步" },
  items:c.steps.map(s => ({ id:s.id, g:s.g, label:SL(s).t })),
  title:{ en:"Steps", zh:"步骤" },
  head:c.stepsHead || { en:`${c.steps.length} steps`, zh:`${c.steps.length} 步` },
  sub:c.stepsSub || { en:"Go in order: each step adds one idea.", zh:"按顺序来，每一步多懂一点。" } } : { kind:"station", cur:STATION(c).id, word:{ en:"Station", zh:"站" },
  items:stationGroups(c).flatMap(g => c.stations.filter(s => stationGroup(s) === g).map(s => ({ id:s.id, g, label:SL(s).t }))),
  groups:stationGroups(c),
  ghead:g => { const d = c.deep && c.deep[g]; if (!d) return colHead(g); const n = d[LANG] || d.en; return [n[0], n[1], col(d.g)]; },
  title:{ en:"Stations", zh:"小站" },
  head:c.deep ? { en:`${c.stations.length} stations`, zh:`${c.stations.length} 个小站` } : { en:`${c.stations.length} stations · one part each`, zh:`${c.stations.length} 个小站 · 每站一个部件` },
  sub:{ en:"Pick a station, then play with it.", zh:"选一个小站，动手玩一玩。" } };

function stationCard(){
  const s = SL(STATION()), g = s.g ? G(s.g) : null, steps = !!CH().steps;
  return `${g ? `<span class="tag" style="${col(s.g)}"><i></i>${esc(g[0])} · ${esc(g[1])}</span>` : ""}
    <h3>${esc(s.t)}</h3>
    <p>${esc(s.lead)}</p>
    ${tryList(s.watch.map(esc))}
    ${s.general ? `<p class="general"><b>${esc(COURSE.ui && COURSE.ui.general ? t("general") : tz("Same on other devices?", "别的设备也这样吗？"))}</b>${esc(s.general)}</p>` : ""}
    ${s.need ? `<section class="detsec"><h4 class="sechead">${esc(tz("What you'd need (approximate)", "要准备的东西（大概）"))}</h4><ul class="needlist">${s.need.map(x => `<li>${esc(x)}</li>`).join("")}</ul></section>` : ""}
    ${s.note ? `<p class="seealso">${esc(s.note)}</p>` : ""}<!--DET-->
    ${!s.parts.length ? "" : fold("real", steps ? tz("Parts used", "用到的零件") : tz("The real parts", "对应的真实零件"), `<div class="realparts">${s.parts.map(id => { const p = P(id); return `<span style="${col(p.g)}"><i></i><b>${esc(p.lab)}</b> ${esc(p.name)}</span>`; }).join("")}</div>`)}`;
}
/* every demo's own controls go into one labelled tray, right above (or beside) its figure */
function trayify(root){
  const ctrls = [...root.children].filter(el => el.matches(".demo-ctl, .slider"));
  if (!ctrls.length) return;
  const tray = document.createElement("div"); tray.className = "tray";
  tray.innerHTML = `<p class="traylab">${esc(tz("Try it", "动手试试"))}</p>`;
  ctrls[0].before(tray); ctrls.forEach(c => tray.appendChild(c));
}
/* where the station's parts sit on the device, lit up (a picture only: nothing to tap) */
function whereHTML(s){
  const onBoard = s.parts.filter(id => !PARTS[id].ext);              // devices outside the board appear in the demo itself
  if (!COURSE.where || !onBoard.length) return "";
  const w = COURSE.where(onBoard);
  return `<figure class="where"><svg class="fig where-svg" viewBox="${w.viewBox}" aria-hidden="true">${w.svg}</svg><figcaption><span>${esc(COURSE.ui && COURSE.ui.where ? t("where") : tz("Where it is", "在哪里"))}</span><b>${esc(onBoard.map(id => P(id).lab).join(" · "))}</b></figcaption></figure>`;
}
function paintWhere(s){ document.querySelectorAll(".where [data-part]").forEach(e => e.toggleAttribute("data-hl", s.parts.includes(e.dataset.part))); }
function runStation(){
  const s = STATION(), root = $("#demo");
  demo = DEMOS[s.demo](root, s.setup || {}) || {};
  fitTexts(root);   /* every demo: short labels with data-fit shrink to their shape, even if the demo forgot to call it */
  trayify(root); phoneFit(root); runDemo();
}
/* phones use larger drawing text: pull in anything that then leaves its shape or the drawing */
function phoneFit(root){
  if (innerWidth >= 620) return;
  root.querySelectorAll(".dsvg").forEach(svg => { const area = svg.getBoundingClientRect(), shapes = [...svg.querySelectorAll("rect")].map(b => b.getBoundingClientRect()).filter(c => c.width && c.width < area.width * 0.6);
    svg.querySelectorAll("text").forEach(t => { const r = t.getBoundingClientRect(); if (!r.width) return; const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, c = shapes.filter(c => cx > c.left && cx < c.right && cy > c.top && cy < c.bottom).sort((a, b) => a.width * a.height - b.width * b.height)[0] || area;
      const room = Math.min(r.width, 2 * Math.min(cx - c.left, c.right - cx) - 4, t.getAttribute("text-anchor") === "middle" ? r.width : c.right - r.left - 2); if (room > 0 && room < r.width) t.style.fontSize = (parseFloat(getComputedStyle(t).fontSize) * room / r.width).toFixed(1) + "px"; }); });
}
function renderStations(el, c){
  const s = STATION(c);
  el.innerHTML = frame({ list:stationList(c), parts:false, idea:s.idea,
    body:`<div class="st-wrap${whereHTML(s) ? "" : " solo"}"><div class="st-where">${whereHTML(s)}</div><div class="demo" id="demo"></div></div>`,
    nav:(c.nav || []).map(navBtn).join("") });
  fillPanel(stationCard());
  paintWhere(s); runStation();
}
function pickStation(id){
  const c = CH(); S.station[c.id] = id; stopDemo();
  repaintList(stationList(c));
  const bi = $("#bigidea"); if (bi) bi.textContent = L(STATION(c).idea);
  const sw = $(".st-where"); if (sw){ sw.innerHTML = whereHTML(STATION(c)); sw.parentElement.classList.toggle("solo", !sw.innerHTML); paintWhere(STATION(c)); }
  fillPanel(stationCard()); runStation();
}
