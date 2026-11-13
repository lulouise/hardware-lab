/* ===================== Raspberry Pi Pico: the chapters and their pictures =====================
   Flat maps first (9 px per mm, the board centred), then the chapters. */
const MS = 9, MX0 = 380 - 10.5 * MS, MY0 = 36;                    // map: 9 px per mm, board centred
const mx = mm => MX0 + mm * MS, my = mm => MY0 + mm * MS;
function mapRect(id, x, y, w, h, txt){
  const g = PARTS[id].g, X = mx(x - w / 2), Y = my(y - h / 2);
  return hit(id, `<rect x="${X}" y="${Y}" width="${w * MS}" height="${h * MS}" rx="2.5" class="chip" style="fill:var(--${g}-t);stroke:var(--${g})"/>${txt ? `<text class="chiptxt" x="${X + w * MS / 2}" y="${Y + h * MS / 2 + 4}" text-anchor="middle" style="fill:var(--${g})">${txt}</text>` : ""}<rect class="hl" x="${X - 3}" y="${Y - 3}" width="${w * MS + 6}" height="${h * MS + 6}" rx="4"/>`);
}
function mapBoard(pinsByJob){
  const o = [];
  o.push(hit("board", `${rr(mx(0), my(0), BOARD.w * MS, BOARD.h * MS, 8, "pcb")}<rect class="hl" x="${mx(0) - 3}" y="${my(0) - 3}" width="${BOARD.w * MS + 6}" height="${BOARD.h * MS + 6}" rx="10"/>`));
  HOLES.forEach(([x, y]) => o.push(`<circle cx="${mx(x)}" cy="${my(y)}" r="${HOLE_R * MS}" style="fill:var(--surface);stroke:var(--pad);stroke-width:1.5"/>`));
  [LEFT, RIGHT].forEach((names, side) => names.forEach((n, i) => {
    const id = pinsByJob ? pinGroup(n) : "pins", g = PARTS[id].g;
    o.push(`<g class="hit" data-part="${id}" data-g="${g}" style="${col(g)}"><circle cx="${mx(PIN_X[side])}" cy="${my(pinY(i))}" r="${pinsByJob ? 7 : 6}" style="fill:${pinsByJob ? `var(--${g})` : "var(--pad)"};stroke:var(--pcb-edge);stroke-width:1"/><circle cx="${mx(PIN_X[side])}" cy="${my(pinY(i))}" r="2.6" style="fill:var(--pcb-edge)"/></g>`);
  }));
  return o.join("");
}
/* the parts on the board (shared by the "where the parts sit" map and the stations' board figure) */
function partShapes(){
  const o = [];
  HELPERS.forEach(([x, y, w, h]) => o.push(hit("helpers", `<rect class="passive" x="${mx(x - w / 2)}" y="${my(y - h / 2)}" width="${w * MS}" height="${h * MS}" rx="1" style="fill:var(--power-t);stroke:var(--power)"/>`)));
  const L = LAYOUT;
  o.push(mapRect("usb", ...L.usb.slice(0, 4), "USB"));
  o.push(mapRect("led", ...L.led.slice(0, 4), ""));
  o.push(mapRect("bootsel", ...L.bootsel.slice(0, 4), ""));
  o.push(mapRect("flash", ...L.flash.slice(0, 4), ""));
  o.push(mapRect("brain", ...L.brain.slice(0, 4), "RP2040"));
  o.push(mapRect("crystal", ...L.crystal.slice(0, 4), "12.0"));
  o.push(hit("regulator", `${["regulator", "coil"].map(k => { const [x, y, w, h] = L[k]; return `<rect x="${mx(x - w / 2)}" y="${my(y - h / 2)}" width="${w * MS}" height="${h * MS}" rx="2.5" class="chip" style="fill:var(--power-t);stroke:var(--power)"/>`; }).join("")}<rect class="hl" x="${mx(12) - 3}" y="${my(9.2) - 3}" width="${6.1 * MS + 6}" height="${3 * MS + 6}" rx="4"/>`));
  o.push(mapRect("diode", ...L.diode.slice(0, 4), ""));
  return o.join("");
}
function mapParts(){
  const o = [mapBoard(false), partShapes()];
  const nar = NARROW(), LX = nar ? 268 : 200, RX = nar ? 492 : 560;    // phones: labels hug the board so the text stays readable
  const lab = [
    label("brain", mx(7), my(25.7), LX, my(25.7), "l"), label("flash", mx(5.6), my(18.9), LX, my(18.9), "l"),
    label("bootsel", mx(5.4), my(11.6), LX, my(11.6), "l"), label("led", mx(4), my(4.8), LX, my(4.8), "l"),
    label("crystal", mx(6.5), my(34.3), LX, my(34.3), "l"), label("board", mx(0), my(42), LX, my(42), "l"),
    label("usb", mx(14.4), my(0.4), RX, my(-0.2), "r"), label("diode", mx(17.45), my(6.4), RX, my(5.6), "r"),
    label("regulator", mx(17.85), my(10.7), RX, my(11.2), "r"), label("helpers", mx(17.1), my(21), RX, my(20), "r"),
    label("pins", mx(19.39), my(pinY(12)), RX, my(pinY(12) + 1), "r")
  ];
  return o.join("") + lab.join("");
}
function mapPins(){
  const o = [mapBoard(true)];
  o.push(`<text x="${mx(10.5)}" y="${my(25.5)}" text-anchor="middle" class="cap" style="font-size:12px">${esc(tz("FRONT VIEW", "正面"))}</text>`);
  [LEFT, RIGHT].forEach((names, side) => names.forEach((n, i) => {
    const id = pinGroup(n), g = PARTS[id].g, num = side ? 40 - i : i + 1;
    const x = side ? mx(BOARD.w) + 12 : mx(0) - 12, y = my(pinY(i)) + 4.5;
    o.push(`<g class="hit" data-part="${id}" data-g="${g}" style="${col(g)}"><text x="${x}" y="${y}" text-anchor="${side ? "start" : "end"}" class="pinname" style="fill:var(--${g})">${side ? `${n} <tspan style="fill:var(--muted)">${num}</tspan>` : `<tspan style="fill:var(--muted)">${num}</tspan> ${n}`}</text></g>`);
  }));
  return o.join("");
}

/* chapter 3: the board beside each station, its pins coloured by job, the station's parts lit up */
COURSE.where = () => ({ viewBox:"272 16 216 492", svg:mapBoard(true) + partShapes() });

