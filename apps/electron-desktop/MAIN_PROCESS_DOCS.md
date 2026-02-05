# 📚 Complete Electron Main Process Documentation

## Overview

The `main.ts` file is a **production-grade Electron application** that bridges the Node Canvas System with a React UI. It implements:

- ✅ Complete IPC communication layer
- ✅ Canvas System integration
- ✅ State persistence & auto-save
- ✅ Error handling & recovery
- ✅ File I/O operations
- ✅ Application lifecycle management
- ✅ Logging system
- ✅ Menu system

---

## Architecture

```
┌─────────────────────────────────────┐
│   ElectronCanvasHost (main.ts)      │
├─────────────────────────────────────┤
│ • IPC Handlers (Canvas API)         │
│ • Canvas System (CanvasOrchestrator)│
│ • Event Broadcasting                │
│ • State Persistence                 │
│ • Error Handling                    │
│ • File I/O                          │
│ • Logging                           │
└──────────┬──────────────────────────┘
           │
     ┌─────┴──────────┬──────────┬──────────┐
     ↓                ↓          ↓          ↓
  Preload         Canvas      Events     Filesystem
  Bridge          System      System     Operations
```

---

## Class: ElectronCanvasHost

Main application controller.

### Constructor

```typescript
constructor() {
  this.canvas = new CanvasOrchestrator();
  this.config = this.initConfig();
  this.setupIPC();
  this.setupCanvasListeners();
  this.setupErrorHandling();
}
```

### Properties

| Property | Type | Purpose |
|----------|------|---------|
| `canvas` | `CanvasOrchestrator` | Canvas System instance |
| `mainWindow` | `BrowserWindow \| null` | Main application window |
| `config` | `AppConfig` | Configuration (isDev, paths) |
| `lastSaveTime` | `number` | Timestamp of last save |
| `autoSaveInterval` | `NodeJS.Timer \| null` | Auto-save interval handle |
| `isClosing` | `boolean` | App shutdown flag |

---

## Key Methods

### `initConfig(): AppConfig`

Initialize application configuration.

**Returns:**
```typescript
{
  isDev: boolean;           // Development mode flag
  appDataPath: string;      // User data directory
  stateFilePath: string;    // Canvas state file path
  logFilePath: string;      // Application log file path
}
```

**Example:**
```typescript
const config = this.initConfig();
// {
//   isDev: true,
//   appDataPath: '/Users/user/Library/Application Support/app',
//   stateFilePath: '...canvas-state.json',
//   logFilePath: '...app.log'
// }
```

### `log(level, message, extra?): void`

Write logs to console and file.

**Parameters:**
- `level`: `'INFO' | 'WARN' | 'ERROR'`
- `message`: Log message
- `extra`: Additional details

**Example:**
```typescript
this.log('INFO', 'Creating node', `nodeId: ${nodeId}`);
this.log('ERROR', 'Failed to create node', error.stack);
```

### `setupIPC(): void`

Setup all IPC handlers for communication with renderer.

**Canvas Node Operations:**
```typescript
ipcMain.handle('canvas:create-node', (_, args) => { ... })
ipcMain.handle('canvas:get-nodes', () => { ... })
ipcMain.handle('canvas:delete-node', (_, nodeId) => { ... })
ipcMain.handle('canvas:update-node-config', (_, args) => { ... })
```

**Canvas Link Operations:**
```typescript
ipcMain.handle('canvas:create-link', (_, args) => { ... })
ipcMain.handle('canvas:get-links', () => { ... })
ipcMain.handle('canvas:delete-link', (_, linkId) => { ... })
```

**State Management:**
```typescript
ipcMain.handle('canvas:save-state', (_, metadata) => { ... })
ipcMain.handle('canvas:load-state', (_, state) => { ... })
ipcMain.handle('canvas:get-state', () => { ... })
```

**File Operations:**
```typescript
ipcMain.handle('file:write', (_, { filePath, content }) => { ... })
ipcMain.handle('file:read', (_, filePath) => { ... })
```

**App Control:**
```typescript
ipcMain.handle('app:quit', () => { ... })
ipcMain.handle('app:minimize', () => { ... })
ipcMain.handle('app:maximize', () => { ... })
```

### `setupCanvasListeners(): void`

Listen to Canvas System events and broadcast to renderer.

**Events:**
- `node:created` → `canvas:node-created`
- `node:deleted` → `canvas:node-deleted`
- `node:updated` → `canvas:node-updated`
- `link:created` → `canvas:link-created`
- `link:deleted` → `canvas:link-deleted`
- `state:saved` → `canvas:state-saved`
- `state:loaded` → `canvas:state-loaded`
- `error` → `canvas:error`

### `saveStateToDisk(state): void`

Save canvas state to disk with automatic backup.

**Features:**
- Creates `.backup` file before writing
- Automatic recovery mechanism
- Error handling with logging

