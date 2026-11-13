/* ===================== parts: job colours, the part list, the part card, choosing and filtering =====================
   Rules built in (the behaviour rules in the skill's references/design.md):
   - a colour filter hides the other colours' parts, labels and list items; one small "Show all colours" button leaves it
   - choosing a colour closes a card of another colour; picking a part of another colour leaves the filter
   - a tap never closes a card: only "← All parts" does
   - picking a part from the list turns the 3D view to show it (and opens closed layers); a tap in the drawing never moves the view */

/* colour always means job. A course may rename a job's subtitle (COURSE.groups), e.g. green = "Act" for a robot */
const GROUPS_KIT = {
  think:  { en:["Think","decides and remembers"], zh:["思考","做决定、记东西"] },
  sense:  { en:["Sense","notices the world"], zh:["感知","感知周围"] },
  output: { en:["Output","shows you something"], zh:["输出","显示给你看"] },
  power:  { en:["Power","keeps it alive"], zh:["电源","负责供电"] },
  connect:{ en:["Connect","links to other things"], zh:["连接","和别的东西相连"] },
  body:   { en:["Body","holds it together"], zh:["机身","把大家固定在一起"] }
};
const PART_GROUPS = ["think", "sense", "output", "power", "connect", "body"];
const G = g => { const e = (COURSE.groups && COURSE.groups[g]) || GROUPS_KIT[g]; return e[LANG] || e.en; };

/* one part, in the current language: { g, ch, ext, lab, sub, word, name, what, does, how, facts, note }
   ext: true for a device outside the board that the learner adds (a computer, a battery, a sensor, a servo). It gets its own
   card, is drawn with a dashed outline, and its card says it is not on the board. */
const P = id => { const p = PARTS[id]; return Object.assign({ g:p.g, ch:p.ch, ext:!!p.ext }, p.en, LANG === "zh" ? p.zh : {}); };
const partIds = () => { const v = VIEW(); if (v.parts) return typeof v.parts === "function" ? v.parts() : v.parts; const n = chapterNo(); return Object.keys(PARTS).filter(id => PARTS[id].ch.includes(n)); };

function partsListHTML(){
  const ids = partIds().filter(id => !S.filter || PARTS[id].g === S.filter);
  if (!partIds().length) return "";
  const head = `<div class="pl-head"><h4 class="sechead">${esc(t("listHead"))}</h4>${S.filter ? `<button class="pl-all" data-filter="${S.filter}">${esc(t("showAll"))}</button>` : ""}</div>`;
  return `<section class="detsec plist">${head}${PART_GROUPS.map(g => { const list = ids.filter(id => PARTS[id].g === g); return list.length ? `<div class="pl-g" style="${col(g)}"><p class="pl-gh"><i></i>${esc(G(g)[0])}</p><div class="pl-items">${list.map(id => `<button class="pl-item" data-part="${id}">${esc(P(id).lab)}</button>`).join("")}</div></div>` : ""; }).join("")}</section>`;
}

const tryList = items => `<section class="tryblock"><h4 class="sechead">${esc(t("tryThese"))}</h4><ol class="trylist">${items.map(w => `<li><span class="tl-text">${L(w)}</span></li>`).join("")}</ol></section>`;
const backLink = () => `<button class="backlink" data-back>${esc(t("allParts"))}</button>`;
const fold = (key, title, inner) => `<section class="detsec" data-fold="${key}"><h4>${esc(title)}</h4>${inner}</section>`;
const safetyHTML = s => `<p class="safety"><b>${esc(L(s.lead))}</b> ${esc(L(s.text))}</p>`;

/* a big-picture card (no part chosen): { kicker, title, lead, blocks:[{ h, p }] } */
const overviewCardHTML = c => `<p class="kicker">${esc(L(c.kicker))}</p><h3>${esc(L(c.title))}</h3><p>${esc(L(c.lead))}</p><!--DET-->${(c.blocks || []).map(b => `<section class="detsec"><h4 class="sechead">${esc(L(b.h))}</h4><p>${esc(L(b.p))}</p></section>`).join("")}`;
/* the card: "Pick a part" with the view's tips, or one part. "<!--DET-->" splits the lead from the detail (the frame places each half) */
function cardHTML(){
  if (!S.selected){
    const ch = CH(), v = VIEW();
    if (v.card) return overviewCardHTML(v.card);
    return `<p class="kicker">${esc(t("partCard"))}</p><h3>${esc(t("pickPart"))}</h3>${tryList(v.tips || [])}${ch.safety ? safetyHTML(ch.safety) : ""}`;
  }
  const p = P(S.selected), g = G(p.g), n = chapterNo(), later = p.ch.filter(c => c > n);
  return `${backLink()}<span class="tag" style="${col(p.g)}"><i></i>${esc(g[0])} · ${esc(g[1])}</span>
    <h3>${esc(p.word)}</h3>
    <p class="real">${esc(p.name)}</p>
    <dl>
      <div><dt>${esc(t("dtWhat"))}</dt><dd>${esc(p.what)}</dd></div>
      <div><dt>${esc(t("dtDoes"))}</dt><dd>${esc(p.does)}</dd></div>
    </dl>
    <!--DET-->${fold("more", t("moreDetail"), `<dl><div><dt>${esc(t("dtHow"))}</dt><dd>${esc(p.how)}</dd></div></dl>`)}
    <div class="facts">${p.facts.map(f => `<span>${esc(f)}</span>`).join("")}</div>
    ${p.note ? `<p class="seealso">${esc(p.note)}</p>` : ""}
    ${p.ext ? `<p class="seealso">${esc(t("extPart"))}</p>` : ""}
    ${p.safety ? safetyHTML(p.safety) : ""}
    ${!p.ch.includes(n) && later.length ? `<p class="seealso">${esc(t("laterChapter", { n:later[0] }))}</p>` : ""}`;
}

/* ---------- choosing and filtering ---------- */
function paintMarks(){
  document.querySelectorAll(".fig [data-part]").forEach(e => e.toggleAttribute("data-on", e.dataset.part === S.selected));
  document.querySelectorAll(".fig").forEach(f => {
    if (S.filter) f.setAttribute("data-filter", S.filter); else f.removeAttribute("data-filter");
    f.querySelectorAll("[data-g]").forEach(e => e.toggleAttribute("data-match", e.dataset.g === S.filter));
  });
  document.querySelectorAll(".pl-item").forEach(bt => bt.setAttribute("aria-current", String(bt.dataset.part === S.selected)));
  if (viewer) viewer.marks();
}
const paintLegend = () => document.querySelectorAll(".legend button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filter === S.filter)));
/* fromDrawing: the tap came from the picture itself, so the view stays where the learner put it */
function select(id, fromDrawing){
  S.selected = id;                                                         // tapping the same part again keeps its card
  if (viewer && !fromDrawing && viewer.focus(id)) syncSpread();
  if (S.filter && PARTS[id].g !== S.filter) S.filter = null;
  paintLegend(); fillPanel(cardHTML()); paintMarks();
}
function setFilter(g){
  S.filter = S.filter === g ? null : g;
  if (S.selected && S.filter && PARTS[S.selected].g !== S.filter) S.selected = null;
  paintLegend(); fillPanel(cardHTML()); paintMarks();
}
function unselect(){ S.selected = null; fillPanel(cardHTML()); paintMarks(); }
