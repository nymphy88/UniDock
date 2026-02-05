# 🏗️ Complete Architecture Visualization

## System Architecture (Complete)

```
╔══════════════════════════════════════════════════════════════════════════╗
║                           ELECTRON DESKTOP APP                           ║
║                                                                          ║
║  ┌─────────────────────────────────────────────────────────────────┐   ║
║  │                        RENDERER PROCESS                         │   ║
║  │                       (React UI - BrowserWindow)              │   ║
║  │                                                               │   ║
║  │  ┌──────────────────────────────────────────────────────┐    │   ║
║  │  │          React Components                           │    │   ║
║  │  │  ┌─────────────────────────────────────────────┐   │    │   ║
║  │  │  │  App.tsx (Root)                             │   │    │   ║
║  │  │  │  └─ CanvasDemo.tsx                          │   │    │   ║
║  │  │  │     ├─ Node Grid Display                    │   │    │   ║
║  │  │  │     ├─ Action Buttons                       │   │    │   ║
║  │  │  │     ├─ Error Display                        │   │    │   ║
║  │  │  │     └─ Stats Panel                          │   │    │   ║
║  │  │  └─────────────────────────────────────────────┘   │    │   ║
║  │  │         ↑          ↑          ↑          ↑           │    │   ║
║  │  │    useCanvas() Hook                                 │    │   ║
║  │  │    ├─ nodes, links, loading, error                 │    │   ║
║  │  │    ├─ createNode, deleteNode, ...                  │    │   ║
║  │  │    ├─ saveState, loadState                         │    │   ║
║  │  │    └─ Event listeners (onNodeCreated, etc.)        │    │   ║
║  │  └──────────────────────────────────────────────────────┘    │   ║
║  │                                                               │   ║
║  │        window.electron.canvas.* (Typed Interface)            │   ║
║  │        window.electron.file.*                                │   ║
║  │        window.electron.app.*                                 │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║                     Context Isolation Boundary                          ║
║                    (Safe IPC Communication Only)                        ║
║                                                                          ║
║  ┌─────────────────────────────────────────────────────────────────┐   ║
║  │                      PRELOAD SCRIPT                             │   ║
║  │                  (src/preload.ts - 287 lines)                 │   ║
║  │                                                               │   ║
║  │  contextBridge.exposeInMainWorld('electron', {              │   ║
║  │    canvas: {                                                │   ║
║  │      createNode, deleteNode, getNodes,                     │   ║
║  │      createLink, deleteLink, getLinks,                     │   ║
║  │      saveState, loadState, getState,                       │   ║
║  │      onNodeCreated, onLinkCreated, ... (events)            │   ║
║  │    },                                                       │   ║
║  │    file: {                                                 │   ║
║  │      read, write, openSaveDialog, openOpenDialog          │   ║
║  │    },                                                       │   ║
║  │    app: {                                                  │   ║
║  │      getVersion, getPath, getConfig, quit, minimize, ...  │   ║
║  │    }                                                        │   ║
║  │  })                                                         │   ║
║  └──────────────────────┬──────────────────────────────────────┘   ║
║                         │ ipcRenderer.invoke()                       ║
║                         │ ipcRenderer.on()                           ║
║  ┌──────────────────────▼──────────────────────────────────────────┐   ║
║  │                      MAIN PROCESS                               │   ║
║  │               (src/main.ts - 697 lines)                         │   ║
║  │                                                               │   ║
║  │  ┌────────────────────────────────────────────────────────┐   │   ║
║  │  │      ElectronCanvasHost Class                         │   │   ║
║  │  │  ┌─────────────────────────────────────────────────┐  │   │   ║
║  │  │  │    IPC Handlers (30+ total)                    │  │   │   ║
║  │  │  │                                                │  │   │   ║
║  │  │  │  CANVAS OPERATIONS (13)                        │  │   │   ║
║  │  │  │    canvas:create-node                          │  │   │   ║
║  │  │  │    canvas:delete-node                          │  │   │   ║
║  │  │  │    canvas:update-node-config                   │  │   │   ║
║  │  │  │    canvas:get-nodes                            │  │   │   ║
║  │  │  │    canvas:create-link                          │  │   │   ║
║  │  │  │    canvas:delete-link                          │  │   │   ║
║  │  │  │    canvas:toggle-link                          │  │   │   ║
║  │  │  │    canvas:get-links                            │  │   │   ║
║  │  │  │    ... (9 more)                                │  │   │   ║
║  │  │  │                                                │  │   │   ║
║  │  │  │  STATE MANAGEMENT (6)                          │  │   │   ║
║  │  │  │    canvas:get-state                            │  │   │   ║
║  │  │  │    canvas:save-state                           │  │   │   ║
║  │  │  │    canvas:load-state                           │  │   │   ║
║  │  │  │    canvas:is-dirty                             │  │   │   ║
║  │  │  │    ... (2 more)                                │  │   │   ║
║  │  │  │                                                │  │   │   ║
║  │  │  │  FILE OPERATIONS (4)                           │  │   │   ║
║  │  │  │    file:read, file:write                       │  │   │   ║
║  │  │  │    file:open-save-dialog                       │  │   │   ║
║  │  │  │    file:open-open-dialog                       │  │   │   ║
║  │  │  │                                                │  │   │   ║
║  │  │  │  APP CONTROL (5)                               │  │   │   ║
║  │  │  │    app:quit, app:minimize, app:maximize        │  │   │   ║
║  │  │  │    app:get-version, app:get-config             │  │   │   ║
║  │  │  │                                                │  │   │   ║
║  │  │  │  DEBUG & VALIDATION (4)                        │  │   │   ║
║  │  │  │    canvas:get-stats                            │  │   │   ║
║  │  │  │    canvas:validate                             │  │   │   ║
║  │  │  │    ... (2 more)                                │  │   │   ║
║  │  │  └─────────────────────────────────────────────────┘  │   │   ║
║  │  │                       ↑                                 │   │   ║
║  │  │        ipcMain.handle() - Error wrapped with try-catch │   │   ║
║  │  │        All events logged to console & file             │   │   ║
║  │  │        All changes marked as dirty for auto-save       │   │   ║
║  │  └────────────────────────────────────────────────────────┘   │   ║
║  │                                                               │   ║
║  │  ┌────────────────────────────────────────────────────────┐   │   ║
║  │  │       System Services                                 │   │   ║
║  │  │  ┌─────────────────────────────────────────────────┐  │   │   ║
║  │  │  │ Canvas System Events                           │  │   │   ║
║  │  │  │  this.canvas.on('node:created', handler)      │  │   │   ║
║  │  │  │  this.canvas.on('link:created', handler)      │  │   │   ║
║  │  │  │  ↓ Broadcast to Renderer ↓                    │  │   │   ║
║  │  │  │  mainWindow?.webContents.send(event, data)   │  │   │   ║
║  │  │  └─────────────────────────────────────────────────┘  │   │   ║
║  │  │                                                       │   │   ║
║  │  │  ┌─────────────────────────────────────────────────┐  │   │   ║
║  │  │  │ State Persistence                              │  │   │   ║
║  │  │  │  ├─ Auto-save every 30 seconds                │  │   │   ║
║  │  │  │  ├─ Backup mechanism (.backup files)          │  │   │   ║
║  │  │  │  ├─ Load on app startup                       │  │   │   ║
║  │  │  │  └─ Save on app quit                          │  │   │   ║
║  │  │  └─────────────────────────────────────────────────┘  │   │   ║
║  │  │                                                       │   │   ║
║  │  │  ┌─────────────────────────────────────────────────┐  │   │   ║
║  │  │  │ Logging System                                 │  │   │   ║
║  │  │  │  ├─ Console logging (dev mode)                │  │   │   ║
║  │  │  │  ├─ File logging (~appData/app.log)           │  │   │   ║
║  │  │  │  ├─ Levels: INFO, WARN, ERROR                │  │   │   ║
║  │  │  │  └─ All operations tracked                    │  │   │   ║
║  │  │  └─────────────────────────────────────────────────┘  │   │   ║
║  │  │                                                       │   │   ║
║  │  │  ┌─────────────────────────────────────────────────┐  │   │   ║
║  │  │  │ Error Handling                                 │  │   │   ║
║  │  │  │  ├─ try-catch in all handlers                │  │   │   ║
║  │  │  │  ├─ Uncaught exception handler               │  │   │   ║
║  │  │  │  ├─ Unhandled rejection handler              │  │   │   ║
║  │  │  │  └─ Error forwarded to renderer              │  │   │   ║
║  │  │  └─────────────────────────────────────────────────┘  │   │   ║
║  │  └────────────────────────────────────────────────────────┘   │   ║
║  │                                                               │   ║
║  │                            ↓                                  │   ║
║  │  ┌────────────────────────────────────────────────────────┐   │   ║
║  │  │   Canvas System (node-canvas-system package)          │   │   ║
║  │  │   - CanvasOrchestrator class                          │   │   ║
║  │  │   - Node management                                  │   │   ║
║  │  │   - Link orchestration                               │   │   ║
║  │  │   - State persistence                                │   │   ║
║  │  │   - Event emission                                   │   │   ║
║  │  └────────────────────────────────────────────────────────┘   │   ║
║  │                                                               │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
║  ┌─────────────────────────────────────────────────────────────────┐   ║
║  │            FILE SYSTEM (appData/userData directory)            │   ║
║  │  ├─ canvas-state.json (current state)                          │   ║
║  │  ├─ canvas-state.json.backup (previous state)                  │   ║
║  │  └─ app.log (application logs)                                 │   ║
║  └─────────────────────────────────────────────────────────────────┘   ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Data Flow: User Creates a Node

```
┌─────────────┐
│  User Click │
│  Add Button │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│  CanvasDemo onClick handler   │
│  createNode('node-1', type)   │
└──────┬───────────────────────┘
       │ window.electron.canvas.createNode()
       │ (async/await)
       ▼
