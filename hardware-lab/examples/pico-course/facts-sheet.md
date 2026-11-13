# Fact sheet: Raspberry Pi Pico (test 1, review stop 1)

Model covered: **Raspberry Pi Pico (the original, with the RP2040 chip, no wireless)**, unless the learner says they have a different one (see "Family" below).

Confidence: **confirmed** = stated by Raspberry Pi; **likely** = matches the official photo and other facts, but not stated in words; **unknown** = not found, and the page will say so.

## Sources (official first)
- [D] Raspberry Pi Pico datasheet (RP-008307-DS-2), Raspberry Pi Ltd: https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf (text and the two board photos, Figure 1)
- [W] Raspberry Pi documentation, "Pico-series microcontrollers": https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html
- [R] RP2040 datasheet (for the chip itself): https://datasheets.raspberrypi.com/rp2040/rp2040-datasheet.pdf (headline numbers are repeated in [D])

## Family (decide with the learner)
| Fact | Level | Source |
|---|---|---|
| The family has 8 boards: Pico, Pico H, Pico W, Pico WH, Pico 2, Pico 2 with headers, Pico 2 W, Pico 2 W with headers | confirmed | W |
| "H" = pins already soldered on; "W" = adds Wi-Fi and Bluetooth (Infineon CYW43439 chip and an antenna) | confirmed | W |
| Pico 2 uses the RP2350 chip (up to 150 MHz, 520 kB working memory, 4 MB storage); Pico uses the RP2040 | confirmed | W |
| All of them share the same size, the same 40-pin layout and a micro-USB port | confirmed | W |

## Outside
| Fact | Level | Source |
|---|---|---|
| Board is 51 × 21 mm and 1 mm thick | confirmed | D §2 |
| All parts sit on one side ("single sided") | confirmed | D §2 |
| Micro-USB port overhangs the top edge | confirmed | D §2 |
| 40 pins along the two long edges, 2.54 mm (0.1 inch) apart, as holes and half-holes ("castellations") so it can go in a breadboard or be soldered flat | confirmed | D §1, §2 |
| 4 mounting holes, 2.1 mm wide | confirmed | D §2 |
| 3 debug pads on the short bottom edge: SWDIO, GND, SWCLK | confirmed | D §1, back photo |
| One button, BOOTSEL, top left, under the LED | confirmed | D photo, W |
| One LED, top left, next to the USB port, on GP25 | confirmed | D photo, D §2 |
| LED colour | unknown (not stated in the datasheet text; page uses a neutral glow) | — |
| Height of the USB port and button above the board | unknown (3D shape will say "approximate shape") | — |
| No screen, no speaker, no battery, no case | confirmed (none in the parts list or photos) | D |
| 6 test pads on the back (TP1–TP6): USB signals, ground, power-save, LED, BOOTSEL | confirmed | D §2 |

## Pin map (the official one is printed on the back of the board)
| Fact | Level | Source |
|---|---|---|
| Pin 1 is top left (front view), numbering goes down the left side (1–20) and up the right side (21–40) | confirmed | D photo ("1", "2", "39" printed), D Fig 4 |
| Left side, top to bottom: GP0, GP1, GND, GP2, GP3, GP4, GP5, GND, GP6, GP7, GP8, GP9, GND, GP10, GP11, GP12, GP13, GND, GP14, GP15 | confirmed | D back photo |
| Right side, top to bottom: VBUS, VSYS, GND, 3V3_EN, 3V3, ADC_VREF, GP28, AGND, GP27, GP26, RUN, GP22, GND, GP21, GP20, GP19, GP18, GND, GP17, GP16 | confirmed | D back photo, D §2 (pin 30 RUN, 33 AGND, 35–40) |
| 26 general pins (GP), 8 ground pins (one is AGND), 6 power/control pins | confirmed | D §1, §2 |
| GP26, GP27, GP28 can also measure a voltage (analog inputs A0–A2) | confirmed | D §4.2 |
| All signal pins work at 3.3 V | confirmed | D §4.2 |

