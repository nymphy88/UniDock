/**
 * useCanvasOrchestrator Hook
 * Manages CanvasOrchestrator instance and provides unified API
 * Drop-in for your page.jsx
 */

import { useRef, useCallback, useEffect } from 'react';
import { CanvasOrchestrator, NodeDefinition } from 'node-canvas-system';
import { CalculatorExecutor } from '@/executors/CalculatorExecutor';
import { NotepadExecutor } from '@/executors/NotepadExecutor';
import { TerminalExecutor } from '@/executors/TerminalExecutor';
import { TimerExecutor } from '@/executors/TimerExecutor';
import { ImageExecutor } from '@/executors/ImageExecutor';
import { MusicExecutor } from '@/executors/MusicExecutor';
import { AIAPIExecutor } from '@/executors/AIAPIExecutor';
import { TableVariableExecutor } from '@/executors/TableVariableExecutor';
import { UniversalDockExecutor } from '@/executors/UniversalDockExecutor';
import { BakedModuleExecutor } from '@/executors/BakedModuleExecutor';

export function useCanvasOrchestrator() {
  const orchestratorRef = useRef<CanvasOrchestrator | null>(null);

  // Initialize orchestrator once
  useEffect(() => {
    if (!orchestratorRef.current) {
      const orchestrator = new CanvasOrchestrator();

      // Register all module executors
      orchestrator.registerExecutor('calculator', new CalculatorExecutor());
      orchestrator.registerExecutor('notepad', new NotepadExecutor());
      orchestrator.registerExecutor('terminal', new TerminalExecutor());
      orchestrator.registerExecutor('timer', new TimerExecutor());
      orchestrator.registerExecutor('image', new ImageExecutor());
      orchestrator.registerExecutor('music', new MusicExecutor());
      orchestrator.registerExecutor('aiapi', new AIAPIExecutor());
      orchestrator.registerExecutor('tablevariable', new TableVariableExecutor());
      orchestrator.registerExecutor('universaldock', new UniversalDockExecutor());
      orchestrator.registerExecutor('baked', new BakedModuleExecutor());

      orchestratorRef.current = orchestrator;

      console.log('✅ CanvasOrchestrator initialized with 10 modules');
    }
  }, []);

  /**
   * Create a new node
   */
  const createNode = useCallback(
    (nodeId: string, type: string, config?: Record<string, any>) => {
      if (!orchestratorRef.current) {
        throw new Error('Orchestrator not initialized');
      }
      return orchestratorRef.current.createNode(nodeId, type, config);
    },
    []
  );

  /**
   * Create a link between nodes
   */
  const createLink = useCallback(
    async (
      sourceNodeId: string,
      sourceKey: string,
      targetNodeId: string,
      targetKey: string
    ) => {
      if (!orchestratorRef.current) {
        throw new Error('Orchestrator not initialized');
      }
      return orchestratorRef.current.createLink(
        sourceNodeId,
        sourceKey,
        targetNodeId,
        targetKey
      );
    },
    []
  );

  /**
   * Flow data through a link (with auto-coercion!)
   */
  const flowData = useCallback(
    async (linkId: string, data: any) => {
      if (!orchestratorRef.current) {
        throw new Error('Orchestrator not initialized');
      }
      return orchestratorRef.current.linkManager.flowData(linkId, data);
    },
    []
  );

  /**
   * Update node configuration (respects constraints)
   */
  const updateNodeConfig = useCallback(
    (nodeId: string, configKey: string, value: any, reason?: string) => {
      if (!orchestratorRef.current) {
        throw new Error('Orchestrator not initialized');
      }
      orchestratorRef.current.updateNodeConfig(nodeId, configKey, value, reason);
    },
    []
  );

  /**
   * Update node UI state
   */
  const updateNodeUI = useCallback(
    (nodeId: string, ui: Partial<NodeDefinition['ui']>) => {
      if (!orchestratorRef.current) {
        throw new Error('Orchestrator not initialized');
      }
      orchestratorRef.current.updateNodeUI(nodeId, ui);
    },
    []
  );

  /**
   * Collapse node to save memory
   */
  const collapseNode = useCallback(async (nodeId: string) => {
    if (!orchestratorRef.current) {
      throw new Error('Orchestrator not initialized');
    }
    return orchestratorRef.current.collapseNode(nodeId);
  }, []);

  /**
   * Expand node to restore
   */
  const expandNode = useCallback(async (nodeId: string) => {
    if (!orchestratorRef.current) {
      throw new Error('Orchestrator not initialized');
    }
    return orchestratorRef.current.expandNode(nodeId);
  }, []);

  /**
   * Delete a node
   */
  const deleteNode = useCallback((nodeId: string) => {
    if (!orchestratorRef.current) {
      throw new Error('Orchestrator not initialized');
    }
    orchestratorRef.current.deleteNode(nodeId);
  }, []);

  /**
   * Delete a link
   */
  const deleteLink = useCallback((linkId: string) => {
    if (!orchestratorRef.current) {
      throw new Error('Orchestrator not initialized');
    }
    orchestratorRef.current.deleteLink(linkId);
  }, []);

  /**
   * Get all nodes
   */
  const getAllNodes = useCallback(() => {
    if (!orchestratorRef.current) {
      return [];
    }
    return orchestratorRef.current.getAllNodes();
  }, []);

  /**
   * Get all links
   */
  const getLinks = useCallback(() => {
    if (!orchestratorRef.current) {
      return [];
    }
    return orchestratorRef.current.getLinks();
  }, []);

  /**
   * Save canvas state
   */
  const saveState = useCallback((metadata?: any) => {
    if (!orchestratorRef.current) {
      throw new Error('Orchestrator not initialized');
    }
    return orchestratorRef.current.saveState(metadata);
  }, []);

  /**
   * Load canvas state
   */
  const loadState = useCallback(async (state: any) => {
    if (!orchestratorRef.current) {
      throw new Error('Orchestrator not initialized');
    }
    return orchestratorRef.current.loadState(state);
  }, []);

  /**
   * Get statistics
   */
  const getStats = useCallback(() => {
    if (!orchestratorRef.current) {
      return null;
    }
    return orchestratorRef.current.getStats();
  }, []);

  /**
   * Get flow history for debugging
   */
  const getFlowHistory = useCallback((limit?: number) => {
    if (!orchestratorRef.current) {
      return [];
    }
    return orchestratorRef.current.getFlowHistory(limit);
  }, []);

  return {
    orchestrator: orchestratorRef.current,
    // Node operations
    createNode,
    deleteNode,
    updateNodeConfig,
    updateNodeUI,
    collapseNode,
    expandNode,
    getAllNodes,
    // Link operations
    createLink,
    deleteLink,
    flowData,
    getLinks,
    // State management
    saveState,
    loadState,
    // Debugging
    getStats,
    getFlowHistory,
  };
}

export type CanvasOrchestrator API = ReturnType<typeof useCanvasOrchestrator>;
