/* ===================== demo library: the hands-on figures for chapter 3 stations =====================
   Each demo type is a function (root, setup) → { tick?(dt, time), destroy? }. It writes its controls (.demo-ctl, .slider)
   and one SVG figure into root. The course passes the numbers in `setup` (from the fact sheet) and the words where they
   are device-specific; everything else is shared. Text is EN/中文 (tz). Figures are 640 × 300.
     The device's name comes from COURSE.device ({ en, zh }). Numbers and pin names have no defaults on purpose: a demo must show
     the real device, because people remember the picture, not the note beside it.
     SENTENCES NEVER GO IN SVG: <text> doesn't wrap. Anything over 3–4 words goes in a caption under the figure (captionHTML).
     Short labels inside a shape carry data-fit="max width": fitTexts() shrinks them to fit.

     Inside a device
     workers    cores sharing jobs              setup:{ cores:2, jobs:[[group, {en,zh}]…], groups?:[{ n, en, zh, speed }], chip? }
     chipmap    one chip unfolded into blocks   setup:{ name, blocks:[{ id, name, n, at:[x,y,w,h], g?, cap, station? }], note? }
     parallel   one worker or many on one job   setup:{ cores:10, one:{en,zh}, many:{en,zh}, read? }
     pattern    a learned pattern recogniser    setup:{ cores:16, samples:[{ name, input, answer }] }
     shared     two workers, one memory         setup:{ who:[{en,zh},{en,zh}], size:{en,zh}, read? }
     memory     storage (keeps) and working memory (wiped)   setup:{ shelf:{ label, items }, desk:{ label, items }, copy }
     beat       a clock crystal and a faster brain           setup:{ crystal:12, brain:133 }  (MHz)
     boot       hold a button while powering up → new-program mode
     reading    a voltage becomes a number      setup:{ vmax:3.3, max:4095, pin:"GP26", what:{en,zh} }
     thermo     a thermometer inside the chip (no numbers)
     blink      a pin switching a light         setup:{ pin:"GP25" }
     regulator  any input in a range → one steady output     setup:{ min, max, out, outLabel, presets:[[volts, {en,zh}]…] }
     powerpath  two power sources and a one-way valve
     pin        one pin: send or listen         setup:{ pins:[…], v:3.3, chip:"RP2040" }
     ports      one socket carrying several things           setup:{ things:[{ id, name, lanes:{ power, data, video }, read }], socket? }
     radio      waves through the air           setup:{ modes:[{ id, tab, targets:[{en,zh}…], read, range }] }

     A project on a board (chapter 6): project, servo, lightpair, follow, wiring, next
     Setting up a finished device (chapter 6): hookup (setup:{ things:[{ id, name, at, g, group }], lit, pick }), firstrun (setup:{ steps:[{ cap, art }] }), next (setup:{ cards:[[job, title, sub]] })
   Buttons: a toggle (power, plugged in, held) is a white button that turns dark while it is on, and its words say the state
   and how to undo it; a one-off action (drop a file, a preset) stays white; a choice between options is a row of pills.
   Steps that depend on each other are numbered and joined by arrows; a step that can't work yet is greyed out, and the step
   to do next is outlined. */

const NS = "http://www.w3.org/2000/svg";
const E = (tag, attrs = {}, parent) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); if (parent) parent.appendChild(el); return el; };
const lerp = (a, b, k) => a + (b - a) * k;
const pillsHTML = (name, opts, cur) => `<div class="seg" role="group">${opts.map(([v, l]) => `<button data-${name}="${v}" aria-pressed="${String(v) === String(cur)}">${esc(l)}</button>`).join("")}</div>`;
const pressSeg = (root, name, v) => root.querySelectorAll(`[data-${name}]`).forEach(b => b.setAttribute("aria-pressed", String(b.dataset[name] === String(v))));
const onSeg = (root, name, fn) => root.querySelectorAll(`[data-${name}]`).forEach(b => b.addEventListener("click", () => { pressSeg(root, name, b.dataset[name]); fn(b.dataset[name]); }));
const sliderHTMLd = (id, label, min, max, step, val) => `<div class="slider"><label for="${id}">${esc(label)}</label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"><output id="${id}Out"></output></div>`;
const fmt = (v, d = 1) => v.toFixed(d);
const devName = () => L(COURSE.device || { en:COURSE.name || "the device", zh:COURSE.name || "这台设备" });
/* a sentence that explains a figure: real wrapping text under it */
const captionHTML = (text = "") => `<p class="dcaption" data-caption>${esc(text)}</p>`;
/* shrink short labels that would leave their shape (data-fit = the width they may use) */
function fitTexts(root){ root.querySelectorAll("text[data-fit]").forEach(t => { t.style.fontSize = ""; const max = +t.dataset.fit, w = t.getComputedTextLength ? t.getComputedTextLength() : 0; if (w > max){ const f = parseFloat(getComputedStyle(t).fontSize); t.style.fontSize = (f * max / w).toFixed(1) + "px"; } }); }
/* drawn cores: a labelled block of small cells */
/* one drawing language from chapter 3 on: the device is the dark box, anything else is the road map's white card with a dot in its job's
   colour (dashed when it isn't part of the device), and a connection is a road with dots moving along it */
const deviceBox = (x, y, w, h, title, sub) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="fill:var(--pcb);stroke:var(--pcb-edge);stroke-width:1.5"/><text x="${x + w / 2}" y="${y + h / 2 + (sub ? -3 : 6)}" text-anchor="middle" class="dlab dpart" data-fit="${w - 16}" style="fill:#e8efe9">${esc(title)}</text>${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 17}" text-anchor="middle" class="dnote dsub" data-fit="${w - 16}" style="fill:#b9c3bd">${esc(sub)}</text>` : ""}`;
const partBox = (cx, cy, g, title, sub, { w, dashed = true } = {}) => { const W = w || Math.max(textW(title, 9.6, 17), sub ? textW(sub, 8.4, 15.5) : 0) + 54, H = sub ? 56 : 42, x = cx - W / 2, y = cy - H / 2;
  return `<g style="--c:var(--${g})"><rect x="${x}" y="${y}" width="${W}" height="${H}" rx="12" style="fill:var(--card);stroke:var(--${g});stroke-width:1.2${dashed ? ";stroke-dasharray:5 4" : ""}"/><circle cx="${x + 18}" cy="${cy}" r="5.5" style="fill:var(--${g})"/><text x="${x + 32}" y="${cy + (sub ? -4 : 6)}" class="dlab dpart" data-fit="${W - 44}">${esc(title)}</text>${sub ? `<text x="${x + 32}" y="${cy + 17}" class="dnote dsub" data-fit="${W - 44}">${esc(sub)}</text>` : ""}</g>`; };
const cellsHTML = (n, x, y, w, h, style = "fill:var(--think);opacity:.55") => { const cols = Math.min(n, Math.max(1, Math.ceil(Math.sqrt(n * w / Math.max(h, 1))))), rows = Math.ceil(n / cols), gw = 3, cw = (w - gw * (cols - 1)) / cols, ch = Math.min(cw * 1.1, (h - gw * (rows - 1)) / rows);
  return Array.from({ length:n }, (_, i) => `<rect data-cell="${i}" x="${(x + (i % cols) * (cw + gw)).toFixed(1)}" y="${(y + ((i / cols) | 0) * (ch + gw)).toFixed(1)}" width="${cw.toFixed(1)}" height="${ch.toFixed(1)}" rx="2" style="${style}"/>`).join(""); };
/* a trace of a 0/1 wire over the last `span` seconds, drawn between x0..x1, y for 1 = yHi, 0 = yLo */
function traceStep(hist, clock, span, x0, x1, yHi, yLo){
  let pts = "", prev = null;
  hist.forEach(([tm, v]) => { const x = x0 + (tm - (clock - span)) / span * (x1 - x0), y = v ? yHi : yLo; if (prev !== null && prev !== y) pts += `${x.toFixed(1)},${prev} `; pts += `${x.toFixed(1)},${y} `; prev = y; });
  return pts;
}
/* hold-to-press: pointer and keyboard */
function holdable(els, set){
  const down = e => { e.preventDefault(); set(true); }, up = () => set(false);
  els.forEach(el => { el.addEventListener("pointerdown", down); el.addEventListener("pointerup", up); el.addEventListener("pointerleave", up);
    el.addEventListener("keydown", e => { if (e.key === " " || e.key === "Enter"){ e.preventDefault(); set(true); } }); el.addEventListener("keyup", up); });
}

