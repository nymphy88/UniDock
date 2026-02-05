/**
 * Calculator Module Executor
 * Wraps the existing CalculatorModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class CalculatorExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const expression = input.expression || '';
      
      if (!expression) {
        return {
          success: false,
          error: 'Expression is required',
          executionTime: 0,
        };
      }

      // Safe math evaluation (use math.js for production)
      // For now, basic eval with validation
      const safeExpression = expression.replace(/[^0-9+\-*/().% ]/g, '');
      
      if (safeExpression !== expression) {
        return {
          success: false,
          error: 'Invalid characters in expression',
          executionTime: 0,
        };
      }

      const result = Function('"use strict"; return (' + safeExpression + ')')();

      return {
        success: true,
        output: {
          result: Number(result.toFixed(10)),
          expression: expression,
          display: String(result),
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Calculation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    return input.expression !== undefined && input.expression !== '';
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'calculator',
      type: 'calculator',
      label: 'Calculator',
      description: 'Mathematical expression evaluator',
      config: { precision: 2 },

      inputSchema: {
        fields: [
          {
            name: 'expression',
            type: 'string',
            required: true,
            coerce: { trim: true, removeQuotes: true },
            description: 'Math expression e.g., "2 + 3 * 5"',
            validate: {
              pattern: /^[0-9+\-*/().% ]+$/,
            },
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'result',
            type: 'number',
            required: true,
            description: 'Calculation result',
          },
          {
            name: 'expression',
            type: 'string',
            required: false,
            description: 'Original expression',
          },
          {
            name: 'display',
            type: 'string',
            required: false,
            description: 'Display-ready result',
          },
        ],
      },

      constraints: {
        minWidth: 200,
        maxWidth: 400,
        minHeight: 100,
        maxHeight: 300,
        allowedConfigKeys: ['precision'],
        readOnlyKeys: ['id', 'type'],
        allowConnections: true,
        maxIncomingLinks: 1,
        maxOutgoingLinks: 5,
      },
    };
  }
}
