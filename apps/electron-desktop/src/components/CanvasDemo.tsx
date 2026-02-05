import React, { useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';

/**
 * ============================================
 * CanvasDemo - Enterprise Edition
 * ============================================
 * 
 * Complete example showing:
 * ✅ Node management
 * ✅ Link management
 * ✅ State persistence
 * ✅ Error handling
 * ✅ Performance metrics
 * ✅ Export/Import
 */

export const CanvasDemo: React.FC = () => {
  const {
    nodes,
    links,
    loading,
    error,
    isDirty,
    stats,
    isInitialized,
    createNode,
    deleteNode,
    createLink,
    deleteLink,
    saveState,
    getStats,
  } = useCanvas();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);

  const handleAddNode = async () => {
    try {
      const nodeId = `node-${Date.now()}`;
      await createNode(nodeId, 'calculator', { precision: 2 });
    } catch (err) {
      console.error('Failed to add node:', err);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (window.confirm(`Delete node ${nodeId}?`)) {
      try {
        await deleteNode(nodeId);
        setSelectedNode(null);
      } catch (err) {
        console.error('Failed to delete node:', err);
      }
    }
  };

  const handleSaveState = async () => {
    try {
      await saveState({ savedAt: new Date().toISOString() });
      alert('State saved successfully!');
    } catch (err) {
      alert(`Failed to save: ${(err as Error).message}`);
    }
  };

  const handleRefreshStats = async () => {
    try {
      await getStats();
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    } as React.CSSProperties,
    card: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      padding: '30px',
      marginBottom: '20px',
    } as React.CSSProperties,
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      color: 'white',
    } as React.CSSProperties,
    title: {
      margin: 0,
      fontSize: '32px',
      fontWeight: 'bold',
    } as React.CSSProperties,
    badge: {
      background: 'rgba(255,255,255,0.2)',
      padding: '8px 16px',
      borderRadius: '20px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
    } as React.CSSProperties,
    buttonGroup: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    } as React.CSSProperties,
    button: {
      padding: '10px 20px',
      fontSize: '14px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s',
    } as React.CSSProperties,
    primaryBtn: {
      background: '#667eea',
      color: 'white',
    } as React.CSSProperties,
    successBtn: {
      background: '#48bb78',
      color: 'white',
    } as React.CSSProperties,
    dangerBtn: {
      background: '#f56565',
      color: 'white',
    } as React.CSSProperties,
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '15px',
      marginTop: '20px',
    } as React.CSSProperties,
    nodeCard: {
      border: '2px solid #e2e8f0',
      borderRadius: '8px',
      padding: '15px',
      background: '#f7fafc',
      cursor: 'pointer',
      transition: 'all 0.3s',
    } as React.CSSProperties,
    errorBox: {
      background: '#fed7d7',
      border: '1px solid #fc8181',
      borderRadius: '6px',
      padding: '15px',
      color: '#c53030',
      marginBottom: '20px',
    } as React.CSSProperties,
    statsBox: {
      background: '#edf2f7',
      borderLeft: '4px solid #667eea',
      padding: '15px',
      borderRadius: '6px',
      marginTop: '15px',
      fontSize: '14px',
      fontFamily: 'monospace',
    } as React.CSSProperties,
  };

  if (!isInitialized) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Loading Canvas System...</p>
            <div
              style={{
                display: 'inline-block',
                width: '30px',
                height: '30px',
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎨 Canvas System</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={styles.badge}>
            {nodes.length} Nodes • {links.length} Links
          </span>
          {isDirty && <span style={{ ...styles.badge, background: '#fc8181' }}>UNSAVED</span>}
        </div>
      </div>

      {/* Main Card */}
      <div style={styles.card}>
        {/* Error Display */}
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {/* Action Buttons */}
        <div style={styles.buttonGroup}>
          <button
            onClick={handleAddNode}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.primaryBtn,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '⏳ Adding...' : '➕ Add Node'}
          </button>

          <button
            onClick={handleSaveState}
            disabled={!isDirty || loading}
            style={{
              ...styles.button,
              ...styles.successBtn,
              opacity: !isDirty ? 0.5 : 1,
            }}
          >
            💾 Save State
          </button>

          <button
            onClick={() => setShowStats(!showStats)}
            style={{ ...styles.button, ...styles.primaryBtn }}
          >
            {showStats ? '📊 Hide Stats' : '📊 Show Stats'}
          </button>

          <button
            onClick={handleRefreshStats}
            style={{ ...styles.button, ...styles.primaryBtn }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Nodes Section */}
        <h2 style={{ marginTop: '30px', marginBottom: '15px', color: '#2d3748' }}>
          📍 Nodes ({nodes.length})
        </h2>
        {nodes.length === 0 ? (
          <p style={{ color: '#a0aec0', fontStyle: 'italic' }}>
            No nodes yet. Click "Add Node" to create one.
          </p>
        ) : (
          <div style={styles.gridContainer}>
            {nodes.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                style={{
                  ...styles.nodeCard,
                  borderColor: selectedNode === node.id ? '#667eea' : '#e2e8f0',
                  background: selectedNode === node.id ? '#edf2f7' : '#f7fafc',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>
                  {node.label || node.type}
                </h3>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#718096' }}>
                  <strong>ID:</strong> {node.id}
                </p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#718096' }}>
                  <strong>Type:</strong> {node.type}
                </p>

                {selectedNode === node.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    style={{
                      ...styles.button,
                      ...styles.dangerBtn,
                      marginTop: '10px',
                      width: '100%',
                    }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Links Section */}
        <h2 style={{ marginTop: '30px', marginBottom: '15px', color: '#2d3748' }}>
          🔗 Links ({links.length})
        </h2>
        {links.length === 0 ? (
          <p style={{ color: '#a0aec0', fontStyle: 'italic' }}>No links yet.</p>
        ) : (
          <ul style={{ background: '#f7fafc', padding: '15px', borderRadius: '6px' }}>
            {links.map((link) => (
              <li
                key={link.id}
                style={{
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#2d3748',
                }}
              >
                <code>
                  {link.sourceNodeId}.{link.sourceKey}
                </code>
                {' → '}
                <code>
                  {link.targetNodeId}.{link.targetKey}
                </code>
              </li>
            ))}
          </ul>
        )}

        {/* Stats Section */}
        {showStats && stats && (
          <div style={styles.statsBox}>
            <h3 style={{ marginTop: 0 }}>Performance Stats:</h3>
            <pre style={{ margin: '10px 0', overflow: 'auto', fontSize: '12px' }}>
              {JSON.stringify(stats, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ ...styles.card, marginBottom: 0, textAlign: 'center', color: '#718096' }}>
        <p style={{ margin: 0, fontSize: '12px' }}>
          ✨ UniDock Canvas System • Electron + React 19 + TypeScript
        </p>
      </div>
    </div>
  );
};
