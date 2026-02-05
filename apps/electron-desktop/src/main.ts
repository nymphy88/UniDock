import { app, BrowserWindow, ipcMain, Menu, dialog, ipcRenderer } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { CanvasOrchestrator } from 'node-canvas-system';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * ============================================
 * ElectronCanvasHost - Production Edition
 * ============================================
 * 
 * Features:
 * ✅ IPC Communication (Canvas System)
 * ✅ State Persistence (Auto-save)
 * ✅ Error Handling & Recovery
 * ✅ Lifecycle Management
 * ✅ Menu System
 * ✅ DevTools & Logging
 * ✅ File I/O Operations
 * ✅ Performance Monitoring
 */

interface WindowConfig {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  icon?: string;
}

interface AppConfig {
  isDev: boolean;
  appDataPath: string;
  stateFilePath: string;
  logFilePath: string;
}

class ElectronCanvasHost {
  private canvas: CanvasOrchestrator;
  private mainWindow: BrowserWindow | null = null;
  private config: AppConfig;
  private lastSaveTime: number = Date.now();
  private autoSaveInterval: NodeJS.Timer | null = null;
  private isClosing: boolean = false;

  constructor() {
    this.canvas = new CanvasOrchestrator();
    this.config = this.initConfig();
    this.setupIPC();
    this.setupCanvasListeners();
    this.setupErrorHandling();
  }

  /**
   * Initialize application configuration
   */
  private initConfig(): AppConfig {
    const isDev = process.env.NODE_ENV === 'development';
    const appDataPath = app.getPath('userData');
    const stateFilePath = path.join(appDataPath, 'canvas-state.json');
    const logFilePath = path.join(appDataPath, 'app.log');

    // Ensure data directory exists
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }

