import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { getCanvasStore, CanvasStore } from './canvas-store';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * ============================================
 * ElectronCanvasHost - With Canvas Store
 * ============================================
 * 
 * Now uses CanvasStore for real data!
 */
class ElectronCanvasHost {
  private mainWindow: BrowserWindow | null = null;
  private isDev: boolean = process.env.NODE_ENV === 'development';
  private appDataPath: string = app.getPath('userData');
  private stateFile: string = path.join(app.getPath('userData'), 'canvas-state.json');
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private canvasStore: CanvasStore;

  constructor() {
    this.canvasStore = getCanvasStore();
    this.setupPaths();
    this.setupIPC();
    this.setupErrorHandling();
    this.loadPersistedState();
  }

  private setupPaths(): void {
    if (!fs.existsSync(this.appDataPath)) {
      fs.mkdirSync(this.appDataPath, { recursive: true });
    }
  }

  private log(level: string, message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
  }

  private setupErrorHandling(): void {
    process.on('uncaughtException', (error) => {
      this.log('ERROR', error.message);
      dialog.showErrorBox('Error', error.message);
    });
  }

  /**
   * Load persisted state from file
   */
  private loadPersistedState(): void {
    try {
      if (fs.existsSync(this.stateFile)) {
        const content = fs.readFileSync(this.stateFile, 'utf-8');
        const state = JSON.parse(content);
        this.canvasStore.setState(state);
        this.log('INFO', `Loaded persisted state (${state.nodes.length} nodes, ${state.links.length} links)`);
      }
    } catch (err) {
      this.log('WARN', `Failed to load state: ${(err as Error).message}`);
    }
  }

  /**
   * Save state to file
   */
  private persistState(): void {
    try {
      const state = this.canvasStore.saveable();
      fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
      this.log('INFO', 'State persisted to disk');
    } catch (err) {
      this.log('ERROR', `Failed to persist: ${(err as Error).message}`);
    }
  }

