/* ===================== Raspberry Pi Pico (the plain Pico, RP2040): words, sources, quizzes =====================
   Fact sheet: facts-sheet.md, in this folder. Kit words (buttons, card headings) are in kit/js/core.js; override them here if needed. */
const COURSE = {
  id:"pico", name:COURSE_NAME,
  rest:"flat",                                 // a bare board: lies flat, shown like a picture (Front, Back and the edges)
  filterKeep:["board", "names"],               // under a colour filter the board stays faintly visible
  device:{ en:"Pico", zh:"Pico" },
  ui:{
  general:{ en:"Same on other boards?", zh:"其他板子也这样吗？" },
  where:{ en:"On the board", zh:"在板上" },
  footer:{ en:"Facts come from Raspberry Pi's own documents: the Raspberry Pi Pico datasheet (RP-008307-DS-2, including its photos of the front and back of the board), the Pico-series documentation page, and the RP2040 datasheet. Board: 51 × 21 × 1 mm, parts on one side only, 40 pins 2.54 mm apart, micro-USB port, BOOTSEL button, LED on GP25, RP2040 chip (2 cores, up to 133 MHz, 264 kB working memory), W25Q16JV 2 MB flash, 12 MHz crystal, RT6150 power converter (1.8–5.5 V in, 3.3 V out). Part positions are measured from the official photo and are approximate (about ± 1 mm). Heights of the parts are approximate shapes. Which small black chip is the storage chip, and which parts are the power converter and the one-way valve, is our best match to the photo: the maker doesn't label them.",
           zh:"资料来自树莓派官方文件：Raspberry Pi Pico 数据手册（RP-008307-DS-2，包括电路板正反面的照片）、Pico 系列文档页面，以及 RP2040 数据手册。电路板：51 × 21 × 1 毫米，零件只在一面，40 个针脚间距 2.54 毫米，micro-USB 接口，BOOTSEL 按键，LED 接在 GP25，RP2040 芯片（2 个核心，最高 133 MHz，264 kB 工作内存），W25Q16JV 2 MB 闪存，12 MHz 晶振，RT6150 电源转换器（输入 1.8–5.5 V，输出 3.3 V）。零件位置是从官方照片量出来的，是大致位置（约 ± 1 毫米）。零件的高度是大致形状。哪个小黑芯片是存储芯片、哪些零件是电源转换器和单向阀，是我们对照照片判断的，官方没有标出来。" },
    approx:{ en:"Approximate shape: heights are not published.", zh:"形状是大概的：官方没有公布零件高度。" },
    spread:{ en:"Spread the parts", zh:"展开零件" }, spreadClosed:{ en:"on the board", zh:"装在板上" }, spreadOpen:{ en:"spread out", zh:"已展开" }
  }
};

