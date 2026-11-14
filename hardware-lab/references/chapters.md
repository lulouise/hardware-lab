# The six chapters

## Contents
- Parts: what counts, how many, outside devices
- 1 Outside · 2 Inside · 3 What each part does · 4 How they connect · 5 Follow a signal · 6 Toward your goal
- Quizzes · Chapters not built yet

## Parts: what counts, how many, outside devices
- **Pick the part that matters most first.** Ask: if you could only explain one part, which is it? Usually the main chip. It gets a deep dive in chapter 3 (below). Tell the learner your choice at review stop 1.
- **About 12 main parts at most.** Group the rest ("small parts": resistors and capacitors; "connectors"). A row of repeated things (a pin row) is one part on the outside, split by job on a map (signal pins, measuring pins, power pins, ground).
- **Each part has a friendly name and its real name.** The friendly name must sound natural in each language ("cable door" was translated literally into Chinese and read badly; the Chinese course uses 插线口). The real name sits in small grey text and in the card.
- **Colour = the part's main job** (`design.md`); a second job is mentioned in the card.
- **Outside devices.** Whatever the course uses that isn't part of the device (a computer, a battery, a sensor, a servo, a breadboard, jumper wires) is a part with `ext:true`: its own card ("Not on the board: you add this."), a dashed outline on maps, and a place in the drawings. A bare board can't be understood without its companions, so give them the same care as the board's own parts.

## 1. Outside
**Tab 1: 3D view** (the page opens here). The real shape you can turn and zoom, every main part labelled with its friendly name (about 10 labels; small parts only when tapped). Bare boards: as they really look (real colours, printed text). An "approximate shape" note if heights aren't published.

