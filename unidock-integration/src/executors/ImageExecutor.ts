/**
 * Image Module Executor
 * Wraps the existing ImageModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class ImageExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const imageUrl = input.imageUrl || input.url || '';
      const width = input.width || 300;
      const height = input.height || 300;

      if (!imageUrl) {
        return {
          success: false,
          error: 'Image URL is required',
          executionTime: 0,
        };
      }

      return {
        success: true,
        output: {
          imageUrl: imageUrl,
          displayed: true,
          width: Number(width),
          height: Number(height),
          loadTime: new Date().toISOString(),
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image operation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    const imageUrl = input.imageUrl || input.url;
    return imageUrl !== undefined && imageUrl !== '';
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'image',
      type: 'image',
      label: 'Image Viewer',
      description: 'Display images from URL',
      config: { width: 300, height: 300 },

      inputSchema: {
        fields: [
          {
            name: 'imageUrl',
            type: 'string',
            required: true,
            coerce: { trim: true, removeQuotes: true },
            description: 'Image URL',
            validate: { isURL: true },
          },
          {
            name: 'width',
            type: 'number',
            required: false,
            default: 300,
            coerce: { parseInt: true },
            description: 'Display width',
          },
          {
            name: 'height',
            type: 'number',
            required: false,
            default: 300,
            coerce: { parseInt: true },
            description: 'Display height',
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'imageUrl',
            type: 'string',
            required: true,
            description: 'Image URL',
          },
          {
            name: 'displayed',
            type: 'boolean',
            required: true,
            description: 'Display status',
          },
          {
            name: 'width',
            type: 'number',
            required: false,
            description: 'Actual width',
          },
          {
            name: 'height',
            type: 'number',
            required: false,
            description: 'Actual height',
          },
        ],
      },

      constraints: {
        minWidth: 200,
        maxWidth: 800,
        minHeight: 200,
        maxHeight: 800,
        allowedConfigKeys: ['width', 'height'],
        readOnlyKeys: ['id', 'type'],
        allowConnections: true,
        maxIncomingLinks: 1,
        maxOutgoingLinks: 3,
      },
    };
  }
}
