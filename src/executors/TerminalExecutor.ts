/**
 * Terminal Module Executor
 * Wraps the existing TerminalModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class TerminalExecutor implements INodeExecutor {
  private commandHistory: string[] = [];

  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const command = input.command || '';
      
      if (!command) {
        return {
          success: true,
          output: {
            output: '',
            command: '',
            timestamp: new Date().toISOString(),
            exitCode: 0,
          },
          executionTime: 0,
        };
      }

      // Store in history
      this.commandHistory.push(command);
      if (this.commandHistory.length > 100) {
        this.commandHistory.shift();
      }

      // Simulate command execution (UI side handles actual execution)
      const output = `$ ${command}\n[Command queued for execution]`;

      return {
        success: true,
        output: {
          output: output,
          command: command,
          timestamp: new Date().toISOString(),
          exitCode: 0,
          historyCount: this.commandHistory.length,
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Terminal operation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    return input.command !== undefined;
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'terminal',
      type: 'terminal',
      label: 'Terminal',
      description: 'Command terminal emulator',
      config: {},

      inputSchema: {
        fields: [
          {
            name: 'command',
            type: 'string',
            required: false,
            coerce: { trim: true },
            description: 'Shell command to execute',
          },
        ],
      },

      outputSchema: {
        fields: [
          {
            name: 'output',
            type: 'string',
            required: true,
            description: 'Terminal output',
          },
          {
            name: 'command',
            type: 'string',
            required: false,
            description: 'Executed command',
          },
          {
            name: 'timestamp',
            type: 'string',
            required: true,
            description: 'Execution timestamp',
          },
          {
            name: 'exitCode',
            type: 'number',
            required: false,
            description: 'Command exit code',
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
        maxOutgoingLinks: 3,
      },
    };
  }
}
