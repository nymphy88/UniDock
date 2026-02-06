/**
 * Notepad Module Executor
 * Wraps the existing NotepadModule for node-canvas-system
 */

import { INodeExecutor, ExecutionResult, NodeDefinition } from 'node-canvas-system';

export class NotepadExecutor implements INodeExecutor {
  async execute(input: Record<string, any>): Promise<ExecutionResult> {
    try {
      const content = input.content || '';
      const reference = input.reference;

      return {
        success: true,
        output: {
          content: content,
          reference: reference,
          savedAt: new Date().toISOString(),
          characterCount: content.length,
          wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
        },
        executionTime: 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Notepad operation failed',
        executionTime: 0,
      };
    }
  }

  validate(input: Record<string, any>): boolean {
    return input.content !== undefined;
  }

  getMetadata(): NodeDefinition {
    return {
      id: 'notepad',
      type: 'notepad',
      label: 'Notepad',
      description: 'Text note with data linking',
      config: { maxChars: 10000 },

      inputSchema: {
        fields: [
          {
            name: 'content',
            type: 'string',
            required: true,
            coerce: { trim: true, removeQuotes: true },
            description: 'Note content',
            validate: { minLength: 0 },
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
          {
            name: 'characterCount',
            type: 'number',
            required: false,
            description: 'Character count',
          },
          {
            name: 'wordCount',
            type: 'number',
            required: false,
            description: 'Word count',
          },
        ],
      },

      constraints: {
        minWidth: 250,
        maxWidth: 600,
        minHeight: 150,
        maxHeight: 800,
        allowedConfigKeys: ['maxChars', 'theme', 'fontSize'],
        readOnlyKeys: ['id', 'type'],
        allowConnections: true,
        maxIncomingLinks: 10,
        maxOutgoingLinks: 5,
      },
    };
  }
}
