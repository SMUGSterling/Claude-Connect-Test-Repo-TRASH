const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ram', {
  onSample: (callback) => ipcRenderer.on('memory:sample', (_event, sample) => callback(sample)),
  optimize: () => ipcRenderer.invoke('memory:optimize'),
  close: () => ipcRenderer.send('window:close'),
});
