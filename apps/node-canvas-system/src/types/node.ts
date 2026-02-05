/**
 * Node Definition - The blueprint for nodes
 * =========================================
 * Includes input/output schemas and safety constraints
 */

import { InputSchema, OutputSchema } from './schema';

/**
 * Safety constraints - what AI agents can/cannot modify
 */
export interface NodeConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  // Config keys that AI is allowed to modify
  allowedConfigKeys: string[];
  // Config keys that are read-only
  readOnlyKeys: string[];
  // Is this node allowed to connect to other nodes?
  allowConnections?: boolean;
  // Max number of incoming links
  maxIncomingLinks?: number;
  // Max number of outgoing links
  maxOutgoingLinks?: number;
}

/**
 * Node runtime state
 */
export type NodeState = 'idle' | 'running' | 'error' | 'completed';

/**
 * Main node definition
 */
export interface NodeDefinition {
  id: string;
  type: string; // e.g., 'calculator', 'note', 'data-loader'
  label?: string; // Display name
  description?: string;
  version?: string;

  // Data contracts
  inputSchema: InputSchema;
  outputSchema: OutputSchema;

  // Current configuration
  config: Record<string, any>;

  // Visual/UI state
  ui?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    color?: string;
    icon?: string;
    isCollapsed?: boolean;
  };

  // Execution state
  state?: NodeState;
  lastExecuted?: Date;
  executionTime?: number;

  // Safety boundaries
  constraints: NodeConstraints;

  // Metadata
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Node execution result
 */
export interface ExecutionResult {
  success: boolean;
  output?: Record<string, any>;
  error?: string;
  warnings?: string[];
  executionTime: number;
}

/**
 * Node executor interface - what nodes must implement
 */
export interface INodeExecutor {
  execute(input: Record<string, any>): Promise<ExecutionResult>;
  validate(input: Record<string, any>): boolean;
  getMetadata(): NodeDefinition;
}

// ============================================
// Pre-built node definitions
// ============================================

export const BuiltInNodes = {
  calculator: {
    type: 'calculator',
    label: 'Calculator',
    description: 'Mathematical expression evaluator',
    inputSchema: {
      fields: [
        {
          name: 'expression',
          type: 'string',
          required: true,
          coerce: { trim: true, removeQuotes: true },
          validate: {
            pattern: /^[\d+\-*/.().\s]+$/,
          },
          description: 'Math expression e.g., "2 + 2 * 5"',
        },
      ],
    },
    outputSchema: {
      fields: [
        {
          name: 'result',
          type: 'number',
          required: true,
          description: 'Calculated result',
        },
        {
          name: 'expression',
          type: 'string',
          required: false,
          description: 'Original expression',
        },
      ],
    },
    constraints: {
      minWidth: 200,
      maxWidth: 400,
      minHeight: 100,
      maxHeight: 300,
      allowedConfigKeys: ['precision', 'theme', 'fontSize'],
      readOnlyKeys: ['id', 'type'],
      allowConnections: true,
      maxIncomingLinks: 1,
      maxOutgoingLinks: 5,
    },
  } as Omit<NodeDefinition, 'id'>,

  note: {
    type: 'note',
    label: 'Note',
    description: 'Text note with linking support',
    inputSchema: {
      fields: [
        {
          name: 'content',
          type: 'string',
          required: true,
          coerce: { trim: true, removeQuotes: true },
          description: 'Note content',
        },
        {
          name: 'reference',
          type: 'any',
          required: false,
          description: 'Reference data from other nodes',
        },
      ],
    },
    outputSchema: {
      fields: [
        {
          name: 'content',
          type: 'string',
          required: true,
          description: 'Note content',
        },
        {
          name: 'reference',
          type: 'any',
          required: false,
          description: 'Linked reference',
        },
        {
          name: 'savedAt',
          type: 'string',
          required: true,
          description: 'Save timestamp',
        },
      ],
    },
    constraints: {
      minWidth: 250,
      maxWidth: 600,
      minHeight: 150,
      maxHeight: 800,
      allowedConfigKeys: ['maxChars', 'theme', 'fontSize', 'fontFamily'],
      readOnlyKeys: ['id', 'type'],
      allowConnections: true,
      maxIncomingLinks: 10,
      maxOutgoingLinks: 0,
    },
  } as Omit<NodeDefinition, 'id'>,

  dataLoader: {
    type: 'data-loader',
    label: 'Data Loader',
    description: 'Load data from files or API',
    inputSchema: {
      fields: [
        {
          name: 'source',
          type: 'string',
          required: true,
          coerce: { trim: true },
          description: 'File path or API URL',
        },
        {
          name: 'format',
          type: 'string',
          required: false,
          default: 'json',
          coerce: { toLowerCase: true },
          validate: { allowedValues: ['json', 'csv', 'txt'] },
        },
      ],
    },
    outputSchema: {
      fields: [
        {
          name: 'data',
          type: 'any',
          required: true,
          description: 'Loaded data',
        },
        {
          name: 'format',
          type: 'string',
          required: true,
          description: 'Data format',
        },
      ],
    },
    constraints: {
      minWidth: 200,
      maxWidth: 400,
      minHeight: 100,
      maxHeight: 250,
      allowedConfigKeys: ['timeout', 'theme'],
      readOnlyKeys: ['id', 'type'],
      allowConnections: true,
      maxIncomingLinks: 0,
      maxOutgoingLinks: 10,
    },
  } as Omit<NodeDefinition, 'id'>,

  dataSaver: {
    type: 'data-saver',
    label: 'Data Saver',
    description: 'Save data to file',
    inputSchema: {
      fields: [
        {
          name: 'data',
          type: 'any',
          required: true,
          description: 'Data to save',
        },
        {
          name: 'filename',
          type: 'string',
          required: true,
          coerce: { trim: true },
          description: 'Output filename',
        },
        {
          name: 'format',
          type: 'string',
          required: false,
          default: 'json',
          validate: { allowedValues: ['json', 'csv', 'txt'] },
        },
      ],
    },
    outputSchema: {
      fields: [
        {
          name: 'success',
          type: 'boolean',
          required: true,
          description: 'Save success status',
        },
        {
          name: 'path',
          type: 'string',
          required: false,
          description: 'Saved file path',
        },
      ],
    },
    constraints: {
      minWidth: 200,
      maxWidth: 400,
      minHeight: 100,
      maxHeight: 250,
      allowedConfigKeys: ['overwrite', 'theme'],
      readOnlyKeys: ['id', 'type'],
      allowConnections: true,
      maxIncomingLinks: 1,
      maxOutgoingLinks: 1,
    },
  } as Omit<NodeDefinition, 'id'>,
};