const tip = (en, zh) => ({ en, zh });
const TIPS_LIFT = [tip("Slide <b>Spread the parts</b> to move each piece off the board.", "拖动<b>展开零件</b>，零件会一个个离开板子，看得更清楚。"), tip("Start with the violet <b>Brain</b>: every other part works for it.", "先点紫色的<b>大脑</b>，其他零件都在为它服务。")];
COURSE.chapters = [
  { id:"outside", title:{ en:"Meet the board", zh:"认识这块板" }, rail:{ en:"Board", zh:"板子" },
    thumb:`<rect x="22" y="3" width="20" height="38" rx="2" style="fill:var(--pcb)"/>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="25" cy="${8 + i * 6}" r="1.4" style="fill:var(--pad)"/><circle cx="39" cy="${8 + i * 6}" r="1.4" style="fill:var(--pad)"/>`).join("")}<rect x="28" y="18" width="8" height="8" rx="1" style="fill:#1b1c1f"/>`,
    intro:{ en:"Turn the board over and find its parts and its 40 legs. Then open the big picture: what a Pico is, and what it works with.", zh:"先把板子翻过来，找找它的零件和 40 条腿。再看大背景：Pico 是什么，要和哪些东西配合。" },
    views:[
      { id:"3d", tab:{ en:"3D view", zh:"3D 视图" }, model:"outside", presets:["angle", "front", "back", "top", "bottom"],
        idea:{ en:"One small board: the parts sit on top, and 40 legs along the edges connect it to the world.", zh:"一块小电路板：零件在正面，长边上的 40 条腿负责和外界连接。" },
        tips:[tip("Press <b>Back</b> to flip the board and find the pin names.", "点<b>背面</b>把板子翻过来，就能看到针脚的名字。"), tip("Find the <b>cable door</b>, then the <b>start-over button</b> below the little light.", "先找到<b>插线口</b>，再找小灯下面的<b>启动键</b>。")] },
      { id:"big", tab:{ en:"Big picture", zh:"大背景" }, parts:[], model:"scene", presets:[],
        idea:{ en:"A Pico is a small board, not a whole gadget: one chip (the brain) plus what it needs. You add the senses and the actions.", zh:"Pico 不是一台完整的设备，而是一块小电路板：一颗芯片（大脑），加上它需要的配件。感知和动作，由你来加。" },
        card:{ kicker:{ en:"Before we start", zh:"开始之前" }, title:{ en:"What is a Pico?", zh:"Pico 是什么？" },
          lead:{ en:"A small board built around one chip. The black square in the middle, the RP2040, is the chip: the brain. The rest of the board gives it what it needs: storage, a clock, power parts and 40 legs (pins) for wires.", zh:"Pico 是一块小电路板，核心是一颗芯片。中间那个黑色方块叫 RP2040，它就是芯片，也就是大脑。板上其他东西都在为它服务：存储、时钟、电源零件，还有用来接线的 40 条腿（针脚）。" },
          blocks:[
            { h:{ en:"What it's for", zh:"用来做什么" }, p:{ en:"It's the brain you build into a project: a robot, a light that reacts, a box that measures something. You write a program on a computer and send it in through the cable.", zh:"把它装进你的作品，它就是作品的大脑。作品可以是机器人、一盏会对周围做出反应的灯，或者一个能测量东西的小盒子。程序在电脑上写好，再通过线缆传进去。" } },
            { h:{ en:"What it can't do alone", zh:"它自己做不到什么" }, p:{ en:"It has no screen, no speaker, no battery and no case, and almost no senses (one button, and a thermometer inside the chip). You add what your project needs, with wires to its pins.", zh:"Pico 自己没有屏幕、喇叭、电池，也没有外壳，几乎感觉不到什么（只有一个按键，外加芯片里的一个温度计）。作品需要什么，就用导线接到它的针脚上。" } },
            { h:{ en:"In a robot", zh:"在机器人里" }, p:{ en:"Sensors tell it what's around, the Pico decides, motors and lights act. This course follows that path and ends with a small robot part in chapter 6.", zh:"传感器告诉它周围是什么情况，Pico 拿主意，电机和灯负责动手。这门课就按这个思路走，到第 6 章会做一个小小的机器人部件。" } },
            { h:{ en:"The Pico family", zh:"Pico 家族" }, p:{ en:"This course is about the plain Pico. The Pico W adds Wi-Fi and Bluetooth; the Pico 2 has a faster chip. They look almost the same.", zh:"这门课讲的是普通版 Pico。Pico W 多了 Wi-Fi 和蓝牙，Pico 2 的芯片更快，几款长得几乎一样。" } }
          ] } },
    ],
    nav:[{ to:"inside", label:{ en:"Next: what sits on it →", zh:"下一章：板上有什么 →" } }] },
  { id:"inside", title:{ en:"What sits on it", zh:"板上有什么" }, rail:{ en:"On it", zh:"板上" },
    intro:{ en:"Spread the parts out in the 3D view, then see where each part sits and what each pin does.", zh:"先在 3D 视图里把零件展开，再看看每个零件在哪儿、每个针脚管什么。" },
    views:[
      { id:"3d", tab:{ en:"3D view", zh:"3D 视图" }, model:"layers", presets:["angle", "front", "left"],
        idea:{ en:"Each part is a separate piece, soldered onto metal pads on the board.", zh:"每个零件都是单独的一块，焊在板上的金属焊盘上。" }, tips:TIPS_LIFT },
      { id:"flat", tab:{ en:"Where the parts sit", zh:"零件在哪儿" }, svg:{ viewBox:() => NARROW() ? "130 0 510 510" : "20 0 730 510", draw:mapParts },
        idea:{ en:"The brain sits in the middle; the power parts sit next to the cable door.", zh:"大脑在正中间，电源零件挨着插线口。" }, tips:TIPS_LIFT },
      { id:"pins", tab:{ en:"What each pin does", zh:"每个针脚管什么" }, svg:{ viewBox:"150 10 460 500", draw:mapPins }, parts:["gpPins", "adcPins", "pwrPins", "gndPins"],
        idea:{ en:"Each of the 40 pins has one job, and its name is printed next to it on the back.", zh:"40 个针脚各管一件事，名字就印在背面，紧挨着它。" },
        tips:[tip("Tap a colour above to see one kind of pin.", "点上面的颜色，只看某一种针脚。"), tip("Count the grey <b>ground</b> pins: there are 8.", "数一数灰色的<b>地线</b>针脚，一共有 8 个。")] }
    ],
    nav:[{ to:"outside", label:{ en:"← Back to the board", zh:"← 回到板子" }, ghost:true }, { to:"parts", label:{ en:"Next: what each part does →", zh:"下一章：每个部件的作用 →" } }] },
  /* ---------- chapter 3: one station per part ---------- */
  { id:"parts", title:{ en:"What each part does", zh:"每个部件的作用" }, rail:{ en:"Parts", zh:"部件" },
    intro:{ en:"Ten small stations, one for each part. Play with each one to see its job.", zh:"十个小站，一个部件一站。动手玩一玩，看看每个部件是干什么的。" },
    stations:[
      { id:"workers", g:"think", parts:["brain"], demo:"workers",
        setup:{ cores:2, chip:{ en:"THE RP2040 CHIP", zh:"RP2040 芯片里面" }, jobs:[["output", { en:"blink", zh:"闪灯" }], ["sense", { en:"button", zh:"按键" }], ["sense", { en:"sensor", zh:"传感器" }], ["connect", { en:"USB", zh:"USB" }]] },
        idea:{ en:"Two cores means the brain can do two jobs at the same moment.", zh:"有两个核心，大脑就能同时干两件事。" },
        en:{ t:"The brain's two cores", lead:"The brain is the RP2040 chip, the black square in the middle of the board. Inside it are two cores: workers that each do one job at a time. In a robot the jobs keep arriving: blink the light, read the button, read a sensor, talk to the computer.", watch:["Switch to 1 core: the line grows, because jobs arrive faster than one core can finish them.", "Switch back to 2 cores: the line stays short."], general:"Not always: many small boards have just one core. The idea of jobs taking turns is the same on all of them." },
        zh:{ t:"大脑的两个核心", lead:"板子中间那个黑色方块就是大脑，也就是 RP2040 芯片。它里面有两个“工人”，叫作核心，每个工人一次只能干一件事。机器人运转起来，活儿会一件接一件地来：闪灯、看按键、读传感器、跟电脑通信。", watch:["切成 1 个核心：活儿来得比一个核心干得快，队伍越排越长。", "切回 2 个核心：队伍一直很短。"], general:"不一定。很多小板子只有一个核心，不过“活儿排队、轮流干”的道理都一样。" } },
      { id:"memory", g:"think", parts:["flash", "brain"], demo:"memory",
        setup:{ shelf:{ label:{ en:"STORAGE CHIP · 2 MB", zh:"存储芯片 · 2 MB" }, sub:{ en:"like a bookshelf: keeps everything", zh:"像书架，东西一直都在" }, items:[{ en:"Your program", zh:"你的程序" }, { en:"Things it saves", zh:"程序存下的东西" }] },
          desk:{ label:{ en:"WORKING MEMORY · 264 kB", zh:"工作内存 · 264 kB" }, sub:{ en:"like a desk: in use right now", zh:"像书桌，放着手头的活儿" }, items:[{ en:"Light: on or off?", zh:"小灯：开还是关？" }, { en:"Latest sensor reading", zh:"最新的传感器读数" }, { en:"Blinks counted so far", zh:"已经闪了几次" }] },
          copy:{ en:"Program (from storage)", zh:"从存储芯片读来的程序" } },
        idea:{ en:"The storage chip keeps everything; the working memory forgets when the power goes off.", zh:"存储芯片里的东西一直都在；工作内存一断电就清空。" },
        en:{ t:"Storage chip and working memory", lead:"Two places hold information. The storage chip, the small chip above the brain, keeps your program even with no power, like a bookshelf: 2 MB, room for about 2 million letters. The working memory, inside the brain chip, is fast space for what it's doing right now, like a desk: 264 kB, about 264 thousand letters.", watch:["Cut the power: the working memory (the desk) is wiped, the storage chip (the bookshelf) keeps everything.", "Turn it back on: the brain reads its program from the storage chip and starts again."], general:"Yes: almost every board has these two kinds of memory. Only the sizes differ from board to board." },
        zh:{ t:"存储芯片和工作内存", lead:"信息存在两个地方。存储芯片在大脑左上方，断了电也能留住你的程序，有点像书架：2 MB，大约能放 200 万个字母。工作内存在大脑芯片里面，放的是手头正在做的事，速度很快，有点像书桌：264 kB，大约能放 26.4 万个字母。", watch:["断电：工作内存（书桌）一下子清空，存储芯片（书架）里的东西都还在。", "再开机：大脑从存储芯片里读出程序，从头开始。"], general:"是的。几乎每块板子都有这两种内存，只是容量不一样。" } },
      { id:"beat", g:"think", parts:["crystal"], demo:"beat",
        setup:{ crystal:12, brain:133, labels:{ crystal:{ en:"CLOCK CRYSTAL · 12 MILLION BEATS A SECOND", zh:"时钟晶振 · 每秒 1200 万拍" }, brain:{ en:"BRAIN (RP2040) · UP TO 133 MILLION STEPS A SECOND", zh:"大脑芯片（RP2040）· 每秒最多 1.33 亿步" }, chip:{ en:"RP2040", zh:"RP2040" } } },
        idea:{ en:"The clock crystal's steady beat keeps every step of the brain in time.", zh:"时钟晶振打着稳定的节拍，大脑的每一步都跟着它走。" },
        en:{ t:"The clock crystal keeps the beat", lead:"The clock is the small silver box below the brain, marked 12.0. Inside is a thin slice of quartz (a kind of crystal stone) that shakes 12 million times a second when electricity flows. The brain takes that steady beat and speeds it up to its own pace: up to 133 million small steps a second.", watch:["The top line is the crystal: each up-and-down is one beat.", "The bottom line is the brain: count its steps in one beat, about 11.", "This is slowed down millions of times, so your eyes can follow it."], general:"Most boards keep time with a crystal like this. The speeds differ from board to board." },
        zh:{ t:"时钟晶振：打拍子", lead:"时钟就是大脑下面那个印着 12.0 的银色小盒子。里面有一片很薄的石英（一种晶体石头），通电后每秒振动 1200 万次。大脑拿这个稳定的节拍，再把它加快成自己的速度，每秒最多走 1.33 亿小步。", watch:["上面那条线是晶振，每上下一次就是一拍。", "下面那条线是大脑，数数一拍里它走了几步：大约 11 步。", "这里放慢了几百万倍，眼睛才跟得上。"], general:"大多数板子都靠这样一颗晶振来计时，只是快慢不同。" } },
      { id:"boot", g:"sense", parts:["bootsel"], demo:"boot",
        idea:{ en:"Holding the button while you plug in puts the Pico in new-program mode.", zh:"插线的时候按住启动键，Pico 就会进入新程序模式。" },
        en:{ t:"The start-over button (BOOTSEL)", lead:"The only button on the board: the small white one below the little light, labelled BOOTSEL. It only counts at the moment the Pico gets power. Held down, the Pico shows up on your computer as a drive, ready for a new program. Not held, it simply runs the program it already has.", watch:["Plug in without holding: your program runs and the light blinks.", "Unplug, hold the button, plug in again: a new drive appears.", "Drop a program file on the drive: the Pico restarts with the new program."], general:"This button is the Pico's own way to load a new program. Other boards each have their own way." },
        zh:{ t:"启动键（BOOTSEL）", lead:"板上唯一的按键，就是小灯下面那个白色小按键，上面印着 BOOTSEL。这个按键只在 Pico 刚通电的那一瞬间起作用：按住它，Pico 在电脑上会变成一个磁盘，等你放新程序进去；不按，它就直接运行原来的程序。", watch:["不按启动键，直接插线：原来的程序开始运行，小灯闪起来。", "拔掉线，按住启动键再插上：电脑上多了一个新磁盘。", "把程序文件拖到这个磁盘上：Pico 自动重启，换成新程序。"], general:"这是 Pico 自己换程序的方式，别的板子各有各的办法。" } },
      { id:"reading", g:"sense", parts:["adcPins"], demo:"reading", setup:{ vmax:3.3, max:4095, pin:"GP26", what:{ en:"A knob", zh:"一个旋钮" } },
        idea:{ en:"A measuring pin turns how much voltage into a number.", zh:"测量针脚能把“电压有多大”变成一个数字。" },
        en:{ t:"Measuring pins: more than on or off", lead:"Three of the 40 legs, GP26 to GP28 on the right edge, can measure. Most pins only know on or off; these turn a voltage between 0 and 3.3 volts into a number from 0 to 4095. Volts measure how hard electricity pushes. A knob or a light sensor gives a voltage like this.", watch:["Turn the knob: the number follows smoothly.", "Halfway gives about 2048, half of 4095.", "Never put more than 3.3 volts on these pins."], general:"Most boards have measuring pins, but the scale differs: the Pico counts 0 to 4095 up to 3.3 volts; the Arduino Uno, for example, counts 0 to 1023 up to 5 volts." },
        zh:{ t:"测量针脚：不只是开和关", lead:"40 条腿里有 3 条能测量，就是右边的 GP26 到 GP28。普通针脚只分得清开和关，这 3 个针脚却能把 0 到 3.3 伏之间的电压换算成 0 到 4095 的数字。“伏”说的是电推得有多用力。旋钮、光线传感器给出的就是这种电压。", watch:["转动旋钮：数字跟着平滑变化。", "转到一半，大约是 2048，正好是 4095 的一半。", "这几个针脚千万别接超过 3.3 伏的电压。"], general:"大多数板子都有测量针脚，但刻度不一样：Pico 数到 4095，最高 3.3 伏；Arduino Uno 只数到 1023，最高 5 伏。" } },
      { id:"thermo", g:"sense", parts:["brain"], demo:"thermo",
        idea:{ en:"The brain can feel its own temperature.", zh:"大脑能感觉到自己的温度。" },
        en:{ t:"The thermometer inside the brain", lead:"Inside the brain chip (the RP2040) there is a small thermometer. The brain reads it with the same measuring part it uses for the measuring pins. It tells you how warm the chip is, which is not quite the same as the room.", watch:["Make the room warmer: the reading goes up.", "Give the brain hard work: the chip warms up and reads warmer than the room.", "This drawing shows warmer or cooler, not degrees."], general:"Many chips have a thermometer inside, but not every board lets your program read it." },
        zh:{ t:"大脑里的温度计", lead:"大脑芯片（RP2040）里藏着一个小温度计。大脑读它的方法，和读测量针脚一样。它量的是芯片自己有多热，和房间的温度不完全一样。", watch:["把房间调热：读数跟着升高。", "让大脑拼命干活：芯片发热，读数比房间还高。", "这张图只表示热一点还是凉一点，不显示具体度数。"], general:"很多芯片里都有温度计，但不是每块板子都让程序读得到。" } },
      { id:"blink", g:"output", parts:["led"], demo:"blink", setup:{ pin:"GP25" },
        idea:{ en:"Writing 1 or 0 to pin 25 switches the light on or off.", zh:"往 25 号针脚写 1 就开灯，写 0 就关灯。" },
        en:{ t:"The little light: blink", lead:"The little light is the LED next to the cable door. It is wired to the brain's pin 25. Your program writes 1 to switch it on and 0 to switch it off. Doing that again and again makes it blink: it's usually the first program anyone writes.", watch:["Each step in the line below is the program writing a 1 or a 0.", "Faster blinking just means switching more often."], general:"Most boards have a little light like this for a first program. Which pin it's on differs: on the Pico it's pin 25." },
        zh:{ t:"小灯：闪烁", lead:"小灯就是插线口旁边那个 LED，接在大脑的 25 号针脚上。程序写 1，灯就亮；写 0，灯就灭。一遍遍重复，灯就闪起来了。几乎每个人写的第一个程序都是它。", watch:["下面那条线每跳一下，就是程序写了一次 1 或 0。", "闪得快，只是开关得更勤。"], general:"大多数板子上都有这样一盏小灯，专门用来写第一个程序。接在哪个针脚上各不相同，Pico 是 25 号。" } },
      { id:"converter", g:"power", parts:["regulator"], demo:"regulator",
        setup:{ outLabel:{ en:"STEADY OUTPUT", zh:"输出 · 稳定的电" }, min:1.8, max:5.5, out:3.3, presets:[[5, { en:"USB cable", zh:"USB 线" }], [4.5, { en:"3 AA batteries", zh:"3 节 AA 电池" }]] },
        idea:{ en:"Any power from 1.8 to 5.5 volts comes out as a steady 3.3 volts.", zh:"进来的电只要在 1.8 到 5.5 伏之间，出去的都是稳稳的 3.3 伏。" },
        en:{ t:"Power converter: always 3.3 volts", lead:"The power converter is the small chip and coil at the top right of the board. The brain and its pins need a steady 3.3 volts. The converter takes whatever comes in, from 1.8 to 5.5 volts, and turns it into exactly that. It can lower the voltage or raise it.", watch:["Try the USB cable (5 volts): the converter lowers it to 3.3.", "Slide below 3.3: now it raises it, and 3.3 still comes out.", "Go past the green band: below 1.8 the Pico switches off; above 5.5 is more than the maker allows."], general:"Every board needs steady power, but not always 3.3 volts: the Arduino Uno, for example, works at 5 volts. The 1.8 to 5.5 volt range is the Pico's own." },
        zh:{ t:"电源转换器：永远 3.3 伏", lead:"电源转换器在板子右上方，是一颗小芯片加一个线圈。大脑和针脚都要稳定的 3.3 伏。不管进来的电是 1.8 伏还是 5.5 伏，转换器都能把它变成刚好 3.3 伏：电压高了往下降，低了往上升。", watch:["试试 USB 线（5 伏）：转换器把它降到 3.3 伏。", "滑到 3.3 伏以下：这回它把电压升上去，出来的还是 3.3 伏。", "滑出绿色区域：低于 1.8 伏，Pico 直接关机；高于 5.5 伏，就超出厂家允许的范围了。"], general:"每块板子都需要稳定的电，但不一定是 3.3 伏，比如 Arduino Uno 用的是 5 伏。1.8 到 5.5 伏这个范围是 Pico 自己的。" } },
      { id:"powerin", g:"power", parts:["usb", "diode"], demo:"powerpath",
        idea:{ en:"Power comes from the cable or a battery; the one-way valve keeps it flowing the right way.", zh:"电可以来自线缆，也可以来自电池；单向阀保证它只往该去的方向流。" },
        en:{ t:"Cable door and one-way valve", lead:"The cable door is the micro-USB port on the top edge; the one-way valve is a small black part at the top right. The cable brings in 5 volts of power and, on two more wires, your programs. You can also power the Pico from a battery on its VSYS pin. The valve lets cable power in, and stops battery power from pushing back out into the cable.", watch:["Cable plugged in: power flows through the valve to the converter, and programs go to the brain.", "Battery only: the power comes from the battery, and the valve stops it flowing back into the cable."], general:"Most boards take power from a cable or a battery. How they keep the two apart differs: on the Pico it's this valve and the VSYS pin." },
        zh:{ t:"插线口和单向阀", lead:"插线口就是顶边的 micro-USB 接口，单向阀是右上角一个黑色小零件。插上线，5 伏的电从这里进来，你的程序也走另外两根线进来。Pico 也可以用电池供电，电池接在 VSYS 针脚上。单向阀让线缆的电进来，同时挡住电池的电，不让它倒流回线缆。", watch:["插着线：电经过单向阀流到转换器，程序传给大脑。", "只接电池：电从电池来，单向阀挡着，不让它倒流回线缆。"], general:"大多数板子都能用线缆或电池供电，只是让两路电互不干扰的办法不一样。Pico 用的就是这个单向阀和 VSYS 针脚。" } },
      { id:"pin", g:"connect", parts:["gpPins"], demo:"pin",
        setup:{ v:3.3, gnd:"GND", power:"3V3", chip:"RP2040", pins:Array.from({ length:23 }, (_, i) => "GP" + i) },
        idea:{ en:"Electricity goes out and back in a loop; your program decides if a pin sends or listens.", zh:"电得走一圈才能回来；针脚是往外送电还是往里收信号，由程序说了算。" },
        en:{ t:"Signal pins: your program decides", lead:"23 of the 40 legs, GP0 to GP22, are signal pins, and your program decides whether each one sends or listens. Electricity always travels in a loop, out and back, so each thing you connect uses two pins. In a robot, a pin might switch on a headlight (send) or feel a bumper switch (listen).", watch:["Send: set the pin to 1. Current flows out of the pin, through a resistor and the light, and back into a ground pin (GND). The resistor holds the electricity back a little, so the light isn't damaged.", "Listen: hold the button. It joins the 3.3-volt pin (3V3) to the signal pin, so the pin gets 3.3 volts and the program reads 1.", "Let go: the brain holds the pin at 0 on its own (your program switches this on)."], general:"Yes: every board has signal pins that send or listen. The voltage differs: on a 5-volt board like the Arduino Uno, a 1 is 5 volts. Check before connecting two boards together." },
        zh:{ t:"信号针脚：由程序说了算", lead:"40 条腿里有 23 条是信号针脚，从 GP0 到 GP22。每一条是往外送电还是往里收信号，由程序说了算。电要走一圈才能回来，所以接一样东西要用到两个针脚。放到机器人上，一个针脚可以打开车灯（送），也可以感知碰撞开关（收）。", watch:["送：把针脚设成 1，电从针脚流出去，经过电阻和小灯，再流回地线针脚（GND）。电阻能把电挡住一点，灯就不会烧坏。", "收：按住按键，3.3 伏针脚（3V3）和信号针脚就接通了，针脚有了 3.3 伏，程序读到 1。", "松开：大脑自己把针脚保持在 0（程序里打开这个功能就行）。"], general:"是的，每块板子都有能送能收的信号针脚，只是电压不同：在 Arduino Uno 这种 5 伏的板子上，1 代表 5 伏。两块板子连在一起之前，先确认电压。" } }
    ],
    nav:[{ to:"inside", label:{ en:"← Back to what sits on it", zh:"← 回到板上有什么" }, ghost:true }, { to:"roads", label:{ en:"Next: how they connect →", zh:"下一章：它们怎么连起来 →" } }] },

  /* ---------- chapter 4: the roads between the parts ---------- */
  { id:"roads", title:{ en:"How they connect", zh:"它们怎么连起来" }, rail:{ en:"Roads", zh:"道路" },
    intro:{ en:"Every part is joined to the others by roads: energy roads and information wires. Almost all of them lead to the brain.", zh:"部件和部件之间靠“路”相连，有的路送能量，有的路传信息。几乎每条路都通向大脑。" },
    roads:{
      viewBox:"0 0 920 590", hub:"brain",
      families:[
        { id:"energy", line:"power", en:["Energy", "keeps every part alive"], zh:["能量", "让每个部件都有电"] },
        { id:"info", line:"gpio", en:["Information wires", "carry 1s, 0s and voltages"], zh:["信息线", "传 1、0 和电压"] }
      ],
      kinds:{
        power:{ fam:"energy", line:"power", en:["Power line", "Carries energy, not information: 5 volts from the cable, then a steady 3.3 volts for everyone."], zh:["电源线", "送的是能量，不是信息：先是线缆进来的 5 伏，再变成大家都用的稳定 3.3 伏。"],
          why:{ en:"Every part needs energy, so this is the road that reaches almost every part.", zh:"每个部件都离不开能量，所以几乎每个部件都连着这种路。" } },
        gpio:{ fam:"info", line:"gpio", en:["Single wire", "One wire, two states: 1 (3.3 volts) or 0 (0 volts). Perfect for a light, a button or a yes-or-no question."], zh:["单根信号线", "一根线，两种状态：1（3.3 伏）或 0（0 伏）。最适合小灯、按键这种“是不是”的问题。"],
          why:{ en:"A light is only on or off and a button only pressed or not, so one wire is enough.", zh:"小灯只有开和关，按键只有按下和松开，一根线就够用了。" } },
        qspi:{ fam:"info", line:"spi", en:["Bookshelf lane (QSPI)", "Four data wires side by side carry your program from the storage chip to the brain, fast."], zh:["书架快车道（QSPI）", "四根数据线并排，把程序从存储芯片飞快地送到大脑。"],
          why:{ en:"Your program is big and the brain needs it quickly, so it gets a wide road: 4 wires instead of 1.", zh:"程序很大，大脑又急着要，所以给它修了一条宽路：4 根线并排，而不是 1 根。" } },
        clock:{ fam:"info", line:"i2s", en:["Beat wire", "Not information: the crystal's steady beat, 12 million times a second."], zh:["节拍线", "传的不是信息，是晶振稳定的节拍，每秒 1200 万下。"],
          why:{ en:"Every step of the brain must happen on time, so the beat gets its own wire.", zh:"大脑的每一步都得准时，所以节拍要单独占一根线。" } },
        analog:{ fam:"info", line:"analog", en:["Smooth voltage (analog)", "Not just 1 or 0: any voltage from 0 to 3.3 volts, which the brain measures as a number."], zh:["连续电压（模拟）", "不只有 1 和 0，0 到 3.3 伏之间什么电压都行，大脑把它量成一个数字。"],
          why:{ en:"A knob or a light sensor says how much, not yes or no, so these roads carry a voltage the brain can measure.", zh:"旋钮、光线传感器说的是“有多少”，不是“有没有”，所以这些路传的是大脑能测量的电压。" } },
        usb:{ fam:"info", line:"usb", en:["USB data", "Two wires that carry programs in and messages out, straight to the brain."], zh:["USB 数据线", "两根线，程序从这里进来，信息从这里出去，直接连着大脑。"],
          why:{ en:"USB is the standard plug for computers, so it's how programs get in.", zh:"USB 是电脑通用的接口，程序自然就从这里进来。" } },
        swd:{ fam:"info", line:"i2c", en:["Debug wires (SWD)", "Two signal wires (and a ground) that let a tool pause the brain and look inside."], zh:["调试线（SWD）", "两根信号线（外加一根地线），接上工具就能让大脑暂停、看看里面。"],
          why:{ en:"Mistakes are easier to find when you can stop the brain and look, so it has a door just for that.", zh:"能让大脑停下来看一眼，找错误就容易多了，所以专门给它留了一扇门。" } }
      },
      nodes:{ gpPins:[460, 60], debug:[700, 60], bootsel:[103, 250], adcPins:[103, 360], flash:[285, 190], brain:[460, 300], crystal:[600, 410], led:[810, 290],
        usb:[110, 500], diode:[285, 500], regulator:[460, 500], pwrPins:[810, 500], battery:[635, 555] },
      zones:[
        ["connect", 18, 28, 884, 66, { en:"Pins and pads", zh:"针脚和焊盘" }, { en:"reach the world outside", zh:"通往外面的世界" }],
        ["sense", 18, 128, 170, 316, { en:"Sense", zh:"感知" }, { en:"information in", zh:"信息进来" }],
        ["output", 718, 128, 184, 316, { en:"Output", zh:"输出" }, { en:"actions out", zh:"动作出去" }],
        ["power", 18, 462, 884, 122, { en:"Power", zh:"电源" }, { en:"energy for everyone", zh:"给大家供电" }]
      ],
      roads:[
        ["usb", "diode", "power", { en:"5 volts from the cable (VBUS)", zh:"来自线缆的 5 伏（VBUS）" }],
        ["diode", "regulator", "power", { en:"one way only, into VSYS", zh:"只能往一个方向，流进 VSYS" }],
        ["battery", "regulator", "power", { en:"1.8 to 5.5 volts into VSYS", zh:"1.8 到 5.5 伏，流进 VSYS" }],
        ["regulator", "brain", "power", { en:"a steady 3.3 volts", zh:"稳定的 3.3 伏" }],
        ["regulator", "flash", "power", { en:"3.3 volts", zh:"3.3 伏" }],
        ["regulator", "pwrPins", "power", { en:"3.3 volts out for add-ons: keep them under 300 mA (how much electricity they draw)", zh:"给外加零件的 3.3 伏，用电别超过 300 mA（mA 说的是用了多少电）" }],
        ["flash", "brain", "qspi", { en:"your program, read by the brain", zh:"存着你的程序，大脑从这里读" }, true],
        ["crystal", "brain", "clock", { en:"12 million beats a second", zh:"每秒 1200 万拍" }],
        ["bootsel", "brain", "gpio", { en:"checked the moment the Pico starts", zh:"Pico 一通电就检查它" }],
        ["brain", "led", "gpio", { en:"pin 25: on or off", zh:"25 号针脚：开或关" }],
        ["brain", "gpPins", "gpio", { en:"23 pins your program controls, out or in", zh:"23 个归程序管的针脚，能出也能进" }, true],
        ["adcPins", "brain", "analog", { en:"voltages from 0 to 3.3 volts, measured as numbers", zh:"0 到 3.3 伏的电压，量出来变成数字" }],
        ["usb", "brain", "usb", { en:"programs in, messages out", zh:"程序进来，信息出去" }, true, "v"],
        ["usb", "brain", "gpio", { en:"pin 24: is the cable plugged in?", zh:"24 号针脚：线插上了吗？" }, false, "v"],
        ["brain", "regulator", "gpio", { en:"pin 23: power-save on or off", zh:"23 号针脚：开关省电模式" }],
        ["regulator", "brain", "analog", { en:"pin 29: measures VSYS, a rough battery gauge", zh:"29 号针脚：量 VSYS 的电压，相当于一个简易电量表" }],
        ["debug", "brain", "swd", { en:"pause the brain and look inside", zh:"让大脑暂停，看看里面" }, true]
      ],
      idea:{
        title:{ en:"Everything goes through the brain", zh:"一切都要经过大脑" },
        text:{ en:"Sense parts and pins send information in. The brain decides. The light and the pins act. The power parts feed everyone.", zh:"感知部件和针脚把信息送进来，大脑拿主意，小灯和针脚去执行，电源部件给大家供电。" },
        tips:[tip("Pick a road in the list: only that road lights up, and dots show which way it flows.", "在左边的列表里选一种路：只有这种路会亮，小圆点表示它往哪边流。"), tip("Tap any part on the map to see all of its roads.", "点地图上的任意部件，就能看到它连着的所有路。")],
        note:{ en:"The Pico has no radio, so there is no “through the air” road. The Pico W adds Wi-Fi and Bluetooth.", zh:"Pico 没有无线电，所以没有“隔空传输”的路。Pico W 才有 Wi-Fi 和蓝牙。" },
        line:{ en:"Information comes in on the left, the brain decides, actions go out on the right, and power comes up from below.", zh:"信息从左边进来，大脑在中间拿主意，动作从右边出去，电从下面往上送。" } }
    },
    nav:[{ to:"parts", label:{ en:"← Back to the parts", zh:"← 回到部件" }, ghost:true }, { to:"signal", label:{ en:"Next: follow a signal →", zh:"下一章：跟着信号走 →" } }] },

  /* ---------- chapter 5: follow one signal at a time, on the chapter 4 map ---------- */
  { id:"signal", title:{ en:"Follow a signal", zh:"跟着信号走" }, rail:{ en:"Signals", zh:"信号" },
    intro:{ en:"Four short stories. Each one follows a signal across the map, one road at a time, with the outside devices it needs.", zh:"四个小故事。每个故事都跟着一个信号，在道路图上一条路一条路地走，也会带上它需要的外部设备。" },
    stories:{
      map:"roads", viewBox:"-190 0 1110 590",
      nodes:{ computer:[-95, 500], lightSensor:[-95, 360] },
      roads:[
        ["computer", "usb", "power", { en:"5 volts from the computer", zh:"电脑送来的 5 伏" }],
        ["computer", "usb", "usb", { en:"the program file", zh:"程序文件" }, true],
        ["lightSensor", "adcPins", "analog", { en:"light turned into a voltage", zh:"光线变成电压" }]
      ],
      list:[
        { id:"load",
          en:{ t:"Load a new program", goal:"Put a program you wrote on the computer into the Pico." },
          zh:{ t:"放进一个新程序", goal:"把电脑上写好的程序放进 Pico。" },
          steps:[
            { roads:[["computer", "usb", "power"]], at:["bootsel"], form:"energy", now:{ en:"Power, 5 volts", zh:"电，5 伏" },
              en:{ t:"Hold the button, plug in", text:"Hold the start button down, then plug the cable into the computer. The computer sends 5 volts down the cable." },
              zh:{ t:"按住启动键，插上线", text:"先按住启动键别松，再把线插到电脑上。电脑顺着线送来 5 伏的电。" } },
            { roads:[["usb", "diode", "power"], ["diode", "regulator", "power"], ["regulator", "brain", "power"]], form:"energy", now:{ en:"Power, a steady 3.3 volts", zh:"电，稳定的 3.3 伏" },
              en:{ t:"The brain wakes up", text:"The power passes the one-way valve, the converter turns it into a steady 3.3 volts, and the brain switches on." },
              zh:{ t:"大脑醒了", text:"电经过单向阀，转换器把它变成稳定的 3.3 伏，大脑开始工作。" } },
            { roads:[["bootsel", "brain", "gpio"]], form:"bits", now:{ en:"A 1: the button is held", zh:"1：按键被按着" },
              en:{ t:"The brain checks the button", text:"The first thing the brain does is check the start button. It's held, so the brain goes into new-program mode instead of running the old program." },
              zh:{ t:"大脑先看启动键", text:"大脑醒来第一件事，就是看启动键。键被按着，所以它不运行原来的程序，而是进入新程序模式。" } },
            { roads:[["computer", "usb", "usb"], ["usb", "brain", "usb"]], form:"file", now:{ en:"The program file", zh:"程序文件" },
              en:{ t:"Drop in the program", text:"A new drive appears on the computer. You drop your program file on it, and the file travels along the USB data wires to the brain." },
              zh:{ t:"把程序拖进去", text:"电脑上多了一个新磁盘。把程序文件拖进去，文件就顺着 USB 数据线送到大脑。" } },
            { roads:[["flash", "brain", "qspi"]], form:"file", now:{ en:"The program, being written", zh:"程序，正在写进去" },
              en:{ t:"Saved on the storage chip", text:"The brain writes the program onto the storage chip, so it stays there even when the power goes off." },
              zh:{ t:"存进存储芯片", text:"大脑把程序写进存储芯片，以后断了电也不会丢。" } },
            { roads:[["flash", "brain", "qspi"]], at:["brain"], form:"file", now:{ en:"The program, being read", zh:"程序，正在读出来" },
              en:{ t:"Restart with the new program", text:"The Pico restarts on its own. This time the button isn't held, so the brain reads the new program from the storage chip and runs it." },
              zh:{ t:"换上新程序重新开始", text:"Pico 自己重启。这回没按启动键，大脑就从存储芯片读出新程序，开始运行。" } }
          ] },
        { id:"blink",
          en:{ t:"Blink the light", goal:"The Pico does its first job by itself: blinking its light." },
          zh:{ t:"让小灯闪起来", goal:"Pico 自己动手做第一件事：让小灯一闪一闪。" },
          steps:[
            { roads:[["regulator", "brain", "power"], ["regulator", "flash", "power"]], form:"energy", now:{ en:"Power, 3.3 volts", zh:"电，3.3 伏" },
              en:{ t:"Power on", text:"Plug in the cable. The power converter sends 3.3 volts to the brain and the storage chip." },
              zh:{ t:"通电", text:"插上线，电源转换器给大脑和存储芯片送去 3.3 伏。" } },
            { roads:[["flash", "brain", "qspi"]], form:"file", now:{ en:"The program", zh:"程序" },
              en:{ t:"Read the program", text:"The brain reads the program from the storage chip. Here the program says: every half second, switch the light on or off." },
              zh:{ t:"读出程序", text:"大脑从存储芯片读出程序。这个程序说的是：每过半秒，把小灯开一下或关一下。" } },
            { roads:[["crystal", "brain", "clock"]], form:"beat", now:{ en:"The beat, 12 million a second", zh:"节拍，每秒 1200 万下" },
              en:{ t:"Count the time", text:"The clock crystal keeps beating. By counting its beats, the brain knows when half a second has passed." },
              zh:{ t:"数着时间", text:"时钟晶振一直打着拍子。大脑数着拍子，就知道半秒什么时候到。" } },
            { roads:[["brain", "led", "gpio"]], form:"bits", now:{ en:"A 1 on pin 25", zh:"25 号针脚上的 1" },
              en:{ t:"Light on", text:"Half a second is up. The brain writes 1 to pin 25, and the little light comes on." },
              zh:{ t:"开灯", text:"半秒到了，大脑往 25 号针脚写 1，小灯亮了。" } },
            { roads:[["brain", "led", "gpio"]], form:"bits", now:{ en:"A 0 on pin 25", zh:"25 号针脚上的 0" },
              en:{ t:"Light off, and again", text:"Another half second: the brain writes 0 and the light goes off. The program repeats this for as long as the power is on." },
              zh:{ t:"关灯，再来一遍", text:"又过了半秒，大脑写 0，小灯灭了。只要有电，程序就一直这样重复下去。" } }
          ] },
        { id:"night",
          en:{ t:"A night light", goal:"The Pico senses the light and decides by itself when to switch its light on. A robot can use the same idea to notice it has gone somewhere dark." },
          zh:{ t:"天黑就亮灯", goal:"Pico 感知光线，自己决定什么时候开灯。机器人也能用同样的办法，发现自己进了暗处。" },
          steps:[
            { roads:[["lightSensor", "adcPins", "analog"]], form:"voltage", now:{ en:"A voltage that follows the light", zh:"跟着光线变的电压" },
              en:{ t:"The sensor feels the light", text:"A light sensor (you add it) is wired to measuring pin GP26. When the light changes, the voltage it gives changes too." },
              zh:{ t:"传感器感觉到光线", text:"光线传感器（需要你另外接上）接在测量针脚 GP26 上。光线一变，它给出的电压就跟着变。" } },
            { roads:[["adcPins", "brain", "analog"]], form:"number", now:{ en:"A number, for example 1500", zh:"一个数字，比如 1500" },
              en:{ t:"Voltage becomes a number", text:"The brain's measuring part turns that voltage into a number between 0 and 4095." },
              zh:{ t:"电压变成数字", text:"大脑的测量部件把这个电压换算成 0 到 4095 之间的数字。" } },
            { at:["brain"], form:"think", now:{ en:"A decision: is it dark?", zh:"一个判断：天黑了吗？" },
              en:{ t:"Is it dark?", text:"The program compares the number with a value you chose. Below it means dark." },
              zh:{ t:"天黑了吗？", text:"程序拿这个数字和你设定的一个值比一比，比它小就算天黑了。" } },
            { roads:[["brain", "led", "gpio"]], form:"bits", now:{ en:"A 1 on pin 25", zh:"25 号针脚上的 1" },
              en:{ t:"Switch the light on", text:"It's dark, so the brain writes 1 to pin 25 and the light comes on. When it gets bright again, it writes 0." },
              zh:{ t:"开灯", text:"天黑了，大脑往 25 号针脚写 1，小灯亮起来。等天亮了，再写 0 关掉。" } }
          ] },
        { id:"battery",
          en:{ t:"Run on a battery", goal:"The Pico keeps working away from the computer, and can even tell how full its battery is." },
          zh:{ t:"换成电池", goal:"离开电脑，Pico 照样工作，还能知道电池还剩多少电。" },
          steps:[
            { roads:[["usb", "brain", "gpio"]], form:"bits", now:{ en:"A 0: no cable", zh:"0：线拔掉了" },
              en:{ t:"Unplug the cable", text:"With a battery already connected, pull out the cable. Pin 24 tells the brain right away that the cable's power is gone." },
              zh:{ t:"拔掉线", text:"先接好电池，再拔掉线。24 号针脚马上告诉大脑：线缆那边没电了。" } },
            { roads:[["battery", "regulator", "power"]], at:["diode"], form:"energy", now:{ en:"Power from the battery", zh:"电池送来的电" },
              en:{ t:"The battery takes over", text:"The battery on the VSYS pin keeps the power coming; anything from 1.8 to 5.5 volts works. The one-way valve stops it flowing back out of the cable door." },
              zh:{ t:"电池接手", text:"接在 VSYS 针脚上的电池继续供电，电压在 1.8 到 5.5 伏之间都行。单向阀挡着，电不会从插线口倒流出去。" } },
            { roads:[["regulator", "brain", "power"]], form:"energy", now:{ en:"Power, a steady 3.3 volts", zh:"电，稳定的 3.3 伏" },
              en:{ t:"Still 3.3 volts", text:"The converter still sends out a steady 3.3 volts, so the brain carries on working." },
              zh:{ t:"还是 3.3 伏", text:"转换器照样送出稳定的 3.3 伏，大脑接着工作。" } },
            { roads:[["regulator", "brain", "analog"]], form:"voltage", now:{ en:"The battery's voltage", zh:"电池的电压" },
              en:{ t:"How full is the battery?", text:"Pin 29 measures the voltage on VSYS. As the battery runs down, its voltage drops, so the program can tell roughly how much is left." },
              zh:{ t:"电池还剩多少？", text:"29 号针脚量着 VSYS 的电压。电池越用越少，电压就越来越低，程序据此能大概知道还剩多少。" } },
            { roads:[["brain", "led", "gpio"]], form:"bits", now:{ en:"Quick 1s and 0s", zh:"很快的 1 和 0" },
              en:{ t:"Warn when it's low", text:"When the battery is nearly empty, the program can blink the light fast to warn you." },
              zh:{ t:"快没电时提醒你", text:"电快用完时，程序可以让小灯快闪，提醒你换电池。" } }
          ] }
      ]
    },
    nav:[{ to:"roads", label:{ en:"← Back to the roads", zh:"← 回到道路" }, ghost:true }, { to:"muscle", label:{ en:"Next: add a muscle →", zh:"下一章：加上“肌肉” →" } }] },

  /* ---------- chapter 6: a small robot part, built around the Pico ---------- */
  { id:"muscle", title:{ en:"Add a muscle", zh:"加上“肌肉”" }, rail:{ en:"Muscle", zh:"肌肉" },
    intro:{ en:"A small robot project: a head that turns toward light. Seven steps, each adding one idea.", zh:"一个小机器人项目：一个会转向光的头。一共七步，每一步多懂一点。" },
    stepsHead:{ en:"7 steps · a head that turns toward light", zh:"7 步 · 一个会转向光的头" },
    steps:[
      { id:"project", parts:["lightSensor", "brain", "servo", "computer"], demo:"project", setup:{ chip:"RP2040", pins:{ left:"GP26", right:"GP27", servo:"GP15" } },
        idea:{ en:"Sense, decide, act: the basic loop of every robot.", zh:"感知、拿主意、动手：每个机器人最基本的一圈。" },
        en:{ t:"The project", lead:"Build a head that turns toward light. Two light sensors are its eyes, the Pico is its brain, and a servo is its neck. Whichever side is brighter, the head turns that way.", watch:["Sense: two light sensors see which side is brighter.", "Decide: the Pico compares their readings and picks a direction.", "Act: the servo turns, and the head turns with it.", "Power: at first, a USB cable from the computer, which also brings in the program."], need:["1 Pico (with pins soldered on, or a Pico H)", "2 photoresistors and 2 fixed resistors (for example 10 kΩ)", "1 small servo (for example an SG90)", "1 breadboard and some jumper wires", "1 micro-USB cable"], note:"The lamp, the readings and the servo on these pages are simulated to show how it works. Real readings depend on your parts." },
        zh:{ t:"这个项目", lead:"做一个会转向光的头。两个光线传感器当眼睛，Pico 当大脑，舵机当脖子。哪边更亮，头就往哪边转。", watch:["感知：两个光线传感器，看哪边更亮。", "拿主意：Pico 比较两个读数，决定往哪转。", "动手：舵机一转，头就跟着转过去。", "供电：先用 USB 线连电脑，程序也从这根线送进去。"], need:["1 块 Pico（焊好排针，或者直接买 Pico H）", "2 个光敏电阻、2 个固定电阻（比如 10 kΩ）", "1 个小舵机（比如 SG90）", "1 块面包板和几根杜邦线", "1 根 micro-USB 线"], note:"这几页里的灯、读数和舵机都是模拟的，用来看清原理；真实读数取决于你的零件。" } },
      { id:"servo", parts:["servo", "gpPins"], demo:"servo", setup:{ min:0.5, max:2.4, period:20, pin:"GP15" },
        idea:{ en:"The wider the pulse, the further the servo turns.", zh:"脉冲越宽，舵机转得越多。" },
        en:{ t:"Meet the servo", lead:"A servo is the most common “muscle” in small robots. It isn't a motor that spins forever: it turns to an angle and holds it. The Pico tells it which angle by sending pulses from one signal pin.", watch:["Drag the slider: a wider pulse turns the arm one way, a narrower pulse the other way.", "A pulse arrives every 20 milliseconds; the servo reads its width as the angle.", "The servo's power and ground are wired separately; only its signal wire goes to a Pico pin."] },
        zh:{ t:"认识舵机", lead:"舵机是小机器人里最常见的“肌肉”。它不是一直转个不停的马达，而是转到一个角度就停住。Pico 只要从一个信号针脚发出脉冲，就能告诉它转到哪。", watch:["拖动滑块：脉冲变宽，臂往一边转；变窄，往另一边转。", "每 20 毫秒来一个脉冲，舵机看脉冲有多宽来决定角度。", "舵机的电源和地线另外接，只有信号线接到 Pico 的针脚上。"] } },
      { id:"eyes", parts:["lightSensor", "adcPins"], demo:"lightpair", setup:{ pins:["GP26", "GP27"] },
        idea:{ en:"The closer the lamp, the bigger that eye's number.", zh:"灯离哪只眼睛近，哪边的数字就大。" },
        en:{ t:"Two eyes", lead:"Each eye is a photoresistor and a fixed resistor on one measuring pin: the left eye on GP26, the right eye on GP27. Wired this way, more light gives a bigger number.", watch:["Move the lamp to the left: the left eye's number goes up.", "Put it straight ahead: the two numbers are about the same.", "The numbers are simulated, to show which way they move."] },
        zh:{ t:"两只“眼睛”", lead:"每只眼睛是一个光敏电阻加一个固定电阻，接在一个测量针脚上：左眼接 GP26，右眼接 GP27。按这种接法，光越亮，数字越大。", watch:["把灯移到左边：左眼的数字变大。", "把灯放在正前方：两边的数字差不多。", "数字是模拟的，用来看清它往哪边变。"] } },
      { id:"decide", parts:["brain"], demo:"lightpair", setup:{ pins:["GP26", "GP27"], rule:true, threshold:150 },
        idea:{ en:"Compare left and right, then turn a little toward the brighter side.", zh:"比一比左右，再往亮的那边转一点。" },
        en:{ t:"Decide", lead:"Many times a second, the Pico's program does the same thing: read both numbers, compare them, and pick which way the servo should turn a little. In plain words, the whole rule is three lines.", watch:["Left much brighter: turn left a little.", "Right much brighter: turn right a little.", "About the same: stay still, so the head doesn't wobble back and forth."] },
        zh:{ t:"拿主意", lead:"Pico 的程序每秒要做很多遍同一件事：读两个数字，比一比，再决定舵机往哪边转一点。用大白话说，整个规则就三句话。", watch:["左边亮很多：往左转一点。", "右边亮很多：往右转一点。", "差不多：不动，免得头来回晃。"] } },
      { id:"follow", parts:["lightSensor", "brain", "servo"], demo:"follow", setup:{ threshold:150, step:3, min:0.5, max:2.4 },
        idea:{ en:"Sense, decide, act, again and again: the head follows the light.", zh:"感知、拿主意、动手，一遍又一遍：头就跟着光转。" },
        en:{ t:"Put it all together", lead:"Join sensing, deciding and acting into one loop. Move the lamp, and the head turns a little at a time until both eyes see the same light. The loop runs many times a second.", watch:["Move the lamp slowly: the head follows.", "Move it all the way to the side: the servo stops at the end of its range.", "This is a robot's see–think–move loop."] },
        zh:{ t:"全部连起来", lead:"把感知、拿主意、动手连成一圈。移动灯，头会一点一点转过去，直到两只眼睛看到的光一样亮。这一圈每秒要跑很多遍。", watch:["慢慢移动灯：头跟着转。", "把灯移到最边上：舵机转到头就停下了。", "这就是机器人“看到、想、动”的一圈。"] } },
      { id:"wiring", parts:["adcPins", "gpPins", "pwrPins", "gndPins", "breadboard", "jumpers", "lightSensor", "servo"], demo:"wiring", setup:{ chip:"RP2040", pins:{ left:"GP26", right:"GP27", servo:"GP15" } },
        idea:{ en:"Every part gets power, ground and one signal pin.", zh:"每个零件都要接电源、地线和一个信号针脚。" },
        en:{ t:"How to wire it", lead:"Everything plugs into the breadboard and joins the Pico with jumper wires. The eyes connect to 3.3 volts, ground and two measuring pins. The servo's signal wire goes to GP15, its power to VBUS (5 volts while the USB cable is in), and its ground to the Pico's ground.", watch:["Pick “The eyes” to see how the two light sensors connect.", "Pick “The servo” to see where its 3 wires go.", "All the grounds join together, so the electricity can loop back."], note:"This is the usual way to wire it; check the guides for your own parts. A servo uses a lot of power, so don't power it from the 3V3 pin." },
        zh:{ t:"怎么接线", lead:"所有东西都插在面包板上，用杜邦线接到 Pico。两只眼睛接 3.3 伏、地线和两个测量针脚。舵机的信号线接 GP15，电源接 VBUS（插着 USB 线时是 5 伏），地线和 Pico 的地线接在一起。", watch:["选“眼睛”，看两个光线传感器怎么接。", "选“舵机”，看它的 3 根线分别接到哪。", "所有地线都要连在一起，电才能走一圈回来。"], note:"这是常见的接法，具体看你手上零件的说明。舵机很耗电，别用 3V3 针脚给它供电。" } },
      { id:"next", parts:[], demo:"next", setup:{ cards:[
          ["output", { en:"A second servo", zh:"再加一个舵机" }, { en:"look up, down, left, right", zh:"上下左右都能看" }],
          ["output", { en:"Two wheels", zh:"换成两个轮子" }, { en:"a car that chases light", zh:"追着光跑的小车" }],
          ["sense", { en:"A distance sensor", zh:"加一个测距传感器" }, { en:"stop before the wall", zh:"撞墙之前先停下" }]
        ] },
        idea:{ en:"The same see–think–move loop, with different parts, makes a new robot.", zh:"还是“看到、想、动”这一圈，换几个零件，就是一个新机器人。" },
        en:{ t:"Where this goes next", lead:"You now know the loop every robot runs. Swap a few parts and you have a new robot.", watch:["Add a second servo: the head can look up and down too.", "Swap the servo for two wheels: a small car that chases light.", "Add a distance sensor: it stops before it hits the wall."] },
        zh:{ t:"下一步可以做什么", lead:"每个机器人跑的那一圈，你现在已经懂了。换几个零件，就是一个新机器人。", watch:["再加一个舵机：头还能上下看。", "把舵机换成两个轮子：变成追着光跑的小车。", "加一个测距传感器：撞墙之前先停下。"] } }
    ],
    nav:[{ to:"signal", label:{ en:"← Back to the signals", zh:"← 回到信号" }, ghost:true }, { to:"outside", label:{ en:"Start again from chapter 1", zh:"从第 1 章重新开始" }, ghost:true }] }
];
