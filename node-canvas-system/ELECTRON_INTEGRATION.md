/**
 * Electron Integration Guide
 * ==========================
 * 
 * This file shows how to integrate Node Canvas System with Electron
 * for a desktop application
 */

// ============================================
// 1. MAIN PROCESS (main.ts)
// ============================================

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { CanvasOrchestrator, CanvasState } from 'node-canvas-system';

class ElectronCanvasApp {
  private canvas: CanvasOrchestrator;
  private mainWindow: BrowserWindow | null = null;
  private canvasStateFile = path.join(app.getPath('userData'), 'canvas-state.json');

  constructor() {
    this.canvas = new CanvasOrchestrator();
    this.setupIPC();
    this.setupCanvasListeners();
  }

  /**
   * Setup IPC handlers for Electron communication
   */
  private setupIPC(): void {
    // ========== NODE OPERATIONS ==========

    ipcMain.handle('canvas:create-node', (event, args) => {
      const { nodeId, type, config } = args;
      const node = this.canvas.createNode(nodeId, type, config);
      return node;
    });

    ipcMain.handle('canvas:get-nodes', () => {
      return this.canvas.getAllNodes();
    });

    ipcMain.handle('canvas:update-node-config', (event, args) => {
      const { nodeId, configKey, value, reason } = args;
      this.canvas.updateNodeConfig(nodeId, configKey, value, reason);
      return { success: true };
    });

    ipcMain.handle('canvas:update-node-ui', (event, args) => {
      const { nodeId, ui } = args;
      this.canvas.updateNodeUI(nodeId, ui);
      return { success: true };
    });

    ipcMain.handle('canvas:collapse-node', (event, nodeId) => {
      return this.canvas.collapseNode(nodeId);
    });

    ipcMain.handle('canvas:expand-node', (event, nodeId) => {
      return this.canvas.expandNode(nodeId);
    });

    ipcMain.handle('canvas:delete-node', (event, nodeId) => {
      this.canvas.deleteNode(nodeId);
      return { success: true };
    });

    // ========== LINK OPERATIONS ==========

    ipcMain.handle('canvas:create-link', async (event, args) => {
      const { sourceNodeId, sourceKey, targetNodeId, targetKey } = args;
      const link = await this.canvas.createLink(
        sourceNodeId,
        sourceKey,
        targetNodeId,
        targetKey
      );
      return link;
    });

    ipcMain.handle('canvas:get-links', () => {
      return this.canvas.getLinks();
    });

    ipcMain.handle('canvas:delete-link', (event, linkId) => {
      this.canvas.deleteLink(linkId);
      return { success: true };
    });

    ipcMain.handle('canvas:toggle-link', (event, linkId) => {
      this.canvas.toggleLink(linkId);
      return { success: true };
    });

    // ========== STATE MANAGEMENT ==========

    ipcMain.handle('canvas:save-state', (event, metadata) => {
      const state = this.canvas.saveState(metadata);
      // Also save to disk
      this.saveStateToDisk(state);
      return state;
    });

    ipcMain.handle('canvas:load-state', async (event, state) => {
      await this.canvas.loadState(state);
      return { success: true };
    });

    ipcMain.handle('canvas:get-state', () => {
      return this.canvas.getState();
    });

    ipcMain.handle('canvas:is-dirty', () => {
      return this.canvas.isDirtyState();
    });

    // ========== DEBUG & STATS ==========

    ipcMain.handle('canvas:get-stats', () => {
      return this.canvas.getStats();
    });

    ipcMain.handle('canvas:get-flow-history', (event, limit) => {
      return this.canvas.getFlowHistory(limit);
    });

    ipcMain.handle('canvas:clear-flow-history', () => {
      this.canvas.clearFlowHistory();
      return { success: true };
    });

    ipcMain.handle('canvas:validate', () => {
      return this.canvas.validate();
    });
  }