    return { isDev, appDataPath, stateFilePath, logFilePath };
  }

  /**
   * Setup global error handling
   */
  private setupErrorHandling(): void {
    process.on('uncaughtException', (error) => {
      this.log('ERROR', `Uncaught Exception: ${error.message}`, error.stack);
      dialog.showErrorBox('Application Error', error.message);
    });

    process.on('unhandledRejection', (reason) => {
      this.log('ERROR', `Unhandled Rejection: ${reason}`);
    });
  }

  /**
   * Logger - Write to console and file
   */
  private log(level: string, message: string, extra?: string): void {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${level}: ${message}${extra ? '\n' + extra : ''}\n`;

    // Console
    if (level === 'ERROR') {
      console.error(logLine);
    } else if (level === 'WARN') {
      console.warn(logLine);
    } else {
      console.log(logLine);
    }

    // File (append)
    try {
      fs.appendFileSync(this.config.logFilePath, logLine);
    } catch (err) {
      console.error('Failed to write log:', err);
    }
  }

  /**
   * ========== SETUP IPC HANDLERS ==========
   */
  private setupIPC(): void {
    // ===== NODE OPERATIONS =====
    ipcMain.handle('canvas:create-node', (_, args) => {
      try {
        const { nodeId, type, config } = args;
        this.log('INFO', `Creating node: ${nodeId} (${type})`);
        return this.canvas.createNode(nodeId, type, config);
      } catch (error) {
        this.log('ERROR', 'Failed to create node', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:get-nodes', () => {
      try {
        const nodes = this.canvas.getAllNodes();
        this.log('INFO', `Retrieved ${nodes.length} nodes`);
        return nodes;
      } catch (error) {
        this.log('ERROR', 'Failed to get nodes', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:delete-node', (_, nodeId) => {
      try {
        this.log('INFO', `Deleting node: ${nodeId}`);
        this.canvas.deleteNode(nodeId);
        this.markDirty();
        return { success: true };
      } catch (error) {
        this.log('ERROR', 'Failed to delete node', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:update-node-config', (_, args) => {
      try {
        const { nodeId, configKey, value, reason } = args;
        this.log('INFO', `Updating node ${nodeId}: ${configKey} = ${value}`);
        this.canvas.updateNodeConfig(nodeId, configKey, value, reason);
        this.markDirty();
        return { success: true };
      } catch (error) {
        this.log('ERROR', 'Failed to update node config', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:update-node-ui', (_, args) => {
      try {
        const { nodeId, ui } = args;
        this.canvas.updateNodeUI(nodeId, ui);
        return { success: true };
      } catch (error) {
        this.log('ERROR', 'Failed to update node UI', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:collapse-node', (_, nodeId) => {
      try {
        return this.canvas.collapseNode(nodeId);
      } catch (error) {
        this.log('ERROR', 'Failed to collapse node', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:expand-node', (_, nodeId) => {
      try {
        return this.canvas.expandNode(nodeId);
      } catch (error) {
        this.log('ERROR', 'Failed to expand node', (error as Error).message);
        throw error;
      }
    });

    // ===== LINK OPERATIONS =====
    ipcMain.handle('canvas:create-link', async (_, args) => {
      try {
        const { sourceNodeId, sourceKey, targetNodeId, targetKey } = args;
        this.log(
          'INFO',
          `Creating link: ${sourceNodeId}.${sourceKey} → ${targetNodeId}.${targetKey}`
        );
        const link = await this.canvas.createLink(
          sourceNodeId,
          sourceKey,
          targetNodeId,
          targetKey
        );
        this.markDirty();
        return link;
      } catch (error) {
        this.log('ERROR', 'Failed to create link', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:get-links', () => {
      try {
        const links = this.canvas.getLinks();
        return links;
      } catch (error) {
        this.log('ERROR', 'Failed to get links', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:delete-link', (_, linkId) => {
      try {
        this.log('INFO', `Deleting link: ${linkId}`);
        this.canvas.deleteLink(linkId);
        this.markDirty();
        return { success: true };
      } catch (error) {
        this.log('ERROR', 'Failed to delete link', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:toggle-link', (_, linkId) => {
      try {
        this.canvas.toggleLink(linkId);
        this.markDirty();
        return { success: true };
      } catch (error) {
        this.log('ERROR', 'Failed to toggle link', (error as Error).message);
        throw error;
      }
    });

    // ===== STATE MANAGEMENT =====
    ipcMain.handle('canvas:get-state', () => {
      try {
        const state = this.canvas.getState();
        return state;
      } catch (error) {
        this.log('ERROR', 'Failed to get state', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:save-state', (_, metadata) => {
      try {
        this.log('INFO', 'Saving canvas state');
        const state = this.canvas.saveState(metadata);
        this.saveStateToDisk(state);
        return state;
      } catch (error) {
        this.log('ERROR', 'Failed to save state', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:load-state', async (_, state) => {
      try {
        this.log('INFO', 'Loading canvas state');
        await this.canvas.loadState(state);
        return { success: true };
      } catch (error) {
        this.log('ERROR', 'Failed to load state', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:is-dirty', () => {
      return this.canvas.isDirtyState();
    });

    // ===== DEBUG & STATS =====
    ipcMain.handle('canvas:get-stats', () => {
      try {
        const stats = this.canvas.getStats();
        return stats;
      } catch (error) {
        this.log('ERROR', 'Failed to get stats', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:get-flow-history', (_, limit) => {
      try {
        return this.canvas.getFlowHistory(limit || 50);
      } catch (error) {
        this.log('ERROR', 'Failed to get flow history', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:clear-flow-history', () => {
      try {
        this.canvas.clearFlowHistory();
        return { success: true };
      } catch (error) {
        this.log('ERROR', 'Failed to clear flow history', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:validate', () => {
      try {
        const validation = this.canvas.validate();
        return validation;
      } catch (error) {
        this.log('ERROR', 'Validation failed', (error as Error).message);
        throw error;
      }
    });

    // ===== FILE OPERATIONS =====
    ipcMain.handle('file:open-save-dialog', async (_, options) => {
      try {
        const result = await dialog.showSaveDialog(this.mainWindow!, options);
        return result;
      } catch (error) {
        this.log('ERROR', 'Save dialog failed', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('file:open-open-dialog', async (_, options) => {
      try {
        const result = await dialog.showOpenDialog(this.mainWindow!, options);
        return result;
      } catch (error) {
        this.log('ERROR', 'Open dialog failed', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('file:write', (_, args) => {
      try {
        const { filePath, content } = args;
        fs.writeFileSync(filePath, content, 'utf-8');
        this.log('INFO', `File written: ${filePath}`);
        return { success: true };
      } catch (error) {
        this.log('ERROR', 'File write failed', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('file:read', (_, filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        this.log('INFO', `File read: ${filePath}`);
        return { success: true, content };
      } catch (error) {
        this.log('ERROR', 'File read failed', (error as Error).message);
        throw error;
      }
    });

    // ===== APP CONTROL =====
    ipcMain.handle('app:get-version', () => {
      return app.getVersion();
    });

    ipcMain.handle('app:get-path', (_, pathType) => {
      return app.getPath(pathType as any);
    });

    ipcMain.handle('app:get-config', () => {
      return {
        isDev: this.config.isDev,
        appDataPath: this.config.appDataPath,
        version: app.getVersion(),
      };
    });

    ipcMain.handle('app:quit', () => {
      this.isClosing = true;
      app.quit();
    });

    ipcMain.handle('app:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('app:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('app:close', () => {
      this.mainWindow?.close();
    });
  }

  /**
   * Setup Canvas System event listeners
   */
  private setupCanvasListeners(): void {
    this.canvas.on('node:created', (node) => {
      this.mainWindow?.webContents.send('canvas:node-created', node);
    });

    this.canvas.on('node:deleted', (nodeId) => {
      this.mainWindow?.webContents.send('canvas:node-deleted', nodeId);
    });

    this.canvas.on('node:updated', (node) => {
      this.mainWindow?.webContents.send('canvas:node-updated', node);
    });

    this.canvas.on('link:created', (link) => {
      this.mainWindow?.webContents.send('canvas:link-created', link);
    });

    this.canvas.on('link:deleted', (linkId) => {
      this.mainWindow?.webContents.send('canvas:link-deleted', linkId);
    });

    this.canvas.on('state:saved', (state) => {
      this.mainWindow?.webContents.send('canvas:state-saved', state);
    });

    this.canvas.on('state:loaded', (state) => {
      this.mainWindow?.webContents.send('canvas:state-loaded', state);
    });

    this.canvas.on('error', (error) => {
      this.log('ERROR', 'Canvas error', error.message);
      this.mainWindow?.webContents.send('canvas:error', {
        message: error.message,
        code: error.code,
      });
    });
  }

  /**
   * Mark state as dirty (needs saving)
   */
  private markDirty(): void {
    this.lastSaveTime = Date.now();
  }

  /**
   * Save canvas state to disk
   */
  private saveStateToDisk(state: any): void {
    try {
      const backupPath = this.config.stateFilePath + '.backup';

      // Create backup if file exists
      if (fs.existsSync(this.config.stateFilePath)) {
        fs.copyFileSync(this.config.stateFilePath, backupPath);
      }

      // Write new state
      fs.writeFileSync(
        this.config.stateFilePath,
        JSON.stringify(state, null, 2),
        'utf-8'
      );

      this.log('INFO', 'State saved to disk');
    } catch (error) {
      this.log('ERROR', 'Failed to save state to disk', (error as Error).message);
    }
  }

  /**
   * Load canvas state from disk
   */
  private async loadStateFromDisk(): Promise<void> {
    try {
      if (fs.existsSync(this.config.stateFilePath)) {
        const rawState = fs.readFileSync(this.config.stateFilePath, 'utf-8');
        const state = JSON.parse(rawState);
        await this.canvas.loadState(state);
        this.log('INFO', 'State loaded from disk');
      }
    } catch (error) {
      this.log('WARN', 'Failed to load state from disk', (error as Error).message);
      // Continue with empty state
    }
  }

  /**
   * Setup auto-save mechanism
   */
  private setupAutoSave(): void {
    const SAVE_INTERVAL = 30000; // 30 seconds

    this.autoSaveInterval = setInterval(() => {
      try {
        if (this.canvas.isDirtyState()) {
          const state = this.canvas.saveState({ autoSaved: true });
          this.saveStateToDisk(state);
        }
      } catch (error) {
        this.log('WARN', 'Auto-save failed', (error as Error).message);
      }
    }, SAVE_INTERVAL);
  }

  /**
   * Setup application menu
   */
  private setupMenu(): void {
    const template: any[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Exit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  /**
   * Create BrowserWindow
   */
  private createWindow(): void {
    const windowConfig: WindowConfig = {
      width: 1400,
      height: 900,
      minWidth: 800,
      minHeight: 600,
    };

    this.mainWindow = new BrowserWindow({
      ...windowConfig,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        enableRemoteModule: false,
      },
      show: false, // Don't show until ready
    });

    // Load URL
    const url = this.config.isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../renderer/dist/index.html')}`;

    this.mainWindow.loadURL(url);

    // Show when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.log('INFO', 'Main window created and shown');
    });

    // Dev tools
    if (this.config.isDev) {
      this.mainWindow.webContents.openDevTools();
    }

    // Handle closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // Before unload - save state
    this.mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.control && input.key.toLowerCase() === 's') {
        event.preventDefault();
        this.mainWindow?.webContents.send('app:save-triggered');
      }
    });
  }

  /**
   * Cleanup on app quit
   */
  private async cleanup(): Promise<void> {
    this.log('INFO', 'Cleaning up...');

    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    try {
      if (this.canvas.isDirtyState()) {
        const state = this.canvas.saveState({ savedOnExit: true });
        this.saveStateToDisk(state);
      }
    } catch (error) {
      this.log('WARN', 'Failed to save state on exit', (error as Error).message);
    }

    this.log('INFO', 'Cleanup complete');
  }

  /**
   * Start the application
   */
  start(): void {
    this.log('INFO', '========== APP STARTUP ==========');
    this.log('INFO', `Environment: ${this.config.isDev ? 'development' : 'production'}`);

    app.on('ready', async () => {
      try {
        await this.loadStateFromDisk();
        this.setupAutoSave();
        this.setupMenu();
        this.createWindow();
        this.log('INFO', 'App ready');
      } catch (error) {
        this.log('ERROR', 'Failed to start app', (error as Error).message);
      }
    });

    app.on('window-all-closed', () => {
      this.log('INFO', 'All windows closed');
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      this.log('INFO', 'App activated');
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });

    app.on('before-quit', async () => {
      this.log('INFO', 'App quitting...');
      await this.cleanup();
    });

    app.on('quit', () => {
      this.log('INFO', 'App quit complete');
    });

    // Handle any remaining errors
    process.on('exit', (code) => {
      this.log('INFO', `Process exit code: ${code}`);
    });
  }
}

// ============================================
// INITIALIZE & START
// ============================================

const host = new ElectronCanvasHost();
host.start();

export { ElectronCanvasHost };
