# UniDock Architecture - Modular & Adaptive Design

## 🏗️ System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      UniDock Application                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React UI Layer (Renderer Process)          │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  ┌──────────────┐      ┌──────────────────────┐   │  │
│  │  │ App.tsx      │      │ State Management     │   │  │
│  │  │ • Dock View  │──────│ • useState (Secrets) │   │  │
│  │  │ • Settings   │      │ • useState (Status)  │   │  │
│  │  └──────────────┘      │ • useEffect (Init)   │   │  │
│  │         │              └──────────────────────┘   │  │
│  │         ↓                                          │  │
│  │  ┌──────────────────────────────────────────────┐ │  │
│  │  │    Event Handlers (runSync, setView)        │ │  │
│  │  │    User clicks → State changes → Re-render  │ │  │
│  │  └──────────────────────────────────────────────┘ │  │
│  │         │                                          │  │
│  │         ↓ window.api.* (IPC Requests)             │  │
│  └──────────────────────────────────────────────────┘  │
│           │                                             │
│           │ ┌─────────────────────────────────────┐   │
│           │ │  Preload Bridge                     │   │
│           │ │  (electron/preload.ts)              │   │
│           └─│  • contextBridge.exposeInMainWorld │   │
│             │  • IPC method definitions           │   │
│             └────────────────────┬────────────────┘   │
│                                  │                     │
│  ┌───────────────────────────────▼──────────────────┐  │
│  │        Electron Main Process (IPC Handler)       │  │
│  ├─────────────────────────────────────────────────┤  │
│  │                                                │  │
│  │  ipcMain.handle('get-secrets')                │  │
│  │    → electron-store.get('secrets')            │  │
│  │    → Return to renderer                       │  │
│  │                                               │  │
│  │  ipcMain.handle('save-secrets', data)         │  │
│  │    → electron-store.set('secrets', data)      │  │
│  │    → Persist to disk                          │  │
│  │                                               │  │
│  │  ipcMain.handle('supabase-sync')              │  │
│  │    → Get secrets from store                   │  │
│  │    → Create Supabase client                   │  │
│  │    → Execute query                            │  │
│  │    → Return result                            │  │
│  │                                               │  │
│  │  ipcMain.handle('cloudflare-sync')            │  │
│  │    → Get secrets from store                   │  │
│  │    → Fetch CF API endpoint                    │  │
│  │    → Return result                            │  │
│  │                                               │  │
│  └────┬──────────────┬──────────────┬────────────┘  │
│       ↓              ↓              ↓                 │
└───────┼──────────────┼──────────────┼────────────────┘
        │              │              │
        │              │              │
    ┌───▼──┐   ┌──────▼────┐   ┌─────▼────┐
    │      │   │           │   │          │
    │Store │   │ Supabase  │   │Cloudflare│
    │      │   │ Database  │   │ KV Store │
    └──────┘   └───────────┘   └──────────┘
```

---

## 🔄 Data Flow Example: "Supabase Sync"

```
1. User clicks "Supabase" button
   └─ handleClick() → runSync('supabase')

2. React State Update
   └─ setStatus({ text: 'Syncing...', type: 'info' })
   └─ Re-render with disabled button

3. IPC Request Sent
   └─ window.api.supabaseSync()  ← async call

4. Electron Main Handler
   └─ Receives 'supabase-sync' message
   └─ Gets stored secrets from electron-store
   └─ Creates Supabase client
   └─ Executes SELECT query
   └─ Returns { success: true, message: '...' }

5. Promise Resolved in React
   └─ setStatus({ text: '...', type: 'success' })

6. UI Updates
   └─ Button re-enabled
   └─ Green status message displays
   └─ Auto-clear after 4 seconds

