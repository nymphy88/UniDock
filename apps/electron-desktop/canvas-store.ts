/**
 * ============================================
 * Canvas Store - Modular State Management
 * ============================================
 * 
 * Handles:
 * ✅ Node CRUD
 * ✅ Link CRUD
 * ✅ State persistence
 * ✅ Event emission
 * ✅ Type-safe operations
 */

export interface Node {
  id: string;
  type: string;
  label?: string;
  config?: Record<string, any>;
  ui?: Record<string, any>;
  collapsed?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Link {
  id: string;
  sourceNodeId: string;
  sourceKey: string;
  targetNodeId: string;
  targetKey: string;
  enabled: boolean;
  createdAt: number;
}

export interface CanvasState {
  nodes: Node[];
  links: Link[];
  metadata?: Record<string, any>;
  savedAt?: number;
}

type EventListener<T> = (data: T) => void;

/**
 * In-memory Canvas Store with event system
 * ← Modular: ใช้ pattern factory → easy to swap to DB later
 */
export class CanvasStore {
  private nodes: Map<string, Node> = new Map();
  private links: Map<string, Link> = new Map();
  private isDirty = false;

  // Event listeners (pub/sub pattern)
  private listeners: Record<string, EventListener<any>[]> = {
    'node:created': [],
    'node:deleted': [],
    'node:updated': [],
    'link:created': [],
    'link:deleted': [],
    'state:saved': [],
    'error': [],
  };

  /**
   * NODE OPERATIONS
   */

  createNode(nodeId: string, type: string, config?: Record<string, any>): Node {
    if (this.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} already exists`);
    }

    const node: Node = {
      id: nodeId,
      type,
      config: config || {},
      ui: {},
      collapsed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.nodes.set(nodeId, node);
    this.isDirty = true;
    this.emit('node:created', node);

    return node;
  }

  deleteNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Clean up associated links
    const linksToDelete = Array.from(this.links.values()).filter(
      (l) => l.sourceNodeId === nodeId || l.targetNodeId === nodeId
    );
    linksToDelete.forEach((link) => {
      this.links.delete(link.id);
    });

    this.nodes.delete(nodeId);
    this.isDirty = true;
    this.emit('node:deleted', nodeId);
  }

  getNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  updateNodeConfig(
    nodeId: string,
    configKey: string,
    value: any,
    reason?: string
  ): Node {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    node.config = node.config || {};
    node.config[configKey] = value;
    node.updatedAt = Date.now();
    this.isDirty = true;
    this.emit('node:updated', node);

    return node;
  }

  updateNodeUI(nodeId: string, ui: Record<string, any>): Node {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    node.ui = { ...node.ui, ...ui };
    node.updatedAt = Date.now();
    this.isDirty = true;
    this.emit('node:updated', node);

    return node;
  }

  collapseNode(nodeId: string): Node {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    node.collapsed = true;
    node.updatedAt = Date.now();
    this.isDirty = true;
    this.emit('node:updated', node);

    return node;
  }

  expandNode(nodeId: string): Node {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    node.collapsed = false;
    node.updatedAt = Date.now();
    this.isDirty = true;
    this.emit('node:updated', node);

    return node;
  }

  /**
   * LINK OPERATIONS
   */

  createLink(
    sourceNodeId: string,
    sourceKey: string,
    targetNodeId: string,
    targetKey: string
  ): Link {
    // Validate nodes exist
    if (!this.nodes.has(sourceNodeId)) {
      throw new Error(`Source node ${sourceNodeId} not found`);
    }
    if (!this.nodes.has(targetNodeId)) {
      throw new Error(`Target node ${targetNodeId} not found`);
    }

    const linkId = `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const link: Link = {
      id: linkId,
      sourceNodeId,
      sourceKey,
      targetNodeId,
      targetKey,
      enabled: true,
      createdAt: Date.now(),
    };

    this.links.set(linkId, link);
    this.isDirty = true;
    this.emit('link:created', link);

    return link;
  }

  deleteLink(linkId: string): void {
    const link = this.links.get(linkId);
    if (!link) {
      throw new Error(`Link ${linkId} not found`);
    }

    this.links.delete(linkId);
    this.isDirty = true;
    this.emit('link:deleted', linkId);
  }

  getLinks(): Link[] {
    return Array.from(this.links.values());
  }

  toggleLink(linkId: string): Link {
    const link = this.links.get(linkId);
    if (!link) {
      throw new Error(`Link ${linkId} not found`);
    }

    link.enabled = !link.enabled;
    this.isDirty = true;

    return link;
  }

  /**
   * STATE MANAGEMENT
   */

  getState(): CanvasState {
    return {
      nodes: this.getNodes(),
      links: this.getLinks(),
    };
  }

  setState(state: CanvasState): void {
    // Clear existing
    this.nodes.clear();
    this.links.clear();

    // Load nodes
    state.nodes.forEach((node) => {
      this.nodes.set(node.id, node);
    });

    // Load links
    state.links.forEach((link) => {
      this.links.set(link.id, link);
    });

    this.isDirty = false;
    this.emit('state:saved', state);
  }

  saveable(): CanvasState {
    return {
      nodes: this.getNodes(),
      links: this.getLinks(),
      savedAt: Date.now(),
    };
  }

  isDirtyState(): boolean {
    return this.isDirty;
  }

  markClean(): void {
    this.isDirty = false;
  }

  /**
   * VALIDATION
   */

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check: all link references valid
    this.links.forEach((link) => {
      if (!this.nodes.has(link.sourceNodeId)) {
        errors.push(`Link ${link.id}: source node not found`);
      }
      if (!this.nodes.has(link.targetNodeId)) {
        errors.push(`Link ${link.id}: target node not found`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * STATS
   */

  getStats() {
    return {
      nodeCount: this.nodes.size,
      linkCount: this.links.size,
      isDirty: this.isDirty,
      estimatedMemory: this.estimateMemory(),
    };
  }

  private estimateMemory(): number {
    return (
      this.nodes.size * 150 + // rough estimate: ~150 bytes per node
      this.links.size * 100   // rough estimate: ~100 bytes per link
    );
  }

  /**
   * EVENT SYSTEM (Pub/Sub)
   */

  on<T>(event: string, listener: EventListener<T>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(listener as EventListener<any>);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
    };
  }

  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach((listener) => {
        try {
          listener(data);
        } catch (err) {
          console.error(`Error in listener for ${event}:`, err);
          this.emit('error', err);
        }
      });
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners[event] = [];
    } else {
      Object.keys(this.listeners).forEach((key) => {
        this.listeners[key] = [];
      });
    }
  }

  /**
   * CLEAR (for testing)
   */

  clear(): void {
    this.nodes.clear();
    this.links.clear();
    this.isDirty = false;
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let storeInstance: CanvasStore | null = null;

export function getCanvasStore(): CanvasStore {
  if (!storeInstance) {
    storeInstance = new CanvasStore();
  }
  return storeInstance;
}

export function createCanvasStore(): CanvasStore {
  return new CanvasStore();
}
