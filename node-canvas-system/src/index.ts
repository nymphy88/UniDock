/**
 * Node Canvas System - Main Entry Point
 * ====================================
 * Export all public APIs
 */

// ========== TYPES ==========
export type { DataType, CoercionRules, ValidationRules } from './types/schema';
export type { InputSchema, OutputSchema } from './types/schema';
export { CommonSchemas } from './types/schema';

export type { NodeConstraints, NodeState, ExecutionResult } from './types/node';
export type { INodeExecutor, NodeDefinition } from './types/node';
export { BuiltInNodes } from './types/node';

// ========== CORE ENGINE ==========
export { DataCoercer, quickCoerce, coerceWithLog } from './core/data-coercer';
export type { CoercionResult } from './core/data-coercer';

export { NodeManager } from './core/node-manager';
export type { NodeExecutorMap } from './core/node-manager';

export { DataLinkManager } from './core/data-link';
export type { DataLink, DataFlowEvent } from './core/data-link';

export { CanvasOrchestrator } from './core/canvas';
export type { CanvasState } from './core/canvas';

// ========== VERSION ==========
export const VERSION = '1.0.0';
export const NAME = 'node-canvas-system';
