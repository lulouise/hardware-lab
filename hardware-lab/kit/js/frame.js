/* ===================== page frame: chapter rail, the stage, the right column, view tabs, colour chips, toolbar =====================
   One screen on big windows (≥1200×700): chapter rail, stage, right column. Stacked on phones.
   COURSE.chapters: six chapters. A chapter with views, stations or roads is built; one without shows greyed out with "after review".
   A chapter: { id, title, rail, thumb?, intro, nav:[{ to, label, ghost?, off? }], safety?:{ lead, text }, and one of
                views:[...]        pictures of the device (chapters 1–2)
                stations:[...]     one hands-on station per part (chapter 3, see stations.js)
                roads:{...}        the road map (chapter 4, see roads.js) }
   A view:    { id, tab, idea, tips:[...], parts?, legend?, card? (a big-picture card instead of "Pick a part"), then either
                model:"name", presets:["angle","front",…]           a 3D picture (a spread slider appears if the model has layers)
                svg:{ viewBox, draw }                              a flat map }
   Text is always an { en, zh } pair. Rule: "which picture" = underlined tabs; "what to show" = tinted colour chips. */

const CH = () => COURSE.chapters.find(c => c.id === S.chapter);
const chapterNo = () => COURSE.chapters.findIndex(c => c.id === S.chapter) + 1;
const VIEW = () => { const c = CH(); return c.views ? c.views.find(v => v.id === S.view[c.id]) || c.views[0] : {}; };
const isBuilt = c => !!(c && ((c.views && c.views.length) || c.stations || c.steps || c.roads || c.stories));

/* rail thumbnails for chapters 2–6 (chapter 1 shows the device: COURSE.chapters[0].thumb) */
const THUMBS_KIT = [
  "",
  `<path d="M14 30 L34 36 L50 28 L30 22 Z" class="th-l2"/><rect x="26" y="10" width="10" height="7" rx="1" class="th-chip"/><path d="M31 18 V24" style="stroke:var(--muted);stroke-width:1.4;stroke-dasharray:2 2"/>`,
  `<rect x="20" y="10" width="24" height="24" rx="3" class="th-chip"/>${[0, 1, 2, 3].map(i => `<line x1="${24 + i * 5.3}" y1="5" x2="${24 + i * 5.3}" y2="10" class="th-pin"/><line x1="${24 + i * 5.3}" y1="34" x2="${24 + i * 5.3}" y2="39" class="th-pin"/>`).join("")}`,
  `<path d="M14 12 L32 22 L50 12 M32 22 L32 36 M14 34 L32 22 L50 32" class="th-road"/><circle cx="32" cy="22" r="5" class="th-hub"/>`,
  `<path d="M8 32 C18 8 30 38 40 18 S52 10 56 14" class="th-road"/><circle cx="40" cy="18" r="4" class="th-move"/>`,
  `<rect x="18" y="24" width="28" height="14" rx="3" class="th-servo"/><line x1="36" y1="24" x2="48" y2="9" class="th-arm"/><circle cx="36" cy="24" r="2.6" class="th-hubw"/>`
];

