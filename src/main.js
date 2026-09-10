const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('node:child_process');
const path = require('node:path');
const readline = require('node:readline');

const SAMPLE_INTERVAL_MS = 1000;

let win = null;
let hog = null;
let hogBytes = 0;

function electronBytes() {
  return app
    .getAppMetrics()
    .reduce((total, metric) => total + metric.memory.workingSetSize * 1024, 0);
}

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 490,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    backgroundColor: '#12141a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  const timer = setInterval(() => {
    win.webContents.send('memory:sample', { bytes: electronBytes() + hogBytes });
  }, SAMPLE_INTERVAL_MS);

  win.on('closed', () => {
    clearInterval(timer);
    win = null;
  });
}

// Runs the "optimizer" through Electron's own binary as plain Node, so a
// packaged build doesn't need Node on PATH.
function startHog(targetBytes) {
  hog = spawn(process.execPath, [path.join(__dirname, 'hog.js'), String(targetBytes)], {
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  readline.createInterface({ input: hog.stdout }).on('line', (line) => {
    hogBytes = Number(line);
  });
}

ipcMain.handle('memory:optimize', () => {
  if (hog) return;
  startHog(electronBytes());
});

ipcMain.on('window:close', () => app.quit());

app.whenReady().then(createWindow);

app.on('window-all-closed', () => app.quit());

app.on('before-quit', () => hog?.kill());
