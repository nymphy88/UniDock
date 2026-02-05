"use client";

export default function ConnectionLine({ connections, tempConnection }) {
  const createPath = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const controlPointOffset = Math.abs(dx) / 2;

    return `M ${start.x} ${start.y} C ${start.x + controlPointOffset} ${start.y}, ${end.x - controlPointOffset} ${end.y}, ${end.x} ${end.y}`;
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 999 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
        </marker>
      </defs>

      {/* Render existing connections */}
      {connections.map((conn, index) => (
        <path
          key={`${conn.source}-${conn.target}-${index}`}
          d={createPath(conn.sourcePos, conn.targetPos)}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrowhead)"
          className="drop-shadow-lg"
        />
      ))}

      {/* Render temporary connection while dragging */}
      {tempConnection && (
        <path
          d={createPath(tempConnection.start, tempConnection.end)}
          stroke="#3b82f6"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          className="animate-pulse"
        />
      )}
    </svg>
  );
}