## Inside (on the board)
| Part | Facts | Level | Source |
|---|---|---|---|
| Brain: RP2040 | 2 cores, up to 133 MHz, 264 kB working memory (SRAM); 7 × 7 mm square chip in the middle | confirmed (size from R; photo measures 7.1 mm) | D §1, R, photo |
| Storage: Winbond W25Q16JV | 2 MB flash memory that keeps your program when power is off | confirmed (name, size) | D §1 |
| Which chip in the photo is the storage chip | the small black chip left of centre, above the brain | likely | D photo (only remaining 8-pad chip) |
| Clock: 12 MHz crystal (Abracon ABM8-272-T3) | the silver part below the brain, marked "12.0" | confirmed (part, 12 MHz from marking); position likely | D §1, photo |
| Power converter: Richtek RT6150 (buck-boost) | turns 1.8–5.5 V into a steady 3.3 V | confirmed | D §4.4 |
| Which parts in the photo are the converter | top right: a small black chip plus a larger dark square (the coil, "inductor") | likely | D photo |
| One-way valve for power: Schottky diode D1 | lets USB power in to VSYS, not back out | confirmed (exists); position (top right, under pin 39) likely | D §4.4, photo |
| Internal temperature sensor | inside the RP2040 | confirmed | R; D §4.3 mentions the "temperature sense diode" |
| Built-in sensors besides that | none | confirmed (none listed) | D |
| Small parts (resistors, capacitors) | many tiny parts; grouped as "small helper parts" | confirmed | D photo |
| Four brain pins used inside the board: GP23 (power-save), GP24 (is USB plugged in?), GP25 (LED), GP29 (measures the supply voltage) | confirmed | D §2 |

## Power
| Fact | Level | Source |
|---|---|---|
| USB gives 5 V (VBUS) | confirmed | D §2 |
| VSYS accepts 1.8 V to 5.5 V (for example a single lithium cell or 3 AA cells) | confirmed | D §2, §1 |
| 3V3 pin can power add-ons; keep it under 300 mA | confirmed | D §2 |
| Works from −20 °C to 85 °C | confirmed | D §2.3 |

