/* ===================== Mac mini (2024, M4): the chapters and their pictures =====================
   Chapters 1–2 are built; chapters 3–6 are stubs (greyed out) until their review stop.
   The inside "floor plan" is a top-down map: +y (front of the box) is drawn toward the bottom. */
const IS = 3.0, ICX = 380, ICY = 250;                       // inside map: px per mm, box centred
const ix = x => ICX + x * IS, iy = y => ICY + y * IS;        // +y (front) goes downward

/* a filled part rectangle on the floor plan */
function fRect(id, cx, cy, w, h, txt){
  const g = PARTS[id].g, X = ix(cx - w / 2), Y = iy(cy - h / 2), W = w * IS, H = h * IS;
  return hit(id, `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="3" class="chip" style="fill:var(--${g}-t);stroke:var(--${g})"/>${txt ? `<text class="chiptxt" x="${X + W / 2}" y="${Y + H / 2 + 4}" text-anchor="middle" style="fill:var(--${g})">${esc(txt)}</text>` : ""}<rect class="hl" x="${X - 3}" y="${Y - 3}" width="${W + 6}" height="${H + 6}" rx="5"/>`);
}
/* a part that sits ABOVE the board: a dashed outline, so it doesn't hide the board parts */
function fAbove(id, cx, cy, w, h, round){
  const g = PARTS[id].g, X = ix(cx - w / 2), Y = iy(cy - h / 2), W = w * IS, H = h * IS;
  const shape = round
    ? `<circle cx="${ix(cx)}" cy="${iy(cy)}" r="${w / 2 * IS}" style="fill:none;stroke:var(--${g});stroke-width:1.6;stroke-dasharray:6 4"/><circle class="hl" cx="${ix(cx)}" cy="${iy(cy)}" r="${w / 2 * IS + 4}"/>`
    : `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="6" style="fill:none;stroke:var(--${g});stroke-width:1.6;stroke-dasharray:6 4"/><rect class="hl" x="${X - 3}" y="${Y - 3}" width="${W + 6}" height="${H + 6}" rx="8"/>`;
  return hit(id, shape);
}

/* chapter 2, tab "where the parts sit": a top-down floor plan */
function mapInside(){
  const o = [];
  // the case outline (the aluminium box) and the logic board inside it
  o.push(hit("body", `<rect x="${ix(-63.5)}" y="${iy(-63.5)}" width="${127 * IS}" height="${127 * IS}" rx="14" style="fill:var(--card);stroke:var(--body);stroke-width:1.6"/><rect class="hl" x="${ix(-63.5) - 3}" y="${iy(-63.5) - 3}" width="${127 * IS + 6}" height="${127 * IS + 6}" rx="16"/>`));
  o.push(hit("logicboard", `${rr(ix(-52), iy(-52), 104 * IS, 104 * IS, 8, "pcb")}<rect class="hl" x="${ix(-52) - 3}" y="${iy(-52) - 3}" width="${104 * IS + 6}" height="${104 * IS + 6}" rx="10"/>`));
  // parts that sit above (dashed): the power supply across the back, and the fan over the chip
  o.push(fAbove("psu", 0, -8, 108, 58, false));
  o.push(fAbove("cooling", 16, 8, 56, 56, true));
  // board-level parts
  o.push(fRect("antenna", 0, 44, 60, 5, ""));
  o.push(fRect("speaker", -34, -30, 22, 14, ""));
  o.push(fRect("ssd", 0, -34, 34, 14, "SSD"));
  o.push(fRect("memory", -20, 6, 11, 22, ""));
  o.push(fRect("memory", 20, 6, 11, 22, ""));
  o.push(fRect("chip", 0, 6, 26, 26, "M4"));
  const LX = 108, RX = 646;
  const lab = [
    label("psu", ix(0), iy(-26), RX, iy(-52), "r"),
    label("ssd", ix(14), iy(-34), RX, iy(-30), "r"),
    label("chip", ix(13), iy(6), RX, iy(2), "r"),
    label("cooling", ix(30), iy(14), RX, iy(30), "r"),
    label("antenna", ix(26), iy(44), RX, iy(52), "r"),
    label("logicboard", ix(-52), iy(-40), LX, iy(-46), "l"),
    label("speaker", ix(-45), iy(-30), LX, iy(-18), "l"),
    label("memory", ix(-25.5), iy(6), LX, iy(10), "l")
  ];
  return o.join("") + lab.join("");
}

/* chapter 1, tab "Big picture": the Mac mini and the things around it (a drawing only) */
const tip = (en, zh) => ({ en, zh });
const TIPS_SPREAD = [tip("Slide <b>Spread the layers</b> to lift the lid, the power supply and the fan off the board.", "拖动<b>展开各层</b>，盖子、电源和风扇会一层层抬起来，露出下面的板子。"), tip("Start with the violet <b>brain</b> (the M4 chip): almost everything works for it.", "先点紫色的<b>大脑</b>（M4 芯片），几乎所有东西都在为它服务。")];

/* chapter 3: a small top-down Mac beside each station; the station's parts light up (a picture only) */
function whereMap(){
  const o = [];
  o.push(hit("body", `<rect x="${ix(-63.5)}" y="${iy(-63.5)}" width="${127 * IS}" height="${127 * IS}" rx="14" style="fill:var(--card);stroke:var(--body);stroke-width:1.6"/>`));
  o.push(hit("logicboard", rr(ix(-52), iy(-52), 104 * IS, 104 * IS, 8, "pcb")));
  o.push(fAbove("psu", 0, -8, 108, 58, false));
  o.push(fAbove("cooling", 16, 8, 56, 56, true));
  o.push(fRect("antenna", 0, 44, 60, 5, ""));
  o.push(fRect("speaker", -34, -30, 22, 14, ""));
  o.push(fRect("ssd", 0, -34, 34, 14, ""));
  o.push(fRect("memory", -20, 6, 11, 22, ""));
  o.push(fRect("memory", 20, 6, 11, 22, ""));
  o.push(fRect("chip", 0, 6, 26, 26, ""));
  // the sockets, on the case edges: back along the top (−y), front along the bottom (+y)
  const strip = (id, cx, cy, w, h) => hit(id, `<rect x="${ix(cx) - w * IS / 2}" y="${iy(cy) - h / 2}" width="${w * IS}" height="${h}" rx="6" style="fill:var(--connect-t);stroke:var(--connect);stroke-width:1.6"/>`);
  o.push(strip("backports", 0, -70, 86, 18));
  o.push(strip("frontports", 0, 70, 50, 18));
  return o.join("");
}
COURSE.where = () => ({ viewBox:"176 20 408 460", svg:whereMap() });

/* ---------- what the shared demos show on this device ---------- */
const HOOK = [
  { id:"power", g:"power", group:"power", name:{ en:"Wall socket", zh:"插座" }, note:{ en:"home power", zh:"家里的电" }, at:[14, 118, 126, 66], from:[248, 153], dir:"in" },
  { id:"screen", g:"output", group:"screen", name:{ en:"Screen", zh:"屏幕" }, at:[430, 18, 180, 92], from:[392, 140], via:[430, 130], to:[520, 110] },
  { id:"keyboard", g:"sense", group:"input", name:{ en:"Keyboard", zh:"键盘" }, at:[130, 240, 170, 44], from:[280, 186], dir:"in" },
  { id:"mouse", g:"sense", group:"input", name:{ en:"Mouse", zh:"鼠标" }, at:[390, 236, 100, 48], from:[360, 186], dir:"in" }
];
const HOOK_SETUP = { things:HOOK, device:{ en:"the computer", zh:"这台电脑" },
  groups:[{ id:"power", name:{ en:"Power", zh:"电源" } }, { id:"screen", name:{ en:"Screen", zh:"屏幕" } }, { id:"input", name:{ en:"Keyboard & mouse", zh:"键盘和鼠标" } }],
  reads:{ all:{ en:"Every cable, plugged in.", zh:"每根线都接好了。" }, power:{ en:"One cord, to the wall socket.", zh:"一根电源线，接插座。" }, screen:{ en:"One cable, to the screen.", zh:"一根线，接屏幕。" }, input:{ en:"USB, or wireless over Bluetooth.", zh:"用 USB 连接，或者用蓝牙无线连接。" } } };