/* ---------- the parts of the page that don't change per chapter ---------- */
function renderStatic(){
  document.documentElement.lang = LANG === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-t]").forEach(el => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === LANG)));
  if (typeof COURSE_BUILT === "string"){ const d = new Date(COURSE_BUILT), p = n => String(n).padStart(2, "0"), hm = `${p(d.getHours())}:${p(d.getMinutes())}`;
    const txt = LANG === "zh" ? `版本：${d.getMonth() + 1}月${d.getDate()}日 ${hm}` : `Version: ${d.toLocaleDateString("en-GB", { day:"numeric", month:"short" })}, ${hm}`;
    document.querySelectorAll("[data-built]").forEach(e => { e.textContent = txt; }); }
}
function renderRail(){
  const side = $("#side"); if (!side) return;
  side.classList.remove("open");
  const n = chapterNo(), cur = CH();
  const stat = c => { if (!QUIZ[c.id]) return ""; const r = quizRight(c.id), q = QUIZ[c.id].length, tried = quizTried(c.id);
    return r === q ? `<span class="cq done">✓</span>` : tried ? `<span class="cq">${r}/${q}</span>` : ""; };
  const off = c => isBuilt(c) ? "" : `disabled title="${esc(t("soon"))}"`;
  side.innerHTML = `<button class="ctoggle" data-chtoggle aria-expanded="false"><span class="cn">${n}</span><span class="ctt">${esc(t("chapterOf", { n }))} · <b>${esc(L(cur.title))}</b></span><span class="pm-caret" aria-hidden="true">▾</span></button>
    <ol class="clist">${COURSE.chapters.map((c, i) => `<li><button class="ctab" data-ch="${c.id}" ${c.id === S.chapter ? `aria-current="page"` : ""} ${off(c)}><span class="cn">${i + 1}</span><span class="ct">${esc(L(c.title))}</span>${isBuilt(c) ? stat(c) : `<span class="cq">${esc(t("soon"))}</span>`}</button></li>`).join("")}</ol>`;
  const r2 = document.querySelector("#rail2 .rail-items");
  if (r2) r2.innerHTML = COURSE.chapters.map((c, i) => { const r = quizRight(c.id), q = (QUIZ[c.id] || []).length;
    const dot = !QUIZ[c.id] ? "" : r === q ? `<span class="rdot done">✓</span>` : quizTried(c.id) ? `<span class="rdot">${r}/${q}</span>` : "";
    return `<li><button class="ritem" data-ch="${c.id}" ${c.id === S.chapter ? `aria-current="page"` : ""} ${off(c)} title="${esc(L(c.title))}"><span class="rnum">${i + 1}</span><svg class="ricon" viewBox="0 0 64 44" aria-hidden="true">${c.thumb || THUMBS_KIT[i] || ""}</svg><span class="rlab">${esc(L(c.rail))}</span>${isBuilt(c) ? dot : `<span class="rsoon">${esc(t("soon"))}</span>`}</button></li>`; }).join("");
}

/* ---------- pieces of the stage ---------- */
/* colour chips: by default, the jobs that have parts in this picture */
const legendGroups = v => v.legend || PART_GROUPS.filter(g => partIds().some(id => PARTS[id].g === g));
const legendHTML = groups => !groups.length ? "" : `<div class="legend" role="group" aria-label="${esc(t("legendLab"))}"><span class="lglab">${esc(t("legendLab"))}</span>${groups.map(g => `<button data-filter="${g}" aria-pressed="${S.filter === g}" style="${col(g)}" title="${esc(t("legendHint"))}"><i></i>${esc(G(g)[0])} <span style="color:var(--muted)">· ${esc(G(g)[1])}</span></button>`).join("")}</div>`;
const tabsHTML = c => c.views.length < 2 ? "" : `<div class="vtabs" role="group">${c.views.map(v => `<button data-view="${v.id}" aria-pressed="${v === VIEW()}">${esc(L(v.tab))}</button>`).join("")}</div>`;
const v3HTML = () => `<div class="v3"><div class="v3-canvas"></div><svg class="v3-lines" aria-hidden="true"></svg><div class="v3-labels"></div><div class="v3-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"/><path d="M18 3v4h-4M6 21v-4h4"/></svg>${esc(t("dragHint"))}</div></div>`;
const approxHTML = () => (COURSE.ui && COURSE.ui.approx) ? `<p class="approxnote">${esc(t("approx"))}</p>` : "";
const zoomBtns = () => `<span class="tsep"></span><span class="vlab">${esc(t("zoom"))}</span><button data-zoom="-1" aria-label="${esc(t("zoomOut"))}">−</button><button data-zoom="reset">${esc(t("zoomReset"))}</button><button data-zoom="1" aria-label="${esc(t("zoomIn"))}">+</button>`;
const presetBtns = list => !list.length ? "" : `<span class="vlab">${esc(t("viewLabel"))}</span>${list.map(k => `<button data-preset="${k}">${esc(presetName(k))}</button>`).join("")}`;
const spreadWord = () => S.spread < 5 ? t("spreadClosed") : t("spreadOpen");
const sliderHTML = () => `<span class="tsep"></span><div class="slider"><label for="spread">${esc(t("spread"))}</label><input type="range" id="spread" min="0" max="100" value="${S.spread}"><output id="spreadOut">${esc(spreadWord())}</output></div>`;
function syncSpread(){ const sp = $("#spread"); if (sp){ sp.value = S.spread; $("#spreadOut").textContent = spreadWord(); } }
const navBtn = nv => `<button class="btn${nv.ghost ? " ghost" : ""}" data-ch="${nv.to}" ${nv.off ? "disabled" : ""}>${esc(L(nv.label))}</button>`;
const ideaHTML = idea => idea ? `<p class="bigidea" id="bigidea">${esc(L(idea))}</p>` : "";
const quizDialog = ch => `<dialog class="qdlg" id="quizdlg" aria-label="${esc(t("quizTitle"))}"><div class="qdlg-in"><button class="qclose" data-quizclose aria-label="${esc(t("close"))}">×</button><div id="quizpane">${quizHTML(ch)}</div></div></dialog>`;

