# 🗺️ UniDock File Structure & Type Map

## Project Layout

```
UniDock/
├── 📄 Documentation (NEW)
│   ├── STATUS.md              ← Summary (start here)
│   ├── QUICKSTART.md          ← 3-step guide
│   ├── YOUR_ACTION.md         ← Checklist
│   ├── ARCHITECTURE.md        ← System design
│   ├── MIGRATION.md           ← Technical details
│   ├── BEFORE_AFTER.md        ← Code comparison
│   ├── INDEX.md               ← Doc navigation
│   └── README_MIGRATION.md    ← This overview
│
├── 🔧 Configuration
│   ├── package.json           ← Dependencies
│   ├── vite.config.ts         ← Build config
│   ├── vite.config.js         ← (old, ignore)
│   ├── tsconfig.json          ← TS main config
│   ├── tsconfig.app.json      ← App config
│   ├── tsconfig.node.json     ← Node config
│   ├── .env                   ← Environment vars
│   ├── .env.local             ← Local overrides
│   └── eslint.config.js       ← Linting rules
│
├── 📦 Application Code
│   │
│   ├── 🎨 Frontend (src/)
│   │   ├── App.tsx            ← ✅ Main component (RECONSTRUCTED)
│   │   │   ├── Type definitions (ViewType, Secrets, etc.)
│   │   │   ├── useState hooks (view, secrets, status, loading)
│   │   │   ├── useEffect for initialization
│   │   │   ├── runSync handler
│   │   │   ├── Dock view (buttons + status)
│   │   │   └── Settings view (forms)
│   │   │
│   │   ├── main.tsx           ← ✅ React entry (RECONSTRUCTED)
│   │   │   ├── Import React libraries
│   │   │   ├── Create root element
│   │   │   ├── Render App component
│   │   │   └── StrictMode enabled
│   │   │
│   │   ├── electron-env.d.ts  ← Type definitions
│   │   │   └── window.api interface
│   │   │
│   │   ├── index.css          ← Global styles
│   │   ├── App.css            ← Component styles
│   │   │
│   │   └── assets/
│   │       └── react.svg
│   │
│   └── ⚡ Electron (electron/)
│       ├── main.ts            ← IPC handlers
│       │   ├── createWindow()
│       │   ├── ipcMain.handle('get-secrets')
│       │   ├── ipcMain.handle('save-secrets')
│       │   ├── ipcMain.handle('supabase-sync')
│       │   ├── ipcMain.handle('cloudflare-sync')
│       │   └── app.whenReady()
│       │
│       └── preload.ts         ← Security bridge
│           └── contextBridge.exposeInMainWorld('api')
│
├── 📁 Build Output (auto-generated)
│   ├── dist/                  ← Frontend bundle
│   │   ├── index.html
│   │   ├── assets/
│   │   │   ├── index-*.js
│   │   │   └── index-*.css
│   │   └── vite.svg
│   │
│   └── dist-electron/         ← Electron bundle
│       ├── main.js            ← Compiled main.ts
│       └── preload.mjs        ← Compiled preload.ts
│
├── 📚 Resources
│   ├── public/
│   │   └── vite.svg
│   │
│   ├── README.md              ← Original project info
│   └── node_modules/          ← Dependencies
│
└── 🎬 Scripts (for dev)
    ├── run-dev.bat            ← Quick start script
    └── typecheck.bat          ← Type validation script
```

---

## 🔄 Data Flow: Component → IPC → Electron → API

```
┌─────────────────────────────────────────────────────────────┐
│ React Component (src/App.tsx)                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Button Click → runSync('supabase')                          │
│         │                                                    │
│         ├─→ setLoading(true)    [UI feedback]              │
│         └─→ window.api.supabaseSync()  [IPC CALL]          │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      │ Electron IPC Message
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ Electron Main Process (electron/main.ts)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ipcMain.handle('supabase-sync', async () => {             │
│   • Get secrets from electron-store                        │
│   • Create Supabase client                                 │
│   • Execute query                                          │
│   • Return { success, message }                            │
│ })                                                          │
│         │                                                    │
│         └─→ Fetch from Supabase API                        │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      │ API Response
                      ↓
┌─────────────────────────────────────────────────────────────┐
│ Response Back to React (src/App.tsx)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Promise resolves with ApiResponse                          │
│       │                                                      │
│       ├─→ setLoading(false)                                │
│       ├─→ setStatus({ text, type })                        │
│       └─→ Re-render with updated UI                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Type Definitions Map

### React Component Types (App.tsx)
```typescript
type ViewType = 'dock' | 'settings'
  // Represents current screen view

type StatusType = 'info' | 'success' | 'error'
  // Message status color/type

interface Secrets {
  supabaseUrl: string
  supabaseKey: string
  cfAccountId: string
  cfApiToken: string
  cfKvNamespace: string
}
  // Configuration object stored in electron-store

interface ApiResponse {
  success: boolean
  message: string
}
  // Response from IPC handlers
```

### Window API Types (electron-env.d.ts)
```typescript
declare global {
  interface Window {
    api: {
      getSecrets(): Promise<Secrets>
      saveSecrets(secrets: Secrets): Promise<{ success: boolean }>
      supabaseSync(): Promise<ApiResponse>
      cloudflareSync(): Promise<ApiResponse>
    }
  }
}
  // Exposed IPC methods from preload.ts