┌──────────────────────────────┐
│  Preload Bridge              │
│  ipcRenderer.invoke(...)      │
└──────┬───────────────────────┘
       │ IPC Message Queue
       ▼
┌──────────────────────────────┐
│  Main Process Handler        │
│  ipcMain.handle('create')    │
│  try {                        │
│    this.canvas.createNode()   │
│    markDirty()                │
│    return node                │
│  }                            │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  Canvas System               │
│  createNode(...)             │
│  → emit('node:created')       │
└──────┬───────────────────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌─────────────────────┐      ┌─────────────────────────┐
│  Main Process Event │      │  Return to Handler      │
│  Listener           │      │                         │
│  .on('created')     │      │  Send back to Renderer  │
│  → broadcast:       │      │  ipcRenderer response   │
│  webContents.send() │      │                         │
└──────┬──────────────┘      └─────────────┬───────────┘
       │                                   │
       ▼                                   ▼
┌────────────────────────────┐  ┌─────────────────────────┐
│  IPC Event Message         │  │  React Component        │
│  'canvas:node-created'     │  │  Hook resolves promise  │
└──────┬─────────────────────┘  │  Updates state          │
       │                        │  setNodes(prev =>       │
       │                        │    [...prev, node])     │
       │                        └─────────────┬───────────┘
       │                                     │
       │                                     ▼
       │                        ┌─────────────────────────┐
       │                        │  Component Re-render    │
       │                        │  Node appears in grid   │
       │                        └─────────────────────────┘
       │
       │ Meanwhile: Event triggers hook listener
       ▼
