import { app, BrowserWindow, ipcMain, shell, nativeImage } from 'electron';
import { autoUpdater } from 'electron-updater';
import serve from 'electron-serve';
import path from 'path';
import { spawn as ptySpawn } from 'node-pty';
import os from 'os';

const isProd = app.isPackaged;
const loadURL = serve({
  directory: 'out',
  scheme: 'app'
});

const setupDock = () => {
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = isProd 
      ? path.join(process.resourcesPath, 'icons', 'app.png')
      : path.join(app.getAppPath(), 'public', 'icons', 'app.png');
    
    try {
      const dockIcon = nativeImage.createFromPath(iconPath);
      if (!dockIcon.isEmpty()) {
        app.dock.setIcon(dockIcon);
      }
    } catch (error) {
    }

    app.dock.setBadge('');
  }
};

let mainWindow: BrowserWindow | null;
let isQuitting = false;

// PTY sessions 管理
const ptySessions = new Map<string, any>();

const createMainWindow = async (): Promise<BrowserWindow> => {
  const window = new BrowserWindow({
    width: 840,
    height: 630,
    maximizable: false,
    resizable: false,
    fullscreenable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  window.once('ready-to-show', () => {
    window.show();
  });

  window.on('close', (event) => {
    if (isQuitting) {
      return;
    }
    
    event.preventDefault();
    window.hide();
  });

  if (isProd) {
    await loadURL(window);
    await window.loadURL('app://-/home.html');
    window.setMenu(null);
  } else {
    await window.loadURL('http://localhost:3000/home');
  }

  return window;
};

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.allowPrerelease = false;
autoUpdater.allowDowngrade = false;

if (app.isPackaged) {
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'ExpTechTW',
    repo: 'EasySSH',
    vPrefixedTagName: false,
  });
}

autoUpdater.on('checking-for-update', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-checking');
  }
});

autoUpdater.on('update-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-download-progress', progressObj);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }

  setTimeout(() => {
    isQuitting = true;
    autoUpdater.quitAndInstall(true, true);
  }, 3000);
});

autoUpdater.on('error', (err) => {
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message);
  }
});

(async () => {
  await app.whenReady();

  setupDock();

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result?.updateInfo };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.on('install-update', () => {
    isQuitting = true;
    autoUpdater.quitAndInstall(true, true);
  });

  ipcMain.handle('open-external', async (_event, url: string) => {
    try {
      await shell.openExternal(url);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-audio-path', async (_event, audioFile: string) => {
    if (isProd) {
      return path.join(process.resourcesPath, 'audios', audioFile);
    } else {
      return path.join(app.getAppPath(), 'public', 'audios', audioFile);
    }
  });

  ipcMain.handle('set-dock-badge', async (_event, text: string) => {
    if (process.platform === 'darwin' && app.dock) {
      app.dock.setBadge(text);
      return { success: true };
    }
    return { success: false, error: 'Not on macOS' };
  });

  ipcMain.handle('clear-dock-badge', async () => {
    if (process.platform === 'darwin' && app.dock) {
      app.dock.setBadge('');
      return { success: true };
    }
    return { success: false, error: 'Not on macOS' };
  });

  ipcMain.handle('bounce-dock', async (_event, type: 'critical' | 'informational' = 'informational') => {
    if (process.platform === 'darwin' && app.dock) {
      app.dock.bounce(type);
      return { success: true };
    }
    return { success: false, error: 'Not on macOS' };
  });

  ipcMain.handle('quit-app', async () => {
    try {
      isQuitting = true;
      
      BrowserWindow.getAllWindows().forEach(window => {
        if (!window.isDestroyed()) {
          window.removeAllListeners();
        }
      });
      
      app.quit();
      return { success: true };
    } catch (error: any) {
      app.exit(0);
      return { success: true, message: 'Force quit' };
    }
  });

  ipcMain.handle('show-window', async () => {
    try {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        
        if (!mainWindow.isVisible()) {
          mainWindow.show();
        }
        
        mainWindow.focus();
        mainWindow.moveTop();
        mainWindow.setAlwaysOnTop(true);
        
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setAlwaysOnTop(false);
          }
        }, 100);
        
        return { success: true };
      } else {
        mainWindow = await createMainWindow();
        return { success: true, message: 'Window created' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  mainWindow = await createMainWindow();

  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch(() => {});
    setInterval(() => {
      autoUpdater.checkForUpdates().catch(() => {});
    }, 300000);
  }
})();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners();
  }
});

ipcMain.handle('force-quit', async () => {
  try {
    isQuitting = true;
    
    BrowserWindow.getAllWindows().forEach(window => {
      if (!window.isDestroyed()) {
        window.removeAllListeners();
        window.destroy();
      }
    });
    
    app.exit(0);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

app.on('activate', async () => {
  try {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = await createMainWindow();
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }

      mainWindow.focus();
      mainWindow.moveTop();
    } else {
      mainWindow = await createMainWindow();
    }
  } catch (error) {
    try {
      mainWindow = await createMainWindow();
    } catch (createError) {
    }
  }
});

// 創建本地終端 session
ipcMain.on('terminal-create', (event, { sessionId }) => {
  // 如果 session 已存在，先關閉它
  if (ptySessions.has(sessionId)) {
    const pty = ptySessions.get(sessionId);
    pty.kill();
    ptySessions.delete(sessionId);
  }

  // 根據平台選擇 shell
  const shell = os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash';

  // 創建 PTY 進程
  const ptyProcess = ptySpawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || process.cwd(),
    env: process.env as any,
  });

  ptySessions.set(sessionId, ptyProcess);

  // 監聽 PTY 輸出
  ptyProcess.onData((data) => {
    event.sender.send('terminal-output', {
      sessionId,
      data,
    });
  });

  // 監聽 PTY 退出
  ptyProcess.onExit(({ exitCode }) => {
    ptySessions.delete(sessionId);
    event.sender.send('terminal-exit', {
      sessionId,
      exitCode,
    });
  });
});

// 處理終端輸入
ipcMain.on('terminal-input', (_event, { sessionId, data }) => {
  const pty = ptySessions.get(sessionId);
  if (pty) {
    pty.write(data);
  }
});

// 處理終端大小調整
ipcMain.on('terminal-resize', (_event, { sessionId, cols, rows }) => {
  const pty = ptySessions.get(sessionId);
  if (pty) {
    pty.resize(cols, rows);
  }
});

// 關閉終端 session
ipcMain.on('terminal-destroy', (_event, { sessionId }) => {
  const pty = ptySessions.get(sessionId);
  if (pty) {
    pty.kill();
    ptySessions.delete(sessionId);
  }
});