/* ---------- the list beside the stage (stations, road types): a column on big windows, a menu above the stage on phones ----------
   list: { kind, items:[{ id, label, g?, st? }], cur, word:{ en, zh } ("Station"), title, head, sub, groups?:[…], ghead?(g) → [title, sub, style] } */
const itemStyle = x => x.st ? `style="${x.st}"` : x.g ? `style="${col(x.g)}"` : "";
const colHead = g => [G(g)[0], G(g)[1], col(g)];
const listPos = d => { const i = Math.max(0, d.items.findIndex(x => x.id === d.cur)), n = d.items.length, w = d.word;
  return { i, n, text:tz(`${w.en} ${i + 1} of ${n}`, `第 ${i + 1} ${w.zh} / 共 ${n} ${w.zh}`) }; };
const pickBtns = (d, i, n) => `<button class="pk-nav" data-pick="${d.kind}" data-dir="-1" ${i <= 0 ? "disabled" : ""} aria-label="${esc(tz("Previous", "上一个"))}">‹</button><button class="pk-nav" data-pick="${d.kind}" data-dir="1" ${i >= n - 1 ? "disabled" : ""} aria-label="${esc(tz("Next", "下一个"))}">›</button>`;
function listGroupsHTML(d, item, wrap){
  const gh = d.ghead || colHead;
  return d.groups ? d.groups.map(g => { const [t1, t2, st] = gh(g); return wrap(g, t1, t2, st, d.items.map((x, j) => x.g === g ? item(x, j) : "").join("")); }).join("") : null;
}
function snavHTML(d){
  const item = (x, j) => `<button class="sn-item" data-${d.kind}="${x.id}" aria-current="${x.id === d.cur}" ${itemStyle(x)}><span class="pnum">${j + 1}</span><span class="sn-t">${esc(x.label)}</span></button>`;
  const list = listGroupsHTML(d, item, (g, t1, t2, st, inner) => `<div class="sn-group" style="${st}"><p class="sn-gh"><i></i>${esc(t1)}${t2 ? ` <span>· ${esc(t2)}</span>` : ""}</p>${inner}</div>`) || `<div class="sn-group">${d.items.map(item).join("")}</div>`;
  return `<nav class="snav" data-kind="${d.kind}" aria-label="${esc(L(d.head))}"><div class="sn-head"><h3>${esc(L(d.head))}</h3><p>${esc(L(d.sub))}</p></div><div class="sn-list">${list}</div></nav>`;
}
function posHTML(d){ const { i, n, text } = listPos(d); return `<div class="app-pos" data-kind="${d.kind}"><span class="pm-pos">${esc(text)}</span><span class="ap-name">${esc(d.items[i].label)}</span>${pickBtns(d, i, n)}</div>`; }
function menuHTML(d){
  const { i, n, text } = listPos(d);
  const item = (x, j) => `<button class="pm-item" data-${d.kind}="${x.id}" aria-current="${x.id === d.cur}" ${itemStyle(x)}><span class="pnum">${j + 1}</span><span class="pm-t">${esc(x.label)}</span></button>`;
  const body = d.groups ? `<div class="pm-cols" style="--cols:${d.groups.length}">${listGroupsHTML(d, item, (g, t1, t2, st, inner) => `<div class="pm-col" style="${st}"><p class="pm-gh"><i></i>${esc(t1)}</p>${inner}</div>`)}</div>` : `<div class="pm-row">${d.items.map(item).join("")}</div>`;
  return `<nav class="pmenu" data-kind="${d.kind}" aria-label="${esc(L(d.title))}">
    <div class="pm-head"><span class="sechead pm-title">${esc(L(d.title))}</span>
      <button class="pm-toggle" data-pmtoggle aria-expanded="false"><span class="pm-pos">${esc(text)}</span><span class="pm-curname">${esc(d.items[i].label)}</span><span class="pm-caret" aria-hidden="true">▾</span></button>
      <span class="pm-pos pm-pos-wide">${esc(text)}</span>${pickBtns(d, i, n)}</div>
    ${body}</nav>`;
}
/* after the current item changes: repaint the list wherever it is */
function repaintList(d){
  const sn = $(".snav"); if (sn) sn.outerHTML = snavHTML(d);
  const ap = $(".app-pos"); if (ap) ap.outerHTML = posHTML(d);
  const pm = $(".pmenu"); if (pm) pm.outerHTML = menuHTML(d);
}

