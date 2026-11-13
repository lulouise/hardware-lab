# Intake, the learner record, and the outline (review stop 1)

## Contents
1. Ask only what isn't known
2. The questions
3. Turning the goal into chapters 5–6
4. The learner record
5. A course for this device already exists
6. The outline for review stop 1
7. Which devices fit

## 1. Ask only what isn't known
Ask one question at a time, in the learner's language, with easy choices plus "something else". Before asking, check what you already know: a learner record (§4), the project's notes, and earlier chat. Don't ask what you can find out; do show your assumptions in the outline so the learner can correct them.

## 2. The questions
1. **What is the thing?** A name, a product link or a photo.
   - If the name covers a **family** (Pico, Pico W, Pico 2…), ask which one they have or plan to buy. Build for that one; one line on the page says how the others differ.
   - Ask whether they want their **exact model** or a **general version** ("any robot vacuum"). A general version changes the research (see `research.md`).
2. **What do you already know?** Nothing / a little / some. This sets how much the cards explain, never whether words are explained.
3. **Why are you learning it?** Offer a few directions (build robots, make connected gadgets, make light or sound projects, just understand it) and invite their own words ("a plant that waters itself").
4. **Which language or languages should the page be in?** Usually you can decide this yourself: use the language the learner writes in (or their record's languages), and ask only when it's unclear, for example when they mix two languages. Don't make it a silent choice: the outline says which language(s) you chose and that they can ask for another, or for two with a switch. A course in one language sets `langs` in `facts.js`, which hides the switch (`building.md`).

Example (a learner with no record):
> **You:** Why do you want to learn this board? Pick one, or tell me what you'd like to make: ① robots ② connected gadgets ③ light and sound projects ④ just to understand it ⑤ something else
> **Learner:** I want a plant pot that waters itself.
> **You:** Got it. So the board has to sense whether the soil is dry, decide when to water, and run a small pump. Do you have any parts yet, or are you starting from zero?

## 3. Turning the goal into chapters 5–6
Turn the goal into three things the device must do: **sense** (what it measures), **decide** (the rule), **act** (what it moves, lights or sends). For the plant: soil-moisture sensor on a measuring pin / water when too dry, stop after a while / a small pump (with its own power and a switching part).

These choose the chapter 5 stories and the chapter 6 project (`chapters.md` §5–6). Chapters 1–4 are the same for everyone.

**Two goals in different directions** (robots *and* a smart plant): one course, two directions. Chapters 1–4 once; chapter 5 = shared basics plus 1–2 stories per direction, grouped; chapter 6 = one project per direction. Never build a second copy of chapters 1–4. The learner can start with one direction and add the other later (§5).

## 4. The learner record
A file `learner.md` in the learner's own project (template: `assets/learner-template.md`): what they know, their goal, languages, how they like to learn, devices they own, and course progress.
- **Read it if it exists; never require it.** Without one, ask the questions above.
- **It may personalise this learner's own course:** skip what they know, choose examples near their goal, compare with a device they own.
- **Update it only at the end of a review stop, and only with the learner's OK** (progress, new things they know, corrections they made).
- **Never copy anything from it into this skill, and never into another learner's course.** Design feedback from reviews can become general rules; personal background and progress never do.

## 5. A course for this device already exists
If the record or the project files show a course for this device, don't start over. Offer to **add a direction**: keep chapters 1–4, build only the new direction's chapter 5 stories and chapter 6 project, and review those.

## 6. The outline for review stop 1
Show this before building any page. Changing direction here costs nothing; after chapter 2 it costs a lot.

- **The device:** exact model (or general version, with the example model whose sizes you'll draw).
- **Sources** (official first) and the **fact sheet** (`research.md`), with confidence levels; say plainly what you couldn't find.
- **What I'm assuming about you:** what you know, your goal (as sense / decide / act), and the page's language(s) ("the course will be in Chinese; say if you'd like English too"). Invite corrections.
- **Big picture** in one or two sentences (what it is and isn't: "a small board built around one chip, not a finished gadget").
- **The six chapters,** one line each, plus:
  - the parts that get a station (about 12 at most) and the outside devices the course needs;
  - each chapter 5 story, with the road families it walks (as many as the device and goal need, not a set number: `chapters.md` §5);
  - the chapter 6 project, with what the learner would add and buy (approximate).
- **Things the page will mark** as approximate, simulated or unknown.

### Say how deep you'll go
At this stop, name the part that matters most and how you'll open it up ("the M4 chip gets five stations: the chip map, then its CPU, GPU, AI part and memory"), and how many stories and steps you plan and why. The learner can ask for more or less. A complex device treated like a simple one is the most likely reason a learner feels the course is too thin.

## 7. Which devices fit
- Small boards (Pico, Arduino, ESP32): easy.
- Laptops, phones, robot vacuums: medium (teardown sources, many parts).
- Coffee and washing machines: harder (electronics with water, heat and motion).
- A bicycle (no electronics) or a whole car (too big) doesn't fit: say so kindly and suggest a part that does (a bike computer, a car's parking sensor).
- Closed devices are **look-only:** never give steps for opening anything that runs on wall power or holds a charge (TVs, chargers, coffee machines, batteries). Point to the maker's guide.
