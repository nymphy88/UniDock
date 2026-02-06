import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvas } from '../hooks/useCanvas';
import { TerminalNode } from './TerminalNode';
import NodePropertiesPanel from './NodePropertiesPanel';

/**
 * ============================================
 * Calculator Node Component
 * ============================================
 */
const CalculatorNode: React.FC<{ data: any; selected: boolean; isLinkSource?: boolean }> = ({
  data,
  selected,
  isLinkSource,
}) => {
  return (
    <div
      style={{
        padding: '10px 15px',
        borderRadius: '8px',
        border: isLinkSource ? '3px solid #667eea' : selected ? '2px solid #667eea' : '2px solid #e2e8f0',
        background: isLinkSource ? '#f0f4ff' : '#ffffff',
        minWidth: '120px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#2d3748',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: isLinkSource ? '0 0 12px rgba(102, 126, 234, 0.4)' : 'none',
      }}
    >
      <div>{data.label || data.type || 'Calculator'}</div>
      <div style={{ fontSize: '10px', color: '#718096', marginTop: '4px' }}>
        ID: {data.id.substring(0, 8)}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

/**
 * ============================================
 * Canvas Component - React Flow Integration
 * ============================================
 */
export const Canvas: React.FC = () => {
  const {
    nodes: canvasNodes,
    links: canvasLinks,
    createNode,
    deleteNode,
    createLink,
    updateNodeUI,
    loading,
    error,
  } = useCanvas();

  // Link creation state
  const [selectedForLink, setSelectedForLink] = useState<string | null>(null);

  // Properties panel state
  const [selectedNodeForProperties, setSelectedNodeForProperties] = useState<any | null>(null);

  // Node type selector state
  const [showNodeTypeMenu, setShowNodeTypeMenu] = useState(false);

  // ← Convert canvas data to React Flow format
  const nodes: Node[] = useMemo(
    () =>
      canvasNodes.map((node) => ({
        id: node.id,
        data: {
          label: node.label || node.type,
          type: node.type,
          id: node.id,
          color: node.ui?.color || '#f0f0f0',
          isLinkSource: node.id === selectedForLink,
          config: node.config,
        },
        position: node.ui?.position || {
          x: Math.random() * 500,
          y: Math.random() * 500,
        },
        type: node.type === 'terminal' ? 'terminal' : 'default',
      })),
    [canvasNodes, selectedForLink]
  );

  const edges: Edge[] = useMemo(
    () =>
      canvasLinks.map((link) => ({
        id: link.id,
        source: link.sourceNodeId,
        target: link.targetNodeId,
        animated: true,
        style: { stroke: '#667eea', strokeWidth: 2 },
      })),
    [canvasLinks]
  );

  // React Flow state
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // ← Sync React Flow nodes back to canvas
  React.useEffect(() => {
    setFlowNodes(nodes);
  }, [nodes, setFlowNodes]);

  React.useEffect(() => {
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);

  /**
   * Handle node deletion with Delete key
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Delete') {
      flowNodes.forEach((node) => {
        if (node.selected) {
          deleteNode(node.id);
        }
      });
    }
    if (event.key === 'Escape') {
      setSelectedForLink(null);
      setShowNodeTypeMenu(false);
    }
  }, [flowNodes, deleteNode]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /**
   * Handle node click → delete or select for linking or properties
   */
  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (event.detail === 2) {
        // ← Double click to delete
        deleteNode(node.id);
      } else if (event.detail === 1) {
        // Single click
        const isCtrlClick = event.ctrlKey || event.metaKey;

        if (isCtrlClick) {
          // Ctrl+Click = linking mode
          if (!selectedForLink) {
            setSelectedForLink(node.id);
            console.log('[Canvas] Selected node for linking:', node.id);
          } else if (selectedForLink !== node.id) {
            createLink(selectedForLink, 'output', node.id, 'input')
              .then(() => {
                setSelectedForLink(null);
              })
              .catch((err) => {
                console.error('[Canvas] Link creation failed:', err);
                setSelectedForLink(null);
              });
          } else {
            setSelectedForLink(null);
          }
        } else {
          // Normal click = properties panel
          const fullNode = canvasNodes.find((n) => n.id === node.id);
          setSelectedNodeForProperties(fullNode || null);
        }
      }
    },
    [selectedForLink, canvasNodes, deleteNode, createLink]
  );

  /**
   * Handle connect (create link from drag)
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      createLink(connection.source || '', 'output', connection.target || '', 'input').catch((err) =>
        console.error('[Canvas] Connection failed:', err)
      );
    },
    [createLink]
  );

  /**
   * Add node with type selector
   */
  const handleAddNode = (nodeType: string) => {
    createNode(`node-${Date.now()}`, nodeType);
    setShowNodeTypeMenu(false);
  };

  /**
   * Update node properties
   */
  const handleUpdateNodeProperty = async (key: string, value: any) => {
    if (!selectedNodeForProperties) return;

    try {
      if (key === 'position') {
        await updateNodeUI(selectedNodeForProperties.id, { position: value });
      } else if (key === 'label') {
        // Update label in config
        await updateNodeUI(selectedNodeForProperties.id, {
          ...selectedNodeForProperties.ui,
        });
      } else if (key === 'color') {
        await updateNodeUI(selectedNodeForProperties.id, { color: value });
      }

      // Update local state
      setSelectedNodeForProperties({
        ...selectedNodeForProperties,
        [key === 'position' || key === 'color' ? 'ui' : 'label']: key === 'position' || key === 'color' ? value : selectedNodeForProperties[key],
      });
    } catch (err) {
      console.error('[Canvas] Update failed:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>⏳ Loading canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <p style={{ color: '#c53030', fontSize: '16px', marginBottom: '10px' }}>❌ Error: {error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reload
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', background: '#fff' }}>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={{
          default: CalculatorNode as any,
          terminal: TerminalNode as any,
        }}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Controls Panel */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 5,
          maxWidth: '280px',
        }}
      >
        {/* Add Node Button with Dropdown */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <button
            onClick={() => setShowNodeTypeMenu(!showNodeTypeMenu)}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              width: '100%',
            }}
          >
            ➕ Add Node {showNodeTypeMenu ? '▼' : '▶'}
          </button>

          {showNodeTypeMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '0',
                right: '0',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                marginBottom: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <button
                onClick={() => handleAddNode('calculator')}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'white',
                  borderBottom: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                  color: '#2d3748',
                }}
              >
                🧮 Calculator
              </button>
              <button
                onClick={() => handleAddNode('terminal')}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textAlign: 'left',
                  color: '#2d3748',
                }}
              >
                🖥️ Terminal
              </button>
            </div>
          )}
        </div>

        {selectedForLink && (
          <div
            style={{
              padding: '10px',
              background: '#f0f4ff',
              borderRadius: '4px',
              marginBottom: '10px',
              fontSize: '11px',
              color: '#667eea',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            🔗 Linking... Ctrl+Click target
          </div>
        )}

        <div style={{ fontSize: '11px', color: '#718096', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>💡 Controls:</p>
          <p style={{ margin: '4px 0' }}>• Click = properties</p>
          <p style={{ margin: '4px 0' }}>• Ctrl+Click = link mode</p>
          <p style={{ margin: '4px 0' }}>• Double-click = delete</p>
          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ margin: '4px 0' }}>📊 Nodes: {canvasNodes.length}</p>
            <p style={{ margin: '4px 0' }}>🔗 Links: {canvasLinks.length}</p>
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNodeForProperties && (
        <NodePropertiesPanel
          node={selectedNodeForProperties}
          onClose={() => setSelectedNodeForProperties(null)}
          onUpdate={handleUpdateNodeProperty}
        />
      )}
    </div>
  );
};

export default Canvas;
