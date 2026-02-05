/**
 * Canvas Orchestrator - Main coordinator for the entire system
 * ============================================================
 * Manages nodes, links, and orchestrates data flow
 */

import { EventEmitter } from 'events';
import { NodeManager } from './node-manager';
import { DataLinkManager } from './data-link';
import { NodeDefinition, INodeExecutor } from '../types/node';
import { DataLink } from './data-link';

export interface CanvasState {
  nodes: NodeDefinition[];
  links: DataLink[];
  metadata: {
    name?: string;
    version?: string;
    lastSaved?: Date;
    author?: string;
  };
}

export class CanvasOrchestrator extends EventEmitter {
  private nodeManager: NodeManager;
  private linkManager: DataLinkManager;
  private state: CanvasState = {
    nodes: [],
    links: [],
    metadata: {},
  };
  private isDirty = false;

  constructor() {
    super();
    this.nodeManager = new NodeManager();
    this.linkManager = new DataLinkManager();

    // Listen to changes
    this.nodeManager.on('node:created', () => (this.isDirty = true));
    this.nodeManager.on('node:updated', () => (this.isDirty = true));
    this.nodeManager.on('node:config:updated', () => (this.isDirty = true));
    this.linkManager.on('link:created', () => (this.isDirty = true));
    this.linkManager.on('link:deleted', () => (this.isDirty = true));
  }

  // ========== NODE MANAGEMENT ==========

  /**
   * Create a node
   */
  createNode(
    nodeId: string,
    type: string,
    config?: Record<string, any>
  ): NodeDefinition {
    const node = this.nodeManager.createNode(nodeId, type, config);
    this.linkManager.registerNode(node);
    return node;
  }