  private setupIPC(): void {
    // ===== CANVAS: NODE OPERATIONS =====

    ipcMain.handle('canvas:create-node', async (_, args) => {
      try {
        const node = this.canvasStore.createNode(args.nodeId, args.type, args.config);
        
        // Broadcast to renderer
        this.mainWindow?.webContents.send('canvas:node-created', node);
        
        this.log('INFO', `Created node: ${args.nodeId}`);
        return node;
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        this.mainWindow?.webContents.send('canvas:error', { message: (error as Error).message });
        throw error;
      }
    });

    ipcMain.handle('canvas:get-nodes', async () => {
      try {
        return this.canvasStore.getNodes();
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:delete-node', async (_, nodeId) => {
      try {
        this.canvasStore.deleteNode(nodeId);
        
        // Broadcast to renderer
        this.mainWindow?.webContents.send('canvas:node-deleted', nodeId);
        
        this.log('INFO', `Deleted node: ${nodeId}`);
        return { success: true };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        this.mainWindow?.webContents.send('canvas:error', { message: (error as Error).message });
        throw error;
      }
    });

    ipcMain.handle('canvas:update-node-config', async (_, args) => {
      try {
        const node = this.canvasStore.updateNodeConfig(
          args.nodeId,
          args.configKey,
          args.value,
          args.reason
        );
        
        this.mainWindow?.webContents.send('canvas:node-updated', node);
        return { success: true, node };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:update-node-ui', async (_, args) => {
      try {
        const node = this.canvasStore.updateNodeUI(args.nodeId, args.ui);
        this.mainWindow?.webContents.send('canvas:node-updated', node);
        return { success: true, node };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:collapse-node', async (_, nodeId) => {
      try {
        const node = this.canvasStore.collapseNode(nodeId);
        this.mainWindow?.webContents.send('canvas:node-updated', node);
        return { success: true, node };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:expand-node', async (_, nodeId) => {
      try {
        const node = this.canvasStore.expandNode(nodeId);
        this.mainWindow?.webContents.send('canvas:node-updated', node);
        return { success: true, node };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    // ===== CANVAS: LINK OPERATIONS =====

    ipcMain.handle('canvas:create-link', async (_, args) => {
      try {
        const link = this.canvasStore.createLink(
          args.sourceNodeId,
          args.sourceKey,
          args.targetNodeId,
          args.targetKey
        );
        
        this.mainWindow?.webContents.send('canvas:link-created', link);
        this.log('INFO', `Created link: ${link.id}`);
        return link;
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        this.mainWindow?.webContents.send('canvas:error', { message: (error as Error).message });
        throw error;
      }
    });

    ipcMain.handle('canvas:get-links', async () => {
      try {
        return this.canvasStore.getLinks();
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:delete-link', async (_, linkId) => {
      try {
        this.canvasStore.deleteLink(linkId);
        this.mainWindow?.webContents.send('canvas:link-deleted', linkId);
        return { success: true };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:toggle-link', async (_, linkId) => {
      try {
        const link = this.canvasStore.toggleLink(linkId);
        return { success: true, link };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    // ===== CANVAS: STATE OPERATIONS =====

    ipcMain.handle('canvas:get-state', async () => {
      try {
        return this.canvasStore.getState();
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:save-state', async (_, metadata) => {
      try {
        const state = this.canvasStore.saveable();
        if (metadata) {
          state.metadata = metadata;
        }
        
        // Persist to disk
        fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
        
        this.mainWindow?.webContents.send('canvas:state-saved', state);
        this.log('INFO', 'State saved');
        return state;
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:load-state', async (_, state) => {
      try {
        this.canvasStore.setState(state);
        this.mainWindow?.webContents.send('canvas:state-loaded', state);
        return { success: true };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:is-dirty', async () => {
      try {
        return this.canvasStore.isDirtyState();
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    // ===== CANVAS: DEBUG & VALIDATION =====

    ipcMain.handle('canvas:get-stats', async () => {
      try {
        const stats = this.canvasStore.getStats();
        return {
          ...stats,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
        };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:validate', async () => {
      try {
        return this.canvasStore.validate();
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('canvas:get-flow-history', async (_, limit = 10) => {
      // TODO: implement flow history tracking
      return [];
    });

    ipcMain.handle('canvas:clear-flow-history', async () => {
      // TODO: implement
      return { success: true };
    });

    // ===== FILE I/O =====

    ipcMain.handle('file:open-save-dialog', async (_, options) => {
      try {
        return await dialog.showSaveDialog(this.mainWindow!, options);
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('file:open-open-dialog', async (_, options) => {
      try {
        return await dialog.showOpenDialog(this.mainWindow!, options);
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('file:write', async (_, args) => {
      try {
        fs.writeFileSync(args.filePath, args.content, 'utf-8');
        return { success: true };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    ipcMain.handle('file:read', async (_, filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
      } catch (error) {
        this.log('ERROR', (error as Error).message);
        throw error;
      }
    });

    // ===== APP CONTROL =====

    ipcMain.handle('app:get-version', async () => {
      return app.getVersion();
    });

    ipcMain.handle('app:get-config', async () => {
      return { isDev: this.isDev, appDataPath: this.appDataPath };
    });

    ipcMain.handle('app:quit', async () => {
      this.persistState();
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
      this.persistState();
      this.mainWindow?.close();
    });

    this.log('INFO', '✅ IPC handlers registered');
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
      ? 'http://localhost:4001'
      : `file://${path.join(__dirname, '../dist-renderer/index.html')}`;

    this.mainWindow.loadURL(url);

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      this.log('INFO', '✅ Window ready');
    });

    if (this.isDev) {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupAutoSave(): void {
    const INTERVAL = 30000; // 30 seconds
    this.autoSaveInterval = setInterval(() => {
      if (this.canvasStore.isDirtyState()) {
        this.persistState();
        this.log('INFO', '💾 Auto-save');
      }
    }, INTERVAL);
  }

  private setupMenu(): void {
    const template: any[] = [
      {
        label: 'File',
        submenu: [
          { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
        ],
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
    this.log('INFO', '════════════════════════════════════');
    this.log('INFO', '🚀 APP START - Canvas System v1.0');
    this.log('INFO', '════════════════════════════════════');

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
      this.persistState();
      if (this.autoSaveInterval) {
        clearInterval(this.autoSaveInterval);
      }
      this.log('INFO', '👋 Shutting down...');
    });
  }
}

const host = new ElectronCanvasHost();
host.start();
