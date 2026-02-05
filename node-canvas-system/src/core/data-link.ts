/**
 * Data Link Manager - Connect nodes with automatic data transformation
 * ===================================================================
 * When nodes connect, data automatically flows with coercion applied
 */

import { EventEmitter } from 'events';
import { DataCoercer, CoercionResult } from './data-coercer';
import { InputSchema, OutputSchema } from '../types/schema';
import { NodeDefinition } from '../types/node';

export interface DataLink {
  id: string;
  sourceNodeId: string;
  sourceKey: string; // output key
  targetNodeId: string;
  targetKey: string; // input key
  sourceSchema: OutputSchema;
  targetSchema: InputSchema;
  coercionLog: string[]; // Latest transformation log
  isActive: boolean;
  createdAt: Date;
  lastDataFlow?: Date;
}

export interface DataFlowEvent {
  linkId: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceData: any;
  coercedData: any;
  coercionResult: CoercionResult;
  timestamp: Date;
}

export class DataLinkManager extends EventEmitter {
  private links: Map<string, DataLink> = new Map();
  private coercer = new DataCoercer();
  private nodeRegistry: Map<string, NodeDefinition> = new Map();
  private subscriptions: Map<string, Set<Function>> = new Map(); // linkId -> callbacks
  private flowHistory: DataFlowEvent[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
  }

  /**
   * Register a node for linking
   */
  registerNode(node: NodeDefinition): void {
    this.nodeRegistry.set(node.id, node);
  }

  /**
   * Create a connection between two nodes
   * Validates that connection is allowed and creates bi-directional listeners
   */
  async createLink(
    sourceNodeId: string,
    sourceKey: string,
    targetNodeId: string,
    targetKey: string
  ): Promise<DataLink> {
    const sourceNode = this.nodeRegistry.get(sourceNodeId);
    const targetNode = this.nodeRegistry.get(targetNodeId);

    if (!sourceNode) {
      throw new Error(`Source node "${sourceNodeId}" not found`);
    }
    if (!targetNode) {
      throw new Error(`Target node "${targetNodeId}" not found`);
    }

    // Validate source has output key
    const sourceField = sourceNode.outputSchema.fields.find(
      (f) => f.name === sourceKey
    );
    if (!sourceField) {
      throw new Error(
        `Source node "${sourceNodeId}" has no output field "${sourceKey}"`
      );
    }

    // Validate target has input key
    const targetField = targetNode.inputSchema.fields.find(
      (f) => f.name === targetKey
    );
    if (!targetField) {
      throw new Error(
        `Target node "${targetNodeId}" has no input field "${targetKey}"`
      );
    }

    // Check connection constraints
    if (sourceNode.constraints.allowConnections === false) {
      throw new Error(`Source node "${sourceNodeId}" doesn't allow connections`);
    }
    if (targetNode.constraints.allowConnections === false) {
      throw new Error(`Target node "${targetNodeId}" doesn't allow connections`);
    }

    // Check max incoming links
    const incomingLinks = Array.from(this.links.values()).filter(
      (l) => l.targetNodeId === targetNodeId && l.isActive
    ).length;
    if (
      targetNode.constraints.maxIncomingLinks &&
      incomingLinks >= targetNode.constraints.maxIncomingLinks
    ) {
      throw new Error(
        `Target node has reached max incoming links (${targetNode.constraints.maxIncomingLinks})`
      );
    }

    // Check max outgoing links
    const outgoingLinks = Array.from(this.links.values()).filter(
      (l) => l.sourceNodeId === sourceNodeId && l.isActive
    ).length;
    if (
      sourceNode.constraints.maxOutgoingLinks &&
      outgoingLinks >= sourceNode.constraints.maxOutgoingLinks
    ) {
      throw new Error(
        `Source node has reached max outgoing links (${sourceNode.constraints.maxOutgoingLinks})`
      );
    }

    const link: DataLink = {
      id: `link-${sourceNodeId}-${targetNodeId}-${Date.now()}`,
      sourceNodeId,
      sourceKey,
      targetNodeId,
      targetKey,
      sourceSchema: sourceNode.outputSchema,
      targetSchema: targetNode.inputSchema,
      coercionLog: [],
      isActive: true,
      createdAt: new Date(),
    };

    this.links.set(link.id, link);
    this.subscriptions.set(link.id, new Set());

    // Emit link created event
    this.emit('link:created', link);

    console.log(
      `✅ Link created: [${sourceNodeId}.${sourceKey}] → [${targetNodeId}.${targetKey}]`
    );

    return link;
  }

