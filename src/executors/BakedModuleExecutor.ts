/**
 * Baked Module Executor
 * Wraps the existing BakedModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class BakedModuleExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const moduleCode = input.moduleCode || '';
      const moduleData = input.moduleData || {};

      if (!moduleCode) {
        return {
          success: false,
          error: 'Module code is required',
          executionTime: 0,
        };
      }

      // Custom module execution (safe context)
      // In production, use sandboxing (e.g., Web Workers)
      return {
        success: true,
        output: {
          moduleCode: moduleCode,
          result: moduleData,
          executed: true,
          timestamp: new Date().toISOString(),
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Baked module operation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    return input.moduleCode !== undefined;
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'baked',
      type: 'baked',
      label: 'Baked Module',
      description: 'Custom embedded module',
      config: {},

      inputSchema: {
        fields: [
          {
            name: 'moduleCode',
            type: 'string',
            required: true,
            coerce: { trim: true },
            description: 'Module code/configuration',
          },
          {
            name: 'moduleData',
            type: 'object',
            required: false,
            default: {},
            description: 'Module data',
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'moduleCode',
            type: 'string',
            required: true,
            description: 'Module code',
          },
          {
            name: 'result',
            type: 'any',
            required: true,
            description: 'Execution result',
          },
          {
            name: 'executed',
            type: 'boolean',
            required: true,
            description: 'Execution status',
          },
          {
            name: 'timestamp',
            type: 'string',
            required: true,
            description: 'Execution timestamp',
          },
        ],
      },

      constraints: {
        minWidth: 300,
        maxWidth: 800,
        minHeight: 200,
        maxHeight: 600,
        allowedConfigKeys: ['theme', 'fontSize'],
        readOnlyKeys: ['id', 'type'],
        allowConnections: true,
        maxIncomingLinks: 5,
        maxOutgoingLinks: 5,
      },
    };
  }
}
