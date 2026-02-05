/**
 * Universal Dock Module Executor
 * Wraps the existing UniversalDockModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class UniversalDockExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const files = input.files || [];
      const data = input.data;

      return {
        success: true,
        output: {
          files: Array.isArray(files) ? files : [files],
          data: data,
          fileCount: Array.isArray(files) ? files.length : (files ? 1 : 0),
          timestamp: new Date().toISOString(),
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Dock operation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    return true; // Dock always valid
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'universaldock',
      type: 'universaldock',
      label: 'Universal Dock',
      description: 'Multi-format file upload and storage',
      config: {},

      inputSchema: {
        fields: [
          {
            name: 'files',
            type: 'array',
            required: false,
            default: [],
            description: 'Files to upload',
          },
          {
            name: 'data',
            type: 'any',
            required: false,
            description: 'Additional data',
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'files',
            type: 'array',
            required: true,
            description: 'Uploaded files',
          },
          {
            name: 'data',
            type: 'any',
            required: false,
            description: 'Associated data',
          },
          {
            name: 'fileCount',
            type: 'number',
            required: true,
            description: 'Number of files',
          },
          {
            name: 'timestamp',
            type: 'string',
            required: true,
            description: 'Upload timestamp',
          },
        ],
      },

      constraints: {
        minWidth: 250,
        maxWidth: 600,
        minHeight: 200,
        maxHeight: 500,
        allowedConfigKeys: ['theme'],
        readOnlyKeys: ['id', 'type'],
        allowConnections: true,
        maxIncomingLinks: 10,
        maxOutgoingLinks: 5,
      },
    };
  }
}