  /**
   * Get node
   */
  getNode(nodeId: string): NodeDefinition | undefined {
    return this.nodeManager.getNode(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): NodeDefinition[] {
    return this.nodeManager.getAllNodes();
  }

  /**
   * Update node config (with safety checks)
   */
  updateNodeConfig(
    nodeId: string,
    configKey: string,
    value: any,
    reason?: string
  ): void {
    this.nodeManager.updateNodeConfig(nodeId, configKey, value, reason);
  }

  /**
   * Update node UI
   */
  updateNodeUI(
    nodeId: string,
    ui: Partial<NodeDefinition['ui']>
  ): void {
    this.nodeManager.updateNodeUI(nodeId, ui);
  }

  /**
   * Collapse node (free memory)
   */
  async collapseNode(nodeId: string): Promise<void> {
    await this.nodeManager.collapseNode(nodeId);
  }

  /**
   * Expand node
   */
  async expandNode(nodeId: string): Promise<void> {
    await this.nodeManager.expandNode(nodeId);
  }

  /**
   * Delete node (also removes all connected links)
   */
  deleteNode(nodeId: string): void {
    // Delete all links connected to this node
    const links = this.linkManager.getNodeLinks(nodeId);
    for (const link of links) {
      this.linkManager.deleteLink(link.id);
    }

    // Delete node
    this.nodeManager.deleteNode(nodeId);
  }

  /**
   * Register custom executor
   */
  registerExecutor(type: string, executor: INodeExecutor): void {
    this.nodeManager.registerExecutor(type, executor);
  }

  /**
   * Execute node
   */
  async executeNode(
    nodeId: string,
    input: Record<string, any>
  ): Promise<any> {
    const result = await this.nodeManager.executeNode(nodeId, input);
    if (result.success && result.output) {
      // Flow data through outgoing links
      const links = this.linkManager.getNodeLinks(nodeId, 'out');
      for (const link of links) {
        const sourceData = result.output[link.sourceKey];
        if (sourceData !== undefined) {
          await this.linkManager.flowData(link.id, sourceData);
        }
      }
    }
    return result;
  }

  // ========== LINK MANAGEMENT ==========

  /**
   * Create a link between two nodes
   */
  async createLink(
    sourceNodeId: string,
    sourceKey: string,
    targetNodeId: string,
    targetKey: string
  ): Promise<DataLink> {
    return this.linkManager.createLink(
      sourceNodeId,
      sourceKey,
      targetNodeId,
      targetKey
    );
  }

  /**
   * Get all links
   */
  getLinks(): DataLink[] {
    return this.linkManager.getAllLinks();
  }

  /**
   * Get links for node
   */
  getNodeLinks(nodeId: string, direction?: 'in' | 'out'): DataLink[] {
    return this.linkManager.getNodeLinks(nodeId, direction);
  }

  /**
   * Delete link
   */
  deleteLink(linkId: string): void {
    this.linkManager.deleteLink(linkId);
  }

  /**
   * Enable/disable link
   */
  toggleLink(linkId: string): void {
    const link = this.linkManager.getLink(linkId);
    if (link) {
      if (link.isActive) {
        this.linkManager.disableLink(linkId);
      } else {
        this.linkManager.enableLink(linkId);
      }
    }
  }

  // ========== CANVAS STATE ==========

  /**
   * Save canvas state
   */
  saveState(metadata?: CanvasState['metadata']): CanvasState {
    this.state = {
      nodes: this.nodeManager.getAllNodes(),
      links: this.linkManager.getAllLinks(),
      metadata: {
        ...this.state.metadata,
        ...metadata,
        lastSaved: new Date(),
      },
    };

    this.isDirty = false;
    this.emit('state:saved', this.state);
    console.log('💾 Canvas state saved');

    return this.state;
  }

  /**
   * Load canvas state
   */
  async loadState(state: CanvasState): Promise<void> {
    // Clear current state
    for (const node of this.nodeManager.getAllNodes()) {
      this.nodeManager.deleteNode(node.id);
    }

    // Load nodes
    await this.nodeManager.import(state.nodes);
    for (const node of state.nodes) {
      this.linkManager.registerNode(node);
    }

    // Load links
    await this.linkManager.import(state.links);

    this.state = state;
    this.isDirty = false;
    this.emit('state:loaded', this.state);
    console.log('📂 Canvas state loaded');
  }

  /**
   * Get current state
   */
  getState(): CanvasState {
    return {
      nodes: this.nodeManager.getAllNodes(),
      links: this.linkManager.getAllLinks(),
      metadata: this.state.metadata,
    };
  }

  /**
   * Check if canvas has unsaved changes
   */
  isDirtyState(): boolean {
    return this.isDirty;
  }

  /**
   * Get flow history
   */
  getFlowHistory(limit?: number): any[] {
    return this.linkManager.getFlowHistory(limit);
  }

  /**
   * Clear flow history
   */
  clearFlowHistory(): void {
    this.linkManager.clearFlowHistory();
  }

  /**
   * Get statistics
   */
  getStats(): {
    nodes: {
      total: number;
      loaded: number;
      collapsed: number;
      error: number;
    };
    links: {
      total: number;
      active: number;
      inactive: number;
    };
  } {
    const nodeStats = this.nodeManager.getStats();
    const links = this.linkManager.getAllLinks();

    return {
      nodes: nodeStats,
      links: {
        total: links.length,
        active: links.filter((l) => l.isActive).length,
        inactive: links.filter((l) => !l.isActive).length,
      },
    };
  }

  /**
   * Validate canvas
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate nodes
    for (const node of this.nodeManager.getAllNodes()) {
      const validation = (this.nodeManager as any).validateNode(node.id);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    // Validate links
    for (const link of this.linkManager.getAllLinks()) {
      const compat = this.linkManager.getLinkCompatibility(
        link.sourceNodeId,
        link.sourceKey,
        link.targetNodeId,
        link.targetKey
      );
      if (!compat.compatible) {
        errors.push(`Link ${link.id}: ${compat.reason}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export canvas (for saving to file)
   */
  export(): CanvasState {
    return this.saveState();
  }

  /**
   * Get orchestrator info
   */
  getInfo(): {
    version: string;
    nodeManager: string;
    linkManager: string;
    state: CanvasState;
  } {
    return {
      version: '1.0.0',
      nodeManager: 'ready',
      linkManager: 'ready',
      state: this.getState(),
    };
  }
}