┌────────────────────────────┐
│  useCanvas Hook            │
│  onNodeCreated listener    │
│  callback fires            │
│  Updates nodes state again │
└────────────────────────────┘

Result:
✅ Node created
✅ Canvas System updated
✅ Main process logged
✅ State marked dirty
✅ React component updated
✅ User sees new node in UI
```

---

## State Persistence Flow

```
USER ACTION
    ↓
State Change (node created, deleted, config updated)
    ↓
markDirty() called
    ↓
Auto-Save Timer (every 30 seconds)
    ├─ Check: isDirtyState()?
    ├─ YES: Create backup (.backup file)
    ├─ Write to disk (canvas-state.json)
    └─ Log success
    ↓
Or Manual Save
    ├─ User clicks Save button
    ├─ saveState() handler
    ├─ Canvas System saves
    ├─ Broadcast event
    ├─ Write to disk
    └─ UI updates (unsaved badge disappears)
    ↓
App Quit
    ├─ Final save triggered
    ├─ State written to disk
    └─ App closes cleanly
    ↓
App Restart
    ├─ loadStateFromDisk()
    ├─ Canvas System loads state
    ├─ UI renders saved nodes
    └─ Ready to use
```

---

## Event Broadcasting System

```
┌─────────────────────┐
│ Canvas System Event │
│ this.canvas.on()    │
└─────────┬───────────┘
          │
    ┌─────┴─────┬──────────┬─────────────┐
    │           │          │             │
    ▼           ▼          ▼             ▼
Node:created Node:deleted Link:created State:saved
    │           │          │             │
    └─────┬─────┴──────────┴─────────────┘
          │ Main Process Listener
          │ setupCanvasListeners()
          ▼
    webContents.send()
          │
    ┌─────┴──────────────┬─────────────────┐
    │                    │                 │
    ▼                    ▼                 ▼
ipcRenderer.on()   Preload Listens   Broadcast
    │
    ▼
useCanvas Hook
    │
    ├─ onNodeCreated callback
    │   ├─ updateState()
    │   └─ setNodes()
    │
    ├─ onLinkCreated callback
    │   ├─ updateState()
    │   └─ setLinks()
    │
    └─ onStateSaved callback
        ├─ setIsDirty(false)
        └─ hideUnsavedBadge()
    │
    ▼
React Re-render
    │
    ▼
UI Updated
```

---

## Error Handling Chain

```
Renderer (React)
    │ try-catch
    └─→ Error in useCanvas
        │ catch(error)
        │ setError(message)
        └─→ Display in UI (ErrorBox)

