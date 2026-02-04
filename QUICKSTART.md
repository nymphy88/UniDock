# Quick Start Guide - UniDock TypeScript Edition

## 🎯 Super Quick (3 steps)

```bash
# 1. Install deps
npm install

# 2. Type check
npm run typecheck

# 3. Run dev
npm run dev
```

---

## 🔌 Two Ways to Run

### Option A: Dev Server Only (Frontend Testing)
```bash
npm run dev
# Opens Vite dev server on http://localhost:5173
# Good for UI/CSS testing without Electron
```

### Option B: Full Electron App
```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron (when port 5173 is ready)
electron .
```

---

## 📝 What's New?

| File | Before | After | Purpose |
|------|--------|-------|---------|
| `App.tsx` | Compiled `.js` | Pure TypeScript | Full type safety |
| `main.tsx` | Compiled `.js` | Pure TypeScript | Root component init |
| `electron-env.d.ts` | - | ✅ Added | Type definitions |

---

## 🧪 Testing Checklist

```bash
# Type check only (fast)
npm run typecheck

# Full build (slow)
npm run build

# With lint
npm run lint:fix && npm run typecheck
```

---

## 🐛 If Something Breaks

### TypeScript Errors?
```bash
npm run typecheck
# Shows exact line + error
```

### Build Fails?
```bash
rm -rf dist dist-electron  # Clean
npm run build              # Rebuild
```

### Electron Won't Start?
1. ✓ Port 5173 free? (check `npm run dev` started)
2. ✓ Valid electron config? (check `electron/main.ts`)
3. ✓ Preload working? (check console errors with DevTools)

---

## 📦 Project Structure

```
src/
├── App.tsx          ← Main UI component
├── main.tsx         ← React entry point
├── electron-env.d.ts ← Type definitions
└── index.css        ← Styles

electron/
├── main.ts          ← Electron main process
└── preload.ts       ← IPC bridge
```

---

## 🚀 Production Build

```bash
npm run build
# Creates: dist/ + dist-electron/
# Ready for: electron .
```

---

## 💡 Pro Tips

- **HMR (Hot Module Replace):** Vite auto-reloads. Just save & see changes!
- **Type Hints:** All `window.api.*` methods are typed. IDE will autocomplete!
- **State Management:** Using React hooks (useState, useEffect). Simple & scalable.
- **Storage:** electron-store handles persistence. No database needed.

---

**That's it! Questions? Check MIGRATION.md for detailed info.**