**Example:**
```typescript
const state = this.canvas.getState();
this.saveStateToDisk(state);
// Saves to: appDataPath/canvas-state.json
// Backup to: appDataPath/canvas-state.json.backup
```

### `setupAutoSave(): void`

Setup automatic state saving every 30 seconds.

**Behavior:**
- Checks if state is dirty
- Only saves if changes detected
- Runs on 30-second interval
- Continues through app lifecycle

### `createWindow(): void`

Create main application window.

**Features:**
- Context isolation enabled (security)
- Preload script configured
- DevTools auto-open in dev mode
- Min width/height enforced

**Configuration:**
```typescript
{
  width: 1400,
  height: 900,
  minWidth: 800,
  minHeight: 600,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true
  }
}
```

### `start(): void`

Start the application.

**Lifecycle:**
1. `app.ready` → Load state + setup auto-save + create window
2. `window-all-closed` → Quit app (except on macOS)
3. `activate` → Recreate window if needed
4. `before-quit` → Cleanup + final save
5. `quit` → Complete

---

## IPC Handlers Reference

### Canvas Node Operations

#### `canvas:create-node`
Create a new canvas node.

**Request:**
```typescript
{
  nodeId: string;
  type: string;
  config?: any;
}
```

**Response:**
```typescript
{
  id: string;
  type: string;
  label: string;
  config: any;
  position: { x: number; y: number };
  // ... more node properties
}
```

**Usage (React):**
```typescript
const node = await window.electron.canvas.createNode(
  'node-1',
  'calculator',
  { precision: 2 }
);
```

#### `canvas:delete-node`
Delete a node.

**Request:**
```typescript
nodeId: string
```

**Response:**
```typescript
{ success: boolean }
```

#### `canvas:update-node-config`
Update node configuration.

**Request:**
```typescript
{
  nodeId: string;
  configKey: string;
  value: any;
  reason?: string;  // Optional: track why changed
}
```

**Response:**
```typescript
{ success: boolean }
```

#### `canvas:get-nodes`
Get all nodes.

**Response:**
```typescript
Array<Node>
```

### Canvas Link Operations

#### `canvas:create-link`
Create a connection between nodes.

**Request:**
```typescript
{
  sourceNodeId: string;
  sourceKey: string;
  targetNodeId: string;
  targetKey: string;
}
```

**Response:**
```typescript
{
  id: string;
  sourceNodeId: string;
  sourceKey: string;
  targetNodeId: string;
  targetKey: string;
  enabled: boolean;
}
```

#### `canvas:delete-link`
Delete a link.

**Request:**
```typescript
linkId: string
```

**Response:**
```typescript
{ success: boolean }
```

#### `canvas:get-links`
Get all links.

**Response:**
```typescript
Array<Link>
```

#### `canvas:toggle-link`
Enable/disable a link.

**Request:**
```typescript
linkId: string
```

**Response:**
```typescript
{ success: boolean }
```

### State Management

#### `canvas:save-state`
Save current canvas state.

**Request:**
```typescript
metadata?: {
  name?: string;
  description?: string;
  [key: string]: any;
}
```

**Response:**
```typescript
{
  nodes: Array<Node>;
  links: Array<Link>;
  metadata: any;
  timestamp: number;
}
```

#### `canvas:load-state`
Load a previously saved state.

**Request:**
```typescript
{
  nodes: Array<Node>;
  links: Array<Link>;
  metadata: any;
}
```

**Response:**
```typescript
{ success: boolean }
```

#### `canvas:get-state`
Get current state without saving.

**Response:**
```typescript
{
  nodes: Array<Node>;
  links: Array<Link>;
  // ... state structure
}
```

#### `canvas:is-dirty`
Check if state has unsaved changes.

**Response:**
```typescript
boolean
```

### Debug & Validation

#### `canvas:get-stats`
Get performance statistics.

**Response:**
```typescript
{
  nodeCount: number;
  linkCount: number;
  memory: number;
  uptime: number;
  // ... more stats
}
```

#### `canvas:get-flow-history`
Get historical flow events.

**Request:**
```typescript
limit?: number  // Default: 50
```

**Response:**
```typescript
Array<FlowEvent>
```

#### `canvas:validate`
Validate canvas integrity.

**Response:**
```typescript
{
  valid: boolean;
  errors: Array<ValidationError>;
  warnings: Array<string>;
}
```

### File Operations

#### `file:write`
Write content to file.

**Request:**
```typescript
{
  filePath: string;
  content: string;
}
```

**Response:**
```typescript
{ success: boolean }
```

#### `file:read`
Read file content.

**Request:**
```typescript
filePath: string
```

**Response:**
```typescript
{
  success: boolean;
  content: string;
}
```

#### `file:open-save-dialog`
Open save file dialog.

**Request:**
```typescript
{
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}
```

**Response:**
```typescript
{
  canceled: boolean;
  filePath?: string;
}
```

#### `file:open-open-dialog`
Open file selection dialog.

**Request:**
```typescript
{
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: Array<string>;
}
```