```

---

## 🔌 IPC Handler Map

### electron/main.ts → electron/preload.ts → window.api

| Handler | Purpose | Input | Output |
|---------|---------|-------|--------|
| `get-secrets` | Load stored secrets | - | `Secrets` |
| `save-secrets` | Persist secrets | `Secrets` | `{ success }` |
| `supabase-sync` | Test Supabase | - | `ApiResponse` |
| `cloudflare-sync` | Test Cloudflare | - | `ApiResponse` |

---

## 🎨 Component State Map

### App.tsx State Variables

```typescript
const [view, setView] = useState<ViewType>('dock')
  // Current screen: 'dock' or 'settings'
  // Used to render different JSX

const [secrets, setSecrets] = useState<Secrets>({...})
  // API credentials object
  // Persisted to electron-store
  // Displayed in settings form

const [status, setStatus] = useState<{
  text: string
  type: StatusType
}>({ text: 'Ready', type: 'info' })
  // User feedback messages
  // Auto-cleared after 4 seconds

const [loading, setLoading] = useState(false)
  // Indicates async operation
  // Disables buttons during sync
```

---

## 📦 Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",                    // Start Vite dev server + HMR
    "build": "tsc -b && vite build",  // Type check + build
    "typecheck": "tsc --noEmit",      // Validate types only
    "lint": "eslint . --ext ...",     // Check code quality
    "lint:fix": "eslint . --fix",     // Auto-fix code
    "format": "prettier --write",     // Format code style
    "preview": "vite preview",        // Preview built app
    "electron": "electron .",         // Run Electron app
    "electron:serve": "wait-on ... && electron .", // With dev server
    "start": "npm run dev"            // Alias for dev
  }
}
```

---

## 🚀 Build Workflow

### Development Workflow
```
npm install
  ↓
npm run dev          [Terminal 1: Start Vite]
  ↓
electron .           [Terminal 2: Run Electron]
  ↓
Make changes
  ↓
Save file
  ↓
HMR reloads automatically (Vite)
  ↓
See changes instantly
```

### Production Workflow
```
npm install
  ↓
npm run build        [Compile + Bundle]
  ↓
dist/                [Frontend]
dist-electron/       [Electron]
  ↓
electron .           [Run from dist]
  ↓
Ready for distribution
```

---

## 🧪 Type Checking Workflow

```
npm run typecheck
  ↓
TypeScript Compiler
  ├─ Check all .ts files
  ├─ Validate interfaces
  ├─ Verify imports
  └─ Catch type errors
  ↓
Output: "0 errors" ✅ or details of issues
```

---

## 📊 File Size Summary

| File | Lines | Purpose |
|------|-------|---------|
| App.tsx | 155 | Main React component |
| main.tsx | 17 | React entry point |
| main.ts (electron) | 74 | Electron IPC |
| preload.ts | 8 | Security bridge |
| electron-env.d.ts | 12 | Type definitions |
| Total Code | ~266 | Functional code |
| Documentation | ~2000 | Guides + reference |

---

## 🎯 How to Navigate This Project

### For Code Changes
1. Edit `src/App.tsx` (UI)
2. Or edit `electron/main.ts` (logic)
3. Run `npm run typecheck` (validate)
4. See changes with hot reload

### For Configuration Changes
1. Edit `vite.config.ts` (build)
2. Or `tsconfig.json` (types)
3. Restart: `npm run dev`

### For Type Changes
1. Edit `electron-env.d.ts` (API types)
2. Or interfaces in `src/App.tsx`
3. Run `npm run typecheck` (validate)

### For Dependencies
1. Edit `package.json`
2. Run `npm install`
3. Verify `npm run typecheck` still passes

---

## 🔐 Security Layout

```
Electron Security Model:

┌─────────────────────────────────────┐
│ Renderer Process (React)             │
│ ❌ No Node.js access                │
│ ❌ No FS access                     │
│ ✅ Can call IPC methods             │
└────────────────┬────────────────────┘
                 │
            IPC Bridge
         (electron/preload.ts)
           - contextBridge
           - contextIsolation: true
                 │
┌────────────────▼────────────────────┐
│ Main Process (Node.js)               │
│ ✅ Full FS access                   │
│ ✅ Can access APIs                  │
│ ✅ Explicit IPC handlers only       │
└─────────────────────────────────────┘
```

---

## 📝 Quick Reference

### To View/Edit
- **UI Logic:** `src/App.tsx`
- **Styles:** `src/index.css` or `src/App.css`
- **IPC Handlers:** `electron/main.ts`
- **Type Definitions:** `src/electron-env.d.ts`
- **Build Config:** `vite.config.ts` or `tsconfig.json`

### To Run
```bash
npm run dev          # Start development
electron .          # Run Electron app
npm run typecheck   # Validate types
npm run build       # Production build
```

### To Understand
- **Architecture:** Read `ARCHITECTURE.md`
- **Changes:** Read `BEFORE_AFTER.md`
- **Details:** Read `MIGRATION.md`
- **Getting Started:** Read `QUICKSTART.md`

---

## ✨ Project Summary

**Status:** ✅ Pure TypeScript, Production Ready

**Key Files:**
- App.tsx (155 lines) - Main UI
- main.ts (74 lines) - Electron logic
- Types (12 lines) - Full type safety

**Documentation:** 7 comprehensive guides

**Ready to:** Develop, extend, and deploy

---

**For questions, start with the docs (STATUS.md or INDEX.md)**
