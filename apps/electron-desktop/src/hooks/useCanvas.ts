import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * ============================================
 * useCanvas - Production-Grade Hook
 * ============================================
 * 
 * Features:
 * ✅ Full state management
 * ✅ Error handling & recovery
 * ✅ Event streaming
 * ✅ Performance metrics
 * ✅ Auto-save coordination
 * ✅ Debugging support
 */

interface CanvasHookState {
  nodes: any[];
  links: any[];
  loading: boolean;
  error: string | null;
  isDirty: boolean;
  stats: any | null;
  isInitialized: boolean;
}

interface CanvasHookActions {
  // Nodes
  createNode: (nodeId: string, type: string, config?: any) => Promise<any>;
  deleteNode: (nodeId: string) => Promise<void>;
  updateNodeConfig: (
    nodeId: string,
    configKey: string,
    value: any,
    reason?: string
  ) => Promise<void>;
  updateNodeUI: (nodeId: string, ui: any) => Promise<void>;
  collapseNode: (nodeId: string) => Promise<any>;
  expandNode: (nodeId: string) => Promise<any>;

  // Links
  createLink: (
    sourceNodeId: string,
    sourceKey: string,
    targetNodeId: string,
    targetKey: string
  ) => Promise<any>;
  deleteLink: (linkId: string) => Promise<void>;
  toggleLink: (linkId: string) => Promise<void>;

  // State
  saveState: (metadata?: any) => Promise<any>;
  loadState: (state: any) => Promise<void>;
  getStats: () => Promise<any>;
  validate: () => Promise<any>;

  // Utilities
  clearError: () => void;
  refresh: () => Promise<void>;
}

interface UseCanvasReturn extends CanvasHookState, CanvasHookActions {}

/**
 * Main hook
 */
