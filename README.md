# The Passive-Aggressive RAM Monitor

An Electron app that monitors its own RAM usage and judges you for it.

It's a small system-tray-style dashboard that watches its own memory footprint, comments on it with escalating passive-aggression, and offers a big red "fix" button that makes everything worse.

## Features

- **Live memory dial** — displays `Memory Consumed by This Exact Window: 412 MB`, updating in real time from the process's own memory usage.
- **Rotating passive-aggressive commentary** — a status line that cycles through insults every few seconds, e.g.:
  - "I am literally rendering two sentences and taking up half a gigabyte."
  - "Your fans are spinning because of me. Was this worth it?"
  - "Close your 48 browser tabs first before you judge me."
- **"Optimize Memory" button** — a big red button that, when clicked, spawns a hidden background child process which immediately *doubles* the app's RAM usage, then changes the button text to `Oops.`

## How it works

- **Main process** polls `process.memoryUsage()` (and/or `process.getProcessMemoryInfo()`) on an interval and pushes readings to the renderer over IPC.
- **Renderer** draws the live dial and cycles the insult copy on a timer.
- **"Optimize Memory"** triggers `child_process.spawn()` on a detached background script that allocates and holds a large memory buffer, deliberately inflating reported usage — then flips the button label to `Oops.`

## Tech stack

- [Electron](https://www.electronjs.org/)
- Vanilla HTML/CSS/JS (no framework needed for a dial and some snark)

## Getting started

```bash
npm install
npm start
```

## Project status

Concept / early scaffold. The joke works best if the app is exactly as bloated as it claims to be.

## License

See [LICENSE](LICENSE).
