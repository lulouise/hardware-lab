/* ===================== Mac mini (2024, Apple M4): words, sources, quizzes =====================
   Fact sheet: facts-sheet.md. Numbers are from Apple's official spec page; the inside layout is from
   teardown photos and is drawn as an approximate shape. Kit words live in kit/js/core.js. */
const COURSE = {
  id:"macmini", name:COURSE_NAME,
  rest:"floor",                                  // a small box on a desk: From above, Underneath, Front, Side, Back
  filterKeep:["body"],                           // under a colour filter the aluminium case stays faintly visible
  groups:{ output:{ en:["Show & play", "lets you see and hear things"], zh:["显示和播放", "让你看得到、听得到"] } },
  device:{ en:"Mac mini", zh:"Mac mini" },
  ui:{
    footer:{ en:"Numbers come from Apple's own spec pages (support.apple.com/en-us/121555 and apple.com/mac-mini/specs): size 12.7 × 12.7 × 5.0 cm, 0.67 kg; Apple M4 chip (10-core CPU with 4 performance + 6 efficiency cores, 10-core GPU, 16-core Neural Engine); 16GB unified memory (120GB/s), 256GB SSD, both configurable; front 2 × USB-C (USB 3) + headphone jack; back power, Gigabit Ethernet, HDMI, 3 × Thunderbolt 4; Wi-Fi 6E, Bluetooth 5.3; 100–240V in, up to 155W; in the box, the Mac mini and a power cord. The inside layout (fan, power supply, SSD, speaker, antenna) is drawn from iFixit's teardown photos and is approximate, not an official diagram. The CPU / GPU / Neural Engine areas shown on the chip are a teaching aid, not a real map of the chip. Readings in the demos are simulated.",
             zh:"数字来自苹果官方规格页（support.apple.com/en-us/121555 和 apple.com/mac-mini/specs）：尺寸 12.7 × 12.7 × 5.0 厘米，0.67 千克；Apple M4 芯片（10 核 CPU，4 个性能核 + 6 个能效核，10 核 GPU，16 核神经网络引擎）；16GB 统一内存（120GB/s），256GB SSD，两者都可选配更大；前面 2 个 USB-C（USB 3）加一个耳机口；后面电源口、千兆以太网口、HDMI、3 个雷雳 4；Wi-Fi 6E、蓝牙 5.3；输入 100–240V，最高 155W；盒子里有 Mac mini 和一根电源线。里面的布局（风扇、电源、SSD、喇叭、天线）是照着 iFixit 拆解照片画的，是大概位置，不是官方图纸。芯片上标出的 CPU / GPU / 神经网络引擎 区域只是教学示意，不是真实的芯片版图。演示里的读数都是模拟的。" },
    approx:{ en:"Approximate shape: the inside layout is drawn from teardown photos, not an official diagram.", zh:"大概形状：里面的布局是照着拆解照片画的，不是官方图纸。" },
    spread:{ en:"Spread the layers", zh:"展开各层" }, spreadClosed:{ en:"closed up", zh:"合起来" }, spreadOpen:{ en:"opened up", zh:"已展开" }
  }
};