/* ---------- the two layouts ---------- */
function frame(o){ return APP.matches ? frameApp(o) : frameStacked(o); }
function frameApp({ top = "", body, tool = "", nav, idea, list, under = "" }){
  const n = chapterNo(), ch = S.chapter, title = L(CH().title);
  return `<div class="app${list ? " has-nav" : ""}">
    ${list ? snavHTML(list) : ""}
    <section class="stagebox app-stage" aria-label="${esc(title)}">
      <div class="stage-head">
        <div class="app-title"><span class="brandmini">${esc(COURSE.name)}</span><span class="kicker">${esc(t("chapterOf", { n }))}</span><h2>${esc(title)}</h2></div>
        ${list ? posHTML(list) : ""}${top ? `<div class="stage-top">${top}</div>` : ""}
      </div>
      <div class="stage-body">${body}</div>
      ${ideaHTML(idea)}${under}
      ${tool ? `<div class="toolbar">${tool}</div>` : ""}
    </section>
    <aside class="app-right" aria-label="${esc(t("explain"))}">
      <div class="rc-main"><div class="card" id="ov"></div><div class="card" id="ov2"></div></div>
      <div class="rc-foot">${quizBtn(ch)}<div class="rc-nav">${nav}</div></div>
    </aside>
    ${quizDialog(ch)}
  </div>`;
}
function frameStacked({ top = "", body, tool = "", nav, idea, list, parts = true, under = "" }){
  const n = chapterNo(), ch = S.chapter, c = CH(), title = L(c.title);
  return `<div class="ch-intro"><p class="kicker">${esc(t("chapterOf", { n }))}</p><h2>${esc(title)}</h2><p>${esc(L(c.intro))}</p></div>
    ${list ? menuHTML(list) : ""}
    <section class="stagebox" aria-label="${esc(title)}">
      <div class="stage-main">
        ${top ? `<div class="stage-top">${top}</div>` : ""}
        <div class="stage-body">${body}</div>
        ${ideaHTML(idea)}${under}
        ${tool ? `<div class="toolbar">${tool}</div>` : ""}
      </div>
      <aside class="stage-side" aria-label="${esc(t("explain"))}"><div class="side-in"><div class="card" id="ov"></div><div class="side-foot">${quizBtn(ch)}</div></div></aside>
    </section>
    <section class="panel" id="panel" hidden><div class="card pside" id="det"></div></section>
    ${parts ? `<section class="panel"><div class="card pside" id="plist">${partsListHTML()}</div></section>` : ""}
    <div class="nextrow">${quizBtn(ch)}<span class="nr-sp"></span>${nav}</div>
    ${quizDialog(ch)}`;
}
/* the card goes in the right column (app) or beside / below the stage (stacked); the part list follows it */
function fillPanel(html){
  const o2 = $("#ov2");
  if (o2){
    const [ov, det] = String(html).split("<!--DET-->"), x = S.selected || !CH().views ? "" : partsListHTML();
    $("#ov").innerHTML = ov; o2.innerHTML = (det || "") + x;
    o2.querySelectorAll(".pl-item").forEach(bt => bt.setAttribute("aria-current", String(bt.dataset.part === S.selected)));
    return;
  }
  const pl = $("#plist"); if (pl){ pl.innerHTML = partsListHTML(); pl.closest(".panel").hidden = !pl.innerHTML; }
  const o = $("#ov"), d = $("#det"); if (!o) return;
  const [ov, det] = String(html).split("<!--DET-->");
  o.innerHTML = ov; d.innerHTML = det || "";
  const more = d.textContent.trim().length > 0;
  if (more) d.insertAdjacentHTML("afterbegin", `<h4 class="sechead">${esc(t("moreDetail"))}</h4>`);
  const pn = $("#panel"); if (pn) pn.hidden = !more;
}