  /**
   * Data flows through link - apply coercion
   */
  async flowData(
    linkId: string,
    sourceData: any
  ): Promise<{ success: boolean; coercedData: any; log: string[] }> {
    const link = this.links.get(linkId);
    if (!link) {
      throw new Error(`Link "${linkId}" not found`);
    }

    if (!link.isActive) {
      throw new Error(`Link "${linkId}" is not active`);
    }

    // Prepare input for coercion
    const inputForCoercion = {
      [link.targetKey]: sourceData,
    };

    // Apply smart coercion
    const coercionResult = this.coercer.coerce(
      inputForCoercion,
      link.targetSchema
    );

    const coercedData = coercionResult.data[link.targetKey];

    // Update link state
    link.coercionLog = coercionResult.log;
    link.lastDataFlow = new Date();

    // Record flow event
    const event: DataFlowEvent = {
      linkId,
      sourceNodeId: link.sourceNodeId,
      targetNodeId: link.targetNodeId,
      sourceData,
      coercedData,
      coercionResult,
      timestamp: new Date(),
    };

    this.recordFlowEvent(event);

    // Emit flow event
    this.emit('data:flow', event);

    // Notify subscribers
    const callbacks = this.subscriptions.get(linkId);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          await callback(coercedData);
        } catch (error) {
          console.error(`Callback error for link ${linkId}:`, error);
        }
      }
    }

    console.log(
      `📤 [${link.sourceNodeId}] → [${link.targetNodeId}]: ${coercionResult.log.join(' ')}`
    );

    return {
      success: coercionResult.isValid,
      coercedData,
      log: coercionResult.log,
    };
  }

  /**
   * Subscribe to data flow on a link
   */
  onDataFlow(linkId: string, callback: (data: any) => Promise<void>): () => void {
    const callbacks = this.subscriptions.get(linkId);
    if (!callbacks) {
      throw new Error(`Link "${linkId}" not found`);
    }

    callbacks.add(callback);

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback);
    };
  }

  /**
   * Disable a link (but keep it for history)
   */
  disableLink(linkId: string): void {
    const link = this.links.get(linkId);
    if (!link) {
      throw new Error(`Link "${linkId}" not found`);
    }

    link.isActive = false;
    this.emit('link:disabled', link);
    console.log(`🔗 Link disabled: ${linkId}`);
  }

  /**
   * Enable a link
   */
  enableLink(linkId: string): void {
    const link = this.links.get(linkId);
    if (!link) {
      throw new Error(`Link "${linkId}" not found`);
    }

    link.isActive = true;
    this.emit('link:enabled', link);
    console.log(`🔗 Link enabled: ${linkId}`);
  }

  /**
   * Delete a link
   */
  deleteLink(linkId: string): void {
    const link = this.links.get(linkId);
    if (!link) {
      throw new Error(`Link "${linkId}" not found`);
    }

    this.links.delete(linkId);
    this.subscriptions.delete(linkId);
    this.emit('link:deleted', link);
    console.log(`🔗 Link deleted: ${linkId}`);
  }

  /**
   * Get all links for a node
   */
  getNodeLinks(
    nodeId: string,
    direction?: 'in' | 'out'
  ): DataLink[] {
    return Array.from(this.links.values()).filter((link) => {
      if (direction === 'in') return link.targetNodeId === nodeId;
      if (direction === 'out') return link.sourceNodeId === nodeId;
      return link.sourceNodeId === nodeId || link.targetNodeId === nodeId;
    });
  }

  /**
   * Get link by ID
   */
  getLink(linkId: string): DataLink | undefined {
    return this.links.get(linkId);
  }

  /**
   * Get all active links
   */
  getAllLinks(): DataLink[] {
    return Array.from(this.links.values());
  }

  /**
   * Get flow history for debugging
   */
  getFlowHistory(limit?: number): DataFlowEvent[] {
    if (limit) {
      return this.flowHistory.slice(-limit);
    }
    return [...this.flowHistory];
  }

  /**
   * Get flow history for specific link
   */
  getLinkFlowHistory(linkId: string, limit: number = 10): DataFlowEvent[] {
    return this.flowHistory
      .filter((event) => event.linkId === linkId)
      .slice(-limit);
  }

  /**
   * Clear flow history
   */
  clearFlowHistory(): void {
    this.flowHistory = [];
    this.emit('history:cleared');
  }

  /**
   * Record flow event with size limit
   */
  private recordFlowEvent(event: DataFlowEvent): void {
    this.flowHistory.push(event);
    if (this.flowHistory.length > this.maxHistorySize) {
      this.flowHistory.shift();
    }
  }

  /**
   * Get link compatibility (for UI suggestions)
   */
  getLinkCompatibility(
    sourceNodeId: string,
    sourceKey: string,
    targetNodeId: string,
    targetKey: string
  ): { compatible: boolean; reason?: string } {
    const sourceNode = this.nodeRegistry.get(sourceNodeId);
    const targetNode = this.nodeRegistry.get(targetNodeId);

    if (!sourceNode || !targetNode) {
      return { compatible: false, reason: 'Node not found' };
    }

    const sourceField = sourceNode.outputSchema.fields.find(
      (f) => f.name === sourceKey
    );
    const targetField = targetNode.inputSchema.fields.find(
      (f) => f.name === targetKey
    );

    if (!sourceField || !targetField) {
      return { compatible: false, reason: 'Field not found' };
    }

    // Any type can connect to any type (coercer will handle it)
    return { compatible: true };
  }

  /**
   * Export all links as JSON
   */
  export(): DataLink[] {
    return Array.from(this.links.values());
  }

  /**
   * Import links from JSON
   */
  async import(links: DataLink[]): Promise<void> {
    for (const link of links) {
      try {
        this.links.set(link.id, link);
      } catch (error) {
        console.error(`Failed to import link ${link.id}:`, error);
      }
    }
  }
}
