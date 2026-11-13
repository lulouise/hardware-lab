---
name: hardware-lab
description: Build an interactive visual course (one web page, English and/or Chinese) that teaches a complete beginner what a piece of hardware is and how it works, from the outside to the inside, part by part, how the parts connect, how signals travel, and a first project toward the learner's own goal. Use this whenever someone wants to learn or understand a device, board or gadget (a Raspberry Pi Pico, an Arduino, an ESP32, a robot vacuum, a sensor kit…), says they know nothing about electronics but want to, asks "how does this thing work inside?", wants a beginner lesson, tutorial or course about hardware, or shares a product link or photo and wants to understand it, even if they never say "course".
license: MIT
metadata:
  version: "1.0.0"
---

# Hardware course for complete beginners

You turn one piece of hardware into a visual course that someone who knows nothing (not "chip", not "voltage", not "signal") can follow. The result is one HTML page with a 3D model, labelled drawings, hands-on demos, a road map of how the parts connect, step-by-step signal stories and a small project, in the learner's language(s).

The method was developed with a real beginner over many review rounds. Most rules below exist because something confused them; the reason is given so you can apply the idea, not just the wording.

## How the work runs

Work in stages and let the learner review each one in the browser before building the next. Building six chapters and then discovering the wrong model, the wrong goal or a wrong fact wastes everything after it.

1. **Intake.** Find out what the thing is, what the learner knows, why they're learning, and which languages the page should use (usually the one they write in; say your choice in the outline so they can change it). → `references/intake-and-outline.md`
2. **Research.** Official sources first; write a fact sheet with a confidence level on every fact before drawing anything. → `references/research.md`
3. **Outline** → **review stop 1.** Sources, fact sheet, your assumptions about the learner, exact model or general version, the part that matters most and how deep to go into it, and the six-chapter outline (with each chapter 5 story and the chapter 6 project).
4. **Chapters 1–2** (outside, inside) → **review stop 2.**
5. **Chapters 3–4** (one station per part, the road map) → **review stop 3.**
6. **Chapters 5–6** (signal stories, a project toward their goal) → **review stop 4.**
7. **Hand-over.** Give the page (publish it as a private link if you can; otherwise give the HTML file). With the learner's OK, update their learner record.

The four stops are the default. If the learner says "just build it all", build all six chapters, run the full check, and review once at the end.

At every stop: run the check (below) first, show the learner, and ask which sentences read badly in each language. Their answers are the most valuable feedback you'll get.

## What the course contains

Six chapters (details for each: `references/chapters.md`):

| # | Chapter | In short |
|---|---|---|
| 1 | Outside | Opens on the **3D view** with every part labelled. A **Big picture** tab shows a small 3D scene of the device among what it works with, and answers what it is, what it's for and what it can't do alone |
| 2 | Inside | Up to three views: the 3D view with parts spread apart, where the parts sit, and one more if needed (e.g. what each pin does) |
| 3 | What each part does | One hands-on station per part, starting from the real part. The part that matters most is opened up in several stations |
| 4 | How they connect | A road map around the brain: road types in families, why each road |
| 5 | Follow a signal | Short stories walked step by step on the road map; how many depends on the device and the goal |
| 6 | Toward your goal | A small project in ordered steps (for a finished device: setting it up and using it): who does what, what you need, how to connect it, what next |

Chapters 1–4 depend only on the device; the learner's goal shapes chapters 5–6. Every chapter ends with a short quiz.

## Principles that matter most

These come from the learner's corrections. Fuller lists: `references/writing.md` and `references/design.md`.

- **Explain every word where it's used.** There's no reading order: any card can be the first one opened, so each card explains its own words (volt, kB, mA…).
- **The real part first, the comparison second.** Say what the thing is and point to it ("the storage chip, the small chip above the brain"), then help with a comparison ("like a bookshelf"). A comparison that becomes the title leaves people unsure what is actually being described.
- **Say what's general and what's this device only.** Beginners assume every number applies to everything. Each station says whether other boards work the same way (3.3 V is the Pico's; an Arduino Uno uses 5 V).
- **The picture must match the real device.** People remember the picture, not the note beside it. Two workers drawn for a 10-core chip mislead, even with "it really has 10" written next to them. Every number in a demo comes from the fact sheet, and a shared demo is never reused unchanged.
- **Depth follows the device.** A simple board and a whole computer don't get the same treatment. The part that matters most gets opened up in its own stations, not a longer note: a learner told us "if the chip is the most important thing, open it up and show it".
- **Show the whole path and a real use.** A demo shows the device, where the signal comes from and goes to (electricity always goes out and back), and what you'd use it for.
- **A bare board needs its companions.** If the device is a board, the computer, battery, sensors and motors it works with are parts too, with their own cards, drawn dashed, marked "you add this".
- **Never invent.** No guessed pin maps, part names or numbers. Unknowns say so on the page; approximations are marked.
- **Write each language natively.** Write from the meaning in each language; never translate sentence by sentence. Chinese guide: `references/zh-style.md`.
- **The learner's own record may personalise their own course** (compare with a device they own); nothing from one learner's record goes into this skill or into anyone else's course.

## Building

Build with the kit in `kit/`: you write four course files (facts, parts, 3D model, chapters) and the kit supplies the page frame, 3D viewer, labels, maps, demos, road map, story player, quiz and language switch, with the behaviour rules already built in. `python3 kit/build.py <course-folder>` makes the page. Read `references/building.md` before writing any course file. Two complete worked examples: `examples/pico-course/` (a bare board with a build project) and `examples/mac-mini-course/` (a closed device, with a chip deep dive and a set-up project). Start from the one closer to your device, but don't copy its shape: the numbers of stations, stories and steps come from your device.

## The check before every review stop

Learners notice visual polish first: overflow, crowding and sizes that jump between chapters read as "rough" more than a missing fact does, and every build so far had some. So this check is required, with a tool, before the learner sees anything:

1. **Run the layout check** at 1280×800, at phone width (375) and once at 1920×1080: `python3 kit/build.py --check <course-folder>`, open the `.check.html` file, run `await layoutCheck()`. It walks every view, demo state, road and step in both languages. It also fails on a script error, so it catches broken demos. Fix what it lists until it's clean, or say at the review stop what's left and why.
2. **Then look yourself**, because the tool can't see everything: 3D labels, lines crossing shapes inside a drawing, and whether the 3D view turns to a part picked from the list.
3. **Read for sense:** numbers that disagree with the fact sheet, a demo picture that doesn't match the real device, a word used before it's explained, one thing named two ways, demos whose motion disagrees with their words, any rule in `references/design.md` broken.

No console errors. Fix, then show the learner. How to test in a browser: `references/building.md`.

## Not in this version

Courses built from an article or a question, very abstract topics (chip design, power grids), videos, and courses made by a teacher or parent for someone else. Say so if asked, and offer the device course instead where it fits.
