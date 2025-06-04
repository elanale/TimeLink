// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow = null;
let updateWindow = null;

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

  // 1. Configure update URL based on GitHub Releases
  autoUpdater.autoDownload = false; // we’ll start download manually once update is found

  // 2. Check for updates right away
  autoUpdater.checkForUpdates();

  // 3. Listen for “update-available”
  autoUpdater.on('update-available', (info) => {
    // send a message to the updateWindow renderer to show “Download Available”
    if (updateWindow) {
      updateWindow.webContents.send('update_available', info);
    }
    // start download
    autoUpdater.downloadUpdate();
  });

  // 4. Update download progress
  autoUpdater.on('download-progress', (progressObj) => {
    if (updateWindow) {
      updateWindow.webContents.send('download_progress', progressObj);
    }
  });

  // 5. Once update is downloaded, tell the updater window to show “Restart to install”
  autoUpdater.on('update-downloaded', () => {
    if (updateWindow) {
      updateWindow.webContents.send('update_downloaded');
    }
  });

  // 6. If no update is found, or after “checking” is done, just open main window
  autoUpdater.on('update-not-available', () => {
    // small delay so splash doesn’t flicker too quickly
    setTimeout(() => {
      createMainWindow();
    }, 500);
  });

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err);
    // proceed to main window on error
    setTimeout(() => {
      createMainWindow();
    }, 500);
  });
});

// Handle user action from updateWindow (renderer) to restart and install
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

// If you want to allow skipping updates, e.g. on “Remind me later” button:
ipcMain.on('skip_update', () => {
  createMainWindow();
});
