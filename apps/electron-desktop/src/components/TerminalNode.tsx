import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { ElectronAPI } from '../types';

/**
 * ============================================
 * Terminal Node Component
 * ============================================
 */
export const TerminalNode: React.FC<{ data: any; selected: boolean; isLinkSource?: boolean }> = ({
  data,
  selected,
  isLinkSource,
}) => {
  const [command, setCommand] = useState(data.config?.command || '');
  const [output, setOutput] = useState(data.config?.output || '');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!command.trim()) return;

    try {
      setIsExecuting(true);
      setOutput('⏳ Executing...');

      const result = await window.electron.executor.terminal.execute(command);
      setOutput(result.stdout || result.stderr || 'No output');
      
      // Update node data with output
      if (data.onConfigChange) {
        data.onConfigChange('output', result.stdout || result.stderr);
      }
    } catch (error) {
      setOutput(`❌ Error: ${(error as Error).message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div
      style={{
        padding: '10px',
        borderRadius: '8px',
        border: isLinkSource ? '3px solid #48bb78' : selected ? '2px solid #48bb78' : '2px solid #e2e8f0',
        background: isLinkSource ? '#f0fff4' : '#ffffff',
        minWidth: '200px',
        fontSize: '11px',
        color: '#2d3748',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isLinkSource ? '0 0 12px rgba(72, 187, 120, 0.4)' : 'none',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#22543d' }}>🖥️ Terminal</div>

      {/* Command Input */}
      <textarea
        value={command}
        onChange={(e) => {
          setCommand(e.target.value);
          if (data.onConfigChange) {
            data.onConfigChange('command', e.target.value);
          }
        }}
        placeholder="Enter command..."
        style={{
          width: '100%',
          minHeight: '50px',
          padding: '6px',
          border: '1px solid #cbd5e0',
          borderRadius: '4px',
          fontSize: '10px',
          fontFamily: 'monospace',
          marginBottom: '6px',
          boxSizing: 'border-box',
        }}
      />

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={isExecuting || !command.trim()}
        style={{
          width: '100%',
          padding: '6px',
          background: isExecuting ? '#cbd5e0' : '#48bb78',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isExecuting ? 'not-allowed' : 'pointer',
          fontSize: '10px',
          fontWeight: 'bold',
          marginBottom: '6px',
          opacity: isExecuting || !command.trim() ? 0.6 : 1,
        }}
      >
        {isExecuting ? '⏳ Running...' : '▶️ Execute'}
      </button>

      {/* Output */}
      {output && (
        <div
          style={{
            background: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            padding: '6px',
            maxHeight: '100px',
            overflowY: 'auto',
            fontSize: '9px',
            color: output.includes('Error') ? '#c53030' : '#2d3748',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {output}
        </div>
      )}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default TerminalNode;