**Response:**
```typescript
{
  canceled: boolean;
  filePaths: Array<string>;
}
```

### App Control

#### `app:get-version`
Get app version.

**Response:**
```typescript
string  // e.g., "1.0.0"
```

#### `app:get-path`
Get system path.

**Request:**
```typescript
pathType: string  // 'home', 'appData', 'userData', etc.
```

**Response:**
```typescript
string  // Path to the directory
```

#### `app:get-config`
Get app configuration.

**Response:**
```typescript
{
  isDev: boolean;
  appDataPath: string;
  version: string;
}
```

#### `app:quit`
Quit the application.

#### `app:minimize`
Minimize the window.

#### `app:maximize`
Maximize/restore the window.

#### `app:close`
Close the window.

---

## Event System

### Canvas Events (sent from main to renderer)

| Event | Data | When |
|-------|------|------|
| `canvas:node-created` | `node` | After node creation |
| `canvas:node-deleted` | `nodeId` | After node deletion |
| `canvas:node-updated` | `node` | After node update |
| `canvas:link-created` | `link` | After link creation |
| `canvas:link-deleted` | `linkId` | After link deletion |
| `canvas:state-saved` | `state` | After state save |
| `canvas:state-loaded` | `state` | After state load |
| `canvas:error` | `{ message, code }` | On canvas error |

### App Events

| Event | Data | When |
|-------|------|------|
| `app:save-triggered` | - | User presses Ctrl+S |

---

## Error Handling

### Global Error Handlers

```typescript
// Uncaught exceptions
process.on('uncaughtException', (error) => {
  this.log('ERROR', error.message);
  dialog.showErrorBox('Error', error.message);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  this.log('ERROR', `Rejection: ${reason}`);
});
```

### IPC Handler Error Pattern

```typescript
ipcMain.handle('canvas:action', (_, args) => {
  try {
    this.log('INFO', 'Action started');
    const result = this.canvas.doSomething(args);
    return result;
  } catch (error) {
    this.log('ERROR', 'Action failed', error.message);
    throw error;  // Forward to renderer
  }
});
```

---

## Logging

All important events are logged to:
- **Console** (for development)
- **File** (appData/app.log)

**Log Levels:**
- `INFO` - General information
- `WARN` - Warnings
- `ERROR` - Errors

**Examples:**
```typescript
this.log('INFO', 'App started');
this.log('WARN', 'Low memory detected');
this.log('ERROR', 'Operation failed', stack);
```

---

## Configuration Files

### User Data Directory
```
~/.../Library/Application Support/UniDock Canvas/
├── canvas-state.json          # Current canvas state
├── canvas-state.json.backup   # Previous state backup
└── app.log                    # Application log
```

---

## Best Practices

### 1. Always mark state as dirty after changes
```typescript
this.canvas.updateNodeConfig(nodeId, key, value);
this.markDirty();  // Important for auto-save
```

### 2. Handle errors in IPC handlers
```typescript
ipcMain.handle('action', (_, args) => {
  try {
    return this.canvas.doSomething(args);
  } catch (error) {
    this.log('ERROR', 'Failed', error.message);
    throw error;  // Send to renderer
  }
});
```

### 3. Use logging for debugging
```typescript
this.log('INFO', `Node created: ${nodeId}`);
this.log('WARN', 'Performance warning');
```

### 4. Listen to canvas events
```typescript
this.canvas.on('error', (error) => {
  this.mainWindow?.webContents.send('canvas:error', error);
});
```

---

## Performance Considerations

- **Auto-save interval:** 30 seconds
- **Event broadcasting:** Instant
- **State persistence:** Asynchronous with backup
- **Memory:** Efficient event listeners with cleanup

---

## Extending the Main Process

### Adding New IPC Handler

```typescript
// In setupIPC()
ipcMain.handle('custom:action', (_, args) => {
  try {
    this.log('INFO', 'Custom action');
    // Your logic here
    return result;
  } catch (error) {
    this.log('ERROR', 'Custom action failed', error.message);
    throw error;
  }
});
```

### Adding New Menu Item

```typescript
// In setupMenu()
const template = [
  {
    label: 'Custom',
    submenu: [
      {
        label: 'My Action',
        click: () => {
          this.mainWindow?.webContents.send('custom:triggered');
        }
      }
    ]
  }
];
```

---

## Troubleshooting

### State not persisting
- Check that `markDirty()` is called
- Verify `appDataPath` exists
- Check file permissions

### IPC handlers not responding
- Verify handler name matches (case-sensitive)
- Check that preload script is loaded
- Review browser console for errors

### App crashes
- Check `app.log` file
- Look for `uncaughtException` logs
- Verify Canvas System methods are valid

---

## API Summary

**Total IPC Handlers:** 30+
**Event Types:** 8
**File Operations:** 4
**App Control Methods:** 5

All methods include:
- ✅ Error handling
- ✅ Logging
- ✅ Type safety (through preload)
- ✅ State management

