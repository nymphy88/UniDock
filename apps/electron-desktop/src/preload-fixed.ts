import { contextBridge, ipcRenderer } from 'electron';

/**
 * ============================================
 * Preload Script - FIXED Edition
 * ============================================
 * 
 * Key fix: Event listeners work with proper subscription model
 * ← return cleanup function, don't call the handler
 */

/**
 * Canvas API - Node & Link Management
 */
interface CanvasNodeAPI {
  createNode: (nodeId: string, type: string, config?: any) => Promise<any>;
  getNodes: () => Promise<any[]>;
  deleteNode: (nodeId: string) => Promise<{ success: boolean }>;
  updateNodeConfig: (
    nodeId: string,
    configKey: string,
    value: any,
    reason?: string
  ) => Promise<{ success: boolean }>;
  updateNodeUI: (nodeId: string, ui: any) => Promise<{ success: boolean }>;
  collapseNode: (nodeId: string) => Promise<any>;
  expandNode: (nodeId: string) => Promise<any>;
}

interface CanvasLinkAPI {
  createLink: (
    sourceNodeId: string,
    sourceKey: string,
    targetNodeId: string,
    targetKey: string
  ) => Promise<any>;
  getLinks: () => Promise<any[]>;
  deleteLink: (linkId: string) => Promise<{ success: boolean }>;
  toggleLink: (linkId: string) => Promise<{ success: boolean }>;
}

interface CanvasStateAPI {
  getState: () => Promise<any>;
  saveState: (metadata?: any) => Promise<any>;
  loadState: (state: any) => Promise<{ success: boolean }>;
  isDirty: () => Promise<boolean>;
}

interface CanvasDebugAPI {
  getStats: () => Promise<any>;
  getFlowHistory: (limit?: number) => Promise<any[]>;
  clearFlowHistory: () => Promise<{ success: boolean }>;
  validate: () => Promise<any>;
}

/**
 * EVENT API - FIXED VERSION
 * ← Each returns an unsubscribe function!
 */
interface CanvasEventAPI {
  onNodeCreated: (callback: (event: any, node: any) => void) => () => void;
  onNodeDeleted: (callback: (event: any, nodeId: string) => void) => () => void;
  onNodeUpdated: (callback: (event: any, node: any) => void) => () => void;
  onLinkCreated: (callback: (event: any, link: any) => void) => () => void;
  onLinkDeleted: (callback: (event: any, linkId: string) => void) => () => void;
  onStateSaved: (callback: (event: any, state: any) => void) => () => void;
  onStateLoaded: (callback: (event: any, state: any) => void) => () => void;
  onError: (callback: (event: any, error: any) => void) => () => void;
  removeAllListeners: () => void;
}

/**
 * File I/O API
 */
interface FileAPI {
  openSaveDialog: (options: any) => Promise<any>;
  openOpenDialog: (options: any) => Promise<any>;
  write: (filePath: string, content: string) => Promise<{ success: boolean }>;
  read: (filePath: string) => Promise<{ success: boolean; content: string }>;
}

/**
 * App Control API
 */
interface AppAPI {
  getVersion: () => Promise<string>;
  getPath: (pathType: string) => Promise<string>;
  getConfig: () => Promise<any>;
  quit: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  onSaveTriggered: (callback: (event: any) => void) => () => void;
}

/**
 * Complete Canvas API
 */
interface CompleteCanvasAPI
  extends CanvasNodeAPI,
    CanvasLinkAPI,
    CanvasStateAPI,
    CanvasDebugAPI,
    CanvasEventAPI {}

/**
 * Unified Electron API
 */
interface ElectronAPI {
  canvas: CompleteCanvasAPI;
  file: FileAPI;
  app: AppAPI;
}

// ============================================
// IMPLEMENT CANVAS API
// ============================================

