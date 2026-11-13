/* ===================== stories: follow one signal, step by step, on the road map (chapter 5) =====================
   A chapter with stories:{
     map:"roads", viewBox?,                         the chapter whose road map the stories walk on (a wider viewBox makes room)
     nodes:{ id:[x, y] }, roads:[[from, to, kind, { en, zh }, both?, bend?]],
                                                    things only the stories need (the computer, a sensor you add), drawn dashed
     list:[{ id, en:{ t, goal }, zh, steps:[{ roads:[[from, to, kind]…], at:[nodeIds], form, now:{ en, zh }, en:{ t, text }, zh }] }] }
   - goal: one line: what the story achieves and what the device does in it
   - each step lights its roads (dots show the direction) and rings the parts in `at`; earlier steps stay half-lit
   - form + now: what is travelling right now, shown under the map: energy, file, bits, voltage, beat, number, think
   Tapping a part on the map shows its card; "← Back to the story" returns. */

const STORYC = () => CH().stories;
const STORY = () => { const c = STORYC(); return c.list.find(s => s.id === S.story[CH().id]) || c.list[0]; };
const STEP = () => { const st = STORY().steps; return st[clamp(S.step || 0, 0, st.length - 1)]; };
const XL = o => Object.assign({}, o, o.en, LANG === "zh" ? o.zh : {});
/* the map of another chapter, plus the nodes and roads only the stories need */
function storyMap(){
  const c = STORYC(), base = COURSE.chapters.find(x => x.id === c.map).roads;
  return Object.assign({}, base, { viewBox:c.viewBox || base.viewBox, nodes:Object.assign({}, base.nodes, c.nodes || {}), roads:base.roads.concat(c.roads || []) });
}
const storyListDef = () => { const c = STORYC();
  return { kind:"story", cur:STORY().id, word:{ en:"Story", zh:"个故事" },
    items:c.list.map(s => ({ id:s.id, label:XL(s).t })),
    title:{ en:"Stories", zh:"故事" },
    head:{ en:`${c.list.length} stories · follow one signal`, zh:`${c.list.length} 个故事 · 跟着一个信号走` },
    sub:{ en:"Pick a story, then step through it.", zh:"选一个故事，一步一步看。" } }; };

/* which roads a step lights, by from / to / kind (either direction) */
const stepRoads = step => { const all = roadList(); return (step.roads || []).map(([a, b, k]) => all.find(r => ((r.a === a && r.b === b) || (r.a === b && r.b === a)) && (!k || r.kind === k))).filter(Boolean); };

/* what is travelling right now: a small picture and a few words, under the map */
const FORM_ICON = {
  energy:`<circle cx="6" cy="10" r="3.5" style="fill:var(--power)"/><circle cx="16" cy="10" r="3.5" style="fill:var(--power)"/><circle cx="26" cy="10" r="3.5" style="fill:var(--power)"/>`,
  file:`<path d="M9 2h10l6 6v11H9z" style="fill:var(--card);stroke:var(--ink);stroke-width:1.5"/><path d="M19 2v6h6" style="fill:none;stroke:var(--ink);stroke-width:1.5"/><path d="M12 12h9M12 15h9" style="stroke:var(--muted);stroke-width:1.2"/>`,
  bits:`<text x="17" y="15" text-anchor="middle" style="font-family:var(--f-mono);font-size:12px;font-weight:600;fill:var(--connect)">1 0 1</text>`,
  voltage:`<path d="M2 14 C8 4 12 4 17 10 S26 16 32 6" style="fill:none;stroke:var(--sense);stroke-width:2"/>`,
  beat:`<path d="M2 15H7V5H12V15H17V5H22V15H27V5H32" style="fill:none;stroke:var(--think);stroke-width:1.6"/>`,
  number:`<text x="17" y="15" text-anchor="middle" style="font-family:var(--f-mono);font-size:12px;font-weight:600;fill:var(--think)">1500</text>`,
  think:`<circle cx="17" cy="10" r="8" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.5"/><text x="17" y="14" text-anchor="middle" style="font-size:11px;font-weight:700;fill:var(--think)">?</text>`,
  picture:`<rect x="3" y="3" width="28" height="14" rx="2" style="fill:var(--output-t);stroke:var(--output);stroke-width:1.4"/><rect x="14" y="17" width="6" height="2" style="fill:var(--output)"/>`,
  radio:`<circle cx="5" cy="10" r="2.5" style="fill:var(--connect)"/><path d="M9 4 A6 6 0 0 1 9 16" style="fill:none;stroke:var(--connect);stroke-width:1.6"/><path d="M14 1 A9 9 0 0 1 14 19" style="fill:none;stroke:var(--connect);stroke-width:1.6"/>`
};
const signowHTML = step => `<div class="signow" id="signow"><span class="sn-lab">${esc(tz("Travelling now", "现在传的是"))}</span><svg class="sn-ico" viewBox="0 0 34 20" aria-hidden="true">${FORM_ICON[step.form] || ""}</svg><b>${esc(L(step.now))}</b></div>`;
const transportHTML = () => { const steps = STORY().steps, cur = clamp(S.step || 0, 0, steps.length - 1);
  return `<div class="transport"><button class="btn ghost small" data-sstep="-1" ${cur <= 0 ? "disabled" : ""}>${esc(tz("‹ Back", "‹ 上一步"))}</button><div class="dots">${steps.map((_, i) => `<button data-sgo="${i}" class="${i < cur ? "done" : i === cur ? "now" : ""}" aria-label="${esc(tz(`Step ${i + 1}`, `第 ${i + 1} 步`))}">${i + 1}</button>`).join("")}</div><button class="btn ghost small" data-sstep="1" ${cur >= steps.length - 1 ? "disabled" : ""}>${esc(tz("Next ›", "下一步 ›"))}</button></div>`; };

