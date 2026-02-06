import { contextBridge, ipcRenderer } from 'electron';
import type { ElectronAPI } from './types';

console.log('[PRELOAD] ✅ Preload script loaded');

/**
 * ============================================
 * Canvas API - Node & Link Management
 * ============================================
 */
const canvasAPI = {
  // Node operations
  createNode: (nodeId: string, type: string, config?: any) =>
    ipcRenderer.invoke('canvas:create-node', { nodeId, type, config }),
  getNodes: () => ipcRenderer.invoke('canvas:get-nodes'),
  deleteNode: (nodeId: string) => ipcRenderer.invoke('canvas:delete-node', nodeId),
  updateNodeConfig: (nodeId: string, configKey: string, value: any, reason?: string) =>
    ipcRenderer.invoke('canvas:update-node-config', { nodeId, configKey, value, reason }),
  updateNodeUI: (nodeId: string, ui: any) => ipcRenderer.invoke('canvas:update-node-ui', { nodeId, ui }),
  collapseNode: (nodeId: string) => ipcRenderer.invoke('canvas:collapse-node', nodeId),
  expandNode: (nodeId: string) => ipcRenderer.invoke('canvas:expand-node', nodeId),

  // Link operations
  createLink: (sourceNodeId: string, sourceKey: string, targetNodeId: string, targetKey: string) =>
    ipcRenderer.invoke('canvas:create-link', { sourceNodeId, sourceKey, targetNodeId, targetKey }),
  getLinks: () => ipcRenderer.invoke('canvas:get-links'),
  deleteLink: (linkId: string) => ipcRenderer.invoke('canvas:delete-link', linkId),
  toggleLink: (linkId: string) => ipcRenderer.invoke('canvas:toggle-link', linkId),

  // State operations
  getState: () => ipcRenderer.invoke('canvas:get-state'),
  saveState: (metadata?: any) => ipcRenderer.invoke('canvas:save-state', metadata),
  loadState: (state: any) => ipcRenderer.invoke('canvas:load-state', state),
  isDirty: () => ipcRenderer.invoke('canvas:is-dirty'),

  // Debug
  getStats: () => ipcRenderer.invoke('canvas:get-stats'),
  getFlowHistory: (limit?: number) => ipcRenderer.invoke('canvas:get-flow-history', limit),
  clearFlowHistory: () => ipcRenderer.invoke('canvas:clear-flow-history'),
  validate: () => ipcRenderer.invoke('canvas:validate'),

  // Event listeners
  // Event listeners - wrap to hide ipcRenderer event parameter
  onNodeCreated: (callback: any) => {
    const wrappedCallback = (_: any, node: any) => callback(node);
    ipcRenderer.on('canvas:node-created', wrappedCallback);
    return () => ipcRenderer.removeListener('canvas:node-created', wrappedCallback);
  },
  onNodeDeleted: (callback: any) => {
    const wrappedCallback = (_: any, nodeId: any) => callback(nodeId);
    ipcRenderer.on('canvas:node-deleted', wrappedCallback);
    return () => ipcRenderer.removeListener('canvas:node-deleted', wrappedCallback);
  },
  onNodeUpdated: (callback: any) => {
    const wrappedCallback = (_: any, node: any) => callback(node);
    ipcRenderer.on('canvas:node-updated', wrappedCallback);
    return () => ipcRenderer.removeListener('canvas:node-updated', wrappedCallback);
  },
  onLinkCreated: (callback: any) => {
    const wrappedCallback = (_: any, link: any) => callback(link);
    ipcRenderer.on('canvas:link-created', wrappedCallback);
    return () => ipcRenderer.removeListener('canvas:link-created', wrappedCallback);
  },
  onLinkDeleted: (callback: any) => {
    const wrappedCallback = (_: any, linkId: any) => callback(linkId);
    ipcRenderer.on('canvas:link-deleted', wrappedCallback);
    return () => ipcRenderer.removeListener('canvas:link-deleted', wrappedCallback);
  },
  onStateSaved: (callback: any) => {
    const wrappedCallback = (_: any, state: any) => callback(state);
    ipcRenderer.on('canvas:state-saved', wrappedCallback);
    return () => ipcRenderer.removeListener('canvas:state-saved', wrappedCallback);
  },
  onStateLoaded: (callback: any) => {
    const wrappedCallback = (_: any, state: any) => callback(state);
    ipcRenderer.on('canvas:state-loaded', wrappedCallback);
    return () => ipcRenderer.removeListener('canvas:state-loaded', wrappedCallback);
  },
  onError: (callback: any) => {
    ipcRenderer.on('canvas:error', callback);
    return () => ipcRenderer.removeListener('canvas:error', callback);
  },
};

/**
 * ============================================
 * File API
 * ============================================
 */
const fileAPI = {
  openSaveDialog: (options: any) => ipcRenderer.invoke('file:open-save-dialog', options),
  openOpenDialog: (options: any) => ipcRenderer.invoke('file:open-open-dialog', options),
  write: (filePath: string, content: string) => ipcRenderer.invoke('file:write', { filePath, content }),
  read: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
};

/**
 * ============================================
 * Executor API
 * ============================================
 */
const executorAPI = {
  terminal: {
    execute: (command: string) => ipcRenderer.invoke('executor:terminal-execute', command),
  },
};

/**
 * ============================================
 * App API
 * ============================================
 */
const appAPI = {
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getConfig: () => ipcRenderer.invoke('app:get-config'),
  quit: () => ipcRenderer.invoke('app:quit'),
  minimize: () => ipcRenderer.invoke('app:minimize'),
  maximize: () => ipcRenderer.invoke('app:maximize'),
  close: () => ipcRenderer.invoke('app:close'),

  onSaveTriggered: (callback: any) => {
    ipcRenderer.on('app:save-triggered', callback);
    return () => ipcRenderer.removeListener('app:save-triggered', callback);
  },
};

/**
 * ============================================
 * Expose API to Renderer
 * ============================================
 */
console.log('[PRELOAD] 📦 Exposing APIs to main world...');

contextBridge.exposeInMainWorld('electron', {
  canvas: canvasAPI,
  file: fileAPI,
  executor: executorAPI,
  app: appAPI,
});

console.log('[PRELOAD] ✅ APIs exposed successfully');