**Tab 2: Big picture.** A small 3D scene: the device on a table among simple drawings of what it works with (a screen, a computer, a battery, a sensor, a wall socket), joined by cables and labelled, so a learner sees "it plugs into a computer" instead of reading a box diagram. It only needs to turn a little, not all the way round. Beside it, a card answering: what is it (and what it isn't: "a board built around one chip, not a finished gadget"), what it's for, what it can't do alone, where it sits in the learner's goal, the family in one line.

## 2. Inside
Up to three views, each with its own one-line idea, as underlined tabs: the **3D view** with the parts spread apart (a slider: "Spread the parts"), **where the parts sit** (a flat map, labelled), and a third only if there's something to learn (e.g. **what each pin does**, pins coloured by job, names from the board).
- **Bare boards:** the same parts as chapter 1, coloured by job, lifted off the board onto their pads.
- **Closed devices:** a drawing, never opening steps. One plain safety line in the start card (and the battery's card): don't open a real one; point to the maker's guide.

**The 3D inside view of a closed device.** A learner shown ten coloured boxes sliding apart in empty space said the view was "very confusing": nothing looked like a real part and nothing showed where it sat. So:
- **Keep the outer shell, see-through, in every inside view.** It's the same shape as chapter 1 (reuse that builder with a faint material, as the Mac mini example does), and it stays visible while the parts spread. The shell is what tells the learner "the tank is at the back, the grinder is on top".
- **Each part has a shape you'd recognise, never a plain box.** A few simple solids are enough: a water tank is a see-through container with water in it, a grinder a funnel over a short drum, a pump a small cylinder with an inlet and an outlet, a heater a metal block with a pipe through it, a motor a cylinder with a shaft, a control board a thin green plate with a few chips, a battery a rounded pack. If two parts would look the same, give one a telling detail. A box is right only for a part that really is a box.
- **Spread in a few groups, not part by part.** Two to four layers that move together (for example: the shell; what the user fills and empties; the working parts; the electronics), each a clear step apart. One layer per part with its own distance scatters the picture, and the learner loses which part was next to which. A flat device spreads as a stack (Mac mini); a tall or deep one opens like drawers, in one direction.
- **Sizes and places come from the fact sheet.** When only the outside size is published, keep the parts in their rough real places from the maker's drawings and mark the view approximate. When even that is unknown, see "where the parts sit" below.
- The camera is low enough to see between the groups, and no more than about 10 labels show at once.

**"Where the parts sit" is a picture of the device, not a table of names.** Draw the device's own outline (the same silhouette as chapter 1, from the side or the front, whichever shows more) and put each part inside it, in its place, as a small simple shape in its job colour with a label beside it. Name boxes laid out in a grid inside a rounded rectangle are not a map: they say nothing a list doesn't. Parts the user can reach from outside (a tank, a tray) sit on the outline where they really are, so the learner can match the picture to the machine in front of them.
- **If you have no source for the inside layout,** don't draw invented positions and call them a map. Rename the tab to what it truly shows, "How it flows": still inside the device's outline, the outside parts in their real places, the inside parts placed along the path they work on (water: tank → pump → heater → spout), joined by thin lines, with one line under the figure saying the inside positions aren't published. Say this at review stop 1.

## 3. What each part does
One **station** per part, grouped by colour in the list.
- **Title: the real part** ("Storage chip and working memory", "Power converter: always 3.3 volts"), not the comparison ("Bookshelf and desk" left the learner unsure which part was the bookshelf).
- **Lead:** what the part is and where it sits ("the small chip above the brain"), then the comparison that helps ("like a bookshelf"), and what the device does with it.
- **A small picture of the device beside the demo lights the part up** (kit: `COURSE.where`), so the learner always knows which real part this is.
- **The demo** proves one fact by doing (`building.md` lists the demo types): the real part and its real name are drawn, the comparison is a caption underneath. It shows the whole path (from where, to where; out and back for electricity) and one real use. Its controls sit in a "Try it" tray.
- **"Same on other boards?"** One line: general to most devices, or this device only (with a contrast where it helps: "the Arduino Uno works at 5 V").
- **What to notice:** 2–3 numbered lines.
- A demo with no safe numbers shows a direction instead ("warmer / cooler") and says so.
- **Each demo fits this device.** Shared demo types are a starting point. If the real thing has 10 cores, draw 10, of the right kinds. If a type can't show the truth, add a new one (`building.md`). Example labels in a demo are learner-facing words: "draw the screen" meant nothing to a beginner; "play a video" did.

### The deep dive
The part that matters most gets opened up, and the amount follows the device: a Pico's chip may need two stations; a computer's chip needs a station per block.
- First a `chipmap` station: the part drawn with its real blocks and the real number of cores in each. Tap a block to read its job, then "Open" to go to its own station. Say that the layout is drawn for clarity if it isn't the real one.
- Then one station per block, each with a demo of what that block does differently (CPU: jobs shared across its cores; GPU: many small jobs at once; AI part: recognising; shared memory: no copying).
- They sit together in the list under their own heading (`deep` in `building.md`).
- Chapters 4 and 5 use the same blocks: show them as their own parts on the road map, and let stories go through them, or the deep dive stops at chapter 3.

## 4. How they connect
A **road map** with the brain in the middle: sense parts on the left, outputs on the right, power along the bottom, pins and add-ons along the top. A road is anything that flows: electricity, data, a clock beat, a measured voltage.
- Road **types** in **families** (Energy, Information wires, Through the air); each type has a line pattern, a one-line description and **"Why this road"**.
- The left list: the big idea first, then the road types by family. Picking one lights only its roads, with dots showing direction. Tapping a part shows all its roads.
- Include hidden roads a beginner wouldn't guess (a pin that watches the battery). Outside devices that connect (a battery) appear dashed.
- Place nodes so no road crosses a part; reroute with `bend`. Check every road in the critic pass.
- If a family doesn't exist on this device (no radio), say so in one line ("the Pico W adds Wi-Fi").

## 5. Follow a signal
Short **stories**, walked one road at a time on the chapter 4 map, with what is travelling shown under the map (power, a program file, a 1 or a 0, a voltage, the clock's beat, a number, a decision).
How to choose them:
1. **The goal decides** (sense / decide / act from intake).
2. **Order them like a beginner's real first tasks** with this device, each adding one new thing. For a board that might be: load a program, make something happen, react to a sensor, run alone. For a computer: switch on, see a picture, open an app, use its special parts, go wireless.
3. **Coverage is a check, not the aim:** every road family walked at least once; roads a beginner doesn't need (debug) can be skipped. Completeness lives in chapters 3 and 4.
4. **The number comes from the device.** List the real tasks, drop any that add nothing new, and count. A simple device may need 2 or 3; a computer may need 6. There is no target: the Pico example having four is not a pattern. Each story has a one-line goal saying what it achieves and what the device does in it.
5. **Say why on the page.** The chapter intro names the ordering idea in a line, because learners ask "why these stories?"
Stories may add outside devices (the computer, a sensor) as dashed nodes on a widened map. Tapping any part shows its card.

## 6. Toward your goal
A small project in **ordered steps**, as many as it needs, list on the left. A board's project usually goes:
1. **The project:** who does what (sense, decide, act, power), why, **what you'd need** (approximate shopping list), what the page simulates.
2.–5. One idea per step, each with a demo: the new outside part (e.g. meet the servo), the senses, the rule (in plain words, never code), then everything together.
6. **How to wire it:** every wire from which pin to which part, grouped (pick "the sensors" / "the servo"); power and ground included; "check your parts' guides".
7. **Where this goes next:** the same loop with a few parts swapped.
- **Devices you can build on** (boards, kits): add something (a servo, a sensor).
- **Closed devices:** the project is often setting it up and using it: what you need, plugging it in (`hookup`), the first switch-on (`firstrun`), each connection, what next. Or control it, connect it to something, or show where the same parts appear in robots; a mini version with a board the learner owns (from their record) is fine in their own course, marked approximate. See `examples/mac-mini-course/`.
- One project per direction if the learner has two.

## Quizzes
Each chapter ends with "Check yourself": 4 questions, 3 answers each, one right, a short "why" shown after answering. Questions test understanding of this chapter in plain words, not memorised numbers (except the few the chapter is about).

## Chapters not built yet
Show them greyed out in the rail with "after review" until their review stop.