const RADIO = { modes:[
  { id:"wifi", tab:{ en:"Wi-Fi · the internet", zh:"Wi-Fi · 连网" }, targets:[{ en:"Router", zh:"路由器" }], range:{ en:"reaches across the room", zh:"能覆盖整个房间" }, read:{ en:"Across the room to your router, and through it to the internet.", zh:"连到房间另一头的路由器，再接入互联网。" } },
  { id:"bt", tab:{ en:"Bluetooth · gadgets", zh:"蓝牙 · 小设备" }, targets:[{ en:"Keyboard", zh:"键盘" }, { en:"Mouse", zh:"鼠标" }], range:{ en:"reaches a few metres", zh:"能连接几米内的设备" }, read:{ en:"A few metres, to a keyboard, mouse or headphones.", zh:"连接几米内的键盘、鼠标或耳机。" } } ] };
const PORTS = { socket:{ en:"one socket", zh:"一个口" }, things:[
  { id:"screen", name:{ en:"A screen", zh:"一块屏幕" }, lanes:{ power:1, data:1, video:1 }, read:{ en:"A picture goes out to the screen, in the same cable as power and data.", zh:"画面通过线送到屏幕，和电、数据走同一根线。" } },
  { id:"drive", name:{ en:"A fast drive", zh:"高速硬盘" }, lanes:{ power:1, data:2, video:0 }, read:{ en:"Files move both ways, fast, and the drive gets its power here too.", zh:"文件双向传输，速度很快，硬盘的电也从这里来。" } },
  { id:"charge", name:{ en:"A small gadget", zh:"小设备" }, lanes:{ power:1, data:0, video:0 }, read:{ en:"Just power, flowing out to the gadget.", zh:"这里只送电，给小设备充电。" } } ] };