function storyCard(){
  if (S.node){
    const id = S.node, p = P(id), g = G(p.g);
    return `<button class="backlink" data-back>${esc(tz("← Back to the story", "← 回到故事"))}</button><span class="tag" style="${col(p.g)}"><i></i>${esc(g[0])} · ${esc(g[1])}</span><h3>${esc(p.word)}</h3><p class="real">${esc(p.name)}</p>
      <dl><div><dt>${esc(t("dtWhat"))}</dt><dd>${esc(p.what)}</dd></div><div><dt>${esc(t("dtDoes"))}</dt><dd>${esc(p.does)}</dd></div></dl>${p.ext ? `<p class="seealso">${esc(t("extPart"))}</p>` : ""}`;
  }
  const s = XL(STORY()), steps = STORY().steps, cur = clamp(S.step || 0, 0, steps.length - 1), st = XL(steps[cur]);
  return `<p class="kicker">${esc(tz("Story", "故事"))}</p><h3>${esc(s.t)}</h3><p>${esc(s.goal)}</p>
    <div class="stepnow"><span class="sechead">${esc(tz(`Step ${cur + 1} of ${steps.length}`, `第 ${cur + 1} 步 / 共 ${steps.length} 步`))}</span><b>${esc(st.t)}</b><p>${esc(st.text)}</p></div>
    <!--DET--><section class="detsec"><h4 class="sechead">${esc(tz("All the steps", "所有步骤"))}</h4><ol class="steps">${steps.map((x, i) => `<li><button data-sgo="${i}" class="${i < cur ? "done" : i === cur ? "now" : ""}"><span>${i + 1}</span>${esc(XL(x).t)}</button></li>`).join("")}</ol></section>`;
}
function paintStory(){
  const svg = $(".map"); if (!svg) return;
  const steps = STORY().steps, cur = clamp(S.step || 0, 0, steps.length - 1);
  const now = new Set(stepRoads(steps[cur]).map(r => r.i)), done = new Set(), inStory = new Set(), hot = new Set(steps[cur].at || []);
  steps.forEach((st, i) => { stepRoads(st).forEach(r => { inStory.add(r.a); inStory.add(r.b); if (i < cur) done.add(r.i); if (i === cur){ hot.add(r.a); hot.add(r.b); } }); (st.at || []).forEach(id => inStory.add(id)); });
  svg.querySelectorAll("[data-road]").forEach(p => { const i = +p.dataset.road; p.classList.toggle("cur", now.has(i)); p.classList.toggle("done", done.has(i) && !now.has(i)); });
  svg.querySelectorAll("[data-node]").forEach(n => { n.classList.toggle("off", !inStory.has(n.dataset.node)); n.classList.toggle("on", hot.has(n.dataset.node) || n.dataset.node === S.node); });
  svg._active = now;
  const sn = $("#signow"); if (sn) sn.outerHTML = signowHTML(steps[cur]);
  const tr = $(".transport"); if (tr) tr.outerHTML = transportHTML();
  repaintList(storyListDef());
  fillPanel(storyCard());
}
function renderStories(el, c){
  ROADS_OVERRIDE = storyMap();
  el.innerHTML = frame({ list:storyListDef(), parts:false,
    body:`${mapBarHTML()}<div class="mapwrap">${roadsMapHTML().replace('class="fig map"', 'class="fig map story"')}</div>`,
    under:signowHTML(STEP()), tool:transportHTML(),
    nav:(c.nav || []).map(navBtn).join("") });
  paintStory();
  demo = roadsAnimator(true); watchMap(showStep); runDemo();
}
/* the canvas follows the story: what this step lights must be in sight */
const showStep = () => { const st = STEP(); mapShow([...(st.at || []), ...stepRoads(st).flatMap(r => [r.a, r.b])]); };
const pickStory = id => { S.story[CH().id] = id; S.step = 0; S.node = null; stopDemo(); renderChapter(); };
const goStep = i => { S.step = clamp(i, 0, STORY().steps.length - 1); S.node = null; paintStory(); showStep(); };
