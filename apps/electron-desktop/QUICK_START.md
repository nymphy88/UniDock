# 🎯 Quick Start Reference

## ⚡ 30-Second Setup

```bash
# 1️⃣ Go to electron app
cd apps/electron-desktop

# 2️⃣ Install packages
npm install

# 3️⃣ Build TypeScript
npm run build

# 4️⃣ Run Electron (in dev mode)
npm start
```

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│   React UI      │  useCanvas() hook
│  (App.tsx)      │  - nodes, links
│  (CanvasDemo)   │  - createNode()
└────────┬────────┘  - deleteNode()
         │           - getStats()
         │
    window.canvas.*
         │
         ↓
┌─────────────────┐
│   Preload.ts    │  contextBridge.expose()
│   (IPC Bridge)  │  Type-safe API wrapper
└────────┬────────┘
         │
   ipcRenderer.invoke()
         │
         ↓
┌─────────────────┐
│   main.ts       │  Electron Main Process
│  (IPC Handlers) │  ipcMain.handle()
│  (Canvas Mgr)   │  CanvasOrchestrator
└────────┬────────┘
         │
         ↓
┌─────────────────────────┐
│  Node Canvas System     │
│  (../../node-canvas...) │
│  TypeScript Module      │
└─────────────────────────┘
```

---

## 🏗️ File Functions (One-Liner Each)

| File | Purpose |
|------|---------|
| `main.ts` | Electron entry + IPC server |
| `preload.ts` | Secure bridge to React |
| `App.tsx` | Root React component |
| `index.tsx` | React DOM mount |
| `index.html` | Electron window shell |
| `useCanvas.ts` | React hook (state + handlers) |
| `CanvasDemo.tsx` | Example UI component |
| `package.json` | Dependencies + scripts |
| `tsconfig.json` | TypeScript compiler options |

---

## 🔄 Real Usage Example

```typescript
// In your React component
import { useCanvas } from './hooks/useCanvas';

export const MyCanvas = () => {
  // 1. Get hook
  const { nodes, createNode, deleteNode, loading } = useCanvas();

  // 2. Create handler
  const addNewNode = async () => {
    await createNode(`node-${Date.now()}`, 'calculator', {
      precision: 2
    });
  };

  // 3. Render
  return (
    <>
      <button onClick={addNewNode} disabled={loading}>
        {loading ? 'Adding...' : 'Add Node'}
      </button>
      
      {nodes.map(node => (
        <div key={node.id}>
          <h3>{node.label}</h3>
          <button onClick={() => deleteNode(node.id)}>Delete</button>
        </div>
      ))}
    </>
  );
};
```

---

## 🔧 Adding Canvas Features

### Want a new IPC endpoint?

**Step 1**: Add handler in `main.ts`
```typescript
ipcMain.handle('canvas:new-feature', (_, args) => {
  return this.canvas.newFeature(args);
});
```

**Step 2**: Expose in `preload.ts`
```typescript
interface CanvasAPI {
  newFeature: (arg: any) => Promise<any>;
}

const canvasAPI: CanvasAPI = {
  newFeature: (arg) =>
    ipcRenderer.invoke('canvas:new-feature', { arg })
};
```

**Step 3**: Use in React
```typescript
const { newFeature } = useCanvas();
await newFeature(data);
```

**That's it!** No boilerplate.

---

## 🎨 Comparison: JS → TS

| Aspect | Before (JS) | After (TS) ✨ |
|--------|-----------|-------------|
| Type Errors | Runtime 💥 | Compile-time ✅ |
| IPC Calls | `canvas.createNode()` | `canvas.createNode()` → typed! |
| Refactoring | Risky, manual | Safe, IDE-assisted |
| Documentation | Comments | Type signatures |
| Debugging | trial-and-error | Full type hints |

---

## 🚨 Common Issues & Fixes

### npm install fails
```bash
npm install --legacy-peer-deps
```

### TypeScript errors
```bash
npm run typecheck  # See all errors
npm run build      # Compile
```

### Electron won't start
```bash
# Make sure main.ts compiled to dist/
npm run build:main

# Then start
npm start
```

### React component not updating
Check that `useCanvas()` is called at top level (not conditionally!)

---

## 📦 What's Included

✅ Electron boilerplate (secure, modern)
✅ TypeScript config (strict mode)
✅ IPC bridge (typed + safe)
✅ React hook (state management)
✅ Demo component (working example)
✅ Documentation (complete)

❌ **NOT** included (but easy to add):
- UI library (Chakra, Tailwind, MUI)
- Database/persistence layer
- File I/O operations
- Advanced node editor

---

## 🎓 Architecture Concepts

### Modular ✅
Each piece does one thing:
- `main.ts` = IPC server
- `preload.ts` = API bridge
- `useCanvas.ts` = State management
- `CanvasDemo.tsx` = UI

### Flexible ✅
- Swap UI library anytime
- Canvas System is swappable
- Easy to add more handlers

### Adaptive ✅
- Works with existing web app
- Can render same React code
- Gradual migration path

### Simple ✅
- ~370 lines of code
- No magic/framework-specific
- Standard Electron patterns

---

## 📖 Learn More

- **This Project**: See `README.md`
- **Canvas System**: `../../node-canvas-system/README.md`
- **Electron Docs**: `electron.electron.org`
- **React 19**: `react.dev`

---

Generated: 2026-02-05 | Electron 33 + React 19 + TS 5.8
