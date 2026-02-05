"use client";

import { useRef } from "react";

export default function Handle({
  type,
  position,
  nodeId,
  handleId,
  onConnectionStart,
  onConnectionEnd,
  label,
}) {
  const handleRef = useRef(null);

  const getPositionStyles = () => {
    const baseStyles =
      "absolute w-3 h-3 rounded-full border-2 border-white cursor-crosshair hover:scale-150 transition-transform";
    const colorStyles =
      type === "input"
        ? "bg-blue-500 hover:bg-blue-600"
        : "bg-green-500 hover:bg-green-600";

    const positionStyles = {
      top: "-translate-y-1/2 left-1/2 -translate-x-1/2 top-0",
      right: "top-1/2 -translate-y-1/2 right-0 translate-x-1/2",
      bottom: "bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2",
      left: "top-1/2 -translate-y-1/2 left-0 -translate-x-1/2",
    };

    return `${baseStyles} ${colorStyles} ${positionStyles[position]}`;
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (type === "output" && onConnectionStart) {
      const rect = handleRef.current.getBoundingClientRect();
      onConnectionStart({
        nodeId,
        handleId,
        handleType: type,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        },
      });
    }
  };

  const handleMouseUp = (e) => {
    e.stopPropagation();
    if (type === "input" && onConnectionEnd) {
      onConnectionEnd({ nodeId, handleId, handleType: type });
    }
  };

  return (
    <div
      ref={handleRef}
      className={getPositionStyles()}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      data-node-id={nodeId}
      data-handle-id={handleId}
      data-handle-type={type}
      title={label || `${type} handle`}
    >
      {label && (
        <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap bg-gray-800 text-white px-2 py-1 rounded opacity-0 hover:opacity-100 pointer-events-none">
          {label}
        </span>
      )}
    </div>
  );
}
