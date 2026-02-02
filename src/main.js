const { app, BrowserWindow, shell, protocol } = require('electron');
const path = require('path');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'toolbox',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('toolbox://')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('toolbox://')) return;
    event.preventDefault();
    shell.openExternal(url);
  });

  win.loadURL('toolbox://app/index.html');
  return win;
}

app.whenReady().then(() => {
  const webRoot = path.join(app.getAppPath(), 'app', 'web');

  protocol.registerFileProtocol('toolbox', (request, callback) => {
    try {
      const u = new URL(request.url);
      let rel = decodeURIComponent(u.pathname || '/');
      if (rel === '/' || rel === '') rel = '/index.html';
      rel = rel.replace(/\\/g, '/');
      rel = path.posix.normalize(rel);
      if (rel.startsWith('..')) rel = '/index.html';
      const filePath = path.join(webRoot, rel);
      callback({ path: filePath });
    } catch (e) {
      callback({ path: path.join(webRoot, 'index.html') });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