  /**
   * Listen to canvas events and broadcast to renderer
   */
  private setupCanvasListeners(): void {
    this.canvas.on('node:created', (node) => {
      this.mainWindow?.webContents.send('canvas:node-created', node);
    });

    this.canvas.on('node:deleted', (nodeId) => {
      this.mainWindow?.webContents.send('canvas:node-deleted', nodeId);
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
  }

  /**
   * Save canvas state to disk
   */
  private saveStateToDisk(state: CanvasState): void {
    const fs = require('fs');
    fs.writeFileSync(this.canvasStateFile, JSON.stringify(state, null, 2));
  }

  /**
   * Load canvas state from disk
   */
  async loadStateFromDisk(): Promise<void> {
    const fs = require('fs');
    if (fs.existsSync(this.canvasStateFile)) {
      const state = JSON.parse(fs.readFileSync(this.canvasStateFile, 'utf-8'));
      await this.canvas.loadState(state);
    }
  }

  /**
   * Create browser window
   */
  createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load app
    const isDev = process.env.NODE_ENV === 'development';
    const url = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../renderer/dist/index.html')}`;

    this.mainWindow.loadURL(url);

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  /**
   * App lifecycle
   */
  start(): void {
    app.on('ready', async () => {
      await this.loadStateFromDisk();
      this.createWindow();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
  }
}

// Start app
const electronApp = new ElectronCanvasApp();
electronApp.start();

// ============================================
// 2. PRELOAD SCRIPT (preload.ts)
// ============================================

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('canvas', {
  // Node operations
  createNode: (nodeId: string, type: string, config?: any) =>
    ipcRenderer.invoke('canvas:create-node', { nodeId, type, config }),
  
  getNodes: () => ipcRenderer.invoke('canvas:get-nodes'),
  
  updateNodeConfig: (nodeId: string, configKey: string, value: any, reason?: string) =>
    ipcRenderer.invoke('canvas:update-node-config', { nodeId, configKey, value, reason }),
  
  updateNodeUI: (nodeId: string, ui: any) =>
    ipcRenderer.invoke('canvas:update-node-ui', { nodeId, ui }),
  
  collapseNode: (nodeId: string) =>
    ipcRenderer.invoke('canvas:collapse-node', nodeId),
  
  expandNode: (nodeId: string) =>
    ipcRenderer.invoke('canvas:expand-node', nodeId),
  
  deleteNode: (nodeId: string) =>
    ipcRenderer.invoke('canvas:delete-node', nodeId),

  // Link operations
  createLink: (
    sourceNodeId: string,
    sourceKey: string,
    targetNodeId: string,
    targetKey: string
  ) =>
    ipcRenderer.invoke('canvas:create-link', {
      sourceNodeId,
      sourceKey,
      targetNodeId,
      targetKey,
    }),
  
  getLinks: () => ipcRenderer.invoke('canvas:get-links'),
  
  deleteLink: (linkId: string) =>
    ipcRenderer.invoke('canvas:delete-link', linkId),
  
  toggleLink: (linkId: string) =>
    ipcRenderer.invoke('canvas:toggle-link', linkId),

  // State
  saveState: (metadata?: any) =>
    ipcRenderer.invoke('canvas:save-state', metadata),
  
  loadState: (state: any) =>
    ipcRenderer.invoke('canvas:load-state', state),
  
  getState: () => ipcRenderer.invoke('canvas:get-state'),
  
  isDirty: () => ipcRenderer.invoke('canvas:is-dirty'),

  // Debug
  getStats: () => ipcRenderer.invoke('canvas:get-stats'),
  getFlowHistory: (limit?: number) =>
    ipcRenderer.invoke('canvas:get-flow-history', limit),
  clearFlowHistory: () =>
    ipcRenderer.invoke('canvas:clear-flow-history'),
  validate: () => ipcRenderer.invoke('canvas:validate'),

  // Events
  onNodeCreated: (callback: any) =>
    ipcRenderer.on('canvas:node-created', callback),
  onNodeDeleted: (callback: any) =>
    ipcRenderer.on('canvas:node-deleted', callback),
  onLinkCreated: (callback: any) =>
    ipcRenderer.on('canvas:link-created', callback),
  onLinkDeleted: (callback: any) =>
    ipcRenderer.on('canvas:link-deleted', callback),
});

declare global {
  interface Window {
    canvas: any;
  }
}

// ============================================
// 3. RENDERER (React Component)
// ============================================

import React, { useState, useEffect } from 'react';

const CanvasApp: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    // Load initial state
    window.canvas.getNodes().then(setNodes);
    window.canvas.getLinks().then(setLinks);

    // Listen to updates
    window.canvas.onNodeCreated((_: any, node: any) => {
      setNodes((prev) => [...prev, node]);
      setIsDirty(true);
    });

    window.canvas.onNodeDeleted((_: any, nodeId: string) => {
      setNodes((prev) => prev.filter((n) => n.id !== nodeId));
      setIsDirty(true);
    });

    window.canvas.onLinkCreated((_: any, link: any) => {
      setLinks((prev) => [...prev, link]);
      setIsDirty(true);
    });

    window.canvas.onLinkDeleted((_: any, linkId: string) => {
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
      setIsDirty(true);
    });
  }, []);

  const handleCreateNode = async () => {
    await window.canvas.createNode('node-' + Date.now(), 'calculator', {
      precision: 2,
    });
  };

  const handleSaveState = async () => {
    await window.canvas.saveState({ name: 'My Canvas' });
    setIsDirty(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>🎨 Node Canvas System</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleCreateNode}>+ Create Node</button>
        <button onClick={handleSaveState} disabled={!isDirty}>
          💾 Save {isDirty && '(unsaved changes)'}
        </button>
      </div>

      <h2>Nodes ({nodes.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            <strong>{node.label}</strong> <br />
            ID: {node.id} <br />
            Type: {node.type}
          </div>
        ))}
      </div>

      <h2>Links ({links.length})</h2>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            {link.sourceNodeId}.{link.sourceKey} → {link.targetNodeId}.
            {link.targetKey}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CanvasApp;

// ============================================
// 4. PACKAGE.JSON - Add dependencies
// ============================================

/*
{
  "dependencies": {
    "electron": "^latest",
    "node-canvas-system": "file:../node-canvas-system",
    "react": "^18.0.0"
  },
  "devDependencies": {
    "electron-builder": "^latest",
    "typescript": "^5.0.0"
  },
  "scripts": {
    "dev": "concurrently 'npm run dev:main' 'npm run dev:renderer'",
    "dev:main": "tsc --watch src/main.ts --outDir .",
    "dev:renderer": "react-scripts start",
    "build": "npm run build:main && npm run build:renderer && electron-builder",
    "build:main": "tsc src/main.ts --outDir .",
    "build:renderer": "react-scripts build"
  }
}
*/

export default {};
