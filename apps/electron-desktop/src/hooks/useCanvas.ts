import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * ============================================
 * useCanvas - FIXED VERSION
 * ============================================
 * 
 * Key fixes:
 * ✅ Proper event listener subscription (with cleanup)
 * ✅ Cleanup on unmount
 * ✅ Error handling
 * ✅ Loading states
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
  createNode: (nodeId: string, type: string, config?: any) => Promise<any>;
  deleteNode: (nodeId: string) => Promise<void>;
  updateNodeConfig: (nodeId: string, configKey: string, value: any, reason?: string) => Promise<void>;
  updateNodeUI: (nodeId: string, ui: any) => Promise<void>;
  collapseNode: (nodeId: string) => Promise<any>;
  expandNode: (nodeId: string) => Promise<any>;
  createLink: (sourceNodeId: string, sourceKey: string, targetNodeId: string, targetKey: string) => Promise<any>;
  deleteLink: (linkId: string) => Promise<void>;
  toggleLink: (linkId: string) => Promise<void>;
  saveState: (metadata?: any) => Promise<any>;
  loadState: (state: any) => Promise<void>;
  getStats: () => Promise<any>;
  validate: () => Promise<any>;
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
  const unsubscribersRef = useRef<Array<() => void>>([]);

  /**
   * Load initial state
   */
  useEffect(() => {
    const loadInitial = async () => {
      try {
        setLoading(true);

        // ← Guard: Check if window.electron exists, with retry
        let attempts = 0;
        while (!window.electron?.canvas && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.electron?.canvas) {
          throw new Error('Electron IPC bridge not available after 1s - preload failed to load');
        }

        console.log('[useCanvas] ✅ Electron bridge available');

        // Load nodes, links, and stats in parallel
        const [nodesData, linksData, statsData] = await Promise.all([
          window.electron.canvas.getNodes(),
          window.electron.canvas.getLinks(),
          window.electron.canvas.getStats(),
        ]);

        if (isMountedRef.current) {
          console.log('[useCanvas] Initial load:', {
            nodes: nodesData.length,
            links: linksData.length,
            stats: statsData,
          });
          setNodes(nodesData);
          setLinks(linksData);
          setStats(statsData);
          setIsInitialized(true);
        }
      } catch (err) {
        const message = (err as Error).message;
        if (isMountedRef.current) {
          setError(message);
          console.error('[useCanvas] Failed to load:', message);
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
   * Setup event listeners - FIXED VERSION
   * ← Subscribe and cleanup properly
   */
  useEffect(() => {
    if (!isInitialized) return;

    console.log('[useCanvas] Setting up event listeners...');

    // Clear old subscriptions
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    try {
      // ← Node events: subscribe and get unsubscribe function
      const unsubNodeCreated = window.electron.canvas.onNodeCreated((node: any) => {
        console.log('[useCanvas] Node created:', node.id);
        if (isMountedRef.current) {
          setNodes((prev) => [...prev, node]);
          setIsDirty(true);
        }
      });
      unsubscribersRef.current.push(unsubNodeCreated);

      const unsubNodeDeleted = window.electron.canvas.onNodeDeleted((nodeId: string) => {
        console.log('[useCanvas] Node deleted:', nodeId);
        if (isMountedRef.current) {
          setNodes((prev) => prev.filter((n) => n.id !== nodeId));
          setIsDirty(true);
        }
      });
      unsubscribersRef.current.push(unsubNodeDeleted);

      const unsubNodeUpdated = window.electron.canvas.onNodeUpdated((node: any) => {
        console.log('[useCanvas] Node updated:', node.id);
        if (isMountedRef.current) {
          setNodes((prev) =>
            prev.map((n) => (n.id === node.id ? node : n))
          );
          setIsDirty(true);
        }
      });
      unsubscribersRef.current.push(unsubNodeUpdated);

      // ← Link events
      const unsubLinkCreated = window.electron.canvas.onLinkCreated((link: any) => {
        console.log('[useCanvas] Link created:', link.id);
        if (isMountedRef.current) {
          setLinks((prev) => [...prev, link]);
          setIsDirty(true);
        }
      });
      unsubscribersRef.current.push(unsubLinkCreated);

      const unsubLinkDeleted = window.electron.canvas.onLinkDeleted((linkId: string) => {
        console.log('[useCanvas] Link deleted:', linkId);
        if (isMountedRef.current) {
          setLinks((prev) => prev.filter((l) => l.id !== linkId));
          setIsDirty(true);
        }
      });
      unsubscribersRef.current.push(unsubLinkDeleted);

      // ← State events
      const unsubStateSaved = window.electron.canvas.onStateSaved((state: any) => {
        console.log('[useCanvas] State saved');
        if (isMountedRef.current) {
          setIsDirty(false);
        }
      });
      unsubscribersRef.current.push(unsubStateSaved);

      const unsubStateLoaded = window.electron.canvas.onStateLoaded((state: any) => {
        console.log('[useCanvas] State loaded');
        if (isMountedRef.current) {
          setNodes(state.nodes || []);
          setLinks(state.links || []);
          setIsDirty(false);
        }
      });
      unsubscribersRef.current.push(unsubStateLoaded);

      // ← Error event
      const unsubError = window.electron.canvas.onError((error: any) => {
        console.error('[useCanvas] Canvas error:', error);
        if (isMountedRef.current) {
          setError(error.message);
        }
      });
      unsubscribersRef.current.push(unsubError);

      console.log('[useCanvas] ✅ Event listeners attached');
    } catch (err) {
      console.error('[useCanvas] Failed to setup listeners:', err);
      setError((err as Error).message);
    }

    // Cleanup function
    return () => {
      console.log('[useCanvas] Cleaning up event listeners...');
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [isInitialized]);

  // ===== ACTIONS =====

  const createNode = useCallback(
    async (nodeId: string, type: string, config?: any) => {
      try {
        setError(null);
        setLoading(true);
        console.log('[useCanvas] Creating node:', nodeId);
        
        const node = await window.electron.canvas.createNode(
          nodeId,
          type,
          config
        );
        
        console.log('[useCanvas] ✅ Node created response:', node);
        return node;
      } catch (err) {
        const message = (err as Error).message;
        setError(message);
        console.error('[useCanvas] Create node error:', message);
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
      console.log('[useCanvas] Deleting node:', nodeId);
      await window.electron.canvas.deleteNode(nodeId);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      console.error('[useCanvas] Delete node error:', message);
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
