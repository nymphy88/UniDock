/**
 * Music Player Module Executor
 * Wraps the existing MusicModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class MusicExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const audioUrl = input.audioUrl || input.url || '';
      const isPlaying = input.isPlaying || false;
      const currentTime = input.currentTime || 0;
      const volume = input.volume || 100;

      if (!audioUrl) {
        return {
          success: false,
          error: 'Audio URL is required',
          executionTime: 0,
        };
      }

      return {
        success: true,
        output: {
          audioUrl: audioUrl,
          isPlaying: Boolean(isPlaying),
          currentTime: Number(currentTime),
          volume: Number(volume),
          status: isPlaying ? 'playing' : 'stopped',
          loadTime: new Date().toISOString(),
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Music operation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    const audioUrl = input.audioUrl || input.url;
    return audioUrl !== undefined && audioUrl !== '';
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'music',
      type: 'music',
      label: 'Music Player',
      description: 'Audio player with controls',
      config: { volume: 100 },

      inputSchema: {
        fields: [
          {
            name: 'audioUrl',
            type: 'string',
            required: true,
            coerce: { trim: true, removeQuotes: true },
            description: 'Audio file URL',
          },
          {
            name: 'isPlaying',
            type: 'boolean',
            required: false,
            default: false,
            description: 'Play status',
          },
          {
            name: 'currentTime',
            type: 'number',
            required: false,
            default: 0,
            description: 'Current playback time (seconds)',
          },
          {
            name: 'volume',
            type: 'number',
            required: false,
            default: 100,
            coerce: { parseInt: true },
            description: 'Volume level (0-100)',
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'audioUrl',
            type: 'string',
            required: true,
            description: 'Audio URL',
          },
          {
            name: 'isPlaying',
            type: 'boolean',
            required: true,
            description: 'Current play status',
          },
          {
            name: 'currentTime',
            type: 'number',
            required: false,
            description: 'Current time',
          },
          {
            name: 'volume',
            type: 'number',
            required: false,
            description: 'Volume level',
          },
          {
            name: 'status',
            type: 'string',
            required: false,
            description: 'Status string',
          },
        ],
      },

      constraints: {
        minWidth: 250,
        maxWidth: 500,
        minHeight: 100,
        maxHeight: 300,
        allowedConfigKeys: ['volume'],
        readOnlyKeys: ['id', 'type'],
        allowConnections: true,
        maxIncomingLinks: 3,
        maxOutgoingLinks: 2,
      },
    };
  }
}
