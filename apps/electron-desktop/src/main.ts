import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Simple Electron App with Canvas System
 */
class ElectronCanvasHost {
  private canvas: any = null;
  private mainWindow: BrowserWindow | null = null;
  private isDev: boolean = process.env.NODE_ENV === 'development';
  private appDataPath: string = app.getPath('userData');
  private stateFile: string = path.join(app.getPath('userData'), 'canvas-state.json');
  private autoSaveInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupPaths();
    this.setupIPC();
    this.setupErrorHandling();
  }

  private setupPaths(): void {
    if (!fs.existsSync(this.appDataPath)) {
      fs.mkdirSync(this.appDataPath, { recursive: true });
    }
  }

  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`);
  }

  private setupErrorHandling(): void {
    process.on('uncaughtException', (error) => {
      this.log('ERROR', error.message);
      dialog.showErrorBox('Error', error.message);
    });
  }

  private setupIPC(): void {
    // Canvas operations
    ipcMain.handle('canvas:create-node', async (_, args) => {
      try {
        this.log('INFO', `Creating node: ${args.nodeId}`);
        return { id: args.nodeId, type: args.type, config: args.config };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:get-nodes', async () => {
      try {
        return [];
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:delete-node', async (_, nodeId) => {
      try {
        this.log('INFO', `Deleting node: ${nodeId}`);
        return { success: true };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:get-links', async () => {
      try {
        return [];
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:get-state', async () => {
      try {
        if (fs.existsSync(this.stateFile)) {
          const content = fs.readFileSync(this.stateFile, 'utf-8');
          return JSON.parse(content);
        }
        return { nodes: [], links: [] };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:save-state', async (_, metadata) => {
      try {
        const state = { nodes: [], links: [], metadata, timestamp: Date.now() };
        fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
        this.log('INFO', 'State saved');
        return state;
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('app:get-version', async () => {
      return app.getVersion();
    });

    ipcMain.handle('app:get-config', async () => {
      return { isDev: this.isDev, appDataPath: this.appDataPath };
    });

    ipcMain.handle('app:quit', async () => {
      app.quit();
    });

    ipcMain.handle('app:minimize', async () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('app:maximize', async () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('app:close', async () => {
      this.mainWindow?.close();
    });
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
      show: false,
    });

    const url = this.isDev
      ? 'http://localhost:4001'  // React dev server (auto-assigns port)
      : `file://${path.join(__dirname, '../renderer/dist/index.html')}`;

    this.mainWindow.loadURL(url);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.log('INFO', 'Window ready');
    });

    if (this.isDev) {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupAutoSave(): void {
    const INTERVAL = 30000;
    this.autoSaveInterval = setInterval(() => {
      this.log('INFO', 'Auto-save check');
    }, INTERVAL);
  }

  private setupMenu(): void {
    const template: any[] = [
      {
        label: 'File',
        submenu: [{ label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'toggleDevTools' },
        ],
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  start(): void {
    this.log('INFO', '=== APP START ===');

    app.on('ready', () => {
      this.setupAutoSave();
      this.setupMenu();
      this.createWindow();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });

    app.on('before-quit', () => {
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
      }
      this.log('INFO', 'Shutting down...');
    });
  }
}

const host = new ElectronCanvasHost();
host.start();
