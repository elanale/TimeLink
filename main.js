// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow = null;
let updateWindow = null;

// Configure the update server URL to point to your GitHub releases
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'elanale',
  repo: 'TimeLink',
  private: false
});

// Optional: Configure update behavior
autoUpdater.autoDownload = false; // We'll start download manually
autoUpdater.allowPrerelease = false; // Set to true if you want to include pre-releases

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
  
  // Check for updates
  autoUpdater.checkForUpdates();
});

// Auto-updater event handlers
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
  if (updateWindow) {
    updateWindow.webContents.send('checking_for_update');
  }
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
  if (updateWindow) {
    updateWindow.webContents.send('update_available', info);
  }
  // Start download
  autoUpdater.downloadUpdate();
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
  if (updateWindow) {
    updateWindow.webContents.send('update_not_available');
  }
  // Proceed to main window after a brief delay
  setTimeout(() => {
    createMainWindow();
  }, 1000);
});

autoUpdater.on('error', (err) => {
  console.error('AutoUpdater error:', err);
  if (updateWindow) {
    updateWindow.webContents.send('update_error', err.message);
  }
  // Proceed to main window on error
  setTimeout(() => {
    createMainWindow();
  }, 2000);
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log('Download progress:', progressObj.percent);
  if (updateWindow) {
    updateWindow.webContents.send('download_progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);
  if (updateWindow) {
    updateWindow.webContents.send('update_downloaded');
  }
});

// IPC handlers
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('skip_update', () => {
  createMainWindow();
});

// Handle app window events
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