## Numbers model (one source for every number on the page)
Board 51 × 21 × 1 mm. Pin rows 17.78 mm apart (D: "one 0.1″ pitch wider than a standard 40-pin DIP"), pins 2.54 mm apart, first pin 1.37 mm from the top edge (centred). Screw holes at about (4.7, 2.0) and (16.3, 49.0) mm (measured). Scale from the official photo: the opaque board is 634 px wide = 21 mm. The page code keeps all of these in one `LAYOUT` table. Part positions are measured from the official front photo (≈ 30.2 px per mm at the photo's 800 px width) and are **approximate** (± 1 mm). Heights of parts above the board are **approximate shape**.

## Unknowns the page will say out loud
- Exact heights of the USB port, button and chips (shape is approximate).
- Exact placement of the small parts (drawn as a group, not one by one).

## Added for chapters 3–4 (Oct 30, 2026)
| Fact | Level | Source |
|---|---|---|
| The 2 MB storage chip is a QSPI flash: it talks to the brain over a fast 4-data-wire link | confirmed | D §4.1 ("2 MB QSPI Flash") |
| The brain has a PLL that speeds the 12 MHz crystal beat up to its own speed ("variable core frequency") | confirmed | D §1 |
| New-program mode: power off, hold BOOTSEL while plugging in; the Pico appears as a USB drive; drop a .uf2 file on it and it restarts with the new program | confirmed | D §4.1 |
| The USB start-up code lives in ROM inside the RP2040, so it can't be overwritten by accident | confirmed | D §4.1 |
| USB 5 V (VBUS) goes through the diode D1 to VSYS; VSYS feeds the RT6150, which makes 3.3 V for the brain and its pins | confirmed | D §4.4 |
| GP24 tells the brain whether USB power is plugged in; GP23 sets the converter's power-save mode; GP29 measures VSYS ÷ 3 (a rough battery gauge) | confirmed | D §2, §4.4 |
| The measuring part (ADC) is 12-bit, measures 0–3.3 V, 500 thousand readings a second | confirmed | D §1, §4.3 |
| The brain's thermometer is read by the same measuring part (its own input, not on a pin) | confirmed | R §4.9 (ADC inputs: 4 pins + temperature sensor) |
| SWD debug port: 3 pads (SWDIO, GND, SWCLK); can load and run code and pause it to look inside | confirmed | D §1, §4.8 |
| The Pico has no radio; the Pico W adds Wi-Fi and Bluetooth | confirmed | W |
| The brain can hold a signal pin at 0 by itself when nothing drives it (a built-in pull-down the program switches on) | confirmed | R §2.19 (GPIO pads: programmable pull-up and pull-down) |

## Comparisons used in "Same on other boards?" (Nov 4, 2026)
| Fact | Level | Source |
|---|---|---|
| The Arduino Uno works at 5 V; its measuring pins count 0 to 1023 over 0–5 V (10-bit) | confirmed | Arduino Uno Rev3 docs, analogRead() reference (arduino.cc) |
| Many small boards have one core (e.g. Arduino Uno's ATmega328P) | confirmed | Arduino Uno Rev3 docs |
| Pico 2 has a faster chip (RP2350, up to 150 MHz) | confirmed | W |

---

# Chapter outline (for approval)

The Pico is a bare board: no case, no screen, no battery. So "outside" and "inside" are the same object. Proposed split:

1. **Outside: the board and its edges.** 3D board you can turn and zoom. Labels with friendly names: the cable door (USB port), the start-over button (BOOTSEL), the little light (LED), the brain, the 40 legs (pins), the helper pads (debug), the screw holes. Flip it over: the pin names are printed on the back. "Approximate shape" note for heights.
2. **Inside: what sits on the board.** The parts lift off the green board in 3D (spread slider), plus a flat map of the board: where each part sits, and the 40 pins coloured by job (power orange, ground grey, signal pins magenta, the 3 measuring pins blue).
3. **What each part does:** about 10 stations: brain, storage, clock, power converter, cable door, start-over button, little light, signal pins, measuring pins, the brain's own thermometer.
4. **How they connect:** energy roads (USB → one-way valve → converter → 3.3 V), information wires (brain ↔ storage, clock → brain, brain → light, pins), no "through the air" family on this model.
5. **Follow a signal (toward robotics):** load a new program; blink the light; read a sensor on a measuring pin; run it on batteries.
6. **Add a muscle:** the Pico as the brain of a small robot part, for example a servo that turns toward light (sensor and servo are added; shopping list marked approximate).

Things the Pico **cannot** do alone (said in chapter 1): it has no screen, no speaker, no battery and almost no senses. That is why it is a good robot brain: you choose what to add.

## Added for chapters 5–6 (Nov 4, 2026)
| Fact | Level | Source |
|---|---|---|
| The RP2040 has 16 PWM channels (pins that send repeating pulses of a chosen width) | confirmed | D §1 |
| A hobby servo (e.g. TowerPro SG90) has 3 wires: power, ground, signal; the signal is a pulse every 20 ms (50 Hz) | likely (consistent across makers' listings and guides; no primary TowerPro PDF found) | SG90 datasheet copy (ee.ic.ac.uk), components101.com |
| The pulse's width sets the angle: about 0.5 ms → one end, about 2.4 ms → the other end (about 180°); exact limits vary by servo | approximate (varies) | SG90 listings; Random Nerd Tutorials, SunFounder Pico guides |
| SG90 runs on about 4.8–6 V, so it's usually powered from 5 V (VBUS from USB), not the Pico's 3V3; grounds are shared | approximate (varies) | SG90 listings; Pico guides |
| A light sensor (photoresistor) with a fixed resistor gives a voltage that changes with light; a measuring pin reads it as 0–4095 | likely (standard circuit) | Pico datasheet §4.3 for the reading; general electronics |
