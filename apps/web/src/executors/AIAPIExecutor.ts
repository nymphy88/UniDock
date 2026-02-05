/**
 * AI API Module Executor
 * Wraps the existing AIAPIModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class AIAPIExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const prompt = input.prompt || '';
      const apiEndpoint = input.apiEndpoint || '/api/ai/generate';

      if (!prompt) {
        return {
          success: false,
          error: 'Prompt is required',
          executionTime: 0,
        };
      }

      // Simulate API call (actual call happens in UI component)
      return {
        success: true,
        output: {
          prompt: prompt,
          response: '[API Response - UI will handle]',
          endpoint: apiEndpoint,
          timestamp: new Date().toISOString(),
          status: 'queued',
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI API operation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    return input.prompt !== undefined && input.prompt !== '';
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'aiapi',
      type: 'aiapi',
      label: 'AI API',
      description: 'AI prompt and response handler',
      config: { endpoint: '/api/ai/generate' },

      inputSchema: {
        fields: [
          {
            name: 'prompt',
            type: 'string',
            required: true,
            coerce: { trim: true, removeQuotes: true },
            description: 'Prompt for AI',
            validate: { minLength: 1 },
          },
          {
            name: 'apiEndpoint',
            type: 'string',
            required: false,
            default: '/api/ai/generate',
            description: 'API endpoint',
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'prompt',
            type: 'string',
            required: true,
            description: 'Original prompt',
          },
          {
            name: 'response',
            type: 'string',
            required: true,
            description: 'AI response',
          },
          {
            name: 'endpoint',
            type: 'string',
            required: false,
            description: 'Used endpoint',
          },
          {
            name: 'timestamp',
            type: 'string',
            required: true,
            description: 'Request timestamp',
          },
          {
            name: 'status',
            type: 'string',
            required: false,
            description: 'Request status',
          },
        ],
      },

      constraints: {
        minWidth: 250,
        maxWidth: 600,
        minHeight: 200,
        maxHeight: 600,
        allowedConfigKeys: ['endpoint', 'theme'],
        readOnlyKeys: ['id', 'type'],
        allowConnections: true,
        maxIncomingLinks: 5,
        maxOutgoingLinks: 3,
      },
    };
  }
}
