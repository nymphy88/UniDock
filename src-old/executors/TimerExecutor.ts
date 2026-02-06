/**
 * Timer Module Executor
 * Wraps the existing TimerModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class TimerExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const seconds = input.seconds || 0;
      const minutes = input.minutes || 0;
      const hours = input.hours || 0;

      const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

      return {
        success: true,
        output: {
          totalSeconds: totalSeconds,
          display: this.formatTime(totalSeconds),
          hours: hours,
          minutes: minutes,
          seconds: seconds,
          startTime: new Date().toISOString(),
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Timer operation failed',
        executionTime: 0,
      };
    }
  }

  private formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  validate(input: Record<string, any>): boolean {
    return true; // Timer always valid
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'timer',
      type: 'timer',
      label: 'Timer',
      description: 'Countdown timer',
      config: { format: 'HH:MM:SS' },

      inputSchema: {
        fields: [
          {
            name: 'hours',
            type: 'number',
            required: false,
            default: 0,
            coerce: { parseInt: true },
            description: 'Hours',
          },
          {
            name: 'minutes',
            type: 'number',
            required: false,
            default: 0,
            coerce: { parseInt: true },
            description: 'Minutes',
          },
          {
            name: 'seconds',
            type: 'number',
            required: false,
            default: 0,
            coerce: { parseInt: true },
            description: 'Seconds',
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'totalSeconds',
            type: 'number',
            required: true,
            description: 'Total seconds',
          },
          {
            name: 'display',
            type: 'string',
            required: true,
            description: 'Formatted display',
          },
          {
            name: 'startTime',
            type: 'string',
            required: true,
            description: 'Timer start timestamp',
          },
        ],
      },

      constraints: {
        minWidth: 200,
        maxWidth: 350,
        minHeight: 150,
        maxHeight: 300,
        allowedConfigKeys: ['format'],
        readOnlyKeys: ['id', 'type'],
        allowConnections: true,
        maxIncomingLinks: 2,
        maxOutgoingLinks: 3,
      },
    };
  }
}
