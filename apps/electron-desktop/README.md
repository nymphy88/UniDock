# 🎨 Electron Desktop - Canvas System Integration

TypeScript + Electron + Node Canvas System

## 📦 Structure

```
src/
├── main.ts           # Electron main process
├── preload.ts        # IPC bridge (security)
├── App.tsx           # React root
├── index.tsx         # Entry point
├── hooks/
│   └── useCanvas.ts  # React hook for canvas
└── components/
    └── CanvasDemo.tsx # Example component
```

## 🚀 Setup & Dev

```bash
# 1. Install dependencies
npm install

# 2. Watch TypeScript
npm run dev:main
npm run dev:preload

# 3. In another terminal - start React dev server
# (From parent: npm run dev)

# 4. Run Electron
npm start
```

## 🏗️ Build

```bash
npm run build
npm run dist  # Package with electron-builder
```

## 📡 IPC Pattern

**Main Process** → Canvas System (node-canvas-system) → **Preload** → **React UI**

```typescript
// main.ts handles IPC
ipcMain.handle('canvas:create-node', (_, args) => {
  return this.canvas.createNode(args.nodeId, args.type, args.config);
});

// preload.ts exposes typed API
contextBridge.exposeInMainWorld('canvas', {
  createNode: (nodeId, type, config) =>
    ipcRenderer.invoke('canvas:create-node', { nodeId, type, config })
});

// React uses hook
const { createNode } = useCanvas();
await createNode('node-1', 'calculator');
```

## 🔧 Integration Points

### 1. **Canvas System** (node-canvas-system)
Located at: `../../node-canvas-system`
- ✅ Already TypeScript
- ✅ Provides CanvasOrchestrator class

### 2. **Main Process** (main.ts)
- Creates CanvasOrchestrator instance
- Handles all IPC calls
- Broadcasts canvas events

### 3. **Preload** (preload.ts)
- Secure context bridge
- Typed API for React
- No direct access to main thread

### 4. **React Hook** (useCanvas.ts)
- Simple state management
- Async handlers
- Event listeners

## 💡 Example Usage

```typescript
import { useCanvas } from './hooks/useCanvas';

export const MyComponent = () => {
  const { nodes, createNode, deleteNode } = useCanvas();

  return (
    <>
      <button onClick={() => createNode('n1', 'calculator')}>
        Add Node
      </button>
      {nodes.map(n => (
        <div key={n.id}>
          {n.label} <button onClick={() => deleteNode(n.id)}>Delete</button>
        </div>
      ))}
    </>
  );
};
```

## 🎯 Next Steps

1. ✅ Base Electron structure ready
2. ⏳ Add React dev server config
3. ⏳ Style with Tailwind/Chakra
4. ⏳ Add visual node editor
5. ⏳ Implement data persistence

## 📝 Notes

- **Security**: Preload + context isolation enabled
- **TypeScript**: Strict mode enabled
- **Modularity**: Easy to extend with more IPC handlers
- **Flexibility**: Hook-based, can integrate any UI library

