"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import Handle from "@/components/Handle";
import NotepadModule from "@/components/modules/NotepadModule";
import CalculatorModule, {
  CalculatorModuleConfig,
} from "@/components/modules/CalculatorModule";
import TimerModule from "@/components/modules/TimerModule";
import ImageModule from "@/components/modules/ImageModule";
import TerminalModule from "@/components/modules/TerminalModule";
import MusicModule from "@/components/modules/MusicModule";
import AIAPIModule, {
  AIAPIModuleConfig,
} from "@/components/modules/AIAPIModule";
import TableVariableModule, {
  TableVariableModuleConfig,
} from "@/components/modules/TableVariableModule";
import UniversalDockModule, {
  UniversalDockModuleConfig,
} from "@/components/modules/UniversalDockModule";
import BakedModule, {
  BakedModuleConfig,
} from "@/components/modules/BakedModule";

const moduleComponents = {
  notepad: NotepadModule,
  calculator: CalculatorModule,
  timer: TimerModule,
  image: ImageModule,
  terminal: TerminalModule,
  music: MusicModule,
  aiapi: AIAPIModule,
  tablevariable: TableVariableModule,
  universaldock: UniversalDockModule,
  baked: BakedModule,
};

const moduleConfigs = {
  calculator: CalculatorModuleConfig,
  aiapi: AIAPIModuleConfig,
  tablevariable: TableVariableModuleConfig,
  universaldock: UniversalDockModuleConfig,
  baked: BakedModuleConfig,
};

const moduleColors = {
  notepad: "from-yellow-400/20 to-orange-500/20",
  calculator: "from-blue-400/20 to-cyan-500/20",
  timer: "from-purple-400/20 to-pink-500/20",
  image: "from-green-400/20 to-emerald-500/20",
  terminal: "from-gray-700/20 to-gray-900/20",
  music: "from-red-400/20 to-rose-500/20",
  aiapi: "from-purple-400/20 to-purple-600/20",
  tablevariable: "from-indigo-400/20 to-indigo-600/20",
  universaldock: "from-teal-400/20 to-teal-600/20",
  baked: "from-pink-400/20 to-pink-600/20",
};

export default function ModuleNode({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  zoom,
  onConnectionStart,
  onConnectionEnd,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 });

  const ModuleComponent =
    moduleComponents[node.type] || (() => <div>Unknown Module</div>);

  const handleMouseDown = (e) => {
    if (e.target.closest(".module-header")) {
      e.stopPropagation();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - node.position.x * zoom,
        y: e.clientY - node.position.y * zoom,
      };
      onSelect();
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        const newX = (e.clientX - dragStartRef.current.x) / zoom;
        const newY = (e.clientY - dragStartRef.current.y) / zoom;
        onUpdate(node.id, {
          position: { x: newX, y: newY },
        });
      } else if (isResizing) {
        const deltaX = (e.clientX - resizeStartRef.current.x) / zoom;
        const deltaY = (e.clientY - resizeStartRef.current.y) / zoom;
        const newWidth = Math.max(300, resizeStartRef.current.width + deltaX);
        const newHeight = Math.max(200, resizeStartRef.current.height + deltaY);
        onUpdate(node.id, {
          size: { width: newWidth, height: newHeight },
        });
      }
    },
    [isDragging, isResizing, node.id, onUpdate, zoom],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  // Add global mouse listeners in useEffect
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      width: node.size.width,
      height: node.size.height,
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  const handleMaximize = (e) => {
    e.stopPropagation();
    setIsMaximized(!isMaximized);
  };

  const handleDataUpdate = (newData) => {
    onUpdate(node.id, { data: newData });
  };

  const config = moduleConfigs[node.type];
  const allInputHandles = config?.handles?.inputs || [];
  const staticOutputHandles = config?.handles?.outputs || [];
  const dynamicOutputHandles = config?.handles?.dynamicOutputs
    ? config.handles.dynamicOutputs(node.data)
    : [];
  const allOutputHandles = [...staticOutputHandles, ...dynamicOutputHandles];

  return (
    <div
      className={`absolute select-none ${isDragging ? "cursor-grabbing" : "cursor-default"}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: isMaximized ? "90vw" : node.size.width,
        height: isMaximized ? "80vh" : node.size.height,
        zIndex: isSelected ? 1000 : 1,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Glassmorphism container with LED glow */}
      <div
        className={`h-full rounded-2xl backdrop-blur-xl bg-white/70 border-2 shadow-2xl overflow-hidden transition-all ${
          isSelected
            ? "border-blue-400 shadow-blue-400/50"
            : "border-white/50 shadow-gray-300/50"
        }`}
        style={{
          boxShadow: isSelected
            ? "0 0 30px rgba(59, 130, 246, 0.5), 0 20px 40px rgba(0, 0, 0, 0.2)"
            : "0 20px 40px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* LED Glow Border */}
        {isSelected && (
          <div
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${moduleColors[node.type]} pointer-events-none`}
            style={{
              animation: "pulse 2s ease-in-out infinite",
            }}
          ></div>
        )}

        {/* Header */}
        <div className="module-header relative flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white/50 to-white/30 border-b border-white/50 cursor-grab active:cursor-grabbing backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-br ${moduleColors[node.type].replace("/20", "")}`}
            ></div>
            <h3 className="text-sm font-semibold text-gray-700 capitalize">
              {node.type}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleMaximize}
              className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
            >
              {isMaximized ? (
                <Minimize2 className="h-4 w-4 text-gray-600" />
              ) : (
                <Maximize2 className="h-4 w-4 text-gray-600" />
              )}
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Module Content */}
        <div className="relative h-[calc(100%-52px)] overflow-auto bg-white/40 backdrop-blur-sm">
          <ModuleComponent data={node.data} onDataUpdate={handleDataUpdate} />
        </div>

        {/* Render Input Handles */}
        {allInputHandles.map((handle, index) => (
          <Handle
            key={`input-${handle.id}`}
            type="input"
            position={handle.position}
            nodeId={node.id}
            handleId={handle.id}
            label={handle.label}
            onConnectionEnd={onConnectionEnd}
          />
        ))}

        {/* Render Output Handles */}
        {allOutputHandles.map((handle, index) => (
          <Handle
            key={`output-${handle.id}`}
            type="output"
            position={handle.position}
            nodeId={node.id}
            handleId={handle.id}
            label={handle.label}
            onConnectionStart={onConnectionStart}
          />
        ))}

        {/* Resize Handle */}
        {!isMaximized && (
          <div
            onMouseDown={handleResizeStart}
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-10"
            style={{
              background:
                "linear-gradient(135deg, transparent 50%, rgba(59, 130, 246, 0.3) 50%)",
            }}
          ></div>
        )}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