/* ===================== quizzes ===================== */
const QUIZ = {
  outside:[
    { ok:2, en:{ q:"What does the Mac mini NOT come with in the box?", a:["A power cord","The M4 chip","A screen, keyboard and mouse"], why:"The box has only the Mac mini and a power cord. You add a screen, a keyboard and a mouse yourself." },
            zh:{ q:"盒子里不包含下面哪样东西？", a:["电源线","M4 芯片","屏幕、键盘和鼠标"], why:"盒子里只有 Mac mini 和一根电源线。屏幕、键盘、鼠标都要你自己另外配。" } },
    { ok:1, en:{ q:"Where is the power button?", a:["On the front, next to the USB-C ports","Underneath, toward the back","There isn't one"], why:"Apple moved it to the bottom. You tilt the machine up to reach it." },
            zh:{ q:"电源键在哪儿？", a:["前面，挨着 USB-C 口","底下，靠后的位置","没有电源键"], why:"苹果把它放到了机身底部，要把机器翘起来才够得着。" } },
    { ok:0, en:{ q:"Which plugs go on the BACK of the Mac mini?", a:["Power, Ethernet, HDMI and Thunderbolt","Only the headphone jack","Nothing: the back is blank"], why:"The back has the power socket, the network (Ethernet) port, HDMI for a screen, and three Thunderbolt ports. Two USB-C ports and the headphone jack are on the front." },
            zh:{ q:"哪些接口在 Mac mini 的背面？", a:["电源、以太网、HDMI 和雷雳","只有耳机口","什么都没有，背面是光的"], why:"背面有电源口、网线口（以太网）、接屏幕的 HDMI，还有三个雷雳口。前面是两个 USB-C 口和一个耳机口。" } },
    { ok:1, en:{ q:"The round dish on the bottom of the Mac mini is mainly for…", a:["Holding it like a handle","Letting cool air in","A hidden screen"], why:"The recessed base is an air intake. A fan pulls cool air in through it and pushes warm air out the back." },
            zh:{ q:"Mac mini 底部那个圆盘主要是干什么的？", a:["当把手拿","让凉空气进来","藏着的屏幕"], why:"底部凹进去的那圈是进风口。风扇从这里把凉空气吸进去，再把热空气从背面排出去。" } }
  ],
  inside:[
    { ok:0, en:{ q:"What is special about the Apple M4?", a:["It packs the CPU, GPU, AI engine and memory controller into one chip","It is only for graphics","It is the power supply"], why:"The M4 is a 'system on a chip': many jobs that used to need separate chips are built into this one square." },
            zh:{ q:"Apple M4 特别在哪里？", a:["把 CPU、GPU、AI 引擎和内存控制器都做进了一颗芯片","只管画面","它是电源"], why:"M4 是一颗“系统级芯片”：以前要好几颗芯片才能干的活，现在都做进了这一个方块里。" } },
    { ok:1, en:{ q:"When you switch the Mac mini off, which part forgets everything?", a:["The SSD storage","The working memory","The power supply"], why:"The working memory is wiped at power-off, like a desk cleared at night. The SSD keeps your files, like a bookshelf." },
            zh:{ q:"关机以后，哪个部件会把东西全忘掉？", a:["SSD 存储","工作内存","电源"], why:"工作内存一断电就清空，就像收拾干净的书桌。SSD 会保留你的文件，就像书架。" } },
    { ok:2, en:{ q:"Why is the memory soldered right onto the M4 chip?", a:["To save money","To make it easy to replace","So the CPU and GPU can reach it very fast, and share it"], why:"This is 'unified memory': one fast pool of memory next to the chip that the CPU and GPU both use." },
            zh:{ q:"内存为什么和 M4 芯片封装在一起？", a:["为了省钱","为了方便更换","让 CPU 和 GPU 都能快速使用，还能共用"], why:"这就是“统一内存”：紧挨芯片、CPU 和 GPU 共用的一块高速内存。" } },
    { ok:1, en:{ q:"What keeps the M4 chip from overheating?", a:["The aluminium case alone","A fan that pulls air from the base over a copper heatsink and out the back","Nothing: it never gets warm"], why:"A fan pulls cool air in through the round base, over a copper heatsink on the chip, and pushes the warm air out the back." },
            zh:{ q:"靠什么不让 M4 芯片过热？", a:["光靠铝外壳","一个风扇：从底部吸风，吹过芯片上的铜片，再从背面排出去","不用管，它从来不热"], why:"风扇从圆形底座把凉空气吸进来，吹过芯片上的铜散热片，再把热空气从背面排出去。" } }
  ],
  parts:[
    { ok:1, en:{ q:"Why does having more CPU cores help the brain?", a:["It makes each job take longer","More jobs can be done at the same time","It only saves electricity"], why:"Each core is a worker that does one job at a time. More cores means more jobs running at once, so the queue stays short." },
            zh:{ q:"CPU 核心多有什么好处？", a:["每件事做得更久","同一时间能做更多事","只是更省电"], why:"每个核心一次只做一件事。核心越多，同时能做的事就越多，任务就不用排长队。" } },
    { ok:1, en:{ q:"What can one USB-C / Thunderbolt cable carry at the same time?", a:["Only power","Power, data and a picture","Only a picture"], why:"That's the clever part of these sockets: a single cable can carry power, data and a picture for a screen all at once." },
            zh:{ q:"一根 USB-C / 雷雳线能同时送什么？", a:["只有电","电、数据和画面","只有画面"], why:"一根线能同时传电、数据和给屏幕的画面。" } },
    { ok:0, en:{ q:"Why can the Mac mini be used in almost any country?", a:["Its power supply takes anything from 100 to 240 volts","It runs on a battery","It changes shape to fit the socket"], why:"Wall voltage differs by country. The built-in power supply accepts the whole 100–240 volt range and makes it steady." },
            zh:{ q:"Mac mini 为什么几乎在哪个国家都能用？", a:["它的电源支持 100 到 240 伏","它靠电池供电","它会自动更换插头"], why:"各国插座的电压不一样。内置电源支持 100 到 240 伏，都能变成稳定的电。" } },
    { ok:1, en:{ q:"How does the Mac mini connect to a wireless keyboard?", a:["Through a cable only","Over Bluetooth, through the air","It can't connect to one"], why:"The antenna sends and catches radio waves. Bluetooth uses them to reach a keyboard, mouse or headphones a few metres away." },
            zh:{ q:"Mac mini 怎么连上无线键盘？", a:["只能用线","用蓝牙无线连接","连不了"], why:"天线收发无线电波。蓝牙用这种电波连接几米内的键盘、鼠标或耳机。" } }
  ],
  roads:[
    { ok:1, en:{ q:"On the road map, where do almost all the roads lead?", a:["The power button","The brain, the M4 chip","The speaker"], why:"The brain sits in the middle. Power, files, the picture and the sockets all meet there." },
            zh:{ q:"在道路图上，几乎所有的路都通向哪儿？", a:["电源键","大脑，也就是 M4 芯片","喇叭"], why:"大脑在正中间。电、文件、画面和各个接口都在这里汇合。" } },
    { ok:2, en:{ q:"Which of these is NOT one of the three families of road?", a:["Energy","Information wires","Heat"], why:"The three families are Energy, Information wires and Through the air. Heat is carried away by the fan, but it isn't drawn as a road here." },
            zh:{ q:"下面哪一个不是三类道路之一？", a:["能量","信息线","热量"], why:"三类道路是能量、信息线和无线。热量由风扇带走，这里没有画成一条路。" } },
    { ok:0, en:{ q:"Why is the unified memory the fastest road of all?", a:["It sits right on the M4 chip","It uses the longest cable","It is the largest part inside"], why:"The brain uses working memory constantly, so Apple puts it right on the chip — the shortest road possible." },
            zh:{ q:"统一内存为什么是最快的一条路？", a:["它和 M4 芯片封装在一起","它用了最长的线","它是机身里最大的部件"], why:"大脑时刻都在用工作内存，所以苹果把它和芯片封装在一起。路越短越快。" } },
    { ok:1, en:{ q:"The 'picture out' road carries…", a:["Power back to the wall","The finished image out to your screen","Files into the SSD"], why:"The GPU draws the picture, and this road sends that finished image out a socket to your monitor." },
            zh:{ q:"“画面输出”这条路送的是……", a:["把电送回插座","把画好的画面送到你的屏幕","把文件写进 SSD"], why:"GPU 画好画面后，这条路把画面从接口送到你的显示器。" } }
  ],
  signal:[
    { ok:1, en:{ q:"When you turn the Mac on, where does it read macOS from?", a:["Working memory","The SSD storage","The power supply"], why:"Storage keeps macOS even with the power off. At start-up the brain reads it from the SSD into working memory and runs it." },
            zh:{ q:"开机时，Mac 从哪里加载 macOS？", a:["工作内存","SSD 存储","电源"], why:"macOS 存在 SSD 里，断电也不会丢。开机时大脑把它读到工作内存里运行。" } },
    { ok:0, en:{ q:"In 'a picture on the screen', which part builds the picture?", a:["The GPU, the graphics part of the M4","The power supply","The speaker"], why:"The GPU is the part of the M4 built to draw graphics; it builds the picture in working memory, then it goes out to the screen." },
            zh:{ q:"在“屏幕上的画面”里，是哪部分把画面画出来的？", a:["GPU，M4 里管画面的那部分","电源","喇叭"], why:"GPU 是 M4 里专门画图形的部分，它在工作内存里把画面拼好，再送到屏幕。" } },
    { ok:0, en:{ q:"When you open an app, why does it feel instant?", a:["It runs from the fast working memory","It runs straight from the wall","Apps are tiny"], why:"The brain reads the app from the SSD into working memory — the fast 'desk' — where it runs, so it opens quickly." },
            zh:{ q:"打开一个 App，为什么感觉一下就开了？", a:["它在高速的工作内存里运行","它直接用插座的电运行","App 都很小"], why:"大脑把 App 从 SSD 读到工作内存（书桌）里运行，所以打开得快。" } },
    { ok:1, en:{ q:"To reach the internet with no cable, the Mac uses…", a:["The HDMI socket","Wi-Fi, through the antenna","The power button"], why:"The antenna sends radio waves over Wi-Fi to your router, and through it to the internet — no cable needed." },
            zh:{ q:"不插线连互联网，Mac 用的是……", a:["HDMI 口","Wi-Fi，通过天线","电源键"], why:"天线用 Wi-Fi 发出无线电波连到路由器，再接入互联网，不用接线。" } }
  ],
  setup:[
    { ok:1, en:{ q:"What comes in the Mac mini box?", a:["A screen, keyboard and mouse too","Just the Mac mini and a power cord","Nothing but foam"], why:"Only the Mac mini and its power cord are in the box. You add a screen, a keyboard and a mouse yourself." },
            zh:{ q:"Mac mini 盒子里有什么？", a:["屏幕、键盘、鼠标都有","只有 Mac mini 和一根电源线","只有泡沫"], why:"盒子里只有 Mac mini 和电源线。屏幕、键盘、鼠标都要你自己配。" } },
    { ok:0, en:{ q:"Which cables do you plug in first?", a:["Power and the screen","Only headphones","None — it's all wireless"], why:"Start with the two cables it can't run without: the power cord to the wall, and one cable to the screen." },
            zh:{ q:"先插哪两根线？", a:["电源和屏幕","只插耳机","都不用，全是无线"], why:"先接最基本的两根线：电源线接插座，另一根线接屏幕。" } },
    { ok:1, en:{ q:"How do you connect a wireless keyboard?", a:["With an HDMI cable","Pair it over Bluetooth", "You can't — keyboards are always wired"], why:"A Bluetooth keyboard pairs through the air, using the same antenna as Wi-Fi. No cable needed." },
            zh:{ q:"无线键盘怎么连？", a:["用 HDMI 线","用蓝牙配对","连不了，键盘只能有线"], why:"蓝牙键盘通过无线配对，用的是和 Wi-Fi 同一个天线，不用接线。" } },
    { ok:0, en:{ q:"How many screens can the M4 Mac mini drive at once?", a:["Up to three","Exactly one","Ten or more"], why:"The plain M4 Mac mini can drive up to three screens at the same time, using its HDMI and Thunderbolt sockets." },
            zh:{ q:"M4 Mac mini 最多能同时连接几块屏幕？", a:["最多三块","只能一块","十块以上"], why:"M4 Mac mini 通过 HDMI 口和雷雳口，最多能同时连接三块屏幕。" } }
  ]
};