const DEMOS = {
  /* ---------- the cores sharing a line of jobs. Always draws the device's real number of cores ---------- */
  workers(root, { jobs = [], cores:max, groups = null, chip = null }){
    if (!max) throw new Error("workers: setup.cores is required (the real number of cores)");
    const speeds = groups ? groups.flatMap(g => Array(g.n).fill(g.speed || 1)) : Array(max).fill(1);
    const many = max > 2, word = n => tz(n === 1 ? "1 core" : `${n} cores`, `${n} 个核心`);
    const big = c => `<g data-core="${c}"><rect x="298" y="${36 + c * 130}" width="190" height="104" rx="14" class="corebox" style="stroke:var(--think)"/><text x="312" y="${58 + c * 130}" class="dlab">${esc(tz("Core " + (c + 1), "核心 " + (c + 1)))}</text><rect x="312" y="${116 + c * 130}" width="160" height="8" rx="4" style="fill:var(--line)"/><rect data-bar="${c}" x="312" y="${116 + c * 130}" width="0" height="8" rx="4" style="fill:var(--think)"/></g>`;
    let y = 40, idx = 0;
    const grid = () => (groups || [{ n:max, en:"", zh:"" }]).map(g => { const label = L(g), cols = Math.min(g.n, 6), w = 26, gap = 4, h = Math.ceil(g.n / cols) * (w + gap);
      const out = `${label ? `<text x="302" y="${y + 11}" class="dnote" data-fit="180">${esc(label)}</text>` : ""}` + Array.from({ length:g.n }, (_, i) => { const c = idx++, x = 302 + (i % cols) * (w + gap), yy = y + 20 + ((i / cols) | 0) * (w + gap); return `<g data-core="${c}"><rect x="${x}" y="${yy}" width="${w}" height="${w}" rx="6" class="corebox" style="stroke:var(--think)"/><rect data-bar="${c}" x="${x + 3}" y="${yy + w - 7}" width="0" height="4" rx="2" style="fill:var(--think)"/></g>`; }).join("");
      y += h + 34; return out; }).join("");
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("cores", [[1, word(1)], [max, word(max)]], max)}<span class="demo-read" id="dRead"></span></div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("Jobs waiting in a line for the cores", "任务排队等核心来处理"))}">
      <text x="14" y="26" class="dcap">${esc(tz("JOBS ARRIVING", "任务排队"))}</text>
      <rect x="14" y="36" width="250" height="74" rx="12" class="lane"/>
      <path d="M268 73 H292" class="arrow"/>
      ${chip ? `<rect x="290" y="30" width="206" height="250" rx="18" style="fill:none;stroke:var(--think);stroke-width:1.2;stroke-dasharray:5 4"/><text x="298" y="22" class="dcap" data-fit="200" style="fill:var(--think)">${esc(L(chip))}</text>` : ""}
      ${many ? grid() : Array.from({ length:max }, (_, c) => big(c)).join("")}
      <text x="514" y="26" class="dcap">${esc(tz("DONE", "完成"))}</text>
      <rect x="514" y="36" width="112" height="234" rx="12" class="lane"/>
      <g data-tasks></g>
      <text x="139" y="138" text-anchor="middle" class="dnote" data-over></text>
    </svg>`;
    const svg = root.querySelector("svg"), layer = svg.querySelector("[data-tasks]"), read = root.querySelector("#dRead"), over = svg.querySelector("[data-over]");
    fitTexts(svg);
    let cores = max, tasks = [], arrive = 0.2, done = 0, n = 0;
    const gapBetween = () => (many ? 1.3 / max : 0.65) * 1.25;              // jobs arrive a little slower than all the cores can finish them
    const reset = () => { tasks.forEach(tk => tk.el.remove()); tasks = []; done = 0; arrive = 0.2; };
    const dimCores = () => svg.querySelectorAll("[data-core]").forEach(g => { g.style.opacity = +g.dataset.core < cores ? 1 : 0.25; });
    onSeg(root, "cores", v => { cores = +v; reset(); dimCores(); });
    const spawn = () => {
      const [g, name] = jobs[n++ % jobs.length];
      const el = E("g", {}, layer), word2 = L(name), w = Math.min(104, Math.max(48, Math.round(textW(word2, 7.6, 14) + 20)));   // each box fits its word
      E("rect", { width:w, height:34, rx:7, style:`fill:var(--${g}-t);stroke:var(--${g});stroke-width:1.6` }, el);
      const tx = E("text", { x:w / 2, y:21.5, "text-anchor":"middle", class:"dtask", "data-fit":w - 10, style:`fill:var(--${g})` }, el); tx.textContent = word2; fitTexts(el);
      tasks.push({ el, w, state:"queue", x:-80, y:56, p:0, core:-1, life:0 });
    };
    return { tick(dt){
      arrive -= dt;
      if (arrive <= 0){ arrive = gapBetween(); if (tasks.filter(tk => tk.state === "queue").length < 14) spawn(); }
      for (let c = 0; c < max; c++){
        let w = c < cores ? tasks.find(tk => tk.state === "work" && tk.core === c) : null;
        if (c < cores && !w){ w = tasks.find(tk => tk.state === "queue"); if (w){ w.state = "work"; w.core = c; w.p = 0; } }
        if (w){ w.p += dt / 1.3 * speeds[c]; if (w.p >= 1){ w.state = "done"; w.slot = done % 6; done++; } }
        const bar = svg.querySelector(`[data-bar="${c}"]`); bar.setAttribute("width", w && w.state === "work" ? ((many ? 20 : 160) * w.p).toFixed(1) : 0);
      }
      const queue = tasks.filter(tk => tk.state === "queue");
      let qx = 258; queue.forEach(tk => { qx -= tk.w; tk.tx = qx; tk.ty = 56; tk.vis = qx >= 18 ? 1 : 0; qx -= 8; });
      tasks.forEach(tk => {
        if (tk.state === "work"){ if (many){ const b = svg.querySelector(`[data-core="${tk.core}"] rect`); tk.tx = +b.getAttribute("x") + 13 - tk.w / 2; tk.ty = +b.getAttribute("y"); tk.vis = 0; } else { tk.tx = 393 - tk.w / 2; tk.ty = 68 + tk.core * 130; tk.vis = 1; } }
        if (tk.state === "done"){ tk.tx = 570 - tk.w / 2; tk.ty = 46 + tk.slot * 37; tk.life += dt; tk.vis = Math.max(0, 1 - Math.max(0, tk.life - 2.2)); }
        tk.x = lerp(tk.x, tk.tx, Math.min(1, dt * 9)); tk.y = lerp(tk.y, tk.ty, Math.min(1, dt * 9));
        tk.el.setAttribute("transform", `translate(${tk.x.toFixed(1)} ${tk.y.toFixed(1)})`); tk.el.style.opacity = tk.vis;
      });
      tasks = tasks.filter(tk => { if (tk.state === "done" && tk.life > 3.3){ tk.el.remove(); return false; } return true; });
      const hidden = queue.filter(tk => !tk.vis).length;
      over.textContent = hidden ? tz(`+${hidden} more waiting…`, `还有 ${hidden} 个在等…`) : "";
      read.textContent = tz(`Waiting: ${queue.length} · Done: ${done}`, `排队：${queue.length} · 完成：${done}`);
    } };
  },

  /* ---------- bookshelf (keeps without power) and desk (wiped) ---------- */
  memory(root, { shelf, desk, copy }){
    const books = shelf.items.map(L), papers = desk.items.map(L);
    root.innerHTML = `<div class="demo-ctl"><button class="btn ghost small" data-mem aria-pressed="false">${esc(tz("Cut the power", "断电"))}</button><span class="demo-read" id="dRead">${esc(tz("Power on", "通电中"))}</span></div>
    <svg class="dsvg" viewBox="0 0 640 300" data-memsvg data-state="on" role="img" aria-label="${esc(tz("Storage and working memory", "存储和工作内存"))}">
      <text x="40" y="26" class="dcap" data-fit="280" style="fill:var(--ink)">${esc(L(shelf.label))}</text>${shelf.sub ? `<text x="40" y="48" class="dnote">${esc(L(shelf.sub))}</text>` : ""}
      ${books.map((b, i) => `<rect x="40" y="${110 + i * 60}" width="240" height="8" rx="3" class="shelf"/><g class="book"><rect x="56" y="${68 + i * 60}" width="208" height="40" rx="6" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.6"/><text x="160" y="${93 + i * 60}" text-anchor="middle" class="dlab" data-fit="194">${esc(b)}</text></g>`).join("")}
      <text x="360" y="26" class="dcap" data-fit="270" style="fill:var(--ink)">${esc(L(desk.label))}</text>${desk.sub ? `<text x="360" y="48" class="dnote">${esc(L(desk.sub))}</text>` : ""}
      <rect x="350" y="250" width="260" height="12" rx="4" class="shelf"/><rect x="368" y="262" width="10" height="30" class="shelf"/><rect x="582" y="262" width="10" height="30" class="shelf"/>
      ${papers.map((p, i) => `<g class="paper" style="transition-delay:${i * 90}ms"><rect x="${372 - i * 4}" y="${56 + i * 62}" width="220" height="50" rx="5" style="fill:var(--card);stroke:var(--muted);stroke-width:1.2"/><text x="${482 - i * 4}" y="${86 + i * 62}" text-anchor="middle" class="dlab" data-fit="204">${esc(p)}</text></g>`).join("")}
      <g class="paper copy"><rect x="372" y="118" width="220" height="50" rx="5" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.4;stroke-dasharray:5 4"/><text x="482" y="148" text-anchor="middle" class="dlab" data-fit="204">${esc(L(copy))}</text></g>
      <text x="480" y="230" text-anchor="middle" class="dnote" data-memnote></text>
      <rect x="0" y="0" width="640" height="300" class="dark-over"/>
    </svg>`;
    fitTexts(root);
    const svg = root.querySelector("[data-memsvg]"), btn = root.querySelector("[data-mem]"), read = root.querySelector("#dRead"), note = svg.querySelector("[data-memnote]");
    btn.addEventListener("click", () => {
      const next = svg.dataset.state === "off" ? "boot" : "off";
      svg.dataset.state = next;
      btn.setAttribute("aria-pressed", String(next === "off"));
      btn.textContent = next === "off" ? tz("Power cut · turn back on", "已断电 · 重新开机") : tz("Cut the power", "断电");
      read.textContent = next === "off" ? tz("Power off: the working memory is empty", "断电了：工作内存清空了") : tz("Back on: fresh start", "重新开机：从头开始");
      note.textContent = next === "boot" ? tz("It fills up again as the program runs.", "程序跑起来以后，它又会慢慢摆满。") : "";
    });
    return {};
  },

  /* ---------- a clock crystal's beat, and a brain that steps faster ---------- */
  beat(root, { crystal = 12, brain = 133, labels = {} }){
    const ratio = brain / crystal;
    root.innerHTML = `${sliderHTMLd("dBeat", tz("Slow motion", "慢动作"), 1, 10, 1, 4)}
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("The crystal's beat and the brain's faster steps", "晶振的拍子和大脑更快的步子"))}">
      <text x="20" y="28" class="dcap" style="fill:var(--ink)">${esc(labels.crystal ? L(labels.crystal) : tz(`CRYSTAL · ${crystal} MILLION BEATS A SECOND`, `晶振 · 每秒 ${crystal} 百万拍`))}</text>
      <rect x="20" y="40" width="96" height="70" rx="10" style="fill:#c7cacf;stroke:#6f747a;stroke-width:1.4"/><text x="68" y="81" text-anchor="middle" class="dlab" style="fill:#3a3d42">${crystal}.0</text>
      <circle data-xled cx="104" cy="52" r="6" style="fill:var(--think);opacity:.15"/>
      <rect x="136" y="40" width="484" height="70" rx="10" class="lane"/>
      <polyline data-xwave points="" style="fill:none;stroke:var(--think);stroke-width:2.5;stroke-linejoin:round"/>
      <text x="20" y="158" class="dcap" style="fill:var(--ink)">${esc(labels.brain ? L(labels.brain) : tz(`BRAIN · UP TO ${brain} MILLION STEPS A SECOND`, `大脑 · 每秒最多 ${brain} 百万步`))}</text>
      <rect x="20" y="170" width="96" height="70" rx="10" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.6"/><rect x="30" y="178" width="76" height="54" rx="4" style="fill:#1b1c1f"/><text x="68" y="210" text-anchor="middle" class="chiptxt" data-fit="68" style="fill:#c9c4b8">${esc(labels.chip ? L(labels.chip) : "")}</text>
      <rect x="136" y="170" width="484" height="70" rx="10" class="lane"/>
      <polyline data-bwave points="" style="fill:none;stroke:var(--think);stroke-width:1.6;stroke-linejoin:round"/>
      <text x="320" y="282" text-anchor="middle" class="dnote">${esc(tz(`In one crystal beat, the brain takes about ${Math.round(ratio)} steps.`, `晶振打一拍，大脑大约走 ${Math.round(ratio)} 步。`))}</text>
    </svg>`;
    const svg = root.querySelector("svg"), xw = svg.querySelector("[data-xwave]"), bw = svg.querySelector("[data-bwave]"), led = svg.querySelector("[data-xled]"), sl = root.querySelector("#dBeat"), out = root.querySelector("#dBeatOut");
    let clock = 0;
    const wave = (f, y0, h, phase) => { let pts = ""; const N = Math.min(600, Math.ceil(f * 4 * 8) + 2);
      for (let i = 0; i <= N; i++){ const tt = i / N * 4, x = 140 + tt / 4 * 476, v = Math.floor((clock - 4 + tt) * f * 2 + phase) % 2 === 0 ? 1 : 0; pts += `${x.toFixed(1)},${(v ? y0 : y0 + h).toFixed(1)} `; } return pts; };
    const label = () => { out.textContent = tz(`1 beat / ${(+sl.value / 2).toFixed(1)} s`, `每 ${(+sl.value / 2).toFixed(1)} 秒 1 拍`); };
    sl.addEventListener("input", label); label();
    return { tick(dt){
      clock += dt; const f = 2 / +sl.value;                                     // crystal beats per second on screen
      xw.setAttribute("points", wave(f, 52, 46, 0)); bw.setAttribute("points", wave(f * ratio, 182, 46, 0));
      led.style.opacity = Math.floor(clock * f * 2) % 2 === 0 ? 1 : 0.15;
    } };
  },

  /* ---------- hold a button while powering up: new-program mode ---------- */
  boot(root){
    const step = (n, attr, label, extra = "") => `<button class="btn ghost small" ${attr} ${extra}><span class="stepn">${n}</span><span data-l>${esc(label)}</span></button>`;
    root.innerHTML = `<div class="demo-ctl steps">${step(1, "data-hold", tz("Hold the button", "按住启动键"), 'aria-pressed="false"')}<span class="stepgo"><span class="steparrow" aria-hidden="true">→</span>${step(2, "data-plug", tz("Plug in the cable", "插上线"), 'aria-pressed="false"')}</span><span class="stepgo"><span class="steparrow" aria-hidden="true">→</span>${step(3, "data-drop", tz("Drop in a program file", "拖入程序文件"), "disabled")}</span></div><div class="demo-ctl"><span class="demo-read" id="dRead"></span></div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz(`The ${devName()} plugged into a computer`, `插到电脑上的 ${devName()}`))}">
      <text x="30" y="26" class="dcap">${esc(devName().toUpperCase())}</text>
      <rect x="60" y="60" width="96" height="200" rx="6" style="fill:var(--pcb);stroke:var(--pcb-edge);stroke-width:1.5"/>
      <rect x="88" y="46" width="40" height="24" rx="3" style="fill:#b9bdc3;stroke:#6f747a"/>
      <circle data-led cx="78" cy="84" r="5" style="fill:#f2efe4"/>
      <g data-btn><rect x="72" y="104" width="22" height="30" rx="3" style="fill:#cfd2d6;stroke:#6f747a"/><circle cx="83" cy="119" r="6" style="fill:#f4f2ec;stroke:#6f747a"/></g>
      <circle data-finger cx="83" cy="119" r="14" style="fill:none;stroke:var(--sense);stroke-width:3;opacity:0"/>
      <rect x="92" y="150" width="34" height="34" rx="3" style="fill:#1b1c1f"/>
      <path data-cable d="M108 46 C108 10 250 10 330 40" style="fill:none;stroke:var(--line);stroke-width:5;stroke-linecap:round;stroke-dasharray:8 6"/>
      <text x="340" y="26" class="dcap">${esc(tz("THE COMPUTER", "电脑"))}</text>
      <rect x="330" y="40" width="280" height="190" rx="12" style="fill:var(--card);stroke:var(--line);stroke-width:1.5"/>
      <rect x="440" y="230" width="60" height="30" style="fill:var(--line)"/>
      <g data-screen></g>
    </svg>`;
    const q = s => root.querySelector(s), svg = q("svg"), read = q("#dRead"), scr = svg.querySelector("[data-screen]");
    let holding = false, mode = "off", fresh = false, clock = 0;
    const paint = () => {
      q("[data-hold]").setAttribute("aria-pressed", String(holding));
      q("[data-hold] [data-l]").textContent = holding ? tz("Holding · let go", "按住中 · 松开") : tz("Hold the button", "按住启动键");
      q("[data-plug]").setAttribute("aria-pressed", String(mode !== "off"));
      q("[data-plug] [data-l]").textContent = mode === "off" ? tz("Plug in the cable", "插上线") : tz("Plugged in · unplug", "已插上 · 拔掉");
      q("[data-drop]").disabled = mode !== "drive";
      const next = mode === "off" ? (holding ? "plug" : "hold") : mode === "drive" ? "drop" : "";         // the step to do next is outlined
      ["hold", "plug", "drop"].forEach(k => q(`[data-${k}]`).classList.toggle("next", k === next));
      svg.querySelector("[data-finger]").style.opacity = holding ? 1 : 0;
      svg.querySelector("[data-cable]").style.cssText = mode === "off" ? "fill:none;stroke:var(--line);stroke-width:5;stroke-linecap:round;stroke-dasharray:8 6" : "fill:none;stroke:var(--power);stroke-width:5;stroke-linecap:round";
      scr.innerHTML = mode === "off" ? `<text x="470" y="140" text-anchor="middle" class="dnote">${esc(tz("Nothing plugged in", "什么都没插"))}</text>`
        : mode === "drive" ? `<rect x="430" y="80" width="80" height="64" rx="6" style="fill:var(--sense-t);stroke:var(--sense);stroke-width:1.6"/><rect x="446" y="96" width="48" height="10" rx="2" style="fill:var(--sense)"/><text x="470" y="170" text-anchor="middle" class="dlab">${esc(tz("A new drive appears", "电脑上多了一个新磁盘"))}</text><text x="470" y="194" text-anchor="middle" class="dnote">${esc(tz("ready for a program file", "等你放程序文件进去"))}</text>`
        : `<text x="470" y="128" text-anchor="middle" class="dlab">${esc(fresh ? tz("New program running", "新程序在运行") : tz("Your program runs", "你的程序在运行"))}</text><text x="470" y="154" text-anchor="middle" class="dnote">${esc(tz("(it makes the little light blink)", "（小灯在闪）"))}</text>`;
      read.textContent = mode === "off" ? (holding ? tz("Keep holding, now plug in", "按住别松，现在插线") : tz("No power", "没电"))
        : mode === "drive" ? tz("New-program mode", "新程序模式") : fresh ? tz("New program running", "新程序在运行") : tz("Old program running", "原来的程序在运行");
    };
    q("[data-hold]").addEventListener("click", () => { holding = !holding; paint(); });
    q("[data-plug]").addEventListener("click", () => { if (mode === "off"){ mode = holding ? "drive" : "run"; fresh = false; } else mode = "off"; paint(); });   // the button only counts at the moment it powers up
    q("[data-drop]").addEventListener("click", () => { mode = "run"; fresh = true; holding = false; paint(); });
    paint();
    return { tick(dt){ clock += dt; svg.querySelector("[data-led]").style.fill = mode === "run" && Math.floor(clock * 2) % 2 === 0 ? "#fff3c4" : "#f2efe4";
      svg.querySelector("[data-led]").style.filter = mode === "run" && Math.floor(clock * 2) % 2 === 0 ? "drop-shadow(0 0 6px #ffd76a)" : "none"; } };
  },

  /* ---------- a voltage becomes a number ---------- */
  reading(root, { vmax = 3.3, max = 4095, pin = "", what = { en:"a knob", zh:"一个旋钮" } }){
    root.innerHTML = `${sliderHTMLd("dKnob", tz("Turn the knob", "转动旋钮"), 0, 100, 1, 40)}
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("A knob gives a voltage; the brain turns it into a number", "旋钮给出电压，大脑把它变成数字"))}">
      <text x="30" y="30" class="dcap">${esc(L(what).toUpperCase())}</text>
      <circle cx="100" cy="130" r="56" style="fill:var(--card);stroke:var(--line);stroke-width:2"/>
      <line data-pointer x1="100" y1="130" x2="100" y2="84" style="stroke:var(--sense);stroke-width:6;stroke-linecap:round"/>
      <path d="M156 130 H330" style="fill:none;stroke:var(--sense);stroke-width:4"/>
      <text x="243" y="118" text-anchor="middle" class="dlab" data-volts></text>
      <text x="243" y="152" text-anchor="middle" class="dnote">${esc(pin ? tz(`into pin ${pin}`, `接到 ${pin} 针脚`) : "")}</text>
      <rect x="330" y="80" width="270" height="100" rx="14" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.6"/>
      <text x="465" y="108" text-anchor="middle" class="dlab">${esc(tz("The brain reads", "大脑读到"))}</text>
      <text x="465" y="158" text-anchor="middle" class="dbig" data-num></text>
      <text x="40" y="228" class="dcap">0</text><text x="600" y="228" text-anchor="end" class="dcap">${max}</text>
      <rect x="40" y="236" width="560" height="14" rx="7" class="barbg" style="stroke:var(--line)"/>
      <rect data-bar x="40" y="236" width="0" height="14" rx="7" style="fill:var(--sense)"/>
      <text x="320" y="282" text-anchor="middle" class="dnote">${esc(tz(`0 volts → 0 · ${vmax} volts → ${max}`, `0 伏 → 0 · ${vmax} 伏 → ${max}`))}</text>
    </svg>`;
    const svg = root.querySelector("svg"), sl = root.querySelector("#dKnob"), out = root.querySelector("#dKnobOut");
    const paint = () => { const k = +sl.value / 100, v = k * vmax, n = Math.round(k * max), a = deg(-135 + 270 * k);
      svg.querySelector("[data-pointer]").setAttribute("x2", (100 + 46 * Math.sin(a)).toFixed(1)); svg.querySelector("[data-pointer]").setAttribute("y2", (130 - 46 * Math.cos(a)).toFixed(1));
      svg.querySelector("[data-volts]").textContent = tz(`${fmt(v, 2)} volts`, `${fmt(v, 2)} 伏`); svg.querySelector("[data-num]").textContent = n;
      svg.querySelector("[data-bar]").setAttribute("width", (560 * k).toFixed(1)); out.textContent = `${fmt(v, 2)} V`; };
    sl.addEventListener("input", paint); paint();
    return {};
  },

  /* ---------- a thermometer inside the chip: it measures the chip, not the room (no numbers: none in the sources) ---------- */
  thermo(root){
    root.innerHTML = `${sliderHTMLd("dRoom", tz("The room", "房间"), 0, 100, 1, 30)}<div class="demo-ctl"><button class="btn ghost small" data-busy aria-pressed="false">${esc(tz("Give the brain hard work", "让大脑拼命干活"))}</button></div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("A thermometer inside the brain chip", "大脑芯片里的温度计"))}">
      <rect data-room x="20" y="20" width="600" height="230" rx="16" style="fill:var(--sense-t);opacity:.5"/>
      <text x="40" y="46" class="dcap">${esc(tz("THE ROOM", "房间"))}</text>
      <rect data-chip x="200" y="70" width="150" height="150" rx="12" style="fill:var(--think-t);stroke:var(--think);stroke-width:2"/>
      <text x="275" y="100" text-anchor="middle" class="dlab">${esc(tz("Brain chip", "大脑芯片"))}</text>
      <rect x="265" y="114" width="20" height="78" rx="10" style="fill:var(--card);stroke:var(--muted)"/><circle cx="275" cy="196" r="14" data-bulb style="fill:var(--power)"/>
      <rect data-mercury x="270" y="150" width="10" height="44" rx="5" style="fill:var(--power)"/>
      <path d="M350 145 H420" class="arrow"/>
      <text x="440" y="120" class="dlab">${esc(tz("Its reading", "它的读数"))}</text>
      <rect x="440" y="134" width="160" height="18" rx="9" class="barbg" style="stroke:var(--line)"/><rect data-bar x="440" y="134" width="0" height="18" rx="9" style="fill:var(--power)"/>
      <text x="440" y="178" class="dnote">${esc(tz("cooler ← → warmer", "更凉 ← → 更热"))}</text>
      <text x="320" y="282" text-anchor="middle" class="dnote" data-note></text>
    </svg>`;
    const svg = root.querySelector("svg"), sl = root.querySelector("#dRoom"), busyBtn = root.querySelector("[data-busy]"), out = root.querySelector("#dRoomOut");
    let busy = false, chip = +sl.value / 100;
    busyBtn.addEventListener("click", () => { busy = !busy; busyBtn.setAttribute("aria-pressed", String(busy)); busyBtn.textContent = busy ? tz("Working hard · stop", "拼命干活中 · 停下") : tz("Give the brain hard work", "让大脑拼命干活"); });
    return { tick(dt){
      const room = +sl.value / 100, target = Math.min(1, room + (busy ? 0.3 : 0.06));
      chip = isStill() ? target : lerp(chip, target, Math.min(1, dt * 1.5));
      out.textContent = room < 0.34 ? tz("cool", "凉") : room < 0.67 ? tz("mild", "温和") : tz("warm", "热");
      svg.querySelector("[data-room]").style.fill = room > 0.5 ? "var(--power-t)" : "var(--sense-t)";
      svg.querySelector("[data-mercury]").setAttribute("y", (190 - 70 * chip).toFixed(1)); svg.querySelector("[data-mercury]").setAttribute("height", (4 + 70 * chip).toFixed(1));
      svg.querySelector("[data-bar]").setAttribute("width", (160 * chip).toFixed(1));
      svg.querySelector("[data-note]").textContent = busy ? tz("Working hard warms the chip, so it reads warmer than the room.", "芯片一忙就发热，读数比房间还高。") : tz("It measures the chip itself, not the air around it.", "它量的是芯片自己，不是周围的空气。");
    } };
  },

  /* ---------- a pin switching a light on and off ---------- */
  blink(root, { pin = "" }){
    root.innerHTML = `${sliderHTMLd("dRate", tz("Blinks per second", "每秒闪几次"), 1, 8, 1, 2)}
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("The brain switching a light on and off", "大脑把小灯开开关关"))}">
      <rect x="30" y="50" width="150" height="100" rx="14" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.6"/>
      <text x="105" y="88" text-anchor="middle" class="dlab">${esc(tz("Brain", "大脑"))}</text><text x="105" y="114" text-anchor="middle" class="dnote">${esc(tz("your program", "你的程序"))}</text>
      <path data-wire d="M180 100 H440" style="fill:none;stroke-width:4;stroke-linecap:round"/>
      <text x="310" y="88" text-anchor="middle" class="dnote">${esc(pin ? tz(`pin ${pin}`, `${pin} 针脚`) : "")}</text>
      <text x="310" y="128" text-anchor="middle" class="dlab" data-val></text>
      <circle data-glow cx="480" cy="100" r="40" style="fill:#ffe9a6;opacity:0"/>
      <circle data-led cx="480" cy="100" r="18" style="fill:#f2efe4;stroke:var(--output);stroke-width:2"/>
      <text x="480" y="160" text-anchor="middle" class="dnote">${esc(tz("little light", "小灯"))}</text>
      <text x="40" y="200" class="dcap">${esc(tz("THE WIRE OVER THE LAST 6 SECONDS", "这根线最近 6 秒的变化"))}</text>
      <line x1="40" y1="272" x2="600" y2="272" class="axis"/><text x="608" y="276" class="dnote">0</text><text x="608" y="226" class="dnote">1</text>
      <polyline data-trace points="" style="fill:none;stroke:var(--output);stroke-width:2.5;stroke-linejoin:round"/>
    </svg>`;
    const svg = root.querySelector("svg"), sl = root.querySelector("#dRate"), out = root.querySelector("#dRateOut");
    let clock = 0, hist = [];
    const label = () => { out.textContent = tz(`${sl.value} a second`, `每秒 ${sl.value} 次`); }; sl.addEventListener("input", label); label();
    return { tick(dt){
      clock += dt; const on = Math.floor(clock * +sl.value * 2) % 2 === 0 ? 1 : 0;
      svg.querySelector("[data-wire]").style.stroke = on ? "var(--output)" : "var(--line)";
      svg.querySelector("[data-val]").textContent = on ? tz("1 · on", "1 · 开") : tz("0 · off", "0 · 关");
      svg.querySelector("[data-led]").style.fill = on ? "#fff3c4" : "#f2efe4"; svg.querySelector("[data-glow]").style.opacity = on ? 0.8 : 0;
      hist.push([clock, on]); while (hist.length && hist[0][0] < clock - 6) hist.shift();
      svg.querySelector("[data-trace]").setAttribute("points", traceStep(hist, clock, 6, 40, 600, 222, 272));
    } };
  },

  /* ---------- any input in a range → one steady output ---------- */
  regulator(root, { min, max, out:vout, presets = [], outLabel = { en:"OUT", zh:"输出" } }){
    const top = Math.ceil(max + 1.5);
    root.innerHTML = `${sliderHTMLd("dVin", tz("Power coming in", "进来的电"), 0, top, 0.1, 5)}<div class="demo-ctl">${presets.map(([v, n]) => `<button class="btn ghost small" data-vin="${v}">${esc(L(n))} · ${v} V</button>`).join("")}</div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("A power converter turning any input into a steady output", "电源转换器把各种输入变成稳定输出"))}">
      <text x="40" y="30" class="dcap">${esc(tz("IN", "输入"))}</text><text x="440" y="30" class="dcap" data-fit="195">${esc(L(outLabel))}</text>
      <rect x="40" y="44" width="110" height="200" rx="10" class="lane"/>
      <rect data-okband x="40" y="0" width="110" height="0" style="fill:var(--output-t)"/>
      <rect data-inbar x="64" y="244" width="62" height="0" rx="6" style="fill:var(--power)"/>
      <text data-intext x="95" y="272" text-anchor="middle" class="dlab"></text>
      <path d="M150 144 H230" class="arrow"/>
      <rect data-box x="230" y="94" width="180" height="100" rx="14" style="fill:var(--power-t);stroke:var(--power);stroke-width:1.8"/>
      <text x="320" y="128" text-anchor="middle" class="dlab">${esc(tz("Power converter", "电源转换器"))}</text>
      <text data-mode x="320" y="160" text-anchor="middle" class="dnote"></text>
      <path d="M410 144 H440" class="arrow"/>
      <rect x="440" y="44" width="110" height="200" rx="10" class="lane"/>
      <rect data-outbar x="464" y="244" width="62" height="0" rx="6" style="fill:var(--output)"/>
      <text data-outtext x="495" y="272" text-anchor="middle" class="dlab"></text>
      <text data-warn x="320" y="230" text-anchor="middle" class="dlab"></text>
    </svg>`;
    fitTexts(root);
    const svg = root.querySelector("svg"), sl = root.querySelector("#dVin"), out = root.querySelector("#dVinOut"), q = s => svg.querySelector(s);
    const y = v => 244 - v / top * 200;
    q("[data-okband]").setAttribute("y", y(max).toFixed(1)); q("[data-okband]").setAttribute("height", (y(min) - y(max)).toFixed(1));
    const paint = () => {
      const v = +sl.value, ok = v >= min && v <= max, o = ok ? vout : 0;
      out.textContent = `${fmt(v)} V`;
      q("[data-inbar]").setAttribute("y", y(v).toFixed(1)); q("[data-inbar]").setAttribute("height", (244 - y(v)).toFixed(1));
      q("[data-outbar]").setAttribute("y", y(o).toFixed(1)); q("[data-outbar]").setAttribute("height", (244 - y(o)).toFixed(1));
      q("[data-intext]").textContent = `${fmt(v)} V`; q("[data-outtext]").textContent = `${fmt(o)} V`;
      q("[data-mode]").textContent = !ok ? "" : v > vout + 0.05 ? tz("lowers it", "往下降") : v < vout - 0.05 ? tz("raises it", "往上升") : tz("keeps it", "保持不变");
      q("[data-box]").style.opacity = ok ? 1 : 0.4;
      q("[data-warn]").textContent = v < min ? tz(`Below ${min} V: too little, the ${devName()} switches off`, `低于 ${min} 伏：电不够，${devName()} 关机`) : v > max ? tz(`Above ${max} V: more than the maker allows`, `高于 ${max} 伏：超出厂家允许的范围`) : "";
      q("[data-warn]").style.fill = v > max ? "var(--power)" : "var(--muted)";
    };
    sl.addEventListener("input", paint);
    root.querySelectorAll("[data-vin]").forEach(b => b.addEventListener("click", () => { sl.value = b.dataset.vin; paint(); }));
    paint();
    return {};
  },

  /* ---------- two power sources and a one-way valve ---------- */
  powerpath(root){
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("src", [["cable", tz("Cable plugged in", "插着线")], ["battery", tz("Battery only", "只接电池")]], "cable")}<span class="demo-read" id="dRead"></span></div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("Where the power comes in", "电从哪里进来"))}">
      <rect x="20" y="40" width="130" height="64" rx="12" style="fill:var(--power-t);stroke:var(--power);stroke-width:1.6"/><text x="85" y="68" text-anchor="middle" class="dlab">${esc(tz("Cable door", "插线口"))}</text><text x="85" y="90" text-anchor="middle" class="dnote">5 V</text>
      <rect x="20" y="196" width="130" height="64" rx="12" style="fill:var(--power-t);stroke:var(--power);stroke-width:1.6;stroke-dasharray:5 4"/><text x="85" y="224" text-anchor="middle" class="dlab">${esc(tz("Battery", "电池"))}</text><text x="85" y="246" text-anchor="middle" class="dnote">${esc(tz("on the VSYS pin", "接在 VSYS 针脚"))}</text>
      <path data-p1 d="M150 72 H220" style="fill:none;stroke-width:5;stroke-linecap:round"/>
      <path d="M222 56 L222 88 L250 72 Z" style="fill:var(--power)"/><line x1="252" y1="56" x2="252" y2="88" style="stroke:var(--power);stroke-width:3"/>
      <text x="237" y="108" text-anchor="middle" class="dnote">${esc(tz("one-way valve", "单向阀"))}</text>
      <path data-p2 d="M254 72 H320 V150" style="fill:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/>
      <path data-p3 d="M150 228 H320 V150" style="fill:none;stroke-width:5;stroke-linecap:round;stroke-linejoin:round"/>
      <circle cx="320" cy="150" r="7" style="fill:var(--power)"/><text x="334" y="176" class="dnote">VSYS</text>
      <path data-p4 d="M320 150 H400" style="fill:none;stroke-width:5;stroke-linecap:round"/>
      <rect x="400" y="118" width="110" height="64" rx="12" style="fill:var(--power-t);stroke:var(--power);stroke-width:1.6"/><text x="455" y="146" text-anchor="middle" class="dlab">${esc(tz("Converter", "转换器"))}</text><text x="455" y="168" text-anchor="middle" class="dnote">3.3 V</text>
      <path data-p5 d="M510 150 H560" style="fill:none;stroke-width:5;stroke-linecap:round"/>
      <rect x="560" y="118" width="64" height="64" rx="12" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.6"/><text x="592" y="155" text-anchor="middle" class="dlab">${esc(tz("Brain", "大脑"))}</text>
      <path data-data d="M150 58 C300 0 520 20 592 118" style="fill:none;stroke-width:2;stroke-dasharray:3 4"/>
      <text data-datat x="400" y="22" text-anchor="middle" class="dnote"></text>
      <g data-block><path d="M300 72 H262" style="fill:none;stroke:var(--power);stroke-width:2;stroke-dasharray:4 4"/><path d="M228 60 l14 14 m0 -14 l-14 14" transform="translate(30 -2)" style="stroke:var(--power);stroke-width:3"/><text x="290" y="30" text-anchor="middle" class="dnote">${esc(tz("blocked: no power flows back", "挡住了：电不会倒流"))}</text></g>
      <g data-dots></g>
    </svg>`;
    const svg = root.querySelector("svg"), q = s => svg.querySelector(s), read = root.querySelector("#dRead"), dots = q("[data-dots]");
    let src = "cable", clock = 0, items = [];
    const paint = () => {
      const cable = src === "cable", live = cable ? ["p1", "p2", "p4", "p5"] : ["p3", "p4", "p5"];
      ["p1", "p2", "p3", "p4", "p5"].forEach(k => { q(`[data-${k}]`).style.stroke = live.includes(k) ? "var(--power)" : "var(--line)"; });
      q("[data-data]").style.stroke = cable ? "var(--wire)" : "var(--line)"; q("[data-datat]").textContent = cable ? tz("programs and messages, on two more wires", "程序和信息走另外两根线") : "";
      q("[data-block]").style.display = cable ? "none" : "";
      read.textContent = cable ? tz("Power from the cable", "电从线缆来") : tz("Power from the battery", "电从电池来");
      dots.innerHTML = ""; items = live.map(k => { const p = q(`[data-${k}]`), len = p.getTotalLength(); return { p, len, els:Array.from({ length:Math.max(1, Math.round(len / 60)) }, () => E("circle", { r:4, style:"fill:var(--power)" }, dots)) }; });
    };
    onSeg(root, "src", v => { src = v; paint(); }); paint();
    return { tick(dt){ clock += dt; items.forEach(it => it.els.forEach((el, j) => { const u = (clock * 60 / it.len + j / it.els.length) % 1, pt = it.p.getPointAtLength(u * it.len); el.setAttribute("cx", pt.x.toFixed(1)); el.setAttribute("cy", pt.y.toFixed(1)); })); } };
  },

  /* ---------- one pin: send (light something) or listen (read a button). Electricity goes out and back in a loop ---------- */
  pin(root, { pins, v, gnd = "GND", power = "3V3", chip = "" }){
    root.innerHTML = `<div class="demo-ctl"><label class="check">${esc(tz("Pin", "针脚"))} <select data-pinsel>${pins.map(p => `<option>${p}</option>`).join("")}</select></label>${pillsHTML("job", [["send", tz("Send: light something", "送：点亮小灯")], ["listen", tz("Listen: read a button", "收：读按键")]], "send")}</div>
    <div class="demo-ctl" data-sendctl>${pillsHTML("out", [[0, tz("Set to 0", "设为 0")], [1, tz("Set to 1", "设为 1")]], 0)}</div>
    <div class="demo-ctl" data-listenctl style="display:none"><button class="btn ghost small" data-press aria-pressed="false">${esc(tz("Hold to press", "按住按键"))}</button></div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("A pin on the board, wired in a loop to a light or a button", "板上的一个针脚，和小灯或按键接成一个圈"))}">
      <rect x="16" y="26" width="196" height="248" rx="10" style="fill:var(--pcb);stroke:var(--pcb-edge);stroke-width:1.5"/>
      <text x="30" y="48" class="dcap" style="fill:#e8efe9">${esc(devName().toUpperCase())}</text>
      <rect x="36" y="118" width="72" height="72" rx="4" style="fill:#1b1c1f"/><text x="72" y="149" text-anchor="middle" class="chiptxt" data-fit="64" style="fill:#c9c4b8">${esc(chip)}</text><text x="72" y="172" text-anchor="middle" class="chiptxt" data-fit="64" style="fill:#c9c4b8">${esc(tz("brain", "大脑"))}</text>
      <path d="M108 150 H199" style="fill:none;stroke:#8fc7a6;stroke-width:2"/>
      ${[[70, power], [150, ""], [230, gnd]].map(([y, n], i) => `<circle cx="206" cy="${y}" r="8" style="fill:var(--pad);stroke:var(--pcb-edge)"/><text x="190" y="${y - 12}" text-anchor="end" class="dlab" style="fill:#f4f4ee" ${i === 1 ? "data-pinname" : ""}>${n}</text>`).join("")}
      <g data-send>
        <path data-sw1 d="M214 150 H300" style="fill:none;stroke-width:4;stroke-linecap:round"/>
        <rect x="300" y="140" width="60" height="20" rx="4" style="fill:#d8c9a8;stroke:#8a7a5a"/><text x="330" y="182" text-anchor="middle" class="dnote">${esc(tz("resistor", "电阻"))}</text>
        <path data-sw2 d="M360 150 H442" style="fill:none;stroke-width:4;stroke-linecap:round"/>
        <circle data-glow cx="460" cy="150" r="36" style="fill:#ffe9a6;opacity:0"/><circle data-led cx="460" cy="150" r="18" style="fill:#f2efe4;stroke:var(--output);stroke-width:2"/><text x="460" y="118" text-anchor="middle" class="dnote">${esc(tz("light (LED)", "小灯（LED）"))}</text>
        <path data-sw3 d="M478 150 H560 V230 H214" style="fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>
        <text x="390" y="254" text-anchor="middle" class="dnote">${esc(tz(`back into the ${gnd} pin (ground)`, `回到 ${gnd} 针脚（地线）`))}</text>
        <path data-loop d="M214 150 H560 V230 H214" style="fill:none;stroke:none"/>
      </g>
      <g data-listen>
        <path d="M214 70 H440 V98" style="fill:none;stroke:var(--power);stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>
        <text x="320" y="60" text-anchor="middle" class="dnote">${esc(tz(`3.3 volts from the ${power} pin`, `来自 ${power} 针脚的 3.3 伏`))}</text>
        <g data-cap><rect x="410" y="98" width="60" height="22" rx="6" class="keycap"/></g>
        <rect x="410" y="128" width="60" height="8" rx="3" class="metal"/><text x="486" y="124" class="dnote">${esc(tz("button", "按键"))}</text>
        <path data-lw d="M440 136 V150 H214" style="fill:none;stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>
        <text x="320" y="174" text-anchor="middle" class="dnote">${esc(tz("to the signal pin", "接到信号针脚"))}</text>
        <path data-loop2 d="M214 70 H440 V150 H214" style="fill:none;stroke:none"/>
      </g>
      <text x="250" y="${140}" class="dnote" data-volt></text>
      <text x="426" y="290" text-anchor="middle" class="dlab" data-big></text>
      <g data-dots></g>
    </svg>`;
    const q = s => root.querySelector(s), dots = q("[data-dots]");
    let job = "send", out = 0, pressed = false, pin = pins[0], clock = 0, path = null, els = [];
    const paint = () => {
      const send = job === "send", on = send ? out === 1 : pressed;
      q("[data-sendctl]").style.display = send ? "" : "none"; q("[data-listenctl]").style.display = send ? "none" : "";
      q("[data-send]").style.display = send ? "" : "none"; q("[data-listen]").style.display = send ? "none" : "";
      q("[data-pinname]").textContent = pin;
      ["[data-sw1]", "[data-sw2]"].forEach(k => { q(k).style.stroke = on ? "var(--connect)" : "var(--line)"; });
      q("[data-sw3]").style.stroke = on ? "var(--body)" : "var(--line)";
      q("[data-lw]").style.stroke = on ? "var(--connect)" : "var(--line)";
      q("[data-led]").style.fill = send && on ? "#fff3c4" : "#f2efe4"; q("[data-glow]").style.opacity = send && on ? 0.8 : 0;
      q("[data-cap]").setAttribute("transform", pressed ? "translate(0 8)" : ""); q("[data-press]").setAttribute("aria-pressed", String(pressed));
      q("[data-volt]").textContent = on ? `${v} V` : "0 V";
      q("[data-big]").textContent = send ? (on ? tz("The program wrote 1: the light is on", "程序写了 1：灯亮了") : tz("The program wrote 0: the light is off", "程序写了 0：灯灭了"))
        : (on ? tz("The program reads 1: pressed", "程序读到 1：按下了") : tz("The program reads 0: not pressed", "程序读到 0：没按"));
      dots.innerHTML = ""; els = []; path = on ? q(send ? "[data-loop]" : "[data-loop2]") : null;
      if (path){ const len = path.getTotalLength(); els = Array.from({ length:Math.round(len / 50) }, () => E("circle", { r:4, style:`fill:var(--${send ? "connect" : "power"})` }, dots)); }
    };
    q("[data-pinsel]").addEventListener("change", e => { pin = e.target.value; paint(); });
    onSeg(root, "job", val => { job = val; paint(); });
    onSeg(root, "out", val => { out = +val; paint(); });
    holdable([q("[data-press]"), q("[data-cap]")], p => { pressed = p; paint(); });
    paint();
    return { tick(dt){ clock += dt; if (!path) return; const len = path.getTotalLength();
      els.forEach((el, j) => { const pt = path.getPointAtLength(((clock * 70 / len + j / els.length) % 1) * len); el.setAttribute("cx", pt.x.toFixed(1)); el.setAttribute("cy", pt.y.toFixed(1)); }); } };
  },

  /* ---------- one socket, one cable, several things at once ---------- */
  ports(root, { things, socket = { en:"one socket", zh:"一个口" } }){
    const lanes = [["power", 120, "var(--power)", tz("Power", "电")], ["data", 150, "var(--connect)", tz("Data", "数据")], ["video", 180, "var(--output)", tz("Picture", "画面")]];
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("dev", things.map(x => [x.id, L(x.name)]), things[0].id)}</div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("One socket carrying several things in one cable", "一个口在一根线里同时送好几样东西"))}">
      <rect x="20" y="92" width="150" height="116" rx="14" style="fill:var(--pcb);stroke:var(--pcb-edge);stroke-width:1.5"/>
      <text x="85" y="134" text-anchor="middle" class="dlab" data-fit="120" style="fill:#e8efe9">${esc(devName())}</text>
      <text x="85" y="160" text-anchor="middle" class="dnote" data-fit="120" style="fill:#b9c3bd">${esc(L(socket))}</text>
      <rect x="150" y="140" width="26" height="20" rx="6" style="fill:#16171a;stroke:#e8efe9;stroke-width:1.4"/>
      <rect x="150" y="104" width="312" height="104" rx="10" style="fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:4 4"/>
      <text x="306" y="232" text-anchor="middle" class="dcap">${esc(tz("ONE CABLE", "一根线"))}</text>
      ${lanes.map(([k, y, c, lab]) => `<path data-lane="${k}" d="M176 ${y} H452" style="fill:none;stroke:var(--line);stroke-width:6;stroke-linecap:round"/><text data-lab="${k}" x="196" y="${y - 7}" class="dnote">${esc(lab)}</text>`).join("")}
      <rect x="452" y="104" width="168" height="104" rx="14" style="fill:var(--card);stroke:var(--line);stroke-width:1.6"/>
      <text data-devname x="536" y="162" text-anchor="middle" class="dlab" data-fit="148"></text>
    </svg>${captionHTML()}`;
    const svg = root.querySelector("svg"), cap = root.querySelector("[data-caption]"), dotLayer = E("g", {}, svg);
    let cur = things[0].id, clock = 0, flows = [];
    const paint = () => {
      const d = things.find(x => x.id === cur); cap.textContent = L(d.read); svg.querySelector("[data-devname]").textContent = L(d.name); fitTexts(svg);
      dotLayer.innerHTML = ""; flows = [];
      lanes.forEach(([k, y, c]) => {
        const on = d.lanes[k], lane = svg.querySelector(`[data-lane="${k}"]`), lab = svg.querySelector(`[data-lab="${k}"]`);
        lane.style.stroke = on ? c : "var(--line)"; lab.style.fill = on ? c : "var(--muted)"; lab.style.opacity = on ? 1 : 0.4;
        if (!on) return;
        const mk = dir => flows.push({ els:Array.from({ length:4 }, () => E("circle", { r:4, style:`fill:${c}` }, dotLayer)), y, dir });
        mk(1); if (on === 2) mk(-1);
      });
    };
    onSeg(root, "dev", v => { cur = v; paint(); }); paint();
    return { tick(dt){ clock += dt; flows.forEach(f => f.els.forEach((el, j) => { let u = (clock * 0.35 + j / f.els.length) % 1; if (f.dir < 0) u = 1 - u; el.setAttribute("cx", (176 + u * 276).toFixed(1)); el.setAttribute("cy", f.y); })); } };
  },

  /* ---------- radio waves through the air: each mode reaches its own targets ---------- */
  radio(root, { modes }){
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("mode", modes.map(m => [m.id, L(m.tab)]), modes[0].id)}</div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("The antenna sending radio waves through the air", "天线把无线电波送到空气里"))}">
      <rect x="24" y="106" width="128" height="90" rx="14" style="fill:var(--pcb);stroke:var(--pcb-edge);stroke-width:1.5"/>
      <text x="88" y="144" text-anchor="middle" class="dlab" data-fit="108" style="fill:#e8efe9">${esc(devName())}</text>
      <text x="88" y="170" text-anchor="middle" class="dnote" data-fit="108" style="fill:#b9c3bd">${esc(tz("antenna", "天线"))}</text>
      <circle cx="150" cy="151" r="4" style="fill:var(--connect)"/>
      <g data-waves></g><g data-targets></g>
      <text data-range x="320" y="284" text-anchor="middle" class="dnote"></text>
    </svg>${captionHTML()}`;
    const svg = root.querySelector("svg"), waves = svg.querySelector("[data-waves]"), cap = root.querySelector("[data-caption]"), range = svg.querySelector("[data-range]"), tg = svg.querySelector("[data-targets]");
    const arcs = Array.from({ length:3 }, () => E("path", { fill:"none", "stroke-width":2.5, "stroke-linecap":"round", stroke:"var(--connect)" }, waves));
    let cur = modes[0], clock = 0;
    const paint = () => { cap.textContent = L(cur.read); range.textContent = L(cur.range);
      const n = cur.targets.length, h = 56, gap = 18, y0 = 150 - (n * h + (n - 1) * gap) / 2;
      tg.innerHTML = cur.targets.map((x, i) => `<rect x="470" y="${y0 + i * (h + gap)}" width="150" height="${h}" rx="12" style="fill:var(--connect-t);stroke:var(--connect);stroke-width:1.6"/><text x="545" y="${y0 + i * (h + gap) + 34}" text-anchor="middle" class="dlab" data-fit="134">${esc(L(x))}</text>`).join(""); fitTexts(tg); };
    onSeg(root, "mode", v => { cur = modes.find(m => m.id === v); paint(); }); paint();
    return { tick(dt){ clock += dt;
      arcs.forEach((a, i) => { const ph = (clock * 0.5 + i / arcs.length) % 1, r = 18 + ph * 310;
        a.setAttribute("d", `M150 ${(151 - r).toFixed(1)} A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 150 ${(151 + r).toFixed(1)}`);
        a.style.opacity = ((1 - ph) * 0.85).toFixed(2); }); } };
  },

  /* ---------- unfold one chip: its real blocks, tap one to see its job, then go to its own station ---------- */
  chipmap(root, { name, blocks, intro, note }){
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("block", [["all", tz("All", "全部")], ...blocks.map(b => [b.id, L(b.short || b.name)])], "all")}</div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(L(name))}">
      <rect x="100" y="34" width="440" height="256" rx="16" style="fill:#1b1c1f;stroke:#3a3d42;stroke-width:1.5"/>
      <text x="320" y="24" text-anchor="middle" class="dcap">${esc(L(name).toUpperCase())}</text>
      ${blocks.map(b => { const [x, y, w, h] = b.at, g = b.g || "think"; return `<g data-block="${b.id}" class="cmblk" style="cursor:pointer">
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" style="fill:var(--${g}-t);stroke:var(--${g});stroke-width:1.5"/>
        <text x="${x + 10}" y="${y + 21}" class="dlab" data-fit="${w - 18}" style="font-size:16px;fill:var(--${g})">${esc(L(b.name))}</text>
        ${b.n ? cellsHTML(b.n, x + 10, y + 30, w - 20, h - 40, `fill:var(--${g});opacity:.55`) : ""}</g>`; }).join("")}
    </svg>${captionHTML()}<p class="dgo" data-go hidden><button class="btn small" data-open></button></p>${note ? `<p class="dnotep">${esc(L(note))}</p>` : ""}`;
    const cap = root.querySelector("[data-caption]"), go = root.querySelector("[data-go]"), open = root.querySelector("[data-open]");
    fitTexts(root);
    let sel = "all";
    const paint = () => {
      const b = blocks.find(x => x.id === sel);
      root.querySelectorAll(".cmblk").forEach(g => { g.style.opacity = sel === "all" || g.dataset.block === sel ? 1 : 0.16; });
      cap.textContent = b ? L(b.cap) : L(intro);
      go.hidden = !(b && b.station);
      if (b && b.station){ open.textContent = tz(`Open: ${L(b.short || b.name)} →`, `展开看：${L(b.short || b.name)} →`); open.onclick = () => pickStation(b.station); }
    };
    onSeg(root, "block", v => { sel = v; paint(); });
    root.querySelectorAll(".cmblk").forEach(g => g.addEventListener("click", () => { sel = g.dataset.block; pressSeg(root, "block", sel); paint(); }));
    paint();
    return {};
  },

  /* ---------- one worker or many on the same picture: why a graphics part has so many cores ---------- */
  parallel(root, { cores, one, many, read }){
    const W = 20, H = 10, cell = 19;
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("who", [["one", L(one)], ["many", L(many)]], "many")}<button class="btn ghost small" data-again>${esc(tz("Draw it again", "再画一次"))}</button></div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("A picture being drawn by one worker or many", "一个人画和很多人一起画"))}"><g data-grid></g><text data-prog x="320" y="284" text-anchor="middle" class="dnote"></text></svg>${captionHTML(read ? L(read) : "")}`;
    const svg = root.querySelector("svg"), grid = svg.querySelector("[data-grid]"), prog = svg.querySelector("[data-prog]");
    const x0 = (640 - W * cell) / 2, y0 = 40, hue = (x, y) => { const sky = y < 6, sun = Math.hypot(x - 14, y - 2.5) < 2.4; return sun ? "#f0b43c" : sky ? `hsl(205 70% ${72 - y * 3}%)` : `hsl(${110 + x} 40% ${46 - (y - 6) * 3}%)`; };
    const px = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px.push(E("rect", { x:x0 + x * cell, y:y0 + y * cell, width:cell - 1.5, height:cell - 1.5, rx:2, style:"fill:var(--line);opacity:.5" }, grid));
    let who = "many", done = 0, acc = 0;
    const clear = () => { done = 0; acc = 0; px.forEach(p => { p.style.fill = "var(--line)"; p.style.opacity = .5; }); };
    onSeg(root, "who", v => { who = v; clear(); });
    root.querySelector("[data-again]").addEventListener("click", clear);
    return { tick(dt){ if (done >= px.length) return; acc += dt * 8 * (who === "many" ? cores : 1);
      while (acc >= 1 && done < px.length){ acc--; const i = who === "many" ? (done % cores) * Math.ceil(px.length / cores) + ((done / cores) | 0) : done; const p = px[Math.min(i, px.length - 1)]; p.style.fill = hue(Math.min(i, px.length - 1) % W, (Math.min(i, px.length - 1) / W) | 0); p.style.opacity = 1; done++; }
      prog.textContent = done >= px.length ? tz("Finished", "画完了") : tz(`${Math.round(done / px.length * 100)}% drawn`, `画了 ${Math.round(done / px.length * 100)}%`); } };
  },

  /* ---------- recognising a pattern: something goes in, many small sums at once, an answer comes out ---------- */
  pattern(root, { cores, samples }){
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("smp", samples.map((x, i) => [i, L(x.name)]), 0)}</div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("Something goes in, many small sums, an answer comes out", "输入一样东西，算很多小数，得出答案"))}">
      <rect x="16" y="96" width="136" height="100" rx="12" style="fill:var(--sense-t);stroke:var(--sense);stroke-width:1.6"/><text data-in x="84" y="152" text-anchor="middle" class="dlab" data-fit="120"></text>
      <text x="84" y="84" text-anchor="middle" class="dcap">${esc(tz("GOES IN", "输入"))}</text>
      <path d="M156 146 H190" class="arrow"/>
      <rect x="196" y="56" width="248" height="186" rx="12" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.5"/>
      <text x="320" y="44" text-anchor="middle" class="dcap">${esc(tz(`${cores} CORES WORK AT ONCE`, `${cores} 个核心一起算`))}</text>
      ${cellsHTML(cores, 214, 70, 212, 158, "fill:var(--think);opacity:.25")}
      <path d="M448 146 H482" class="arrow"/>
      <rect x="488" y="96" width="136" height="100" rx="12" style="fill:var(--output-t);stroke:var(--output);stroke-width:1.6"/><text data-out x="556" y="152" text-anchor="middle" class="dlab" data-fit="120"></text>
      <text x="556" y="84" text-anchor="middle" class="dcap">${esc(tz("COMES OUT", "输出"))}</text>
    </svg>`;
    const svg = root.querySelector("svg"), cells = [...svg.querySelectorAll("[data-cell]")];
    let cur = 0, t = 0;
    const paint = () => { svg.querySelector("[data-in]").textContent = L(samples[cur].input); svg.querySelector("[data-out]").textContent = ""; t = 0; fitTexts(svg); };
    onSeg(root, "smp", v => { cur = +v; paint(); }); paint();
    return { tick(dt){ t += dt; cells.forEach((c, i) => { c.style.opacity = t < 1.6 ? (0.25 + 0.7 * Math.abs(Math.sin(t * 5 + i * 1.7))).toFixed(2) : 0.7; });
      if (t >= 1.6 && !svg.querySelector("[data-out]").textContent){ svg.querySelector("[data-out]").textContent = L(samples[cur].answer); fitTexts(svg); } if (t > 4.5) paint(); } };
  },

  /* ---------- two workers reach one shared memory, or copy between two separate ones ---------- */
  shared(root, { who, size, read }){
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("mem", [["one", tz("One shared memory", "共用一块内存")], ["two", tz("Separate memories", "各用各的内存")]], "one")}</div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("Two parts sharing one memory, or copying between two", "两个部件共用内存，或者来回复制"))}">
      <rect x="40" y="30" width="170" height="74" rx="12" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.6"/><text x="125" y="74" text-anchor="middle" class="dlab" data-fit="150">${esc(L(who[0]))}</text>
      <rect x="430" y="30" width="170" height="74" rx="12" style="fill:var(--think-t);stroke:var(--think);stroke-width:1.6"/><text x="515" y="74" text-anchor="middle" class="dlab" data-fit="150">${esc(L(who[1]))}</text>
      <g data-one><rect x="150" y="196" width="340" height="74" rx="12" style="fill:var(--sense-t);stroke:var(--sense);stroke-width:1.6"/><text x="320" y="240" text-anchor="middle" class="dlab" data-fit="310">${esc(L(size))}</text>
        <path d="M150 104 V190" class="arrow"/><path d="M490 104 V190" class="arrow"/></g>
      <g data-two style="display:none"><rect x="40" y="196" width="170" height="74" rx="12" style="fill:var(--sense-t);stroke:var(--sense);stroke-width:1.6"/><rect x="430" y="196" width="170" height="74" rx="12" style="fill:var(--sense-t);stroke:var(--sense);stroke-width:1.6"/>
        <text x="125" y="240" text-anchor="middle" class="dlab">${esc(tz("Memory A", "内存 A"))}</text><text x="515" y="240" text-anchor="middle" class="dlab">${esc(tz("Memory B", "内存 B"))}</text>
        <path d="M125 104 V190" class="arrow"/><path d="M515 104 V190" class="arrow"/><path d="M214 233 H426" class="arrow"/><text x="320" y="222" text-anchor="middle" class="dnote">${esc(tz("copy across first", "得先复制过去"))}</text></g>
      <circle data-dot r="8" style="fill:var(--think)"/>
    </svg>${captionHTML()}`;
    const svg = root.querySelector("svg"), dot = svg.querySelector("[data-dot]"), cap = root.querySelector("[data-caption]");
    let mode = "one", t = 0;
    const paint = () => { svg.querySelector("[data-one]").style.display = mode === "one" ? "" : "none"; svg.querySelector("[data-two]").style.display = mode === "two" ? "" : "none"; cap.textContent = L(read[mode]); t = 0; };
    onSeg(root, "mem", v => { mode = v; paint(); }); fitTexts(svg); paint();
    const path = mode2 => mode2 === "one" ? [[150, 110], [150, 233], [490, 233], [490, 110]] : [[125, 110], [125, 233], [515, 233], [515, 110]];
    return { tick(dt){ t = (t + dt * (mode === "one" ? 0.5 : 0.22)) % 1; const pts = path(mode), seg = t * 3, i = Math.min(2, Math.floor(seg)), k = seg - i; dot.setAttribute("cx", lerp(pts[i][0], pts[i + 1][0], k).toFixed(1)); dot.setAttribute("cy", lerp(pts[i][1], pts[i + 1][1], k).toFixed(1)); } };
  },

  /* ===== chapter 6 (a project: a head that turns toward light). Every outside device is drawn and named. ===== */

  /* ---------- who does what: senses, brain, muscle, power ---------- */
  project(root, { pins, chip = "" }){
    const box = (x, y, w, h, g, t1, t2, dashed) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" style="fill:var(--${g}-t);stroke:var(--${g});stroke-width:1.6${dashed ? ";stroke-dasharray:6 4" : ""}"/><text x="${x + w / 2}" y="${y + h / 2 - 3}" text-anchor="middle" class="dlab">${esc(t1)}</text><text x="${x + w / 2}" y="${y + h / 2 + 18}" text-anchor="middle" class="dnote">${esc(t2)}</text>`;
    root.innerHTML = `<svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("Who does what in the project", "项目里谁负责什么"))}">
      <text x="20" y="24" class="dcap" style="fill:var(--sense)">${esc(tz("SENSE", "感知"))}</text><text x="270" y="24" class="dcap" style="fill:var(--think)">${esc(tz("DECIDE", "拿主意"))}</text><text x="470" y="24" class="dcap" style="fill:var(--output)">${esc(tz("ACT", "动手"))}</text>
      ${box(20, 50, 170, 70, "sense", tz("Left eye", "左眼"), tz(`light sensor · ${pins.left}`, `光线传感器 · ${pins.left}`), true)}
      ${box(20, 150, 170, 70, "sense", tz("Right eye", "右眼"), tz(`light sensor · ${pins.right}`, `光线传感器 · ${pins.right}`), true)}
      <rect x="262" y="70" width="96" height="140" rx="6" style="fill:var(--pcb);stroke:var(--pcb-edge);stroke-width:1.5"/><rect x="274" y="112" width="72" height="52" rx="3" style="fill:#1b1c1f"/><text x="310" y="143" text-anchor="middle" class="chiptxt" data-fit="64" style="fill:#c9c4b8">${esc(chip)}</text>
      <text x="310" y="62" text-anchor="middle" class="dlab">${esc(devName())}</text>
      ${box(450, 100, 170, 70, "output", tz("Servo", "舵机"), tz(`the neck · ${pins.servo}`, `当脖子 · ${pins.servo}`), true)}
      <path d="M535 100 L560 64" style="stroke:var(--output);stroke-width:6;stroke-linecap:round"/>
      <path data-p1 d="M190 85 C230 85 230 120 262 120" style="fill:none;stroke:var(--sense);stroke-width:2.5"/>
      <path data-p2 d="M190 185 C230 185 230 160 262 160" style="fill:none;stroke:var(--sense);stroke-width:2.5"/>
      <path data-p3 d="M358 140 H450" style="fill:none;stroke:var(--connect);stroke-width:2.5"/>
      <text x="226" y="70" text-anchor="middle" class="dnote">${esc(tz("voltage", "电压"))}</text><text x="404" y="128" text-anchor="middle" class="dnote">${esc(tz("pulses", "脉冲"))}</text>
      ${box(235, 248, 150, 46, "connect", tz("Computer", "电脑"), "", true)}
      <path d="M310 248 V212" style="stroke:var(--power);stroke-width:3"/><text x="400" y="276" class="dnote">${esc(tz("USB: power and the program", "USB：送电，也送程序"))}</text>
      <g data-dots></g>
    </svg>`;
    const svg = root.querySelector("svg"), paths = ["[data-p1]", "[data-p2]", "[data-p3]"].map(k => svg.querySelector(k)), dl = svg.querySelector("[data-dots]");
    const dots = paths.map((p, i) => E("circle", { r:4, style:`fill:var(--${i < 2 ? "sense" : "connect"})` }, dl));
    let clock = 0;
    return { tick(dt){ clock += dt; paths.forEach((p, i) => { const len = p.getTotalLength(), pt = p.getPointAtLength(((clock * 0.6 + i * 0.3) % 1) * len); dots[i].setAttribute("cx", pt.x.toFixed(1)); dots[i].setAttribute("cy", pt.y.toFixed(1)); }); } };
  },

  /* ---------- a servo: the pulse's width sets the arm's angle ---------- */
  servo(root, { min = 0.5, max = 2.4, period = 20, pin }){
    root.innerHTML = `${sliderHTMLd("dPw", tz("Pulse width", "脉冲宽度"), min, max, 0.1, (min + max) / 2)}
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("A servo turning to the angle its pulses ask for", "舵机按脉冲宽度转到对应角度"))}">
      <text x="20" y="26" class="dcap" style="fill:var(--ink)">${esc(tz(`THE SIGNAL FROM ${pin} · A PULSE EVERY ${period} MS`, `${pin} 发出的信号 · 每 ${period} 毫秒一个脉冲`))}</text>
      <line x1="20" y1="110" x2="620" y2="110" class="axis"/>
      <polyline data-wave points="" style="fill:none;stroke:var(--connect);stroke-width:2.5;stroke-linejoin:round"/>
      <text x="20" y="140" class="dnote" data-pwtext></text>
      <rect x="240" y="170" width="160" height="90" rx="10" style="fill:var(--output-t);stroke:var(--output);stroke-width:1.6;stroke-dasharray:6 4"/>
      <text x="320" y="252" text-anchor="middle" class="dnote">${esc(tz("servo", "舵机"))}</text>
      <path d="M260 200 A60 60 0 0 1 380 200" style="fill:none;stroke:var(--line);stroke-width:1.5;stroke-dasharray:3 4"/>
      <line data-arm x1="320" y1="210" x2="320" y2="160" style="stroke:var(--output);stroke-width:9;stroke-linecap:round"/><circle cx="320" cy="210" r="9" style="fill:var(--card);stroke:var(--output);stroke-width:2"/>
      <text x="430" y="216" class="dbig" data-angle></text>
    </svg>`;
    const svg = root.querySelector("svg"), sl = root.querySelector("#dPw"), out = root.querySelector("#dPwOut");
    const paint = () => { const pw = +sl.value, ang = (pw - min) / (max - min) * 180, w = 600 / 3, pwPx = pw / period * w;
      let pts = ""; for (let i = 0; i < 3; i++){ const x0 = 20 + i * w; pts += `${x0},110 ${x0},60 ${(x0 + pwPx).toFixed(1)},60 ${(x0 + pwPx).toFixed(1)},110 ${x0 + w},110 `; }
      svg.querySelector("[data-wave]").setAttribute("points", pts);
      const a = deg(180 - ang); svg.querySelector("[data-arm]").setAttribute("x2", (320 + 62 * Math.cos(a)).toFixed(1)); svg.querySelector("[data-arm]").setAttribute("y2", (210 - 62 * Math.sin(a)).toFixed(1));
      svg.querySelector("[data-angle]").textContent = `${Math.round(ang)}°`;
      svg.querySelector("[data-pwtext]").textContent = tz(`This pulse lasts ${pw.toFixed(1)} ms → the arm turns to about ${Math.round(ang)}°`, `这个脉冲宽 ${pw.toFixed(1)} 毫秒 → 臂转到大约 ${Math.round(ang)}°`);
      out.textContent = tz(`${pw.toFixed(1)} ms`, `${pw.toFixed(1)} 毫秒`); };
    sl.addEventListener("input", paint); paint();
    return {};
  },

  /* ---------- two eyes: a lamp you move, two readings (simulated numbers) ---------- */
  lightpair(root, { pins, rule = false, threshold = 150 }){
    const ex = rule ? [140, 290] : [240, 400], mid = (ex[0] + ex[1]) / 2, span = rule ? 180 : 260;           // with the rule shown, the eyes move left
    root.innerHTML = `${sliderHTMLd("dLamp", tz("Move the lamp", "移动灯"), -100, 100, 1, -40)}
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("A lamp and two light sensors", "一盏灯和两个光线传感器"))}">
      <line x1="${mid - span - 20}" y1="60" x2="${mid + span + 20}" y2="60" style="stroke:var(--line);stroke-width:1.5;stroke-dasharray:4 5"/>
      <g data-lamp><circle r="34" style="fill:#ffe9a6;opacity:.6"/><circle r="14" style="fill:#ffd76a;stroke:#b8923a;stroke-width:1.5"/></g>
      ${[0, 1].map(i => `<g transform="translate(${ex[i]} 150)"><rect x="-55" y="-26" width="110" height="52" rx="10" style="fill:var(--sense-t);stroke:var(--sense);stroke-width:1.6;stroke-dasharray:6 4"/><circle cx="0" cy="-26" r="9" style="fill:#c9a65a;stroke:#8a6d2f"/><text y="-2" text-anchor="middle" class="dlab">${esc(i ? tz("Right eye", "右眼") : tz("Left eye", "左眼"))}</text><text y="18" text-anchor="middle" class="dnote">${pins[i]}</text>
        <text y="66" text-anchor="middle" class="dbig" data-num="${i}"></text><rect x="-50" y="82" width="100" height="10" rx="5" class="barbg" style="stroke:var(--line)"/><rect data-bar="${i}" x="-50" y="82" width="0" height="10" rx="5" style="fill:var(--sense)"/></g>`).join("")}
      ${rule ? `<g data-rule transform="translate(375 150)"></g>` : ""}
    </svg>`;
    const svg = root.querySelector("svg"), sl = root.querySelector("#dLamp"), out = root.querySelector("#dLampOut"), q = s => svg.querySelector(s);
    const read = (lx, ex) => Math.round(400 + 3200 / (1 + Math.pow((lx - ex) / 110, 2)));
    const paint = () => { const k = +sl.value / 100, lx = mid + k * span;
      q("[data-lamp]").setAttribute("transform", `translate(${lx.toFixed(1)} 60)`);
      const v = [read(lx, ex[0]), read(lx, ex[1])];
      v.forEach((n, i) => { q(`[data-num="${i}"]`).textContent = n; q(`[data-bar="${i}"]`).setAttribute("width", (100 * (n - 400) / 3200).toFixed(1)); });
      out.textContent = k < -0.15 ? tz("left", "偏左") : k > 0.15 ? tz("right", "偏右") : tz("in front", "正前方");
      if (rule){ const d = v[0] - v[1], which = d > threshold ? 0 : d < -threshold ? 2 : 1;
        const lines = [tz("Left brighter → turn left", "左边更亮 → 往左转一点"), tz("About the same → stay still", "差不多 → 不动"), tz("Right brighter → turn right", "右边更亮 → 往右转一点")];
        q("[data-rule]").innerHTML = `<text x="0" y="-70" class="dcap" style="fill:var(--think)">${esc(tz("THE RULE", "规则"))}</text>` + lines.map((l, i) => `<rect x="-8" y="${-56 + i * 40}" width="258" height="32" rx="8" style="fill:${i === which ? "var(--think-t)" : "transparent"};stroke:${i === which ? "var(--think)" : "var(--line)"}"/><text x="2" y="${-35 + i * 40}" class="dnote" style="fill:${i === which ? "var(--ink)" : "var(--muted)"};font-weight:${i === which ? 700 : 400}">${esc(l)}</text>`).join("")
          + `<text x="0" y="76" class="dnote">${esc(tz(`difference: ${d > 0 ? "+" : ""}${d}`, `相差：${d > 0 ? "+" : ""}${d}`))}</text>`; } };
    sl.addEventListener("input", paint); paint();
    return {};
  },

  /* ---------- the whole loop: sense → decide → act, seen from above ---------- */
  follow(root, { threshold = 150, step = 3, min = 0.5, max = 2.4 }){
    root.innerHTML = `${sliderHTMLd("dLampA", tz("Move the lamp", "移动灯"), -80, 80, 1, -50)}
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("Seen from above: a head turning toward a lamp", "从上往下看：机器人头转向灯"))}">
      <text x="20" y="26" class="dcap">${esc(tz("SEEN FROM ABOVE", "从上往下看"))}</text>
      <path d="M90 250 A230 230 0 0 1 550 250" style="fill:none;stroke:var(--line);stroke-width:1.5;stroke-dasharray:4 5"/>
      <g data-lamp><circle r="30" style="fill:#ffe9a6;opacity:.6"/><circle r="13" style="fill:#ffd76a;stroke:#b8923a;stroke-width:1.5"/></g>
      <g data-head transform="translate(320 250)"><rect x="-46" y="-30" width="92" height="44" rx="10" style="fill:var(--output-t);stroke:var(--output);stroke-width:1.6;stroke-dasharray:6 4"/>
        <circle cx="-30" cy="-32" r="8" style="fill:#c9a65a;stroke:var(--sense);stroke-width:2"/><circle cx="30" cy="-32" r="8" style="fill:#c9a65a;stroke:var(--sense);stroke-width:2"/><path d="M0 -36 V-62" style="stroke:var(--output);stroke-width:2;stroke-dasharray:3 3"/></g>
      <circle cx="320" cy="250" r="6" style="fill:var(--output)"/>
    </svg>
    <p class="dcaption" data-caption><b data-act></b><br><span data-read></span> · <span data-out></span></p>`;
    const svg = root.querySelector("svg"), sl = root.querySelector("#dLampA"), out = root.querySelector("#dLampAOut"), q = s => root.querySelector(s);   // the readings are a caption under the figure: sentences don't wrap in SVG
    let head = 0, acc = 0;
    const eye = (lamp, dir) => Math.round(400 + 3200 * Math.pow(Math.max(0, Math.cos(deg(lamp - dir))), 6));   // simulated readings
    return { tick(dt){
      const lamp = +sl.value, R = 230, lx = 320 + R * Math.sin(deg(lamp)), ly = 250 - R * Math.cos(deg(lamp));   // angles: 0 = straight ahead, left is negative
      q("[data-lamp]").setAttribute("transform", `translate(${lx.toFixed(1)} ${ly.toFixed(1)})`);
      const L = eye(lamp, head - 30), Rr = eye(lamp, head + 30), d = L - Rr;
      acc += dt; while (acc > 0.08){ acc -= 0.08; head = clamp(head + (d > threshold ? -step : d < -threshold ? step : 0), -90, 90); }   // left brighter → turn left
      q("[data-head]").setAttribute("transform", `translate(320 250) rotate(${head.toFixed(1)})`);
      const pw = min + (head + 90) / 180 * (max - min);
      q("[data-read]").textContent = tz(`left eye ${L} · right eye ${Rr}`, `左眼 ${L} · 右眼 ${Rr}`);
      q("[data-out]").textContent = tz(`servo ${Math.round(head + 90)}° · pulse ${pw.toFixed(2)} ms`, `舵机 ${Math.round(head + 90)}° · 脉冲 ${pw.toFixed(2)} 毫秒`);
      q("[data-act]").textContent = Math.abs(head) >= 90 && Math.abs(d) > threshold ? tz("As far as the servo goes", "舵机已经转到头了") : d > threshold ? tz("← turning left", "← 往左转") : d < -threshold ? tz("turning right →", "往右转 →") : tz("Facing the light: stay still", "对准了光：不动");
      out.textContent = lamp < -10 ? tz("left", "偏左") : lamp > 10 ? tz("right", "偏右") : tz("in front", "正前方");
    } };
  },

  /* ---------- the wiring: every wire, from which pin to which part ---------- */
  wiring(root, { pins, chip = "" }){
    const P_ = pins;
    root.innerHTML = `<div class="demo-ctl">${pillsHTML("wg", [["all", tz("Everything", "全部")], ["eyes", tz("The eyes", "眼睛")], ["servo", tz("The servo", "舵机")]], "all")}</div>
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz(`How the parts are wired to the ${devName()}`, `零件怎么接到 ${devName()} 上`))}">
      <rect x="210" y="40" width="120" height="232" rx="6" style="fill:var(--pcb);stroke:var(--pcb-edge);stroke-width:1.5"/><text x="270" y="160" text-anchor="middle" class="dlab" data-fit="108" style="fill:#e8efe9">${esc(devName())}</text>
      ${[["VBUS", 60], ["GND", 88], ["3V3", 116], [P_.right, 196], [P_.left, 222]].map(([n, y]) => `<circle cx="330" cy="${y}" r="6" style="fill:var(--pad)"/><text x="322" y="${y + 5}" text-anchor="end" class="dnote" data-fit="56" style="fill:#f4f4ee">${n}</text>`).join("")}
      ${[["GND", 226], [P_.servo, 252]].map(([n, y]) => `<circle cx="210" cy="${y}" r="6" style="fill:var(--pad)"/><text x="218" y="${y + 15}" class="dnote" data-fit="56" style="fill:#f4f4ee">${n}</text>`).join("")}
      <g data-g="eyes">
        <path d="M336 116 H560" style="fill:none;stroke:var(--power);stroke-width:3"/>
        <path d="M336 88 H600 V268 H430" style="fill:none;stroke:var(--body);stroke-width:3"/>
        ${[[450, P_.left, 222], [530, P_.right, 196]].map(([x, n, py]) => `<path d="M${x} 116 V128" style="stroke:var(--power);stroke-width:3"/><rect x="${x - 12}" y="128" width="24" height="34" rx="5" style="fill:#e9dcb4;stroke:#8a7a5a"/><circle cx="${x}" cy="137" r="5" style="fill:#c9a65a"/>
          <path d="M${x} 162 V176" style="stroke:var(--sense);stroke-width:3"/><circle cx="${x}" cy="176" r="4" style="fill:var(--sense)"/><path d="M${x} 176 H${x - 30} V${py} H336" style="fill:none;stroke:var(--sense);stroke-width:3"/>
          <rect x="${x - 7}" y="186" width="14" height="40" rx="3" style="fill:#d8c9a8;stroke:#8a7a5a"/><path d="M${x} 176 V186 M${x} 226 V268" style="stroke:var(--body);stroke-width:3"/>`).join("")}
        <text x="490" y="108" text-anchor="middle" class="dnote">${esc(tz("light sensors", "光线传感器"))}</text><text x="490" y="250" text-anchor="middle" class="dnote">${esc(tz("resistors", "电阻"))}</text>
      </g>
      <g data-g="servo">
        <rect x="30" y="150" width="120" height="60" rx="10" style="fill:var(--output-t);stroke:var(--output);stroke-width:1.6;stroke-dasharray:6 4"/><text x="90" y="186" text-anchor="middle" class="dlab">${esc(tz("Servo", "舵机"))}</text>
        <path d="M336 60 H350 V24 H70 V150" style="fill:none;stroke:var(--power);stroke-width:3"/><text x="160" y="18" class="dnote">${esc(tz("power (red wire): VBUS, 5 V", "电源（红线）：VBUS，5 伏"))}</text>
        <path d="M204 226 H190 V196 H150" style="fill:none;stroke:var(--body);stroke-width:3"/><text x="34" y="232" class="dnote">${esc(tz("ground (brown)", "地线（棕线）"))}</text>
        <path d="M204 252 H180 V172 H150" style="fill:none;stroke:var(--connect);stroke-width:3"/><text x="34" y="292" class="dnote">${esc(tz(`signal (orange): ${P_.servo}`, `信号（橙线）：${P_.servo}`))}</text>
      </g>
    </svg>`;
    fitTexts(root);
    const svg = root.querySelector("svg");
    onSeg(root, "wg", v => svg.querySelectorAll("[data-g]").forEach(g => { g.style.opacity = v === "all" || g.dataset.g === v ? 1 : 0.12; }));
    return {};
  },

  /* ---------- where it goes next: roads leading out of the device. cards:[[job, title, sub]] ---------- */
  next(root, { cards }){
    const n = cards.length, step = Math.min(84, 250 / Math.max(n - 1, 1)), y0 = 150 - step * (n - 1) / 2;
    root.innerHTML = `<svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz("Where to go next", "接下来可以做什么"))}">
      <g data-roads>${cards.map((c, i) => `<path data-road="${i}" d="M180 150 C270 150 240 ${y0 + i * step} 330 ${y0 + i * step}" style="fill:none;stroke:var(--${c[0]});stroke-width:2.4;stroke-dasharray:6 5"/>`).join("")}</g>
      ${deviceBox(30, 112, 150, 76, devName())}
      ${cards.map((c, i) => partBox(470, y0 + i * step, c[0], L(c[1]), L(c[2]), { w:280 })).join("")}
      <g data-dots></g>
    </svg>`;
    const svg = root.querySelector("svg"), layer = svg.querySelector("[data-dots]"); fitTexts(svg);
    const flows = cards.map((c, i) => ({ p:svg.querySelector(`[data-road="${i}"]`), el:E("circle", { r:4.5, style:`fill:var(--${c[0]})` }, layer), j:i / n }));
    let clock = 0; const draw = () => flows.forEach(f => { const pt = f.p.getPointAtLength(((clock * 0.3 + f.j) % 1) * f.p.getTotalLength()); f.el.setAttribute("cx", pt.x.toFixed(1)); f.el.setAttribute("cy", pt.y.toFixed(1)); });
    draw();
    return { tick(dt){ clock += dt; draw(); } };
  },

  /* ---------- setting up a finished device: the device in the middle and each thing you connect ----------
     things:[{ id, name, note?, at:[x, y, w, h], g, group?, from:[x, y], via?:[x, y], dir?:"in" }]; lit: what is connected so far; pick: show group pills */
  hookup(root, { things, lit, pick = false, groups = [], reads = {}, device = { en:"", zh:"" } }){
    const litSet = new Set(lit || things.map(x => x.id)), colr = x => `var(--${x.g})`;
    const mid = x => [x.at[0] + x.at[2] / 2, x.at[1] + x.at[3] / 2];
    root.innerHTML = `${pick ? `<div class="demo-ctl">${pillsHTML("grp", [["all", tz("Everything", "全部")], ...groups.map(g => [g.id, L(g.name)])], "all")}</div>` : ""}
    <svg class="dsvg" viewBox="0 0 640 300" role="img" aria-label="${esc(tz(`The ${devName()} and the things you connect to it`, `${devName()} 和接到它上面的东西`))}">
      ${things.map(x => { const [fx, fy] = x.from, [tx, ty] = mid(x), c = x.via || [(fx + tx) / 2, (fy + ty) / 2]; return `<path data-cable="${x.id}" d="M${fx} ${fy} Q${c[0]} ${c[1]} ${tx} ${ty}" style="fill:none;stroke-linecap:round"/>`; }).join("")}
      ${things.map(x => { const [cx, cy] = mid(x); return partBox(cx, cy, x.g, L(x.name), x.note ? L(x.note) : ""); }).join("")}
      ${deviceBox(248, 120, 144, 66, devName(), L(device))}
      <g data-dots></g>
    </svg>${pick ? captionHTML() : ""}`;
    const svg = root.querySelector("svg"), dots = svg.querySelector("[data-dots]"), cap = root.querySelector("[data-caption]");
    fitTexts(svg);
    let sel = "all", clock = 0, flows = [];
    const paint = () => {
      dots.innerHTML = ""; flows = [];
      things.forEach(x => {
        const cable = svg.querySelector(`[data-cable="${x.id}"]`), connected = litSet.has(x.id), on = connected && (sel === "all" || x.group === sel), c = colr(x);
        cable.style.stroke = on ? c : connected ? `color-mix(in srgb,${c} 36%,transparent)` : "var(--muted)";
        cable.style.strokeDasharray = connected ? "none" : "6 6"; cable.style.strokeWidth = connected ? (x.g === "power" ? 5 : 3) : 2;
        if (on){ const els = Array.from({ length:Math.max(2, Math.round(cable.getTotalLength() / 70)) }, () => E("circle", { r:4.5, style:`fill:${c}` }, dots)); flows.push({ cable, els, rev:x.dir === "in" }); }
      });
      if (cap) cap.textContent = reads[sel] ? L(reads[sel]) : "";
    };
    if (pick) onSeg(root, "grp", v => { sel = v; paint(); });
    paint();
    return { tick(dt){ clock += dt; flows.forEach(f => { const len = f.cable.getTotalLength(); f.els.forEach((el, j) => { let u = (clock * 0.3 + j / f.els.length) % 1; if (f.rev) u = 1 - u; const pt = f.cable.getPointAtLength(u * len); el.setAttribute("cx", pt.x.toFixed(1)); el.setAttribute("cy", pt.y.toFixed(1)); }); }); } };
  },

  /* ---------- the first switch-on, step by step: steps:[{ cap, art }], art = what the screen shows (SVG in a 220 × 140 box at 210, 40) ---------- */
  firstrun(root, { steps:list }){
    const steps = typeof list === "function" ? list() : list;
    root.innerHTML = `<div class="demo-ctl"><button class="btn ghost small" data-sb>${esc(tz("‹ Back", "‹ 上一步"))}</button><button class="btn ghost small" data-sf>${esc(tz("Next ›", "下一步 ›"))}</button><span class="demo-read" id="dRead"></span></div>
    <svg class="dsvg" viewBox="0 0 640 220" role="img" aria-label="${esc(tz(`Switching the ${devName()} on for the first time`, `第一次打开 ${devName()}`))}">
      <path data-cable d="M180 110 H300" style="fill:none;stroke-linecap:round"/>
      ${deviceBox(30, 72, 150, 76, devName())}
      <g data-screen transform="translate(90 0)"></g>
      <g data-dots></g>
    </svg>${captionHTML()}`;
    const svg = root.querySelector("svg"), btn = s2 => root.querySelector(s2), cap = root.querySelector("[data-caption]"), read = root.querySelector("#dRead");
    fitTexts(svg);
    let i = 0, clock = 0;
    const cable = svg.querySelector("[data-cable]"), dot = E("circle", { r:4.5, style:"fill:var(--output)" }, svg.querySelector("[data-dots]"));
    const paint = () => {
      svg.querySelector("[data-screen]").innerHTML = steps[i].art;
      cap.textContent = L(steps[i].cap);
      read.textContent = tz(`Screen ${i + 1} of ${steps.length}`, `画面 ${i + 1} / ${steps.length}`);
      cable.style.stroke = i ? "var(--output)" : "var(--muted)"; cable.style.strokeWidth = i ? 3 : 2; cable.style.strokeDasharray = i ? "none" : "6 6"; dot.style.opacity = i ? 1 : 0;
      btn("[data-sb]").disabled = i === 0; btn("[data-sf]").disabled = i === steps.length - 1;
    };
    btn("[data-sb]").addEventListener("click", () => { i = Math.max(0, i - 1); paint(); });
    btn("[data-sf]").addEventListener("click", () => { i = Math.min(steps.length - 1, i + 1); paint(); });
    paint();
    const move = () => { const pt = cable.getPointAtLength((clock * 0.5 % 1) * cable.getTotalLength()); dot.setAttribute("cx", pt.x.toFixed(1)); dot.setAttribute("cy", pt.y.toFixed(1)); }; move();
    return { tick(dt){ clock += dt; move(); } };
  }
};
