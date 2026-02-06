/**
 * ============================================
 * Electron API Type Definitions
 * ============================================
 */

export interface CanvasAPI {
  createNode: (nodeId: string, type: string, config?: any) => Promise<any>;
  getNodes: () => Promise<any[]>;
  deleteNode: (nodeId: string) => Promise<{ success: boolean }>;
  updateNodeConfig: (nodeId: string, configKey: string, value: any, reason?: string) => Promise<{ success: boolean }>;
  updateNodeUI: (nodeId: string, ui: any) => Promise<{ success: boolean }>;
  collapseNode: (nodeId: string) => Promise<any>;
  expandNode: (nodeId: string) => Promise<any>;
  createLink: (sourceNodeId: string, sourceKey: string, targetNodeId: string, targetKey: string) => Promise<any>;
  getLinks: () => Promise<any[]>;
  deleteLink: (linkId: string) => Promise<{ success: boolean }>;
  toggleLink: (linkId: string) => Promise<{ success: boolean }>;
  getState: () => Promise<any>;
  saveState: (metadata?: any) => Promise<any>;
  loadState: (state: any) => Promise<{ success: boolean }>;
  isDirty: () => Promise<boolean>;
  getStats: () => Promise<any>;
  getFlowHistory: (limit?: number) => Promise<any[]>;
  clearFlowHistory: () => Promise<{ success: boolean }>;
  validate: () => Promise<any>;
  onNodeCreated: (callback: (node: any) => void) => () => void;
  onNodeDeleted: (callback: (nodeId: string) => void) => () => void;
  onNodeUpdated: (callback: (node: any) => void) => () => void;
  onLinkCreated: (callback: (link: any) => void) => () => void;
  onLinkDeleted: (callback: (linkId: string) => void) => () => void;
  onStateSaved: (callback: (state: any) => void) => () => void;
  onStateLoaded: (callback: (state: any) => void) => () => void;
  onError: (callback: (error: any) => void) => () => void;
}

export interface FileAPI {
  openSaveDialog: (options: any) => Promise<any>;
  openOpenDialog: (options: any) => Promise<any>;
  write: (filePath: string, content: string) => Promise<any>;
  read: (filePath: string) => Promise<string>;
}

export interface ExecutorAPI {
  terminal: {
    execute: (command: string) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
  };
}

export interface AppAPI {
  getVersion: () => Promise<string>;
  getConfig: () => Promise<any>;
  quit: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  onSaveTriggered: (callback: () => void) => () => void;
}

export interface ElectronAPI {
  canvas: CanvasAPI;
  file: FileAPI;
  executor: ExecutorAPI;
  app: AppAPI;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {};