/* ---------- one chapter, one view ---------- */
function renderChapter(){
  const el = $("#chapter"), c = CH();
  stopDemo();
  ROADS_OVERRIDE = null;
  if (!c.views){ if (viewer){ viewer.destroy(); viewer = null; } return c.stations || c.steps ? renderStations(el, c) : c.stories ? renderStories(el, c) : renderRoads(el, c); }
  const v = VIEW(), is3d = !!v.model;
  el.innerHTML = frame({ idea:v.idea,
    top:tabsHTML(c) + legendHTML(legendGroups(v)),
    body:is3d ? v3HTML() + (v.card ? "" : approxHTML()) : flatHTML(v),
    tool:is3d ? presetBtns(v.presets || ["angle", "front"]) + (HAS_THREE ? zoomBtns() : "") : "",
    nav:(c.nav || []).map(navBtn).join("") });
  fillPanel(cardHTML());
  if (is3d){ mountViewer(v.model); const tb = $(".toolbar"); if (viewer && viewer.hasLayers && tb) tb.insertAdjacentHTML("beforeend", sliderHTML()); }
  else if (viewer){ viewer.destroy(); viewer = null; }
  paintMarks();
}
function go(id){ const c = COURSE.chapters.find(x => x.id === id); if (!isBuilt(c)) return; S.chapter = id; S.selected = null; S.filter = null; S.node = null; save(); renderRail(); renderChapter(); window.scrollTo({ top:0, behavior:"smooth" }); }
function setView(id){ S.view[S.chapter] = id; S.selected = null; S.filter = null; renderChapter(); }
function setLang(l){
  if (l === LANG || !PAGE_LANGS().includes(l)) return; LANG = l;
  store.set("lang", l);
  const scroll = window.scrollY;
  renderStatic(); renderRail(); renderChapter(); window.scrollTo(0, scroll);
}
function save(){ store.set("course", JSON.stringify({ answers:S.answers, chapter:S.chapter })); }