Result: Full round-trip, no blocking!
```

---

## 📦 Modular Design Principles

### 1. **Separation of Concerns**

| Layer | Responsibility | Tech |
|-------|---|---|
| **UI** | Display + Interactions | React + CSS |
| **IPC Bridge** | Communication | Electron preload |
| **Main** | Business Logic + APIs | Node.js + Electron |
| **Storage** | Persistence | electron-store |

### 2. **Flexibility Pattern**

```typescript
// Generic API response type - reusable
interface ApiResponse {
  success: boolean;
  message: string;
}

// Easily extend for new API handlers:
ipcMain.handle('new-api', async () => {
  try {
    // ... API call ...
    return { success: true, message: '...' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
});
```

### 3. **Adaptive to Changes**

#### To add new API:
1. Add handler in `electron/main.ts`
2. Expose in `electron/preload.ts`
3. Type in `src/electron-env.d.ts`
4. Use in `src/App.tsx`

**No file restructuring needed!**

---

## 🧩 Component Hierarchy

```
App (Root)
├── Logo
├── Buttons Group
│  ├── "Supabase" button (onClick → runSync)
│  ├── "Cloudflare" button (onClick → runSync)
│  └── Settings icon (onClick → setView)
├── Status Bar
│  └─ Dynamic styling based on status.type
└── (Conditional) Settings View
   ├── Input fields for each secret
   ├── Save button (onClick → saveSecrets)
   └── Cancel button (onClick → setView)
```

---

## 💾 State Management (Simple & Sufficient)

```typescript
// 1. Secrets (what user saves)
const [secrets, setSecrets] = useState<Secrets>({...})

// 2. View (which screen)
const [view, setView] = useState<ViewType>('dock')

// 3. Status (feedback to user)
const [status, setStatus] = useState<{...}>({...})

// 4. Loading (async operation)
const [loading, setLoading] = useState(false)

// No Redux/Context needed for this scale!
```

Why not Redux?
- **Pro:** Centralized state (good for large apps)
- **Con:** Over-engineered for 4 simple values
- **UniDock approach:** React hooks are simpler + sufficient

---

## 🔌 Adding New Features

### Example: Add "Discord Sync" button

**Step 1:** electron/main.ts
```typescript
ipcMain.handle('discord-sync', async () => {
  const secrets = store.get('secrets', {}) as any;
  try {
    // Discord API logic...
    return { success: true, message: 'Discord synced!' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
});
```

**Step 2:** electron/preload.ts
```typescript
discordSync: () => ipcRenderer.invoke('discord-sync'),
```

**Step 3:** src/electron-env.d.ts
```typescript
discordSync: () => Promise<{ success: boolean; message: string }>;
```

**Step 4:** src/App.tsx
```typescript
const runSync = async (type: 'supabase' | 'cloudflare' | 'discord') => {
  // ... existing logic ...
  const res = type === 'discord' ? await window.api.discordSync() : ...
};

// In JSX:
<button onClick={() => runSync('discord')}>Discord</button>
```

**That's it! 4 small changes, zero restructuring.**

---

## 🎯 Design Principles Applied

### 1. **Keep It Simple**
- No overly complex state management
- Direct function calls via IPC
- electron-store for persistence

### 2. **Modular**
- Each handler is independent
- Can add/remove features easily
- Files have clear responsibilities

### 3. **Flexible**
- Generic API response type
- Union types for view states
- Easy to extend

### 4. **Adaptive**
- React hooks auto-update UI
- IPC handlers can be changed without UI changes
- Type system prevents mistakes

---

## 📊 Performance Characteristics

| Operation | Time | Notes |
|---|---|---|
| Type check | ~2s | `npm run typecheck` |
| Dev start | ~1s | Vite HMR ready |
| Hot reload | <200ms | Save → See change |
| IPC call | ~50-100ms | Network depends on API |
| Store persist | Instant | electron-store handles |

---

## 🔐 Security Notes

- ✅ Secrets stored locally (electron-store)
- ✅ IPC uses contextBridge (safe)
- ✅ No nodeIntegration (proper isolation)
- ⚠️ Env vars in .env (don't commit API keys!)

---

**This architecture scales from prototype to production smoothly.**
