/**
 * Node Manager - Manages node lifecycle and memory optimization
 * =============================================================
 * Handles creation, state management, and collapse/expand for RAM optimization
 */

import { EventEmitter } from 'events';
import { NodeDefinition, BuiltInNodes, INodeExecutor, ExecutionResult } from '../types/node';

export interface NodeExecutorMap {
  [type: string]: INodeExecutor;
}

export class NodeManager extends EventEmitter {
  private nodes: Map<string, NodeDefinition> = new Map();
  private executors: NodeExecutorMap = {};
  private nodeStates: Map<string, 'loaded' | 'collapsed' | 'error'> = new Map();
  private executionCache: Map<string, ExecutionResult> = new Map();

  constructor() {
    super();
  }

  /**
   * Register a custom executor for a node type
   */
  registerExecutor(type: string, executor: INodeExecutor): void {
    this.executors[type] = executor;
    console.log(`✅ Registered executor for type: ${type}`);
  }

  /**
   * Create a new node from template
   */
  createNode(
    nodeId: string,
    type: string,
    config?: Record<string, any>
  ): NodeDefinition {
    // Get template
    const template = (BuiltInNodes as any)[type];
    if (!template && !this.executors[type]) {
      throw new Error(`Unknown node type: ${type}`);
    }

    const node: NodeDefinition = {
      id: nodeId,
      type,
      ...(template || {}),
      config: { ...((template as any)?.config || {}), ...config },
      state: 'idle',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.nodes.set(nodeId, node);
    this.nodeStates.set(nodeId, 'loaded');

    this.emit('node:created', node);
    console.log(`✅ Created node: ${nodeId} (type: ${type})`);

    return node;
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): NodeDefinition | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Update node configuration
   * Respects constraints (allowedConfigKeys, readOnlyKeys)
   */
  updateNodeConfig(
    nodeId: string,
    configKey: string,
    value: any,
    reason?: string
  ): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found`);
    }

    // Check if key is read-only
    if (node.constraints.readOnlyKeys.includes(configKey)) {
      throw new Error(`Config key "${configKey}" is read-only`);
    }

    // Check if key is allowed
    if (!node.constraints.allowedConfigKeys.includes(configKey)) {
      throw new Error(`Config key "${configKey}" is not allowed`);
    }

    const oldValue = node.config[configKey];
    node.config[configKey] = value;
    node.updatedAt = new Date();

    this.emit('node:config:updated', {
      nodeId,
      key: configKey,
      oldValue,
      newValue: value,
      reason,
    });

    console.log(
      `🔧 [${nodeId}] Updated config: ${configKey} = ${value}${reason ? ` (${reason})` : ''}`
    );
  }

  /**
   * Update node UI state (position, size, etc.)
   */
  updateNodeUI(
    nodeId: string,
    uiUpdates: Partial<NodeDefinition['ui']>
  ): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found`);
    }

    node.ui = { ...node.ui, ...uiUpdates };
    node.updatedAt = new Date();

    this.emit('node:ui:updated', { nodeId, ui: node.ui });
    console.log(`🎨 [${nodeId}] Updated UI:`, uiUpdates);
  }

  /**
   * Collapse node - unload from memory to reduce RAM usage
   * State and config are preserved
   */
  async collapseNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found`);
    }

    if (node.ui) {
      node.ui.isCollapsed = true;
    }

    // Clear execution cache to free memory
    this.executionCache.delete(nodeId);

    this.nodeStates.set(nodeId, 'collapsed');
    this.emit('node:collapsed', nodeId);

    console.log(`📦 [${nodeId}] Collapsed (memory freed)`);
  }

  /**
   * Expand node - load from saved state
   */
  async expandNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found`);
    }

    if (node.ui) {
      node.ui.isCollapsed = false;
    }

    this.nodeStates.set(nodeId, 'loaded');
    this.emit('node:expanded', nodeId);

    console.log(`📦 [${nodeId}] Expanded (ready)`);
  }

  /**
   * Get node memory state
   */
  getNodeState(nodeId: string): 'loaded' | 'collapsed' | 'error' | undefined {
    return this.nodeStates.get(nodeId);
  }

  /**
   * Execute node
   * Applies input coercion automatically before execution
   */
  async executeNode(
    nodeId: string,
    input: Record<string, any>
  ): Promise<ExecutionResult> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found`);
    }

    const executor = this.executors[node.type];
    if (!executor) {
      throw new Error(`No executor registered for node type: ${node.type}`);
    }

    if (node.state === 'running') {
      throw new Error(`Node "${nodeId}" is already running`);
    }

    try {
      node.state = 'running';
      const startTime = Date.now();

      // Execute
      const result = await executor.execute(input);

      // Cache result
      this.executionCache.set(nodeId, result);

      node.state = 'completed';
      node.lastExecuted = new Date();
      node.executionTime = result.executionTime;

      this.emit('node:executed', { nodeId, result });
      console.log(
        `✅ [${nodeId}] Executed in ${result.executionTime}ms`
      );

      return result;
    } catch (error) {
      node.state = 'error';
      const errorMsg = error instanceof Error ? error.message : String(error);

      this.emit('node:error', { nodeId, error: errorMsg });
      console.error(`❌ [${nodeId}] Execution failed:`, errorMsg);

      return {
        success: false,
        error: errorMsg,
        executionTime: Date.now() - Date.now(),
      };
    }
  }

  /**
   * Get cached execution result
   */
  getCachedResult(nodeId: string): ExecutionResult | undefined {
    return this.executionCache.get(nodeId);
  }

  /**
   * Clear execution cache for a node
   */
  clearCache(nodeId?: string): void {
    if (nodeId) {
      this.executionCache.delete(nodeId);
    } else {
      this.executionCache.clear();
    }
  }

  /**
   * Delete a node
   */
  deleteNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node "${nodeId}" not found`);
    }

    this.nodes.delete(nodeId);
    this.nodeStates.delete(nodeId);
    this.executionCache.delete(nodeId);

    this.emit('node:deleted', nodeId);
    console.log(`🗑️ [${nodeId}] Deleted`);
  }

  /**
   * Validate node configuration against constraints
   */
  validateNode(nodeId: string): { valid: boolean; errors: string[] } {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return { valid: false, errors: [`Node "${nodeId}" not found`] };
    }

    const errors: string[] = [];

    // Check constraints
    if (node.ui?.width) {
      if (
        node.constraints.minWidth &&
        node.ui.width < node.constraints.minWidth
      ) {
        errors.push(
          `Width (${node.ui.width}) is below minimum (${node.constraints.minWidth})`
        );
      }
      if (
        node.constraints.maxWidth &&
        node.ui.width > node.constraints.maxWidth
      ) {
        errors.push(
          `Width (${node.ui.width}) exceeds maximum (${node.constraints.maxWidth})`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export all nodes as JSON
   */
  export(): NodeDefinition[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Import nodes from JSON
   */
  async import(nodes: NodeDefinition[]): Promise<void> {
    for (const node of nodes) {
      this.nodes.set(node.id, node);
      this.nodeStates.set(node.id, 'loaded');
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalNodes: number;
    loadedNodes: number;
    collapsedNodes: number;
    errorNodes: number;
  } {
    let loaded = 0,
      collapsed = 0,
      error = 0;

    for (const state of this.nodeStates.values()) {
      if (state === 'loaded') loaded++;
      else if (state === 'collapsed') collapsed++;
      else if (state === 'error') error++;
    }

    return {
      totalNodes: this.nodes.size,
      loadedNodes: loaded,
      collapsedNodes: collapsed,
      errorNodes: error,
    };
  }
}