/* ===================== quizzes ===================== */
const QUIZ = {
  outside:[
    { ok:0, en:{ q:"Where do you plug in the cable?", a:["The short top edge","A long edge","The back"], why:"The cable door (micro-USB) sticks out over the short top edge." },
            zh:{ q:"线插在哪里？", a:["短的顶边","长边","背面"], why:"插线口（micro-USB）就伸在短的那条顶边上。" } },
    { ok:1, en:{ q:"What are the 40 gold half-holes along the long edges for?", a:["Letting heat out","Connecting wires, sensors and motors","Screwing it down"], why:"They are the Pico's 40 legs (pins). The 4 corner holes are for screws." },
            zh:{ q:"长边上那 40 个金色半圆孔是干什么用的？", a:["散热","接导线、传感器和电机","拧螺丝"], why:"这些就是 Pico 的 40 条腿（针脚）。四个角上的孔才是螺丝孔。" } },
    { ok:2, en:{ q:"Where can you read the name of each pin?", a:["On the brain chip","Nowhere: you must guess","Printed on the back"], why:"Each name is printed in white next to its leg on the back." },
            zh:{ q:"每个针脚的名字在哪儿能看到？", a:["大脑芯片上","看不到，只能猜","印在背面"], why:"每个名字都用白字印在背面，就在那条腿旁边。" } },
    { ok:0, en:{ q:"What does the Pico NOT have on its own?", a:["A screen","A brain","A button"], why:"No screen, no speaker and no battery: you choose what to add." },
            zh:{ q:"Pico 自己没有下面哪样东西？", a:["屏幕","大脑","按键"], why:"没有屏幕，没有喇叭，也没有电池，加什么由你决定。" } }
  ],
  inside:[
    { ok:1, en:{ q:"Which part keeps your program when the power is off?", a:["The brain's working memory","The storage chip (flash)","The clock"], why:"The storage chip is the bookshelf. The working memory is a desk that's wiped at power-off." },
            zh:{ q:"断电以后，哪个部件还留着你的程序？", a:["大脑的工作内存","存储芯片（闪存）","时钟"], why:"存储芯片像书架，东西一直都在。工作内存像书桌，一断电就清空。" } },
    { ok:0, en:{ q:"What does the power converter do?", a:["Turns 1.8–5.5 V into a steady 3.3 V","Stores the program","Measures temperature"], why:"The brain and the pins need a steady 3.3 volts, whatever comes in." },
            zh:{ q:"电源转换器是干什么的？", a:["把 1.8–5.5 V 变成稳定的 3.3 V","存程序","测温度"], why:"不管进来的是多少伏，大脑和针脚都要稳定的 3.3 伏。" } },
    { ok:2, en:{ q:"How many of the 40 pins are ground pins?", a:["26","3","8"], why:"8 ground pins (one is AGND). 26 pins are the ones you can program." },
            zh:{ q:"40 个针脚里，地线针脚有几个？", a:["26","3","8"], why:"8 个地线针脚（其中一个叫 AGND）。能编程的针脚是 26 个。" } },
    { ok:1, en:{ q:"What does the clock (crystal) do?", a:["Shows the time on a screen","Keeps the beat for the brain","Charges a battery"], why:"Its quartz shakes 12 million times a second, like a metronome for the brain." },
            zh:{ q:"时钟（晶振）是干什么的？", a:["在屏幕上显示时间","给大脑打拍子","给电池充电"], why:"里面的石英每秒振动 1200 万次，就像大脑的节拍器。" } }
  ],
  parts:[
    { ok:0, en:{ q:"What happens to the brain's working memory (the desk) when the power goes off?", a:["It is wiped", "It moves to the storage chip", "Nothing changes"], why:"The desk forgets. Only the bookshelf (the storage chip) keeps your program." },
            zh:{ q:"断电时，大脑的工作内存（书桌）会怎么样？", a:["清空", "搬进存储芯片", "没变化"], why:"书桌上的东西全没了，只有书架（存储芯片）还留着你的程序。" } },
    { ok:1, en:{ q:"How do you put the Pico into new-program mode?", a:["Press the button twice while it runs", "Hold the button while you plug in the cable", "Unplug the cable for 10 seconds"], why:"The button only counts at the moment the Pico gets power." },
            zh:{ q:"怎么让 Pico 进入新程序模式？", a:["运行时连按两下按键", "按住启动键再插线", "拔掉线等 10 秒"], why:"启动键只在 Pico 刚通电的那一瞬间起作用。" } },
    { ok:2, en:{ q:"A measuring pin reads 4095. About how many volts is that?", a:["0 volts", "1.6 volts", "3.3 volts"], why:"4095 is the top of the scale: 3.3 volts." },
            zh:{ q:"测量针脚读到 4095，大概是多少伏？", a:["0 伏", "1.6 伏", "3.3 伏"], why:"4095 是刻度的最高点，也就是 3.3 伏。" } },
    { ok:0, en:{ q:"What does the power converter give out, whether it gets 2 volts or 5 volts?", a:["A steady 3.3 volts", "Exactly what comes in", "Always 5 volts"], why:"It lowers or raises whatever comes in (1.8 to 5.5 volts) to a steady 3.3 volts." },
            zh:{ q:"进来的是 2 伏也好，5 伏也好，电源转换器送出去的是多少？", a:["稳定的 3.3 伏", "进来多少就送多少", "一直是 5 伏"], why:"它把进来的电（1.8 到 5.5 伏）升高或降低，变成稳定的 3.3 伏。" } }
  ],
  roads:[
    { ok:0, en:{ q:"Which road carries your program from the storage chip to the brain?", a:["The bookshelf lane: 4 wires side by side", "A power line", "The beat wire"], why:"The program is big and needed fast, so it gets a wide road." },
            zh:{ q:"哪条路把程序从存储芯片送到大脑？", a:["书架快车道：4 根线并排", "电源线", "节拍线"], why:"程序很大，大脑又急着要，所以走一条宽路。" } },
    { ok:1, en:{ q:"Why does a button need only one wire?", a:["It uses no electricity", "It has just two states: pressed or not", "The brain can't read more than one wire"], why:"One wire with two states (1 or 0) says pressed or not pressed." },
            zh:{ q:"为什么按键只要一根线？", a:["它不用电", "它只有两种状态：按下或没按", "大脑读不了更多线"], why:"一根线有两种状态（1 或 0），刚好说清按没按。" } },
    { ok:1, en:{ q:"Where does the cable's energy go right after the cable door?", a:["Straight into the brain", "Through the one-way valve, then the power converter", "Into the storage chip"], why:"Cable → one-way valve → power converter → a steady 3.3 volts for everyone." },
            zh:{ q:"线缆送来的电进了插线口以后，先去哪儿？", a:["直接进大脑", "先过单向阀，再到电源转换器", "进存储芯片"], why:"线缆 → 单向阀 → 电源转换器 → 变成稳定的 3.3 伏给大家用。" } },
    { ok:2, en:{ q:"How does the brain know whether the cable is plugged in?", a:["It guesses", "The light tells it", "Pin 24 tells it"], why:"One of the brain's hidden pins, pin 24, watches the cable's power." },
            zh:{ q:"大脑怎么知道线插没插上？", a:["它猜的", "小灯告诉它", "24 号针脚告诉它"], why:"大脑有个隐藏针脚，24 号，专门盯着线缆有没有送电来。" } }
  ],
  signal:[
    { ok:1, en:{ q:"When you load a new program, when does the start button count?", a:["Any time it's pressed", "Only at the moment the Pico gets power", "Only after the program is running"], why:"The brain checks the button first thing when it wakes up." },
            zh:{ q:"放新程序时，启动键什么时候起作用？", a:["随时按都行", "只在 Pico 刚通电的那一瞬间", "程序跑起来以后才行"], why:"大脑一醒来，第一件事就是看启动键。" } },
    { ok:2, en:{ q:"How does the brain know when half a second has passed?", a:["The light tells it", "The storage chip tells it", "It counts the clock crystal's beats"], why:"The crystal beats 12 million times a second; counting beats measures time." },
            zh:{ q:"大脑怎么知道半秒到了？", a:["小灯告诉它", "存储芯片告诉它", "数时钟晶振的拍子"], why:"晶振每秒打 1200 万下，数拍子就能算时间。" } },
    { ok:0, en:{ q:"In the night light, what reaches the measuring pin?", a:["A voltage that follows the light", "A program file", "5 volts from the computer"], why:"The light sensor turns light into a voltage; the brain turns that into a number." },
            zh:{ q:"在“天黑就亮灯”里，送到测量针脚的是什么？", a:["跟着光线变的电压", "程序文件", "电脑送来的 5 伏"], why:"光线传感器把光变成电压，大脑再把电压变成数字。" } },
    { ok:1, en:{ q:"How can the program tell the battery is running low?", a:["The light gets dimmer by itself", "Pin 29 measures the voltage on VSYS", "The storage chip fills up"], why:"As a battery runs down its voltage drops, and pin 29 measures it." },
            zh:{ q:"程序怎么知道电池快没电了？", a:["小灯自己会变暗", "29 号针脚量 VSYS 的电压", "存储芯片会装满"], why:"电池越用电压越低，29 号针脚一直在量它。" } }
  ],
  muscle:[
    { ok:2, en:{ q:"What tells a servo which angle to turn to?", a:["How long the power stays on", "The colour of its wires", "The width of each pulse on its signal wire"], why:"A pulse arrives every 20 ms; the wider it is, the further the arm turns." },
            zh:{ q:"舵机靠什么知道要转到哪个角度？", a:["电源开多久", "线的颜色", "信号线上每个脉冲的宽度"], why:"每 20 毫秒来一个脉冲，越宽，臂转得越多。" } },
    { ok:0, en:{ q:"The left eye reads much more than the right eye. What does the head do?", a:["Turns left a little", "Turns right a little", "Stays still"], why:"It turns a little toward the brighter side, then checks again." },
            zh:{ q:"左眼的数字比右眼大很多，头会怎么做？", a:["往左转一点", "往右转一点", "不动"], why:"它往亮的那边转一点，然后再看一遍。" } },
    { ok:1, en:{ q:"Why does the rule say “about the same: stay still”?", a:["To save the program", "So the head doesn't wobble back and forth", "Because the servo can't turn"], why:"Without it, tiny differences would make the head twitch all the time." },
            zh:{ q:"规则里为什么有一句“差不多就不动”？", a:["为了省程序", "免得头来回晃", "因为舵机转不动"], why:"没有这一句，一点点差别都会让头一直抖。" } },
    { ok:1, en:{ q:"Where should the servo get its power?", a:["From the 3V3 pin", "From VBUS (5 V while the USB cable is in)", "From a measuring pin"], why:"A servo needs about 5 volts and a lot of current; the 3V3 pin is for small parts." },
            zh:{ q:"舵机的电应该从哪里接？", a:["3V3 针脚", "VBUS（插着 USB 线时是 5 伏）", "测量针脚"], why:"舵机要 5 伏左右，而且很耗电；3V3 针脚只适合小零件。" } }
  ]
};
