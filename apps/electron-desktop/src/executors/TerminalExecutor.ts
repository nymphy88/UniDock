import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * ============================================
 * Terminal Executor
 * ============================================
 * Executes shell commands and returns output
 */
export class TerminalExecutor {
  async execute(command: string): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
  }> {
    try {
      console.log('[TerminalExecutor] Executing:', command);
      
      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024, // 1MB buffer
      });

      console.log('[TerminalExecutor] ✅ Success');
      return {
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: 0,
      };
    } catch (error: any) {
      console.error('[TerminalExecutor] ❌ Error:', error.message);
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || 'Unknown error',
        exitCode: error.code || 1,
      };
    }
  }
}

export const terminalExecutor = new TerminalExecutor();