const FIRSTRUN = () => [
      { cap:tz("Press the power button underneath. The screen is still black.", "按一下底部的电源键。这时屏幕还是黑的。"), art:`<rect x="210" y="40" width="220" height="140" rx="8" style="fill:#0b0c0e;stroke:var(--line);stroke-width:1.6"/>` },
      { cap:tz("The Mac wakes and loads macOS from the SSD. The Apple logo appears.", "Mac 启动，从 SSD 加载 macOS，屏幕上出现苹果标志。"), art:`<rect x="210" y="40" width="220" height="140" rx="8" style="fill:#111214"/><path d="M320 92 c-8 0 -14 6 -14 6 c6 -14 16 -12 16 -12 c0 4 -2 6 -2 6z M320 100 c-10 0 -16 7 -16 16 c0 11 8 20 14 20 c3 0 4 -2 8 -2 c4 0 5 2 8 2 c6 0 12 -8 13 -14 c-7 -3 -8 -13 -1 -17 c-4 -5 -11 -5 -13 -5 c-4 0 -7 2 -9 2z" style="fill:#f2efe4"/>` },
      { cap:tz("macOS setup begins. First, choose your language and country.", "开始设置 macOS。先选语言和国家或地区。"), art:`<rect x="210" y="40" width="220" height="140" rx="8" style="fill:var(--card);stroke:var(--line);stroke-width:1.6"/><text x="320" y="80" text-anchor="middle" class="dlab">${esc(tz("Language", "语言"))}</text><rect x="246" y="96" width="148" height="20" rx="5" style="fill:var(--think-t);stroke:var(--think)"/><text x="320" y="110" text-anchor="middle" class="dnote">${esc(tz("English · 中文 …", "English · 中文 …"))}</text>` },
      { cap:tz("Join your Wi-Fi, so the Mac can reach the internet.", "连接 Wi-Fi，Mac 就能上网了。"), art:`<rect x="210" y="40" width="220" height="140" rx="8" style="fill:var(--card);stroke:var(--line);stroke-width:1.6"/><text x="320" y="78" text-anchor="middle" class="dlab">${esc(tz("Wi-Fi", "Wi-Fi"))}</text><circle cx="320" cy="108" r="3" style="fill:var(--connect)"/><path d="M308 104 A17 17 0 0 1 332 104" style="fill:none;stroke:var(--connect);stroke-width:2"/><path d="M301 98 A27 27 0 0 1 339 98" style="fill:none;stroke:var(--connect);stroke-width:2"/>` },
      { cap:tz("Sign in with an Apple Account, or skip it for now.", "用 Apple 账户登录，或者先跳过。"), art:`<rect x="210" y="40" width="220" height="140" rx="8" style="fill:var(--card);stroke:var(--line);stroke-width:1.6"/><circle cx="320" cy="88" r="16" style="fill:var(--sense-t);stroke:var(--sense);stroke-width:1.6"/><circle cx="320" cy="83" r="6" style="fill:var(--sense)"/><path d="M308 100 a12 9 0 0 1 24 0" style="fill:var(--sense)"/><text x="320" y="140" text-anchor="middle" class="dnote">${esc(tz("sign in · or skip", "登录 · 或跳过"))}</text>` },
      { cap:tz("Done — this is your desktop. The Mac mini is ready to use.", "设置完成，这就是你的桌面。Mac mini 可以用了。"), art:`<rect x="210" y="40" width="220" height="140" rx="8" style="fill:#2a4a6a"/><rect x="210" y="40" width="220" height="16" rx="8" style="fill:var(--card)"/><rect x="210" y="40" width="220" height="16" style="fill:var(--card)"/><rect x="226" y="68" width="40" height="34" rx="6" style="fill:#ffffff22;stroke:#ffffff55"/><rect x="226" y="150" width="188" height="22" rx="11" style="fill:#ffffff33"/>` }
];
COURSE.chapters = [
  /* ---------- chapter 1: the outside ---------- */
  { id:"outside", title:{ en:"Meet the Mac mini", zh:"认识 Mac mini" }, rail:{ en:"Outside", zh:"外观" },
    thumb:`<rect x="6" y="16" width="32" height="16" rx="3" style="fill:var(--pcb)"/><circle cx="22" cy="24" r="3" style="fill:none;stroke:var(--pcb-edge)"/>`,
    intro:{ en:"Turn the box and find its sockets, its vent and its hidden power button. Then open the big picture: what a Mac mini is, and what it needs around it.", zh:"先转动这个盒子，找到它的接口、散热口，还有藏在底部的电源键。再看全貌：Mac mini 是什么，还要配些什么。" },
    views:[
      { id:"3d", tab:{ en:"3D view", zh:"3D 视图" }, model:"outside", presets:["angle", "front", "back", "bottom", "top"],
        idea:{ en:"A small aluminium box: sockets on the front and back, and the power button hidden underneath.", zh:"一个小铝盒：前面和后面是各种接口，电源键藏在底下。" },
        tips:[tip("Press <b>Back</b> to see the row of sockets: power, network, HDMI and Thunderbolt.", "点<b>后面</b>，看那一排接口：电源、网线、HDMI 和雷雳。"), tip("Press <b>Underneath</b> to find the round vent and the power button.", "点<b>底部</b>，找找圆形散热口和电源键。")] },
      { id:"big", tab:{ en:"Big picture", zh:"全貌" }, parts:[], model:"scene", presets:[],
        idea:{ en:"A Mac mini is a whole computer in a small box, but with no screen, keyboard or mouse: you add those.", zh:"Mac mini 是一整台电脑，装在小盒子里，但没有屏幕、键盘和鼠标，这些要你自己配。" },
        card:{ kicker:{ en:"Before we start", zh:"开始之前" }, title:{ en:"What is a Mac mini?", zh:"Mac mini 是什么？" },
          lead:{ en:"A complete computer squeezed into a small aluminium box, 12.7 cm square. Everything that does the thinking is inside, built around one chip, the Apple M4, the brain. But it has no screen, keyboard or mouse of its own, so you add those and plug it into the wall.", zh:"一台完整的电脑，装在一个 12.7 厘米见方的小铝盒里。电脑的核心是一颗叫 Apple M4 的芯片，也就是它的大脑。Mac mini 自己没有屏幕、键盘和鼠标，这些要另外准备，再接上插座就能用。" },
          blocks:[
            { h:{ en:"What it's for", zh:"用来做什么" }, p:{ en:"It's a desktop computer for everyday things: the web, writing, photos, video, music, code. You bring your own screen and keyboard, which is why it's cheaper and smaller than most computers.", zh:"它是一台日常用的台式电脑：上网、写东西、修照片、剪视频、听音乐、写代码。屏幕和键盘自己带，所以它比大多数电脑更便宜、更小。" } },
            { h:{ en:"What it can't do alone", zh:"它自己做不到什么" }, p:{ en:"Nothing shows up until you connect a screen (by cable), and you can't control it without a keyboard and mouse (by cable or wirelessly). It also needs wall power: there's no battery.", zh:"只有主机还不够。用一根线接上屏幕，才能看到画面；再配上键盘和鼠标，才能操作，有线无线都可以。它也没有电池，要一直插着电源。" } },
            { h:{ en:"Where the course is going", zh:"这门课怎么学" }, p:{ en:"We'll go from the outside in: the sockets, then the parts inside, then how they work together, and in the last chapter we set one up and switch it on.", zh:"我们从外往里看：先看接口，再看里面的部件和它们的配合方式，最后动手接线、开机。" } },
            { h:{ en:"The Mac mini family", zh:"Mac mini 家族" }, p:{ en:"This course is the M4 model (2024). The M4 Pro model looks the same but has a faster chip, more memory and faster Thunderbolt 5 sockets.", zh:"这门课讲的是 M4 款（2024）。M4 Pro 款长得一样，但芯片更快、内存更大，雷雳口也升级成了更快的雷雳 5。" } }
          ] } },
    ],
    nav:[{ to:"inside", label:{ en:"Next: what's inside →", zh:"下一章：里面有什么 →" } }] },

  /* ---------- chapter 2: the inside ---------- */
  { id:"inside", title:{ en:"What's inside", zh:"里面有什么" }, rail:{ en:"Inside", zh:"里面" },
    safety:{ lead:{ en:"Look only", zh:"只看不拆" }, text:{ en:"Don't open a real Mac mini: it runs on wall power and is sealed shut. These are drawings from teardown photos. If you ever need inside, Apple's own guide is the safe way.", zh:"不要拆开真机：它接的是插座的电，而且机身是密封的。这里的图是根据拆解照片画的。如果确实要打开，请按苹果官方指南操作。" } },
    intro:{ en:"Spread the layers in the 3D view, then see where each part sits, looking straight down.", zh:"先在 3D 视图里展开各层，再从正上方看每个部件的位置。" },
    views:[
      { id:"3d", tab:{ en:"3D view", zh:"3D 视图" }, model:"layers", presets:["angle", "front", "top"],
        idea:{ en:"Under the lid: the power supply across the top, a fan, and the board with the M4 chip.", zh:"盖子下面：顶部横着电源，中间一个风扇，底下是带 M4 芯片的主板。" }, tips:TIPS_SPREAD },
      { id:"flat", tab:{ en:"Where the parts sit", zh:"部件在哪儿" }, svg:{ viewBox:"-24 16 808 480", draw:mapInside },
        idea:{ en:"Looking straight down: the brain sits in the middle, its memory right beside it. The power supply and fan (dashed) sit above.", zh:"从正上方看：大脑在正中间，内存就贴在它旁边。电源和风扇（虚线）在它们上方。" },
        tips:[tip("Solid shapes are on the board; <b>dashed</b> shapes sit above it.", "实线的在板子上，<b>虚线</b>的在板子上方。"), tip("Notice the two <b>memory</b> chips hugging the brain: that's why they're so fast together.", "注意紧挨大脑的两块<b>内存</b>，离得近，所以速度快。")] }
    ],
    nav:[{ to:"outside", label:{ en:"← Back to the outside", zh:"← 回到外观" }, ghost:true }, { to:"parts", label:{ en:"Next: what each part does →", zh:"下一章：每个部件的作用 →" } }] },

  /* ---------- chapters 3–6: built at later review stops (greyed out until then) ---------- */
  /* ---------- chapter 3: one station per part ---------- */
  { id:"parts", title:{ en:"What each part does", zh:"每个部件的作用" }, rail:{ en:"Parts", zh:"部件" },
    intro:{ en:"Seven small stations, starting with the chip at its heart. Play with each one to see its job.", zh:"从最核心的芯片讲起，逐个看每个部件的作用。每一站都可以动手试试。" },
    deep:{ m4:{ g:"think", en:["Inside the M4 chip", "the heart of this computer"], zh:["M4 芯片里面", "这台电脑的核心"] } },
    stations:[
      { id:"chip", g:"think", deep:"m4", parts:["chip"], demo:"chipmap",
        setup:{ name:{ en:"The Apple M4 chip", zh:"Apple M4 芯片" }, intro:{ en:"One chip holds four teams. Tap one to see its job, then open it.", zh:"一块芯片里有四个部分。点一个，看看它负责什么。" },
          note:{ en:"Drawn to show the teams, not where each one really sits on the chip.", zh:"这张图只是为了说明分工，不代表它们在芯片上的真实位置。" },
          blocks:[
            { id:"cpu", station:"cpu", name:{ en:"CPU · 10 cores", zh:"CPU · 10 个核心" }, short:{ en:"CPU", zh:"CPU" }, n:10, at:[116, 46, 198, 116], cap:{ en:"The all-rounder. It runs macOS and your apps.", zh:"电脑的主力，macOS 和 App 都在这里运行。" } },
            { id:"gpu", station:"gpu", name:{ en:"GPU · 10 cores", zh:"GPU · 10 个核心" }, short:{ en:"GPU", zh:"GPU" }, n:10, at:[326, 46, 198, 116], cap:{ en:"The graphics team. It draws everything you see on the screen.", zh:"负责画面，屏幕上的内容都是它画的。" } },
            { id:"neural", station:"neural", name:{ en:"Neural Engine · 16", zh:"神经网络引擎 · 16" }, short:{ en:"Neural Engine", zh:"神经网络引擎" }, n:16, at:[116, 172, 198, 108], cap:{ en:"The AI team. It recognises things in photos and speech.", zh:"负责 AI，比如识别照片和语音里的内容。" } },
            { id:"unified", station:"unified", name:{ en:"Unified memory", zh:"统一内存" }, short:{ en:"Memory", zh:"内存" }, at:[326, 172, 198, 108], cap:{ en:"16 GB, right beside the chip and shared by the teams. It sits on the same package, not inside the chip itself.", zh:"16 GB，紧挨着芯片，大家共用。它和芯片封装在一起，但不在芯片本体里。" } }
          ] },
        idea:{ en:"One chip, four teams, each built for one kind of job.", zh:"一块芯片分四个部分，各做各擅长的工作。" },
        en:{ t:"The M4 chip: four teams in one", lead:"The M4 is the small square in the middle of the main board, and it's the heart of this computer. It's called a system on a chip: parts that used to be separate chips now live in this one square. Here are its four teams. The next four stations open each one.",
          watch:["Tap a team to see what it does.", "Press Open to go to that team's own station.", "Count the small squares: each one is a core, a worker that does one job at a time."],
          general:"Phones and tablets use this all-in-one idea too. On many desktop PCs the graphics part is a separate card you can swap; in the M4 it's built in, which is one reason the box is so small." },
        zh:{ t:"M4 芯片：一块芯片，四个部分", lead:"M4 是主板中间的小方块，也是这台电脑的核心。它叫系统级芯片，以前要好几颗芯片做的事，现在一块就够了。它有四个主要部分，接下来四站逐个讲。",
          watch:["点一个部分，看看它负责什么。", "按“展开看”，进入这个部分自己的一站。", "数数那些小方格：每一格是一个核心，一次只做一件事。"],
          general:"手机和平板也是这样设计的。很多台式机的显卡是单独的一块，可以更换；M4 把它做在了芯片里，这也是机身能做这么小的原因之一。" } },
      { id:"cpu", g:"think", deep:"m4", parts:["chip"], demo:"workers",
        setup:{ cores:10, groups:[{ n:4, en:"4 fast cores", zh:"4 个快核心", speed:1.5 }, { n:6, en:"6 power-saving cores", zh:"6 个省电核心", speed:0.8 }],
          chip:{ en:"THE M4'S CPU", zh:"M4 里的 CPU" }, jobs:[["output", { en:"play video", zh:"放视频" }], ["think", { en:"open an app", zh:"打开 App" }], ["connect", { en:"load a page", zh:"打开网页" }], ["sense", { en:"read a key", zh:"读按键" }]] },
        idea:{ en:"10 cores means up to 10 jobs at the same moment.", zh:"10 个核心，同一时刻最多能做 10 件事。" },
        en:{ t:"CPU: 4 fast cores and 6 power-saving ones", lead:"The CPU is the part of the M4 that runs macOS and your apps. It has 10 cores, and each core does one job at a time. In a computer the jobs never stop, so many cores share them. 4 are fast, for heavy work. 6 use less power, for light work.",
          watch:["Switch to 1 core: the line of waiting jobs grows, because jobs arrive faster than one core can finish them.", "Switch back to 10 cores: the line stays short.", "Speeds here are drawn to show the idea, not measured."],
          general:"Every computer's brain works in cores. The number differs a lot: this one has 10, a small board like a Raspberry Pi Pico has 2. Having two kinds of core is common on phones and Macs, but not on every computer." },
        zh:{ t:"CPU：4 个快核心，6 个省电核心", lead:"CPU 是 M4 里运行 macOS 和 App 的部分。它有 10 个核心，每个核心一次做一件事。电脑同时要做很多事，所以要分给多个核心。4 个快核心做繁重的工作，6 个省电核心做轻松的工作。",
          watch:["切到 1 个核心：任务来得比它做得快，排队的任务越来越多。", "切回 10 个核心：排队的任务一直很少。", "这里的速度只是示意，不是实测。"],
          general:"每台电脑的大脑都有核心，但数量差别很大：这台有 10 个，树莓派 Pico 这样的小板子只有 2 个。快慢两种核心在手机和 Mac 上很常见，但不是每台电脑都这样。" } },
      { id:"gpu", g:"think", deep:"m4", parts:["chip"], demo:"parallel",
        setup:{ cores:10, one:{ en:"1 core", zh:"1 个核心" }, many:{ en:"10 GPU cores", zh:"10 个 GPU 核心" }, read:{ en:"Each square stands for a patch of the screen. Speeds are drawn to show the idea.", zh:"每个方格代表屏幕上的一小块。速度只是示意。" } },
        idea:{ en:"A picture is many small jobs, so a team finishes it far sooner than one worker.", zh:"一幅画面可以拆成很多小任务，一组核心同时画，比一个核心快得多。" },
        en:{ t:"GPU: draws what you see", lead:"The GPU is the part of the M4 that makes the picture on your screen. A screen is millions of small dots, and working out each dot's colour is one small job. The CPU's cores are built for varied work. The GPU's 10 cores are built to do the same small job side by side.",
          watch:["Watch 1 core fill the picture, one square at a time.", "Switch to the 10 GPU cores and press Draw it again: many squares fill at once.", "The screen is redrawn many times a second, so this speed matters."],
          general:"Every computer with a screen has a GPU. Many desktop PCs have it on a separate card; here it's inside the chip. A small board like a Pico has none." },
        zh:{ t:"GPU：画出你看到的画面", lead:"GPU 是 M4 里负责屏幕画面的部分。屏幕由几百万个小点组成，算出每个点的颜色就是一个小任务。CPU 的核心擅长处理各种不同的工作，GPU 的 10 个核心擅长同时做大量相同的小任务。",
          watch:["先看 1 个核心一格一格地画。", "切到 10 个 GPU 核心，按“再画一次”：很多格同时填满。", "屏幕每秒要重画很多次，所以这个速度很重要。"],
          general:"有屏幕的电脑都有 GPU。很多台式机把它做成一块单独的卡，这里它在芯片里。Pico 这样的小板子没有 GPU。" } },
      { id:"neural", g:"think", deep:"m4", parts:["chip"], demo:"pattern",
        setup:{ cores:16, samples:[{ name:{ en:"A photo", zh:"一张照片" }, input:{ en:"Your photo", zh:"你的照片" }, answer:{ en:"\"A dog\"", zh:"“一只狗”" } }, { name:{ en:"Your voice", zh:"你说的话" }, input:{ en:"Your voice", zh:"你的声音" }, answer:{ en:"The words", zh:"说的是什么" } }] },
        idea:{ en:"It recognises things by doing huge piles of small sums at once.", zh:"它同时做大量小计算，从而认出内容。" },
        en:{ t:"Neural Engine: the AI team", lead:"The Neural Engine is the part of the M4 built for AI jobs, like finding what's in a photo or turning speech into words. These jobs are huge piles of small sums. Its 16 cores are made for exactly those sums, so they finish quickly and use little power.",
          watch:["Pick a photo: all 16 cores work on it at once.", "An answer comes out, not a picture: this team recognises things.", "The drawing shows the idea; the real sums are far too many to draw."],
          general:"Newer phones and computers often have a part like this, under different names. Older computers do the same jobs on the CPU or GPU, more slowly and with more power." },
        zh:{ t:"神经网络引擎：专门做 AI", lead:"神经网络引擎是 M4 里专门做 AI 工作的部分，比如认出照片里有什么，把语音转成文字。这些工作其实是大量的小计算。它的 16 个核心就是为这种计算设计的，所以又快又省电。",
          watch:["选一张照片：16 个核心同时计算。", "最后得到的是一个答案，不是画面。它负责“认出内容”。", "这张图只是示意，真实的计算量大得多。"],
          general:"较新的手机和电脑大多有这样的部件，只是名字不同。老电脑用 CPU 或 GPU 做同样的工作，速度慢一些，也更费电。" } },
      { id:"unified", g:"think", deep:"m4", parts:["memory", "chip"], demo:"shared",
        setup:{ who:[{ en:"CPU", zh:"CPU" }, { en:"GPU", zh:"GPU" }], size:{ en:"Unified memory · 16 GB", zh:"统一内存 · 16 GB" },
          read:{ one:{ en:"Both reach the same memory, so nothing needs copying.", zh:"两边用的是同一块内存，不用复制。" }, two:{ en:"With separate memories, work has to be copied across first.", zh:"内存分开时，数据要先复制过去。" } } },
        idea:{ en:"One shared memory means no copying between the CPU and the GPU.", zh:"共用一块内存，CPU 和 GPU 之间就不用来回复制数据。" },
        en:{ t:"Unified memory: one shared space", lead:"Unified memory is the M4's working memory, 16 GB on this model, right beside the chip. Unified means the CPU and GPU share it. Data moves at up to 120 gigabytes a second, which is about 120 billion letters every second.",
          watch:["Watch the dot go from the CPU to the GPU through one shared memory.", "Switch to Separate memories: the same trip takes an extra copy.", "Because it's fixed in place, you choose the amount when you buy: 16, 24 or 32 GB."],
          general:"Most desktop PCs keep separate memory for the CPU and for a graphics card. Sharing one memory is how Apple's chips work, and many phones do something similar." },
        zh:{ t:"统一内存：大家共用", lead:"统一内存是 M4 的工作内存，这一款是 16 GB，就在芯片旁边。“统一”的意思是 CPU 和 GPU 共用这块内存。它每秒最多能传输 120 GB，差不多是 1200 亿个字母。",
          watch:["看小圆点从 CPU 经过共用内存到 GPU。", "切到“各用各的内存”：同样的数据要多复制一次。", "内存以后不能加，买的时候就要选好：16、24 或 32 GB。"],
          general:"很多台式机的 CPU 和显卡各有自己的内存。苹果芯片是共用一块，不少手机也类似。" } },
      { id:"memory", g:"think", parts:["memory", "ssd"], demo:"memory",
        setup:{ shelf:{ label:{ en:"STORAGE · 256 GB SSD", zh:"存储 · 256GB SSD" }, sub:{ en:"like a bookshelf: keeps everything", zh:"像书架，东西一直留着" }, items:[{ en:"macOS", zh:"macOS 系统" }, { en:"Your apps and files", zh:"你的 App 和文件" }, { en:"Photos", zh:"照片" }] },
          desk:{ label:{ en:"WORKING MEMORY · 16 GB", zh:"工作内存 · 16GB" }, sub:{ en:"like a desk: in use right now", zh:"像书桌，放着正在用的东西" }, items:[{ en:"The app you're using", zh:"正在用的 App" }, { en:"The page you're reading", zh:"正在看的网页" }] },
          copy:{ en:"macOS and your app (from storage)", zh:"从存储读来的系统和 App" } },
        idea:{ en:"Storage keeps everything with the power off; working memory is wiped.", zh:"存储断电后内容还在，工作内存一断电就清空。" },
        en:{ t:"Storage and working memory", lead:"Two places hold information. Storage is the SSD, a small module on the board: it keeps macOS, your apps and files even with no power, like a bookshelf — 256 GB, room for about 256 billion letters. Working memory is the unified memory, right on the M4 chip: fast space for whatever you're doing this moment, like a desk — 16 GB. 'Unified' means the CPU and GPU share one pool, so they reach it fast.",
          watch:["Cut the power: the desk (working memory) is wiped; the bookshelf (storage) keeps everything.", "Turn it back on: the Mac reads macOS from storage and fills the desk again.", "Storage is much bigger than working memory: 256 GB against 16 GB."],
          general:"Almost every computer has these two kinds of memory. Apple's unified memory is unusual in sitting right on the chip, shared by the CPU and GPU." },
        zh:{ t:"存储和工作内存", lead:"信息存在两个地方。存储就是 SSD，是主板上的一个小模块。断电后，macOS、App 和文件都还在，就像书架。这一款是 256GB，大约能放 2560 亿个字母。工作内存就是统一内存，紧挨 M4 芯片，放的是你正在用的内容，速度很快，就像书桌。这一款是 16GB。",
          watch:["断电：书桌（工作内存）马上清空，书架（存储）上的东西都还在。", "再开机：Mac 从存储读出 macOS，书桌上的东西又慢慢多起来。", "存储比工作内存大得多：256GB 对 16GB。"],
          general:"几乎每台电脑都有存储和工作内存。苹果的统一内存比较特别，它和芯片封装在一起，由 CPU 和 GPU 共用。" } },
      { id:"sockets", g:"connect", parts:["frontports", "backports"], demo:"ports", setup:PORTS,
        idea:{ en:"One socket, one cable — power, data and a picture all at once.", zh:"一个接口、一根线，电、数据和画面都能传。" },
        en:{ t:"The sockets: one cable does it all", lead:"The Mac mini has USB-C sockets on the front and faster Thunderbolt sockets on the back. They look the same, and the plug fits either way up. What's clever is that one cable carries several things at once: power, data, and a picture for a screen. So the same kind of socket can charge a gadget, read a drive, or drive a monitor.",
          watch:["Plug in a screen: a picture flows out, in the same cable as power and data.", "Plug in a fast drive: files move both ways at once.", "It's still just one socket and one cable each time."],
          general:"USB-C works this way on most new computers and phones. Thunderbolt is a faster version (up to 40 Gb/s) that can also drive big screens; the back sockets are Thunderbolt." },
        zh:{ t:"接口：一根线传多种内容", lead:"Mac mini 前面是 USB-C 口，后面是更快的雷雳口。它们外形一样，插头正反都能插。一根线可以同时传好几样东西：电、数据，还有给屏幕的画面。所以同一种接口，既能给小设备充电，也能接硬盘和显示器。",
          watch:["接一块屏幕：画面、电和数据走同一根线。", "接一个高速硬盘：文件可以双向传输。", "每次都只用一个接口、一根线。"],
          general:"现在大多数电脑和手机的 USB-C 都是这样用的。雷雳是更快的版本（最高 40 Gb/s），也能接大屏幕，背面的三个 USB-C 口就是雷雳。" } },
      { id:"wireless", g:"connect", parts:["antenna"], demo:"radio", setup:RADIO,
        idea:{ en:"The antenna talks through the air — no wire needed.", zh:"天线通过无线电波通信，不用接线。" },
        en:{ t:"Wireless: Wi-Fi and Bluetooth", lead:"Near the base sits a small antenna. It sends and catches radio waves — an invisible signal that travels through the air, with no wire. Over Wi-Fi it reaches your router across the room, and through it the internet. Over Bluetooth it reaches gadgets a few metres away: a wireless keyboard, mouse or headphones.",
          watch:["Wi-Fi: the waves reach across the room to your router.", "Bluetooth: the waves reach a keyboard or mouse a few metres away.", "No wire either way — the signal travels through the air."],
          general:"Most computers and phones have Wi-Fi and Bluetooth built in like this. Some bare boards (the plain Raspberry Pi Pico) have neither until you add it." },
        zh:{ t:"无线：Wi-Fi 和蓝牙", lead:"靠近底座有一个小天线，用来收发无线电波。无线电波是一种看不见的信号，能穿过空气传播。通过 Wi-Fi，它能连到路由器，再接入互联网；通过蓝牙，它能连接几米内的无线键盘、鼠标或耳机。",
          watch:["Wi-Fi：电波连到房间里的路由器。", "蓝牙：电波连到几米内的键盘或鼠标。", "两种都不用接线，信号通过空气传播。"],
          general:"大多数电脑和手机都内置了 Wi-Fi 和蓝牙。有些开发板（比如普通的树莓派 Pico）没有，要自己加。" } },
      { id:"power", g:"power", parts:["psu"], demo:"regulator",
        setup:{ min:100, max:240, out:12, outLabel:{ en:"TO THE BOARD", zh:"给主板" }, presets:[[120, { en:"US wall", zh:"美国家用电" }], [230, { en:"EU wall", zh:"欧洲家用电" }]] },
        idea:{ en:"Any wall voltage from 100 to 240 comes out as steady low-voltage power.", zh:"插座的电在 100 到 240 伏之间，出来都是稳定的低压电。" },
        en:{ t:"Power supply: wall power made steady", lead:"The power supply is built into the top of the case. 'Wall power' just means the electricity from an ordinary wall socket — the same kind you'd plug a lamp into (also called mains power). It's strong, differs by country (100 to 240 volts) and swings up and down; the chip needs a gentle, steady supply instead. The power supply takes whatever the socket gives and turns it into a steady low voltage for the board (around 12 volts). Because it's built in, the box ships with just a cord, no bulky brick.",
          watch:["Try US wall power (120 V) or EU wall power (230 V): the output stays steady.", "Anywhere in the green band works — that's why the Mac mini runs worldwide.", "Below the band it can't run; above it is more than it's built for."],
          general:"Every computer needs steady power. Many use an external brick; the Mac mini's supply is built in, which is why only a thin cord comes in the box." },
        zh:{ t:"电源：把插座的电变稳", lead:"电源装在机身顶部。家里插座的电压很高，各国还不一样（100 到 240 伏），也不够稳定，而芯片要的是又低又稳的电。电源把插座的电变成主板需要的稳定低压电（12 伏左右）。电源装在机身里，所以只需要一根电源线，不用外接电源适配器。",
          watch:["试美国家用电（120 V）或欧洲家用电（230 V）：输出的电都一样稳定。", "只要在绿色区间内都可以，所以 Mac mini 在世界各地都能用。", "低于这个区间开不了机，高于它就超出了设计范围。"],
          general:"每台电脑都需要稳定的电。很多电脑用外接电源适配器；Mac mini 的电源装在机身里，所以只需要一根电源线。" } },
      { id:"cooling", g:"body", parts:["cooling"], demo:"thermo",
        idea:{ en:"The chip makes heat when it works; the fan carries it away.", zh:"芯片工作时会发热，风扇把热量带走。" },
        en:{ t:"Cooling: the fan and heatsink", lead:"Cooling is the fan above the board, with a copper heatsink pressed onto the M4 chip. When the chip works hard it makes heat, and too much heat would make it slow down to protect itself. The heatsink soaks the heat up and the fan blows it out the back. The chip has its own thermometer, so it always knows how warm it is.",
          watch:["Give the brain hard work: the chip warms up and reads warmer than the room.", "Let it rest: it cools back toward the room.", "This shows warmer or cooler, not exact degrees."],
          general:"Every chip makes heat and needs a way to lose it. A phone does it with no fan, by spreading heat into its body; the Mac mini uses a fan." },
        zh:{ t:"散热：风扇和散热片", lead:"散热系统由主板上方的风扇和压在 M4 芯片上的铜散热片组成。芯片满负荷工作时会发热，太热时会自动降速来保护自己。散热片先吸收热量，风扇再把热量从背面吹出去。芯片里有温度传感器，随时知道自己的温度。",
          watch:["让大脑满负荷工作：芯片发热，温度高于室温。", "让它休息：温度慢慢降回室温。", "这里只显示温度升降的方向，不是具体度数。"],
          general:"每颗芯片都会发热，都需要散热。手机一般没有风扇，靠机身散热；Mac mini 用风扇。" } }
    ],
    nav:[{ to:"inside", label:{ en:"← Back to what's inside", zh:"← 回到里面有什么" }, ghost:true }, { to:"roads", label:{ en:"Next: how they connect →", zh:"下一章：它们怎么连起来 →" } }] },

  /* ---------- chapter 4: the roads between the parts, around the brain ---------- */
  { id:"roads", title:{ en:"How they connect", zh:"它们怎么连起来" }, rail:{ en:"Roads", zh:"道路" },
    intro:{ en:"Every part is joined to the brain by roads: some carry energy, some carry information, and some go through the air.", zh:"每个部件都有“路”连到大脑。有的路送电，有的路传信息，还有的路是无线的。" },
    roads:{
      viewBox:"0 0 1000 620", hub:"chip",
      extra:{ internet:{ g:"connect", dashed:true, en:["The internet", "through your router"], zh:["互联网", "通过你的路由器"] } },
      families:[
        { id:"energy", line:"power", en:["Energy", "keeps every part alive"], zh:["能量", "给每个部件供电"] },
        { id:"info", line:"usb", en:["Information wires", "carry data, files and the picture"], zh:["信息线", "传数据、文件和画面"] },
        { id:"air", line:"radio", en:["Through the air", "Wi-Fi and Bluetooth, no wire"], zh:["无线", "Wi-Fi 和蓝牙，不用线"] }
      ],
      kinds:{
        power:{ fam:"energy", line:"power", en:["Power line", "Carries energy, not information: steady low-voltage power from the supply to the board."], zh:["供电线路", "这条路送的是电，不是信息。电源把稳定的低压电送到主板。"],
          why:{ en:"Every part needs energy, so power reaches the whole board.", zh:"每个部件都离不开能量，所以电要送遍整块板子。" } },
        data:{ fam:"info", line:"usb", en:["Socket data (USB-C / Thunderbolt)", "Carries data in and out through the sockets, and to the antenna: drives, cables, the keyboard."], zh:["接口数据（USB-C / 雷雳）", "数据通过接口进出，也通到天线。硬盘、键盘这些有线设备都走这里。"],
          why:{ en:"The sockets are how the Mac reaches wired gear, so data flows both ways through them.", zh:"有线设备都靠接口和 Mac 相连，所以数据在这里双向传输。" } },
        picture:{ fam:"info", line:"net", en:["Picture out", "The finished picture the GPU draws, sent out a socket to your screen."], zh:["画面输出", "GPU 画好的画面，从接口送到你的屏幕。"],
          why:{ en:"A screen needs a steady stream of finished images, so the picture gets its own fast road out.", zh:"屏幕要不停地收到新画面，所以画面单独走一条又宽又快的路。" } },
        storage:{ fam:"info", line:"spi", en:["Storage lane", "Carries macOS, your apps and files between the SSD and the brain."], zh:["存储通道", "macOS、App 和文件，都走这条路在 SSD 和大脑之间传输。"],
          why:{ en:"Files are big and the brain reads and writes them often, so this is a wide, fast road.", zh:"文件很大，大脑又要经常读写，所以这条路又宽又快。" } },
        inside:{ fam:"info", line:"gpio", en:["Inside the chip", "The M4's own wiring, which hands work to the CPU, GPU and Neural Engine."], zh:["芯片内部", "M4 内部的线路，把工作分给 CPU、GPU 和神经网络引擎。"],
          why:{ en:"The teams sit in one chip, so work passes between them without ever leaving it.", zh:"这几个部分都在同一块芯片里，工作在它们之间传递，不用离开芯片。" } },
        memory:{ fam:"info", line:"i2s", en:["Unified memory", "The fastest road of all: up to 120 GB a second between the working memory and the CPU and GPU."], zh:["统一内存", "最快的一条路：工作内存就在芯片上，CPU 和 GPU 共用。"],
          why:{ en:"The brain touches working memory constantly, so it's placed as close as possible — right on the chip.", zh:"大脑时刻都在用工作内存，所以把它放得尽量近，就封装在芯片上。" } },
        radio:{ fam:"air", line:"radio", en:["Radio waves", "No wire: Wi-Fi reaches your router and the internet; Bluetooth reaches a keyboard, mouse or headphones."], zh:["无线电波", "不用线。Wi-Fi 连路由器，再接入互联网；蓝牙连键盘、鼠标或耳机。"],
          why:{ en:"Some things are easier without a cable, so the antenna carries them through the air.", zh:"有些设备不接线更方便，所以交给天线用无线传。" } }
      },
      nodes:{ chip:[500, 300], cpu:[330, 400], gpu:[670, 400], neural:[500, 470], memory:[880, 270], ssd:[130, 270], frontports:[60, 430], backports:[940, 430], antenna:[250, 110], internet:[500, 95], monitor:[760, 120], psu:[280, 570], powercord:[720, 570] },
      zones:[
        ["connect", 120, 60, 500, 100, { en:"Through the air", zh:"无线" }, { en:"Wi-Fi, Bluetooth", zh:"Wi-Fi、蓝牙" }],
        ["think", 240, 250, 520, 270, { en:"Inside the M4", zh:"M4 里面" }, { en:"", zh:"" }],
        ["power", 180, 530, 640, 90, { en:"Power", zh:"电源" }, { en:"energy for the board", zh:"给主板供电" }]
      ],
      roads:[
        ["powercord", "psu", "power", { en:"from the wall socket", zh:"从插座来" }],
        ["psu", "chip", "power", { en:"steady power for the whole board", zh:"给整块主板稳定供电" }, false, [70, 330]],
        ["ssd", "chip", "storage", { en:"macOS, apps and files", zh:"macOS、App 和文件" }, true],
        ["memory", "chip", "memory", { en:"what it's working on right now", zh:"正在处理的内容" }, true],
        ["memory", "gpu", "memory", { en:"the picture being drawn", zh:"正在画的画面" }, true],
        ["chip", "cpu", "inside", { en:"everyday work", zh:"日常工作" }, true],
        ["chip", "gpu", "inside", { en:"drawing work", zh:"画面工作" }, true],
        ["chip", "neural", "inside", { en:"AI work", zh:"AI 工作" }, true],
        ["backports", "chip", "data", { en:"Thunderbolt: the fastest sockets", zh:"雷雳：最快的接口" }, true],
        ["frontports", "chip", "data", { en:"USB-C: the easy-to-reach sockets", zh:"USB-C：在正面，方便插拔" }, true],
        ["gpu", "monitor", "picture", { en:"out through an HDMI or Thunderbolt socket", zh:"从 HDMI 或雷雳口送出去" }, false, "v"],
        ["chip", "antenna", "data", { en:"the brain's wire to the antenna", zh:"大脑和天线之间的线路" }, true],
        ["antenna", "internet", "radio", { en:"Wi-Fi, through the air", zh:"Wi-Fi 无线连接" }, true]
      ],
      idea:{
        title:{ en:"Everything meets at the brain", zh:"一切都在大脑这里汇合" },
        text:{ en:"Power comes up from the supply. Files come from storage, the picture goes out to a screen, and the sockets and antenna reach the world. The brain sits in the middle of it all.", zh:"电从电源送上来，文件从存储读出来，画面送到屏幕，接口和天线连到外面。所有这些路都汇合在大脑。" },
        tips:[tip("Pick a road in the list: only that road lights up, and dots show which way it flows.", "在左边列表里选一种路。只有这种路会亮起来，小圆点表示传输方向。"), tip("Tap any part on the map to see all of its roads.", "点地图上的部件，就能看到连着它的所有路。")],
        note:{ en:"The back also has a wired network socket (Ethernet): a cable to the internet instead of Wi-Fi. The M4 Pro model's sockets are faster still.", zh:"背面还有一个网线口（以太网），可以用网线上网，不用 Wi-Fi。M4 Pro 款的接口更快。" },
        line:{ en:"Energy comes up from below, information crosses the middle, and the antenna reaches through the air.", zh:"电从下面送上来，信息在中间传递，天线用无线连到外面。" } }
    },
    nav:[{ to:"parts", label:{ en:"← Back to the parts", zh:"← 回到部件" }, ghost:true }, { to:"signal", label:{ en:"Next: follow a signal →", zh:"下一章：跟着信号走 →" } }] },
  /* ---------- chapter 5: follow one signal at a time, on the chapter 4 map ---------- */
  { id:"signal", title:{ en:"Follow a signal", zh:"跟着信号走" }, rail:{ en:"Signals", zh:"信号" },
    intro:{ en:"Five stories, in the order you'd meet them: switch it on, see a picture, open an app, use the AI team, go wireless. Each one adds one new thing.", zh:"五个小故事，顺序就是你用电脑时碰到它们的先后：开机、看到画面、打开 App、用 AI 找照片、无线连接。每个故事都比上一个多讲一点。" },
    stories:{
      map:"roads",
      nodes:{ keyboard:[60, 170] },
      roads:[["antenna", "keyboard", "radio", { en:"Bluetooth, a few metres", zh:"蓝牙，几米之内" }, true]],
      list:[
        { id:"turnon",
          en:{ t:"Turn it on", goal:"Press the button and the Mac mini starts up, ending with a picture on the screen." },
          zh:{ t:"开机", goal:"从按下电源键，到屏幕上出现画面，中间发生了什么。" },
          steps:[
            { roads:[["powercord", "psu", "power"]], at:["psu"], form:"energy", now:{ en:"Power from a wall socket", zh:"插座来的电" },
              en:{ t:"Press the button", text:"You press the power button underneath. The cord is already feeding power from a wall socket into the power supply." },
              zh:{ t:"按下电源键", text:"你按一下底部的电源键。电源线一直插着，插座的电已经送到了里面的电源。" } },
            { roads:[["psu", "chip", "power"]], form:"energy", now:{ en:"Steady power", zh:"稳定的电" },
              en:{ t:"The brain wakes up", text:"The power supply turns the wall power into a steady low voltage and sends it to the M4. The brain switches on." },
              zh:{ t:"大脑通电", text:"电源把插座的电变成稳定的低压电，送给 M4。大脑开始工作。" } },
            { roads:[["ssd", "chip", "storage"]], at:["ssd"], form:"file", now:{ en:"macOS, the Mac's software", zh:"macOS，Mac 的系统" },
              en:{ t:"Load macOS", text:"The first job is to read macOS, the Mac's software, from the SSD into working memory, and start it running." },
              zh:{ t:"加载 macOS", text:"大脑做的第一件事，是把 Mac 的操作系统 macOS 从 SSD 读到工作内存里，然后运行它。" } },
            { roads:[["gpu", "monitor", "picture"]], form:"picture", now:{ en:"The first picture", zh:"第一帧画面" },
              en:{ t:"A picture appears", text:"The brain draws the desktop and sends it out a cable to your screen. The Mac mini is on." },
              zh:{ t:"出现画面", text:"大脑画好桌面，通过线送到你的屏幕。开机完成。" } }
          ] },
        { id:"picture",
          en:{ t:"A picture on the screen", goal:"See how what the Mac does turns into the picture you watch." },
          zh:{ t:"屏幕上的画面", goal:"电脑里的内容，是怎样变成你眼前的画面的。" },
          steps:[
            { at:["chip"], form:"think", now:{ en:"What to show", zh:"该显示什么" },
              en:{ t:"The brain decides", text:"Say you open a photo. The brain works out what the new screen should look like." },
              zh:{ t:"大脑决定显示什么", text:"比如你打开一张照片。大脑先算出屏幕接下来该显示什么。" } },
            { roads:[["memory", "gpu", "memory"]], at:["gpu"], form:"bits", now:{ en:"The picture, dot by dot", zh:"正在画的画面" },
              en:{ t:"The GPU draws it", text:"The GPU — the graphics part of the M4 — builds the picture in working memory, one dot at a time." },
              zh:{ t:"GPU 画出画面", text:"GPU 是 M4 里负责画面的部分。它在工作内存里，把画面上的每个点都算出来。" } },
            { roads:[["gpu", "monitor", "picture"]], form:"picture", now:{ en:"The finished picture", zh:"画好的画面" },
              en:{ t:"Out to the screen", text:"The finished picture streams out a cable to your monitor. Do it 60 times a second and moving things look smooth." },
              zh:{ t:"送到屏幕", text:"画好的画面通过线送到显示器。每秒送 60 次，动起来就很流畅。" } }
          ] },
        { id:"openapp",
          en:{ t:"Open an app", goal:"A click becomes a running app, from the SSD to the screen." },
          zh:{ t:"打开一个 App", goal:"从双击图标，到 App 出现在屏幕上，中间发生了什么。" },
          steps:[
            { at:["chip"], form:"bits", now:{ en:"A click", zh:"一次点击" },
              en:{ t:"You double-click", text:"You double-click an app with the mouse. The brain gets the click and looks for the app on the SSD." },
              zh:{ t:"双击图标", text:"你用鼠标双击一个 App。大脑收到后，去 SSD 上找到这个 App。" } },
            { roads:[["ssd", "chip", "storage"]], at:["ssd"], form:"file", now:{ en:"The app's files", zh:"App 的文件" },
              en:{ t:"Read from storage", text:"The brain reads the app from the SSD — the bookshelf — toward the working memory." },
              zh:{ t:"从 SSD 读取", text:"大脑把 App 从 SSD（书架）上读出来，送往工作内存。" } },
            { roads:[["memory", "chip", "memory"]], at:["memory"], form:"file", now:{ en:"The app, running", zh:"运行中的 App" },
              en:{ t:"Into working memory", text:"Now on the desk — the fast working memory — the app runs. The desk is fast, so it feels instant." },
              zh:{ t:"放进工作内存", text:"App 放到工作内存（书桌）上，就开始运行了。工作内存很快，所以 App 很快就能打开。" } },
            { roads:[["gpu", "monitor", "picture"]], form:"picture", now:{ en:"The app's window", zh:"App 的窗口" },
              en:{ t:"On the screen", text:"The brain draws the app's window and sends it to the screen. The app is open." },
              zh:{ t:"显示窗口", text:"大脑画好 App 的窗口，送到屏幕。App 打开了。" } }
          ] },
        { id:"findphoto",
          en:{ t:"Find a dog in your photos", goal:"Type \"dog\" in your photo library and see the AI team do its job." },
          zh:{ t:"用 AI 找照片", goal:"在相册里搜“狗”，看看神经网络引擎怎样找到照片。" },
          steps:[
            { roads:[["ssd", "chip", "storage"]], at:["ssd"], form:"file", now:{ en:"Your photos", zh:"你的照片" },
              en:{ t:"Read the photos", text:"Your photos live on the SSD. They travel to the chip to be looked at." },
              zh:{ t:"读取照片", text:"照片存在 SSD 里。要看照片的内容，先得把它们读到芯片这边。" } },
            { roads:[["chip", "neural", "inside"]], at:["neural"], form:"think", now:{ en:"The job: what's in this photo?", zh:"问题：照片里有什么？" },
              en:{ t:"Hand it to the AI team", text:"The chip passes the job to the Neural Engine, whose 16 cores are built for it." },
              zh:{ t:"交给神经网络引擎", text:"芯片把这项工作交给神经网络引擎。它有 16 个核心，就是为这类工作设计的。" } },
            { roads:[["chip", "cpu", "inside"]], at:["cpu"], form:"number", now:{ en:"The answer: these photos", zh:"结果：这几张照片" },
              en:{ t:"Back to the CPU", text:"The answer goes to the CPU, which runs the Photos app and picks out the matching pictures." },
              zh:{ t:"回到 CPU", text:"结果传回 CPU。照片 App 运行在 CPU 上，它把符合的照片挑出来。" } },
            { roads:[["gpu", "monitor", "picture"]], at:["gpu"], form:"picture", now:{ en:"The photos on screen", zh:"屏幕上的照片" },
              en:{ t:"On the screen", text:"The GPU draws the photos it found and sends them to your screen." },
              zh:{ t:"显示结果", text:"GPU 把找到的照片画出来，送到屏幕。" } }
          ] },
        { id:"wireless",
          en:{ t:"Go wireless", goal:"Reach the internet and a keyboard with no cables, through the antenna." },
          zh:{ t:"无线连接", goal:"不插网线，靠天线上网，再连上无线键盘。" },
          steps:[
            { roads:[["antenna", "internet", "radio"]], at:["antenna"], form:"radio", now:{ en:"Wi-Fi, through the air", zh:"Wi-Fi 无线连接" },
              en:{ t:"Reach the internet", text:"The antenna sends radio waves to your router, and through it to the whole internet. No cable." },
              zh:{ t:"连上互联网", text:"天线发出无线电波，连到你家的路由器，再由路由器接入互联网。全程不用插网线。" } },
            { roads:[["chip", "antenna", "data"]], at:["chip"], form:"bits", now:{ en:"A webpage, coming back", zh:"返回的网页" },
              en:{ t:"The page comes back", text:"The webpage you asked for comes back through the router, the antenna, and the short wire to the brain." },
              zh:{ t:"返回网页", text:"你要打开的网页从互联网传回来，经过路由器和天线，再顺着一根短线到达大脑。" } },
            { roads:[["antenna", "keyboard", "radio"]], at:["keyboard"], form:"radio", now:{ en:"Key presses, over Bluetooth", zh:"按键信号，通过蓝牙" },
              en:{ t:"A wireless keyboard", text:"The same antenna uses Bluetooth for a wireless keyboard: each key you press flies through the air to the Mac." },
              zh:{ t:"连上无线键盘", text:"同一个天线还能用蓝牙连接无线键盘。你每按一个键，信号就通过蓝牙传到 Mac。" } }
          ] }
      ]
    },
    nav:[{ to:"roads", label:{ en:"← Back to the roads", zh:"← 回到道路" }, ghost:true }, { to:"setup", label:{ en:"Next: set it up →", zh:"下一章：接线和开机 →" } }] },

  /* ---------- chapter 6: set it up and switch it on (a project in ordered steps) ---------- */
  { id:"setup", title:{ en:"Set it up and switch it on", zh:"接线和开机" }, rail:{ en:"Set up", zh:"动手" },
    intro:{ en:"Put it all together: lay out the pieces, plug in the cables, switch it on, and set up macOS. Six steps.", zh:"把它接好并用起来：准备配件、插线、开机、设置 macOS。一共六步。" },
    stepsHead:{ en:"6 steps · plug it in and switch it on", zh:"6 步 · 接线和开机" },
    steps:[
      { id:"need", parts:["powercord", "monitor", "keyboard", "mouse"], demo:"hookup", setup:{ ...HOOK_SETUP, lit:[] },
        idea:{ en:"The Mac mini is the computer; you add a screen, a keyboard, a mouse and power.", zh:"Mac mini 只是主机，屏幕、键盘和鼠标要另外准备。" },
        en:{ t:"What you need", lead:"The Mac mini is just the computer. To use it you lay out four things around it: its power cord (in the box), a screen with a cable, a keyboard and a mouse. Only the cord comes in the box; the rest you bring yourself.",
          watch:["The cord is included; the screen, keyboard and mouse are not.", "The screen needs an HDMI or USB-C cable.", "A keyboard and mouse can be USB, or wireless over Bluetooth."],
          need:["The Mac mini and its power cord (in the box)", "A screen (monitor or TV) with an HDMI or USB-C cable", "A keyboard", "A mouse or trackpad"],
          note:"Nothing is plugged in yet — the cables are drawn dashed. We connect them next." },
        zh:{ t:"要准备什么", lead:"Mac mini 只是主机。要用起来，还需要四样东西：电源线、屏幕和它的连接线、键盘、鼠标。盒子里只有电源线，其他都要自己准备。",
          watch:["盒子里有电源线，没有屏幕、键盘和鼠标。", "屏幕要用 HDMI 或 USB-C 线连。", "键盘和鼠标可以用 USB 的，也可以用蓝牙的。"],
          need:["Mac mini 和它的电源线（盒子里有）", "一块屏幕（显示器或电视），配 HDMI 或 USB-C 线", "一个键盘", "一个鼠标或触控板"],
          note:"现在还没有接线，所以线画成虚线。下一步开始接。" } },
      { id:"plugin", parts:["powercord", "monitor", "backports"], demo:"hookup", setup:{ ...HOOK_SETUP, lit:["power", "screen"] },
        idea:{ en:"Two cables first: power to the wall, and one cable to the screen.", zh:"先接两根线：电源线接插座，另一根线接屏幕。" },
        en:{ t:"Plug in power and the screen", lead:"Start with two cables. The power cord goes from the wall into the round socket on the back. The screen connects with one cable: HDMI into the HDMI socket, or USB-C into a Thunderbolt socket on the back.",
          watch:["Power: the round socket on the back, cord from the wall.", "Screen: one HDMI or USB-C cable, also on the back.", "Don't press the power button yet — plug in first."],
          note:"The back sockets are for the things that stay plugged in; the front USB-C sockets are for things you swap." },
        zh:{ t:"接上电源和屏幕", lead:"先接两根线。电源线一头插插座，一头插背面的圆形电源口。屏幕用一根线连接：HDMI 线插 HDMI 口，或者 USB-C 线插背面的雷雳口。",
          watch:["电源线：插背面的圆形电源口。", "屏幕：一根 HDMI 或 USB-C 线，也接在背面。", "线接好之前，先别按电源键。"],
          note:"长期插着的线接背面，经常插拔的设备接前面的 USB-C 口。" } },
      { id:"firstrun", parts:["powerbtn", "chip"], demo:"firstrun", setup:{ steps:FIRSTRUN },
        idea:{ en:"Press the button once; macOS walks you through the rest.", zh:"按一下电源键，然后跟着 macOS 的提示一步步设置。" },
        en:{ t:"Switch it on for the first time", lead:"Now press the power button underneath. The Mac wakes, reads macOS from the SSD, and the first time it starts it walks you through a short setup: your language, your Wi-Fi, and signing in. Step through it below.",
          watch:["Press the button once — you rarely touch it again.", "The Apple logo means macOS is loading.", "The setup asks a few questions, then drops you on the desktop."],
          note:"Later, the Mac sleeps and wakes on its own; you won't press the button each day." },
        zh:{ t:"第一次开机", lead:"现在按一下底部的电源键。Mac 启动后，会从 SSD 加载 macOS。第一次开机时，macOS 会带你完成简单的设置：选语言、连 Wi-Fi、登录账户。点“下一步”看看每个画面。",
          watch:["按一下就行，以后基本不用再按。", "出现苹果标志，就是 macOS 在加载。", "回答几个问题后，就进入桌面了。"],
          note:"以后 Mac 会自动休眠和唤醒，不用每天按电源键。" } },
      { id:"input", parts:["keyboard", "mouse", "antenna"], demo:"radio", setup:RADIO,
        idea:{ en:"Plug a keyboard and mouse in by USB, or pair them over Bluetooth.", zh:"键盘和鼠标可以用 USB 连接，也可以用蓝牙配对。" },
        en:{ t:"Add a keyboard and mouse", lead:"You need a keyboard to type and a mouse to point. Plug a USB one into a USB-C port (with a small adapter if needed), or, with no wire, pair a Bluetooth one through the antenna — the same antenna that does Wi-Fi. macOS asks you to do this during setup.",
          watch:["Wired: plug into a USB-C port.", "Wireless: switch the keyboard or mouse on and pair it over Bluetooth.", "Apple's own keyboard and mouse pair in one tap the first time."],
          note:"For the very first setup, a wired keyboard and mouse are simplest; you can switch to wireless after." },
        zh:{ t:"加上键盘和鼠标", lead:"打字用键盘，点选用鼠标。USB 的键盘和鼠标插到 USB-C 口，需要的话用一个转接头。如果不想接线，就用蓝牙配对，蓝牙和 Wi-Fi 用的是同一个天线。设置过程中，macOS 会提示你配对。",
          watch:["有线：插进 USB-C 口。", "无线：打开键盘或鼠标的开关，再用蓝牙配对。", "苹果的键盘和鼠标，第一次用线连一下就能配对。"],
          note:"第一次设置时，用有线键盘和鼠标最省事，之后可以换成无线的。" } },
      { id:"wiring", parts:["backports", "frontports", "powercord"], demo:"hookup", setup:{ ...HOOK_SETUP, pick:true },
        idea:{ en:"Every cable has one home: pick a group to see where it goes.", zh:"每根线都有固定的位置。选一组，看看它接在哪里。" },
        en:{ t:"Check every cable", lead:"With everything connected, here is the whole picture. Pick a group below to see which cable goes where. Power and the screen live on the back; a wired keyboard and mouse can use the front USB-C sockets, which are easy to reach.",
          watch:["Power: the round socket, back.", "Screen: HDMI or USB-C, back.", "Keyboard and mouse: USB-C (front is handy), or wireless."],
          note:"That's a complete, working setup. From here it's just turning it on." },
        zh:{ t:"检查所有的线", lead:"全部接好后就是这样。选一组，看看每根线接在哪里。电源和屏幕接背面，有线键盘和鼠标可以接前面的 USB-C 口，插拔方便。",
          watch:["电源线：背面的圆形电源口。", "屏幕：HDMI 或 USB-C，在背面。", "键盘和鼠标：前面的 USB-C 口，或者无线连接。"],
          note:"这样就全部接好了。" } },
      { id:"next", parts:[], demo:"next", setup:{ cards:[
        ["output", { en:"More screens", zh:"连接更多屏幕" }, { en:"up to three", zh:"最多三块" }],
        ["connect", { en:"Move your files in", zh:"迁移文件" }, { en:"from an old Mac", zh:"从旧电脑转过来" }],
        ["think", { en:"Make it yours", zh:"个性化设置" }, { en:"apps and settings", zh:"安装 App、调整设置" }]
      ] },
        idea:{ en:"It's a full computer now — here's where people go next.", zh:"现在它是一台完整的电脑了。下面是大多数人接着会做的事。" },
        en:{ t:"Where it goes next", lead:"Your Mac mini is set up and working. From here, most people add more screens, bring their files over from an old computer, and set it up the way they like.",
          watch:["More screens: the M4 can drive up to three at once.", "Move in: bring files and settings from an old Mac or a drive.", "Make it yours: install apps, change settings, arrange the desktop."] },
        zh:{ t:"接下来可以做什么", lead:"你的 Mac mini 已经可以用了。接下来，大多数人会连接更多屏幕，把旧电脑的文件转过来，再按自己的习惯做些设置。",
          watch:["更多屏幕：M4 最多能同时连接三块。", "迁移文件：把旧 Mac 或硬盘里的文件和设置转过来。", "个性化设置：安装 App、调整设置、整理桌面。"] } }
    ],
    nav:[{ to:"signal", label:{ en:"← Back to the signals", zh:"← 回到信号" }, ghost:true }, { to:"outside", label:{ en:"Start again from chapter 1", zh:"从第 1 章重新开始" }, ghost:true }] }
];
