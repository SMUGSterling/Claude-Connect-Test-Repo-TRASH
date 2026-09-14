# The Passive-Aggressive RAM Monitor (PARM)

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

- **Main process** sums `app.getAppMetrics()` across every Electron process once a second and pushes the total to the renderer over IPC. The number is real: main, renderer, GPU, utility processes, and the optimizer if you've launched it.
- **Renderer** draws the dial, colors it by severity (green → amber → red), and rotates the commentary on a timer.
- **"Optimize Memory"** spawns `src/hog.js` via `process.execPath` with `ELECTRON_RUN_AS_NODE=1`, so a packaged build doesn't need Node on `PATH`. The child allocates roughly the app's current footprint in 32 MB buffers, reports its own RSS back over stdout, and the button becomes `Oops.`
- **The optimizer dirties one byte per 4 KB page** every half second. Untouched anonymous pages get reclaimed or swapped under memory pressure, and a memory hog whose memory usage drifts back down isn't much of a memory hog.

Measured behavior: ~440 MB at rest, ~980 MB after one click, and it stays there.

## Tech stack

- [Electron](https://www.electronjs.org/) 38
- Vanilla HTML/CSS/JS. No framework — it's a dial and some insults.

## Getting started

For development (runs from source, requires Node):

```bash
npm install
npm start
```

### Building a standalone app

To get a real double-click-able app that doesn't need Node or `npm` to run:

```bash
npm install
npm run dist
```

This produces `dist/Passive-Aggressive RAM Monitor-1.0.0.AppImage` — a single self-contained executable for Linux. Make it executable and run it directly:

```bash
chmod +x "dist/Passive-Aggressive RAM Monitor-1.0.0.AppImage"
"dist/Passive-Aggressive RAM Monitor-1.0.0.AppImage"
```

AppImages need FUSE to run in place (most desktop Linux installs already have it: `sudo apt install libfuse2` on Debian/Ubuntu if not). No FUSE, or running inside a minimal container? Extract and run instead:

```bash
"dist/Passive-Aggressive RAM Monitor-1.0.0.AppImage" --appimage-extract
./squashfs-root/passive-aggressive-ram-monitor
```

If your environment also lacks a working sandbox (a `chrome-sandbox` permission error), append `--no-sandbox` to either run command above.

## Project structure

```
src/
  main.js              window, memory sampling, IPC, child process
  preload.js           contextBridge surface (no node in the renderer)
  hog.js               the "optimizer"
  renderer/
    index.html
    styles.css
    renderer.js        dial rendering + message rotation
```

## License

MIT. See [LICENSE](LICENSE).