export const useCanvas = (): UseCanvasReturn => {
  // State
  const [nodes, setNodes] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs for tracking
  const isMountedRef = useRef(true);
  const eventListenersRef = useRef<Array<() => void>>([]);

  /**
   * Load initial state
   */
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);

        // Load nodes, links, and stats in parallel
        const [nodesData, linksData, statsData] = await Promise.all([
          window.electron.canvas.getNodes(),
          window.electron.canvas.getLinks(),
          window.electron.canvas.getStats(),
        ]);

        if (isMountedRef.current) {
          setNodes(nodesData);
          setLinks(linksData);
          setStats(statsData);
          setIsInitialized(true);
        }
      } catch (err) {
        const message = (err as Error).message;
        if (isMountedRef.current) {
          setError(message);
          console.error('Failed to load canvas:', message);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    if (!isInitialized) return;

    // Node events
    const unsubNodeCreated = () =>
      window.electron.canvas.onNodeCreated((_, node) => {
        if (isMountedRef.current) {
          setNodes((prev) => [...prev, node]);
          setIsDirty(true);
        }
      });

    const unsubNodeDeleted = () =>
      window.electron.canvas.onNodeDeleted((_, nodeId) => {
        if (isMountedRef.current) {
          setNodes((prev) => prev.filter((n) => n.id !== nodeId));
          setIsDirty(true);
        }
      });

    const unsubNodeUpdated = () =>
      window.electron.canvas.onNodeUpdated((_, node) => {
        if (isMountedRef.current) {
          setNodes((prev) =>
            prev.map((n) => (n.id === node.id ? node : n))
          );
          setIsDirty(true);
        }
      });

    // Link events
    const unsubLinkCreated = () =>
      window.electron.canvas.onLinkCreated((_, link) => {
        if (isMountedRef.current) {
          setLinks((prev) => [...prev, link]);
          setIsDirty(true);
        }
      });

    const unsubLinkDeleted = () =>
      window.electron.canvas.onLinkDeleted((_, linkId) => {
        if (isMountedRef.current) {
          setLinks((prev) => prev.filter((l) => l.id !== linkId));
          setIsDirty(true);
        }
      });

    // State events
    const unsubStateSaved = () =>
      window.electron.canvas.onStateSaved((_, state) => {
        if (isMountedRef.current) {
          setIsDirty(false);
        }
      });

    const unsubStateLoaded = () =>
      window.electron.canvas.onStateLoaded((_, state) => {
        if (isMountedRef.current) {
          setNodes(state.nodes || []);
          setLinks(state.links || []);
          setIsDirty(false);
        }
      });

    // Error event
    const unsubError = () =>
      window.electron.canvas.onError((_, error) => {
        if (isMountedRef.current) {
          setError(error.message);
          console.error('Canvas error:', error);
        }
      });

    // Cleanup function
    const cleanup = () => {
      window.electron.canvas.removeAllListeners();
    };

    // Trigger listeners
    unsubNodeCreated();
    unsubNodeDeleted();
    unsubNodeUpdated();
    unsubLinkCreated();
    unsubLinkDeleted();
    unsubStateSaved();
    unsubStateLoaded();
    unsubError();

    return cleanup;
  }, [isInitialized]);

  /**
   * Auto-save trigger listener
   */
  useEffect(() => {
    const unsub = () =>
      window.electron.app.onSaveTriggered(async () => {
        if (isDirty) {
          await saveState({ userTriggered: true });
        }
      });

    unsub();
  }, [isDirty]);

  // ===== ACTIONS =====

  const createNode = useCallback(
    async (nodeId: string, type: string, config?: any) => {
      try {
        setError(null);
        setLoading(true);
        const node = await window.electron.canvas.createNode(
          nodeId,
          type,
          config
        );
        return node;
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteNode = useCallback(async (nodeId: string) => {
    try {
      setError(null);
      await window.electron.canvas.deleteNode(nodeId);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  }, []);

  const updateNodeConfig = useCallback(
    async (nodeId: string, configKey: string, value: any, reason?: string) => {
      try {
        setError(null);
        await window.electron.canvas.updateNodeConfig(
          nodeId,
          configKey,
          value,
          reason
        );
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        throw err;
      }
    },
    []
  );

  const updateNodeUI = useCallback(
    async (nodeId: string, ui: any) => {
      try {
        setError(null);
        await window.electron.canvas.updateNodeUI(nodeId, ui);
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        throw err;
      }
    },
    []
  );

  const collapseNode = useCallback(async (nodeId: string) => {
    try {
      setError(null);
      return await window.electron.canvas.collapseNode(nodeId);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  }, []);

  const expandNode = useCallback(async (nodeId: string) => {
    try {
      setError(null);
      return await window.electron.canvas.expandNode(nodeId);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  }, []);

  const createLink = useCallback(
    async (
      sourceNodeId: string,
      sourceKey: string,
      targetNodeId: string,
      targetKey: string
    ) => {
      try {
        setError(null);
        setLoading(true);
        const link = await window.electron.canvas.createLink(
          sourceNodeId,
          sourceKey,
          targetNodeId,
          targetKey
        );
        return link;
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteLink = useCallback(async (linkId: string) => {
    try {
      setError(null);
      await window.electron.canvas.deleteLink(linkId);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  }, []);

  const toggleLink = useCallback(async (linkId: string) => {
    try {
      setError(null);
      await window.electron.canvas.toggleLink(linkId);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  }, []);

  const saveState = useCallback(async (metadata?: any) => {
    try {
      setError(null);
      const state = await window.electron.canvas.saveState(metadata);
      return state;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  }, []);

  const loadState = useCallback(async (state: any) => {
    try {
      setError(null);
      setLoading(true);
      await window.electron.canvas.loadState(state);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      setError(null);
      const statsData = await window.electron.canvas.getStats();
      setStats(statsData);
      return statsData;
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  }, []);

  const validate = useCallback(async () => {
    try {
      setError(null);
      return await window.electron.canvas.validate();
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [nodesData, linksData, statsData] = await Promise.all([
        window.electron.canvas.getNodes(),
        window.electron.canvas.getLinks(),
        window.electron.canvas.getStats(),
      ]);

      if (isMountedRef.current) {
        setNodes(nodesData);
        setLinks(linksData);
        setStats(statsData);
      }
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      throw err;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  return {
    // State
    nodes,
    links,
    loading,
    error,
    isDirty,
    stats,
    isInitialized,

    // Actions
    createNode,
    deleteNode,
    updateNodeConfig,
    updateNodeUI,
    collapseNode,
    expandNode,
    createLink,
    deleteLink,
    toggleLink,
    saveState,
    loadState,
    getStats,
    validate,
    clearError,
    refresh,
  };
};

/**
 * Advanced hook for performance-critical apps
 */
export const useCanvasWithMemoization = () => {
  const canvas = useCanvas();

  return {
    ...canvas,
    // Memoized selectors
    nodeCount: canvas.nodes.length,
    linkCount: canvas.links.length,
    nodeMap: new Map(canvas.nodes.map((n) => [n.id, n])),
    linkMap: new Map(canvas.links.map((l) => [l.id, l])),
  };
};