const canvasAPI: CompleteCanvasAPI = {
  // ===== NODE OPERATIONS =====
  createNode: (nodeId: string, type: string, config?: any) =>
    ipcRenderer.invoke('canvas:create-node', { nodeId, type, config }),

  getNodes: () => ipcRenderer.invoke('canvas:get-nodes'),

  deleteNode: (nodeId: string) =>
    ipcRenderer.invoke('canvas:delete-node', nodeId),

  updateNodeConfig: (nodeId: string, configKey: string, value: any, reason?: string) =>
    ipcRenderer.invoke('canvas:update-node-config', {
      nodeId,
      configKey,
      value,
      reason,
    }),

  updateNodeUI: (nodeId: string, ui: any) =>
    ipcRenderer.invoke('canvas:update-node-ui', { nodeId, ui }),

  collapseNode: (nodeId: string) =>
    ipcRenderer.invoke('canvas:collapse-node', nodeId),

  expandNode: (nodeId: string) =>
    ipcRenderer.invoke('canvas:expand-node', nodeId),

  // ===== LINK OPERATIONS =====
  createLink: (sourceNodeId, sourceKey, targetNodeId, targetKey) =>
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

  // ===== STATE MANAGEMENT =====
  getState: () => ipcRenderer.invoke('canvas:get-state'),

  saveState: (metadata?: any) =>
    ipcRenderer.invoke('canvas:save-state', metadata),

  loadState: (state: any) =>
    ipcRenderer.invoke('canvas:load-state', state),

  isDirty: () => ipcRenderer.invoke('canvas:is-dirty'),

  // ===== DEBUG & STATS =====
  getStats: () => ipcRenderer.invoke('canvas:get-stats'),

  getFlowHistory: (limit?: number) =>
    ipcRenderer.invoke('canvas:get-flow-history', limit),

  clearFlowHistory: () =>
    ipcRenderer.invoke('canvas:clear-flow-history'),

  validate: () => ipcRenderer.invoke('canvas:validate'),

  // ===== EVENTS - FIXED VERSION =====
  /**
   * ← FIXED: Return unsubscribe function
   * @example
   * const unsub = window.electron.canvas.onNodeCreated((e, node) => {
   *   console.log('Node created:', node);
   * });
   * // Later: unsub() to cleanup
   */
  onNodeCreated: (callback) => {
    ipcRenderer.on('canvas:node-created', callback);
    // Return cleanup function
    return () => {
      ipcRenderer.removeListener('canvas:node-created', callback);
    };
  },

  onNodeDeleted: (callback) => {
    ipcRenderer.on('canvas:node-deleted', callback);
    return () => {
      ipcRenderer.removeListener('canvas:node-deleted', callback);
    };
  },

  onNodeUpdated: (callback) => {
    ipcRenderer.on('canvas:node-updated', callback);
    return () => {
      ipcRenderer.removeListener('canvas:node-updated', callback);
    };
  },

  onLinkCreated: (callback) => {
    ipcRenderer.on('canvas:link-created', callback);
    return () => {
      ipcRenderer.removeListener('canvas:link-created', callback);
    };
  },

  onLinkDeleted: (callback) => {
    ipcRenderer.on('canvas:link-deleted', callback);
    return () => {
      ipcRenderer.removeListener('canvas:link-deleted', callback);
    };
  },

  onStateSaved: (callback) => {
    ipcRenderer.on('canvas:state-saved', callback);
    return () => {
      ipcRenderer.removeListener('canvas:state-saved', callback);
    };
  },

  onStateLoaded: (callback) => {
    ipcRenderer.on('canvas:state-loaded', callback);
    return () => {
      ipcRenderer.removeListener('canvas:state-loaded', callback);
    };
  },

  onError: (callback) => {
    ipcRenderer.on('canvas:error', callback);
    return () => {
      ipcRenderer.removeListener('canvas:error', callback);
    };
  },

  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('canvas:node-created');
    ipcRenderer.removeAllListeners('canvas:node-deleted');
    ipcRenderer.removeAllListeners('canvas:node-updated');
    ipcRenderer.removeAllListeners('canvas:link-created');
    ipcRenderer.removeAllListeners('canvas:link-deleted');
    ipcRenderer.removeAllListeners('canvas:state-saved');
    ipcRenderer.removeAllListeners('canvas:state-loaded');
    ipcRenderer.removeAllListeners('canvas:error');
  },
};

// ============================================
// IMPLEMENT FILE API
// ============================================

const fileAPI: FileAPI = {
  openSaveDialog: (options: any) =>
    ipcRenderer.invoke('file:open-save-dialog', options),

  openOpenDialog: (options: any) =>
    ipcRenderer.invoke('file:open-open-dialog', options),

  write: (filePath: string, content: string) =>
    ipcRenderer.invoke('file:write', { filePath, content }),

  read: (filePath: string) =>
    ipcRenderer.invoke('file:read', filePath),
};

// ============================================
// IMPLEMENT APP API
// ============================================

const appAPI: AppAPI = {
  getVersion: () => ipcRenderer.invoke('app:get-version'),

  getPath: (pathType: string) =>
    ipcRenderer.invoke('app:get-path', pathType),

  getConfig: () => ipcRenderer.invoke('app:get-config'),

  quit: () => ipcRenderer.invoke('app:quit'),

  minimize: () => ipcRenderer.invoke('app:minimize'),

  maximize: () => ipcRenderer.invoke('app:maximize'),

  close: () => ipcRenderer.invoke('app:close'),

  onSaveTriggered: (callback) => {
    ipcRenderer.on('app:save-triggered', callback);
    return () => {
      ipcRenderer.removeListener('app:save-triggered', callback);
    };
  },
};

// ============================================
// EXPOSE TO RENDERER
// ============================================

const electronAPI: ElectronAPI = {
  canvas: canvasAPI,
  file: fileAPI,
  app: appAPI,
};

contextBridge.exposeInMainWorld('electron', electronAPI);

// ============================================
// TYPESCRIPT DEFINITIONS
// ============================================

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export type { ElectronAPI, CompleteCanvasAPI, FileAPI, AppAPI };