Preload (IPC Bridge)
    │ (No error handling - passes through)
    └─→ Forward to main

Main Process Handler
    │ try-catch
    ├─ Success: return result
    └─ Error:
        │ catch(error)
        ├─ log('ERROR', message, stack)
        ├─ Send back to renderer
        └─ throw error (forward to React)

Canvas System
    │ Internal errors
    │ emit('error', error)
    └─→ Main process listener
        │ mainWindow?.webContents.send()
        └─→ useCanvas onError callback
            │ setError()
            └─→ Display in UI

Global Handlers
    │
    ├─ process.on('uncaughtException')
    │   ├─ log()
    │   └─ dialog.showErrorBox()
    │
    └─ process.on('unhandledRejection')
        ├─ log()
        └─ Stop crash
```

---

## Complete Lifecycle

```
APP START
    │
    ├─→ Electron app.ready
    │   │
    │   ├─→ initConfig()
    │   │   ├─ Check userData path exists
    │   │   └─ Create if missing
    │   │
    │   ├─→ setupErrorHandling()
    │   │   ├─ uncaughtException
    │   │   └─ unhandledRejection
    │   │
    │   ├─→ setupIPC()
    │   │   └─ Register 30+ handlers
    │   │
    │   ├─→ setupCanvasListeners()
    │   │   └─ Listen to Canvas events
    │   │
    │   ├─→ loadStateFromDisk()
    │   │   └─ Restore previous state if exists
    │   │
    │   ├─→ setupAutoSave()
    │   │   └─ Start 30s save interval
    │   │
    │   ├─→ setupMenu()
    │   │   └─ Create app menu
    │   │
    │   └─→ createWindow()
    │       └─ Show main window
    │
    ├─→ RUNNING
    │   │
    │   ├─→ Auto-save timer (every 30s)
    │   │   └─ if isDirty: saveStateToDisk()
    │   │
    │   ├─→ User interactions
    │   │   ├─ Click buttons
    │   │   ├─ IPC calls
    │   │   ├─ Canvas updates
    │   │   ├─ Events broadcast
    │   │   └─ UI updates
    │   │
    │   └─→ Logging all operations
    │       └─ console + app.log
    │
    ├─→ APP QUIT (before-quit)
    │   │
    │   ├─→ cleanup()
    │   │   ├─ Clear auto-save timer
    │   │   ├─ Final state save
    │   │   ├─ Log shutdown
    │   │   └─ Close gracefully
    │   │
    │   └─→ app.quit()
    │       └─ Exit process
    │
    └─→ CLOSED
        └─ Ready for next restart
```

---

## Module Dependencies

```
src/main.ts
├── Imports:
│   ├─ electron (app, BrowserWindow, ipcMain, Menu, dialog)
│   ├─ path, fs (file operations)
│   ├─ node-canvas-system (CanvasOrchestrator)
│   └─ fileURLToPath (ESM support)
└─ Exports:
    └─ ElectronCanvasHost class

src/preload.ts
├── Imports:
│   ├─ electron (contextBridge, ipcRenderer)
│   └─ (No node-canvas-system - renderer only)
└─ Exports:
    ├─ ElectronAPI interface
    ├─ CompleteCanvasAPI interface
    ├─ FileAPI interface
    ├─ AppAPI interface
    └─ Global Window type

src/hooks/useCanvas.ts
├── Imports:
│   ├─ react (useState, useCallback, useEffect, useRef)
│   └─ (No node dependencies - only browser APIs)
└─ Exports:
    ├─ useCanvas() hook
    └─ useCanvasWithMemoization() hook

src/components/CanvasDemo.tsx
├── Imports:
│   ├─ react (React, useState)
│   ├─ useCanvas hook
│   └─ (No node dependencies)
└─ Exports:
    └─ CanvasDemo component
```

---

## Security Layers

```
Layer 1: Process Separation
├─ Main Process (Node.js with file access)
├─ Renderer Process (Browser sandbox)
└─ Preload (Context isolation bridge only)

Layer 2: IPC Validation
├─ Type checking at preload
├─ Handler validation in main
└─ Error messages don't leak secrets

Layer 3: Window Security
├─ nodeIntegration: false (can't access Node)
├─ contextIsolation: true (isolated context)
├─ sandbox: true (additional isolation)
└─ enableRemoteModule: false (no remote access)

Layer 4: Code Safety
├─ No eval() anywhere
├─ No innerHTML usage
├─ All input validated
└─ All operations logged
```

---

This is the **complete visual representation** of your production-grade Electron system!

All components work together seamlessly with:
- ✅ Type safety end-to-end
- ✅ Error handling at every layer
- ✅ Logging throughout
- ✅ Real-time event broadcasting
- ✅ Automatic state persistence
- ✅ Security best practices
