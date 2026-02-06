import React from 'react';

/**
 * ============================================
 * Node Properties Panel
 * ============================================
 */
export const NodePropertiesPanel: React.FC<{
  node: any;
  onClose: () => void;
  onUpdate: (key: string, value: any) => Promise<void>;
}> = ({ node, onClose, onUpdate }) => {
  if (!node) return null;

  return (
    <div
      style={{
        position: 'absolute',
        right: '20px',
        top: '20px',
        width: '300px',
        maxHeight: '80vh',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '15px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f7fafc',
        }}
      >
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#2d3748' }}>
            🔧 Properties
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: '#718096' }}>
            {node.data?.type || 'Unknown'} • {node.id.substring(0, 8)}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#718096',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
        {/* Node ID */}
        <PropertyField
          label="Node ID"
          value={node.id}
          readOnly
        />

        {/* Type */}
        <PropertyField
          label="Type"
          value={node.data?.type || 'Unknown'}
          readOnly
        />

        {/* Label */}
        <PropertyField
          label="Label"
          value={node.data?.label || ''}
          onChange={(value) => onUpdate('label', value)}
        />

        {/* Position */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568', display: 'block', marginBottom: '4px' }}>
            Position
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <PropertyField
              label="X"
              value={Math.round(node.position?.x || 0).toString()}
              onChange={(value) =>
                onUpdate('position', { ...node.position, x: parseInt(value) || 0 })
              }
              type="number"
            />
            <PropertyField
              label="Y"
              value={Math.round(node.position?.y || 0).toString()}
              onChange={(value) =>
                onUpdate('position', { ...node.position, y: parseInt(value) || 0 })
              }
              type="number"
            />
          </div>
        </div>

        {/* Color */}
        <PropertyField
          label="Color"
          value={node.data?.color || '#ffffff'}
          type="color"
          onChange={(value) => onUpdate('color', value)}
        />

        {/* Config (for Terminal nodes) */}
        {node.data?.type === 'terminal' && node.data?.config?.output && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568', display: 'block', marginBottom: '4px' }}>
              Last Output
            </label>
            <div
              style={{
                background: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '9px',
                maxHeight: '150px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                color: '#2d3748',
              }}
            >
              {node.data.config.output}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px 15px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '8px',
          background: '#f7fafc',
        }}
      >
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '8px',
            background: '#e2e8f0',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#2d3748',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

/**
 * ============================================
 * Property Field Component
 * ============================================
 */
const PropertyField: React.FC<{
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  type?: string;
}> = ({ label, value, onChange, readOnly, type = 'text' }) => {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#4a5568', display: 'block', marginBottom: '4px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        style={{
          width: '100%',
          padding: '6px 8px',
          border: '1px solid #cbd5e0',
          borderRadius: '4px',
          fontSize: '12px',
          boxSizing: 'border-box',
          background: readOnly ? '#f7fafc' : '#ffffff',
          color: readOnly ? '#718096' : '#2d3748',
          cursor: readOnly ? 'default' : 'text',
        }}
      />
    </div>
  );
};

export default NodePropertiesPanel;
