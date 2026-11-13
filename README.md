# hardware-lab

**English** · [中文](README.zh.md)

A skill for Claude that turns one piece of hardware into a visual course for a complete beginner.

You name a device (a Raspberry Pi Pico, an ESP32 board, a robot vacuum, a Mac mini…). Claude researches it, checks the plan with you, and builds one web page you can click through, in English, Chinese or both.

## What a course contains

| # | Chapter | What you see |
|---|---|---|
| 1 | Outside | A 3D model with every part labelled, and what the device is for |
| 2 | Inside | The parts spread apart, and where each one sits |
| 3 | What each part does | One hands-on demo per part |
| 4 | How they connect | A road map of the connections around the main chip |
| 5 | Follow a signal | Short stories walked step by step on that map |
| 6 | Toward your goal | A small first project that fits why you are learning |

Every chapter ends with a short quiz. Every word is explained where it is used, so no background in electronics is needed.

## What you need

- [Claude Code](https://claude.com/claude-code) (the desktop app or the command line).
- Python 3. It runs the small script that puts the page together.
- A web browser, and an internet connection when you open a course: the 3D view loads the Three.js library from a public CDN.

## Install

```bash
git clone https://github.com/lulouise/hardware-lab.git
```

```bash
mkdir -p ~/.claude/skills && cp -R hardware-lab/hardware-lab ~/.claude/skills/
```

Start a new Claude Code session afterwards so it picks the skill up.

## Use

Tell Claude what you want to understand, in your own words:

> I just bought a Raspberry Pi Pico and I know nothing about electronics. Teach me what is on this board and how it works.

Claude works in stages and stops four times for you to look at the page in your browser: after the plan, after chapters 1–2, after 3–4 and after 5–6. Say "just build it all" to review once at the end. A full course takes a few hours of back and forth.

## Examples

Two finished courses are included as course files, in `hardware-lab/examples/`:

- `pico-course`: a bare board (Raspberry Pi Pico) with a build project.
- `mac-mini-course`: a closed device (Mac mini M4) with a deep look at its chip.

To build one into a page:

```bash
python3 hardware-lab/kit/build.py hardware-lab/examples/pico-course
```

## Limits in this version

- English and Chinese only. The page's built-in text exists in these two languages.
- On a phone, wide road maps do not fit the screen: you drag them.
- Not covered: courses built from an article or a question, very abstract topics (chip design, power grids), videos, and courses a teacher or parent makes for someone else.
- Facts come from Claude's research at the time, with sources and a confidence level listed in the course. Check anything important against the maker's own documents before you wire or buy something.

## What is in this repository

| Path | What it is |
|---|---|
| `hardware-lab/SKILL.md` | The instructions Claude follows |
| `hardware-lab/references/` | Detailed rules: research, chapters, design, writing, Chinese style |
| `hardware-lab/kit/` | Shared page code and the build script |
| `hardware-lab/examples/` | The two example courses |
| `hardware-lab/assets/` | The template for a learner's record |

## Feedback

Open an issue on GitHub if a course shows something wrong or confusing. Notes on which sentence or picture confused you are the most useful kind.

## Licence

MIT. See [LICENSE](LICENSE). Device names belong to their makers; this project is not connected to any of them.
