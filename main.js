// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow = null;
let updateWindow = null;

// Point to your GitHub repo’s Releases so electron-updater can fetch updates
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'elanale',
  repo: 'TimeLink',
  private: false
});

// Automatically download as soon as an update is found
autoUpdater.autoDownload = true;
autoUpdater.allowPrerelease = false;

function createUpdateWindow() {
  updateWindow = new BrowserWindow({
    width: 400,
    height: 200,
    frame: false,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  updateWindow.loadFile(path.join(__dirname, 'update.html'));
  updateWindow.once('ready-to-show', () => {
    updateWindow.show();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (updateWindow) {
      updateWindow.close();
      updateWindow = null;
    }
  });
}

app.on('ready', () => {
  createUpdateWindow();

  // Start checking for updates immediately
  autoUpdater.checkForUpdates();
});

// Event: searching for update
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
  if (updateWindow) {
    updateWindow.webContents.send('checking_for_update');
  }
});

// Event: found update, will download automatically (autoDownload = true)
autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  if (updateWindow) {
    updateWindow.webContents.send('update_available', info);
  }
  // No need to call downloadUpdate(), because autoDownload is true
});

// Event: no update found
autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info.version);
  if (updateWindow) {
    updateWindow.webContents.send('update_not_available');
  } else {
    createMainWindow();
  }
});

// Event: error during checking/downloading
autoUpdater.on('error', (err) => {
  console.error('AutoUpdater error:', err);
  if (updateWindow) {
    updateWindow.webContents.send('update_error', err == null ? '' : err.toString());
  } else {
    createMainWindow();
  }
});

// Event: download progress
autoUpdater.on('download-progress', (progressObj) => {
  if (updateWindow) {
    updateWindow.webContents.send('download_progress', progressObj);
  }
});

// Event: update is downloaded and ready to install
autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  if (updateWindow) {
    updateWindow.webContents.send('update_downloaded');
  }
  // Immediately quit and install (no prompt)
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 500); // give UI half a second to show “Installing…”
});

// If update fails or user has no update, the renderer sends this message to open the main window
ipcMain.on('launch_main', () => {
  if (!mainWindow) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});