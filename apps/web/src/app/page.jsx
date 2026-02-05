"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Save, FolderOpen, ZoomIn, ZoomOut, Grid3x3 } from "lucide-react";
import ModuleNode from "@/components/ModuleNode";
import ModuleSidebar from "@/components/ModuleSidebar";
import ConnectionLine from "@/components/ConnectionLine";

export default function CanvasWorkspace() {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connections, setConnections] = useState([]);
  const [tempConnection, setTempConnection] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const canvasRef = useRef(null);
  const panStartRef = useRef({ x: 0, y: 0 });
  const connectionStartRef = useRef(null);

  // Load initial canvas
  useEffect(() => {
    loadCanvas();
  }, []);

  // Propagate data through connections whenever nodes change
  useEffect(() => {
    const timer = setTimeout(() => {
      propagateData();
    }, 50); // ใส่ delay เล็กน้อยเพื่อลดภาระการคำนวณ
    return () => clearTimeout(timer);
  }, [connections, nodes, propagateData]);

  const lastInferredDataRef = useRef({});

  const propagateData = useCallback(() => {
    const incomingData = {};

    connections.forEach((conn) => {
      const sourceNode = nodes.find((n) => n.id === conn.source);
      if (!sourceNode) return;

      if (!incomingData[conn.target]) incomingData[conn.target] = {};

      let sourceData = sourceNode.data;

      // Handle specific data extraction based on handle type
      if (conn.sourceHandle === "response") {
        sourceData = sourceNode.data.response || "";
      } else if (conn.sourceHandle === "variables") {
        sourceData = sourceNode.data.variables || [];
      } else if (conn.sourceHandle === "files") {
        sourceData = sourceNode.data.files || [];
      } else if (conn.sourceHandle === "clipboard") {
        sourceData = sourceNode.data.clipboard || "";
      } else if (conn.sourceHandle === "formData") {
        sourceData = sourceNode.data.formData || {};
      } else if (conn.sourceHandle === "result") {
        sourceData = sourceNode.data.result || sourceNode.data.display || "";
      } else if (conn.sourceHandle.startsWith("var-")) {
        // Individual variable from table
        const varId = conn.sourceHandle.replace("var-", "");
        const variable = sourceNode.data.variables?.find((v) => v.id === varId);
        sourceData = variable?.value || "";
      }

      // Store the data for the target handle
      incomingData[conn.target][conn.targetHandle] = sourceData;
    });

    const incomingDataString = JSON.stringify(incomingData);
    if (lastInferredDataRef.current === incomingDataString) return;

    lastInferredDataRef.current = incomingDataString;

    // Update nodes with incoming data
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const newNodeData = incomingData[node.id];
        if (newNodeData) {
          // เช็คละเอียดขึ้นอีกนิดว่า data ข้างในเปลี่ยนไหม
          if (
            JSON.stringify(node.data._incomingData) ===
            JSON.stringify(newNodeData)
          ) {
            return node;
          }
          return {
            ...node,
            data: { ...node.data, _incomingData: newNodeData },
          };
        }
        return node;
      })
    );
  }, [connections, nodes]);

  const loadCanvas = async () => {
    try {
      const response = await fetch("/api/canvas/load");
      if (response.ok) {
        const data = await response.json();
        if (data.layout_data) {
          setNodes(data.layout_data.nodes || []);
          setViewport(data.layout_data.viewport || { x: 0, y: 0, zoom: 1 });
          setConnections(data.layout_data.connections || []);
        }
      }
    } catch (error) {
      console.error("Failed to load canvas:", error);
    }
  };

  const saveCanvas = async () => {
    try {
      const response = await fetch("/api/canvas/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Default Canvas",
          layout_data: { nodes, viewport, connections },
        }),
      });
      if (response.ok) {
        console.log("Canvas saved successfully");
      }
    } catch (error) {
      console.error("Failed to save canvas:", error);
    }
  };

  const getHandlePosition = (nodeId, handleId) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    const handleElement = document.querySelector(
      `[data-node-id="${nodeId}"][data-handle-id="${handleId}"]`
    );

    if (!handleElement) return null;

    const rect = handleElement.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const handleConnectionStart = (sourceInfo) => {
    setIsConnecting(true);
    connectionStartRef.current = sourceInfo;
    setTempConnection({
      start: sourceInfo.position,
      end: sourceInfo.position,
    });
  };

  const handleConnectionEnd = (targetInfo) => {
    if (!connectionStartRef.current || !isConnecting) return;

    const newConnection = {
      id: Date.now().toString(),
      source: connectionStartRef.current.nodeId,
      sourceHandle: connectionStartRef.current.handleId,
      target: targetInfo.nodeId,
      targetHandle: targetInfo.handleId,
      sourcePos: connectionStartRef.current.position,
      targetPos: getHandlePosition(targetInfo.nodeId, targetInfo.handleId),
    };

    setConnections((prev) => [...prev, newConnection]);
    setTempConnection(null);
    setIsConnecting(false);
    connectionStartRef.current = null;
  };

  const addModule = useCallback(
    (moduleType) => {
      const newNode = {
        id: Date.now().toString(),
        type: moduleType,
        position: {
          x: (window.innerWidth / 2 - viewport.x) / viewport.zoom - 200,
          y: (window.innerHeight / 2 - viewport.y) / viewport.zoom - 150,
        },
        size: { width: 400, height: 300 },
        data: {},
      };
      setNodes((prev) => [...prev, newNode]);
      setSelectedNode(newNode.id);
    },
    [viewport]
  );

  const updateNode = useCallback((id, updates) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, ...updates } : node))
    );
  }, []);

  const deleteNode = useCallback(
    (id) => {
      setNodes((prev) => prev.filter((node) => node.id !== id));
      setConnections((prev) =>
        prev.filter((conn) => conn.source !== id && conn.target !== id)
      );
      if (selectedNode === id) setSelectedNode(null);
    },
    [selectedNode]
  );

  const handleZoomIn = () => {
    setViewport((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }));
  };

  const handleZoomOut = () => {
    setViewport((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.3) }));
  };

  const handleMouseDown = (e) => {
    if (
      e.target === canvasRef.current ||
      e.target.closest(".canvas-background")
    ) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - viewport.x,
        y: e.clientY - viewport.y,
      };
      setSelectedNode(null);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setViewport((prev) => ({
        ...prev,
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      }));
    } else if (isConnecting && tempConnection) {
      setTempConnection({
        ...tempConnection,
        end: { x: e.clientX, y: e.clientY },
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (isConnecting) {
      setIsConnecting(false);
      setTempConnection(null);
      connectionStartRef.current = null;
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 overflow-hidden font-inter">
      {/* Top Toolbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-semibold tracking-wide bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            QUANTUM CANVAS
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>
            <button
              onClick={saveCanvas}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save
            </button>
            <button
              onClick={loadCanvas}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderOpen className="h-4 w-4" />
              Load
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-xs text-gray-600">
            <span>Zoom: {Math.round(viewport.zoom * 100)}%</span>
          </div>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg transition-colors ${
              showGrid ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Module Sidebar */}
      <ModuleSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onAddModule={addModule}
      />

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="canvas-background absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{
          backgroundImage: showGrid
            ? `radial-gradient(circle, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`
            : "none",
          backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
          backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Connection Lines */}
        <ConnectionLine
          connections={connections}
          tempConnection={tempConnection}
        />

        <div
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
          }}
        >
          {nodes.map((node) => (
            <ModuleNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onSelect={() => setSelectedNode(node.id)}
              onUpdate={updateNode}
              onDelete={deleteNode}
              zoom={viewport.zoom}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
            />
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-white/80 backdrop-blur-md border-t border-gray-200/50 flex items-center justify-between px-6 text-xs text-gray-600 z-40">
        <div className="flex items-center gap-6">
          <span>Active Modules: {nodes.length}</span>
          <span>Connections: {connections.length}</span>
          <span>
            Position: ({Math.round(viewport.x)}, {Math.round(viewport.y)})
          </span>
        </div>
        <div>
          <span>QUANTUM CANVAS v1.0</span>
        </div>
      </div>
    </div>
  );
}