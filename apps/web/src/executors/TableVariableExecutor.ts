/**
 * Table Variable Module Executor
 * Wraps the existing TableVariableModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class TableVariableExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const variables = input.variables || [];

      return {
        success: true,
        output: {
          variables: Array.isArray(variables) ? variables : [variables],
          count: Array.isArray(variables) ? variables.length : 1,
          lastUpdated: new Date().toISOString(),
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Table operation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    return true; // Table always valid
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'tablevariable',
      type: 'tablevariable',
      label: 'Table Variable',
      description: 'Data table with variables',
      config: {},

      inputSchema: {
        fields: [
          {
            name: 'variables',
            type: 'array',
            required: false,
            default: [],
            description: 'Table variables',
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'variables',
            type: 'array',
            required: true,
            description: 'Table data',
          },
          {
            name: 'count',
            type: 'number',
            required: true,
            description: 'Variable count',
          },
          {
            name: 'lastUpdated',
            type: 'string',
            required: true,
            description: 'Last update timestamp',
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
        maxOutgoingLinks: 10,
      },
    };
  }
}
